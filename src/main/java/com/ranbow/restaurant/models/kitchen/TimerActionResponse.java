package com.ranbow.restaurant.models.kitchen;

import com.ranbow.restaurant.models.CookingTimer;
import java.time.LocalDateTime;

/**
 * Timer Action Response DTO
 * Response object for cooking timer actions (pause, resume, etc.)
 */
public class TimerActionResponse {
    private boolean success;
    private String message;
    private String errorCode;
    private String action;
    private CookingTimer timer;
    private LocalDateTime timestamp;
    
    public TimerActionResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public TimerActionResponse(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    public TimerActionResponse(boolean success, String message, String action, CookingTimer timer) {
        this(success, message);
        this.action = action;
        this.timer = timer;
    }
    
    // Static factory methods
    public static TimerActionResponse success(String message, CookingTimer timer) {
        return new TimerActionResponse(true, message, "ACTION_SUCCESS", timer);
    }
    
    public static TimerActionResponse success(String message, String action, CookingTimer timer) {
        return new TimerActionResponse(true, message, action, timer);
    }
    
    public static TimerActionResponse error(String message) {
        TimerActionResponse response = new TimerActionResponse(false, message);
        response.setErrorCode("ACTION_FAILED");
        return response;
    }
    
    public static TimerActionResponse error(String message, String errorCode) {
        TimerActionResponse response = new TimerActionResponse(false, message);
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
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
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
        return "TimerActionResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", action='" + action + '\'' +
                ", errorCode='" + errorCode + '\'' +
                ", timer=" + (timer != null ? timer.getTimerId() : null) +
                ", timestamp=" + timestamp +
                '}';
    }
}