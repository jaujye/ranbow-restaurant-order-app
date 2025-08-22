package com.ranbow.restaurant.staff.model.entity;

/**
 * Timer Status Enumeration
 * Represents the current status of a cooking timer
 */
public enum TimerStatus {
    READY("Ready", "Timer is ready to be started"),
    RUNNING("Running", "Timer is currently running"),
    PAUSED("Paused", "Timer has been paused"),
    COMPLETED("Completed", "Timer has completed successfully"),
    CANCELLED("Cancelled", "Timer was cancelled"),
    OVERDUE("Overdue", "Timer has exceeded expected completion time"),
    ALERT("Alert", "Timer requires immediate attention");
    
    private final String displayName;
    private final String description;
    
    TimerStatus(String displayName, String description) {
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
     * Check if the timer is currently active
     */
    public boolean isActive() {
        return this == RUNNING || this == PAUSED || this == ALERT;
    }
    
    /**
     * Check if the timer is finished
     */
    public boolean isFinished() {
        return this == COMPLETED || this == CANCELLED;
    }
    
    /**
     * Check if the timer requires attention
     */
    public boolean requiresAttention() {
        return this == OVERDUE || this == ALERT;
    }
    
    /**
     * Check if the timer can be started
     */
    public boolean canBeStarted() {
        return this == READY || this == PAUSED;
    }
    
    /**
     * Check if the timer can be paused
     */
    public boolean canBePaused() {
        return this == RUNNING || this == ALERT;
    }
    
    /**
     * Check if the timer can be completed
     */
    public boolean canBeCompleted() {
        return this == RUNNING || this == PAUSED || this == ALERT || this == OVERDUE;
    }
    
    /**
     * Get the next allowed status transitions
     */
    public TimerStatus[] getAllowedTransitions() {
        return switch (this) {
            case READY -> new TimerStatus[]{RUNNING, CANCELLED};
            case RUNNING -> new TimerStatus[]{PAUSED, COMPLETED, CANCELLED, OVERDUE, ALERT};
            case PAUSED -> new TimerStatus[]{RUNNING, COMPLETED, CANCELLED, OVERDUE};
            case ALERT -> new TimerStatus[]{RUNNING, PAUSED, COMPLETED, CANCELLED, OVERDUE};
            case OVERDUE -> new TimerStatus[]{RUNNING, PAUSED, COMPLETED, CANCELLED, ALERT};
            case COMPLETED, CANCELLED -> new TimerStatus[]{}; // Terminal states
        };
    }
    
    /**
     * Check if transition to another status is allowed
     */
    public boolean canTransitionTo(TimerStatus newStatus) {
        TimerStatus[] allowed = getAllowedTransitions();
        for (TimerStatus status : allowed) {
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
            case READY -> "timer-ready";
            case RUNNING -> "timer-running";
            case PAUSED -> "timer-paused";
            case COMPLETED -> "timer-completed";
            case CANCELLED -> "timer-cancelled";
            case OVERDUE -> "timer-overdue";
            case ALERT -> "timer-alert";
        };
    }
    
    /**
     * Get color code for UI display
     */
    public String getColorCode() {
        return switch (this) {
            case READY -> "#6c757d";      // Gray
            case RUNNING -> "#17a2b8";    // Blue
            case PAUSED -> "#ffc107";     // Yellow
            case COMPLETED -> "#28a745";  // Green
            case CANCELLED -> "#6c757d";  // Gray
            case OVERDUE -> "#dc3545";    // Red
            case ALERT -> "#fd7e14";      // Orange
        };
    }
    
    /**
     * Get icon class for UI display
     */
    public String getIconClass() {
        return switch (this) {
            case READY -> "fa-clock";
            case RUNNING -> "fa-play";
            case PAUSED -> "fa-pause";
            case COMPLETED -> "fa-check";
            case CANCELLED -> "fa-times";
            case OVERDUE -> "fa-exclamation-triangle";
            case ALERT -> "fa-bell";
        };
    }
    
    /**
     * Get priority level for sorting (higher number = higher priority)
     */
    public int getPriorityLevel() {
        return switch (this) {
            case ALERT -> 5;
            case OVERDUE -> 4;
            case RUNNING -> 3;
            case PAUSED -> 2;
            case READY -> 1;
            case COMPLETED, CANCELLED -> 0;
        };
    }
}