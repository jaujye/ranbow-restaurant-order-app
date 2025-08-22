package com.ranbow.restaurant.staff.model.entity;

/**
 * Assignment Status Enumeration
 * Tracks the current status of an order assignment
 */
public enum AssignmentStatus {
    ASSIGNED("Assigned", "Task has been assigned to staff member"),
    ACCEPTED("Accepted", "Staff member has accepted the assignment"),
    IN_PROGRESS("In Progress", "Staff member is actively working on the task"),
    PAUSED("Paused", "Work has been temporarily paused"),
    COMPLETED("Completed", "Task has been completed successfully"),
    CANCELLED("Cancelled", "Assignment was cancelled"),
    REJECTED("Rejected", "Staff member rejected the assignment"),
    OVERDUE("Overdue", "Assignment is past its estimated completion time"),
    QUALITY_ISSUE("Quality Issue", "Quality check failed, needs rework");
    
    private final String displayName;
    private final String description;
    
    AssignmentStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Check if the assignment is currently active
     */
    public boolean isActive() {
        return this == ACCEPTED || this == IN_PROGRESS || this == PAUSED;
    }
    
    /**
     * Check if the assignment is finished
     */
    public boolean isFinished() {
        return this == COMPLETED || this == CANCELLED || this == REJECTED;
    }
    
    /**
     * Check if the assignment requires attention
     */
    public boolean requiresAttention() {
        return this == OVERDUE || this == QUALITY_ISSUE || this == REJECTED;
    }
    
    /**
     * Check if the assignment can be started
     */
    public boolean canBeStarted() {
        return this == ASSIGNED || this == ACCEPTED || this == PAUSED;
    }
    
    /**
     * Get the next allowed status transitions
     */
    public AssignmentStatus[] getAllowedTransitions() {
        return switch (this) {
            case ASSIGNED -> new AssignmentStatus[]{ACCEPTED, REJECTED, CANCELLED, IN_PROGRESS};
            case ACCEPTED -> new AssignmentStatus[]{IN_PROGRESS, CANCELLED, REJECTED};
            case IN_PROGRESS -> new AssignmentStatus[]{COMPLETED, PAUSED, CANCELLED, QUALITY_ISSUE, OVERDUE};
            case PAUSED -> new AssignmentStatus[]{IN_PROGRESS, CANCELLED, OVERDUE};
            case OVERDUE -> new AssignmentStatus[]{IN_PROGRESS, COMPLETED, CANCELLED};
            case QUALITY_ISSUE -> new AssignmentStatus[]{IN_PROGRESS, CANCELLED};
            case COMPLETED, CANCELLED, REJECTED -> new AssignmentStatus[]{}; // Terminal states
        };
    }
    
    /**
     * Check if transition to another status is allowed
     */
    public boolean canTransitionTo(AssignmentStatus newStatus) {
        AssignmentStatus[] allowed = getAllowedTransitions();
        for (AssignmentStatus status : allowed) {
            if (status == newStatus) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get CSS class for UI styling
     */
    public String getCssClass() {
        return switch (this) {
            case ASSIGNED, ACCEPTED -> "status-pending";
            case IN_PROGRESS -> "status-active";
            case PAUSED -> "status-warning";
            case COMPLETED -> "status-success";
            case CANCELLED, REJECTED -> "status-cancelled";
            case OVERDUE, QUALITY_ISSUE -> "status-error";
        };
    }
}