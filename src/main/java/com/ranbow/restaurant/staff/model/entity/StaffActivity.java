package com.ranbow.restaurant.staff.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Staff Activity Entity for Activity Logging and Performance Tracking
 * Tracks all staff activities for audit, performance analysis, and monitoring
 */
@Entity
@Table(name = "staff_activities", indexes = {
    @Index(name = "idx_staff_id", columnList = "staffId"),
    @Index(name = "idx_activity_type", columnList = "activityType"),
    @Index(name = "idx_created_at", columnList = "createdAt"),
    @Index(name = "idx_shift_id", columnList = "shiftId"),
    @Index(name = "idx_order_id", columnList = "orderId")
})
public class StaffActivity {
    
    @Id
    @Column(name = "activity_id", updatable = false, nullable = false)
    private String activityId;
    
    @NotNull(message = "Staff ID is required")
    @Column(name = "staff_id", nullable = false)
    private String staffId;
    
    @Column(name = "shift_id")
    private String shiftId;
    
    @NotNull(message = "Activity type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 30)
    private ActivityType activityType;
    
    @NotNull(message = "Activity action is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_action", nullable = false, length = 20)
    private ActivityAction activityAction;
    
    @Column(name = "order_id")
    private String orderId;
    
    @Column(name = "target_entity_id")
    private String targetEntityId;
    
    @Column(name = "target_entity_type", length = 50)
    private String targetEntityType;
    
    @Column(name = "activity_description", length = 500)
    private String activityDescription;
    
    @Column(name = "activity_details", length = 2000)
    private String activityDetails;
    
    @Column(name = "duration_seconds")
    private Integer durationSeconds;
    
    @Column(name = "success", nullable = false)
    private Boolean success = true;
    
    @Column(name = "error_message", length = 1000)
    private String errorMessage;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "device_id", length = 255)
    private String deviceId;
    
    @Column(name = "location", length = 100)
    private String location;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public StaffActivity() {
        this.activityId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
    }
    
    public StaffActivity(String staffId, ActivityType activityType, ActivityAction activityAction) {
        this();
        this.staffId = staffId;
        this.activityType = activityType;
        this.activityAction = activityAction;
    }
    
    public StaffActivity(String staffId, ActivityType activityType, ActivityAction activityAction, 
                        String activityDescription) {
        this(staffId, activityType, activityAction);
        this.activityDescription = activityDescription;
    }
    
    // Static Factory Methods
    public static StaffActivity createLoginActivity(String staffId, String ipAddress, String deviceId) {
        StaffActivity activity = new StaffActivity(staffId, ActivityType.AUTHENTICATION, ActivityAction.LOGIN);
        activity.setIpAddress(ipAddress);
        activity.setDeviceId(deviceId);
        activity.setActivityDescription("Staff member logged in");
        return activity;
    }
    
    public static StaffActivity createLogoutActivity(String staffId, String ipAddress, String deviceId) {
        StaffActivity activity = new StaffActivity(staffId, ActivityType.AUTHENTICATION, ActivityAction.LOGOUT);
        activity.setIpAddress(ipAddress);
        activity.setDeviceId(deviceId);
        activity.setActivityDescription("Staff member logged out");
        return activity;
    }
    
    public static StaffActivity createOrderActivity(String staffId, String orderId, 
                                                   ActivityAction action, String description) {
        StaffActivity activity = new StaffActivity(staffId, ActivityType.ORDER_MANAGEMENT, action);
        activity.setOrderId(orderId);
        activity.setTargetEntityId(orderId);
        activity.setTargetEntityType("Order");
        activity.setActivityDescription(description);
        return activity;
    }
    
    public static StaffActivity createShiftActivity(String staffId, String shiftId, 
                                                   ActivityAction action, String description) {
        StaffActivity activity = new StaffActivity(staffId, ActivityType.SHIFT_MANAGEMENT, action);
        activity.setShiftId(shiftId);
        activity.setTargetEntityId(shiftId);
        activity.setTargetEntityType("WorkShift");
        activity.setActivityDescription(description);
        return activity;
    }
    
    public static StaffActivity createKitchenActivity(String staffId, String orderId, 
                                                     ActivityAction action, String description) {
        StaffActivity activity = new StaffActivity(staffId, ActivityType.KITCHEN_OPERATIONS, action);
        activity.setOrderId(orderId);
        activity.setTargetEntityId(orderId);
        activity.setTargetEntityType("CookingTimer");
        activity.setActivityDescription(description);
        return activity;
    }
    
    public static StaffActivity createErrorActivity(String staffId, ActivityType type, 
                                                   String errorMessage, String description) {
        StaffActivity activity = new StaffActivity(staffId, type, ActivityAction.ERROR);
        activity.setSuccess(false);
        activity.setErrorMessage(errorMessage);
        activity.setActivityDescription(description);
        return activity;
    }
    
    // Business Methods
    public void markAsSuccessful() {
        this.success = true;
        this.errorMessage = null;
    }
    
    public void markAsError(String errorMessage) {
        this.success = false;
        this.errorMessage = errorMessage;
    }
    
    public void setDuration(LocalDateTime startTime) {
        if (startTime != null) {
            long seconds = java.time.Duration.between(startTime, this.createdAt).getSeconds();
            this.durationSeconds = Math.max(0, (int) seconds);
        }
    }
    
    public boolean isSuccessful() {
        return success != null && success;
    }
    
    public boolean isError() {
        return success != null && !success;
    }
    
    public boolean isHighImportanceActivity() {
        return activityType.isHighImportance();
    }
    
    public boolean isSecurityRelatedActivity() {
        return activityType == ActivityType.AUTHENTICATION || 
               activityType == ActivityType.SECURITY || 
               activityAction == ActivityAction.UNAUTHORIZED_ACCESS;
    }
    
    // Getters and Setters
    public String getActivityId() {
        return activityId;
    }
    
    public void setActivityId(String activityId) {
        this.activityId = activityId;
    }
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public String getShiftId() {
        return shiftId;
    }
    
    public void setShiftId(String shiftId) {
        this.shiftId = shiftId;
    }
    
    public ActivityType getActivityType() {
        return activityType;
    }
    
    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }
    
    public ActivityAction getActivityAction() {
        return activityAction;
    }
    
    public void setActivityAction(ActivityAction activityAction) {
        this.activityAction = activityAction;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getTargetEntityId() {
        return targetEntityId;
    }
    
    public void setTargetEntityId(String targetEntityId) {
        this.targetEntityId = targetEntityId;
    }
    
    public String getTargetEntityType() {
        return targetEntityType;
    }
    
    public void setTargetEntityType(String targetEntityType) {
        this.targetEntityType = targetEntityType;
    }
    
    public String getActivityDescription() {
        return activityDescription;
    }
    
    public void setActivityDescription(String activityDescription) {
        this.activityDescription = activityDescription;
    }
    
    public String getActivityDetails() {
        return activityDetails;
    }
    
    public void setActivityDetails(String activityDetails) {
        this.activityDetails = activityDetails;
    }
    
    public Integer getDurationSeconds() {
        return durationSeconds;
    }
    
    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getDeviceId() {
        return deviceId;
    }
    
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "StaffActivity{" +
                "activityId='" + activityId + '\'' +
                ", staffId='" + staffId + '\'' +
                ", activityType=" + activityType +
                ", activityAction=" + activityAction +
                ", activityDescription='" + activityDescription + '\'' +
                ", success=" + success +
                ", createdAt=" + createdAt +
                '}';
    }
}