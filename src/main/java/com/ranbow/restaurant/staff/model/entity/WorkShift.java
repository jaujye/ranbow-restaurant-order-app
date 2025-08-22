package com.ranbow.restaurant.staff.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.UUID;

/**
 * Work Shift Entity for Staff Time Tracking
 * Tracks actual work hours and shift performance
 */
@Entity
@Table(name = "work_shifts", indexes = {
    @Index(name = "idx_staff_id", columnList = "staffId"),
    @Index(name = "idx_shift_date", columnList = "shiftDate"),
    @Index(name = "idx_shift_status", columnList = "shiftStatus"),
    @Index(name = "idx_started_at", columnList = "actualStartTime")
})
public class WorkShift {
    
    @Id
    @Column(name = "shift_id", updatable = false, nullable = false)
    private String shiftId;
    
    @NotNull(message = "Staff ID is required")
    @Column(name = "staff_id", nullable = false)
    private String staffId;
    
    @NotNull(message = "Shift date is required")
    @Column(name = "shift_date", nullable = false)
    private LocalDateTime shiftDate;
    
    @Column(name = "scheduled_start_time")
    private LocalDateTime scheduledStartTime;
    
    @Column(name = "scheduled_end_time")
    private LocalDateTime scheduledEndTime;
    
    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;
    
    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;
    
