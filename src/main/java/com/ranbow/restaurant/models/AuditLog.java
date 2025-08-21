package com.ranbow.restaurant.models;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLog {
    private String logId;
    private String adminId;
    private String adminName;
    private String action;
    private String resourceType;
    private String resourceId;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String userAgent;
    private String result;
    private String errorMessage;
    private LocalDateTime timestamp;
    
    public AuditLog() {
        this.logId = UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
    }
    
    public AuditLog(String adminId, String adminName, String action, String resourceType, String resourceId) {
        this();
        this.adminId = adminId;
        this.adminName = adminName;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }
    
    // Getters and Setters
    public String getLogId() {
        return logId;
    }
    
    public void setLogId(String logId) {
        this.logId = logId;
    }
    
    public String getAdminId() {
        return adminId;
    }
    
    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }
    
    public String getAdminName() {
        return adminName;
    }
    
    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public String getResourceType() {
        return resourceType;
    }
    
    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }
    
    public String getResourceId() {
        return resourceId;
    }
    
    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }
    
    public String getOldValue() {
        return oldValue;
    }
    
    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }
    
    public String getNewValue() {
        return newValue;
    }
    
    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getResult() {
        return result;
    }
    
    public void setResult(String result) {
        this.result = result;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    @Override
    public String toString() {
        return "AuditLog{" +
                "logId='" + logId + '\'' +
                ", adminName='" + adminName + '\'' +
                ", action='" + action + '\'' +
                ", resourceType='" + resourceType + '\'' +
                ", resourceId='" + resourceId + '\'' +
                ", result='" + result + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}