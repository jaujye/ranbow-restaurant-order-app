package com.ranbow.restaurant.models.kitchen;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

/**
 * Timer Completion Request DTO
 * Request object for completing cooking timers
 */
public class TimerCompletionRequest {
    @Min(value = 1, message = "Actual duration must be at least 1 second")
    private Integer actualDurationSeconds;
    
    @Min(value = 0, message = "Quality score cannot be negative")
    @Max(value = 10, message = "Quality score cannot exceed 10")
    private Double qualityScore;
    
    private String completionNotes;
    private String staffId;
    private Boolean onTime;
    private String dishCondition; // EXCELLENT, GOOD, FAIR, POOR
    private String customerFeedback;
    
    public TimerCompletionRequest() {}
    
    public TimerCompletionRequest(Integer actualDurationSeconds) {
        this.actualDurationSeconds = actualDurationSeconds;
    }
    
    public TimerCompletionRequest(Integer actualDurationSeconds, Double qualityScore) {
        this.actualDurationSeconds = actualDurationSeconds;
        this.qualityScore = qualityScore;
    }
    
    public TimerCompletionRequest(Integer actualDurationSeconds, Double qualityScore, String completionNotes) {
        this.actualDurationSeconds = actualDurationSeconds;
        this.qualityScore = qualityScore;
        this.completionNotes = completionNotes;
    }
    
    // Validation methods
    public boolean isValid() {
        return actualDurationSeconds != null && actualDurationSeconds > 0;
    }
    
    public boolean hasQualityScore() {
        return qualityScore != null && qualityScore >= 0 && qualityScore <= 10;
    }
    
    // Getters and Setters
    public Integer getActualDurationSeconds() {
        return actualDurationSeconds;
    }
    
    public void setActualDurationSeconds(Integer actualDurationSeconds) {
        this.actualDurationSeconds = actualDurationSeconds;
    }
    
    public Double getQualityScore() {
        return qualityScore;
    }
    
    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }
    
    public String getCompletionNotes() {
        return completionNotes;
    }
    
    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
    }
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public Boolean getOnTime() {
        return onTime;
    }
    
    public void setOnTime(Boolean onTime) {
        this.onTime = onTime;
    }
    
    public String getDishCondition() {
        return dishCondition;
    }
    
    public void setDishCondition(String dishCondition) {
        this.dishCondition = dishCondition;
    }
    
    public String getCustomerFeedback() {
        return customerFeedback;
    }
    
    public void setCustomerFeedback(String customerFeedback) {
        this.customerFeedback = customerFeedback;
    }
    
    @Override
    public String toString() {
        return "TimerCompletionRequest{" +
                "actualDurationSeconds=" + actualDurationSeconds +
                ", qualityScore=" + qualityScore +
                ", completionNotes='" + completionNotes + '\'' +
                ", staffId='" + staffId + '\'' +
                ", onTime=" + onTime +
                ", dishCondition='" + dishCondition + '\'' +
                '}';
    }
}