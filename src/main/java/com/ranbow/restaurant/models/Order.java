package com.ranbow.restaurant.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Order {
    private String orderId;
    private String customerId;
    private List<OrderItem> orderItems;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal tax;
    private BigDecimal subtotal;
    private String specialInstructions;
    private LocalDateTime orderTime;
    private LocalDateTime completedTime;
    private String tableNumber;
    
    public Order() {
        this.orderId = UUID.randomUUID().toString();
        this.orderItems = new ArrayList<>();
        this.status = OrderStatus.PENDING;
        this.orderTime = LocalDateTime.now();
        this.totalAmount = BigDecimal.ZERO;
        this.tax = BigDecimal.ZERO;
        this.subtotal = BigDecimal.ZERO;
    }
    
    public Order(String customerId, String tableNumber) {
        this();
        this.customerId = customerId;
        this.tableNumber = tableNumber;
    }
    
    public void addOrderItem(OrderItem orderItem) {
        this.orderItems.add(orderItem);
        calculateTotals();
    }
    
    public void removeOrderItem(OrderItem orderItem) {
        this.orderItems.remove(orderItem);
        calculateTotals();
    }
    
    private void calculateTotals() {
        this.subtotal = orderItems.stream()
                .map(item -> item.getMenuItem().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate tax (assuming 10% tax rate)
        this.tax = subtotal.multiply(new BigDecimal("0.10"));
        this.totalAmount = subtotal.add(tax);
    }
    
    // Getters and Setters
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
    
    public List<OrderItem> getOrderItems() {
        return orderItems;
    }
    
    // Alias for front-end compatibility
    public List<OrderItem> getItems() {
        return orderItems;
    }
    
    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
        calculateTotals();
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
        this.status = status;
        if (status == OrderStatus.COMPLETED) {
            this.completedTime = LocalDateTime.now();
        }
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public BigDecimal getTax() {
        return tax;
    }
    
    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public String getSpecialInstructions() {
        return specialInstructions;
    }
    
    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }
    
    public LocalDateTime getOrderTime() {
        return orderTime;
    }
    
    // Alias for front-end compatibility
    public LocalDateTime getCreatedAt() {
        return orderTime;
    }
    
    public void setOrderTime(LocalDateTime orderTime) {
        this.orderTime = orderTime;
    }
    
    public LocalDateTime getCompletedTime() {
        return completedTime;
    }
    
    public void setCompletedTime(LocalDateTime completedTime) {
        this.completedTime = completedTime;
    }
    
    public String getTableNumber() {
        return tableNumber;
    }
    
    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }
    
    @Override
    public String toString() {
        return "Order{" +
                "orderId='" + orderId + '\'' +
                ", customerId='" + customerId + '\'' +
                ", status=" + status +
                ", totalAmount=" + totalAmount +
                ", tableNumber=" + tableNumber +
                ", orderTime=" + orderTime +
                '}';
    }
}