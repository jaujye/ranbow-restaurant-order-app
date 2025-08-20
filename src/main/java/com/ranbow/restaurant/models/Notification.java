package com.ranbow.restaurant.models;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Notification entity for staff notifications
 * Handles various types of notifications including new orders, status changes, and system alerts
 */
public class Notification {
    private String notificationId;
    private String recipientStaffId; // Staff member who receives the notification
    private String senderStaffId; // Staff member who triggered the notification (optional)
    private NotificationType type;
    private NotificationPriority priority;
    private String title;
    private String message;
    private String relatedOrderId; // Related order if applicable
    private boolean isRead;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private LocalDateTime expiresAt;
    private String actionUrl; // Optional URL for action (e.g., view order details)
    
    public Notification() {
        this.notificationId = UUID.randomUUID().toString();
        this.sentAt = LocalDateTime.now();
        this.isRead = false;
        this.priority = NotificationPriority.NORMAL;
    }
    
    public Notification(String recipientStaffId, NotificationType type, String title, String message) {
        this();
        this.recipientStaffId = recipientStaffId;
        this.type = type;
        this.title = title;
        this.message = message;
    }
    
    public Notification(String recipientStaffId, NotificationType type, String title, String message, 
                       String relatedOrderId, NotificationPriority priority) {
        this(recipientStaffId, type, title, message);
        this.relatedOrderId = relatedOrderId;
        this.priority = priority;
    }
    
    // Business methods
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
    
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public void setExpiration(int hours) {
        this.expiresAt = LocalDateTime.now().plusHours(hours);
    }
    
    public boolean isUrgent() {
        return this.priority == NotificationPriority.HIGH || this.priority == NotificationPriority.EMERGENCY;
    }
    
    public long getMinutesSinceSent() {
        return java.time.Duration.between(sentAt, LocalDateTime.now()).toMinutes();
    }
    
    // Static factory methods for common notification types
    public static Notification newOrderNotification(String staffId, String orderId, String customerInfo) {
        String title = "新訂單";
        String message = String.format("收到新訂單 #%s - %s", 
            orderId.substring(orderId.length() - 6), customerInfo);
        
        Notification notification = new Notification(staffId, NotificationType.NEW_ORDER, title, message);
        notification.setRelatedOrderId(orderId);
        notification.setPriority(NotificationPriority.HIGH);
        notification.setExpiration(2); // Expire in 2 hours
        return notification;
    }
    
    public static Notification orderStatusUpdateNotification(String staffId, String orderId, 
                                                           OrderStatus oldStatus, OrderStatus newStatus) {
        String title = "訂單狀態更新";
        String message = String.format("訂單 #%s 狀態已從 %s 更新為 %s", 
            orderId.substring(orderId.length() - 6), oldStatus.getDisplayName(), newStatus.getDisplayName());
        
        Notification notification = new Notification(staffId, NotificationType.ORDER_STATUS_CHANGE, title, message);
        notification.setRelatedOrderId(orderId);
        notification.setPriority(NotificationPriority.NORMAL);
        notification.setExpiration(4); // Expire in 4 hours
        return notification;
    }
    
    public static Notification emergencyNotification(String staffId, String orderId, String reason) {
        String title = "🚨 緊急訂單";
        String message = String.format("訂單 #%s 需要緊急處理: %s", 
            orderId.substring(orderId.length() - 6), reason);
        
        Notification notification = new Notification(staffId, NotificationType.EMERGENCY, title, message);
        notification.setRelatedOrderId(orderId);
        notification.setPriority(NotificationPriority.EMERGENCY);
        // Emergency notifications don't expire
        return notification;
    }
    
    public static Notification overtimeOrderNotification(String staffId, String orderId, int overdueMinutes) {
        String title = "⏰ 訂單超時";
        String message = String.format("訂單 #%s 已超時 %d 分鐘", 
            orderId.substring(orderId.length() - 6), overdueMinutes);
        
        Notification notification = new Notification(staffId, NotificationType.ORDER_OVERTIME, title, message);
        notification.setRelatedOrderId(orderId);
        notification.setPriority(NotificationPriority.HIGH);
        notification.setExpiration(1); // Expire in 1 hour
        return notification;
    }
    
    public static Notification systemNotification(String staffId, String title, String message) {
        Notification notification = new Notification(staffId, NotificationType.SYSTEM, title, message);
        notification.setPriority(NotificationPriority.NORMAL);
        notification.setExpiration(24); // Expire in 24 hours
        return notification;
    }
    
    // Getters and Setters
    public String getNotificationId() {
        return notificationId;
    }
    
    public void setNotificationId(String notificationId) {
        this.notificationId = notificationId;
    }
    
    public String getRecipientStaffId() {
        return recipientStaffId;
    }
    
    public void setRecipientStaffId(String recipientStaffId) {
        this.recipientStaffId = recipientStaffId;
    }
    
    public String getSenderStaffId() {
        return senderStaffId;
    }
    
    public void setSenderStaffId(String senderStaffId) {
        this.senderStaffId = senderStaffId;
    }
    
    public NotificationType getType() {
        return type;
    }
    
    public void setType(NotificationType type) {
        this.type = type;
    }
    
    public NotificationPriority getPriority() {
        return priority;
    }
    
    public void setPriority(NotificationPriority priority) {
        this.priority = priority;
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
    
    public String getRelatedOrderId() {
        return relatedOrderId;
    }
    
    public void setRelatedOrderId(String relatedOrderId) {
        this.relatedOrderId = relatedOrderId;
    }
    
    public boolean isRead() {
        return isRead;
    }
    
    public void setRead(boolean read) {
        isRead = read;
    }
    
    public LocalDateTime getSentAt() {
        return sentAt;
    }
    
    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
    
    public LocalDateTime getReadAt() {
        return readAt;
    }
    
    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public String getActionUrl() {
        return actionUrl;
    }
    
    public void setActionUrl(String actionUrl) {
        this.actionUrl = actionUrl;
    }
    
    @Override
    public String toString() {
        return "Notification{" +
                "notificationId='" + notificationId + '\'' +
                ", recipientStaffId='" + recipientStaffId + '\'' +
                ", type=" + type +
                ", priority=" + priority +
                ", title='" + title + '\'' +
                ", isRead=" + isRead +
                ", sentAt=" + sentAt +
                '}';
    }
}