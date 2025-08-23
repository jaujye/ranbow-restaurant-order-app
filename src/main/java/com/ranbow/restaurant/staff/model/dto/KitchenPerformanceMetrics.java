package com.ranbow.restaurant.staff.model.dto;

import java.time.LocalDateTime;

/**
 * DTO for kitchen performance metrics
 */
public class KitchenPerformanceMetrics {
    
    private int totalOrders;
    private int completedOrders;
    private int onTimeOrders;
    private double avgCookingTimeMinutes;
    private double avgVarianceMinutes;
    private double completionRate;
    private double onTimeRate;
    private String period;
    private LocalDateTime generatedAt;
    
    // Constructors
    public KitchenPerformanceMetrics() {}
    
    public KitchenPerformanceMetrics(int totalOrders, int completedOrders, int onTimeOrders,
                                   double avgCookingTimeMinutes, double avgVarianceMinutes,
                                   double completionRate, double onTimeRate, 
                                   String period, LocalDateTime generatedAt) {
        this.totalOrders = totalOrders;
        this.completedOrders = completedOrders;
        this.onTimeOrders = onTimeOrders;
        this.avgCookingTimeMinutes = avgCookingTimeMinutes;
        this.avgVarianceMinutes = avgVarianceMinutes;
        this.completionRate = completionRate;
        this.onTimeRate = onTimeRate;
        this.period = period;
        this.generatedAt = generatedAt;
    }
    
    // Factory method for empty metrics
    public static KitchenPerformanceMetrics empty() {
        return new KitchenPerformanceMetrics(0, 0, 0, 0.0, 0.0, 0.0, 0.0, 
                                           "unknown", LocalDateTime.now());
    }
    
    // Getters and Setters
    public int getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public int getCompletedOrders() {
        return completedOrders;
    }
    
    public void setCompletedOrders(int completedOrders) {
        this.completedOrders = completedOrders;
    }
    
    public int getOnTimeOrders() {
        return onTimeOrders;
    }
    
    public void setOnTimeOrders(int onTimeOrders) {
        this.onTimeOrders = onTimeOrders;
    }
    
    public double getAvgCookingTimeMinutes() {
        return avgCookingTimeMinutes;
    }
    
    public void setAvgCookingTimeMinutes(double avgCookingTimeMinutes) {
        this.avgCookingTimeMinutes = avgCookingTimeMinutes;
    }
    
    public double getAvgVarianceMinutes() {
        return avgVarianceMinutes;
    }
    
    public void setAvgVarianceMinutes(double avgVarianceMinutes) {
        this.avgVarianceMinutes = avgVarianceMinutes;
    }
    
    public double getCompletionRate() {
        return completionRate;
    }
    
    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }
    
    public double getOnTimeRate() {
        return onTimeRate;
    }
    
    public void setOnTimeRate(double onTimeRate) {
        this.onTimeRate = onTimeRate;
    }
    
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
    
    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }
    
    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
    
    @Override
    public String toString() {
        return "KitchenPerformanceMetrics{" +
                "totalOrders=" + totalOrders +
                ", completedOrders=" + completedOrders +
                ", onTimeOrders=" + onTimeOrders +
                ", avgCookingTimeMinutes=" + avgCookingTimeMinutes +
                ", completionRate=" + completionRate +
                ", onTimeRate=" + onTimeRate +
                ", period='" + period + '\'' +
                '}';
    }
}