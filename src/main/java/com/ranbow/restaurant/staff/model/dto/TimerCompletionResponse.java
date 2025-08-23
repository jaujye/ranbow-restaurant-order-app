package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.models.CookingTimer;

/**
 * Response DTO for timer completion operations
 */
public class TimerCompletionResponse {
    
    private boolean success;
    private String message;
    private CookingTimer timer;
    private Double efficiencyScore;
    private String errorCode;
    
    // Constructors
    public TimerCompletionResponse() {}
    
    private TimerCompletionResponse(boolean success, String message, CookingTimer timer, Double efficiencyScore, String errorCode) {
        this.success = success;
        this.message = message;
        this.timer = timer;
        this.efficiencyScore = efficiencyScore;
        this.errorCode = errorCode;
    }
    
    // Factory methods
    public static TimerCompletionResponse success(CookingTimer timer, Object efficiency) {
        Double efficiencyScore = null;
        if (efficiency != null) {
            // Handle different efficiency object types
            if (efficiency instanceof Double) {
                efficiencyScore = (Double) efficiency;
            } else if (efficiency instanceof Number) {
                efficiencyScore = ((Number) efficiency).doubleValue();
            }
        }
        return new TimerCompletionResponse(true, "Timer completed successfully", timer, efficiencyScore, null);
    }
    
    public static TimerCompletionResponse error(String message) {
        return new TimerCompletionResponse(false, message, null, null, "TIMER_COMPLETION_ERROR");
    }
    
    public static TimerCompletionResponse error(String message, String errorCode) {
        return new TimerCompletionResponse(false, message, null, null, errorCode);
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
    
    public Double getEfficiencyScore() {
        return efficiencyScore;
    }
    
    public void setEfficiencyScore(Double efficiencyScore) {
        this.efficiencyScore = efficiencyScore;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    @Override
    public String toString() {
        return "TimerCompletionResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", timer=" + (timer != null ? timer.getTimerId() : null) +
                ", efficiencyScore=" + efficiencyScore +
                ", errorCode='" + errorCode + '\'' +
                '}';
    }
}