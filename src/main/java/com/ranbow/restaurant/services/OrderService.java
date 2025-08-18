package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.OrderDAO;
import com.ranbow.restaurant.models.*;
import com.ranbow.restaurant.api.OrderController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    
    @Autowired
    private OrderDAO orderDAO;
    
    @Autowired
    private MenuService menuService;
    
    public Order createOrder(String customerId, int tableNumber) {
        Order newOrder = new Order(customerId, tableNumber);
        return orderDAO.save(newOrder);
    }
    
    public Order createCompleteOrder(OrderController.CreateCompleteOrderRequest request) {
        // Create the order
        Order order = new Order(request.getCustomerId(), request.getTableNumber());
        
        // Set special instructions
        if (request.getSpecialInstructions() != null && !request.getSpecialInstructions().trim().isEmpty()) {
            order.setSpecialInstructions(request.getSpecialInstructions());
        }
        
        // Set initial status based on request
        if (request.getStatus() != null) {
            try {
                OrderStatus status = OrderStatus.valueOf(request.getStatus());
                order.setStatus(status);
            } catch (IllegalArgumentException e) {
                // Default to PENDING if invalid status provided
                order.setStatus(OrderStatus.PENDING);
            }
        }
        
        // Save the order first to get an ID
        order = orderDAO.save(order);
        
        // Add items to the order
        if (request.getItems() != null) {
            for (OrderController.OrderItemRequest itemRequest : request.getItems()) {
                Optional<MenuItem> menuItemOpt = menuService.findMenuItemById(itemRequest.getMenuItemId());
                if (menuItemOpt.isPresent()) {
                    MenuItem menuItem = menuItemOpt.get();
                    OrderItem orderItem = new OrderItem(menuItem, itemRequest.getQuantity(), itemRequest.getSpecialRequests());
                    order.addOrderItem(orderItem);
                } else {
                    throw new IllegalArgumentException("菜單項目不存在: " + itemRequest.getMenuItemId());
                }
            }
        }
        
        // Set custom totals if provided (for cases where frontend calculates with service fees)
        if (request.getTotalAmount() > 0) {
            order.setSubtotal(BigDecimal.valueOf(request.getSubtotal()));
            order.setTax(BigDecimal.valueOf(request.getTax()));
            order.setTotalAmount(BigDecimal.valueOf(request.getTotalAmount()));
        }
        
        // Update the order with items and totals
        orderDAO.update(order);
        return order;
    }
    
    public Optional<Order> findOrderById(String orderId) {
        return orderDAO.findById(orderId);
    }
    
    public List<Order> getAllOrders() {
        return orderDAO.findAll();
    }
    
    public List<Order> getOrdersByCustomerId(String customerId) {
        try {
            if (customerId == null || customerId.trim().isEmpty()) {
                System.err.println("Invalid customer ID provided: " + customerId);
                return new java.util.ArrayList<>();
            }
            return orderDAO.findByCustomerId(customerId);
        } catch (Exception e) {
            System.err.println("Error in OrderService.getOrdersByCustomerId for customer " + customerId + ": " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }
    
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderDAO.findByStatus(status);
    }
    
    public List<Order> getPendingOrders() {
        return getOrdersByStatus(OrderStatus.PENDING);
    }
    
    public List<Order> getActiveOrders() {
        return orderDAO.findActiveOrders();
    }
    
    public boolean addItemToOrder(String orderId, String menuItemId, int quantity, String specialRequests) {
        Optional<Order> orderOpt = findOrderById(orderId);
        Optional<MenuItem> menuItemOpt = menuService.findMenuItemById(menuItemId);
        
        if (orderOpt.isPresent() && menuItemOpt.isPresent()) {
            Order order = orderOpt.get();
            MenuItem menuItem = menuItemOpt.get();
            
            if (!menuItem.isAvailable()) {
                throw new IllegalArgumentException("菜單項目目前不可用: " + menuItem.getName());
            }
            
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new IllegalStateException("只能在訂單待確認狀態下添加項目");
            }
            
            OrderItem orderItem = new OrderItem(menuItem, quantity, specialRequests);
            order.addOrderItem(orderItem);
            orderDAO.update(order);
            return true;
        }
        return false;
    }
    
    public boolean removeItemFromOrder(String orderId, String orderItemId) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new IllegalStateException("只能在訂單待確認狀態下移除項目");
            }
            
            boolean removed = order.getOrderItems().removeIf(item -> item.getOrderItemId().equals(orderItemId));
            if (removed) {
                orderDAO.update(order);
            }
            return removed;
        }
        return false;
    }
    
    public boolean updateOrderItemQuantity(String orderId, String orderItemId, int newQuantity) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new IllegalStateException("只能在訂單待確認狀態下修改數量");
            }
            
            Optional<OrderItem> orderItem = order.getOrderItems().stream()
                    .filter(item -> item.getOrderItemId().equals(orderItemId))
                    .findFirst();
            
            if (orderItem.isPresent()) {
                orderItem.get().setQuantity(newQuantity);
                orderDAO.update(order);
                return true;
            }
        }
        return false;
    }
    
    public boolean confirmOrder(String orderId) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            if (order.getOrderItems().isEmpty()) {
                throw new IllegalStateException("無法確認空訂單");
            }
            
            if (order.getStatus() == OrderStatus.PENDING) {
                // Use updateStatus method to properly update the status in database
                boolean updated = orderDAO.updateStatus(orderId, OrderStatus.CONFIRMED);
                if (updated) {
                    order.setStatus(OrderStatus.CONFIRMED); // Update local object status
                    return true;
                } else {
                    throw new RuntimeException("Failed to update order status in database");
                }
            }
        }
        return false;
    }
    
    public boolean updateOrderStatus(String orderId, OrderStatus newStatus) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            // Validate status transition
            if (isValidStatusTransition(order.getStatus(), newStatus)) {
                // Use updateStatus method to properly update the status in database
                boolean updated = orderDAO.updateStatus(orderId, newStatus);
                if (updated) {
                    order.setStatus(newStatus); // Update local object status
                    return true;
                } else {
                    throw new RuntimeException("Failed to update order status in database");
                }
            } else {
                throw new IllegalStateException("無效的狀態轉換: " + 
                        order.getStatus() + " -> " + newStatus);
            }
        }
        return false;
    }
    
    private boolean isValidStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        return switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.PENDING_PAYMENT || newStatus == OrderStatus.CANCELLED;
            case PENDING_PAYMENT -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.CANCELLED;
            case PREPARING -> newStatus == OrderStatus.READY || newStatus == OrderStatus.CANCELLED;
            case READY -> newStatus == OrderStatus.DELIVERED;
            case DELIVERED -> newStatus == OrderStatus.COMPLETED;
            case COMPLETED, CANCELLED -> false; // Final states
        };
    }
    
    public boolean cancelOrder(String orderId, String reason) {
        Optional<Order> orderOpt = findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            
            if (order.getStatus() == OrderStatus.COMPLETED) {
                throw new IllegalStateException("無法取消已完成的訂單");
            }
            
            // Update order status first
            boolean statusUpdated = orderDAO.updateStatus(orderId, OrderStatus.CANCELLED);
            if (!statusUpdated) {
                throw new RuntimeException("Failed to update order status to CANCELLED");
            }
            
            // Update special instructions
            order.setStatus(OrderStatus.CANCELLED);
            order.setSpecialInstructions((order.getSpecialInstructions() != null ? 
                    order.getSpecialInstructions() + " | " : "") + "取消原因: " + reason);
            orderDAO.update(order); // This will update other fields like special_instructions
            return true;
        }
        return false;
    }
    
    public List<Order> getTodaysOrders() {
        return orderDAO.findTodaysOrders();
    }
    
    public int getTotalOrdersCount() {
        return getAllOrders().size();
    }
    
    public int getTodaysOrdersCount() {
        return getTodaysOrders().size();
    }
    
    public int getCompletedOrdersCount() {
        return getOrdersByStatus(OrderStatus.COMPLETED).size();
    }
}