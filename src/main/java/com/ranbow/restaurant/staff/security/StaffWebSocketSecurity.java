package com.ranbow.restaurant.staff.security;

import com.ranbow.restaurant.staff.service.StaffSessionRedisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket Security Configuration for Staff Management System
 * 
 * Provides security features for WebSocket connections including:
 * - JWT token validation
 * - Connection rate limiting
 * - Session validation
 * - IP-based restrictions
 * - Connection monitoring and audit logging
 * 
 * This interceptor is applied to all WebSocket endpoints to ensure
 * secure connections and prevent unauthorized access.
 */
@Component
public class StaffWebSocketSecurity implements HandshakeInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffWebSocketSecurity.class);
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private StaffSessionRedisService sessionRedisService;
    
    // Rate limiting and connection tracking
    private final Map<String, ConnectionInfo> connectionsByIp = new ConcurrentHashMap<>();
    private final Map<String, Long> lastConnectionAttempt = new ConcurrentHashMap<>();
    
    // Configuration constants
    private static final int MAX_CONNECTIONS_PER_IP = 10;
    private static final long RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
    private static final int MAX_ATTEMPTS_PER_WINDOW = 30;
    private static final String BEARER_PREFIX = "Bearer ";
    
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        
        String clientIp = getClientIpAddress(request);
        String userAgent = getUserAgent(request);
        URI uri = request.getURI();
        
        logger.info("WebSocket handshake attempt from IP: {} for URI: {}", clientIp, uri);
        
        try {
            // 1. Rate Limiting Check
            if (!checkRateLimit(clientIp)) {
                logger.warn("Rate limit exceeded for IP: {}", clientIp);
                response.setStatusCode(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS);
                return false;
            }
            
            // 2. Connection Limit Check
            if (!checkConnectionLimit(clientIp)) {
                logger.warn("Connection limit exceeded for IP: {}", clientIp);
                response.setStatusCode(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS);
                return false;
            }
            
            // 3. Extract and validate authentication token
            String token = extractToken(request);
            if (token == null) {
                logger.warn("No authentication token provided for WebSocket connection from IP: {}", clientIp);
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
            
            // 4. Validate JWT token
            if (!jwtTokenProvider.validateToken(token)) {
                logger.warn("Invalid JWT token for WebSocket connection from IP: {}", clientIp);
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
            
            // 5. Extract staff ID from token
            String staffId = jwtTokenProvider.getStaffIdFromToken(token);
            if (staffId == null || staffId.isEmpty()) {
                logger.warn("No staff ID found in JWT token for WebSocket connection from IP: {}", clientIp);
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
            
            // 6. Validate active session
            if (sessionRedisService.getSession(staffId) == null) {
                logger.warn("No active session found for staff {} attempting WebSocket connection", staffId);
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
            
            // 7. Check if account is locked
            if (sessionRedisService.isAccountLocked(staffId)) {
                logger.warn("Account locked for staff {} attempting WebSocket connection", staffId);
                response.setStatusCode(org.springframework.http.HttpStatus.FORBIDDEN);
                return false;
            }
            
            // 8. Store connection information
            recordConnection(clientIp, staffId, userAgent);
            
            // 9. Add attributes to WebSocket session
            attributes.put("staffId", staffId);
            attributes.put("clientIp", clientIp);
            attributes.put("userAgent", userAgent);
            attributes.put("connectTime", System.currentTimeMillis());
            attributes.put("authenticated", true);
            
            logger.info("WebSocket handshake approved for staff: {} from IP: {}", staffId, clientIp);
            return true;
            
        } catch (Exception e) {
            logger.error("Error during WebSocket handshake security check for IP {}: ", clientIp, e);
            response.setStatusCode(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
            return false;
        }
    }
    
    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        
        String clientIp = getClientIpAddress(request);
        
        if (exception != null) {
            logger.error("WebSocket handshake failed for IP {}: ", clientIp, exception);
            removeConnection(clientIp);
        } else {
            logger.info("WebSocket handshake completed successfully for IP: {}", clientIp);
        }
    }
    
    // Security helper methods
    
    /**
     * Extract JWT token from request headers or query parameters
     */
    private String extractToken(ServerHttpRequest request) {
        // Try Authorization header first
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            return authHeader.substring(BEARER_PREFIX.length());
        }
        
        // Try Sec-WebSocket-Protocol header (some clients use this)
        String protocolHeader = request.getHeaders().getFirst("Sec-WebSocket-Protocol");
        if (protocolHeader != null && protocolHeader.startsWith(BEARER_PREFIX)) {
            return protocolHeader.substring(BEARER_PREFIX.length());
        }
        
        // Try query parameter as fallback
        String query = request.getURI().getQuery();
        if (query != null && query.contains("token=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("token=")) {
                    return param.substring(6); // Remove "token="
                }
            }
        }
        
        return null;
    }
    
    /**
     * Check rate limiting for connection attempts
     */
    private boolean checkRateLimit(String clientIp) {
        long currentTime = System.currentTimeMillis();
        Long lastAttempt = lastConnectionAttempt.get(clientIp);
        
        if (lastAttempt == null || (currentTime - lastAttempt) > RATE_LIMIT_WINDOW_MS) {
            // Reset attempt counter for new window
            ConnectionInfo info = connectionsByIp.get(clientIp);
            if (info != null) {
                info.resetAttemptCount();
            }
        }
        
        // Update last attempt time
        lastConnectionAttempt.put(clientIp, currentTime);
        
        // Check attempt count
        ConnectionInfo info = connectionsByIp.computeIfAbsent(clientIp, k -> new ConnectionInfo());
        info.incrementAttempts();
        
        return info.getAttemptCount() <= MAX_ATTEMPTS_PER_WINDOW;
    }
    
    /**
     * Check connection limit per IP address
     */
    private boolean checkConnectionLimit(String clientIp) {
        ConnectionInfo info = connectionsByIp.get(clientIp);
        return info == null || info.getActiveConnections() < MAX_CONNECTIONS_PER_IP;
    }
    
    /**
     * Record successful connection
     */
    private void recordConnection(String clientIp, String staffId, String userAgent) {
        ConnectionInfo info = connectionsByIp.computeIfAbsent(clientIp, k -> new ConnectionInfo());
        info.addConnection(staffId, userAgent);
        
        logger.debug("Recorded connection for staff {} from IP {}", staffId, clientIp);
    }
    
    /**
     * Remove connection tracking
     */
    private void removeConnection(String clientIp) {
        ConnectionInfo info = connectionsByIp.get(clientIp);
        if (info != null) {
            info.removeConnection();
            if (info.getActiveConnections() == 0) {
                connectionsByIp.remove(clientIp);
            }
        }
    }
    
    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(ServerHttpRequest request) {
        // Check X-Forwarded-For header first (for load balancers/proxies)
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        // Check X-Real-IP header
        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        // Fall back to remote address
        return request.getRemoteAddress() != null ? 
               request.getRemoteAddress().getAddress().getHostAddress() : "unknown";
    }
    
    /**
     * Get user agent from request
     */
    private String getUserAgent(ServerHttpRequest request) {
        return request.getHeaders().getFirst("User-Agent");
    }
    
    /**
     * Get connection statistics
     */
    public Map<String, Object> getConnectionStatistics() {
        Map<String, Object> stats = new ConcurrentHashMap<>();
        
        int totalConnections = 0;
        int totalIps = connectionsByIp.size();
        
        for (ConnectionInfo info : connectionsByIp.values()) {
            totalConnections += info.getActiveConnections();
        }
        
        stats.put("totalActiveConnections", totalConnections);
        stats.put("uniqueIpAddresses", totalIps);
        stats.put("maxConnectionsPerIp", MAX_CONNECTIONS_PER_IP);
        stats.put("rateLimitWindow", RATE_LIMIT_WINDOW_MS);
        stats.put("maxAttemptsPerWindow", MAX_ATTEMPTS_PER_WINDOW);
        stats.put("timestamp", System.currentTimeMillis());
        
        return stats;
    }
    
    /**
     * Cleanup expired connection tracking data
     */
    public void cleanupExpiredConnections() {
        long currentTime = System.currentTimeMillis();
        
        connectionsByIp.entrySet().removeIf(entry -> {
            ConnectionInfo info = entry.getValue();
            return info.getActiveConnections() == 0 && 
                   (currentTime - info.getLastActivity()) > (RATE_LIMIT_WINDOW_MS * 2);
        });
        
        lastConnectionAttempt.entrySet().removeIf(entry -> 
            (currentTime - entry.getValue()) > (RATE_LIMIT_WINDOW_MS * 2));
    }
    
    // Inner class for connection tracking
    private static class ConnectionInfo {
        private int activeConnections = 0;
        private int attemptCount = 0;
        private long lastActivity = System.currentTimeMillis();
        private String lastStaffId;
        private String lastUserAgent;
        
        public void addConnection(String staffId, String userAgent) {
            this.activeConnections++;
            this.lastActivity = System.currentTimeMillis();
            this.lastStaffId = staffId;
            this.lastUserAgent = userAgent;
        }
        
        public void removeConnection() {
            if (this.activeConnections > 0) {
                this.activeConnections--;
            }
            this.lastActivity = System.currentTimeMillis();
        }
        
        public void incrementAttempts() {
            this.attemptCount++;
        }
        
        public void resetAttemptCount() {
            this.attemptCount = 0;
        }
        
        public int getActiveConnections() {
            return activeConnections;
        }
        
        public int getAttemptCount() {
            return attemptCount;
        }
        
        public long getLastActivity() {
            return lastActivity;
        }
        
        public String getLastStaffId() {
            return lastStaffId;
        }
        
        public String getLastUserAgent() {
            return lastUserAgent;
        }
    }
}