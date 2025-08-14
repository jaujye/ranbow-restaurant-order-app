package com.ranbow.restaurant.services;

import com.ranbow.restaurant.models.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class OrderService {
    private List<Order> orders;
    private MenuService menuService;
    
    public OrderService(MenuService menuService) {
        this.orders = new ArrayList<>();
        this.menuService = menuService;
    }
    
    public Order createOrder(String customerId, int tableNumber) {
        Order newOrder = new Order(customerId, tableNumber);
        orders.add(newOrder);
        return newOrder;
    }
    
    public Optional<Order> findOrderById(String orderId) {
        return orders.stream()
                .filter(order -> order.getOrderId().equals(orderId))
                .findFirst();
    }
    
    public List<Order> getAllOrders() {
        return new ArrayList<>(orders);
    }
    
    public List<Order> getOrdersByCustomerId(String customerId) {
        return orders.stream()
                .filter(order -> order.getCustomerId().equals(customerId))
                .toList();
    }
    
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orders.stream()
                .filter(order -> order.getStatus() == status)
                .toList();
    }
    
    public List<Order> getPendingOrders() {
        return getOrdersByStatus(OrderStatus.PENDING);
    }
    
    public List<Order> getActiveOrders() {
        return orders.stream()
                .filter(order -> order.getStatus() != OrderStatus.COMPLETED && 
                               order.getStatus() != OrderStatus.CANCELLED)
                .toList();
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
            
            return order.getOrderItems().removeIf(item -> item.getOrderItemId().equals(orderItemId));
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
            return true;
        }
        return false;
    }
    
    public List<Order> getTodaysOrders() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        return orders.stream()
                .filter(order -> order.getOrderTime().isAfter(startOfDay) && 
                               order.getOrderTime().isBefore(endOfDay))
                .toList();
    }
    
    public int getTotalOrdersCount() {
        return orders.size();
    }
    
    public int getTodaysOrdersCount() {
        return getTodaysOrders().size();
    }
    
    public int getCompletedOrdersCount() {
        return (int) orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .count();
    }
}