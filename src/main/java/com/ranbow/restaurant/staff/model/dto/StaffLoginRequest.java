package com.ranbow.restaurant.staff.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Staff Login Request DTO
 * Data Transfer Object for staff authentication requests
 * Implements the exact specification from STAFF_UI_DEVELOPMENT_DOC.md
 */
public class StaffLoginRequest {
    
    @NotBlank(message = "Login ID is required")
    @Size(min = 3, max = 50, message = "Login ID must be between 3 and 50 characters")
    private String loginId; // Employee number or email
    
    @NotBlank(message = "Password is required")
    @Size(min = 1, max = 100, message = "Password must not exceed 100 characters")
    private String password;
    
    @Valid
    @NotNull(message = "Device info is required")
    private DeviceInfo deviceInfo;
    
    // Nested class for device information
    public static class DeviceInfo {
        @NotBlank(message = "Device ID is required")
        private String deviceId;
        
        @NotBlank(message = "Device type is required")
        private String deviceType; // TABLET, PHONE, POS, etc.
        
        @NotBlank(message = "App version is required")
        private String appVersion;
        
        private String deviceName;
        private String userAgent;
        
        // Constructors
        public DeviceInfo() {}
        
        public DeviceInfo(String deviceId, String deviceType, String appVersion) {
            this.deviceId = deviceId;
            this.deviceType = deviceType;
            this.appVersion = appVersion;
        }
        
        // Getters and Setters
        public String getDeviceId() { return deviceId; }
        public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
        
        public String getDeviceType() { return deviceType; }
        public void setDeviceType(String deviceType) { this.deviceType = deviceType; }
        
        public String getAppVersion() { return appVersion; }
        public void setAppVersion(String appVersion) { this.appVersion = appVersion; }
        
        public String getDeviceName() { return deviceName; }
        public void setDeviceName(String deviceName) { this.deviceName = deviceName; }
        
        public String getUserAgent() { return userAgent; }
        public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    }
    
    // Constructors
    public StaffLoginRequest() {}
    
    public StaffLoginRequest(String loginId, String password, DeviceInfo deviceInfo) {
        this.loginId = loginId;
        this.password = password;
        this.deviceInfo = deviceInfo;
    }
    
    // Getters and Setters
    public String getLoginId() {
        return loginId;
    }
    
    public void setLoginId(String loginId) {
        this.loginId = loginId;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public DeviceInfo getDeviceInfo() {
        return deviceInfo;
    }
    
    public void setDeviceInfo(DeviceInfo deviceInfo) {
        this.deviceInfo = deviceInfo;
    }
    
    @Override
    public String toString() {
        return "StaffLoginRequest{" +
                "loginId='" + loginId + '\'' +
                ", deviceInfo=" + deviceInfo +
                '}';
    }
}