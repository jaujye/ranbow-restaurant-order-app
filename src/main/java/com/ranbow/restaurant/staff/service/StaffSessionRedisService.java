package com.ranbow.restaurant.staff.service;

import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.model.vo.StaffSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Staff Session Redis Service
 * 
 * Manages staff authentication sessions using Redis for high performance
 * and scalability. Provides session lifecycle management, device binding,
 * failed attempt tracking, and security features.
 * 
 * Features:
 * - Session storage with configurable TTL
 * - Device binding and management
 * - Failed login attempt tracking
 * - Account lockout management
 * - Session cleanup and maintenance
 * - Multi-device session support
 * - Session activity tracking
 * 
 * Redis Key Patterns:
 * - staff:session:{staffId} - Active session data
 * - staff:device:{deviceId} - Device to staff mapping
 * - staff:failed:{employeeNumber} - Failed login attempts
 * - staff:locked:{staffId} - Account lockout information
 * - staff:activity:{staffId} - Last activity tracking
 */
@Service
public class StaffSessionRedisService {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffSessionRedisService.class);
    
    @Autowired
    @Qualifier("staffSessionTemplate")
    private RedisTemplate<String, StaffSession> sessionTemplate;
    
    @Autowired
    @Qualifier("realtimeTemplate")
    private RedisTemplate<String, String> realtimeTemplate;
    
    @Autowired
    @Qualifier("staffDataTemplate")
    private RedisTemplate<String, Object> staffDataTemplate;
    
    // Cache TTL configurations
    private static final long SESSION_TTL_HOURS = 8; // 8 hours default session
    private static final long DEVICE_BINDING_TTL_DAYS = 30; // 30 days device binding
    private static final long FAILED_ATTEMPTS_TTL_MINUTES = 15; // 15 minutes failed attempts tracking
    private static final long LOCKOUT_DURATION_MINUTES = 15; // 15 minutes account lockout
    private static final int MAX_FAILED_ATTEMPTS = 5; // Maximum failed attempts before lockout
    private static final int MAX_CONCURRENT_SESSIONS = 3; // Maximum concurrent sessions per staff
    
    // Redis key patterns
    private static final String SESSION_KEY = "staff:session:%s";
    private static final String DEVICE_KEY = "staff:device:%s";
    private static final String FAILED_KEY = "staff:failed:%s";
    private static final String LOCKOUT_KEY = "staff:locked:%s";
    private static final String ACTIVITY_KEY = "staff:activity:%s";
    private static final String SESSIONS_SET_KEY = "staff:sessions:%s";
    private static final String ACTIVE_STAFF_SET = "staff:active";
    
    // Session Management Methods
    
    /**
     * Save or update staff session
     */
    public void saveSession(String staffId, StaffSession session) {
        try {
            String sessionKey = String.format(SESSION_KEY, staffId);
            
            // Set session creation time if new
            if (session.getCreatedAt() == null) {
                session.setCreatedAt(LocalDateTime.now());
            }
            
            // Update last activity
            session.setLastActivity(LocalDateTime.now());
            
            // Validate session data
            if (!isValidSession(session)) {
                throw new IllegalArgumentException("Invalid session data");
            }
            
            // Handle concurrent session limits
            manageConcurrentSessions(staffId, session);
            
            // Save session with TTL
            sessionTemplate.opsForValue().set(sessionKey, session, SESSION_TTL_HOURS, TimeUnit.HOURS);
            
            // Track active sessions
            String sessionsSetKey = String.format(SESSIONS_SET_KEY, staffId);
            realtimeTemplate.opsForSet().add(sessionsSetKey, session.getSessionId());
            realtimeTemplate.expire(sessionsSetKey, SESSION_TTL_HOURS, TimeUnit.HOURS);
            
            // Add to active staff set
            realtimeTemplate.opsForSet().add(ACTIVE_STAFF_SET, staffId);
            
            // Update activity tracking
            updateLastActivity(staffId);
            
            logger.info("Saved session for staff {}: {}", staffId, session.getSessionId());
            
        } catch (Exception e) {
            logger.error("Error saving session for staff {}: ", staffId, e);
            throw new RuntimeException("Failed to save staff session", e);
        }
    }
    
    /**
     * Get staff session
     */
    public StaffSession getSession(String staffId) {
        try {
            String sessionKey = String.format(SESSION_KEY, staffId);
            StaffSession session = sessionTemplate.opsForValue().get(sessionKey);
            
            if (session != null) {
                // Update last activity
                session.setLastActivity(LocalDateTime.now());
                sessionTemplate.opsForValue().set(sessionKey, session, SESSION_TTL_HOURS, TimeUnit.HOURS);
                
                logger.debug("Retrieved session for staff {}: {}", staffId, session.getSessionId());
            } else {
                logger.debug("No session found for staff {}", staffId);
            }
            
            return session;
            
        } catch (Exception e) {
            logger.error("Error retrieving session for staff {}: ", staffId, e);
            return null;
        }
    }
    
    /**
     * Delete staff session
     */
    public void deleteSession(String staffId) {
        try {
            String sessionKey = String.format(SESSION_KEY, staffId);
            StaffSession session = sessionTemplate.opsForValue().get(sessionKey);
            
            if (session != null) {
                // Remove from sessions set
                String sessionsSetKey = String.format(SESSIONS_SET_KEY, staffId);
                realtimeTemplate.opsForSet().remove(sessionsSetKey, session.getSessionId());
                
                // Unbind device if applicable
                if (session.getDeviceId() != null) {
                    unbindDevice(session.getDeviceId());
                }
                
                logger.info("Deleted session for staff {}: {}", staffId, session.getSessionId());
            }
            
            // Delete session
            sessionTemplate.delete(sessionKey);
            
            // Check if staff has other active sessions
            String sessionsSetKey = String.format(SESSIONS_SET_KEY, staffId);
            Long sessionCount = realtimeTemplate.opsForSet().size(sessionsSetKey);
            
            if (sessionCount == null || sessionCount == 0) {
                // Remove from active staff set if no more sessions
                realtimeTemplate.opsForSet().remove(ACTIVE_STAFF_SET, staffId);
                
                // Clean up sessions set
                realtimeTemplate.delete(sessionsSetKey);
            }
            
            logger.info("Session deleted for staff {}", staffId);
            
        } catch (Exception e) {
            logger.error("Error deleting session for staff {}: ", staffId, e);
        }
    }
    
    /**
     * Update last activity timestamp
     */
    public void updateLastActivity(String staffId) {
        try {
            String activityKey = String.format(ACTIVITY_KEY, staffId);
            String timestamp = LocalDateTime.now().toString();
            
            realtimeTemplate.opsForValue().set(activityKey, timestamp, SESSION_TTL_HOURS, TimeUnit.HOURS);
            
            // Also update session if it exists
            StaffSession session = getSession(staffId);
            if (session != null) {
                session.setLastActivity(LocalDateTime.now());
                String sessionKey = String.format(SESSION_KEY, staffId);
                sessionTemplate.opsForValue().set(sessionKey, session, SESSION_TTL_HOURS, TimeUnit.HOURS);
            }
            
            logger.debug("Updated last activity for staff {}", staffId);
            
        } catch (Exception e) {
            logger.error("Error updating last activity for staff {}: ", staffId, e);
        }
    }
    
    // Device Management Methods
    
    /**
     * Bind device to staff member
     */
    public void bindDevice(String deviceId, String staffId) {
        try {
            String deviceKey = String.format(DEVICE_KEY, deviceId);
            
            // Check for existing binding
            String existingStaff = realtimeTemplate.opsForValue().get(deviceKey);
            if (existingStaff != null && !existingStaff.equals(staffId)) {
                logger.warn("Device {} was bound to staff {}, rebinding to {}", 
                           deviceId, existingStaff, staffId);
            }
            
            // Bind device
            realtimeTemplate.opsForValue().set(deviceKey, staffId, DEVICE_BINDING_TTL_DAYS, TimeUnit.DAYS);
            
            logger.info("Bound device {} to staff {}", deviceId, staffId);
            
        } catch (Exception e) {
            logger.error("Error binding device {} to staff {}: ", deviceId, staffId, e);
        }
    }
    
    /**
     * Get staff ID by device ID
     */
    public String getStaffByDevice(String deviceId) {
        try {
            String deviceKey = String.format(DEVICE_KEY, deviceId);
            String staffId = realtimeTemplate.opsForValue().get(deviceKey);
            
            if (staffId != null) {
                logger.debug("Device {} is bound to staff {}", deviceId, staffId);
            } else {
                logger.debug("Device {} is not bound to any staff", deviceId);
            }
            
            return staffId;
            
        } catch (Exception e) {
            logger.error("Error retrieving staff for device {}: ", deviceId, e);
            return null;
        }
    }
    
    /**
     * Unbind device
     */
    public void unbindDevice(String deviceId) {
        try {
            String deviceKey = String.format(DEVICE_KEY, deviceId);
            String staffId = realtimeTemplate.opsForValue().get(deviceKey);
            
            if (staffId != null) {
                realtimeTemplate.delete(deviceKey);
                logger.info("Unbound device {} from staff {}", deviceId, staffId);
            } else {
                logger.debug("Device {} was not bound", deviceId);
            }
            
        } catch (Exception e) {
            logger.error("Error unbinding device {}: ", deviceId, e);
        }
    }
    
    // Failed Attempts and Lockout Management
    
    /**
     * Record failed login attempt
     */
    public void recordFailedAttempt(String employeeNumber) {
        try {
            String failedKey = String.format(FAILED_KEY, employeeNumber);
            
            // Increment failed attempts counter
            Long attempts = realtimeTemplate.opsForValue().increment(failedKey);
            if (attempts == null) attempts = 0L;
            
            // Set TTL on first attempt
            if (attempts == 1) {
                realtimeTemplate.expire(failedKey, FAILED_ATTEMPTS_TTL_MINUTES, TimeUnit.MINUTES);
            }
            
            logger.warn("Failed login attempt #{} for employee {}", attempts, employeeNumber);
            
            // Lock account if maximum attempts reached
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                lockAccountByEmployee(employeeNumber, Duration.ofMinutes(LOCKOUT_DURATION_MINUTES));
                logger.warn("Account locked for employee {} after {} failed attempts", 
                           employeeNumber, attempts);
            }
            
        } catch (Exception e) {
            logger.error("Error recording failed attempt for employee {}: ", employeeNumber, e);
        }
    }
    
    /**
     * Get failed attempts count
     */
    public int getFailedAttempts(String employeeNumber) {
        try {
            String failedKey = String.format(FAILED_KEY, employeeNumber);
            String attemptsStr = realtimeTemplate.opsForValue().get(failedKey);
            
            int attempts = attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;
            logger.debug("Failed attempts for employee {}: {}", employeeNumber, attempts);
            
            return attempts;
            
        } catch (Exception e) {
            logger.error("Error getting failed attempts for employee {}: ", employeeNumber, e);
            return 0;
        }
    }
    
    /**
     * Clear failed attempts
     */
    public void clearFailedAttempts(String employeeNumber) {
        try {
            String failedKey = String.format(FAILED_KEY, employeeNumber);
            realtimeTemplate.delete(failedKey);
            
            logger.info("Cleared failed attempts for employee {}", employeeNumber);
            
        } catch (Exception e) {
            logger.error("Error clearing failed attempts for employee {}: ", employeeNumber, e);
        }
    }
    
    /**
     * Lock account for specified duration
     */
    public void lockAccount(String staffId, Duration lockDuration) {
        try {
            String lockoutKey = String.format(LOCKOUT_KEY, staffId);
            LocalDateTime unlockTime = LocalDateTime.now().plus(lockDuration);
            
            Map<String, Object> lockoutInfo = new HashMap<>();
            lockoutInfo.put("staffId", staffId);
            lockoutInfo.put("lockedAt", LocalDateTime.now().toString());
            lockoutInfo.put("unlockAt", unlockTime.toString());
            lockoutInfo.put("reason", "Excessive failed login attempts");
            
            staffDataTemplate.opsForValue().set(lockoutKey, lockoutInfo, 
                                               lockDuration.toMinutes(), TimeUnit.MINUTES);
            
            // Terminate all existing sessions for this staff
            deleteSession(staffId);
            
            logger.warn("Locked account for staff {} until {}", staffId, unlockTime);
            
        } catch (Exception e) {
            logger.error("Error locking account for staff {}: ", staffId, e);
        }
    }
    
    /**
     * Lock account by employee number
     */
    public void lockAccountByEmployee(String employeeNumber, Duration lockDuration) {
        try {
            // This would require looking up staffId by employeeNumber
            // For now, using employeeNumber as key
            String lockoutKey = String.format(LOCKOUT_KEY, employeeNumber);
            LocalDateTime unlockTime = LocalDateTime.now().plus(lockDuration);
            
            Map<String, Object> lockoutInfo = new HashMap<>();
            lockoutInfo.put("employeeNumber", employeeNumber);
            lockoutInfo.put("lockedAt", LocalDateTime.now().toString());
            lockoutInfo.put("unlockAt", unlockTime.toString());
            lockoutInfo.put("reason", "Excessive failed login attempts");
            
            staffDataTemplate.opsForValue().set(lockoutKey, lockoutInfo, 
                                               lockDuration.toMinutes(), TimeUnit.MINUTES);
            
            logger.warn("Locked account for employee {} until {}", employeeNumber, unlockTime);
            
        } catch (Exception e) {
            logger.error("Error locking account for employee {}: ", employeeNumber, e);
        }
    }
    
    /**
     * Check if account is locked
     */
    public boolean isAccountLocked(String identifier) {
        try {
            String lockoutKey = String.format(LOCKOUT_KEY, identifier);
            Object lockoutInfo = staffDataTemplate.opsForValue().get(lockoutKey);
            
            boolean locked = lockoutInfo != null;
            if (locked) {
                logger.debug("Account {} is currently locked", identifier);
            }
            
            return locked;
            
        } catch (Exception e) {
            logger.error("Error checking lockout status for {}: ", identifier, e);
            return false; // Default to not locked if error occurs
        }
    }
    
    /**
     * Unlock account
     */
    public void unlockAccount(String identifier) {
        try {
            String lockoutKey = String.format(LOCKOUT_KEY, identifier);
            String failedKey = String.format(FAILED_KEY, identifier);
            
            // Remove lockout
            staffDataTemplate.delete(lockoutKey);
            
            // Clear failed attempts
            realtimeTemplate.delete(failedKey);
            
            logger.info("Unlocked account for {}", identifier);
            
        } catch (Exception e) {
            logger.error("Error unlocking account for {}: ", identifier, e);
        }
    }
    
    // Utility and Maintenance Methods
    
    /**
     * Get all active staff IDs
     */
    public Set<String> getActiveStaffIds() {
        try {
            Set<String> activeStaff = realtimeTemplate.opsForSet().members(ACTIVE_STAFF_SET);
            return activeStaff != null ? activeStaff : new HashSet<>();
            
        } catch (Exception e) {
            logger.error("Error getting active staff IDs: ", e);
            return new HashSet<>();
        }
    }
    
    /**
     * Get session count for staff
     */
    public long getSessionCount(String staffId) {
        try {
            String sessionsSetKey = String.format(SESSIONS_SET_KEY, staffId);
            Long count = realtimeTemplate.opsForSet().size(sessionsSetKey);
            return count != null ? count : 0;
            
        } catch (Exception e) {
            logger.error("Error getting session count for staff {}: ", staffId, e);
            return 0;
        }
    }
    
    /**
     * Cleanup expired sessions and related data
     */
    public void cleanupExpiredSessions() {
        try {
            logger.info("Starting expired session cleanup");
            
            Set<String> activeStaff = getActiveStaffIds();
            int cleanedCount = 0;
            
            for (String staffId : activeStaff) {
                StaffSession session = getSession(staffId);
                if (session == null) {
                    // Session expired but staff still in active set
                    realtimeTemplate.opsForSet().remove(ACTIVE_STAFF_SET, staffId);
                    
                    // Clean up related data
                    String sessionsSetKey = String.format(SESSIONS_SET_KEY, staffId);
                    String activityKey = String.format(ACTIVITY_KEY, staffId);
                    
                    realtimeTemplate.delete(sessionsSetKey);
                    realtimeTemplate.delete(activityKey);
                    
                    cleanedCount++;
                }
            }
            
            logger.info("Cleaned up {} expired sessions", cleanedCount);
            
        } catch (Exception e) {
            logger.error("Error during session cleanup: ", e);
        }
    }
    
    /**
     * Get system statistics
     */
    public Map<String, Object> getSystemStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            stats.put("activeStaffCount", getActiveStaffIds().size());
            stats.put("timestamp", LocalDateTime.now());
            
            // Count sessions by staff
            Map<String, Long> sessionCounts = new HashMap<>();
            for (String staffId : getActiveStaffIds()) {
                sessionCounts.put(staffId, getSessionCount(staffId));
            }
            stats.put("sessionCounts", sessionCounts);
            
        } catch (Exception e) {
            logger.error("Error getting system statistics: ", e);
            stats.put("error", e.getMessage());
        }
        
        return stats;
    }
    
    // Private Helper Methods
    
    private boolean isValidSession(StaffSession session) {
        return session != null && 
               session.getStaffId() != null && 
               session.getSessionId() != null &&
               session.getEmployeeNumber() != null;
    }
    
    private void manageConcurrentSessions(String staffId, StaffSession newSession) {
        try {
            String sessionsSetKey = String.format(SESSIONS_SET_KEY, staffId);
            Long sessionCount = realtimeTemplate.opsForSet().size(sessionsSetKey);
            
            if (sessionCount != null && sessionCount >= MAX_CONCURRENT_SESSIONS) {
                logger.warn("Staff {} has reached maximum concurrent sessions ({})", 
                           staffId, MAX_CONCURRENT_SESSIONS);
                
                // Remove oldest session (this is simplified - in reality you'd track session timestamps)
                Set<String> sessions = realtimeTemplate.opsForSet().members(sessionsSetKey);
                if (sessions != null && !sessions.isEmpty()) {
                    String oldestSession = sessions.iterator().next();
                    realtimeTemplate.opsForSet().remove(sessionsSetKey, oldestSession);
                    logger.info("Removed oldest session {} for staff {}", oldestSession, staffId);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error managing concurrent sessions for staff {}: ", staffId, e);
        }
    }
}