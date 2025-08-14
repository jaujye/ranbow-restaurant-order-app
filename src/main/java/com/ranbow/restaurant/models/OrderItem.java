package com.ranbow.restaurant.models;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderItem {
    private String orderItemId;
    private MenuItem menuItem;
    private int quantity;
    private String specialRequests;
    private BigDecimal itemTotal;
    
    public OrderItem() {
        this.orderItemId = UUID.randomUUID().toString();
        this.quantity = 1;
    }
    
    public OrderItem(MenuItem menuItem, int quantity) {
        this();
        this.menuItem = menuItem;
        this.quantity = quantity;
        calculateItemTotal();
    }
    
    public OrderItem(MenuItem menuItem, int quantity, String specialRequests) {
        this(menuItem, quantity);
        this.specialRequests = specialRequests;
    }
    
    private void calculateItemTotal() {
        if (menuItem != null) {
            this.itemTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(quantity));
        } else {
            this.itemTotal = BigDecimal.ZERO;
        }
    }
    
    // Getters and Setters
    public String getOrderItemId() {
        return orderItemId;
    }
    
    public void setOrderItemId(String orderItemId) {
        this.orderItemId = orderItemId;
    }
    
    public MenuItem getMenuItem() {
        return menuItem;
    }
    
    public void setMenuItem(MenuItem menuItem) {
        this.menuItem = menuItem;
        calculateItemTotal();
    }
    
    public int getQuantity() {
        return quantity;
    }
    
    public void setQuantity(int quantity) {
        this.quantity = quantity;
        calculateItemTotal();
    }
    
    public String getSpecialRequests() {
        return specialRequests;
    }
    
    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
    
    public BigDecimal getItemTotal() {
        return itemTotal;
    }
    
    public void setItemTotal(BigDecimal itemTotal) {
        this.itemTotal = itemTotal;
    }
    
    @Override
    public String toString() {
        return "OrderItem{" +
                "orderItemId='" + orderItemId + '\'' +
                ", menuItem=" + menuItem.getName() +
                ", quantity=" + quantity +
                ", itemTotal=" + itemTotal +
                '}';
    }
}