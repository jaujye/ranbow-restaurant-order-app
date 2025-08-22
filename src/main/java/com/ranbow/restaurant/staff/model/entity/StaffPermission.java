package com.ranbow.restaurant.staff.model.entity;

/**
 * Staff Permission Enumeration for Granular Access Control
 * Defines specific permissions that can be assigned to staff members
 */
public enum StaffPermission {
    // Order Management Permissions
    VIEW_ORDERS("View Orders", "Can view order queue and details"),
    UPDATE_ORDER_STATUS("Update Order Status", "Can modify order status"),
    ASSIGN_ORDERS("Assign Orders", "Can assign orders to staff members"),
    CANCEL_ORDERS("Cancel Orders", "Can cancel customer orders"),
    
    // Kitchen Permissions
    ACCESS_KITCHEN("Access Kitchen", "Can access kitchen management features"),
    START_COOKING("Start Cooking", "Can start cooking timers for orders"),
    COMPLETE_COOKING("Complete Cooking", "Can mark items as cooked"),
    MANAGE_KITCHEN_QUEUE("Manage Kitchen Queue", "Can reorder kitchen queue"),
    
    // Service Permissions
    SERVE_CUSTOMERS("Serve Customers", "Can serve orders to customers"),
    HANDLE_COMPLAINTS("Handle Complaints", "Can manage customer complaints"),
    PROCESS_REFUNDS("Process Refunds", "Can initiate refund processes"),
    
    // Payment Permissions
    PROCESS_PAYMENTS("Process Payments", "Can handle customer payments"),
    VIEW_PAYMENT_DETAILS("View Payment Details", "Can access payment information"),
    HANDLE_CASH("Handle Cash", "Can manage cash transactions"),
    MANAGE_POS("Manage POS", "Can operate point-of-sale system"),
    
    // Staff Management Permissions
    VIEW_STAFF_INFO("View Staff Info", "Can view staff member information"),
    MANAGE_STAFF("Manage Staff", "Can create, update, and manage staff"),
    MANAGE_SHIFTS("Manage Shifts", "Can manage work shifts and schedules"),
    VIEW_STAFF_PERFORMANCE("View Staff Performance", "Can access performance metrics"),
    
    // Reporting Permissions
    VIEW_BASIC_REPORTS("View Basic Reports", "Can view basic operational reports"),
    VIEW_DETAILED_REPORTS("View Detailed Reports", "Can access detailed analytics"),
    EXPORT_DATA("Export Data", "Can export reports and data"),
    
    // System Permissions
    MANAGE_MENU("Manage Menu", "Can modify menu items and pricing"),
    SYSTEM_SETTINGS("System Settings", "Can modify system configurations"),
    AUDIT_LOGS("Audit Logs", "Can view system audit logs"),
    EMERGENCY_ACCESS("Emergency Access", "Can access emergency functions"),
    
    // Notification Permissions
    SEND_NOTIFICATIONS("Send Notifications", "Can send system notifications"),
    BROADCAST_MESSAGES("Broadcast Messages", "Can send messages to all staff"),
    
    // Special Permissions
    SWITCH_USERS("Switch Users", "Can switch between staff accounts"),
    OVERRIDE_LOCKS("Override Locks", "Can override system locks and restrictions");
    
    private final String displayName;
    private final String description;
    
    StaffPermission(String displayName, String description) {
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
     * Get permission category for grouping in UI
     */
    public PermissionCategory getCategory() {
        return switch (this) {
            case VIEW_ORDERS, UPDATE_ORDER_STATUS, ASSIGN_ORDERS, CANCEL_ORDERS -> PermissionCategory.ORDER_MANAGEMENT;
            case ACCESS_KITCHEN, START_COOKING, COMPLETE_COOKING, MANAGE_KITCHEN_QUEUE -> PermissionCategory.KITCHEN;
            case SERVE_CUSTOMERS, HANDLE_COMPLAINTS, PROCESS_REFUNDS -> PermissionCategory.SERVICE;
            case PROCESS_PAYMENTS, VIEW_PAYMENT_DETAILS, HANDLE_CASH, MANAGE_POS -> PermissionCategory.PAYMENT;
            case VIEW_STAFF_INFO, MANAGE_STAFF, MANAGE_SHIFTS, VIEW_STAFF_PERFORMANCE -> PermissionCategory.STAFF_MANAGEMENT;
            case VIEW_BASIC_REPORTS, VIEW_DETAILED_REPORTS, EXPORT_DATA -> PermissionCategory.REPORTING;
            case MANAGE_MENU, SYSTEM_SETTINGS, AUDIT_LOGS, EMERGENCY_ACCESS -> PermissionCategory.SYSTEM;
            case SEND_NOTIFICATIONS, BROADCAST_MESSAGES -> PermissionCategory.COMMUNICATION;
            case SWITCH_USERS, OVERRIDE_LOCKS -> PermissionCategory.SPECIAL;
        };
    }
    
    /**
     * Check if this is a high-privilege permission
     */
    public boolean isHighPrivilege() {
        return switch (this) {
            case MANAGE_STAFF, SYSTEM_SETTINGS, AUDIT_LOGS, EMERGENCY_ACCESS,
                 OVERRIDE_LOCKS, EXPORT_DATA, CANCEL_ORDERS -> true;
            default -> false;
        };
    }
    
    public enum PermissionCategory {
        ORDER_MANAGEMENT("Order Management"),
        KITCHEN("Kitchen Operations"),
        SERVICE("Customer Service"),
        PAYMENT("Payment Processing"),
        STAFF_MANAGEMENT("Staff Management"),
        REPORTING("Reports & Analytics"),
        SYSTEM("System Administration"),
        COMMUNICATION("Communication"),
        SPECIAL("Special Operations");
        
        private final String displayName;
        
        PermissionCategory(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}