package com.ranbow.restaurant.staff.controller;

import com.ranbow.restaurant.staff.model.dto.MessagePriority;
import com.ranbow.restaurant.staff.model.dto.MessageType;
import com.ranbow.restaurant.staff.model.dto.WSMessage;
import com.ranbow.restaurant.staff.model.entity.StaffRole;
import com.ranbow.restaurant.staff.service.OrderQueueCacheService;
import com.ranbow.restaurant.staff.service.OrderQueueCacheServiceExtension;
import com.ranbow.restaurant.staff.service.StaffSessionRedisService;
import com.ranbow.restaurant.staff.websocket.StaffWebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Staff WebSocket and Redis Testing Controller
 * 
 * Provides endpoints for testing WebSocket communication and Redis caching
 * functionality in the staff management system. This controller should be
 * used for development and testing purposes only.
 * 
 * Features:
 * - WebSocket connection testing
 * - Message broadcasting testing
 * - Redis cache operations testing
 * - Health check endpoints
 * - Performance monitoring
 */
@RestController
@RequestMapping("/api/staff/websocket/test")
public class StaffWebSocketTestController {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffWebSocketTestController.class);
    
    @Autowired
    private StaffWebSocketService webSocketService;
    
    @Autowired
    private StaffSessionRedisService sessionRedisService;
    
    @Autowired
    private OrderQueueCacheService cacheService;
    
    @Autowired
    private OrderQueueCacheServiceExtension cacheExtension;
    
    /**
     * Test WebSocket message sending to specific staff
     */
    @PostMapping("/send-message/{staffId}")
    public ResponseEntity<Map<String, Object>> sendTestMessage(
            @PathVariable String staffId,
            @RequestParam(defaultValue = "Test Message") String message,
            @RequestParam(defaultValue = "HIGH") String priority) {
        
        logger.info("Testing WebSocket message to staff: {}", staffId);
        
        try {
            MessagePriority msgPriority = MessagePriority.valueOf(priority.toUpperCase());
            
            WSMessage testMessage = WSMessage.systemNotification(
                "Test Message", 
                message, 
                msgPriority
            );
            
            boolean sent = webSocketService.sendToStaff(staffId, testMessage);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", sent);
            response.put("staffId", staffId);
            response.put("message", message);
            response.put("priority", priority);
            response.put("messageId", testMessage.getMessageId());
            response.put("timestamp", testMessage.getTimestamp());
            
            if (sent) {
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Failed to send message - staff may not be connected");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error sending test message to staff {}: ", staffId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Test broadcasting message to specific role
     */
    @PostMapping("/broadcast-role/{role}")
    public ResponseEntity<Map<String, Object>> broadcastToRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "Test Broadcast") String message,
            @RequestParam(defaultValue = "NORMAL") String priority) {
        
        logger.info("Testing WebSocket broadcast to role: {}", role);
        
        try {
            StaffRole staffRole = StaffRole.valueOf(role.toUpperCase());
            MessagePriority msgPriority = MessagePriority.valueOf(priority.toUpperCase());
            
            int delivered = webSocketService.sendSystemNotification(
                "Test Broadcast", 
                message, 
                msgPriority, 
                staffRole
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", delivered > 0);
            response.put("role", role);
            response.put("message", message);
            response.put("priority", priority);
            response.put("deliveredCount", delivered);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Invalid role or priority: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
            
        } catch (Exception e) {
            logger.error("Error broadcasting to role {}: ", role, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Test broadcasting to all connected staff
     */
    @PostMapping("/broadcast-all")
    public ResponseEntity<Map<String, Object>> broadcastToAll(
            @RequestParam(defaultValue = "Test System Broadcast") String message,
            @RequestParam(defaultValue = "NORMAL") String priority) {
        
        logger.info("Testing WebSocket broadcast to all staff");
        
        try {
            MessagePriority msgPriority = MessagePriority.valueOf(priority.toUpperCase());
            
            int delivered = webSocketService.sendSystemNotification(
                "System Test", 
                message, 
                msgPriority, 
                null
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", delivered > 0);
            response.put("message", message);
            response.put("priority", priority);
            response.put("deliveredCount", delivered);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error broadcasting to all staff: ", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Get WebSocket connection statistics
     */
    @GetMapping("/connection-stats")
    public ResponseEntity<Map<String, Object>> getConnectionStats() {
        logger.info("Getting WebSocket connection statistics");
        
        try {
            Map<String, Object> connectionStats = webSocketService.getConnectionStatistics();
            Map<String, Object> messagingStats = webSocketService.getMessagingStatistics();
            Set<String> activeStaff = webSocketService.getActiveStaffIds();
            
            Map<String, Object> response = new HashMap<>();
            response.put("connectionStats", connectionStats);
            response.put("messagingStats", messagingStats);
            response.put("activeStaffIds", activeStaff);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error getting connection stats: ", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Test Redis session operations
     */
    @PostMapping("/redis-test/session")
    public ResponseEntity<Map<String, Object>> testRedisSession(
            @RequestParam String staffId,
            @RequestParam(defaultValue = "test-session") String sessionId,
            @RequestParam(defaultValue = "TEST001") String employeeNumber) {
        
        logger.info("Testing Redis session operations for staff: {}", staffId);
        
        try {
            // Test session creation, retrieval, and deletion
            Map<String, Object> response = new HashMap<>();
            
            // Get active staff before test
            Set<String> activeStaffBefore = sessionRedisService.getActiveStaffIds();
            
            // Update last activity
            sessionRedisService.updateLastActivity(staffId);
            
            // Get active staff after test
            Set<String> activeStaffAfter = sessionRedisService.getActiveStaffIds();
            
            // Test device binding
            sessionRedisService.bindDevice("test-device-123", staffId);
            String boundStaff = sessionRedisService.getStaffByDevice("test-device-123");
            
            // Test failed attempts
            int failedAttempts = sessionRedisService.getFailedAttempts(employeeNumber);
            
            // Clean up
            sessionRedisService.unbindDevice("test-device-123");
            
            response.put("success", true);
            response.put("staffId", staffId);
            response.put("activeStaffBefore", activeStaffBefore.size());
            response.put("activeStaffAfter", activeStaffAfter.size());
            response.put("deviceBindingTest", staffId.equals(boundStaff));
            response.put("failedAttempts", failedAttempts);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error testing Redis session for staff {}: ", staffId, e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Test Redis cache operations
     */
    @PostMapping("/redis-test/cache")
    public ResponseEntity<Map<String, Object>> testRedisCache() {
        logger.info("Testing Redis cache operations");
        
        try {
            Map<String, Object> response = new HashMap<>();
            
            // Test queue statistics
            Map<String, Object> queueStats = cacheService.getQueueStatistics();
            
            // Test health check
            Map<String, Object> healthCheck = cacheService.performHealthCheck();
            
            // Test active timers
            Set<String> activeTimers = cacheExtension.getActiveTimers();
            
            response.put("success", true);
            response.put("queueStatistics", queueStats);
            response.put("healthCheck", healthCheck);
            response.put("activeTimersCount", activeTimers.size());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error testing Redis cache: ", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Health check for WebSocket and Redis integration
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        logger.info("Performing WebSocket and Redis health check");
        
        try {
            Map<String, Object> response = new HashMap<>();
            
            // WebSocket health
            Map<String, Object> webSocketHealth = webSocketService.performHealthCheck();
            
            // Redis health
            Map<String, Object> redisHealth = cacheService.performHealthCheck();
            
            // Session service statistics
            Map<String, Object> sessionStats = sessionRedisService.getSystemStatistics();
            
            // Overall health determination
            boolean webSocketHealthy = "HEALTHY".equals(webSocketHealth.get("status"));
            boolean redisHealthy = "HEALTHY".equals(redisHealth.get("overall_status"));
            
            String overallStatus = (webSocketHealthy && redisHealthy) ? "HEALTHY" : "DEGRADED";
            
            response.put("status", overallStatus);
            response.put("webSocketHealth", webSocketHealth);
            response.put("redisHealth", redisHealth);
            response.put("sessionStatistics", sessionStats);
            response.put("timestamp", System.currentTimeMillis());
            
            if ("HEALTHY".equals(overallStatus)) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(503).body(response); // Service Unavailable
            }
            
        } catch (Exception e) {
            logger.error("Error performing health check: ", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "UNHEALTHY");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Emergency test - send urgent alert to all staff
     */
    @PostMapping("/emergency-test")
    public ResponseEntity<Map<String, Object>> emergencyTest(
            @RequestParam(defaultValue = "Emergency Test Alert") String message) {
        
        logger.warn("EMERGENCY TEST: Broadcasting urgent alert");
        
        try {
            int delivered = webSocketService.emergencyBroadcast("EMERGENCY TEST", message);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", delivered > 0);
            response.put("message", message);
            response.put("deliveredCount", delivered);
            response.put("timestamp", System.currentTimeMillis());
            response.put("warning", "This is a test emergency broadcast");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error in emergency test: ", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}