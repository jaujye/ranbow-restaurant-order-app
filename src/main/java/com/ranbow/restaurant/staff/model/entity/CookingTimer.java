package com.ranbow.restaurant.staff.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.UUID;

/**
 * Cooking Timer Entity for Kitchen Time Management
 * Tracks cooking times, stages, and alerts for individual order items
 */
@Entity
@Table(name = "cooking_timers", indexes = {
    @Index(name = "idx_order_id", columnList = "orderId"),
    @Index(name = "idx_staff_id", columnList = "staffId"),
    @Index(name = "idx_timer_status", columnList = "timerStatus"),
    @Index(name = "idx_started_at", columnList = "startedAt"),
    @Index(name = "idx_estimated_completion", columnList = "estimatedCompletionTime")
})
public class CookingTimer {
    
    @Id
    @Column(name = "timer_id", updatable = false, nullable = false)
    private String timerId;
    
    @NotNull(message = "Order ID is required")
    @Column(name = "order_id", nullable = false)
    private String orderId;
    
    @NotNull(message = "Staff ID is required")
    @Column(name = "staff_id", nullable = false)
    private String staffId;
    
    @NotNull(message = "Menu item ID is required")
    @Column(name = "menu_item_id", nullable = false)
    private String menuItemId;
    
    @Column(name = "menu_item_name", length = 100)
    private String menuItemName;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @NotNull(message = "Cooking stage is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "cooking_stage", nullable = false, length = 20)
    private CookingStage cookingStage = CookingStage.PREP;
    
    @NotNull(message = "Timer status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "timer_status", nullable = false, length = 20)
    private TimerStatus timerStatus = TimerStatus.READY;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "paused_at")
    private LocalDateTime pausedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "estimated_duration_minutes", nullable = false)
    private Integer estimatedDurationMinutes;
    
    @Column(name = "estimated_completion_time")
    private LocalDateTime estimatedCompletionTime;
    
    @Column(name = "actual_duration_minutes")
    private Integer actualDurationMinutes;
    
    @Column(name = "total_paused_minutes", nullable = false)
    private Integer totalPausedMinutes = 0;
    
    @Column(name = "alert_sent_at")
    private LocalDateTime alertSentAt;
    
    @Column(name = "alert_threshold_minutes", nullable = false)
    private Integer alertThresholdMinutes;
    
    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;
    
    @Column(name = "temperature_celsius")
    private Integer temperatureCelsius;
    
    @Column(name = "cooking_method", length = 50)
    private String cookingMethod;
    
    @Column(name = "notes", length = 1000)
    private String notes;
    
    @Column(name = "quality_check_passed")
    private Boolean qualityCheckPassed;
    
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
    
    public CookingTimer(String orderId, String staffId, String menuItemId, 
                       String menuItemName, Integer quantity, Integer estimatedDurationMinutes) {
        this();
        this.orderId = orderId;
        this.staffId = staffId;
        this.menuItemId = menuItemId;
        this.menuItemName = menuItemName;
        this.quantity = quantity;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        this.alertThresholdMinutes = Math.max(1, estimatedDurationMinutes - 2);
    }
    
    // Business Methods
    public void startTimer() {
        this.startedAt = LocalDateTime.now();
        this.timerStatus = TimerStatus.RUNNING;
        this.cookingStage = CookingStage.COOKING;
        this.estimatedCompletionTime = startedAt.plusMinutes(estimatedDurationMinutes);
        this.updatedAt = LocalDateTime.now();
    }
    
