package com.ranbow.restaurant.staff.model.dto;

/**
 * WebSocket Message Types for Staff Communication System
 * 
 * Defines all supported message types for real-time communication between
 * the server and staff clients. Each type represents a specific category
 * of information or event that requires real-time notification.
 * 
 * Message Type Categories:
 * - Order Management: NEW_ORDER, ORDER_UPDATE, URGENT_ORDER
 * - Kitchen Operations: KITCHEN_ALERT, TIMER_UPDATE, CAPACITY_ALERT
 * - System Communication: STAFF_MESSAGE, SYSTEM_NOTIFICATION
 * - WebSocket Control: HEARTBEAT, ACK, ERROR
 */
public enum MessageType {
    
    /**
     * New order has been placed and requires assignment or processing
     * Priority: HIGH
     * Target: Available staff based on role and workload
     * Data: Order details, customer information, items
     */
    NEW_ORDER("new_order", "New Order Notification", true),
    
    /**
     * Existing order status has been updated
     * Priority: NORMAL to HIGH (based on status change)
     * Target: Staff assigned to the order, relevant departments
     * Data: Updated order details, previous status, new status
     */
    ORDER_UPDATE("order_update", "Order Status Update", false),
    
    /**
     * High-priority order requiring immediate attention
     * Priority: URGENT
     * Target: All available staff of relevant roles
     * Data: Order details with urgency indicators
     */
    URGENT_ORDER("urgent_order", "Urgent Order Alert", true),
    
    /**
     * Kitchen-specific alert for operational issues
     * Priority: HIGH
     * Target: Kitchen staff and managers
     * Data: Alert details, affected equipment/area, recommended actions
     */
    KITCHEN_ALERT("kitchen_alert", "Kitchen Alert", true),
    
    /**
     * Direct message between staff members
     * Priority: NORMAL
     * Target: Specific staff member
     * Data: Message content, sender information
     */
    STAFF_MESSAGE("staff_message", "Staff Message", false),
    
    /**
     * System-wide notification from management or automated systems
     * Priority: NORMAL to HIGH
     * Target: All staff or specific roles
     * Data: Notification content, validity period, actions required
     */
    SYSTEM_NOTIFICATION("system_notification", "System Notification", false),
    
    /**
     * Cooking timer updates for kitchen operations
     * Priority: NORMAL
     * Target: Kitchen staff
     * Data: Timer information, remaining time, stage details
     */
    TIMER_UPDATE("timer_update", "Timer Update", false),
    
    /**
     * Kitchen capacity threshold alerts
     * Priority: HIGH
     * Target: Kitchen staff and managers
     * Data: Current capacity, threshold levels, recommended actions
     */
    CAPACITY_ALERT("capacity_alert", "Capacity Alert", true),
    
    /**
     * Connection health check message
     * Priority: LOW
     * Target: All connected clients
     * Data: Timestamp, server status
     */
    HEARTBEAT("heartbeat", "Heartbeat", false),
    
    /**
     * Acknowledgment message for received communications
     * Priority: LOW
     * Target: Message sender
     * Data: Original message ID, acknowledgment timestamp
     */
    ACK("ack", "Acknowledgment", false),
    
    /**
     * Error notification for failed operations or system issues
     * Priority: HIGH
     * Target: Affected staff or system administrators
     * Data: Error details, error code, suggested resolution
     */
    ERROR("error", "Error Notification", false);
    
    private final String code;
    private final String displayName;
    private final boolean requiresImmedateAttention;
    
    MessageType(String code, String displayName, boolean requiresImmedateAttention) {
        this.code = code;
        this.displayName = displayName;
        this.requiresImmedateAttention = requiresImmedateAttention;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean requiresImmedateAttention() {
        return requiresImmedateAttention;
    }
    
    /**
     * Get MessageType from code string
     */
    public static MessageType fromCode(String code) {
        for (MessageType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown message type code: " + code);
    }
    
    /**
     * Check if message type is order-related
     */
    public boolean isOrderRelated() {
        return this == NEW_ORDER || this == ORDER_UPDATE || this == URGENT_ORDER;
    }
    
    /**
     * Check if message type is kitchen-related
     */
    public boolean isKitchenRelated() {
        return this == KITCHEN_ALERT || this == TIMER_UPDATE || this == CAPACITY_ALERT;
    }
    
    /**
     * Check if message type is system control
     */
    public boolean isSystemControl() {
        return this == HEARTBEAT || this == ACK || this == ERROR;
    }
    
    /**
     * Get recommended priority level for message type
     */
    public MessagePriority getRecommendedPriority() {
        return switch (this) {
            case URGENT_ORDER, KITCHEN_ALERT, CAPACITY_ALERT, ERROR -> MessagePriority.URGENT;
            case NEW_ORDER -> MessagePriority.HIGH;
            case ORDER_UPDATE, SYSTEM_NOTIFICATION -> MessagePriority.NORMAL;
            case STAFF_MESSAGE, TIMER_UPDATE -> MessagePriority.NORMAL;
            case HEARTBEAT, ACK -> MessagePriority.LOW;
        };
    }
    
    @Override
    public String toString() {
        return displayName + " (" + code + ")";
    }
}