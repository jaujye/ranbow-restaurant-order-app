package com.ranbow.restaurant.staff.model.vo;

import java.time.LocalDateTime;

/**
 * StaffSession Value Object
 * Used for tracking staff session information
 * Implements the exact specification from STAFF_UI_DEVELOPMENT_DOC.md
 */
public class StaffSession {
    
    private String sessionId;
    private String staffId;
    private String deviceId;
    private String deviceType;
    private String appVersion;
    private LocalDateTime loginTime;
    private LocalDateTime createdAt;
    private String employeeNumber;
    private LocalDateTime lastActivity;
    private LocalDateTime expiresAt;
    private boolean isActive;
    private String ipAddress;
    
    // Constructors
    public StaffSession() {}
    
    public StaffSession(String sessionId, String staffId, String deviceId, LocalDateTime loginTime) {
        this.sessionId = sessionId;
        this.staffId = staffId;
        this.deviceId = deviceId;
        this.loginTime = loginTime;
        this.lastActivity = loginTime;
        this.isActive = true;
    }
    
    // Business methods
    public void updateActivity() {
        this.lastActivity = LocalDateTime.now();
    }
    
    public void deactivate() {
        this.isActive = false;
    }
    
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public long getMinutesIdle() {
        if (lastActivity == null) return 0;
        return java.time.Duration.between(lastActivity, LocalDateTime.now()).toMinutes();
    }
    
    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public String getDeviceId() {
        return deviceId;
    }
    
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
    
    public String getDeviceType() {
        return deviceType;
    }
    
    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }
    
    public String getAppVersion() {
        return appVersion;
    }
    
    public void setAppVersion(String appVersion) {
        this.appVersion = appVersion;
    }
    
    public LocalDateTime getLoginTime() {
        return loginTime;
    }
    
    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }
    
    public LocalDateTime getLastActivity() {
        return lastActivity;
    }
    
    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getEmployeeNumber() {
        return employeeNumber;
    }
    
    public void setEmployeeNumber(String employeeNumber) {
        this.employeeNumber = employeeNumber;
    }
    
    @Override
    public String toString() {
        return "StaffSession{" +
                "sessionId='" + sessionId + '\'' +
                ", staffId='" + staffId + '\'' +
                ", deviceId='" + deviceId + '\'' +
                ", deviceType='" + deviceType + '\'' +
                ", loginTime=" + loginTime +
                ", lastActivity=" + lastActivity +
                ", isActive=" + isActive +
                '}';
    }
}