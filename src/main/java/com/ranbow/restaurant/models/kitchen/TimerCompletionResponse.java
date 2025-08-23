package com.ranbow.restaurant.models.kitchen;

import com.ranbow.restaurant.models.CookingTimer;
import java.time.LocalDateTime;

/**
 * Timer Completion Response DTO
 * Response object for cooking timer completion operations
 */
public class TimerCompletionResponse {
    private boolean success;
    private String message;
    private String errorCode;
    private CookingTimer timer;
    private TimerEfficiency efficiency;
    private LocalDateTime completedAt;
    private LocalDateTime timestamp;
    
    public TimerCompletionResponse() {
        this.timestamp = LocalDateTime.now();
        this.completedAt = LocalDateTime.now();
    }
    
    public TimerCompletionResponse(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    public TimerCompletionResponse(boolean success, String message, CookingTimer timer, TimerEfficiency efficiency) {
        this(success, message);
        this.timer = timer;
        this.efficiency = efficiency;
    }
    
    // Static factory methods
    public static TimerCompletionResponse success(CookingTimer timer, TimerEfficiency efficiency) {
        return new TimerCompletionResponse(true, "Timer completed successfully", timer, efficiency);
    }
    
    public static TimerCompletionResponse success(String message, CookingTimer timer, TimerEfficiency efficiency) {
        return new TimerCompletionResponse(true, message, timer, efficiency);
    }
    
    public static TimerCompletionResponse error(String message) {
        TimerCompletionResponse response = new TimerCompletionResponse(false, message);
        response.setErrorCode("COMPLETION_FAILED");
        return response;
    }
    
    public static TimerCompletionResponse error(String message, String errorCode) {
        TimerCompletionResponse response = new TimerCompletionResponse(false, message);
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
    
    public TimerEfficiency getEfficiency() {
        return efficiency;
    }
    
    public void setEfficiency(TimerEfficiency efficiency) {
        this.efficiency = efficiency;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    @Override
    public String toString() {
        return "TimerCompletionResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", errorCode='" + errorCode + '\'' +
                ", timer=" + (timer != null ? timer.getTimerId() : null) +
                ", efficiency=" + efficiency +
                ", completedAt=" + completedAt +
                ", timestamp=" + timestamp +
                '}';
    }
    
    /**
     * Timer Efficiency DTO
     * Represents efficiency metrics for a completed timer
     */
    public static class TimerEfficiency {
        private double efficiencyPercentage;
        private boolean onTime;
        private int estimatedSeconds;
        private int actualSeconds;
        private int varianceSeconds;
        private String efficiencyGrade;
        
        public TimerEfficiency() {}
        
        public TimerEfficiency(double efficiencyPercentage, boolean onTime, int estimatedSeconds, int actualSeconds) {
            this.efficiencyPercentage = efficiencyPercentage;
            this.onTime = onTime;
            this.estimatedSeconds = estimatedSeconds;
            this.actualSeconds = actualSeconds;
            this.varianceSeconds = actualSeconds - estimatedSeconds;
            this.efficiencyGrade = calculateGrade(efficiencyPercentage);
        }
        
        private String calculateGrade(double efficiency) {
            if (efficiency >= 95) return "A+";
            if (efficiency >= 90) return "A";
            if (efficiency >= 85) return "B+";
            if (efficiency >= 80) return "B";
            if (efficiency >= 75) return "C+";
            if (efficiency >= 70) return "C";
            return "D";
        }
        
        // Getters and Setters
        public double getEfficiencyPercentage() { return efficiencyPercentage; }
        public void setEfficiencyPercentage(double efficiencyPercentage) { this.efficiencyPercentage = efficiencyPercentage; }
        public boolean isOnTime() { return onTime; }
        public void setOnTime(boolean onTime) { this.onTime = onTime; }
        public int getEstimatedSeconds() { return estimatedSeconds; }
        public void setEstimatedSeconds(int estimatedSeconds) { this.estimatedSeconds = estimatedSeconds; }
        public int getActualSeconds() { return actualSeconds; }
        public void setActualSeconds(int actualSeconds) { this.actualSeconds = actualSeconds; }
        public int getVarianceSeconds() { return varianceSeconds; }
        public void setVarianceSeconds(int varianceSeconds) { this.varianceSeconds = varianceSeconds; }
        public String getEfficiencyGrade() { return efficiencyGrade; }
        public void setEfficiencyGrade(String efficiencyGrade) { this.efficiencyGrade = efficiencyGrade; }
        
        @Override
        public String toString() {
            return String.format("TimerEfficiency{%.1f%%, grade=%s, onTime=%s}", 
                               efficiencyPercentage, efficiencyGrade, onTime);
        }
    }
}