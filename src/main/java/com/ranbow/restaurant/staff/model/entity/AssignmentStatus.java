package com.ranbow.restaurant.staff.model.entity;

/**
 * Assignment Status Enumeration
 * Defines the current status of order assignments
 */
public enum AssignmentStatus {
    /**
     * Assignment has been created but work hasn't started
     */
    ASSIGNED("Assigned", "Assignment created, work not yet started"),
    
    /**
     * Work on the assignment has started
     */
    IN_PROGRESS("In Progress", "Staff member is actively working on the assignment"),
    
    /**
     * Assignment work is temporarily paused
     */
    PAUSED("Paused", "Work has been temporarily suspended"),
    
    /**
     * Assignment has been completed successfully
     */
    COMPLETED("Completed", "Assignment work has been finished"),
    
    /**
     * Assignment has been cancelled
     */
    CANCELLED("Cancelled", "Assignment has been cancelled before completion"),
    
    /**
     * Assignment has been reassigned to another staff member
     */
    REASSIGNED("Reassigned", "Assignment has been moved to another staff member"),
    
    /**
     * Assignment is overdue and requires attention
     */
    OVERDUE("Overdue", "Assignment has exceeded expected completion time");
    
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
     * Check if this is an active status (work can continue)
     */
    public boolean isActive() {
        return this == ASSIGNED || this == IN_PROGRESS || this == PAUSED;
    }
    
    /**
     * Check if this is a terminal status (no further work expected)
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED || this == REASSIGNED;
    }
    
    /**
     * Check if this status requires attention
     */
    public boolean requiresAttention() {
        return this == OVERDUE || this == PAUSED;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}