    @NotNull(message = "Shift status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "shift_status", nullable = false, length = 20)
    private ShiftStatus shiftStatus = ShiftStatus.SCHEDULED;
    
    @Column(name = "orders_processed", nullable = false)
    private Integer ordersProcessed = 0;
    
    @Column(name = "break_minutes", nullable = false)
    private Integer breakMinutes = 0;
    
    @Column(name = "overtime_minutes", nullable = false)
    private Integer overtimeMinutes = 0;
    
    @Column(name = "performance_score", columnDefinition = "DECIMAL(3,2)")
    private Double performanceScore;
    
    @Column(name = "notes", length = 500)
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    @Column(name = "version")
    private Long version;
    
    // Constructors
    public WorkShift() {
        this.shiftId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public WorkShift(String staffId, LocalDateTime scheduledStartTime, LocalDateTime scheduledEndTime) {
        this();
        this.staffId = staffId;
        this.shiftDate = scheduledStartTime.toLocalDate().atStartOfDay();
        this.scheduledStartTime = scheduledStartTime;
        this.scheduledEndTime = scheduledEndTime;
    }
    
    // Business Methods
    public void startShift() {
        this.actualStartTime = LocalDateTime.now();
        this.shiftStatus = ShiftStatus.IN_PROGRESS;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void endShift() {
        this.actualEndTime = LocalDateTime.now();
        this.shiftStatus = ShiftStatus.COMPLETED;
        this.calculateOvertimeMinutes();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void pauseShift() {
        this.shiftStatus = ShiftStatus.ON_BREAK;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void resumeShift() {
        this.shiftStatus = ShiftStatus.IN_PROGRESS;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void cancelShift(String reason) {
        this.shiftStatus = ShiftStatus.CANCELLED;
        this.notes = (notes != null ? notes + "; " : "") + "Cancelled: " + reason;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void incrementOrdersProcessed() {
        this.ordersProcessed++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void addBreakTime(int minutes) {
        this.breakMinutes += minutes;
        this.updatedAt = LocalDateTime.now();
    }
    
    private void calculateOvertimeMinutes() {
        if (actualStartTime != null && actualEndTime != null && scheduledEndTime != null) {
            Duration actualDuration = Duration.between(actualStartTime, actualEndTime);
            Duration scheduledDuration = Duration.between(scheduledStartTime, scheduledEndTime);
            
            long overtimeMinutesLong = actualDuration.toMinutes() - scheduledDuration.toMinutes();
            this.overtimeMinutes = Math.max(0, (int) overtimeMinutesLong);
        }
    }
    
    public Duration getActualWorkDuration() {
        if (actualStartTime == null) return Duration.ZERO;
        LocalDateTime endTime = actualEndTime != null ? actualEndTime : LocalDateTime.now();
        return Duration.between(actualStartTime, endTime);
    }
    
    public Duration getScheduledDuration() {
        if (scheduledStartTime == null || scheduledEndTime == null) return Duration.ZERO;
        return Duration.between(scheduledStartTime, scheduledEndTime);
    }
    
    public boolean isLate() {
        return actualStartTime != null && scheduledStartTime != null &&
               actualStartTime.isAfter(scheduledStartTime.plusMinutes(5));
    }
    
    public boolean isOvertime() {
        return overtimeMinutes > 0;
    }
    
    public double calculateEfficiencyScore() {
        if (getActualWorkDuration().isZero() || ordersProcessed == 0) return 0.0;
        
        // Basic efficiency calculation: orders per hour
        double hoursWorked = getActualWorkDuration().toMinutes() / 60.0;
        double ordersPerHour = ordersProcessed / hoursWorked;
        
        // Normalize to 0-1 scale (assuming 10 orders per hour is excellent)
        return Math.min(1.0, ordersPerHour / 10.0);
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getShiftId() {
        return shiftId;
    }
    
    public void setShiftId(String shiftId) {
        this.shiftId = shiftId;
    }
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public LocalDateTime getShiftDate() {
        return shiftDate;
    }
    
    public void setShiftDate(LocalDateTime shiftDate) {
        this.shiftDate = shiftDate;
    }
    
    public LocalDateTime getScheduledStartTime() {
        return scheduledStartTime;
    }
    
    public void setScheduledStartTime(LocalDateTime scheduledStartTime) {
        this.scheduledStartTime = scheduledStartTime;
    }
    
    public LocalDateTime getScheduledEndTime() {
        return scheduledEndTime;
    }
    
    public void setScheduledEndTime(LocalDateTime scheduledEndTime) {
        this.scheduledEndTime = scheduledEndTime;
    }
    
    public LocalDateTime getActualStartTime() {
        return actualStartTime;
    }
    
    public void setActualStartTime(LocalDateTime actualStartTime) {
        this.actualStartTime = actualStartTime;
    }
    
    public LocalDateTime getActualEndTime() {
        return actualEndTime;
    }
    
    public void setActualEndTime(LocalDateTime actualEndTime) {
        this.actualEndTime = actualEndTime;
    }
    
    public ShiftStatus getShiftStatus() {
        return shiftStatus;
    }
    
    public void setShiftStatus(ShiftStatus shiftStatus) {
        this.shiftStatus = shiftStatus;
    }
    
    public Integer getOrdersProcessed() {
        return ordersProcessed;
    }
    
    public void setOrdersProcessed(Integer ordersProcessed) {
        this.ordersProcessed = ordersProcessed;
    }
    
    public Integer getBreakMinutes() {
        return breakMinutes;
    }
    
    public void setBreakMinutes(Integer breakMinutes) {
        this.breakMinutes = breakMinutes;
    }
    
    public Integer getOvertimeMinutes() {
        return overtimeMinutes;
    }
    
    public void setOvertimeMinutes(Integer overtimeMinutes) {
        this.overtimeMinutes = overtimeMinutes;
    }
    
    public Double getPerformanceScore() {
        return performanceScore;
    }
    
    public void setPerformanceScore(Double performanceScore) {
        this.performanceScore = performanceScore;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
        return "WorkShift{" +
                "shiftId='" + shiftId + '\'' +
                ", staffId='" + staffId + '\'' +
                ", shiftDate=" + shiftDate +
                ", shiftStatus=" + shiftStatus +
                ", ordersProcessed=" + ordersProcessed +
                ", actualStartTime=" + actualStartTime +
                ", actualEndTime=" + actualEndTime +
                '}';
    }
}