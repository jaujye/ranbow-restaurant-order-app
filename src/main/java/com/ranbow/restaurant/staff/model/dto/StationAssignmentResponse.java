package com.ranbow.restaurant.staff.model.dto;

/**
 * Response DTO for station assignment operations
 */
public class StationAssignmentResponse {
    
    private boolean success;
    private String message;
    private String stationId;
    private String orderId;
    private String staffId;
    private String errorCode;
    
    // Constructors
    public StationAssignmentResponse() {}
    
    private StationAssignmentResponse(boolean success, String message, String stationId, 
                                    String orderId, String staffId, String errorCode) {
        this.success = success;
        this.message = message;
        this.stationId = stationId;
        this.orderId = orderId;
        this.staffId = staffId;
        this.errorCode = errorCode;
    }
    
    // Factory methods
    public static StationAssignmentResponse success(String stationId, String orderId, String staffId) {
        return new StationAssignmentResponse(true, "Order assigned to station successfully", 
                                           stationId, orderId, staffId, null);
    }
    
    public static StationAssignmentResponse error(String message) {
        return new StationAssignmentResponse(false, message, null, null, null, "ASSIGNMENT_ERROR");
    }
    
    public static StationAssignmentResponse error(String message, String errorCode) {
        return new StationAssignmentResponse(false, message, null, null, null, errorCode);
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getStationId() {
        return stationId;
    }
    
    public void setStationId(String stationId) {
        this.stationId = stationId;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    @Override
    public String toString() {
        return "StationAssignmentResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", stationId='" + stationId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", staffId='" + staffId + '\'' +
                '}';
    }
}