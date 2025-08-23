package com.ranbow.restaurant.models.kitchen;

import com.ranbow.restaurant.models.CookingTimer;

import java.time.LocalDateTime;

/**
 * Cooking Session Response DTO
 * Response for starting a cooking session
 */
public class CookingSessionResponse {
    
    private boolean success;
    private String message;
    private String timerId;
    private String orderId;
    private String workstationId;
    private Integer estimatedDurationSeconds;
    private LocalDateTime startTime;
    private LocalDateTime estimatedEndTime;
    private String stage;
    private String status;
    private LocalDateTime timestamp;
    private String errorCode;
    
    // Constructors
    public CookingSessionResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public CookingSessionResponse(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    // Static factory methods
    public static CookingSessionResponse success(CookingTimer timer) {
        CookingSessionResponse response = new CookingSessionResponse(true, "Cooking session started successfully");
        response.timerId = timer.getTimerId();
        response.orderId = timer.getOrder().getOrderId();
        response.workstationId = timer.getWorkstationId();
        response.estimatedDurationSeconds = timer.getEstimatedDurationSeconds();
        response.startTime = timer.getStartTime();
        response.estimatedEndTime = timer.getEstimatedEndTime();
        response.stage = timer.getStage() != null ? timer.getStage().name() : null;
        response.status = timer.getStatus().name();
        return response;
    }
    
    public static CookingSessionResponse error(String message) {
        CookingSessionResponse response = new CookingSessionResponse(false, message);
        response.errorCode = "COOKING_SESSION_ERROR";
        return response;
    }
    
    public static CookingSessionResponse error(String message, String errorCode) {
        CookingSessionResponse response = new CookingSessionResponse(false, message);
        response.errorCode = errorCode;
        return response;
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
    
    public String getTimerId() {
        return timerId;
    }
    
    public void setTimerId(String timerId) {
        this.timerId = timerId;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getWorkstationId() {
        return workstationId;
    }
    
    public void setWorkstationId(String workstationId) {
        this.workstationId = workstationId;
    }
    
    public Integer getEstimatedDurationSeconds() {
        return estimatedDurationSeconds;
    }
    
    public void setEstimatedDurationSeconds(Integer estimatedDurationSeconds) {
        this.estimatedDurationSeconds = estimatedDurationSeconds;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEstimatedEndTime() {
        return estimatedEndTime;
    }
    
    public void setEstimatedEndTime(LocalDateTime estimatedEndTime) {
        this.estimatedEndTime = estimatedEndTime;
    }
    
    public String getStage() {
        return stage;
    }
    
    public void setStage(String stage) {
        this.stage = stage;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    @Override
    public String toString() {
        return "CookingSessionResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", timerId='" + timerId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", workstationId='" + workstationId + '\'' +
                ", estimatedDurationSeconds=" + estimatedDurationSeconds +
                ", stage='" + stage + '\'' +
                ", status='" + status + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}