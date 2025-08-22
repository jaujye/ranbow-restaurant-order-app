package com.ranbow.restaurant.staff.model.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Staff Token Refresh Request DTO
 * Used for refreshing JWT access tokens
 * Implements the exact specification from STAFF_UI_DEVELOPMENT_DOC.md
 */
public class StaffTokenRefreshRequest {
    
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
    
    private String deviceId; // Optional: for additional security verification
    
    // Constructors
    public StaffTokenRefreshRequest() {}
    
    public StaffTokenRefreshRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public StaffTokenRefreshRequest(String refreshToken, String deviceId) {
        this.refreshToken = refreshToken;
        this.deviceId = deviceId;
    }
    
    // Getters and Setters
    public String getRefreshToken() {
        return refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
    public String getDeviceId() {
        return deviceId;
    }
    
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
    
    @Override
    public String toString() {
        return "StaffTokenRefreshRequest{" +
                "refreshToken='" + (refreshToken != null ? refreshToken.substring(0, Math.min(refreshToken.length(), 10)) + "..." : "null") + '\'' +
                ", deviceId='" + deviceId + '\'' +
                '}';
    }
}