package com.ranbow.restaurant.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Staff performance statistics entity
 * Tracks daily, weekly, and monthly performance metrics for staff members
 */
public class StaffStatistics {
    private String statisticsId;
    private String staffId;
    private LocalDate date;
    private StatisticsPeriod period; // DAILY, WEEKLY, MONTHLY
    
    // Performance Metrics
    private int ordersProcessed;
    private int ordersCompleted;
    private int ordersCancelled;
    private double averageProcessingTimeMinutes;
    private int overtimeOrders; // Orders that exceeded expected processing time
    private double efficiencyRating; // 0.0 - 1.0
    
    // Time Metrics
    private int workingMinutes;
    private int activeMinutes; // Time actually working on orders
    private int breakMinutes;
    
    // Quality Metrics
    private int customerCompliments;
    private int customerComplaints;
    private double customerSatisfactionRating; // 0.0 - 5.0
    
    // Revenue Metrics
    private double totalRevenue; // Total revenue from processed orders
    private double averageOrderValue;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public StaffStatistics() {
        this.statisticsId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.date = LocalDate.now();
        this.period = StatisticsPeriod.DAILY;
        initializeDefaults();
    }
    
    public StaffStatistics(String staffId, LocalDate date, StatisticsPeriod period) {
        this();
        this.staffId = staffId;
        this.date = date;
        this.period = period;
    }
    
    private void initializeDefaults() {
        this.ordersProcessed = 0;
        this.ordersCompleted = 0;
        this.ordersCancelled = 0;
        this.averageProcessingTimeMinutes = 0.0;
        this.overtimeOrders = 0;
        this.efficiencyRating = 0.0;
        this.workingMinutes = 0;
        this.activeMinutes = 0;
        this.breakMinutes = 0;
        this.customerCompliments = 0;
        this.customerComplaints = 0;
        this.customerSatisfactionRating = 0.0;
        this.totalRevenue = 0.0;
        this.averageOrderValue = 0.0;
    }
    
    // Business methods
    public void recordOrderCompleted(double processingTimeMinutes, double orderValue) {
        this.ordersProcessed++;
        this.ordersCompleted++;
        
        // Update average processing time
        double totalTime = this.averageProcessingTimeMinutes * (this.ordersCompleted - 1) + processingTimeMinutes;
        this.averageProcessingTimeMinutes = totalTime / this.ordersCompleted;
        
        // Update revenue metrics
        this.totalRevenue += orderValue;
        this.averageOrderValue = this.totalRevenue / this.ordersCompleted;
        
        // Check if order was overtime (assuming 20 minutes is the standard)
        if (processingTimeMinutes > 20.0) {
            this.overtimeOrders++;
        }
        
        // Calculate efficiency rating (completion rate * time efficiency)
        double completionRate = (double) this.ordersCompleted / this.ordersProcessed;
        double timeEfficiency = Math.max(0.0, Math.min(1.0, 20.0 / this.averageProcessingTimeMinutes));
        this.efficiencyRating = completionRate * timeEfficiency;
        
        this.updatedAt = LocalDateTime.now();
    }
    
    public void recordOrderCancelled() {
        this.ordersProcessed++;
        this.ordersCancelled++;
        
        // Recalculate efficiency rating
        double completionRate = (double) this.ordersCompleted / this.ordersProcessed;
        double timeEfficiency = this.ordersCompleted > 0 ? 
            Math.max(0.0, Math.min(1.0, 20.0 / this.averageProcessingTimeMinutes)) : 0.0;
        this.efficiencyRating = completionRate * timeEfficiency;
        
        this.updatedAt = LocalDateTime.now();
    }
    
