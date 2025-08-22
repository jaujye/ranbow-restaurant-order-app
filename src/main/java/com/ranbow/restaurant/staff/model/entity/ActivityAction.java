package com.ranbow.restaurant.staff.model.entity;

/**
 * Activity Action Enumeration
 * Defines specific actions that can be performed within each activity type
 */
public enum ActivityAction {
    // Authentication Actions
    LOGIN("Login", "User successfully logged in"),
    LOGOUT("Logout", "User logged out"),
    LOGIN_FAILED("Login Failed", "Authentication attempt failed"),
    UNAUTHORIZED_ACCESS("Unauthorized Access", "Attempted to access restricted resource"),
    PASSWORD_CHANGE("Password Change", "User changed their password"),
    ACCOUNT_LOCKED("Account Locked", "Account was locked due to security violations"),
    ACCOUNT_UNLOCKED("Account Unlocked", "Account was unlocked by administrator"),
    
    // CRUD Operations
    CREATE("Create", "Created a new record"),
    READ("Read", "Viewed/accessed a record"),
    UPDATE("Update", "Modified an existing record"),
    DELETE("Delete", "Removed a record"),
    
    // Order Management Actions
    ORDER_RECEIVED("Order Received", "New order was received"),
    ORDER_ACCEPTED("Order Accepted", "Order was accepted for processing"),
    ORDER_STARTED("Order Started", "Started working on order"),
    ORDER_COMPLETED("Order Completed", "Order was completed"),
    ORDER_CANCELLED("Order Cancelled", "Order was cancelled"),
    ORDER_ASSIGNED("Order Assigned", "Order was assigned to staff member"),
    ORDER_REASSIGNED("Order Reassigned", "Order was reassigned to different staff member"),
    STATUS_CHANGED("Status Changed", "Order status was updated"),
    
    // Shift Management Actions
    SHIFT_START("Shift Start", "Staff member started their shift"),
    SHIFT_END("Shift End", "Staff member ended their shift"),
    BREAK_START("Break Start", "Staff member started a break"),
    BREAK_END("Break End", "Staff member returned from break"),
    SHIFT_CANCELLED("Shift Cancelled", "Scheduled shift was cancelled"),
    
    // Kitchen Operations Actions
    COOKING_STARTED("Cooking Started", "Started cooking process"),
    COOKING_COMPLETED("Cooking Completed", "Finished cooking process"),
    TIMER_STARTED("Timer Started", "Started cooking timer"),
    TIMER_PAUSED("Timer Paused", "Paused cooking timer"),
    TIMER_RESUMED("Timer Resumed", "Resumed cooking timer"),
    TIMER_COMPLETED("Timer Completed", "Cooking timer completed"),
    QUALITY_CHECK("Quality Check", "Performed quality inspection"),
    INGREDIENT_USED("Ingredient Used", "Used ingredients for preparation"),
    
    // Payment Actions
    PAYMENT_PROCESSED("Payment Processed", "Successfully processed payment"),
    PAYMENT_FAILED("Payment Failed", "Payment processing failed"),
    REFUND_ISSUED("Refund Issued", "Issued refund to customer"),
    TRANSACTION_VOIDED("Transaction Voided", "Voided a transaction"),
    
    // Customer Service Actions
    CUSTOMER_SERVED("Customer Served", "Served customer"),
    COMPLAINT_RECEIVED("Complaint Received", "Received customer complaint"),
    COMPLAINT_RESOLVED("Complaint Resolved", "Resolved customer complaint"),
    FEEDBACK_COLLECTED("Feedback Collected", "Collected customer feedback"),
    
    // System Actions
    CONFIGURATION_CHANGED("Configuration Changed", "System configuration was modified"),
    BACKUP_CREATED("Backup Created", "System backup was created"),
    SYSTEM_RESTART("System Restart", "System was restarted"),
    MAINTENANCE_PERFORMED("Maintenance Performed", "System maintenance was performed"),
    
    // Error Actions
    ERROR("Error", "An error occurred"),
    EXCEPTION("Exception", "System exception occurred"),
    WARNING("Warning", "System warning generated"),
    
    // General Actions
    SEARCH("Search", "Performed a search operation"),
    EXPORT("Export", "Exported data"),
    IMPORT("Import", "Imported data"),
    PRINT("Print", "Printed document or report"),
    NOTIFICATION_SENT("Notification Sent", "Sent notification"),
    MESSAGE_SENT("Message Sent", "Sent message"),
    
    // Security Actions
    PERMISSION_GRANTED("Permission Granted", "Access permission was granted"),
    PERMISSION_DENIED("Permission Denied", "Access permission was denied"),
    SECURITY_VIOLATION("Security Violation", "Security policy violation detected"),
    DATA_ACCESS("Data Access", "Accessed sensitive data"),
    
