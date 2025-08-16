package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.OrderDAO;
import com.ranbow.restaurant.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
                order.setStatus(OrderStatus.CONFIRMED);
                orderDAO.update(order);
                return true;
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
                order.setStatus(newStatus);
                orderDAO.update(order);
                return true;
            } else {
                throw new IllegalStateException("無效的狀態轉換: " + 
                        order.getStatus() + " -> " + newStatus);
            }
        }
        return false;
    }
    
    private boolean isValidStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        return switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
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
            
            order.setStatus(OrderStatus.CANCELLED);
            order.setSpecialInstructions((order.getSpecialInstructions() != null ? 
                    order.getSpecialInstructions() + " | " : "") + "取消原因: " + reason);
            orderDAO.update(order);
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