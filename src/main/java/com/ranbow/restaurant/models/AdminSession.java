package com.ranbow.restaurant.models;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminSession {
    private String sessionId;
    private String adminId;
    private String deviceInfo;
    private String ipAddress;
    private LocalDateTime createdAt;
    private LocalDateTime lastAccessAt;
    private boolean isActive;
    private String permissions;
    
    public AdminSession() {
        this.sessionId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.lastAccessAt = LocalDateTime.now();
        this.isActive = true;
    }
    
    public AdminSession(String adminId, String deviceInfo, String ipAddress, String permissions) {
        this();
        this.adminId = adminId;
        this.deviceInfo = deviceInfo;
        this.ipAddress = ipAddress;
        this.permissions = permissions;
    }
    
    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getAdminId() {
        return adminId;
    }
    
    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }
    
    public String getDeviceInfo() {
        return deviceInfo;
    }
    
    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
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
    
    public LocalDateTime getLastAccessAt() {
        return lastAccessAt;
    }
    
    public void setLastAccessAt(LocalDateTime lastAccessAt) {
        this.lastAccessAt = lastAccessAt;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        this.isActive = active;
    }
    
    public String getPermissions() {
        return permissions;
    }
    
    public void setPermissions(String permissions) {
        this.permissions = permissions;
    }
}