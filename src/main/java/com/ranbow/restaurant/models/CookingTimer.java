package com.ranbow.restaurant.models;

import com.ranbow.restaurant.staff.model.entity.OrderAssignment;
import com.ranbow.restaurant.staff.model.entity.StaffMember;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Enhanced Cooking Timer Entity
 * Manages precise timing for cooking operations with real-time tracking
 */
@Entity
@Table(name = "cooking_timers", indexes = {
    @Index(name = "idx_cooking_timer_order_id", columnList = "orderId"),
    @Index(name = "idx_cooking_timer_staff_id", columnList = "staffId"),
    @Index(name = "idx_cooking_timer_status", columnList = "status"),
    @Index(name = "idx_cooking_timer_workstation", columnList = "workstationId"),
    @Index(name = "idx_cooking_timer_start_time", columnList = "startTime"),
    @Index(name = "idx_cooking_timer_estimated_end", columnList = "estimatedEndTime")
})
public class CookingTimer {
    
    @Id
    @Column(name = "timer_id", updatable = false, nullable = false, length = 36)
    private String timerId;
    
    @NotNull(message = "Order is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private StaffMember chef;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private OrderAssignment assignment;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "pause_time")
    private LocalDateTime pauseTime;
    
    @Column(name = "resume_time")
    private LocalDateTime resumeTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "estimated_end_time")
    private LocalDateTime estimatedEndTime;
    
    @Column(name = "estimated_duration_seconds")
    private Integer estimatedDurationSeconds;
    
    @Column(name = "actual_duration_seconds")
    private Integer actualDurationSeconds;
    
