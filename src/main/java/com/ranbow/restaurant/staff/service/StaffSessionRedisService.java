package com.ranbow.restaurant.staff.service;

import com.ranbow.restaurant.staff.model.vo.StaffSession;
import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Redis-based Staff Session Management Service
 * 
 * Handles caching of staff sessions, failed login attempts, device bindings,
 * and quick switch data using Redis for high-performance session management.
 * 
 * Cache Patterns:
 * - staff:session:{staffId} -> StaffSession (TTL: 8 hours)
 * - staff:device:{deviceId} -> StaffId (TTL: 30 days)
 * - staff:failed:{employeeNumber} -> FailedAttempts (TTL: 15 minutes)
 * - staff:quick:{staffId} -> List<RecentStaff> (TTL: 24 hours)
 * - staff:lockout:{staffId} -> LockoutInfo (TTL: account lockout duration)
 * - staff:active:sessions -> Set<StaffId> (active staff tracking)
 * 
 * Features:
 * - Session storage and retrieval
 * - Failed login attempt tracking
 * - Account lockout management
 * - Device binding validation
 * - Quick switch history
 * - Active session monitoring
 * - Automatic cleanup of expired data
 */
@Service
public class StaffSessionRedisService {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffSessionRedisService.class);
    
    // Cache key patterns
    private static final String SESSION_KEY_PREFIX = "staff:session:";
    private static final String DEVICE_KEY_PREFIX = "staff:device:";
    private static final String FAILED_ATTEMPTS_KEY_PREFIX = "staff:failed:";
    private static final String QUICK_SWITCH_KEY_PREFIX = "staff:quick:";
    private static final String LOCKOUT_KEY_PREFIX = "staff:lockout:";
    private static final String ACTIVE_SESSIONS_KEY = "staff:active:sessions";
    private static final String SESSION_TOKEN_KEY_PREFIX = "staff:token:";
    
    // Cache TTL settings
    private static final long SESSION_TTL_HOURS = 8;
    private static final long DEVICE_TTL_DAYS = 30;
    private static final long FAILED_ATTEMPTS_TTL_MINUTES = 15;
    private static final long QUICK_SWITCH_TTL_HOURS = 24;
    private static final long LOCKOUT_TTL_MINUTES = 15;
    private static final long TOKEN_BLACKLIST_TTL_HOURS = 8;
    
    @Autowired
    @Qualifier("staffStringRedisTemplate")
    private RedisTemplate<String, String> redisTemplate;
    
    private final ObjectMapper objectMapper;
    
    public StaffSessionRedisService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }
    
    // =====================================
    // Session Management
    // =====================================
    
    /**
     * Store staff session in Redis cache
     */
    public void storeSession(StaffSession session) {
        try {
            String key = SESSION_KEY_PREFIX + session.getStaffId();
            String sessionJson = objectMapper.writeValueAsString(session);
            
            redisTemplate.opsForValue().set(key, sessionJson, Duration.ofHours(SESSION_TTL_HOURS));
            
            // Add to active sessions set
            redisTemplate.opsForSet().add(ACTIVE_SESSIONS_KEY, session.getStaffId());
            
            logger.debug("Stored session for staff: {} ({})", session.getStaffId(), session.getDeviceId());
            
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize session for staff: {}, Error: {}", session.getStaffId(), e.getMessage());
        }
    }
    
    /**
     * Retrieve staff session from Redis cache
     */
    public StaffSession getSession(String staffId) {
        try {
            String key = SESSION_KEY_PREFIX + staffId;
            String sessionJson = redisTemplate.opsForValue().get(key);
            
            if (sessionJson != null) {
                StaffSession session = objectMapper.readValue(sessionJson, StaffSession.class);
                
                // Update last accessed time
                session.setLastAccessedAt(LocalDateTime.now());
                storeSession(session); // Update cache
                
                logger.debug("Retrieved session for staff: {}", staffId);
                return session;
            }
            
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize session for staff: {}, Error: {}", staffId, e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Remove staff session from cache
     */
    public void removeSession(String staffId) {
        String key = SESSION_KEY_PREFIX + staffId;
        redisTemplate.delete(key);
        
        // Remove from active sessions set
        redisTemplate.opsForSet().remove(ACTIVE_SESSIONS_KEY, staffId);
        
        logger.debug("Removed session for staff: {}", staffId);
    }
    
    /**
     * Get all active sessions
     */
    public Set<String> getActiveSessions() {
        return redisTemplate.opsForSet().members(ACTIVE_SESSIONS_KEY);
    }
    
    /**
     * Check if staff has active session
     */
    public boolean hasActiveSession(String staffId) {
        return redisTemplate.opsForSet().isMember(ACTIVE_SESSIONS_KEY, staffId);
    }
    
    // =====================================
    // Device Management
    // =====================================
    
    /**
     * Bind device to staff member
     */
    public void bindDevice(String deviceId, String staffId) {
        String key = DEVICE_KEY_PREFIX + deviceId;
        redisTemplate.opsForValue().set(key, staffId, Duration.ofDays(DEVICE_TTL_DAYS));
        
        logger.debug("Bound device {} to staff: {}", deviceId, staffId);
    }
    
    /**
     * Get staff ID for device
     */
    public String getStaffIdForDevice(String deviceId) {
        String key = DEVICE_KEY_PREFIX + deviceId;
        return redisTemplate.opsForValue().get(key);
    }
    
    /**
     * Check if device is bound to staff
     */
    public boolean isDeviceBoundToStaff(String deviceId, String staffId) {
        String boundStaffId = getStaffIdForDevice(deviceId);
        return staffId.equals(boundStaffId);
    }
    
    /**
     * Remove device binding
     */
    public void unbindDevice(String deviceId) {
        String key = DEVICE_KEY_PREFIX + deviceId;
        redisTemplate.delete(key);
        
        logger.debug("Unbound device: {}", deviceId);
    }
    
    // =====================================
    // Failed Login Attempts & Account Lockout
    // =====================================
    
    /**
     * Record failed login attempt
     */
    public int recordFailedLogin(String employeeNumber) {
        String key = FAILED_ATTEMPTS_KEY_PREFIX + employeeNumber;
        
        // Increment failed attempts count
        Long attempts = redisTemplate.opsForValue().increment(key);
        
        // Set TTL on first attempt
        if (attempts == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(FAILED_ATTEMPTS_TTL_MINUTES));
        }
        
        logger.debug("Recorded failed login for employee: {}, Attempts: {}", employeeNumber, attempts);
        
        return attempts.intValue();
    }
    
    /**
     * Get failed login attempts count
     */
    public int getFailedLoginAttempts(String employeeNumber) {
        String key = FAILED_ATTEMPTS_KEY_PREFIX + employeeNumber;
        String attemptsStr = redisTemplate.opsForValue().get(key);
        
        return attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;
    }
    
    /**
     * Clear failed login attempts (after successful login)
     */
    public void clearFailedLoginAttempts(String employeeNumber) {
        String key = FAILED_ATTEMPTS_KEY_PREFIX + employeeNumber;
        redisTemplate.delete(key);
        
        logger.debug("Cleared failed login attempts for employee: {}", employeeNumber);
    }
    
    /**
     * Lock staff account temporarily
     */
    public void lockAccount(String staffId, int lockoutMinutes) {
        String key = LOCKOUT_KEY_PREFIX + staffId;
        AccountLockoutInfo lockoutInfo = new AccountLockoutInfo(
            staffId, 
            LocalDateTime.now(),
            LocalDateTime.now().plusMinutes(lockoutMinutes),
            lockoutMinutes
        );
        
        try {
            String lockoutJson = objectMapper.writeValueAsString(lockoutInfo);
            redisTemplate.opsForValue().set(key, lockoutJson, Duration.ofMinutes(lockoutMinutes));
            
            logger.warn("Locked account for staff: {} for {} minutes", staffId, lockoutMinutes);
            
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize lockout info for staff: {}, Error: {}", staffId, e.getMessage());
        }
    }
    
    /**
     * Check if account is locked
     */
    public boolean isAccountLocked(String staffId) {
        String key = LOCKOUT_KEY_PREFIX + staffId;
        return redisTemplate.hasKey(key);
    }
    
    /**
     * Get account lockout information
     */
    public AccountLockoutInfo getAccountLockoutInfo(String staffId) {
        try {
            String key = LOCKOUT_KEY_PREFIX + staffId;
            String lockoutJson = redisTemplate.opsForValue().get(key);
            
            if (lockoutJson != null) {
                return objectMapper.readValue(lockoutJson, AccountLockoutInfo.class);
            }
            
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize lockout info for staff: {}, Error: {}", staffId, e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Unlock account manually
     */
    public void unlockAccount(String staffId) {
        String key = LOCKOUT_KEY_PREFIX + staffId;
        redisTemplate.delete(key);
        
        logger.info("Manually unlocked account for staff: {}", staffId);
    }
    
    // =====================================
    // Quick Switch History
    // =====================================
    
    /**
     * Store recent staff for quick switch
     */
    public void addQuickSwitchHistory(String currentStaffId, StaffMember targetStaff) {
        try {
            String key = QUICK_SWITCH_KEY_PREFIX + currentStaffId;
            
            // Get existing history
            List<QuickSwitchStaffInfo> history = getQuickSwitchHistory(currentStaffId);
            
            // Create new entry
            QuickSwitchStaffInfo newEntry = new QuickSwitchStaffInfo(
                targetStaff.getStaffId(),
                targetStaff.getEmployeeNumber(),
                targetStaff.getName(),
                targetStaff.getRole(),
                targetStaff.getDepartment(),
                LocalDateTime.now()
            );
            
            // Remove if already exists (to update timestamp)
            history.removeIf(item -> item.getStaffId().equals(targetStaff.getStaffId()));
            
            // Add to front of list
            history.add(0, newEntry);
            
            // Keep only last 10 entries
            if (history.size() > 10) {
                history = history.subList(0, 10);
            }
            
            // Store updated history
            String historyJson = objectMapper.writeValueAsString(history);
            redisTemplate.opsForValue().set(key, historyJson, Duration.ofHours(QUICK_SWITCH_TTL_HOURS));
            
            logger.debug("Added quick switch history for staff: {} -> {}", currentStaffId, targetStaff.getStaffId());
            
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize quick switch history for staff: {}, Error: {}", currentStaffId, e.getMessage());
        }
    }
    
    /**
     * Get quick switch history for staff
     */
    @SuppressWarnings("unchecked")
    public List<QuickSwitchStaffInfo> getQuickSwitchHistory(String staffId) {
        try {
            String key = QUICK_SWITCH_KEY_PREFIX + staffId;
            String historyJson = redisTemplate.opsForValue().get(key);
            
            if (historyJson != null) {
                return objectMapper.readValue(historyJson, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, QuickSwitchStaffInfo.class));
            }
            
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize quick switch history for staff: {}, Error: {}", staffId, e.getMessage());
        }
        
        return new java.util.ArrayList<>();
    }
    
    // =====================================
    // Token Blacklisting (for logout)
    // =====================================
    
    /**
     * Blacklist JWT token (for secure logout)
     */
    public void blacklistToken(String tokenHash) {
        String key = SESSION_TOKEN_KEY_PREFIX + tokenHash;
        redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofHours(TOKEN_BLACKLIST_TTL_HOURS));
        
        logger.debug("Blacklisted token hash: {}", tokenHash.substring(0, 8) + "...");
    }
    
    /**
     * Check if token is blacklisted
     */
    public boolean isTokenBlacklisted(String tokenHash) {
        String key = SESSION_TOKEN_KEY_PREFIX + tokenHash;
        return redisTemplate.hasKey(key);
    }
    
    // =====================================
    // Cache Statistics and Monitoring
    // =====================================
    
    /**
     * Get cache statistics
     */
    public CacheStatistics getCacheStatistics() {
        CacheStatistics stats = new CacheStatistics();
        
        // Count active sessions
        stats.setActiveSessions(redisTemplate.opsForSet().size(ACTIVE_SESSIONS_KEY));
        
        // Count different key types
        Set<String> sessionKeys = redisTemplate.keys(SESSION_KEY_PREFIX + "*");
        stats.setTotalSessions(sessionKeys != null ? sessionKeys.size() : 0);
        
        Set<String> deviceKeys = redisTemplate.keys(DEVICE_KEY_PREFIX + "*");
        stats.setBoundDevices(deviceKeys != null ? deviceKeys.size() : 0);
        
        Set<String> failedAttemptKeys = redisTemplate.keys(FAILED_ATTEMPTS_KEY_PREFIX + "*");
        stats.setFailedLoginTracking(failedAttemptKeys != null ? failedAttemptKeys.size() : 0);
        
        Set<String> lockoutKeys = redisTemplate.keys(LOCKOUT_KEY_PREFIX + "*");
        stats.setLockedAccounts(lockoutKeys != null ? lockoutKeys.size() : 0);
        
        Set<String> blacklistedTokens = redisTemplate.keys(SESSION_TOKEN_KEY_PREFIX + "*");
        stats.setBlacklistedTokens(blacklistedTokens != null ? blacklistedTokens.size() : 0);
        
        return stats;
    }
    
    /**
     * Clean up expired cache entries
     */
    public int cleanupExpiredEntries() {
        int cleanedCount = 0;
        
        // Clean up expired sessions from active set
        Set<String> activeSessions = getActiveSessions();
        if (activeSessions != null) {
            for (String staffId : activeSessions) {
                if (getSession(staffId) == null) {
                    redisTemplate.opsForSet().remove(ACTIVE_SESSIONS_KEY, staffId);
                    cleanedCount++;
                }
            }
        }
        
        logger.info("Cleaned up {} expired cache entries", cleanedCount);
        return cleanedCount;
    }
    
    // =====================================
    // Data Classes
    // =====================================
    
    /**
     * Account Lockout Information
     */
    public static class AccountLockoutInfo {
        private String staffId;
        private LocalDateTime lockedAt;
        private LocalDateTime lockedUntil;
        private int lockoutMinutes;
        
        // Constructors
        public AccountLockoutInfo() {}
        
        public AccountLockoutInfo(String staffId, LocalDateTime lockedAt, LocalDateTime lockedUntil, int lockoutMinutes) {
            this.staffId = staffId;
            this.lockedAt = lockedAt;
            this.lockedUntil = lockedUntil;
            this.lockoutMinutes = lockoutMinutes;
        }
        
        // Getters and setters
        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
        
        public LocalDateTime getLockedAt() { return lockedAt; }
        public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }
        
        public LocalDateTime getLockedUntil() { return lockedUntil; }
        public void setLockedUntil(LocalDateTime lockedUntil) { this.lockedUntil = lockedUntil; }
        
        public int getLockoutMinutes() { return lockoutMinutes; }
        public void setLockoutMinutes(int lockoutMinutes) { this.lockoutMinutes = lockoutMinutes; }
    }
    
    /**
     * Quick Switch Staff Information
     */
    public static class QuickSwitchStaffInfo {
        private String staffId;
        private String employeeNumber;
        private String name;
        private String role;
        private String department;
        private LocalDateTime lastSwitchedAt;
        
        // Constructors
        public QuickSwitchStaffInfo() {}
        
        public QuickSwitchStaffInfo(String staffId, String employeeNumber, String name, 
                                   String role, String department, LocalDateTime lastSwitchedAt) {
            this.staffId = staffId;
            this.employeeNumber = employeeNumber;
            this.name = name;
            this.role = role;
            this.department = department;
            this.lastSwitchedAt = lastSwitchedAt;
        }
        
        // Getters and setters
        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
        
        public String getEmployeeNumber() { return employeeNumber; }
        public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        public LocalDateTime getLastSwitchedAt() { return lastSwitchedAt; }
        public void setLastSwitchedAt(LocalDateTime lastSwitchedAt) { this.lastSwitchedAt = lastSwitchedAt; }
    }
    
    /**
     * Cache Statistics
     */
    public static class CacheStatistics {
        private Long activeSessions = 0L;
        private int totalSessions = 0;
        private int boundDevices = 0;
        private int failedLoginTracking = 0;
        private int lockedAccounts = 0;
        private int blacklistedTokens = 0;
        
        // Getters and setters
        public Long getActiveSessions() { return activeSessions; }
        public void setActiveSessions(Long activeSessions) { this.activeSessions = activeSessions; }
        
        public int getTotalSessions() { return totalSessions; }
        public void setTotalSessions(int totalSessions) { this.totalSessions = totalSessions; }
        
        public int getBoundDevices() { return boundDevices; }
        public void setBoundDevices(int boundDevices) { this.boundDevices = boundDevices; }
        
        public int getFailedLoginTracking() { return failedLoginTracking; }
        public void setFailedLoginTracking(int failedLoginTracking) { this.failedLoginTracking = failedLoginTracking; }
        
        public int getLockedAccounts() { return lockedAccounts; }
        public void setLockedAccounts(int lockedAccounts) { this.lockedAccounts = lockedAccounts; }
        
        public int getBlacklistedTokens() { return blacklistedTokens; }
        public void setBlacklistedTokens(int blacklistedTokens) { this.blacklistedTokens = blacklistedTokens; }
    }
}