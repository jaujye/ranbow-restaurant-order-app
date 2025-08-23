package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.staff.model.entity.StaffRole;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * WebSocket Message DTO for Staff Communication
 * 
 * Standardized message format for all WebSocket communications in the staff system.
 * Supports various message types, priority levels, and targeting options for
 * efficient real-time communication.
 * 
 * Features:
 * - Message type classification
 * - Priority-based message handling
 * - Staff/role targeting
 * - Timestamp tracking
 * - Flexible data payload
 * - Message acknowledgment support
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WSMessage {
    
    private String messageId;
    
    private MessageType type;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    private Object data;
    
    private MessagePriority priority;
    
    private String targetStaffId;
    
    private StaffRole targetRole;
    
    private String sourceStaffId;
    
    private String title;
    
    private String message;
    
    private boolean requiresAcknowledgment;
    
    private Long ttlSeconds;
    
    private String correlationId;
    
    // Constructors
    public WSMessage() {
        this.messageId = java.util.UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
        this.priority = MessagePriority.NORMAL;
        this.requiresAcknowledgment = false;
    }
    
    public WSMessage(MessageType type, Object data) {
        this();
        this.type = type;
        this.data = data;
    }
    
    public WSMessage(MessageType type, String title, String message) {
        this();
        this.type = type;
        this.title = title;
        this.message = message;
    }
    
    public WSMessage(MessageType type, Object data, MessagePriority priority) {
        this(type, data);
        this.priority = priority;
    }
    
    // Factory Methods for Common Message Types
    
    public static WSMessage newOrder(Object orderData) {
        WSMessage msg = new WSMessage(MessageType.NEW_ORDER, orderData, MessagePriority.HIGH);
        msg.setTitle("New Order");
        msg.setMessage("A new order has been received");
        msg.setRequiresAcknowledgment(true);
        return msg;
    }
    
    public static WSMessage orderUpdate(Object orderData) {
        WSMessage msg = new WSMessage(MessageType.ORDER_UPDATE, orderData);
        msg.setTitle("Order Update");
        msg.setMessage("Order status has been updated");
        return msg;
    }
    
    public static WSMessage urgentOrder(Object orderData) {
        WSMessage msg = new WSMessage(MessageType.URGENT_ORDER, orderData, MessagePriority.URGENT);
        msg.setTitle("Urgent Order");
        msg.setMessage("Priority order requires immediate attention");
        msg.setRequiresAcknowledgment(true);
        msg.setTtlSeconds(300L); // 5 minutes TTL
        return msg;
    }
    
    public static WSMessage kitchenAlert(String alertMessage) {
        WSMessage msg = new WSMessage(MessageType.KITCHEN_ALERT, null, MessagePriority.HIGH);
        msg.setTitle("Kitchen Alert");
        msg.setMessage(alertMessage);
        msg.setTargetRole(StaffRole.KITCHEN);
        msg.setRequiresAcknowledgment(true);
        return msg;
    }
    
    public static WSMessage staffMessage(String targetStaffId, String title, String message) {
        WSMessage msg = new WSMessage(MessageType.STAFF_MESSAGE, null);
        msg.setTargetStaffId(targetStaffId);
        msg.setTitle(title);
        msg.setMessage(message);
        return msg;
    }
    
    public static WSMessage systemNotification(String title, String message, MessagePriority priority) {
        WSMessage msg = new WSMessage(MessageType.SYSTEM_NOTIFICATION, null, priority);
        msg.setTitle(title);
        msg.setMessage(message);
        return msg;
    }
    
    public static WSMessage timerUpdate(Object timerData) {
        WSMessage msg = new WSMessage(MessageType.TIMER_UPDATE, timerData);
        msg.setTitle("Timer Update");
        msg.setTargetRole(StaffRole.KITCHEN);
        return msg;
    }
    
    public static WSMessage capacityAlert(Object capacityData) {
        WSMessage msg = new WSMessage(MessageType.CAPACITY_ALERT, capacityData, MessagePriority.HIGH);
        msg.setTitle("Capacity Alert");
        msg.setMessage("Kitchen capacity threshold reached");
        msg.setTargetRole(StaffRole.KITCHEN);
        msg.setRequiresAcknowledgment(true);
        return msg;
    }
    
    // Utility Methods
    
    public WSMessage withTarget(String staffId) {
        this.targetStaffId = staffId;
        return this;
    }
    
    public WSMessage withTargetRole(StaffRole role) {
        this.targetRole = role;
        return this;
    }
    
    public WSMessage withSource(String staffId) {
        this.sourceStaffId = staffId;
        return this;
    }
    
    public WSMessage withCorrelation(String correlationId) {
        this.correlationId = correlationId;
        return this;
    }
    
    public WSMessage requireAck() {
        this.requiresAcknowledgment = true;
        return this;
    }
    
    public WSMessage withTTL(Long seconds) {
        this.ttlSeconds = seconds;
        return this;
    }
    
    public boolean isExpired() {
        if (ttlSeconds == null) return false;
        return timestamp.plusSeconds(ttlSeconds).isBefore(LocalDateTime.now());
    }
    
    // Getters and Setters
    
    public String getMessageId() {
        return messageId;
    }
    
    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }
    
    public MessageType getType() {
        return type;
    }
    
    public void setType(MessageType type) {
        this.type = type;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
    
    public MessagePriority getPriority() {
        return priority;
    }
    
    public void setPriority(MessagePriority priority) {
        this.priority = priority;
    }
    
    public String getTargetStaffId() {
        return targetStaffId;
    }
    
    public void setTargetStaffId(String targetStaffId) {
        this.targetStaffId = targetStaffId;
    }
    
    public StaffRole getTargetRole() {
        return targetRole;
    }
    
    public void setTargetRole(StaffRole targetRole) {
        this.targetRole = targetRole;
    }
    
    public String getSourceStaffId() {
        return sourceStaffId;
    }
    
    public void setSourceStaffId(String sourceStaffId) {
        this.sourceStaffId = sourceStaffId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isRequiresAcknowledgment() {
        return requiresAcknowledgment;
    }
    
    public void setRequiresAcknowledgment(boolean requiresAcknowledgment) {
        this.requiresAcknowledgment = requiresAcknowledgment;
    }
    
    public Long getTtlSeconds() {
        return ttlSeconds;
    }
    
    public void setTtlSeconds(Long ttlSeconds) {
        this.ttlSeconds = ttlSeconds;
    }
    
    public String getCorrelationId() {
        return correlationId;
    }
    
    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }
    
    @Override
    public String toString() {
        return "WSMessage{" +
                "messageId='" + messageId + '\'' +
                ", type=" + type +
                ", timestamp=" + timestamp +
                ", priority=" + priority +
                ", targetStaffId='" + targetStaffId + '\'' +
                ", targetRole=" + targetRole +
                ", title='" + title + '\'' +
                ", requiresAcknowledgment=" + requiresAcknowledgment +
                '}';
    }
}