package com.ranbow.restaurant.staff.model.dto;

import java.time.LocalDateTime;

/**
 * DTO for workload alerts
 */
public class WorkloadAlert {
    
    private String alertType;
    private String message;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
    private String stationId;
    private String relatedOrderId;
    private String recommendation;
    
    // Constructors
    public WorkloadAlert() {
        this.timestamp = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }
    
    public WorkloadAlert(String alertType, String message, String severity) {
        this();
        this.alertType = alertType;
        this.message = message;
        this.severity = severity;
    }
    
    public WorkloadAlert(String alertType, String message, String severity, String stationId) {
        this(alertType, message, severity);
        this.stationId = stationId;
    }
    
    // Getters and Setters
    public String getAlertType() {
        return alertType;
    }
    
    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getSeverity() {
        return severity;
    }
    
    public void setSeverity(String severity) {
        this.severity = severity;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getStationId() {
        return stationId;
    }
    
    public void setStationId(String stationId) {
        this.stationId = stationId;
    }
    
    public String getRelatedOrderId() {
        return relatedOrderId;
    }
    
    public void setRelatedOrderId(String relatedOrderId) {
        this.relatedOrderId = relatedOrderId;
    }
    
    public String getRecommendation() {
        return recommendation;
    }
    
    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getLevel() {
        return severity; // severity acts as level
    }
    
    public void setLevel(String level) {
        this.severity = level; // severity acts as level
    }
    
    public String getTitle() {
        return alertType; // alertType acts as title
    }
    
    public void setTitle(String title) {
        this.alertType = title; // alertType acts as title
    }
    
    @Override
    public String toString() {
        return "WorkloadAlert{" +
                "alertType='" + alertType + '\'' +
                ", message='" + message + '\'' +
                ", severity='" + severity + '\'' +
                ", timestamp=" + timestamp +
                ", stationId='" + stationId + '\'' +
                '}';
    }
}