package com.ranbow.restaurant.staff.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.staff.model.dto.KitchenWorkloadResponse;
import com.ranbow.restaurant.staff.model.dto.OrderStatistics;
import com.ranbow.restaurant.staff.model.dto.StaffOrderDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Order Queue Cache Service Extension
 * 
 * Extension to the existing OrderQueueCacheService that adds enhanced functionality
 * for WebSocket real-time communication and Redis caching integration.
 * This includes kitchen workload caching, order queue filtering, statistics caching,
 * and real-time update publishing.
 * 
 * Features:
 * - Enhanced order queue caching with filtering
 * - Kitchen workload and capacity management
 * - Order statistics caching by time period
 * - Real-time update publishing via Redis pub/sub
 * - Staff notifications management
 * - Kitchen timer tracking
 */
@Service
public class OrderQueueCacheServiceExtension {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderQueueCacheServiceExtension.class);
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // Cache expiration times
    private static final long QUEUE_EXPIRY_SECONDS = 300; // 5 minutes
    private static final long STATISTICS_EXPIRY_SECONDS = 60; // 1 minute
    
    /**
     * Cache Order Queue with Filter Key
     * Store filtered order queue results for quick retrieval
     */
    public void cacheOrderQueue(List<StaffOrderDetails> orders, String filterKey) {
        try {
            String key = "orders:queue:filtered:" + filterKey;
            
            // Serialize orders to JSON strings for Redis storage
            List<String> serializedOrders = orders.stream()
                .map(order -> {
                    try {
                        return objectMapper.writeValueAsString(order);
                    } catch (Exception e) {
                        logger.error("Error serializing order {}: ", order.getOrderId(), e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
            
            // Store as list in Redis
            redisTemplate.delete(key); // Clear existing data
            if (!serializedOrders.isEmpty()) {
                redisTemplate.opsForList().rightPushAll(key, serializedOrders.toArray());
                redisTemplate.expire(key, QUEUE_EXPIRY_SECONDS, TimeUnit.SECONDS);
            }
            
            logger.debug("Cached {} orders for filter key: {}", orders.size(), filterKey);
            
        } catch (Exception e) {
            logger.error("Error caching order queue for filter {}: ", filterKey, e);
        }
    }
    
    /**
     * Get Cached Order Queue by Filter Key
     */
    public List<StaffOrderDetails> getCachedOrderQueue(String filterKey) {
        try {
            String key = "orders:queue:filtered:" + filterKey;
            List<Object> serializedOrders = redisTemplate.opsForList().range(key, 0, -1);
            
            if (serializedOrders == null || serializedOrders.isEmpty()) {
                return Collections.emptyList();
            }
            
            List<StaffOrderDetails> orders = new ArrayList<>();
            for (Object serializedOrder : serializedOrders) {
                try {
                    StaffOrderDetails order = objectMapper.readValue(
                        serializedOrder.toString(), StaffOrderDetails.class);
                    orders.add(order);
                } catch (Exception e) {
                    logger.error("Error deserializing cached order: ", e);
                }
            }
            
            logger.debug("Retrieved {} cached orders for filter key: {}", orders.size(), filterKey);
            return orders;
            
        } catch (Exception e) {
            logger.error("Error retrieving cached order queue for filter {}: ", filterKey, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * Invalidate Order Queue Cache
     * Clear all cached order queue data
     */
    public void invalidateOrderQueue() {
        try {
            // Clear all filtered queue caches
            clearKeysByPattern("orders:queue:filtered:*");
            
            // Clear main queue caches
            redisTemplate.delete("orders:queue:pending");
            redisTemplate.delete("orders:queue:processing");
            redisTemplate.delete("orders:queue:completed");
            
            logger.info("Order queue cache invalidated");
            
        } catch (Exception e) {
            logger.error("Error invalidating order queue cache: ", e);
        }
    }
    
    /**
     * Cache Order Statistics for Specific Period
     */
    public void cacheOrderStatistics(OrderStatistics stats, String period) {
        try {
            String key = "statistics:orders:" + period;
            
            redisTemplate.opsForValue().set(key, stats, STATISTICS_EXPIRY_SECONDS, TimeUnit.SECONDS);
            
            logger.debug("Cached order statistics for period: {}", period);
            
        } catch (Exception e) {
            logger.error("Error caching order statistics for period {}: ", period, e);
        }
    }
    
    /**
     * Get Cached Order Statistics for Specific Period
     */
    public OrderStatistics getCachedOrderStatistics(String period) {
        try {
            String key = "statistics:orders:" + period;
            Object cachedStats = redisTemplate.opsForValue().get(key);
            
            if (cachedStats instanceof OrderStatistics) {
                logger.debug("Retrieved cached order statistics for period: {}", period);
                return (OrderStatistics) cachedStats;
            }
            
            return null;
            
        } catch (Exception e) {
            logger.error("Error retrieving cached order statistics for period {}: ", period, e);
            return null;
        }
    }
    
    /**
     * Cache Kitchen Workload Response
     */
    public void cacheKitchenWorkload(KitchenWorkloadResponse workload) {
        try {
            String key = "kitchen:workload:current";
            
            redisTemplate.opsForValue().set(key, workload, 30, TimeUnit.SECONDS); // 30 second TTL for real-time data
            
            // Also maintain historical data
            String historyKey = "kitchen:workload:history";
            String timestampedData = objectMapper.writeValueAsString(Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "workload", workload
            ));
            
            redisTemplate.opsForList().leftPush(historyKey, timestampedData);
            redisTemplate.opsForList().trim(historyKey, 0, 99); // Keep last 100 entries
            redisTemplate.expire(historyKey, 3600, TimeUnit.SECONDS); // 1 hour TTL
            
            logger.debug("Cached kitchen workload: capacity={}", workload.getCurrentCapacity());
            
        } catch (Exception e) {
            logger.error("Error caching kitchen workload: ", e);
        }
    }
    
    /**
     * Get Cached Kitchen Workload Response
     */
    public KitchenWorkloadResponse getCachedKitchenWorkload() {
        try {
            String key = "kitchen:workload:current";
            Object cachedWorkload = redisTemplate.opsForValue().get(key);
            
            if (cachedWorkload instanceof KitchenWorkloadResponse) {
                logger.debug("Retrieved cached kitchen workload");
                return (KitchenWorkloadResponse) cachedWorkload;
            }
            
            return null;
            
        } catch (Exception e) {
            logger.error("Error retrieving cached kitchen workload: ", e);
            return null;
        }
    }
    
    /**
     * Publish Order Update for Real-time Notifications
     */
    public void publishOrderUpdate(Order order) {
        try {
            String channel = "orders:updates";
            
            Map<String, Object> updateData = new HashMap<>();
            updateData.put("orderId", order.getOrderId());
            updateData.put("status", order.getStatus().toString());
            updateData.put("updateTime", LocalDateTime.now().toString());
            updateData.put("customerId", order.getCustomerId());
            updateData.put("tableNumber", order.getTableNumber());
            
            String updateMessage = objectMapper.writeValueAsString(updateData);
            
            // Publish to Redis channel
            redisTemplate.convertAndSend(channel, updateMessage);
            
            logger.debug("Published order update for order: {}", order.getOrderId());
            
        } catch (Exception e) {
            logger.error("Error publishing order update for order {}: ", order.getOrderId(), e);
        }
    }
    
    /**
     * Publish Kitchen Update for Real-time Notifications
     */
    public void publishKitchenUpdate(KitchenWorkloadResponse workload) {
        try {
            String channel = "kitchen:updates";
            
            Map<String, Object> updateData = new HashMap<>();
            updateData.put("currentCapacity", workload.getCurrentCapacity());
            updateData.put("activeOrders", workload.getActiveOrderCount());
            updateData.put("updateTime", LocalDateTime.now().toString());
            updateData.put("status", workload.getStatus());
            
            String updateMessage = objectMapper.writeValueAsString(updateData);
            
            // Publish to Redis channel
            redisTemplate.convertAndSend(channel, updateMessage);
            
            logger.debug("Published kitchen update: capacity={}", workload.getCurrentCapacity());
            
        } catch (Exception e) {
            logger.error("Error publishing kitchen update: ", e);
        }
    }
    
    /**
     * Get Kitchen Workload History
     * Retrieve historical kitchen workload data for analytics
     */
    public List<Map<String, Object>> getKitchenWorkloadHistory(int limit) {
        try {
            String historyKey = "kitchen:workload:history";
            List<Object> historyData = redisTemplate.opsForList().range(historyKey, 0, limit - 1);
            
            if (historyData == null || historyData.isEmpty()) {
                return Collections.emptyList();
            }
            
            List<Map<String, Object>> history = new ArrayList<>();
            for (Object entry : historyData) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> historyEntry = objectMapper.readValue(
                        entry.toString(), Map.class);
                    history.add(historyEntry);
                } catch (Exception e) {
                    logger.error("Error parsing kitchen workload history entry: ", e);
                }
            }
            
            logger.debug("Retrieved {} kitchen workload history entries", history.size());
            return history;
            
        } catch (Exception e) {
            logger.error("Error retrieving kitchen workload history: ", e);
            return Collections.emptyList();
        }
    }
    
    /**
     * Cache Active Kitchen Timers
     */
    public void cacheActiveTimers(Set<String> timerIds) {
        try {
            String key = "kitchen:timers:active";
            
            // Clear existing timers
            redisTemplate.delete(key);
            
            // Add active timer IDs
            if (!timerIds.isEmpty()) {
                redisTemplate.opsForSet().add(key, timerIds.toArray());
                redisTemplate.expire(key, 3600, TimeUnit.SECONDS); // 1 hour TTL
            }
            
            logger.debug("Cached {} active kitchen timers", timerIds.size());
            
        } catch (Exception e) {
            logger.error("Error caching active kitchen timers: ", e);
        }
    }
    
    /**
     * Get Active Kitchen Timers
     */
    public Set<String> getActiveTimers() {
        try {
            String key = "kitchen:timers:active";
            Set<Object> timerObjects = redisTemplate.opsForSet().members(key);
            
            if (timerObjects == null) {
                return Collections.emptySet();
            }
            
            Set<String> timerIds = timerObjects.stream()
                .map(Object::toString)
                .collect(Collectors.toSet());
            
            logger.debug("Retrieved {} active kitchen timers", timerIds.size());
            return timerIds;
            
        } catch (Exception e) {
            logger.error("Error retrieving active kitchen timers: ", e);
            return Collections.emptySet();
        }
    }
    
    /**
     * Cache Staff Notifications
     */
    public void cacheStaffNotification(String staffId, Map<String, Object> notification) {
        try {
            String key = "notifications:staff:" + staffId;
            
            // Add timestamp
            notification.put("cachedAt", LocalDateTime.now().toString());
            
            String notificationJson = objectMapper.writeValueAsString(notification);
            
            // Add to list (most recent first)
            redisTemplate.opsForList().leftPush(key, notificationJson);
            
            // Keep only last 20 notifications per staff
            redisTemplate.opsForList().trim(key, 0, 19);
            
            // Set 24-hour TTL
            redisTemplate.expire(key, 24 * 60 * 60, TimeUnit.SECONDS);
            
            logger.debug("Cached notification for staff: {}", staffId);
            
        } catch (Exception e) {
            logger.error("Error caching staff notification for {}: ", staffId, e);
        }
    }
    
    /**
     * Get Staff Notifications
     */
    public List<Map<String, Object>> getStaffNotifications(String staffId, int limit) {
        try {
            String key = "notifications:staff:" + staffId;
            List<Object> notificationObjects = redisTemplate.opsForList().range(key, 0, limit - 1);
            
            if (notificationObjects == null || notificationObjects.isEmpty()) {
                return Collections.emptyList();
            }
            
            List<Map<String, Object>> notifications = new ArrayList<>();
            for (Object notificationObj : notificationObjects) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> notification = objectMapper.readValue(
                        notificationObj.toString(), Map.class);
                    notifications.add(notification);
                } catch (Exception e) {
                    logger.error("Error parsing staff notification: ", e);
                }
            }
            
            logger.debug("Retrieved {} notifications for staff: {}", notifications.size(), staffId);
            return notifications;
            
        } catch (Exception e) {
            logger.error("Error retrieving staff notifications for {}: ", staffId, e);
            return Collections.emptyList();
        }
    }
    
    // Private helper methods
    
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
}