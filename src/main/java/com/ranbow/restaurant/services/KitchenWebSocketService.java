package com.ranbow.restaurant.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ranbow.restaurant.models.CookingTimer;
import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.services.KitchenCapacityEngine.WorkloadAlert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Kitchen WebSocket Service
 * Handles real-time communications for kitchen operations
 */
@Service
public class KitchenWebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // WebSocket topic destinations
    private static final String TOPIC_TIMER_START = "/topic/kitchen/timer/start";
    private static final String TOPIC_TIMER_UPDATE = "/topic/kitchen/timer/update";
    private static final String TOPIC_TIMER_COMPLETE = "/topic/kitchen/timer/complete";
    private static final String TOPIC_CAPACITY_ALERT = "/topic/kitchen/capacity/alert";
    private static final String TOPIC_NEW_ORDER = "/topic/kitchen/order/new";
    private static final String TOPIC_WORKLOAD_UPDATE = "/topic/kitchen/workload/update";

    /**
     * Broadcast timer start event
     * @param timer Started cooking timer
     */
    public void broadcastTimerStart(CookingTimer timer) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "TIMER_START");
            message.put("timerId", timer.getTimerId());
            message.put("orderId", timer.getOrder().getOrderId());
            message.put("workstationId", timer.getWorkstationId());
            message.put("estimatedDurationSeconds", timer.getEstimatedDurationSeconds());
            message.put("stage", timer.getStage());
            message.put("timestamp", LocalDateTime.now());
            
            messagingTemplate.convertAndSend(TOPIC_TIMER_START, message);
            
            // Also send to specific workstation topic
            if (timer.getWorkstationId() != null) {
                String stationTopic = "/topic/kitchen/station/" + timer.getWorkstationId() + "/timer";
                messagingTemplate.convertAndSend(stationTopic, message);
            }
            
        } catch (Exception e) {
            System.err.println("Error broadcasting timer start: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Broadcast timer progress update
     * @param timerId Timer ID
     * @param elapsedSeconds Current elapsed seconds
     */
    public void broadcastTimerUpdate(String timerId, int elapsedSeconds) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "TIMER_UPDATE");
            message.put("timerId", timerId);
            message.put("elapsedSeconds", elapsedSeconds);
            message.put("timestamp", LocalDateTime.now());
            
            messagingTemplate.convertAndSend(TOPIC_TIMER_UPDATE, message);
            
        } catch (Exception e) {
            System.err.println("Error broadcasting timer update: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Broadcast timer completion
     * @param timer Completed cooking timer
     */
    public void broadcastTimerComplete(CookingTimer timer) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "TIMER_COMPLETE");
            message.put("timerId", timer.getTimerId());
            message.put("orderId", timer.getOrder().getOrderId());
            message.put("workstationId", timer.getWorkstationId());
            message.put("actualDurationSeconds", timer.getActualDurationSeconds());
            message.put("status", timer.getStatus());
            message.put("timestamp", LocalDateTime.now());
            
            messagingTemplate.convertAndSend(TOPIC_TIMER_COMPLETE, message);
            
            // Also send to specific workstation topic
            if (timer.getWorkstationId() != null) {
                String stationTopic = "/topic/kitchen/station/" + timer.getWorkstationId() + "/timer";
                messagingTemplate.convertAndSend(stationTopic, message);
            }
            
        } catch (Exception e) {
            System.err.println("Error broadcasting timer complete: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Broadcast capacity alert
     * @param alert Workload alert
     */
    public void broadcastCapacityAlert(WorkloadAlert alert) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "CAPACITY_ALERT");
            message.put("level", alert.getLevel());
            message.put("title", alert.getTitle());
            message.put("message", alert.getMessage());
            message.put("recommendation", alert.getRecommendation());
            message.put("timestamp", alert.getCreatedAt());
            
            messagingTemplate.convertAndSend(TOPIC_CAPACITY_ALERT, message);
            
        } catch (Exception e) {
            System.err.println("Error broadcasting capacity alert: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Broadcast new order to kitchen
     * @param order New order for kitchen processing
     */
    public void broadcastNewOrderToKitchen(Order order) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "NEW_ORDER");
            message.put("orderId", order.getOrderId());
            message.put("tableNumber", order.getTableNumber());
            message.put("totalAmount", order.getTotalAmount());
            message.put("itemCount", order.getOrderItems().size());
            message.put("specialInstructions", order.getSpecialInstructions());
            message.put("priority", determineOrderPriority(order));
            message.put("timestamp", order.getOrderTime());
            
            messagingTemplate.convertAndSend(TOPIC_NEW_ORDER, message);
            
        } catch (Exception e) {
            System.err.println("Error broadcasting new order: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Broadcast workload update
     * @param capacityPercentage Current capacity percentage
     * @param activeOrders Number of active orders
     * @param queuedOrders Number of queued orders
     */
    public void broadcastWorkloadUpdate(int capacityPercentage, int activeOrders, int queuedOrders) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "WORKLOAD_UPDATE");
            message.put("capacityPercentage", capacityPercentage);
            message.put("activeOrders", activeOrders);
            message.put("queuedOrders", queuedOrders);
            message.put("timestamp", LocalDateTime.now());
            
            messagingTemplate.convertAndSend(TOPIC_WORKLOAD_UPDATE, message);
            
        } catch (Exception e) {
            System.err.println("Error broadcasting workload update: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Private helper methods
    
    private String determineOrderPriority(Order order) {
        // Simple priority logic based on order value and item count
        if (order.getTotalAmount().doubleValue() > 500) {
            return "HIGH";
        } else if (order.getOrderItems().size() > 5) {
            return "MEDIUM";
        } else {
            return "NORMAL";
        }
    }
}