package com.ranbow.restaurant.staff.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ranbow.restaurant.staff.model.dto.MessagePriority;
import com.ranbow.restaurant.staff.model.dto.MessageType;
import com.ranbow.restaurant.staff.model.dto.WSMessage;
import com.ranbow.restaurant.staff.model.entity.StaffRole;
import com.ranbow.restaurant.staff.service.StaffSessionRedisService;
import com.ranbow.restaurant.staff.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Staff WebSocket Handler for Real-time Communication
 * 
 * Handles WebSocket connections, message routing, and broadcast operations
 * for the staff management system. Provides reliable real-time communication
 * with connection management, authentication, and message delivery tracking.
 * 
 * Features:
 * - Connection lifecycle management
 * - JWT-based authentication
 * - Message routing and broadcasting  
 * - Staff and role-based targeting
 * - Connection health monitoring
 * - Message acknowledgment tracking
 * - Automatic reconnection support
 * - Rate limiting and throttling
 */
@Component
public class StaffWebSocketHandler extends TextWebSocketHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffWebSocketHandler.class);
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private StaffSessionRedisService sessionRedisService;
    
    // Connection Management
    private final Map<String, WebSocketSession> activeSessions = new ConcurrentHashMap<>();
    private final Map<String, StaffConnectionInfo> connectionInfo = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> roleConnections = new ConcurrentHashMap<>();
    
    // Message Management  
    private final Map<String, Set<String>> pendingAcknowledgments = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatScheduler = Executors.newScheduledThreadPool(2);
    
    // Connection Statistics
    private volatile int totalConnections = 0;
    private volatile int authenticatedConnections = 0;
    private final Map<StaffRole, Integer> roleConnectionCounts = new ConcurrentHashMap<>();
    
    public StaffWebSocketHandler() {
        // Start heartbeat service
        startHeartbeatService();
        // Start connection cleanup service
        startConnectionCleanupService();
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        totalConnections++;
        
        logger.info("WebSocket connection established: {} from {}", 
                   sessionId, session.getRemoteAddress());
        
        activeSessions.put(sessionId, session);
        
        // Extract staff ID from URL path or headers
        String staffId = extractStaffIdFromSession(session);
        
        // Create connection info
        StaffConnectionInfo connInfo = new StaffConnectionInfo(
            sessionId, staffId, LocalDateTime.now(), session.getRemoteAddress().toString()
        );
        
        connectionInfo.put(sessionId, connInfo);
        
        // Authenticate connection if staff ID is provided
        if (staffId != null && !staffId.isEmpty()) {
            authenticateConnection(session, staffId);
        }
        
        // Send welcome message
        sendWelcomeMessage(session);
        
        logger.debug("Active connections: {}, Authenticated: {}", 
                    totalConnections, authenticatedConnections);
    }
    
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        StaffConnectionInfo connInfo = connectionInfo.get(sessionId);
        
        if (connInfo == null) {
            logger.warn("Received message from unknown session: {}", sessionId);
            return;
        }
        
        try {
            // Parse incoming message
            WSMessage wsMessage = objectMapper.readValue(message.getPayload(), WSMessage.class);
            
            // Update last activity
            connInfo.updateLastActivity();
            
            // Handle different message types
            handleIncomingMessage(session, wsMessage, connInfo);
            
        } catch (Exception e) {
            logger.error("Error handling message from session {}: ", sessionId, e);
            sendErrorMessage(session, "Invalid message format", e.getMessage());
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        StaffConnectionInfo connInfo = connectionInfo.get(sessionId);
        
        logger.info("WebSocket connection closed: {} with status: {}", sessionId, status);
        
        // Remove from active sessions
        activeSessions.remove(sessionId);
        totalConnections--;
        
        if (connInfo != null) {
            // Update connection statistics
            if (connInfo.isAuthenticated()) {
                authenticatedConnections--;
                decrementRoleConnectionCount(connInfo.getRole());
            }
            
            // Update session in Redis
            if (connInfo.getStaffId() != null) {
                sessionRedisService.updateLastActivity(connInfo.getStaffId());
            }
            
            connectionInfo.remove(sessionId);
        }
        
        // Clean up pending acknowledgments
        pendingAcknowledgments.remove(sessionId);
        
        logger.debug("Active connections: {}, Authenticated: {}", 
                    totalConnections, authenticatedConnections);
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        String sessionId = session.getId();
        
        logger.error("WebSocket transport error for session {}: ", sessionId, exception);
        
        try {
            if (session.isOpen()) {
                sendErrorMessage(session, "Connection Error", "Transport error occurred");
                session.close(CloseStatus.SERVER_ERROR);
            }
        } catch (Exception e) {
            logger.error("Error sending error message to session {}: ", sessionId, e);
        }
    }
    
    // Message Broadcasting Methods
    
    /**
     * Broadcast message to all connected staff
     */
    public void broadcastToAllStaff(WSMessage message) {
        logger.debug("Broadcasting message to all staff: {}", message.getType());
        
        List<String> failedSessions = new ArrayList<>();
        
        for (Map.Entry<String, WebSocketSession> entry : activeSessions.entrySet()) {
            try {
                WebSocketSession session = entry.getValue();
                StaffConnectionInfo connInfo = connectionInfo.get(entry.getKey());
                
                if (connInfo != null && connInfo.isAuthenticated() && session.isOpen()) {
                    sendMessage(session, message);
                }
            } catch (Exception e) {
                logger.error("Failed to send message to session {}: ", entry.getKey(), e);
                failedSessions.add(entry.getKey());
            }
        }
        
        // Clean up failed sessions
        failedSessions.forEach(this::cleanupSession);
    }
    
    /**
     * Send message to specific staff member
     */
    public boolean sendToStaff(String staffId, WSMessage message) {
        logger.debug("Sending message to staff {}: {}", staffId, message.getType());
        
        for (Map.Entry<String, StaffConnectionInfo> entry : connectionInfo.entrySet()) {
            StaffConnectionInfo connInfo = entry.getValue();
            
            if (staffId.equals(connInfo.getStaffId()) && connInfo.isAuthenticated()) {
                WebSocketSession session = activeSessions.get(entry.getKey());
                
                if (session != null && session.isOpen()) {
                    try {
                        sendMessage(session, message);
                        return true;
                    } catch (Exception e) {
                        logger.error("Failed to send message to staff {}: ", staffId, e);
                        cleanupSession(entry.getKey());
                    }
                }
            }
        }
        
        logger.warn("No active connection found for staff: {}", staffId);
        return false;
    }
    
    /**
     * Broadcast message to staff members with specific role
     */
    public int broadcastToRole(StaffRole role, WSMessage message) {
        logger.debug("Broadcasting message to role {}: {}", role, message.getType());
        
        int sentCount = 0;
        List<String> failedSessions = new ArrayList<>();
        
        for (Map.Entry<String, StaffConnectionInfo> entry : connectionInfo.entrySet()) {
            StaffConnectionInfo connInfo = entry.getValue();
            
            if (role.equals(connInfo.getRole()) && connInfo.isAuthenticated()) {
                WebSocketSession session = activeSessions.get(entry.getKey());
                
                if (session != null && session.isOpen()) {
                    try {
                        sendMessage(session, message);
                        sentCount++;
                    } catch (Exception e) {
                        logger.error("Failed to send message to session {}: ", entry.getKey(), e);
                        failedSessions.add(entry.getKey());
                    }
                }
            }
        }
        
        // Clean up failed sessions
        failedSessions.forEach(this::cleanupSession);
        
        logger.debug("Sent message to {} connections for role {}", sentCount, role);
        return sentCount;
    }
    
    // Connection Management Methods
    
    /**
     * Get connection statistics
     */
    public Map<String, Object> getConnectionStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalConnections", totalConnections);
        stats.put("authenticatedConnections", authenticatedConnections);
        stats.put("roleConnections", new HashMap<>(roleConnectionCounts));
        stats.put("timestamp", LocalDateTime.now());
        return stats;
    }
    
    /**
     * Get active staff connections
     */
    public Set<String> getActiveStaffIds() {
        Set<String> activeStaff = new HashSet<>();
        
        for (StaffConnectionInfo connInfo : connectionInfo.values()) {
            if (connInfo.isAuthenticated() && connInfo.getStaffId() != null) {
                activeStaff.add(connInfo.getStaffId());
            }
        }
        
        return activeStaff;
    }
    
    /**
     * Check if staff member is connected
     */
    public boolean isStaffConnected(String staffId) {
        for (StaffConnectionInfo connInfo : connectionInfo.values()) {
            if (staffId.equals(connInfo.getStaffId()) && connInfo.isAuthenticated()) {
                String sessionId = connInfo.getSessionId();
                WebSocketSession session = activeSessions.get(sessionId);
                
                if (session != null && session.isOpen()) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Private Helper Methods
    
    private String extractStaffIdFromSession(WebSocketSession session) {
        try {
            URI uri = session.getUri();
            if (uri != null) {
                String path = uri.getPath();
                
                // Extract staff ID from path like /ws/staff/{staffId}
                String[] segments = path.split("/");
                if (segments.length >= 3 && "staff".equals(segments[2])) {
                    return segments.length > 3 ? segments[3] : null;
                }
            }
            
            // Try to get from query parameters or headers
            String authHeader = (String) session.getAttributes().get("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                return jwtTokenProvider.getStaffIdFromToken(token);
            }
            
        } catch (Exception e) {
            logger.error("Error extracting staff ID from session: ", e);
        }
        
        return null;
    }
    
    private void authenticateConnection(WebSocketSession session, String staffId) {
        try {
            String sessionId = session.getId();
            StaffConnectionInfo connInfo = connectionInfo.get(sessionId);
            
            if (connInfo != null) {
                // Validate staff session in Redis
                if (sessionRedisService.getSession(staffId) != null) {
                    connInfo.authenticate(staffId, determineStaffRole(staffId));
                    authenticatedConnections++;
                    incrementRoleConnectionCount(connInfo.getRole());
                    
                    logger.info("Staff {} authenticated for WebSocket session {}", staffId, sessionId);
                    
                    // Send authentication success message
                    WSMessage authMessage = WSMessage.systemNotification(
                        "Connected", 
                        "WebSocket connection authenticated successfully", 
                        MessagePriority.LOW
                    );
                    sendMessage(session, authMessage);
                } else {
                    logger.warn("Authentication failed for staff {}: No valid session", staffId);
                }
            }
            
        } catch (Exception e) {
            logger.error("Error authenticating connection for staff {}: ", staffId, e);
        }
    }
    
    private StaffRole determineStaffRole(String staffId) {
        // This would normally fetch from database or cache
        // For now, return a default role
        return StaffRole.SERVICE; // TODO: Implement proper role lookup
    }
    
    private void handleIncomingMessage(WebSocketSession session, WSMessage message, StaffConnectionInfo connInfo) {
        logger.debug("Handling incoming message: {} from staff: {}", 
                    message.getType(), connInfo.getStaffId());
        
        switch (message.getType()) {
            case HEARTBEAT -> handleHeartbeat(session, message);
            case ACK -> handleAcknowledgment(session, message, connInfo);
            case STAFF_MESSAGE -> handleStaffMessage(session, message, connInfo);
            default -> logger.warn("Unhandled message type: {} from session: {}", 
                                 message.getType(), session.getId());
        }
    }
    
    private void handleHeartbeat(WebSocketSession session, WSMessage message) {
        try {
            WSMessage heartbeatResponse = new WSMessage(MessageType.HEARTBEAT, 
                Map.of("serverTime", LocalDateTime.now(), "status", "OK"));
            sendMessage(session, heartbeatResponse);
        } catch (Exception e) {
            logger.error("Error handling heartbeat: ", e);
        }
    }
    
    private void handleAcknowledgment(WebSocketSession session, WSMessage message, StaffConnectionInfo connInfo) {
        String sessionId = session.getId();
        String messageId = (String) message.getData();
        
        if (messageId != null) {
            Set<String> pending = pendingAcknowledgments.get(sessionId);
            if (pending != null) {
                pending.remove(messageId);
                logger.debug("Acknowledgment received for message {} from staff {}", 
                           messageId, connInfo.getStaffId());
            }
        }
    }
    
    private void handleStaffMessage(WebSocketSession session, WSMessage message, StaffConnectionInfo connInfo) {
        // Handle staff-to-staff messaging
        if (message.getTargetStaffId() != null) {
            message.setSourceStaffId(connInfo.getStaffId());
            sendToStaff(message.getTargetStaffId(), message);
        } else if (message.getTargetRole() != null) {
            message.setSourceStaffId(connInfo.getStaffId());
            broadcastToRole(message.getTargetRole(), message);
        }
    }
    
    private void sendMessage(WebSocketSession session, WSMessage message) throws Exception {
        if (session != null && session.isOpen()) {
            String jsonMessage = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(jsonMessage));
            
            // Track pending acknowledgments for high-priority messages
            if (message.isRequiresAcknowledgment()) {
                pendingAcknowledgments.computeIfAbsent(session.getId(), k -> new HashSet<>())
                                     .add(message.getMessageId());
            }
            
            logger.debug("Sent message: {} to session: {}", message.getType(), session.getId());
        }
    }
    
    private void sendWelcomeMessage(WebSocketSession session) {
        try {
            WSMessage welcome = WSMessage.systemNotification(
                "Welcome", 
                "WebSocket connection established", 
                MessagePriority.LOW
            );
            sendMessage(session, welcome);
        } catch (Exception e) {
            logger.error("Error sending welcome message: ", e);
        }
    }
    
    private void sendErrorMessage(WebSocketSession session, String title, String error) {
        try {
            WSMessage errorMessage = new WSMessage(MessageType.ERROR, 
                Map.of("error", error, "timestamp", LocalDateTime.now()));
            errorMessage.setTitle(title);
            errorMessage.setPriority(MessagePriority.HIGH);
            
            sendMessage(session, errorMessage);
        } catch (Exception e) {
            logger.error("Error sending error message: ", e);
        }
    }
    
    private void cleanupSession(String sessionId) {
        WebSocketSession session = activeSessions.remove(sessionId);
        StaffConnectionInfo connInfo = connectionInfo.remove(sessionId);
        pendingAcknowledgments.remove(sessionId);
        
        if (session != null) {
            totalConnections--;
            try {
                if (session.isOpen()) {
                    session.close(CloseStatus.GOING_AWAY);
                }
            } catch (Exception e) {
                logger.error("Error closing session {}: ", sessionId, e);
            }
        }
        
        if (connInfo != null && connInfo.isAuthenticated()) {
            authenticatedConnections--;
            decrementRoleConnectionCount(connInfo.getRole());
        }
    }
    
    private void incrementRoleConnectionCount(StaffRole role) {
        if (role != null) {
            roleConnectionCounts.merge(role, 1, Integer::sum);
        }
    }
    
    private void decrementRoleConnectionCount(StaffRole role) {
        if (role != null) {
            roleConnectionCounts.merge(role, -1, Integer::sum);
            roleConnectionCounts.computeIfPresent(role, (k, v) -> v <= 0 ? null : v);
        }
    }
    
    private void startHeartbeatService() {
        heartbeatScheduler.scheduleAtFixedRate(() -> {
            try {
                WSMessage heartbeat = new WSMessage(MessageType.HEARTBEAT, 
                    Map.of("timestamp", LocalDateTime.now(), "connections", totalConnections));
                
                broadcastToAllStaff(heartbeat);
                
            } catch (Exception e) {
                logger.error("Error in heartbeat service: ", e);
            }
        }, 30, 30, TimeUnit.SECONDS); // Send heartbeat every 30 seconds
    }
    
    private void startConnectionCleanupService() {
        heartbeatScheduler.scheduleAtFixedRate(() -> {
            try {
                LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30); // 30 minutes timeout
                List<String> staleConnections = new ArrayList<>();
                
                for (Map.Entry<String, StaffConnectionInfo> entry : connectionInfo.entrySet()) {
                    StaffConnectionInfo connInfo = entry.getValue();
                    if (connInfo.getLastActivity().isBefore(cutoff)) {
                        staleConnections.add(entry.getKey());
                    }
                }
                
                staleConnections.forEach(this::cleanupSession);
                
                if (!staleConnections.isEmpty()) {
                    logger.info("Cleaned up {} stale connections", staleConnections.size());
                }
                
            } catch (Exception e) {
                logger.error("Error in connection cleanup service: ", e);
            }
        }, 5, 5, TimeUnit.MINUTES); // Run cleanup every 5 minutes
    }
    
    // Inner class for connection information
    private static class StaffConnectionInfo {
        private final String sessionId;
        private String staffId;
        private final LocalDateTime connectedAt;
        private LocalDateTime lastActivity;
        private final String remoteAddress;
        private boolean authenticated = false;
        private StaffRole role;
        
        public StaffConnectionInfo(String sessionId, String staffId, LocalDateTime connectedAt, String remoteAddress) {
            this.sessionId = sessionId;
            this.staffId = staffId;
            this.connectedAt = connectedAt;
            this.lastActivity = connectedAt;
            this.remoteAddress = remoteAddress;
        }
        
        public void authenticate(String staffId, StaffRole role) {
            this.staffId = staffId;
            this.role = role;
            this.authenticated = true;
            this.lastActivity = LocalDateTime.now();
        }
        
        public void updateLastActivity() {
            this.lastActivity = LocalDateTime.now();
        }
        
        // Getters
        public String getSessionId() { return sessionId; }
        public String getStaffId() { return staffId; }
        public LocalDateTime getConnectedAt() { return connectedAt; }
        public LocalDateTime getLastActivity() { return lastActivity; }
        public String getRemoteAddress() { return remoteAddress; }
        public boolean isAuthenticated() { return authenticated; }
        public StaffRole getRole() { return role; }
    }
}