package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.models.CookingTimer;

/**
 * Response DTO for timer action operations (pause, resume, etc.)
 */
public class TimerActionResponse {
    
    private boolean success;
    private String message;
    private CookingTimer timer;
    private String action;
    private String errorCode;
    
    // Constructors
    public TimerActionResponse() {}
    
    private TimerActionResponse(boolean success, String message, CookingTimer timer, String action, String errorCode) {
        this.success = success;
        this.message = message;
        this.timer = timer;
        this.action = action;
        this.errorCode = errorCode;
    }
    
    // Factory methods
    public static TimerActionResponse success(String message, CookingTimer timer) {
        return new TimerActionResponse(true, message, timer, null, null);
    }
    
    public static TimerActionResponse success(String message, CookingTimer timer, String action) {
        return new TimerActionResponse(true, message, timer, action, null);
    }
    
    public static TimerActionResponse error(String message) {
        return new TimerActionResponse(false, message, null, null, "TIMER_ACTION_ERROR");
    }
    
    public static TimerActionResponse error(String message, String errorCode) {
        return new TimerActionResponse(false, message, null, null, errorCode);
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
    
    public CookingTimer getTimer() {
        return timer;
    }
    
    public void setTimer(CookingTimer timer) {
        this.timer = timer;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    @Override
    public String toString() {
        return "TimerActionResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", timer=" + (timer != null ? timer.getTimerId() : null) +
                ", action='" + action + '\'' +
                ", errorCode='" + errorCode + '\'' +
                '}';
    }
}