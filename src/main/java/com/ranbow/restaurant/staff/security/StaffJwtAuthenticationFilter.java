package com.ranbow.restaurant.staff.security;

import com.ranbow.restaurant.staff.model.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT Authentication Filter for Staff System
 * 
 * This filter intercepts HTTP requests and validates JWT tokens.
 * It extracts staff information from valid tokens and sets the security context.
 * 
 * Features:
 * - JWT token validation and parsing
 * - Device ID verification
 * - Role and permission extraction
 * - Security context population
 * - Comprehensive error handling
 * - Request tracking and logging
 * 
 * Security Checks:
 * - Token signature validation
 * - Token expiration verification
 * - Device ID binding validation
 * - Token type verification (access tokens only)
 * - Malformed token detection
 */
public class StaffJwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffJwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String DEVICE_ID_HEADER = "X-Device-ID";
    
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public StaffJwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String requestId = generateRequestId();
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        
        try {
            // Skip authentication for public endpoints
            if (isPublicEndpoint(requestPath, method)) {
                logger.debug("Skipping authentication for public endpoint: {} {}", method, requestPath);
                filterChain.doFilter(request, response);
                return;
            }
            
            // Extract JWT token from request
            String token = extractTokenFromRequest(request);
            
            if (token == null) {
                logger.debug("No JWT token found in request to: {} {}", method, requestPath);
                filterChain.doFilter(request, response);
                return;
            }
            
            // Validate and process token
            if (validateAndSetAuthentication(token, request, requestId)) {
                logger.debug("JWT authentication successful for: {} {} - RequestId: {}", method, requestPath, requestId);
            } else {
                logger.warn("JWT authentication failed for: {} {} - RequestId: {}", method, requestPath, requestId);
                handleAuthenticationError(response, "Invalid or expired authentication token", "INVALID_TOKEN", requestId);
                return;
            }
            
        } catch (Exception e) {
            logger.error("Authentication filter error - RequestId: {}, Path: {} {}, Error: {}", 
                        requestId, method, requestPath, e.getMessage(), e);
            handleAuthenticationError(response, "Authentication system error", "AUTHENTICATION_ERROR", requestId);
            return;
        }
        
        // Continue filter chain
        filterChain.doFilter(request, response);
    }
    
    /**
     * Extract JWT token from Authorization header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        
        if (StringUtils.hasText(authHeader) && authHeader.startsWith(BEARER_PREFIX)) {
            return authHeader.substring(BEARER_PREFIX.length());
        }
        
        return null;
    }
    
    /**
     * Validate JWT token and set Spring Security authentication context
     */
    private boolean validateAndSetAuthentication(String token, HttpServletRequest request, String requestId) {
        try {
            // Basic token validation
            if (!jwtTokenProvider.validateToken(token)) {
                logger.debug("Token validation failed - RequestId: {}", requestId);
                return false;
            }
            
            // Extract claims from token
            Claims claims = jwtTokenProvider.getClaimsFromToken(token);
            
            // Verify token type (only accept access tokens)
            String tokenType = claims.get("tokenType", String.class);
            if (!"access".equals(tokenType)) {
                logger.warn("Invalid token type '{}' provided - RequestId: {}", tokenType, requestId);
                return false;
            }
            
            // Extract staff information
            String staffId = claims.getSubject();
            String employeeNumber = claims.get("employeeNumber", String.class);
            String name = claims.get("name", String.class);
            String role = claims.get("role", String.class);
            String tokenDeviceId = claims.get("deviceId", String.class);
            
            @SuppressWarnings("unchecked")
            List<String> permissions = claims.get("permissions", List.class);
            
            // Validate required claims
            if (staffId == null || role == null) {
                logger.warn("Missing required claims in token - RequestId: {}", requestId);
                return false;
            }
            
            // Device ID verification (optional but recommended)
            String requestDeviceId = request.getHeader(DEVICE_ID_HEADER);
            if (tokenDeviceId != null && requestDeviceId != null && !tokenDeviceId.equals(requestDeviceId)) {
                logger.warn("Device ID mismatch - Token: {}, Request: {} - RequestId: {}", 
                           tokenDeviceId, requestDeviceId, requestId);
                // Note: This is a warning, not a failure, to allow for device changes
            }
            
            // Create authorities from role and permissions
            List<SimpleGrantedAuthority> authorities = createAuthorities(role, permissions);
            
            // Create authentication object
            StaffAuthenticationToken authentication = new StaffAuthenticationToken(
                staffId, employeeNumber, name, role, permissions, tokenDeviceId, authorities
            );
            
            // Set additional details
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            
            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            logger.debug("Authentication set for staff: {} ({}), Role: {} - RequestId: {}", 
                        name, employeeNumber, role, requestId);
            
            return true;
            
        } catch (Exception e) {
            logger.error("Error processing JWT token - RequestId: {}, Error: {}", requestId, e.getMessage());
            return false;
        }
    }
    
    /**
     * Create Spring Security authorities from role and permissions
     */
    private List<SimpleGrantedAuthority> createAuthorities(String role, List<String> permissions) {
        List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
        
        // Add role authority (Spring Security requires ROLE_ prefix)
        if (role != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        }
        
        // Add permission authorities
        if (permissions != null) {
            List<SimpleGrantedAuthority> permissionAuthorities = permissions.stream()
                .map(permission -> new SimpleGrantedAuthority(permission))
                .collect(Collectors.toList());
            authorities.addAll(permissionAuthorities);
        }
        
        return authorities;
    }
    
    /**
     * Check if the endpoint is public and doesn't require authentication
     */
    private boolean isPublicEndpoint(String path, String method) {
        // Login endpoint
        if ("/api/staff/auth/login".equals(path) && "POST".equals(method)) {
            return true;
        }
        
        // Health check endpoint
        if ("/api/staff/auth/health".equals(path) && "GET".equals(method)) {
            return true;
        }
        
        // CORS preflight requests
        if ("OPTIONS".equals(method)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle authentication errors with standardized JSON response
     */
    private void handleAuthenticationError(HttpServletResponse response, String message, 
                                         String errorCode, String requestId) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        ApiResponse<Void> errorResponse = ApiResponse.error(message, errorCode);
        errorResponse.setTimestamp(LocalDateTime.now());
        errorResponse.setRequestId(requestId);
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }
    
    /**
     * Generate unique request ID for tracking
     */
    private String generateRequestId() {
        return java.util.UUID.randomUUID().toString().substring(0, 8);
    }
    
    /**
     * Custom Authentication Token for Staff System
     * Extends UsernamePasswordAuthenticationToken with staff-specific information
     */
    public static class StaffAuthenticationToken extends UsernamePasswordAuthenticationToken {
        private final String staffId;
        private final String employeeNumber;
        private final String name;
        private final String role;
        private final List<String> permissions;
        private final String deviceId;
        
        public StaffAuthenticationToken(String staffId, String employeeNumber, String name,
                                       String role, List<String> permissions, String deviceId,
                                       List<SimpleGrantedAuthority> authorities) {
            super(staffId, null, authorities);
            this.staffId = staffId;
            this.employeeNumber = employeeNumber;
            this.name = name;
            this.role = role;
            this.permissions = permissions;
            this.deviceId = deviceId;
        }
        
        // Getters for staff-specific information
        public String getStaffId() { return staffId; }
        public String getEmployeeNumber() { return employeeNumber; }
        public String getStaffName() { return name; }
        public String getRole() { return role; }
        public List<String> getPermissions() { return permissions; }
        public String getDeviceId() { return deviceId; }
        
        @Override
        public String toString() {
            return "StaffAuthenticationToken{" +
                    "staffId='" + staffId + '\'' +
                    ", employeeNumber='" + employeeNumber + '\'' +
                    ", name='" + name + '\'' +
                    ", role='" + role + '\'' +
                    ", deviceId='" + deviceId + '\'' +
                    ", permissions=" + permissions +
                    '}';
        }
    }
}