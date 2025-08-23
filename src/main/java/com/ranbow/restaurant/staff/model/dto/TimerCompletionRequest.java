package com.ranbow.restaurant.staff.model.dto;

/**
 * Request DTO for timer completion
 */
public class TimerCompletionRequest {
    
    private String timerId;
    private Integer actualDurationSeconds;
    private Double qualityScore;
    private String completionNotes;
    
    // Constructors
    public TimerCompletionRequest() {}
    
    public TimerCompletionRequest(String timerId, Integer actualDurationSeconds) {
        this.timerId = timerId;
        this.actualDurationSeconds = actualDurationSeconds;
    }
    
    // Getters and Setters
    public String getTimerId() {
        return timerId;
    }
    
    public void setTimerId(String timerId) {
        this.timerId = timerId;
    }
    
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
    
    @Override
    public String toString() {
        return "TimerCompletionRequest{" +
                "timerId='" + timerId + '\'' +
                ", actualDurationSeconds=" + actualDurationSeconds +
                ", qualityScore=" + qualityScore +
                '}';
    }
}