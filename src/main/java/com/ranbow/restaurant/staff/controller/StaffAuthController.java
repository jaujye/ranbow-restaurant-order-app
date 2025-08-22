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
     * Refresh Token Endpoint
     * 
     * POST /api/staff/auth/refresh
     * 
     * Refreshes access token using valid refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<StaffAuthResponse.StaffAuthData>> refreshToken(
            @Valid @RequestBody StaffTokenRefreshRequest request,
            BindingResult bindingResult) {
        
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        
        logger.info("Token refresh attempt - RequestId: {}, DeviceId: {}", 
                   requestId, request.getDeviceId());
        
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
            
            // Perform token refresh
            StaffAuthResponse refreshResponse = staffAuthService.refreshToken(request);
            
            if (refreshResponse.isSuccess()) {
                logger.info("Token refresh successful - RequestId: {}, StaffId: {}", 
                           requestId, refreshResponse.getData().getStaff().getStaffId());
                
                return ResponseEntity.ok()
                    .body(ApiResponse.success("Token refresh successful", refreshResponse.getData())
                          .withRequestId(requestId));
            } else {
                String errorMessage = refreshResponse.getMessage();
                HttpStatus status;
                String errorCode;
                
                if (errorMessage.contains("Invalid refresh token") || errorMessage.contains("expired")) {
                    status = HttpStatus.valueOf(440); // Session expired
                    errorCode = "SESSION_EXPIRED";
                } else if (errorMessage.contains("Device ID mismatch")) {
                    status = HttpStatus.FORBIDDEN;
                    errorCode = "DEVICE_MISMATCH";
                } else {
                    status = HttpStatus.UNAUTHORIZED;
                    errorCode = "REFRESH_FAILED";
                }
                
                logger.warn("Token refresh failed - RequestId: {}, Error: {}", requestId, errorMessage);
                
                return ResponseEntity.status(status)
                    .body(ApiResponse.<StaffAuthResponse.StaffAuthData>error(errorMessage, errorCode)
                          .withRequestId(requestId));
            }
            
        } catch (Exception e) {
            logger.error("Token refresh system error - RequestId: {}, Error: {}", requestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<StaffAuthResponse.StaffAuthData>internalError("Token refresh temporarily unavailable")
                      .withRequestId(requestId));
        }
    }
    
    /**
     * Get Current Staff Profile Endpoint
     * 
     * GET /api/staff/auth/me
     * 
     * Returns current authenticated staff information
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StaffAuthResponse.StaffAuthData>> getCurrentStaff(
            @RequestHeader("Authorization") String authorizationHeader) {
        
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        
        logger.info("Get current staff profile - RequestId: {}", requestId);
        
        try {
            // Extract token from Authorization header
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<StaffAuthResponse.StaffAuthData>badRequest("Invalid authorization header format")
                          .withRequestId(requestId));
            }
            
            String accessToken = authorizationHeader.substring(7);
            
            // Validate token and extract staff ID
            if (!jwtTokenProvider.validateToken(accessToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<StaffAuthResponse.StaffAuthData>unauthorized("Invalid or expired token")
                          .withRequestId(requestId));
            }
            
            String staffId = jwtTokenProvider.getStaffIdFromToken(accessToken);
            
            // Get staff profile
            StaffAuthResponse profileResponse = staffAuthService.getStaffProfile(staffId);
            
            if (profileResponse.isSuccess()) {
                logger.info("Get profile successful - RequestId: {}, StaffId: {}", requestId, staffId);
                
                return ResponseEntity.ok()
                    .body(ApiResponse.success("Profile retrieved successfully", profileResponse.getData())
                          .withRequestId(requestId));
            } else {
                logger.warn("Profile not found - RequestId: {}, StaffId: {}", requestId, staffId);
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<StaffAuthResponse.StaffAuthData>notFound("Staff profile not found")
                          .withRequestId(requestId));
            }
            
        } catch (Exception e) {
            logger.error("Get profile system error - RequestId: {}, Error: {}", requestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<StaffAuthResponse.StaffAuthData>internalError("Profile service temporarily unavailable")
                      .withRequestId(requestId));
        }
    }
    
    /**
     * Logout Endpoint
     * 
     * POST /api/staff/auth/logout
     * 
     * Invalidates current session and tokens
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader("Authorization") String authorizationHeader) {
        
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        
        logger.info("Logout attempt - RequestId: {}", requestId);
        
        try {
            // Extract token from Authorization header
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<Void>badRequest("Invalid authorization header format")
                          .withRequestId(requestId));
            }
            
            String accessToken = authorizationHeader.substring(7);
            
            // Perform logout
            boolean logoutSuccess = staffAuthService.logout(accessToken);
            
            if (logoutSuccess) {
                logger.info("Logout successful - RequestId: {}", requestId);
                return ResponseEntity.ok()
                    .body(ApiResponse.success("Logout successful").withRequestId(requestId));
            } else {
                logger.warn("Logout failed - RequestId: {}, Invalid token", requestId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>unauthorized("Invalid or expired token")
                          .withRequestId(requestId));
            }
            
        } catch (Exception e) {
            logger.error("Logout system error - RequestId: {}, Error: {}", requestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>internalError("Logout temporarily unavailable")
                      .withRequestId(requestId));
        }
    }
    
    /**
     * Health Check Endpoint
     * 
     * GET /api/staff/auth/health
     * 
     * Simple health check for the authentication service
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok()
            .body(ApiResponse.success("Staff authentication service is healthy", "OK"));
    }
    
    /**
     * Get Available Staff for Quick Switch
     * 
     * GET /api/staff/auth/quick-switch/available
     * 
     * Returns list of staff members available for quick switch
     */
    @GetMapping("/quick-switch/available")
    public ResponseEntity<ApiResponse<java.util.List<QuickSwitchStaffInfo>>> getQuickSwitchAvailableStaff() {
        
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        
        logger.info("Get quick switch available staff - RequestId: {}", requestId);
        
        try {
            var availableStaff = staffAuthService.getQuickSwitchStaff();
            
            // Convert to response format
            var staffList = availableStaff.stream()
                .map(staff -> {
                    // Cast to enhanced StaffMemberSimple to access additional fields
                    var enhancedStaff = (com.ranbow.restaurant.staff.repository.StaffAuthRepositorySimple.StaffMemberSimple) staff;
                    var dto = new QuickSwitchStaffInfo();
                    dto.setStaffId(enhancedStaff.getStaffId());
                    dto.setEmployeeNumber(enhancedStaff.getEmployeeNumber());
                    dto.setName(enhancedStaff.getName());
                    dto.setRole(enhancedStaff.getRole() != null ? enhancedStaff.getRole().name() : "SERVICE");
                    dto.setDepartment(enhancedStaff.getDepartment());
                    dto.setAvatar(enhancedStaff.getAvatarUrl());
                    return dto;
                })
                .toList();
            
            logger.info("Retrieved {} available staff for quick switch - RequestId: {}", staffList.size(), requestId);
            
            return ResponseEntity.ok()
                .body(ApiResponse.success("Available staff retrieved successfully", staffList)
                      .withRequestId(requestId));
            
        } catch (Exception e) {
            logger.error("Get available staff system error - RequestId: {}, Error: {}", requestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<java.util.List<QuickSwitchStaffInfo>>internalError("Service temporarily unavailable")
                      .withRequestId(requestId));
        }
    }
    
    /**
     * Session Cleanup Endpoint
     * 
     * POST /api/staff/auth/session/cleanup
     * 
     * Admin endpoint to cleanup expired sessions
     */
    @PostMapping("/session/cleanup")
    public ResponseEntity<ApiResponse<SessionCleanupResponse>> cleanupExpiredSessions() {
        
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        
        logger.info("Session cleanup request - RequestId: {}", requestId);
        
        try {
            int cleanedSessions = staffAuthService.cleanupExpiredSessions();
            
            SessionCleanupResponse response = new SessionCleanupResponse(
                true, 
                "Session cleanup completed", 
                cleanedSessions
            );
            
            logger.info("Session cleanup completed - RequestId: {}, CleanedSessions: {}", requestId, cleanedSessions);
            
            return ResponseEntity.ok()
                .body(ApiResponse.success("Session cleanup completed", response)
                      .withRequestId(requestId));
            
        } catch (Exception e) {
            logger.error("Session cleanup error - RequestId: {}, Error: {}", requestId, e.getMessage(), e);
            
            SessionCleanupResponse response = new SessionCleanupResponse(
                false, 
                "Session cleanup failed: " + e.getMessage(), 
                0
            );
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<SessionCleanupResponse>internalError("Session cleanup failed")
                      .withRequestId(requestId));
        }
    }
    
    /**
     * Extract client IP address from HTTP request
     * Handles various proxy headers for accurate IP detection
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xForwardedProto = request.getHeader("X-Forwarded-Proto");
        if (xForwardedProto != null && !xForwardedProto.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedProto)) {
            return xForwardedProto;
        }
        
        return request.getRemoteAddr();
    }
    
    // =====================================
    // Response DTOs
    // =====================================
    
    /**
     * Quick Switch Staff Info DTO
     * Simplified staff information for quick switch selection
     */
    public static class QuickSwitchStaffInfo {
        private String staffId;
        private String employeeNumber;
        private String name;
        private String role;
        private String department;
        private String avatar;
        
        // Constructors
        public QuickSwitchStaffInfo() {}
        
        public QuickSwitchStaffInfo(String staffId, String employeeNumber, String name, String role, String department, String avatar) {
            this.staffId = staffId;
            this.employeeNumber = employeeNumber;
            this.name = name;
            this.role = role;
            this.department = department;
            this.avatar = avatar;
        }
        
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
     * Response for the session cleanup administrative operation
     */
    public static class SessionCleanupResponse {
        private boolean success;
        private String message;
        private int cleanedSessions;
        
        // Constructors
        public SessionCleanupResponse() {}
        
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
        
        @Override
        public String toString() {
            return "SessionCleanupResponse{" +
                    "success=" + success +
                    ", message='" + message + '\'' +
                    ", cleanedSessions=" + cleanedSessions +
                    '}';
        }
    }
}