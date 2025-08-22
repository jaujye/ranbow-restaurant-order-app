package com.ranbow.restaurant.staff.security;

import com.ranbow.restaurant.staff.model.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Staff Security Configuration
 * Implements enterprise-grade security for staff authentication system
 * 
 * Security Features:
 * - JWT authentication with role-based access control
 * - CORS configuration for frontend integration  
 * - Stateless session management
 * - Security headers for XSS, CSRF protection
 * - Rate limiting integration points
 * - Device binding validation
 * - Comprehensive error handling
 * 
 * Access Control:
 * - Public: /api/staff/auth/login, /api/staff/auth/health
 * - Authenticated: All other staff endpoints
 * - Role-based: Kitchen staff can't access admin functions
 * - Device-validated: All operations require device binding
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class StaffSecurityConfig {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Password encoder for staff credentials
     * Uses BCrypt with strength 12 for enhanced security
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    /**
     * Authentication manager for staff authentication
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    /**
     * JWT Authentication Filter
     * Validates JWT tokens and sets security context
     */
    @Bean
    public StaffJwtAuthenticationFilter jwtAuthenticationFilter() {
        return new StaffJwtAuthenticationFilter(jwtTokenProvider);
    }
    
    /**
     * CORS Configuration for Staff Frontend
     * Allows React staff UI to communicate with backend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow specific origins for production security
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3001",           // Local React dev server
            "http://192.168.0.113:3001",       // Production staff UI
            "http://localhost:5173",           // Vite dev server
            "https://staff.ranbow-restaurant.local"  // Production domain
        ));
        
        // Allow essential HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Allow required headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With",
            "X-Device-ID",
            "X-App-Version",
            "Accept",
            "Origin"
        ));
        
        // Expose useful headers to frontend
        configuration.setExposedHeaders(Arrays.asList(
            "X-Request-ID",
            "X-Rate-Limit-Remaining",
            "X-Session-Timeout"
        ));
        
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight requests for 1 hour
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/staff/**", configuration);
        
        return source;
    }
    
    /**
     * Main Security Filter Chain
     * Configures authentication, authorization, and security features
     */
    @Bean
    public SecurityFilterChain staffSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            // CORS configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CSRF protection (disabled for JWT stateless authentication)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Session management (stateless for JWT)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Security headers
            .headers(headers -> headers
                .frameOptions().deny() // Prevent clickjacking
                .contentTypeOptions().and() // Prevent MIME sniffing
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000) // 1 year HSTS
                    .includeSubdomains(true)
                    .preload(true)
                )
            )
            
            // Authorization rules
            .authorizeHttpRequests(authz -> authz
                // Public endpoints - no authentication required
                .requestMatchers(HttpMethod.POST, "/api/staff/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/staff/auth/health").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/api/staff/**").permitAll() // CORS preflight
                
                // Authentication required endpoints
                .requestMatchers(HttpMethod.POST, "/api/staff/auth/refresh").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/staff/auth/logout").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/staff/auth/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/staff/auth/quick-switch").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/staff/auth/quick-switch/available").authenticated()
                
                // Admin-only endpoints
                .requestMatchers(HttpMethod.POST, "/api/staff/auth/session/cleanup").hasRole("ADMIN")
                .requestMatchers("/api/staff/admin/**").hasRole("ADMIN")
                
                // Kitchen staff endpoints
                .requestMatchers("/api/staff/kitchen/**").hasAnyRole("KITCHEN", "ADMIN")
                
                // Service staff endpoints
                .requestMatchers("/api/staff/service/**").hasAnyRole("SERVICE", "ADMIN")
                
                // Manager endpoints
                .requestMatchers("/api/staff/manager/**").hasAnyRole("MANAGER", "ADMIN")
                
                // All other staff endpoints require authentication
                .requestMatchers("/api/staff/**").authenticated()
                
                // Default: all other requests need authentication
                .anyRequest().authenticated()
            )
            
            // Exception handling
            .exceptionHandling(exceptions -> exceptions
                // Handle authentication failures
                .authenticationEntryPoint((request, response, authException) -> {
                    handleSecurityException(response, HttpServletResponse.SC_UNAUTHORIZED, 
                                          "Authentication required", "AUTHENTICATION_REQUIRED");
                })
                // Handle authorization failures
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    handleSecurityException(response, HttpServletResponse.SC_FORBIDDEN,
                                          "Insufficient permissions", "ACCESS_DENIED");
                })
            )
            
            // Add JWT filter before username/password authentication filter
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    /**
     * Handle security exceptions with standardized API response format
     */
    private void handleSecurityException(HttpServletResponse response, int status, 
                                       String message, String errorCode) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        ApiResponse<Void> errorResponse = ApiResponse.error(message, errorCode);
        errorResponse.setTimestamp(LocalDateTime.now());
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }
    
    /**
     * Rate Limiting Configuration Bean
     * Integrates with external rate limiting service or in-memory store
     */
    @Bean
    public RateLimitConfig rateLimitConfig() {
        RateLimitConfig config = new RateLimitConfig();
        
        // Login endpoint rate limiting
        config.addRule("/api/staff/auth/login", 5, 60); // 5 attempts per minute
        
        // Quick switch rate limiting
        config.addRule("/api/staff/auth/quick-switch", 10, 60); // 10 switches per minute
        
        // General API rate limiting
        config.addRule("/api/staff/**", 100, 60); // 100 requests per minute per user
        
        // Admin operations rate limiting
        config.addRule("/api/staff/admin/**", 20, 60); // 20 admin operations per minute
        
        return config;
    }
    
    /**
     * Rate Limiting Configuration Helper
     * Defines rate limit rules for different endpoints
     */
    public static class RateLimitConfig {
        private final List<RateLimitRule> rules = new java.util.ArrayList<>();
        
        public void addRule(String pattern, int requests, int timeWindowSeconds) {
            rules.add(new RateLimitRule(pattern, requests, timeWindowSeconds));
        }
        
        public List<RateLimitRule> getRules() {
            return rules;
        }
        
        public static class RateLimitRule {
            private final String pattern;
            private final int requests;
            private final int timeWindowSeconds;
            
            public RateLimitRule(String pattern, int requests, int timeWindowSeconds) {
                this.pattern = pattern;
                this.requests = requests;
                this.timeWindowSeconds = timeWindowSeconds;
            }
            
            // Getters
            public String getPattern() { return pattern; }
            public int getRequests() { return requests; }
            public int getTimeWindowSeconds() { return timeWindowSeconds; }
        }
    }
    
    /**
     * Security Audit Configuration
     * Enables security event logging and monitoring
     */
    @Bean
    public SecurityAuditConfig securityAuditConfig() {
        SecurityAuditConfig config = new SecurityAuditConfig();
        
        // Enable audit events
        config.setAuditEnabled(true);
        config.setLogFailedLogins(true);
        config.setLogSuccessfulLogins(true);
        config.setLogPermissionDenials(true);
        config.setLogSuspiciousActivity(true);
        
        // Audit retention
        config.setAuditRetentionDays(90);
        
        // Alert thresholds
        config.setFailedLoginThreshold(5); // Alert after 5 failed attempts
        config.setSuspiciousActivityThreshold(10); // Alert after 10 suspicious events
        
        return config;
    }
    
    /**
     * Security Audit Configuration Helper
     */
    public static class SecurityAuditConfig {
        private boolean auditEnabled = true;
        private boolean logFailedLogins = true;
        private boolean logSuccessfulLogins = false;
        private boolean logPermissionDenials = true;
        private boolean logSuspiciousActivity = true;
        private int auditRetentionDays = 90;
        private int failedLoginThreshold = 5;
        private int suspiciousActivityThreshold = 10;
        
        // Getters and setters
        public boolean isAuditEnabled() { return auditEnabled; }
        public void setAuditEnabled(boolean auditEnabled) { this.auditEnabled = auditEnabled; }
        
        public boolean isLogFailedLogins() { return logFailedLogins; }
        public void setLogFailedLogins(boolean logFailedLogins) { this.logFailedLogins = logFailedLogins; }
        
        public boolean isLogSuccessfulLogins() { return logSuccessfulLogins; }
        public void setLogSuccessfulLogins(boolean logSuccessfulLogins) { this.logSuccessfulLogins = logSuccessfulLogins; }
        
        public boolean isLogPermissionDenials() { return logPermissionDenials; }
        public void setLogPermissionDenials(boolean logPermissionDenials) { this.logPermissionDenials = logPermissionDenials; }
        
        public boolean isLogSuspiciousActivity() { return logSuspiciousActivity; }
        public void setLogSuspiciousActivity(boolean logSuspiciousActivity) { this.logSuspiciousActivity = logSuspiciousActivity; }
        
        public int getAuditRetentionDays() { return auditRetentionDays; }
        public void setAuditRetentionDays(int auditRetentionDays) { this.auditRetentionDays = auditRetentionDays; }
        
        public int getFailedLoginThreshold() { return failedLoginThreshold; }
        public void setFailedLoginThreshold(int failedLoginThreshold) { this.failedLoginThreshold = failedLoginThreshold; }
        
        public int getSuspiciousActivityThreshold() { return suspiciousActivityThreshold; }
        public void setSuspiciousActivityThreshold(int suspiciousActivityThreshold) { this.suspiciousActivityThreshold = suspiciousActivityThreshold; }
    }
}