    public void pauseTimer() {
        if (timerStatus == TimerStatus.RUNNING) {
            this.pausedAt = LocalDateTime.now();
            this.timerStatus = TimerStatus.PAUSED;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    public void resumeTimer() {
        if (timerStatus == TimerStatus.PAUSED && pausedAt != null) {
            Duration pauseDuration = Duration.between(pausedAt, LocalDateTime.now());
            this.totalPausedMinutes += (int) pauseDuration.toMinutes();
            
            // Adjust estimated completion time
            if (estimatedCompletionTime != null) {
                this.estimatedCompletionTime = estimatedCompletionTime.plus(pauseDuration);
            }
            
            this.pausedAt = null;
            this.timerStatus = TimerStatus.RUNNING;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    public void completeTimer() {
        this.completedAt = LocalDateTime.now();
        this.timerStatus = TimerStatus.COMPLETED;
        this.cookingStage = CookingStage.PLATING;
        this.calculateActualDuration();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void cancelTimer(String reason) {
        this.timerStatus = TimerStatus.CANCELLED;
        this.notes = (notes != null ? notes + "; " : "") + "Cancelled: " + reason;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void resetTimer() {
        this.startedAt = null;
        this.pausedAt = null;
        this.completedAt = null;
        this.totalPausedMinutes = 0;
        this.actualDurationMinutes = null;
        this.timerStatus = TimerStatus.READY;
        this.cookingStage = CookingStage.PREP;
        this.alertSentAt = null;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void advanceToCookingStage(CookingStage newStage) {
        if (newStage.getStageOrder() > this.cookingStage.getStageOrder()) {
            this.cookingStage = newStage;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    public void sendAlert() {
        this.alertSentAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    private void calculateActualDuration() {
        if (startedAt != null && completedAt != null) {
            Duration totalDuration = Duration.between(startedAt, completedAt);
            this.actualDurationMinutes = (int) totalDuration.toMinutes() - totalPausedMinutes;
        }
    }
    
    public boolean isOverdue() {
        if (estimatedCompletionTime == null || isCompleted()) return false;
        return LocalDateTime.now().isAfter(estimatedCompletionTime);
    }
    
    public boolean needsAlert() {
        if (alertSentAt != null || !isRunning() || estimatedCompletionTime == null) return false;
        LocalDateTime alertTime = estimatedCompletionTime.minusMinutes(alertThresholdMinutes);
        return LocalDateTime.now().isAfter(alertTime);
    }
    
    public boolean isRunning() {
        return timerStatus == TimerStatus.RUNNING;
    }
    
    public boolean isPaused() {
        return timerStatus == TimerStatus.PAUSED;
    }
    
    public boolean isCompleted() {
        return timerStatus == TimerStatus.COMPLETED;
    }
    
    public Duration getRemainingTime() {
        if (estimatedCompletionTime == null || isCompleted()) return Duration.ZERO;
        Duration remaining = Duration.between(LocalDateTime.now(), estimatedCompletionTime);
        return remaining.isNegative() ? Duration.ZERO : remaining;
    }
    
    public Duration getElapsedTime() {
        if (startedAt == null) return Duration.ZERO;
        LocalDateTime endTime = completedAt != null ? completedAt : LocalDateTime.now();
        return Duration.between(startedAt, endTime).minusMinutes(totalPausedMinutes);
    }
    
    public double getProgressPercentage() {
        if (estimatedDurationMinutes == 0 || startedAt == null) return 0.0;
        
        long elapsedMinutes = getElapsedTime().toMinutes();
        double progress = (double) elapsedMinutes / estimatedDurationMinutes;
        return Math.min(100.0, Math.max(0.0, progress * 100));
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
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
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public String getMenuItemId() {
        return menuItemId;
    }
    
    public void setMenuItemId(String menuItemId) {
        this.menuItemId = menuItemId;
    }
    
    public String getMenuItemName() {
        return menuItemName;
    }
    
    public void setMenuItemName(String menuItemName) {
        this.menuItemName = menuItemName;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public CookingStage getCookingStage() {
        return cookingStage;
    }
    
    public void setCookingStage(CookingStage cookingStage) {
        this.cookingStage = cookingStage;
    }
    
    public TimerStatus getTimerStatus() {
        return timerStatus;
    }
    
    public void setTimerStatus(TimerStatus timerStatus) {
        this.timerStatus = timerStatus;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getPausedAt() {
        return pausedAt;
    }
    
    public void setPausedAt(LocalDateTime pausedAt) {
        this.pausedAt = pausedAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }
    
    public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) {
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }
    
    public LocalDateTime getEstimatedCompletionTime() {
        return estimatedCompletionTime;
    }
    
    public void setEstimatedCompletionTime(LocalDateTime estimatedCompletionTime) {
        this.estimatedCompletionTime = estimatedCompletionTime;
    }
    
    public Integer getActualDurationMinutes() {
        return actualDurationMinutes;
    }
    
    public void setActualDurationMinutes(Integer actualDurationMinutes) {
        this.actualDurationMinutes = actualDurationMinutes;
    }
    
    public Integer getTotalPausedMinutes() {
        return totalPausedMinutes;
    }
    
    public void setTotalPausedMinutes(Integer totalPausedMinutes) {
        this.totalPausedMinutes = totalPausedMinutes;
    }
    
    public LocalDateTime getAlertSentAt() {
        return alertSentAt;
    }
    
    public void setAlertSentAt(LocalDateTime alertSentAt) {
        this.alertSentAt = alertSentAt;
    }
    
    public Integer getAlertThresholdMinutes() {
        return alertThresholdMinutes;
    }
    
    public void setAlertThresholdMinutes(Integer alertThresholdMinutes) {
        this.alertThresholdMinutes = alertThresholdMinutes;
    }
    
    public String getSpecialInstructions() {
        return specialInstructions;
    }
    
    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
    
    public Integer getTemperatureCelsius() {
        return temperatureCelsius;
    }
    
    public void setTemperatureCelsius(Integer temperatureCelsius) {
        this.temperatureCelsius = temperatureCelsius;
    }
    
    public String getCookingMethod() {
        return cookingMethod;
    }
    
    public void setCookingMethod(String cookingMethod) {
        this.cookingMethod = cookingMethod;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Boolean getQualityCheckPassed() {
        return qualityCheckPassed;
    }
    
    public void setQualityCheckPassed(Boolean qualityCheckPassed) {
        this.qualityCheckPassed = qualityCheckPassed;
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
                ", orderId='" + orderId + '\'' +
                ", menuItemName='" + menuItemName + '\'' +
                ", quantity=" + quantity +
                ", cookingStage=" + cookingStage +
                ", timerStatus=" + timerStatus +
                ", estimatedDurationMinutes=" + estimatedDurationMinutes +
                ", startedAt=" + startedAt +
                ", completedAt=" + completedAt +
                '}';
    }
}