    public void addWorkingTime(int minutes) {
        this.workingMinutes += minutes;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void addActiveTime(int minutes) {
        this.activeMinutes += minutes;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void addBreakTime(int minutes) {
        this.breakMinutes += minutes;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void recordCustomerCompliment() {
        this.customerCompliments++;
        updateCustomerSatisfactionRating();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void recordCustomerComplaint() {
        this.customerComplaints++;
        updateCustomerSatisfactionRating();
        this.updatedAt = LocalDateTime.now();
    }
    
    private void updateCustomerSatisfactionRating() {
        int totalFeedback = this.customerCompliments + this.customerComplaints;
        if (totalFeedback > 0) {
            // Rating from 1.0 (all complaints) to 5.0 (all compliments)
            this.customerSatisfactionRating = 1.0 + 4.0 * ((double) this.customerCompliments / totalFeedback);
        }
    }
    
    public double getCompletionRate() {
        return this.ordersProcessed > 0 ? (double) this.ordersCompleted / this.ordersProcessed : 0.0;
    }
    
    public double getOvertimeRate() {
        return this.ordersCompleted > 0 ? (double) this.overtimeOrders / this.ordersCompleted : 0.0;
    }
    
    public double getActivityRate() {
        return this.workingMinutes > 0 ? (double) this.activeMinutes / this.workingMinutes : 0.0;
    }
    
    // Getters and Setters
    public String getStatisticsId() {
        return statisticsId;
    }
    
    public void setStatisticsId(String statisticsId) {
        this.statisticsId = statisticsId;
    }
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public StatisticsPeriod getPeriod() {
        return period;
    }
    
    public void setPeriod(StatisticsPeriod period) {
        this.period = period;
    }
    
    public int getOrdersProcessed() {
        return ordersProcessed;
    }
    
    public void setOrdersProcessed(int ordersProcessed) {
        this.ordersProcessed = ordersProcessed;
    }
    
    public int getOrdersCompleted() {
        return ordersCompleted;
    }
    
    public void setOrdersCompleted(int ordersCompleted) {
        this.ordersCompleted = ordersCompleted;
    }
    
    public int getOrdersCancelled() {
        return ordersCancelled;
    }
    
    public void setOrdersCancelled(int ordersCancelled) {
        this.ordersCancelled = ordersCancelled;
    }
    
    public double getAverageProcessingTimeMinutes() {
        return averageProcessingTimeMinutes;
    }
    
    public void setAverageProcessingTimeMinutes(double averageProcessingTimeMinutes) {
        this.averageProcessingTimeMinutes = averageProcessingTimeMinutes;
    }
    
    public int getOvertimeOrders() {
        return overtimeOrders;
    }
    
    public void setOvertimeOrders(int overtimeOrders) {
        this.overtimeOrders = overtimeOrders;
    }
    
    public double getEfficiencyRating() {
        return efficiencyRating;
    }
    
    public void setEfficiencyRating(double efficiencyRating) {
        this.efficiencyRating = efficiencyRating;
    }
    
    public int getWorkingMinutes() {
        return workingMinutes;
    }
    
    public void setWorkingMinutes(int workingMinutes) {
        this.workingMinutes = workingMinutes;
    }
    
    public int getActiveMinutes() {
        return activeMinutes;
    }
    
    public void setActiveMinutes(int activeMinutes) {
        this.activeMinutes = activeMinutes;
    }
    
    public int getBreakMinutes() {
        return breakMinutes;
    }
    
    public void setBreakMinutes(int breakMinutes) {
        this.breakMinutes = breakMinutes;
    }
    
    public int getCustomerCompliments() {
        return customerCompliments;
    }
    
    public void setCustomerCompliments(int customerCompliments) {
        this.customerCompliments = customerCompliments;
    }
    
    public int getCustomerComplaints() {
        return customerComplaints;
    }
    
    public void setCustomerComplaints(int customerComplaints) {
        this.customerComplaints = customerComplaints;
    }
    
    public double getCustomerSatisfactionRating() {
        return customerSatisfactionRating;
    }
    
    public void setCustomerSatisfactionRating(double customerSatisfactionRating) {
        this.customerSatisfactionRating = customerSatisfactionRating;
    }
    
    public double getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public double getAverageOrderValue() {
        return averageOrderValue;
    }
    
    public void setAverageOrderValue(double averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "StaffStatistics{" +
                "statisticsId='" + statisticsId + '\'' +
                ", staffId='" + staffId + '\'' +
                ", date=" + date +
                ", period=" + period +
                ", ordersProcessed=" + ordersProcessed +
                ", ordersCompleted=" + ordersCompleted +
                ", efficiencyRating=" + efficiencyRating +
                ", totalRevenue=" + totalRevenue +
                '}';
    }
}