    // Performance Actions
    PERFORMANCE_MEASURED("Performance Measured", "Performance metrics were recorded"),
    BENCHMARK_COMPLETED("Benchmark Completed", "Performance benchmark completed"),
    
    // Training Actions
    TRAINING_STARTED("Training Started", "Started training session"),
    TRAINING_COMPLETED("Training Completed", "Completed training session"),
    SKILL_ASSESSED("Skill Assessed", "Skill assessment performed"),
    
    // Other Actions
    OTHER("Other", "Other activity not specified above");
    
    private final String displayName;
    private final String description;
    
    ActivityAction(String displayName, String description) {
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
     * Check if this action indicates a successful operation
     */
    public boolean isSuccessful() {
        return switch (this) {
            case LOGIN_FAILED, UNAUTHORIZED_ACCESS, PAYMENT_FAILED, ERROR, 
                 EXCEPTION, WARNING, PERMISSION_DENIED, SECURITY_VIOLATION -> false;
            default -> true;
        };
    }
    
    /**
     * Check if this action requires immediate attention
     */
    public boolean requiresImmediateAttention() {
        return switch (this) {
            case UNAUTHORIZED_ACCESS, SECURITY_VIOLATION, ERROR, EXCEPTION,
                 PAYMENT_FAILED, ACCOUNT_LOCKED -> true;
            default -> false;
        };
    }
    
    /**
     * Check if this action affects performance metrics
     */
    public boolean affectsPerformance() {
        return switch (this) {
            case ORDER_STARTED, ORDER_COMPLETED, COOKING_STARTED, COOKING_COMPLETED,
                 CUSTOMER_SERVED, PAYMENT_PROCESSED, TIMER_COMPLETED -> true;
            default -> false;
        };
    }
    
    /**
     * Check if this action is security-related
     */
    public boolean isSecurityRelated() {
        return switch (this) {
            case LOGIN, LOGOUT, LOGIN_FAILED, UNAUTHORIZED_ACCESS, PASSWORD_CHANGE,
                 ACCOUNT_LOCKED, ACCOUNT_UNLOCKED, PERMISSION_GRANTED, PERMISSION_DENIED,
                 SECURITY_VIOLATION, DATA_ACCESS -> true;
            default -> false;
        };
    }
    
    /**
     * Get the severity level of this action
     */
    public int getSeverityLevel() {
        return switch (this) {
            case ERROR, EXCEPTION, SECURITY_VIOLATION, UNAUTHORIZED_ACCESS -> 5; // Critical
            case LOGIN_FAILED, PAYMENT_FAILED, ACCOUNT_LOCKED -> 4; // High
            case WARNING, PERMISSION_DENIED, ORDER_CANCELLED -> 3; // Medium
            case LOGIN, LOGOUT, ORDER_COMPLETED, PAYMENT_PROCESSED -> 2; // Low
            default -> 1; // Info
        };
    }
    
    /**
     * Get CSS class for UI styling
     */
    public String getCssClass() {
        return switch (this) {
            case LOGIN, ORDER_COMPLETED, PAYMENT_PROCESSED, COOKING_COMPLETED -> "action-success";
            case CREATE, ORDER_STARTED, COOKING_STARTED, TIMER_STARTED -> "action-create";
            case UPDATE, STATUS_CHANGED, CONFIGURATION_CHANGED -> "action-update";
            case DELETE, ORDER_CANCELLED, TIMER_COMPLETED -> "action-delete";
            case ERROR, EXCEPTION, LOGIN_FAILED, PAYMENT_FAILED -> "action-error";
            case WARNING, UNAUTHORIZED_ACCESS -> "action-warning";
            case READ, SEARCH, DATA_ACCESS -> "action-info";
            default -> "action-default";
        };
    }
    
    /**
     * Get color code for UI display
     */
    public String getColorCode() {
        return switch (this) {
            case LOGIN, ORDER_COMPLETED, PAYMENT_PROCESSED, COOKING_COMPLETED -> "#28a745"; // Green
            case CREATE, ORDER_STARTED, COOKING_STARTED -> "#17a2b8"; // Blue
            case UPDATE, STATUS_CHANGED -> "#ffc107"; // Yellow
            case DELETE, ORDER_CANCELLED -> "#6c757d"; // Gray
            case ERROR, EXCEPTION, LOGIN_FAILED, PAYMENT_FAILED -> "#dc3545"; // Red
            case WARNING, UNAUTHORIZED_ACCESS, SECURITY_VIOLATION -> "#fd7e14"; // Orange
            case READ, SEARCH, DATA_ACCESS -> "#007bff"; // Primary blue
            default -> "#6c757d"; // Secondary gray
        };
    }
}