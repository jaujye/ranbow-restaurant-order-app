package com.ranbow.restaurant.staff.model.dto;

/**
 * DTO representing kitchen capacity information
 */
public class KitchenCapacity {
    
    private double capacityPercentage;
    private int activeOrders;
    private int queuedOrders;
    private int maxCapacity;
    private double waitTime; // in minutes
    private String status; // NORMAL, BUSY, CRITICAL, FULL
    
    // Constructors
    public KitchenCapacity() {}
    
    public KitchenCapacity(double capacityPercentage, int activeOrders, int queuedOrders, 
                          int maxCapacity, double waitTime, String status) {
        this.capacityPercentage = capacityPercentage;
        this.activeOrders = activeOrders;
        this.queuedOrders = queuedOrders;
        this.maxCapacity = maxCapacity;
        this.waitTime = waitTime;
        this.status = status;
    }
    
    // Getters and Setters
    public double getCapacityPercentage() {
        return capacityPercentage;
    }
    
    public void setCapacityPercentage(double capacityPercentage) {
        this.capacityPercentage = capacityPercentage;
    }
    
    public int getActiveOrders() {
        return activeOrders;
    }
    
    public void setActiveOrders(int activeOrders) {
        this.activeOrders = activeOrders;
    }
    
    public int getQueuedOrders() {
        return queuedOrders;
    }
    
    public void setQueuedOrders(int queuedOrders) {
        this.queuedOrders = queuedOrders;
    }
    
    public int getMaxCapacity() {
        return maxCapacity;
    }
    
    public void setMaxCapacity(int maxCapacity) {
        this.maxCapacity = maxCapacity;
    }
    
    public double getWaitTime() {
        return waitTime;
    }
    
    public void setWaitTime(double waitTime) {
        this.waitTime = waitTime;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    @Override
    public String toString() {
        return "KitchenCapacity{" +
                "capacityPercentage=" + capacityPercentage +
                ", activeOrders=" + activeOrders +
                ", queuedOrders=" + queuedOrders +
                ", maxCapacity=" + maxCapacity +
                ", waitTime=" + waitTime +
                ", status='" + status + '\'' +
                '}';
    }
}