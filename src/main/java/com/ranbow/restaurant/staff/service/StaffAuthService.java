package com.ranbow.restaurant.staff.service;

import com.ranbow.restaurant.staff.model.dto.LoginRequest;
import com.ranbow.restaurant.staff.model.dto.LoginResponse;
import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.model.entity.StaffActivity;
import com.ranbow.restaurant.staff.model.entity.ActivityType;
import com.ranbow.restaurant.staff.model.entity.ActivityAction;
import com.ranbow.restaurant.staff.repository.StaffMemberRepository;
import com.ranbow.restaurant.staff.repository.StaffActivityRepository;
import com.ranbow.restaurant.staff.utils.StaffJwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Staff Authentication Service
 * Handles staff login, logout, session management, and authentication
 */
@Service
@Transactional
public class StaffAuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffAuthService.class);
    private static final String REDIS_SESSION_PREFIX = "staff:session:";
    private static final String REDIS_DEVICE_PREFIX = "staff:device:";
    private static final String REDIS_FAILED_ATTEMPTS_PREFIX = "staff:failed:";
    
    @Autowired
    private StaffMemberRepository staffMemberRepository;
    
    @Autowired
    private StaffActivityRepository staffActivityRepository;
    
    @Autowired
    private StaffJwtTokenProvider tokenProvider;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * Authenticate staff member and create session
     */
    public LoginResponse login(LoginRequest loginRequest, String ipAddress) {
        logger.info("Staff login attempt for employee: {}", loginRequest.getEmployeeNumber());
        
        try {
            // Find staff member by employee number
            Optional<StaffMember> staffOptional = staffMemberRepository
                    .findByEmployeeNumber(loginRequest.getEmployeeNumber());
            
            if (staffOptional.isEmpty()) {
                logFailedLogin(null, loginRequest.getEmployeeNumber(), 
                              "Invalid employee number", ipAddress, loginRequest.getDeviceId());
                return LoginResponse.failure("Invalid employee number or password");
            }
            
            StaffMember staff = staffOptional.get();
            
            // Check if account is active
            if (!staff.getIsActive()) {
                logFailedLogin(staff.getStaffId(), loginRequest.getEmployeeNumber(), 
                              "Account deactivated", ipAddress, loginRequest.getDeviceId());
                return LoginResponse.failure("Account is deactivated. Contact administrator.");
            }
            
            // Check if account is locked
            if (staff.isAccountLocked()) {
                logFailedLogin(staff.getStaffId(), loginRequest.getEmployeeNumber(), 
                              "Account locked", ipAddress, loginRequest.getDeviceId());
                return LoginResponse.accountLocked(
                        staff.getFailedLoginAttempts(), 
                        staff.getAccountLockedUntil()
                );
            }
            
            // Verify password
            if (!staff.checkPassword(loginRequest.getPassword())) {
                handleFailedLogin(staff, ipAddress, loginRequest.getDeviceId());
                return LoginResponse.failure("Invalid employee number or password");
            }
            
            // Check for concurrent session if device binding is enabled
            if (loginRequest.getDeviceId() != null && !loginRequest.getDeviceId().equals(staff.getCurrentDeviceId())) {
                if (hasActiveSession(staff.getStaffId())) {
                    logger.warn("Concurrent login attempt for staff: {} from device: {}", 
                               staff.getStaffId(), loginRequest.getDeviceId());
                    // Optionally terminate existing session or deny login
                }
            }
            
            // Generate JWT tokens
            String accessToken = tokenProvider.generateToken(staff);
            String refreshToken = tokenProvider.generateRefreshToken(staff);
            LocalDateTime expiresAt = tokenProvider.getExpirationFromToken(accessToken);
            
            // Update staff login information
            staff.recordLogin(loginRequest.getDeviceId());
            staffMemberRepository.save(staff);
            
            // Store session in Redis
            storeSession(staff.getStaffId(), accessToken, refreshToken, loginRequest.getDeviceId());
            
            // Log successful login
            logSuccessfulLogin(staff, ipAddress, loginRequest.getDeviceId());
            
            // Create response
            LoginResponse.StaffInfo staffInfo = createStaffInfo(staff);
            LoginResponse response = LoginResponse.success(accessToken, refreshToken, expiresAt, staffInfo);
            
            // Add current shift if available
            String currentShiftId = getCurrentShiftId(staff.getStaffId());
            response.setCurrentShiftId(currentShiftId);
            
            logger.info("Staff login successful for: {}", staff.getEmployeeNumber());
            return response;
            
        } catch (Exception e) {
            logger.error("Login error for employee: {}", loginRequest.getEmployeeNumber(), e);
            return LoginResponse.failure("Login failed due to system error");
        }
    }
    
    /**
     * Logout staff member and clean up session
     */
    @CacheEvict(value = "staffSessions", key = "#staffId")
    public void logout(String staffId, String deviceId, String ipAddress) {
        logger.info("Staff logout for: {}", staffId);
        
        try {
            // Clear device ID in database
            staffMemberRepository.clearDeviceId(staffId);
            
            // Remove session from Redis
            removeSession(staffId);
            removeDeviceBinding(deviceId);
            
            // Log logout activity
            StaffActivity logoutActivity = StaffActivity.createLogoutActivity(staffId, ipAddress, deviceId);
            staffActivityRepository.save(logoutActivity);
            
            logger.info("Staff logout completed for: {}", staffId);
            
        } catch (Exception e) {
            logger.error("Error during logout for staff: {}", staffId, e);
        }
    }
    
    /**
     * Refresh JWT token
     */
    public LoginResponse refreshToken(String refreshToken, String deviceId) {
        try {
            if (!tokenProvider.validateToken(refreshToken)) {
                return LoginResponse.failure("Invalid refresh token");
            }
            
            String staffId = tokenProvider.getStaffIdFromToken(refreshToken);
            
            // Validate device binding
            if (deviceId != null && !tokenProvider.validateDeviceBinding(refreshToken, deviceId)) {
                return LoginResponse.failure("Invalid device binding");
            }
            
            // Get staff member
            Optional<StaffMember> staffOptional = staffMemberRepository.findById(staffId);
            if (staffOptional.isEmpty() || !staffOptional.get().getIsActive()) {
                return LoginResponse.failure("Staff member not found or inactive");
            }
            
            StaffMember staff = staffOptional.get();
            
            // Generate new tokens
            String newAccessToken = tokenProvider.generateToken(staff);
            String newRefreshToken = tokenProvider.generateRefreshToken(staff);
            LocalDateTime expiresAt = tokenProvider.getExpirationFromToken(newAccessToken);
            
            // Update session in Redis
            storeSession(staffId, newAccessToken, newRefreshToken, deviceId);
            
            LoginResponse.StaffInfo staffInfo = createStaffInfo(staff);
            return LoginResponse.success(newAccessToken, newRefreshToken, expiresAt, staffInfo);
            
        } catch (Exception e) {
            logger.error("Error refreshing token", e);
            return LoginResponse.failure("Failed to refresh token");
        }
    }
    
    /**
     * Validate staff session
     */
    @Cacheable(value = "staffSessions", key = "#staffId")
    public boolean isValidSession(String staffId, String token, String deviceId) {
        try {
            // Validate JWT token
            if (!tokenProvider.validateToken(token)) {
                return false;
            }
            
            // Check token matches staff ID
            String tokenStaffId = tokenProvider.getStaffIdFromToken(token);
            if (!staffId.equals(tokenStaffId)) {
                return false;
            }
            
            // Validate device binding if provided
            if (deviceId != null && !tokenProvider.validateDeviceBinding(token, deviceId)) {
                return false;
            }
            
            // Check session exists in Redis
            String sessionKey = REDIS_SESSION_PREFIX + staffId;
            return redisTemplate.hasKey(sessionKey);
            
        } catch (Exception e) {
            logger.error("Error validating session for staff: {}", staffId, e);
            return false;
        }
    }
    
    /**
     * Get current staff member from token
     */
    public Optional<StaffMember> getCurrentStaff(String token) {
        try {
            if (!tokenProvider.validateToken(token)) {
                return Optional.empty();
            }
            
            String staffId = tokenProvider.getStaffIdFromToken(token);
            return staffMemberRepository.findById(staffId);
            
        } catch (Exception e) {
            logger.error("Error getting current staff from token", e);
            return Optional.empty();
        }
    }
    
    /**
     * Quick switch between staff members (for shared devices)
     */
    public LoginResponse quickSwitch(String currentToken, String targetEmployeeNumber, String deviceId, String ipAddress) {
        try {
            // Validate current session
            if (!tokenProvider.validateToken(currentToken)) {
                return LoginResponse.failure("Invalid current session");
            }
            
            String currentStaffId = tokenProvider.getStaffIdFromToken(currentToken);
            
            // Find target staff member
            Optional<StaffMember> targetStaffOptional = staffMemberRepository
                    .findByEmployeeNumber(targetEmployeeNumber);
            
            if (targetStaffOptional.isEmpty()) {
                return LoginResponse.failure("Target staff member not found");
            }
            
            StaffMember targetStaff = targetStaffOptional.get();
            
            if (!targetStaff.getIsActive()) {
                return LoginResponse.failure("Target staff account is inactive");
            }
            
            if (targetStaff.isAccountLocked()) {
                return LoginResponse.accountLocked(
                        targetStaff.getFailedLoginAttempts(),
                        targetStaff.getAccountLockedUntil()
                );
            }
            
            // Log the quick switch activity
            StaffActivity switchActivity = new StaffActivity(
                    currentStaffId, 
                    ActivityType.AUTHENTICATION, 
                    ActivityAction.OTHER,
                    "Quick switch to " + targetEmployeeNumber
            );
            switchActivity.setIpAddress(ipAddress);
            switchActivity.setDeviceId(deviceId);
            staffActivityRepository.save(switchActivity);
            
            // Create new session for target staff
            String newAccessToken = tokenProvider.generateToken(targetStaff);
            String newRefreshToken = tokenProvider.generateRefreshToken(targetStaff);
            LocalDateTime expiresAt = tokenProvider.getExpirationFromToken(newAccessToken);
            
            // Update target staff login info
            targetStaff.recordLogin(deviceId);
            staffMemberRepository.save(targetStaff);
            
            // Store new session
            storeSession(targetStaff.getStaffId(), newAccessToken, newRefreshToken, deviceId);
            
            // Remove old session
            removeSession(currentStaffId);
            
            LoginResponse.StaffInfo staffInfo = createStaffInfo(targetStaff);
            return LoginResponse.success(newAccessToken, newRefreshToken, expiresAt, staffInfo);
            
        } catch (Exception e) {
            logger.error("Error in quick switch", e);
            return LoginResponse.failure("Quick switch failed");
        }
    }
    
    /**
     * Handle failed login attempt
     */
    private void handleFailedLogin(StaffMember staff, String ipAddress, String deviceId) {
        // Increment failed attempts
        staff.recordFailedLogin();
        staffMemberRepository.save(staff);
        
        // Log failed login
        logFailedLogin(staff.getStaffId(), staff.getEmployeeNumber(), 
                      "Invalid password", ipAddress, deviceId);
        
        // Track failed attempts in Redis for additional security
        String failedAttemptsKey = REDIS_FAILED_ATTEMPTS_PREFIX + staff.getStaffId();
        redisTemplate.opsForValue().increment(failedAttemptsKey);
        redisTemplate.expire(failedAttemptsKey, 1, TimeUnit.HOURS);
    }
    
    /**
     * Log successful login activity
     */
    private void logSuccessfulLogin(StaffMember staff, String ipAddress, String deviceId) {
        StaffActivity loginActivity = StaffActivity.createLoginActivity(
                staff.getStaffId(), ipAddress, deviceId);
        staffActivityRepository.save(loginActivity);
    }
    
    /**
     * Log failed login activity
     */
    private void logFailedLogin(String staffId, String employeeNumber, String reason, String ipAddress, String deviceId) {
        StaffActivity failedActivity = StaffActivity.createErrorActivity(
                staffId != null ? staffId : "UNKNOWN",
                ActivityType.AUTHENTICATION,
                "Login failed: " + reason,
                "Failed login attempt for " + employeeNumber
        );
        failedActivity.setIpAddress(ipAddress);
        failedActivity.setDeviceId(deviceId);
        staffActivityRepository.save(failedActivity);
    }
    
    /**
     * Store session in Redis
     */
    private void storeSession(String staffId, String accessToken, String refreshToken, String deviceId) {
        String sessionKey = REDIS_SESSION_PREFIX + staffId;
        
        // Store session data
        redisTemplate.opsForHash().put(sessionKey, "accessToken", accessToken);
        redisTemplate.opsForHash().put(sessionKey, "refreshToken", refreshToken);
        redisTemplate.opsForHash().put(sessionKey, "deviceId", deviceId);
        redisTemplate.opsForHash().put(sessionKey, "lastActivity", LocalDateTime.now().toString());
        
        // Set expiration (longer than JWT to allow refresh)
        redisTemplate.expire(sessionKey, 24, TimeUnit.HOURS);
        
        // Store device binding
        if (deviceId != null) {
            String deviceKey = REDIS_DEVICE_PREFIX + deviceId;
            redisTemplate.opsForValue().set(deviceKey, staffId, 24, TimeUnit.HOURS);
        }
    }
    
    /**
     * Remove session from Redis
     */
    private void removeSession(String staffId) {
        String sessionKey = REDIS_SESSION_PREFIX + staffId;
        redisTemplate.delete(sessionKey);
    }
    
    /**
     * Remove device binding from Redis
     */
    private void removeDeviceBinding(String deviceId) {
        if (deviceId != null) {
            String deviceKey = REDIS_DEVICE_PREFIX + deviceId;
            redisTemplate.delete(deviceKey);
        }
    }
    
    /**
     * Check if staff has active session
     */
    private boolean hasActiveSession(String staffId) {
        String sessionKey = REDIS_SESSION_PREFIX + staffId;
        return redisTemplate.hasKey(sessionKey);
    }
    
    /**
     * Create staff info for response
     */
    private LoginResponse.StaffInfo createStaffInfo(StaffMember staff) {
        LoginResponse.StaffInfo staffInfo = new LoginResponse.StaffInfo(
                staff.getStaffId(),
                staff.getEmployeeNumber(),
                staff.getFullName(),
                staff.getRole(),
                staff.getPermissions()
        );
        staffInfo.setLastLoginAt(staff.getLastLoginAt());
        staffInfo.setOnDuty(isStaffOnDuty(staff.getStaffId()));
        return staffInfo;
    }
    
    /**
     * Check if staff is currently on duty
     */
    private boolean isStaffOnDuty(String staffId) {
        // This would integrate with WorkShiftService
        // For now, return false as placeholder
        return false;
    }
    
    /**
     * Get current shift ID for staff
     */
    private String getCurrentShiftId(String staffId) {
        // This would integrate with WorkShiftService
        // For now, return null as placeholder
        return null;
    }
    
    /**
     * Unlock staff account (admin function)
     */
    public boolean unlockAccount(String staffId) {
        try {
            int updated = staffMemberRepository.unlockAccount(staffId);
            if (updated > 0) {
                // Clear failed attempts from Redis
                String failedAttemptsKey = REDIS_FAILED_ATTEMPTS_PREFIX + staffId;
                redisTemplate.delete(failedAttemptsKey);
                
                logger.info("Account unlocked for staff: {}", staffId);
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.error("Error unlocking account for staff: {}", staffId, e);
            return false;
        }
    }
    
    /**
     * Change staff password
     */
    public boolean changePassword(String staffId, String currentPassword, String newPassword) {
        try {
            Optional<StaffMember> staffOptional = staffMemberRepository.findById(staffId);
            if (staffOptional.isEmpty()) {
                return false;
            }
            
            StaffMember staff = staffOptional.get();
            
            // Verify current password
            if (!staff.checkPassword(currentPassword)) {
                return false;
            }
            
            // Set new password
            staff.setPassword(newPassword);
            staffMemberRepository.save(staff);
            
            // Log password change activity
            StaffActivity passwordActivity = new StaffActivity(
                    staffId,
                    ActivityType.AUTHENTICATION,
                    ActivityAction.PASSWORD_CHANGE,
                    "Password changed successfully"
            );
            staffActivityRepository.save(passwordActivity);
            
            logger.info("Password changed for staff: {}", staffId);
            return true;
            
        } catch (Exception e) {
            logger.error("Error changing password for staff: {}", staffId, e);
            return false;
        }
    }
}