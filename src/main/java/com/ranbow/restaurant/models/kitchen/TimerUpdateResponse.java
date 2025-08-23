package com.ranbow.restaurant.models.kitchen;

import com.ranbow.restaurant.models.CookingTimer;
import java.time.LocalDateTime;

/**
 * Timer Update Response DTO
 * Response object for cooking timer status updates
 */
public class TimerUpdateResponse {
    private boolean success;
    private String message;
    private String errorCode;
    private CookingTimer timer;
    private LocalDateTime timestamp;
    
    public TimerUpdateResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public TimerUpdateResponse(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    public TimerUpdateResponse(boolean success, String message, CookingTimer timer) {
        this(success, message);
        this.timer = timer;
    }
    
    // Static factory methods
    public static TimerUpdateResponse success(CookingTimer timer) {
        return new TimerUpdateResponse(true, "Timer updated successfully", timer);
    }
    
    public static TimerUpdateResponse success(String message, CookingTimer timer) {
        return new TimerUpdateResponse(true, message, timer);
    }
    
    public static TimerUpdateResponse error(String message) {
        TimerUpdateResponse response = new TimerUpdateResponse(false, message);
        response.setErrorCode("UPDATE_FAILED");
        return response;
    }
    
    public static TimerUpdateResponse error(String message, String errorCode) {
        TimerUpdateResponse response = new TimerUpdateResponse(false, message);
        response.setErrorCode(errorCode);
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
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    public CookingTimer getTimer() {
        return timer;
    }
    
    public void setTimer(CookingTimer timer) {
        this.timer = timer;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    @Override
    public String toString() {
        return "TimerUpdateResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", errorCode='" + errorCode + '\'' +
                ", timer=" + (timer != null ? timer.getTimerId() : null) +
                ", timestamp=" + timestamp +
                '}';
    }
}