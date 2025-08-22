package com.ranbow.restaurant.staff.model.dto;

import java.time.LocalDateTime;

/**
 * Generic API Response DTO
 * Standard response wrapper for all API endpoints
 */
public class ApiResponse<T> {
    
    private boolean success;
    private String message;
    private T data;
    private String errorCode;
    private LocalDateTime timestamp;
    private String requestId;
    
    // Constructors
    public ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ApiResponse(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    public ApiResponse(boolean success, String message, T data) {
        this(success, message);
        this.data = data;
    }
    
    // Static factory methods for success responses
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data);
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    
    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>(true, message);
    }
    
    // Static factory methods for error responses
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message);
    }
    
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        ApiResponse<T> response = new ApiResponse<>(false, message);
        response.setErrorCode(errorCode);
        return response;
    }
    
    public static <T> ApiResponse<T> error(String message, String errorCode, T data) {
        ApiResponse<T> response = new ApiResponse<>(false, message, data);
        response.setErrorCode(errorCode);
        return response;
    }
    
    // Common error response types
    public static <T> ApiResponse<T> badRequest(String message) {
        return error(message, "BAD_REQUEST");
    }
    
    public static <T> ApiResponse<T> unauthorized(String message) {
        return error(message != null ? message : "Unauthorized access", "UNAUTHORIZED");
    }
    
    public static <T> ApiResponse<T> forbidden(String message) {
        return error(message != null ? message : "Access forbidden", "FORBIDDEN");
    }
    
    public static <T> ApiResponse<T> notFound(String message) {
        return error(message != null ? message : "Resource not found", "NOT_FOUND");
    }
    
    public static <T> ApiResponse<T> conflict(String message) {
        return error(message, "CONFLICT");
    }
    
    public static <T> ApiResponse<T> internalError(String message) {
        return error(message != null ? message : "Internal server error", "INTERNAL_ERROR");
    }
    
    public static <T> ApiResponse<T> validationError(String message) {
        return error(message, "VALIDATION_ERROR");
    }
    
    // Business logic specific errors
    public static <T> ApiResponse<T> accountLocked(String message) {
        return error(message, "ACCOUNT_LOCKED");
    }
    
    public static <T> ApiResponse<T> invalidCredentials() {
        return error("Invalid employee number or password", "INVALID_CREDENTIALS");
    }
    
    public static <T> ApiResponse<T> sessionExpired() {
        return error("Session has expired", "SESSION_EXPIRED");
    }
    
    public static <T> ApiResponse<T> insufficientPermissions() {
        return error("Insufficient permissions for this operation", "INSUFFICIENT_PERMISSIONS");
    }
    
    public static <T> ApiResponse<T> orderNotFound(String orderId) {
        return error("Order not found: " + orderId, "ORDER_NOT_FOUND");
    }
    
    public static <T> ApiResponse<T> staffNotFound(String staffId) {
        return error("Staff member not found: " + staffId, "STAFF_NOT_FOUND");
    }
    
    public static <T> ApiResponse<T> invalidOrderStatus(String currentStatus, String requestedStatus) {
        return error("Cannot change order status from " + currentStatus + " to " + requestedStatus, 
                    "INVALID_STATUS_TRANSITION");
    }
    
    public static <T> ApiResponse<T> kitchenOverloaded() {
        return error("Kitchen is currently at maximum capacity", "KITCHEN_OVERLOADED");
    }
    
    // Utility methods
    public ApiResponse<T> withRequestId(String requestId) {
        this.requestId = requestId;
        return this;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public boolean isError() {
        return !success;
    }
    
    // Getters and Setters
    public boolean getSuccess() {
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
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getRequestId() {
        return requestId;
    }
    
    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
    
    @Override
    public String toString() {
        return "ApiResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", data=" + (data != null ? data.getClass().getSimpleName() : null) +
                ", errorCode='" + errorCode + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}