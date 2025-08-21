package com.ranbow.restaurant.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class DashboardOverview {
    private RevenueMetrics revenue;
    private OrderMetrics orders;
    private CustomerMetrics customers;
    private StaffMetrics staff;
    private List<PopularItem> popularItems;
    private List<Alert> alerts;
    private LocalDateTime lastUpdated;
    
    public DashboardOverview() {
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Revenue metrics inner class
    public static class RevenueMetrics {
        private double today;
        private double yesterday;
        private double growthRate;
        private double targetProgress;
        private double weeklyTotal;
        private double monthlyTotal;
        
        // Getters and setters
        public double getToday() { return today; }
        public void setToday(double today) { this.today = today; }
        
        public double getYesterday() { return yesterday; }
        public void setYesterday(double yesterday) { this.yesterday = yesterday; }
        
        public double getGrowthRate() { return growthRate; }
        public void setGrowthRate(double growthRate) { this.growthRate = growthRate; }
        
        public double getTargetProgress() { return targetProgress; }
        public void setTargetProgress(double targetProgress) { this.targetProgress = targetProgress; }
        
        public double getWeeklyTotal() { return weeklyTotal; }
        public void setWeeklyTotal(double weeklyTotal) { this.weeklyTotal = weeklyTotal; }
        
        public double getMonthlyTotal() { return monthlyTotal; }
        public void setMonthlyTotal(double monthlyTotal) { this.monthlyTotal = monthlyTotal; }
    }
    
    // Order metrics inner class
    public static class OrderMetrics {
        private int total;
        private int pending;
        private int processing;
        private int completed;
        private int cancelled;
        private double growthRate;
        private double avgProcessingTime;
        private int urgentOrders;
        
        // Getters and setters
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
        
        public int getPending() { return pending; }
        public void setPending(int pending) { this.pending = pending; }
        
        public int getProcessing() { return processing; }
        public void setProcessing(int processing) { this.processing = processing; }
        
        public int getCompleted() { return completed; }
        public void setCompleted(int completed) { this.completed = completed; }
        
        public int getCancelled() { return cancelled; }
        public void setCancelled(int cancelled) { this.cancelled = cancelled; }
        
        public double getGrowthRate() { return growthRate; }
        public void setGrowthRate(double growthRate) { this.growthRate = growthRate; }
        
        public double getAvgProcessingTime() { return avgProcessingTime; }
        public void setAvgProcessingTime(double avgProcessingTime) { this.avgProcessingTime = avgProcessingTime; }
        
        public int getUrgentOrders() { return urgentOrders; }
        public void setUrgentOrders(int urgentOrders) { this.urgentOrders = urgentOrders; }
    }
    
    // Customer metrics inner class
    public static class CustomerMetrics {
        private int active;
        private int vip;
        private int regular;
        private double growthRate;
        private int newCustomersToday;
        private double satisfactionRate;
        
        // Getters and setters
        public int getActive() { return active; }
        public void setActive(int active) { this.active = active; }
        
        public int getVip() { return vip; }
        public void setVip(int vip) { this.vip = vip; }
        
        public int getRegular() { return regular; }
        public void setRegular(int regular) { this.regular = regular; }
        
        public double getGrowthRate() { return growthRate; }
        public void setGrowthRate(double growthRate) { this.growthRate = growthRate; }
        
        public int getNewCustomersToday() { return newCustomersToday; }
        public void setNewCustomersToday(int newCustomersToday) { this.newCustomersToday = newCustomersToday; }
        
        public double getSatisfactionRate() { return satisfactionRate; }
        public void setSatisfactionRate(double satisfactionRate) { this.satisfactionRate = satisfactionRate; }
    }
    
    // Staff metrics inner class
    public static class StaffMetrics {
        private int online;
        private int busy;
        private int onBreak;
        private int total;
        private double efficiency;
        private int scheduledToday;
        
        // Getters and setters
        public int getOnline() { return online; }
        public void setOnline(int online) { this.online = online; }
        
        public int getBusy() { return busy; }
        public void setBusy(int busy) { this.busy = busy; }
        
        public int getOnBreak() { return onBreak; }
        public void setOnBreak(int onBreak) { this.onBreak = onBreak; }
        
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
        
        public double getEfficiency() { return efficiency; }
        public void setEfficiency(double efficiency) { this.efficiency = efficiency; }
        
        public int getScheduledToday() { return scheduledToday; }
        public void setScheduledToday(int scheduledToday) { this.scheduledToday = scheduledToday; }
    }
    
    // Popular item inner class
    public static class PopularItem {
        private String itemId;
        private String name;
        private int salesCount;
        private double revenue;
        private String category;
        
        // Getters and setters
        public String getItemId() { return itemId; }
        public void setItemId(String itemId) { this.itemId = itemId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public int getSalesCount() { return salesCount; }
        public void setSalesCount(int salesCount) { this.salesCount = salesCount; }
        
        public double getRevenue() { return revenue; }
        public void setRevenue(double revenue) { this.revenue = revenue; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
    
    // Alert inner class
    public static class Alert {
        private String id;
        private String type;
        private String message;
        private String severity;
        private LocalDateTime timestamp;
        private boolean resolved;
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public boolean isResolved() { return resolved; }
        public void setResolved(boolean resolved) { this.resolved = resolved; }
    }
    
    // Main class getters and setters
    public RevenueMetrics getRevenue() { return revenue; }
    public void setRevenue(RevenueMetrics revenue) { this.revenue = revenue; }
    
    public OrderMetrics getOrders() { return orders; }
    public void setOrders(OrderMetrics orders) { this.orders = orders; }
    
    public CustomerMetrics getCustomers() { return customers; }
    public void setCustomers(CustomerMetrics customers) { this.customers = customers; }
    
    public StaffMetrics getStaff() { return staff; }
    public void setStaff(StaffMetrics staff) { this.staff = staff; }
    
    public List<PopularItem> getPopularItems() { return popularItems; }
    public void setPopularItems(List<PopularItem> popularItems) { this.popularItems = popularItems; }
    
    public List<Alert> getAlerts() { return alerts; }
    public void setAlerts(List<Alert> alerts) { this.alerts = alerts; }
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}