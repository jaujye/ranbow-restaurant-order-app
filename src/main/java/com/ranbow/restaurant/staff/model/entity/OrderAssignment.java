package com.ranbow.restaurant.staff.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.UUID;

/**
 * Order Assignment Entity
 * Tracks assignment of orders to staff members and their progress
 */
@Entity
@Table(name = "order_assignments", indexes = {
    @Index(name = "idx_order_id", columnList = "orderId"),
    @Index(name = "idx_staff_id", columnList = "staffId"),
    @Index(name = "idx_assignment_status", columnList = "assignmentStatus"),
    @Index(name = "idx_assigned_at", columnList = "assignedAt"),
    @Index(name = "idx_priority", columnList = "priority")
})
public class OrderAssignment {
    
    @Id
    @Column(name = "assignment_id", updatable = false, nullable = false)
    private String assignmentId;
    
    @NotNull(message = "Order ID is required")
    @Column(name = "order_id", nullable = false)
    private String orderId;
    
    @NotNull(message = "Staff ID is required")
    @Column(name = "staff_id", nullable = false)
    private String staffId;
    
    @NotNull(message = "Assignment type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", nullable = false, length = 20)
    private AssignmentType assignmentType;
    
    @NotNull(message = "Assignment status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_status", nullable = false, length = 20)
    private AssignmentStatus assignmentStatus = AssignmentStatus.ASSIGNED;
    
    @NotNull(message = "Priority is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 10)
    private OrderPriority priority = OrderPriority.NORMAL;
    
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "estimated_completion_time")
    private LocalDateTime estimatedCompletionTime;
    
    @Column(name = "actual_duration_minutes")
    private Integer actualDurationMinutes;
    
    @Column(name = "assigned_by_staff_id")
    private String assignedByStaffId;
    
    @Column(name = "notes", length = 500)
    private String notes;
    
    @Column(name = "quality_score", columnDefinition = "DECIMAL(3,2)")
    private Double qualityScore;
    
    @Column(name = "customer_feedback", length = 1000)
    private String customerFeedback;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    @Column(name = "version")
    private Long version;
    
    // Constructors
    public OrderAssignment() {
        this.assignmentId = UUID.randomUUID().toString();
        this.assignedAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public OrderAssignment(String orderId, String staffId, AssignmentType assignmentType) {
        this();
        this.orderId = orderId;
        this.staffId = staffId;
        this.assignmentType = assignmentType;
    }
    
    public OrderAssignment(String orderId, String staffId, AssignmentType assignmentType, 
                          String assignedByStaffId) {
        this(orderId, staffId, assignmentType);
        this.assignedByStaffId = assignedByStaffId;
    }
    
    // Business Methods
    public void startWork() {
        this.startedAt = LocalDateTime.now();
        this.assignmentStatus = AssignmentStatus.IN_PROGRESS;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void complete() {
        this.completedAt = LocalDateTime.now();
        this.assignmentStatus = AssignmentStatus.COMPLETED;
        this.calculateActualDuration();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void cancel(String reason) {
        this.assignmentStatus = AssignmentStatus.CANCELLED;
        this.notes = (notes != null ? notes + "; " : "") + "Cancelled: " + reason;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void reassign(String newStaffId, String reassignedByStaffId) {
        this.staffId = newStaffId;
        this.assignedByStaffId = reassignedByStaffId;
        this.assignedAt = LocalDateTime.now();
        this.assignmentStatus = AssignmentStatus.ASSIGNED;
        this.startedAt = null;
        this.notes = (notes != null ? notes + "; " : "") + "Reassigned at " + LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void setPriority(OrderPriority newPriority) {
        this.priority = newPriority;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void setEstimatedCompletionTime(int estimatedMinutes) {
        LocalDateTime baseTime = startedAt != null ? startedAt : assignedAt;
        this.estimatedCompletionTime = baseTime.plusMinutes(estimatedMinutes);
        this.updatedAt = LocalDateTime.now();
    }
    
    private void calculateActualDuration() {
        if (startedAt != null && completedAt != null) {
            Duration duration = Duration.between(startedAt, completedAt);
            this.actualDurationMinutes = (int) duration.toMinutes();
        }
    }
    
    public boolean isOverdue() {
        if (estimatedCompletionTime == null || isCompleted()) return false;
        return LocalDateTime.now().isAfter(estimatedCompletionTime);
    }
    
    public boolean isCompleted() {
        return assignmentStatus == AssignmentStatus.COMPLETED;
    }
    
    public boolean isInProgress() {
        return assignmentStatus == AssignmentStatus.IN_PROGRESS;
    }
    
    public boolean isHighPriority() {
        return priority == OrderPriority.HIGH || priority == OrderPriority.URGENT;
    }
    
    public Duration getTimeSpentSoFar() {
        if (startedAt == null) return Duration.ZERO;
        LocalDateTime endTime = completedAt != null ? completedAt : LocalDateTime.now();
        return Duration.between(startedAt, endTime);
    }
    
    public Duration getTimeSinceAssigned() {
        return Duration.between(assignedAt, LocalDateTime.now());
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getAssignmentId() {
        return assignmentId;
    }
    
    public void setAssignmentId(String assignmentId) {
        this.assignmentId = assignmentId;
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
    
    public AssignmentType getAssignmentType() {
        return assignmentType;
    }
    
    public void setAssignmentType(AssignmentType assignmentType) {
        this.assignmentType = assignmentType;
    }
    
    public AssignmentStatus getAssignmentStatus() {
        return assignmentStatus;
    }
    
    public void setAssignmentStatus(AssignmentStatus assignmentStatus) {
        this.assignmentStatus = assignmentStatus;
    }
    
    public OrderPriority getPriority() {
        return priority;
    }
    
    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
    
    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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
    
    public String getAssignedByStaffId() {
        return assignedByStaffId;
    }
    
    public void setAssignedByStaffId(String assignedByStaffId) {
        this.assignedByStaffId = assignedByStaffId;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Double getQualityScore() {
        return qualityScore;
    }
    
    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }
    
    public String getCustomerFeedback() {
        return customerFeedback;
    }
    
    public void setCustomerFeedback(String customerFeedback) {
        this.customerFeedback = customerFeedback;
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
        return "OrderAssignment{" +
                "assignmentId='" + assignmentId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", staffId='" + staffId + '\'' +
                ", assignmentType=" + assignmentType +
                ", assignmentStatus=" + assignmentStatus +
                ", priority=" + priority +
                ", assignedAt=" + assignedAt +
                ", startedAt=" + startedAt +
                ", completedAt=" + completedAt +
                '}';
    }
}