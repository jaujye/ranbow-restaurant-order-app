package com.ranbow.restaurant.staff.model.dto;

/**
 * Message Priority Levels for Staff Communication System
 * 
 * Defines priority levels for WebSocket messages to ensure critical
 * communications are handled appropriately. Higher priority messages
 * may trigger different behaviors such as push notifications, alerts,
 * or different UI treatments.
 */
public enum MessagePriority {
    
    /**
     * Low priority - Background information, routine updates
     * Examples: Heartbeat messages, routine status updates
     * UI Treatment: Normal display, no special alerts
     * Sound: None
     * Persistence: May be discarded if queue is full
     */
    LOW(1, "Low Priority", false, false),
    
    /**
     * Normal priority - Standard operational messages
     * Examples: Order updates, staff messages, timer updates
     * UI Treatment: Standard notification display
     * Sound: Standard notification sound
     * Persistence: Standard retention period
     */
    NORMAL(2, "Normal Priority", true, false),
    
    /**
     * High priority - Important operational events
     * Examples: New orders, kitchen alerts, capacity warnings
     * UI Treatment: Prominent display, attention-getting visuals
     * Sound: Alert sound
     * Persistence: Extended retention, requires user interaction
     */
    HIGH(3, "High Priority", true, true),
    
    /**
     * Urgent priority - Critical events requiring immediate attention
     * Examples: Emergency alerts, system failures, urgent orders
     * UI Treatment: Modal alerts, flashing indicators, prominent display
     * Sound: Urgent alarm sound, may repeat
     * Persistence: Persisted until acknowledged, may escalate
     */
    URGENT(4, "Urgent Priority", true, true);
    
    private final int level;
    private final String displayName;
    private final boolean showNotification;
    private final boolean requiresAttention;
    
    MessagePriority(int level, String displayName, boolean showNotification, boolean requiresAttention) {
        this.level = level;
        this.displayName = displayName;
        this.showNotification = showNotification;
        this.requiresAttention = requiresAttention;
    }
    
    public int getLevel() {
        return level;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean shouldShowNotification() {
        return showNotification;
    }
    
    public boolean requiresAttention() {
        return requiresAttention;
    }
    
    /**
     * Check if this priority is higher than another
     */
    public boolean isHigherThan(MessagePriority other) {
        return this.level > other.level;
    }
    
    /**
     * Check if this priority is lower than another
     */
    public boolean isLowerThan(MessagePriority other) {
        return this.level < other.level;
    }
    
    /**
     * Check if this priority is at least as high as another
     */
    public boolean isAtLeast(MessagePriority other) {
        return this.level >= other.level;
    }
    
    /**
     * Get recommended timeout in seconds for messages of this priority
     */
    public int getRecommendedTimeoutSeconds() {
        return switch (this) {
            case LOW -> 30;      // 30 seconds
            case NORMAL -> 300;   // 5 minutes  
            case HIGH -> 900;     // 15 minutes
            case URGENT -> 1800;  // 30 minutes
        };
    }
    
    /**
     * Get recommended retry count for message delivery
     */
    public int getRecommendedRetryCount() {
        return switch (this) {
            case LOW -> 1;        // Single attempt
            case NORMAL -> 2;     // One retry
            case HIGH -> 3;       // Two retries
            case URGENT -> 5;     // Four retries
        };
    }
    
    /**
     * Get CSS class name for UI styling
     */
    public String getCssClass() {
        return switch (this) {
            case LOW -> "priority-low";
            case NORMAL -> "priority-normal";
            case HIGH -> "priority-high";
            case URGENT -> "priority-urgent";
        };
    }
    
    /**
     * Get color code for UI display
     */
    public String getColorCode() {
        return switch (this) {
            case LOW -> "#6B7280";      // Gray
            case NORMAL -> "#3B82F6";   // Blue
            case HIGH -> "#F59E0B";     // Orange
            case URGENT -> "#EF4444";   // Red
        };
    }
    
    /**
     * Get recommended sound file for notifications
     */
    public String getSoundFile() {
        return switch (this) {
            case LOW -> null;                    // No sound
            case NORMAL -> "notification.wav";   // Standard notification
            case HIGH -> "alert.wav";           // Alert sound
            case URGENT -> "urgent.wav";        // Urgent alarm
        };
    }
    
    /**
     * Get badge text for UI display
     */
    public String getBadgeText() {
        return switch (this) {
            case LOW -> "";
            case NORMAL -> "";
            case HIGH -> "!";
            case URGENT -> "!!";
        };
    }
    
    /**
     * From integer level
     */
    public static MessagePriority fromLevel(int level) {
        for (MessagePriority priority : values()) {
            if (priority.level == level) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Unknown priority level: " + level);
    }
    
    /**
     * Get higher priority level, or current if already highest
     */
    public MessagePriority escalate() {
        return switch (this) {
            case LOW -> NORMAL;
            case NORMAL -> HIGH;
            case HIGH -> URGENT;
            case URGENT -> URGENT; // Can't escalate further
        };
    }
    
    /**
     * Get lower priority level, or current if already lowest
     */
    public MessagePriority deescalate() {
        return switch (this) {
            case URGENT -> HIGH;
            case HIGH -> NORMAL;
            case NORMAL -> LOW;
            case LOW -> LOW; // Can't deescalate further
        };
    }
    
    @Override
    public String toString() {
        return displayName + " (Level " + level + ")";
    }
}