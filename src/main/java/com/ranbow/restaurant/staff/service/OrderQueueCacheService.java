package com.ranbow.restaurant.staff.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.models.OrderStatus;
import com.ranbow.restaurant.staff.model.dto.KitchenWorkloadResponse;
import com.ranbow.restaurant.staff.model.dto.OrderStatistics;
import com.ranbow.restaurant.staff.model.dto.StaffOrderDetails;
import com.ranbow.restaurant.staff.model.entity.OrderPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Order Queue Cache Service
 * High-performance Redis-based caching for order queue operations
 * 
 * Features:
 * - Real-time order queue caching with priority scoring
 * - Staff workload tracking and distribution
 * - Performance metrics caching
 * - Queue statistics and analytics
 * - Automatic cache invalidation and updates
 * - Memory-efficient data structures
 * 
 * Redis Data Structures:
 * - Sorted Sets: orders:queue:pending (priority-based ordering)
 * - Hashes: orders:details:{orderId} (order information)
 * - Strings: staff:workload:{staffId} (workload metrics)
 * - Hashes: queue:statistics (real-time statistics)
 * - Sets: orders:overdue (overdue order tracking)
 */
@Service
public class OrderQueueCacheService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderQueueCacheService.class);
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // Cache key patterns
    private static final String QUEUE_PENDING = "orders:queue:pending";
    private static final String QUEUE_PROCESSING = "orders:queue:processing";
    private static final String QUEUE_COMPLETED = "orders:queue:completed";
    private static final String ORDER_DETAILS = "orders:details:%s";
    private static final String STAFF_WORKLOAD = "staff:workload:%s";
    private static final String QUEUE_STATISTICS = "queue:statistics";
    private static final String OVERDUE_ORDERS = "orders:overdue";
    private static final String ASSIGNMENT_HISTORY = "assignments:history:%s";
    private static final String PERFORMANCE_METRICS = "performance:metrics";
    
    // Cache expiration times
    private static final long QUEUE_EXPIRY_SECONDS = 300; // 5 minutes
    private static final long ORDER_DETAILS_EXPIRY_SECONDS = 1800; // 30 minutes
    private static final long STATISTICS_EXPIRY_SECONDS = 60; // 1 minute
    private static final long WORKLOAD_EXPIRY_SECONDS = 120; // 2 minutes
    
    /**
     * Add Order to Queue Cache
     * Adds order to appropriate priority queue with scoring
     */
    public void addOrderToQueue(Order order, OrderPriority priority) {
        try {
            String queueKey = getQueueKeyForStatus(order.getStatus());
            if (queueKey == null) return;
            
            // Calculate priority score (higher score = higher priority)
            double priorityScore = calculatePriorityScore(order, priority);
            
            // Add to sorted set
            redisTemplate.opsForZSet().add(queueKey, order.getOrderId(), priorityScore);
            
            // Cache order details
            cacheOrderDetails(order, priority);
            
            // Update queue statistics
            updateQueueStatistics();
            
            // Set expiration
            redisTemplate.expire(queueKey, QUEUE_EXPIRY_SECONDS, TimeUnit.SECONDS);
            
            logger.info("Added order {} to queue {} with priority score {:.2f}", 
                       order.getOrderId(), queueKey, priorityScore);
            
        } catch (Exception e) {
            logger.error("Error adding order {} to queue cache: ", order.getOrderId(), e);
        }
    }
    
    /**
     * Remove Order from Queue Cache
     * Removes order from all queue-related caches
     */
    public void removeOrderFromQueue(String orderId, OrderStatus status) {
        try {
            // Remove from all possible queues to ensure cleanup
            redisTemplate.opsForZSet().remove(QUEUE_PENDING, orderId);
            redisTemplate.opsForZSet().remove(QUEUE_PROCESSING, orderId);
            redisTemplate.opsForZSet().remove(QUEUE_COMPLETED, orderId);
            
            // Remove from overdue set
            redisTemplate.opsForSet().remove(OVERDUE_ORDERS, orderId);
            
            // Update statistics
            updateQueueStatistics();
            
            logger.info("Removed order {} from queue caches", orderId);
            
        } catch (Exception e) {
            logger.error("Error removing order {} from queue cache: ", orderId, e);
        }
    }
    
    /**
     * Move Order Between Queues
     * Efficiently moves order from one status queue to another
     */
    public void moveOrderBetweenQueues(String orderId, OrderStatus fromStatus, 
                                     OrderStatus toStatus, OrderPriority priority) {
        try {
            String fromQueue = getQueueKeyForStatus(fromStatus);
            String toQueue = getQueueKeyForStatus(toStatus);
            
            if (fromQueue != null) {
                redisTemplate.opsForZSet().remove(fromQueue, orderId);
            }
            
            if (toQueue != null) {
                // Get order for priority recalculation
                Order order = getCachedOrderDetails(orderId);
                if (order != null) {
                    double newPriorityScore = calculatePriorityScore(order, priority);
                    redisTemplate.opsForZSet().add(toQueue, orderId, newPriorityScore);
                    redisTemplate.expire(toQueue, QUEUE_EXPIRY_SECONDS, TimeUnit.SECONDS);
                }
            }
            
            // Update statistics
            updateQueueStatistics();
            
            logger.info("Moved order {} from {} to {} queue", orderId, fromStatus, toStatus);
            
        } catch (Exception e) {
            logger.error("Error moving order {} between queues: ", orderId, e);
        }
    }
    
    /**
     * Get Priority-Ordered Queue
     * Returns orders from queue sorted by priority
     */
    public List<String> getPriorityOrderedQueue(OrderStatus status, int limit) {
        try {
            String queueKey = getQueueKeyForStatus(status);
            if (queueKey == null) return Collections.emptyList();
            
            // Get orders in descending priority order
            Set<Object> orderIds = redisTemplate.opsForZSet()
                .reverseRange(queueKey, 0, limit - 1);
            
            return orderIds.stream()
                .map(Object::toString)
                .collect(Collectors.toList());
            
        } catch (Exception e) {
            logger.error("Error getting priority-ordered queue for status {}: ", status, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * Cache Order Details
     * Store comprehensive order information
     */
    public void cacheOrderDetails(Order order, OrderPriority priority) {
        try {
            String key = String.format(ORDER_DETAILS, order.getOrderId());
            
            // Create enhanced order data for caching
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("orderId", order.getOrderId());
            orderData.put("customerId", order.getCustomerId());
            orderData.put("tableNumber", order.getTableNumber());
            orderData.put("status", order.getStatus().toString());
            orderData.put("priority", priority.toString());
            orderData.put("totalAmount", order.getTotalAmount().toString());
            orderData.put("orderTime", order.getOrderTime().toString());
            orderData.put("specialInstructions", order.getSpecialInstructions());
            orderData.put("cachedAt", LocalDateTime.now().toString());
            
            // Store item count and complexity metrics
            if (order.getOrderItems() != null) {
                orderData.put("itemCount", order.getOrderItems().size());
                orderData.put("complexity", calculateOrderComplexity(order));
            }
            
            // Cache the data
            redisTemplate.opsForHash().putAll(key, orderData);
            redisTemplate.expire(key, ORDER_DETAILS_EXPIRY_SECONDS, TimeUnit.SECONDS);
            
            logger.debug("Cached order details for order {}", order.getOrderId());
            
        } catch (Exception e) {
            logger.error("Error caching order details for {}: ", order.getOrderId(), e);
        }
    }
    
    /**
     * Get Cached Order Details
     * Retrieve order information from cache
     */
    public Order getCachedOrderDetails(String orderId) {
        try {
            String key = String.format(ORDER_DETAILS, orderId);
            Map<Object, Object> orderData = redisTemplate.opsForHash().entries(key);
            
            if (orderData.isEmpty()) {
                logger.debug("No cached order details found for {}", orderId);
                return null;
            }
            
            // Reconstruct order object
            Order order = new Order();
            order.setOrderId((String) orderData.get("orderId"));
            order.setCustomerId((String) orderData.get("customerId"));
            order.setTableNumber((String) orderData.get("tableNumber"));
            order.setSpecialInstructions((String) orderData.get("specialInstructions"));
            
            // Parse status
            String statusStr = (String) orderData.get("status");
            if (statusStr != null) {
                order.setStatus(OrderStatus.valueOf(statusStr));
            }
            
            // Parse amounts
            String totalAmountStr = (String) orderData.get("totalAmount");
            if (totalAmountStr != null) {
                order.setTotalAmount(new java.math.BigDecimal(totalAmountStr));
            }
            
            // Parse dates
            String orderTimeStr = (String) orderData.get("orderTime");
            if (orderTimeStr != null) {
                order.setOrderTime(LocalDateTime.parse(orderTimeStr));
            }
            
            logger.debug("Retrieved cached order details for {}", orderId);
            return order;
            
        } catch (Exception e) {
            logger.error("Error retrieving cached order details for {}: ", orderId, e);
            return null;
        }
    }
    
    /**
     * Update Staff Workload Cache
     * Cache current staff workload and capacity information
     */
    public void updateStaffWorkload(String staffId, int currentOrders, int maxCapacity, 
                                  double averageCompletionTime, double successRate) {
        try {
            String key = String.format(STAFF_WORKLOAD, staffId);
            
            Map<String, Object> workloadData = new HashMap<>();
            workloadData.put("staffId", staffId);
            workloadData.put("currentOrders", currentOrders);
            workloadData.put("maxCapacity", maxCapacity);
            workloadData.put("workloadPercentage", maxCapacity > 0 ? (double) currentOrders / maxCapacity : 0.0);
            workloadData.put("averageCompletionTime", averageCompletionTime);
            workloadData.put("successRate", successRate);
            workloadData.put("updatedAt", LocalDateTime.now().toString());
            
            // Determine workload status
            double percentage = maxCapacity > 0 ? (double) currentOrders / maxCapacity : 0.0;
            String status = percentage >= 1.0 ? "OVERLOADED" :
                          percentage >= 0.8 ? "HIGH" :
                          percentage >= 0.5 ? "MEDIUM" : "LOW";
            workloadData.put("status", status);
            
            redisTemplate.opsForHash().putAll(key, workloadData);
            redisTemplate.expire(key, WORKLOAD_EXPIRY_SECONDS, TimeUnit.SECONDS);
            
            logger.debug("Updated workload cache for staff {} - {}/{} orders ({}%)", 
                        staffId, currentOrders, maxCapacity, String.format("%.1f", percentage * 100));
            
        } catch (Exception e) {
            logger.error("Error updating staff workload cache for {}: ", staffId, e);
        }
    }
    
    /**
     * Get Staff Workload from Cache
     */
    public Map<String, Object> getStaffWorkload(String staffId) {
        try {
            String key = String.format(STAFF_WORKLOAD, staffId);
            Map<Object, Object> workloadData = redisTemplate.opsForHash().entries(key);
            
            if (workloadData.isEmpty()) {
                return null;
            }
            
            // Convert to String keys
            Map<String, Object> result = new HashMap<>();
            workloadData.forEach((k, v) -> result.put(k.toString(), v));
            
            return result;
            
        } catch (Exception e) {
            logger.error("Error getting staff workload cache for {}: ", staffId, e);
            return null;
        }
    }
    
    /**
     * Update Queue Statistics Cache
     * Cache real-time queue statistics for dashboard
     */
    public void updateQueueStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            
            // Count orders in each queue
            Long pendingCount = redisTemplate.opsForZSet().count(QUEUE_PENDING, Double.NEGATIVE_INFINITY, Double.POSITIVE_INFINITY);
            Long processingCount = redisTemplate.opsForZSet().count(QUEUE_PROCESSING, Double.NEGATIVE_INFINITY, Double.POSITIVE_INFINITY);
            Long completedCount = redisTemplate.opsForZSet().count(QUEUE_COMPLETED, Double.NEGATIVE_INFINITY, Double.POSITIVE_INFINITY);
            Long overdueCount = redisTemplate.opsForSet().size(OVERDUE_ORDERS);
            
            statistics.put("pendingCount", pendingCount != null ? pendingCount : 0L);
            statistics.put("processingCount", processingCount != null ? processingCount : 0L);
            statistics.put("completedCount", completedCount != null ? completedCount : 0L);
            statistics.put("overdueCount", overdueCount != null ? overdueCount : 0L);
            statistics.put("totalActiveOrders", (pendingCount != null ? pendingCount : 0L) + 
                                              (processingCount != null ? processingCount : 0L));
            statistics.put("updatedAt", LocalDateTime.now().toString());
            
            // Calculate average wait time (simplified calculation)
            statistics.put("averageWaitTime", calculateAverageWaitTime());
            
            redisTemplate.opsForHash().putAll(QUEUE_STATISTICS, statistics);
            redisTemplate.expire(QUEUE_STATISTICS, STATISTICS_EXPIRY_SECONDS, TimeUnit.SECONDS);
            
            logger.debug("Updated queue statistics - Pending: {}, Processing: {}, Completed: {}, Overdue: {}", 
                        pendingCount, processingCount, completedCount, overdueCount);
            
        } catch (Exception e) {
            logger.error("Error updating queue statistics: ", e);
        }
    }
    
    /**
     * Get Queue Statistics from Cache
     */
    public Map<String, Object> getQueueStatistics() {
        try {
            Map<Object, Object> statisticsData = redisTemplate.opsForHash().entries(QUEUE_STATISTICS);
            
            if (statisticsData.isEmpty()) {
                // Return default statistics if cache is empty
                updateQueueStatistics();
                statisticsData = redisTemplate.opsForHash().entries(QUEUE_STATISTICS);
            }
            
            // Convert to String keys
            Map<String, Object> result = new HashMap<>();
            statisticsData.forEach((k, v) -> result.put(k.toString(), v));
            
            return result;
            
        } catch (Exception e) {
            logger.error("Error getting queue statistics: ", e);
            return new HashMap<>();
        }
    }
    
    /**
     * Add Order to Overdue Set
     */
    public void addOverdueOrder(String orderId) {
        try {
            redisTemplate.opsForSet().add(OVERDUE_ORDERS, orderId);
            
            // Update statistics
            updateQueueStatistics();
            
            logger.info("Added order {} to overdue set", orderId);
            
        } catch (Exception e) {
            logger.error("Error adding order {} to overdue set: ", orderId, e);
        }
    }
    
    /**
     * Remove Order from Overdue Set
     */
    public void removeOverdueOrder(String orderId) {
        try {
            redisTemplate.opsForSet().remove(OVERDUE_ORDERS, orderId);
            
            // Update statistics
            updateQueueStatistics();
            
            logger.info("Removed order {} from overdue set", orderId);
            
        } catch (Exception e) {
            logger.error("Error removing order {} from overdue set: ", orderId, e);
        }
    }
    
    /**
     * Get All Overdue Orders
     */
    public Set<String> getOverdueOrders() {
        try {
            Set<Object> overdueSet = redisTemplate.opsForSet().members(OVERDUE_ORDERS);
            return overdueSet != null ? overdueSet.stream()
                .map(Object::toString)
                .collect(Collectors.toSet()) : Collections.emptySet();
                
        } catch (Exception e) {
            logger.error("Error getting overdue orders: ", e);
            return Collections.emptySet();
        }
    }
    
    /**
     * Cache Assignment History
     * Track order assignment history for analytics
     */
    public void cacheAssignmentHistory(String orderId, String staffId, String action, String reason) {
        try {
            String key = String.format(ASSIGNMENT_HISTORY, orderId);
            
            Map<String, Object> assignment = new HashMap<>();
            assignment.put("staffId", staffId);
            assignment.put("action", action);
            assignment.put("reason", reason);
            assignment.put("timestamp", LocalDateTime.now().toString());
            
            // Add to list (use list for chronological order)
            redisTemplate.opsForList().rightPush(key, objectMapper.writeValueAsString(assignment));
            
            // Keep only last 10 assignments
            redisTemplate.opsForList().trim(key, -10, -1);
            
            // Set expiration
            redisTemplate.expire(key, 24 * 60 * 60, TimeUnit.SECONDS); // 24 hours
            
            logger.debug("Cached assignment history for order {}: {} by {}", orderId, action, staffId);
            
        } catch (Exception e) {
            logger.error("Error caching assignment history for order {}: ", orderId, e);
        }
    }
    
    /**
     * Clear All Queue Caches
     * Emergency cache clearing method
     */
    public void clearAllQueueCaches() {
        try {
            logger.info("Clearing all queue caches");
            
            // Clear all queue-related keys
            redisTemplate.delete(QUEUE_PENDING);
            redisTemplate.delete(QUEUE_PROCESSING);
            redisTemplate.delete(QUEUE_COMPLETED);
            redisTemplate.delete(QUEUE_STATISTICS);
            redisTemplate.delete(OVERDUE_ORDERS);
            
            // Clear order details (pattern-based deletion)
            clearKeysByPattern("orders:details:*");
            clearKeysByPattern("staff:workload:*");
            clearKeysByPattern("assignments:history:*");
            
            logger.info("All queue caches cleared");
            
        } catch (Exception e) {
            logger.error("Error clearing queue caches: ", e);
        }
    }
    
    // Private helper methods
    
    private String getQueueKeyForStatus(OrderStatus status) {
        return switch (status) {
            case PENDING, PENDING_PAYMENT -> QUEUE_PENDING;
            case CONFIRMED, PREPARING -> QUEUE_PROCESSING;
            case READY, DELIVERED, COMPLETED -> QUEUE_COMPLETED;
            default -> null;
        };
    }
    
    private double calculatePriorityScore(Order order, OrderPriority priority) {
        // Base score from priority
        double score = priority.ordinal() * 100.0;
        
        // Add age factor (older orders get higher priority)
        if (order.getOrderTime() != null) {
            long ageMinutes = java.time.Duration.between(order.getOrderTime(), LocalDateTime.now()).toMinutes();
            score += ageMinutes * 0.5; // 0.5 points per minute
        }
        
        // Add complexity factor
        if (order.getOrderItems() != null) {
            score += order.getOrderItems().size() * 2.0; // 2 points per item
        }
        
        return score;
    }
    
    private int calculateOrderComplexity(Order order) {
        int complexity = 1; // Base complexity
        
        if (order.getOrderItems() != null) {
            complexity += order.getOrderItems().size();
        }
        
        if (order.getSpecialInstructions() != null && !order.getSpecialInstructions().isEmpty()) {
            complexity += 3;
        }
        
        return Math.min(10, complexity); // Cap at 10
    }
    
    private double calculateAverageWaitTime() {
        try {
            // Simplified calculation - in reality, this would be more sophisticated
            Set<Object> pendingOrders = redisTemplate.opsForZSet().range(QUEUE_PENDING, 0, -1);
            
            if (pendingOrders == null || pendingOrders.isEmpty()) {
                return 0.0;
            }
            
            double totalWaitTime = 0.0;
            int orderCount = 0;
            
            for (Object orderIdObj : pendingOrders) {
                String orderId = orderIdObj.toString();
                Order order = getCachedOrderDetails(orderId);
                
                if (order != null && order.getOrderTime() != null) {
                    long waitMinutes = java.time.Duration.between(order.getOrderTime(), LocalDateTime.now()).toMinutes();
                    totalWaitTime += waitMinutes;
                    orderCount++;
                }
            }
            
            return orderCount > 0 ? totalWaitTime / orderCount : 0.0;
            
        } catch (Exception e) {
            logger.error("Error calculating average wait time: ", e);
            return 0.0;
        }
    }
    
    private void clearKeysByPattern(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                logger.debug("Cleared {} keys matching pattern {}", keys.size(), pattern);
            }
        } catch (Exception e) {
            logger.error("Error clearing keys by pattern {}: ", pattern, e);
        }
    }
    
    /**
     * Health Check Method
     * Verify Redis connectivity and cache functionality
     */
    public Map<String, Object> performHealthCheck() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // Test basic connectivity
            redisTemplate.opsForValue().set("health:check", "OK", 10, TimeUnit.SECONDS);
            String testValue = (String) redisTemplate.opsForValue().get("health:check");
            
            health.put("redis_connectivity", "OK".equals(testValue) ? "HEALTHY" : "ERROR");
            health.put("queue_statistics_available", redisTemplate.hasKey(QUEUE_STATISTICS));
            health.put("pending_queue_size", redisTemplate.opsForZSet().size(QUEUE_PENDING));
            health.put("processing_queue_size", redisTemplate.opsForZSet().size(QUEUE_PROCESSING));
            health.put("overdue_orders_count", redisTemplate.opsForSet().size(OVERDUE_ORDERS));
            health.put("kitchen_workload_available", redisTemplate.hasKey("kitchen:workload:current"));
            health.put("active_timers_count", redisTemplate.opsForSet().size("kitchen:timers:active"));
            health.put("last_check", LocalDateTime.now().toString());
            health.put("overall_status", "HEALTHY");
            
        } catch (Exception e) {
            logger.error("Redis health check failed: ", e);
            health.put("redis_connectivity", "ERROR");
            health.put("error_message", e.getMessage());
            health.put("overall_status", "UNHEALTHY");
        }
        
        return health;
    }
}