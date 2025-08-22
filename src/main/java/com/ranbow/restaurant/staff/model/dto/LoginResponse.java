package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.staff.model.entity.StaffRole;
import com.ranbow.restaurant.staff.model.entity.StaffPermission;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Login Response DTO
 * Data Transfer Object for staff authentication responses
 */
public class LoginResponse {
    
    private boolean success;
    private String message;
    private String token;
    private String refreshToken;
    private LocalDateTime expiresAt;
    private StaffInfo staffInfo;
    private String currentShiftId;
    private int failedAttempts;
    private LocalDateTime lockedUntil;
    
    // Constructors
    public LoginResponse() {}
    
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public static LoginResponse success(String token, String refreshToken, LocalDateTime expiresAt, StaffInfo staffInfo) {
        LoginResponse response = new LoginResponse(true, "Login successful");
        response.setToken(token);
        response.setRefreshToken(refreshToken);
        response.setExpiresAt(expiresAt);
        response.setStaffInfo(staffInfo);
        return response;
    }
    
    public static LoginResponse failure(String message) {
        return new LoginResponse(false, message);
    }
    
    public static LoginResponse accountLocked(int failedAttempts, LocalDateTime lockedUntil) {
        LoginResponse response = new LoginResponse(false, "Account is locked due to multiple failed login attempts");
        response.setFailedAttempts(failedAttempts);
        response.setLockedUntil(lockedUntil);
        return response;
    }
    
    // Nested Staff Info Class
    public static class StaffInfo {
        private String staffId;
        private String employeeNumber;
        private String fullName;
        private StaffRole role;
        private Set<StaffPermission> permissions;
        private LocalDateTime lastLoginAt;
        private boolean isOnDuty;
        
        // Constructors
        public StaffInfo() {}
        
        public StaffInfo(String staffId, String employeeNumber, String fullName, 
                        StaffRole role, Set<StaffPermission> permissions) {
            this.staffId = staffId;
            this.employeeNumber = employeeNumber;
            this.fullName = fullName;
            this.role = role;
            this.permissions = permissions;
        }
        
        // Getters and Setters
        public String getStaffId() {
            return staffId;
        }
        
        public void setStaffId(String staffId) {
            this.staffId = staffId;
        }
        
        public String getEmployeeNumber() {
            return employeeNumber;
        }
        
        public void setEmployeeNumber(String employeeNumber) {
            this.employeeNumber = employeeNumber;
        }
        
        public String getFullName() {
            return fullName;
        }
        
        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
        
        public StaffRole getRole() {
            return role;
        }
        
        public void setRole(StaffRole role) {
            this.role = role;
        }
        
        public Set<StaffPermission> getPermissions() {
            return permissions;
        }
        
        public void setPermissions(Set<StaffPermission> permissions) {
            this.permissions = permissions;
        }
        
        public LocalDateTime getLastLoginAt() {
            return lastLoginAt;
        }
        
        public void setLastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
        }
        
        public boolean isOnDuty() {
            return isOnDuty;
        }
        
        public void setOnDuty(boolean onDuty) {
            isOnDuty = onDuty;
        }
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public StaffInfo getStaffInfo() {
        return staffInfo;
    }
    
    public void setStaffInfo(StaffInfo staffInfo) {
        this.staffInfo = staffInfo;
    }
    
    public String getCurrentShiftId() {
        return currentShiftId;
    }
    
    public void setCurrentShiftId(String currentShiftId) {
        this.currentShiftId = currentShiftId;
    }
    
    public int getFailedAttempts() {
        return failedAttempts;
    }
    
    public void setFailedAttempts(int failedAttempts) {
        this.failedAttempts = failedAttempts;
    }
    
    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }
    
    public void setLockedUntil(LocalDateTime lockedUntil) {
        this.lockedUntil = lockedUntil;
    }
    
    @Override
    public String toString() {
        return "LoginResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", token='" + (token != null ? "[PROTECTED]" : null) + '\'' +
                ", expiresAt=" + expiresAt +
                ", staffInfo=" + (staffInfo != null ? staffInfo.getFullName() : null) +
                '}';
    }
}