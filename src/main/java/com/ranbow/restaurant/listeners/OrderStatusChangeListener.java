package com.ranbow.restaurant.listeners;

import com.ranbow.restaurant.dao.KitchenOrderDAO;
import com.ranbow.restaurant.events.OrderStatusChangeEvent;
import com.ranbow.restaurant.models.KitchenOrder;
import com.ranbow.restaurant.models.KitchenStatus;
import com.ranbow.restaurant.models.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listens to order status change events and handles related actions
 */
@Component
public class OrderStatusChangeListener {

    @Autowired
    private KitchenOrderDAO kitchenOrderDAO;

    @EventListener
    public void handleOrderStatusChange(OrderStatusChangeEvent event) {
        try {
            // Handle automatic KitchenOrder creation when order is confirmed
            if (event.getOldStatus() == OrderStatus.PENDING && event.getNewStatus() == OrderStatus.CONFIRMED) {
                createKitchenOrder(event);
            }
        } catch (Exception e) {
            System.err.println("Error handling order status change event for order " + event.getOrderId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void createKitchenOrder(OrderStatusChangeEvent event) {
        try {
            // Check if kitchen order already exists
            if (kitchenOrderDAO.findByOrderId(event.getOrderId()).isEmpty()) {
                // Calculate estimated cooking time based on order items
                int estimatedCookingTime = calculateEstimatedCookingTime(event.getOrder());
                
                // Create new kitchen order
                KitchenOrder kitchenOrder = new KitchenOrder(event.getOrderId(), estimatedCookingTime);
                kitchenOrder.setKitchenStatus(KitchenStatus.QUEUED);
                kitchenOrderDAO.save(kitchenOrder);
                
                System.out.println("Created KitchenOrder for confirmed order: " + event.getOrderId());
            }
        } catch (Exception e) {
            System.err.println("Failed to create kitchen order for " + event.getOrderId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Helper method to calculate estimated cooking time
    private int calculateEstimatedCookingTime(com.ranbow.restaurant.models.Order order) {
        // Simple calculation based on number of items
        // In a real system, this would consider item complexity, current kitchen load, etc.
        int baseTime = 15; // Base cooking time in minutes
        int itemCount = order.getOrderItems().size();
        return baseTime + (itemCount * 5); // Additional 5 minutes per item
    }
}