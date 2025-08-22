package com.ranbow.restaurant.staff.model.entity;

/**
 * Shift Status Enumeration
 * Represents the current status of a work shift
 */
public enum ShiftStatus {
    SCHEDULED("Scheduled", "Shift is scheduled but not yet started"),
    IN_PROGRESS("In Progress", "Staff member is currently working"),
    ON_BREAK("On Break", "Staff member is on break during shift"),
    COMPLETED("Completed", "Shift has been completed successfully"),
    CANCELLED("Cancelled", "Shift was cancelled before or during work"),
    NO_SHOW("No Show", "Staff member did not show up for scheduled shift"),
    EARLY_LEAVE("Early Leave", "Staff member left before scheduled end time");
    
    private final String displayName;
    private final String description;
    
    ShiftStatus(String displayName, String description) {
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
     * Check if the shift is currently active
     */
    public boolean isActive() {
        return this == IN_PROGRESS || this == ON_BREAK;
    }
    
    /**
     * Check if the shift is finished (completed or terminated)
     */
    public boolean isFinished() {
        return this == COMPLETED || this == CANCELLED || 
               this == NO_SHOW || this == EARLY_LEAVE;
    }
    
    /**
     * Check if the shift status indicates a problem
     */
    public boolean isProblematic() {
        return this == CANCELLED || this == NO_SHOW || this == EARLY_LEAVE;
    }
    
    /**
     * Get the next allowed status transitions
     */
    public ShiftStatus[] getAllowedTransitions() {
        return switch (this) {
            case SCHEDULED -> new ShiftStatus[]{IN_PROGRESS, CANCELLED, NO_SHOW};
            case IN_PROGRESS -> new ShiftStatus[]{ON_BREAK, COMPLETED, EARLY_LEAVE, CANCELLED};
            case ON_BREAK -> new ShiftStatus[]{IN_PROGRESS, COMPLETED, EARLY_LEAVE, CANCELLED};
            case COMPLETED, CANCELLED, NO_SHOW, EARLY_LEAVE -> new ShiftStatus[]{}; // Terminal states
        };
    }
    
    /**
     * Check if transition to another status is allowed
     */
    public boolean canTransitionTo(ShiftStatus newStatus) {
        ShiftStatus[] allowed = getAllowedTransitions();
        for (ShiftStatus status : allowed) {
            if (status == newStatus) {
                return true;
            }
        }
        return false;
    }
}