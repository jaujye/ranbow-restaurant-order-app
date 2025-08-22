package com.ranbow.restaurant.staff.controller;

import com.ranbow.restaurant.staff.model.dto.*;
import com.ranbow.restaurant.staff.service.StaffAuthService;
import com.ranbow.restaurant.staff.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Staff Authentication REST Controller
 * Implements comprehensive staff authentication API with enterprise-level security
 * 
 * Features:
 * - Staff login with device binding and account lockout protection
 * - Quick switch between staff members with PIN authentication
 * - JWT token refresh mechanism with device validation
 * - Session management and secure logout
 * - Staff profile retrieval with role-based access
 * - Comprehensive error handling and audit logging
 * 
 * Security:
 * - Input validation with detailed error messages
 * - Rate limiting (configured at gateway level)
 * - JWT token authentication and device binding
 * - Account lockout after 5 failed attempts
 * - Secure session management with Redis caching
 * - Request tracking and audit trails
 */
@RestController
@RequestMapping("/api/staff/auth")
@CrossOrigin(origins = {"http://localhost:3001", "http://192.168.0.113:3001"})
public class StaffAuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffAuthController.class);
    
    @Autowired
    private StaffAuthService staffAuthService;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    /**
     * Staff Login Endpoint
     * 
     * POST /api/staff/auth/login
     * 
     * Request Body:
     * {
     *   "loginId": "ST001",
     *   "password": "password123",
     *   "deviceInfo": {
     *     "deviceId": "TAB-001",
     *     "deviceType": "TABLET",
     *     "appVersion": "1.0.0",
     *     "deviceName": "Kitchen Tablet 1"
     *   }
     * }
     * 
     * Response:
     * - 200 OK: Successful login with staff data and tokens
     * - 400 Bad Request: Invalid request format or validation errors
     * - 401 Unauthorized: Invalid credentials
     * - 423 Locked: Account is locked due to failed attempts
     * - 409 Conflict: Device not recognized or needs registration
     * - 500 Internal Server Error: System error
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<StaffAuthResponse.StaffAuthData>> login(
            @Valid @RequestBody StaffLoginRequest request,
            BindingResult bindingResult,
            HttpServletRequest httpRequest) {
        
        // Generate unique request ID for tracking
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        
        logger.info("Staff login attempt - RequestId: {}, LoginId: {}, DeviceType: {}", 
                   requestId, request.getLoginId(), 
                   request.getDeviceInfo() != null ? request.getDeviceInfo().getDeviceType() : "unknown");
        
        try {
            // Validate request
            if (bindingResult.hasErrors()) {
                String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("Invalid request format");
                
                logger.warn("Login validation failed - RequestId: {}, Errors: {}", requestId, errorMessage);
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<StaffAuthResponse.StaffAuthData>validationError(errorMessage)
                          .withRequestId(requestId));
            }
            
            // Extract client information
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            // Perform authentication
            StaffAuthResponse authResponse = staffAuthService.login(request, ipAddress, userAgent);
            
            if (authResponse.isSuccess()) {
                logger.info("Login successful - RequestId: {}, StaffId: {}, Role: {}", 
                           requestId, 
                           authResponse.getData().getStaff().getStaffId(),
                           authResponse.getData().getStaff().getRole());
                
                return ResponseEntity.ok()
                    .body(ApiResponse.success("Login successful", authResponse.getData())
                          .withRequestId(requestId));
            } else {
                // Handle different error types
                String errorMessage = authResponse.getMessage();
                HttpStatus status;
                String errorCode;
                
                if (errorMessage.contains("Invalid login credentials")) {
                    status = HttpStatus.UNAUTHORIZED;
                    errorCode = "INVALID_CREDENTIALS";
                } else if (errorMessage.contains("Account is inactive") || errorMessage.contains("locked")) {
                    status = HttpStatus.LOCKED;
                    errorCode = "ACCOUNT_LOCKED";
                } else if (errorMessage.contains("Device")) {
                    status = HttpStatus.CONFLICT;
                    errorCode = "DEVICE_CONFLICT";
                } else {
                    status = HttpStatus.BAD_REQUEST;
                    errorCode = "AUTHENTICATION_FAILED";
                }
                
                logger.warn("Login failed - RequestId: {}, Error: {}, Code: {}", 
                           requestId, errorMessage, errorCode);
                
                return ResponseEntity.status(status)
                    .body(ApiResponse.<StaffAuthResponse.StaffAuthData>error(errorMessage, errorCode)
                          .withRequestId(requestId));
            }
            
        } catch (Exception e) {
            logger.error("Login system error - RequestId: {}, Error: {}", requestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<StaffAuthResponse.StaffAuthData>internalError("Login system temporarily unavailable")
                      .withRequestId(requestId));
        }
    }
    
    /**
     * Quick Switch Staff Endpoint
     * 
     * POST /api/staff/auth/quick-switch
     * 
     * Allows current staff to quickly switch to another staff member using PIN
     */
    @PostMapping("/quick-switch")
    public ResponseEntity<ApiResponse<StaffAuthResponse.StaffAuthData>> quickSwitch(
            @Valid @RequestBody StaffQuickSwitchRequest request,
            BindingResult bindingResult,
            HttpServletRequest httpRequest) {
        
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        
        logger.info("Quick switch attempt - RequestId: {}, CurrentStaff: {}, TargetStaff: {}", 
                   requestId, request.getCurrentStaffId(), request.getTargetStaffId());
        
        try {
            // Validate request
            if (bindingResult.hasErrors()) {
                String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("Invalid request format");
                
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<StaffAuthResponse.StaffAuthData>validationError(errorMessage)
                          .withRequestId(requestId));
            }
            
            // Extract client information
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            // Perform quick switch
            StaffAuthResponse switchResponse = staffAuthService.quickSwitch(request, ipAddress, userAgent);
            
            if (switchResponse.isSuccess()) {
                logger.info("Quick switch successful - RequestId: {}, NewStaff: {}, Role: {}", 
                           requestId,
                           switchResponse.getData().getStaff().getStaffId(),
                           switchResponse.getData().getStaff().getRole());
                
                return ResponseEntity.ok()
                    .body(ApiResponse.success("Quick switch successful", switchResponse.getData())
                          .withRequestId(requestId));
            } else {
                String errorMessage = switchResponse.getMessage();
                HttpStatus status = HttpStatus.BAD_REQUEST;
                String errorCode = "QUICK_SWITCH_FAILED";
                
                if (errorMessage.contains("Invalid PIN")) {
                    status = HttpStatus.UNAUTHORIZED;
                    errorCode = "INVALID_PIN";
                } else if (errorMessage.contains("not found")) {
                    status = HttpStatus.NOT_FOUND;
                    errorCode = "STAFF_NOT_FOUND";
                } else if (errorMessage.contains("not enabled")) {
                    status = HttpStatus.FORBIDDEN;
                    errorCode = "QUICK_SWITCH_DISABLED";
                }
                
                logger.warn("Quick switch failed - RequestId: {}, Error: {}", requestId, errorMessage);
                
                return ResponseEntity.status(status)
                    .body(ApiResponse.<StaffAuthResponse.StaffAuthData>error(errorMessage, errorCode)
                          .withRequestId(requestId));
            }
            
        } catch (Exception e) {
            logger.error("Quick switch system error - RequestId: {}, Error: {}", requestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<StaffAuthResponse.StaffAuthData>internalError("Quick switch temporarily unavailable")
                      .withRequestId(requestId));
        }
    }
    
    /**
     * POST /api/staff/auth/refresh
     * Refresh JWT access token using refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<StaffAuthResponse> refreshToken(
            @Valid @RequestBody StaffTokenRefreshRequest request) {
        
        // Refresh the token
        StaffAuthResponse response = staffAuthService.refreshToken(request);
        
        // Return appropriate HTTP status based on success
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    /**
     * GET /api/staff/auth/profile/{staffId}
     * Get staff profile information by staff ID
     */
    @GetMapping("/profile/{staffId}")
    public ResponseEntity<StaffAuthResponse> getStaffProfile(
            @PathVariable String staffId) {
        
        // Get staff profile
        StaffAuthResponse response = staffAuthService.getStaffProfile(staffId);
        
        // Return appropriate HTTP status based on success
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    /**
     * POST /api/staff/auth/logout
     * Logout staff member and deactivate session
     */
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(
            @RequestHeader("Authorization") String authorization) {
        
        try {
            // Extract token from Authorization header
            String token = null;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7);
            }
            
            if (token == null) {
                return ResponseEntity.badRequest()
                    .body(new LogoutResponse(false, "No authorization token provided"));
            }
            
            // Perform logout
            boolean success = staffAuthService.logout(token);
            
            if (success) {
                return ResponseEntity.ok(new LogoutResponse(true, "Logout successful"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LogoutResponse(false, "Invalid token or logout failed"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new LogoutResponse(false, "Logout failed: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/staff/auth/quick-switch/available
     * Get list of staff available for quick switch
     */
    @GetMapping("/quick-switch/available")
    public ResponseEntity<QuickSwitchAvailableResponse> getQuickSwitchAvailableStaff() {
        
        try {
            var availableStaff = staffAuthService.getQuickSwitchStaff();
            
            // Convert to response format
            var staffList = availableStaff.stream()
                .map(staff -> {
                    var dto = new QuickSwitchStaffInfo();
                    dto.setStaffId(staff.getStaffId());
                    dto.setEmployeeNumber(staff.getEmployeeNumber());
                    dto.setName(staff.getName());
                    dto.setRole(staff.getRole());
                    dto.setDepartment(staff.getDepartment());
                    dto.setAvatar(staff.getAvatarUrl());
                    return dto;
                })
                .toList();
            
            return ResponseEntity.ok(new QuickSwitchAvailableResponse(true, "Success", staffList));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new QuickSwitchAvailableResponse(false, "Failed to get available staff: " + e.getMessage(), null));
        }
    }
    
    /**
     * POST /api/staff/auth/session/cleanup
     * Admin endpoint to cleanup expired sessions
     */
    @PostMapping("/session/cleanup")
    public ResponseEntity<SessionCleanupResponse> cleanupExpiredSessions() {
        
        try {
            int cleanedSessions = staffAuthService.cleanupExpiredSessions();
            
            return ResponseEntity.ok(new SessionCleanupResponse(
                true, 
                "Session cleanup completed", 
                cleanedSessions
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new SessionCleanupResponse(
                    false, 
                    "Session cleanup failed: " + e.getMessage(), 
                    0
                ));
        }
    }
    
    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    // Response DTOs for additional endpoints
    
    /**
     * Logout Response DTO
     */
    public static class LogoutResponse {
        private boolean success;
        private String message;
        
        public LogoutResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    /**
     * Quick Switch Available Staff Response DTO
     */
    public static class QuickSwitchAvailableResponse {
        private boolean success;
        private String message;
        private java.util.List<QuickSwitchStaffInfo> data;
        
        public QuickSwitchAvailableResponse(boolean success, String message, java.util.List<QuickSwitchStaffInfo> data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public java.util.List<QuickSwitchStaffInfo> getData() { return data; }
        public void setData(java.util.List<QuickSwitchStaffInfo> data) { this.data = data; }
    }
    
    /**
     * Quick Switch Staff Info DTO
     */
    public static class QuickSwitchStaffInfo {
        private String staffId;
        private String employeeNumber;
        private String name;
        private String role;
        private String department;
        private String avatar;
        
        // Getters and setters
        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
        
        public String getEmployeeNumber() { return employeeNumber; }
        public void setEmployeeNumber(String employeeNumber) { this.employeeNumber = employeeNumber; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
    }
    
    /**
     * Session Cleanup Response DTO
     */
    public static class SessionCleanupResponse {
        private boolean success;
        private String message;
        private int cleanedSessions;
        
        public SessionCleanupResponse(boolean success, String message, int cleanedSessions) {
            this.success = success;
            this.message = message;
            this.cleanedSessions = cleanedSessions;
        }
        
        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public int getCleanedSessions() { return cleanedSessions; }
        public void setCleanedSessions(int cleanedSessions) { this.cleanedSessions = cleanedSessions; }
    }
}