    @Column(name = "paused_duration_seconds")
    private Integer pausedDurationSeconds = 0;
    
    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CookingStatus status = CookingStatus.IDLE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "stage", length = 20)
    private CookingStage stage = CookingStage.PREP;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "workstation_type", length = 20)
    private WorkstationType workstationType;
    
    @Column(name = "workstation_id", length = 50)
    private String workstationId;
    
    @Column(name = "alerts_sent")
    private Integer alertsSent = 0;
    
    @Column(name = "notes", length = 1000)
    private String notes;
    
    @Column(name = "temperature_target")
    private Double temperatureTarget;
    
    @Column(name = "quality_score", columnDefinition = "DECIMAL(3,2)")
    private Double qualityScore;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    @Column(name = "version")
    private Long version;
    
    // Constructors
    public CookingTimer() {
        this.timerId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public CookingTimer(Order order, StaffMember chef, int estimatedDurationSeconds) {
        this();
        this.order = order;
        this.chef = chef;
        this.estimatedDurationSeconds = estimatedDurationSeconds;
    }
    
    public CookingTimer(Order order, String workstationId, int estimatedDurationSeconds) {
        this();
        this.order = order;
        this.workstationId = workstationId;
        this.estimatedDurationSeconds = estimatedDurationSeconds;
    }
    
    // Business Methods
    
    /**
     * Start the cooking timer
     */
    public void startTimer() {
        if (this.status != CookingStatus.IDLE) {
            throw new IllegalStateException("Timer can only be started from IDLE state");
        }
        
        this.startTime = LocalDateTime.now();
        this.status = CookingStatus.RUNNING;
        this.estimatedEndTime = startTime.plusSeconds(estimatedDurationSeconds);
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Pause the cooking timer
     * @param reason Optional reason for pausing
     */
    public void pauseTimer(String reason) {
        if (this.status != CookingStatus.RUNNING) {
            throw new IllegalStateException("Timer can only be paused when RUNNING");
        }
        
        this.pauseTime = LocalDateTime.now();
        this.status = CookingStatus.PAUSED;
        if (reason != null && !reason.trim().isEmpty()) {
            this.notes = (this.notes != null ? this.notes + "; " : "") + "暫停: " + reason;
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Resume the cooking timer
     */
    public void resumeTimer() {
        if (this.status != CookingStatus.PAUSED) {
            throw new IllegalStateException("Timer can only be resumed when PAUSED");
        }
        
        if (pauseTime != null) {
            // Calculate paused duration and add to total
            long pausedSeconds = Duration.between(pauseTime, LocalDateTime.now()).getSeconds();
            this.pausedDurationSeconds += (int) pausedSeconds;
            
            // Extend estimated end time by paused duration
            this.estimatedEndTime = this.estimatedEndTime.plusSeconds(pausedSeconds);
        }
        
        this.resumeTime = LocalDateTime.now();
        this.status = CookingStatus.RUNNING;
        this.pauseTime = null;
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Complete the cooking timer
     */
    public void completeTimer() {
        if (!status.canBeCompleted()) {
            throw new IllegalStateException("Timer cannot be completed in current state: " + status);
        }
        
        this.endTime = LocalDateTime.now();
        this.status = CookingStatus.COMPLETED;
        this.calculateActualDuration();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Cancel the cooking timer
     * @param reason Reason for cancellation
     */
    public void cancelTimer(String reason) {
        this.endTime = LocalDateTime.now();
        this.status = CookingStatus.CANCELLED;
        this.notes = (this.notes != null ? this.notes + "; " : "") + "取消: " + reason;
        this.calculateActualDuration();
        this.updatedAt = LocalDateTime.now();
    }
    
    /**
     * Advance to next cooking stage
     */
    public void advanceStage() {
        if (this.stage != null && !this.stage.isLastStage()) {
            this.stage = this.stage.getNextStage();
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    /**
     * Add cooking note
     * @param note Note to add
     */
    public void addNote(String note) {
        if (note != null && !note.trim().isEmpty()) {
            this.notes = (this.notes != null ? this.notes + "; " : "") + note;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    /**
     * Increment alerts sent counter
     */
    public void incrementAlerts() {
        this.alertsSent++;
        this.updatedAt = LocalDateTime.now();
    }
    
    // Calculated Properties
    
    /**
     * Get elapsed seconds since timer start
     * @return Elapsed seconds
     */
    public int getElapsedSeconds() {
        if (startTime == null) return 0;
        
        LocalDateTime referenceTime;
        if (status == CookingStatus.PAUSED && pauseTime != null) {
            referenceTime = pauseTime;
        } else if (endTime != null) {
            referenceTime = endTime;
        } else {
            referenceTime = LocalDateTime.now();
        }
        
        long elapsed = Duration.between(startTime, referenceTime).getSeconds();
        return (int) (elapsed - pausedDurationSeconds);
    }
    
    /**
     * Get remaining seconds until estimated completion
     * @return Remaining seconds (negative if overdue)
     */
    public int getRemainingSeconds() {
        if (estimatedDurationSeconds == null) return 0;
        return estimatedDurationSeconds - getElapsedSeconds();
    }
    
    /**
     * Get progress percentage
     * @return Progress percentage (0-100)
     */
    public double getProgressPercentage() {
        if (estimatedDurationSeconds == null || estimatedDurationSeconds == 0) return 0.0;
        
        int elapsed = getElapsedSeconds();
        double progress = (double) elapsed / estimatedDurationSeconds * 100;
        return Math.min(100.0, Math.max(0.0, progress));
    }
    
    /**
     * Check if timer is overdue
     * @return true if overdue, false otherwise
     */
    public boolean isOverdue() {
        if (status.isCompleted() || estimatedEndTime == null) return false;
        return LocalDateTime.now().isAfter(estimatedEndTime);
    }
    
    /**
     * Get overdue duration in seconds
     * @return Overdue seconds (0 if not overdue)
     */
    public int getOverdueSeconds() {
        if (!isOverdue()) return 0;
        return (int) Duration.between(estimatedEndTime, LocalDateTime.now()).getSeconds();
    }
    
    /**
     * Get estimated minutes remaining
     * @return Minutes remaining (negative if overdue)
     */
    public int getEstimatedMinutesRemaining() {
        return (int) Math.ceil(getRemainingSeconds() / 60.0);
    }
    
    private void calculateActualDuration() {
        if (startTime != null && endTime != null) {
            long totalSeconds = Duration.between(startTime, endTime).getSeconds();
            this.actualDurationSeconds = (int) (totalSeconds - pausedDurationSeconds);
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        
        // Auto-update status to overdue if necessary
        if (status == CookingStatus.RUNNING && isOverdue()) {
            this.status = CookingStatus.OVERDUE;
        }
    }
    
    // Getters and Setters
    public String getTimerId() {
        return timerId;
    }
    
    public void setTimerId(String timerId) {
        this.timerId = timerId;
    }
    
    public Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
    }
    
    public StaffMember getChef() {
        return chef;
    }
    
    public void setChef(StaffMember chef) {
        this.chef = chef;
    }
    
    public OrderAssignment getAssignment() {
        return assignment;
    }
    
    public void setAssignment(OrderAssignment assignment) {
        this.assignment = assignment;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getPauseTime() {
        return pauseTime;
    }
    
    public void setPauseTime(LocalDateTime pauseTime) {
        this.pauseTime = pauseTime;
    }
    
    public LocalDateTime getResumeTime() {
        return resumeTime;
    }
    
    public void setResumeTime(LocalDateTime resumeTime) {
        this.resumeTime = resumeTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public LocalDateTime getEstimatedEndTime() {
        return estimatedEndTime;
    }
    
    public void setEstimatedEndTime(LocalDateTime estimatedEndTime) {
        this.estimatedEndTime = estimatedEndTime;
    }
    
    public Integer getEstimatedDurationSeconds() {
        return estimatedDurationSeconds;
    }
    
    public void setEstimatedDurationSeconds(Integer estimatedDurationSeconds) {
        this.estimatedDurationSeconds = estimatedDurationSeconds;
        if (startTime != null) {
            this.estimatedEndTime = startTime.plusSeconds(estimatedDurationSeconds);
        }
    }
    
    public Integer getActualDurationSeconds() {
        return actualDurationSeconds;
    }
    
    public void setActualDurationSeconds(Integer actualDurationSeconds) {
        this.actualDurationSeconds = actualDurationSeconds;
    }
    
    public Integer getPausedDurationSeconds() {
        return pausedDurationSeconds;
    }
    
    public void setPausedDurationSeconds(Integer pausedDurationSeconds) {
        this.pausedDurationSeconds = pausedDurationSeconds;
    }
    
    public CookingStatus getStatus() {
        return status;
    }
    
    public void setStatus(CookingStatus status) {
        this.status = status;
    }
    
    public CookingStage getStage() {
        return stage;
    }
    
    public void setStage(CookingStage stage) {
        this.stage = stage;
    }
    
    public WorkstationType getWorkstationType() {
        return workstationType;
    }
    
    public void setWorkstationType(WorkstationType workstationType) {
        this.workstationType = workstationType;
    }
    
    public String getWorkstationId() {
        return workstationId;
    }
    
    public void setWorkstationId(String workstationId) {
        this.workstationId = workstationId;
    }
    
    public Integer getAlertsSent() {
        return alertsSent;
    }
    
    public void setAlertsSent(Integer alertsSent) {
        this.alertsSent = alertsSent;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Double getTemperatureTarget() {
        return temperatureTarget;
    }
    
    public void setTemperatureTarget(Double temperatureTarget) {
        this.temperatureTarget = temperatureTarget;
    }
    
    public Double getQualityScore() {
        return qualityScore;
    }
    
    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Long getVersion() {
        return version;
    }
    
    public void setVersion(Long version) {
        this.version = version;
    }
    
    @Override
    public String toString() {
        return "CookingTimer{" +
                "timerId='" + timerId + '\'' +
                ", orderId='" + (order != null ? order.getOrderId() : null) + '\'' +
                ", status=" + status +
                ", stage=" + stage +
                ", workstationId='" + workstationId + '\'' +
                ", elapsedSeconds=" + getElapsedSeconds() +
                ", remainingSeconds=" + getRemainingSeconds() +
                ", progressPercentage=" + getProgressPercentage() +
                '}';
    }
}