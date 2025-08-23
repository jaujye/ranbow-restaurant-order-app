package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.models.CookingTimer;

/**
 * Response DTO for timer update operations
 */
public class TimerUpdateResponse {
    
    private boolean success;
    private String message;
    private CookingTimer timer;
    private String errorCode;
    
    // Constructors
    public TimerUpdateResponse() {}
    
    private TimerUpdateResponse(boolean success, String message, CookingTimer timer, String errorCode) {
        this.success = success;
        this.message = message;
        this.timer = timer;
        this.errorCode = errorCode;
    }
    
    // Factory methods
    public static TimerUpdateResponse success(CookingTimer timer) {
        return new TimerUpdateResponse(true, "Timer updated successfully", timer, null);
    }
    
    public static TimerUpdateResponse error(String message) {
        return new TimerUpdateResponse(false, message, null, "TIMER_UPDATE_ERROR");
    }
    
    public static TimerUpdateResponse error(String message, String errorCode) {
        return new TimerUpdateResponse(false, message, null, errorCode);
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
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    @Override
    public String toString() {
        return "TimerUpdateResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", timer=" + (timer != null ? timer.getTimerId() : null) +
                ", errorCode='" + errorCode + '\'' +
                '}';
    }
}