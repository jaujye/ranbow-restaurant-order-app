package com.ranbow.restaurant.staff.model.entity;

/**
 * Activity Type Enumeration
 * Categorizes different types of staff activities for logging and analysis
 */
public enum ActivityType {
    AUTHENTICATION("Authentication", "Login, logout, and access control activities", true),
    SHIFT_MANAGEMENT("Shift Management", "Shift start, end, break activities", false),
    ORDER_MANAGEMENT("Order Management", "Order processing and status updates", false),
    KITCHEN_OPERATIONS("Kitchen Operations", "Cooking, preparation, and kitchen tasks", false),
    CUSTOMER_SERVICE("Customer Service", "Customer interactions and service activities", false),
    PAYMENT_PROCESSING("Payment Processing", "Payment handling and transactions", true),
    INVENTORY_MANAGEMENT("Inventory Management", "Stock and inventory related activities", false),
    SYSTEM_ADMINISTRATION("System Administration", "System settings and configuration changes", true),
    SECURITY("Security", "Security related events and violations", true),
    PERFORMANCE("Performance", "Performance metrics and assessments", false),
    TRAINING("Training", "Training and learning activities", false),
    MAINTENANCE("Maintenance", "System maintenance and updates", false),
    ERROR("Error", "System errors and exceptions", true),
    OTHER("Other", "Miscellaneous activities not covered by other types", false);
    
    private final String displayName;
    private final String description;
    private final boolean highImportance;
    
    ActivityType(String displayName, String description, boolean highImportance) {
        this.displayName = displayName;
        this.description = description;
        this.highImportance = highImportance;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isHighImportance() {
        return highImportance;
    }
    
    /**
     * Check if this activity type requires audit logging
     */
    public boolean requiresAuditLogging() {
        return switch (this) {
            case AUTHENTICATION, PAYMENT_PROCESSING, SYSTEM_ADMINISTRATION, 
                 SECURITY, INVENTORY_MANAGEMENT -> true;
            default -> false;
        };
    }
    
    /**
     * Check if this activity type affects performance metrics
     */
    public boolean affectsPerformance() {
        return switch (this) {
            case ORDER_MANAGEMENT, KITCHEN_OPERATIONS, CUSTOMER_SERVICE, 
                 PAYMENT_PROCESSING -> true;
            default -> false;
        };
    }
    
    /**
     * Get the retention period in days for this activity type
     */
    public int getRetentionPeriodDays() {
        return switch (this) {
            case AUTHENTICATION, SECURITY, PAYMENT_PROCESSING -> 365; // 1 year
            case SYSTEM_ADMINISTRATION, INVENTORY_MANAGEMENT -> 180; // 6 months
            case ORDER_MANAGEMENT, CUSTOMER_SERVICE -> 90; // 3 months
            case SHIFT_MANAGEMENT, KITCHEN_OPERATIONS, PERFORMANCE -> 60; // 2 months
            case TRAINING, MAINTENANCE -> 30; // 1 month
            case ERROR, OTHER -> 14; // 2 weeks
        };
    }
    
    /**
     * Get the notification priority level
     */
    public int getNotificationPriority() {
        return switch (this) {
            case SECURITY, ERROR -> 5; // Critical
            case AUTHENTICATION, SYSTEM_ADMINISTRATION -> 4; // High
            case PAYMENT_PROCESSING, INVENTORY_MANAGEMENT -> 3; // Medium
            case ORDER_MANAGEMENT, KITCHEN_OPERATIONS -> 2; // Low
            default -> 1; // Info
        };
    }
    
    /**
     * Get CSS class for UI styling
     */
    public String getCssClass() {
        return switch (this) {
            case AUTHENTICATION -> "activity-auth";
            case SHIFT_MANAGEMENT -> "activity-shift";
            case ORDER_MANAGEMENT -> "activity-order";
            case KITCHEN_OPERATIONS -> "activity-kitchen";
            case CUSTOMER_SERVICE -> "activity-service";
            case PAYMENT_PROCESSING -> "activity-payment";
            case INVENTORY_MANAGEMENT -> "activity-inventory";
            case SYSTEM_ADMINISTRATION -> "activity-admin";
            case SECURITY -> "activity-security";
            case PERFORMANCE -> "activity-performance";
            case TRAINING -> "activity-training";
            case MAINTENANCE -> "activity-maintenance";
            case ERROR -> "activity-error";
            case OTHER -> "activity-other";
        };
    }
    
    /**
     * Get color code for UI display
     */
    public String getColorCode() {
        return switch (this) {
            case AUTHENTICATION -> "#17a2b8";    // Blue
            case SHIFT_MANAGEMENT -> "#28a745";  // Green
            case ORDER_MANAGEMENT -> "#ffc107";  // Yellow
            case KITCHEN_OPERATIONS -> "#fd7e14"; // Orange
            case CUSTOMER_SERVICE -> "#20c997";  // Teal
            case PAYMENT_PROCESSING -> "#6f42c1"; // Purple
            case INVENTORY_MANAGEMENT -> "#e83e8c"; // Pink
            case SYSTEM_ADMINISTRATION -> "#6c757d"; // Gray
            case SECURITY -> "#dc3545";          // Red
            case PERFORMANCE -> "#007bff";       // Primary blue
            case TRAINING -> "#17a2b8";          // Info blue
            case MAINTENANCE -> "#6c757d";       // Secondary gray
            case ERROR -> "#dc3545";             // Danger red
            case OTHER -> "#6c757d";             // Light gray
        };
    }
}