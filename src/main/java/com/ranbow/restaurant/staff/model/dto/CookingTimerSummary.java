package com.ranbow.restaurant.staff.model.dto;

/**
 * Summary DTO for cooking timer information
 */
public class CookingTimerSummary {
    
    private String timerId;
    private String orderId;
    private int elapsedSeconds;
    private int remainingSeconds;
    private String stage;
    private double progressPercentage;
    
    // Constructors
    public CookingTimerSummary() {}
    
    public CookingTimerSummary(String timerId, String orderId, int elapsedSeconds, 
                              int remainingSeconds, String stage, double progressPercentage) {
        this.timerId = timerId;
        this.orderId = orderId;
        this.elapsedSeconds = elapsedSeconds;
        this.remainingSeconds = remainingSeconds;
        this.stage = stage;
        this.progressPercentage = progressPercentage;
    }
    
    // Getters and Setters
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
    
    public int getElapsedSeconds() {
        return elapsedSeconds;
    }
    
    public void setElapsedSeconds(int elapsedSeconds) {
        this.elapsedSeconds = elapsedSeconds;
    }
    
    public int getRemainingSeconds() {
        return remainingSeconds;
    }
    
    public void setRemainingSeconds(int remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }
    
    public String getStage() {
        return stage;
    }
    
    public void setStage(String stage) {
        this.stage = stage;
    }
    
    public double getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    @Override
    public String toString() {
        return "CookingTimerSummary{" +
                "timerId='" + timerId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", elapsedSeconds=" + elapsedSeconds +
                ", remainingSeconds=" + remainingSeconds +
                ", stage='" + stage + '\'' +
                ", progressPercentage=" + progressPercentage +
                '}';
    }
}