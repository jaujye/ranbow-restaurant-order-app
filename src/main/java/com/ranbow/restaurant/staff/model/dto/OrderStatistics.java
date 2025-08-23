package com.ranbow.restaurant.staff.model.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Order Statistics DTO
 * Comprehensive statistics for order management and performance analysis
 */
public class OrderStatistics {
    
    private String period; // TODAY, WEEK, MONTH, CUSTOM
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private LocalDateTime generatedAt;
    
    // Order volume statistics
    private int totalOrders;
    private int completedOrders;
    private int cancelledOrders;
    private int activeOrders;
    private int overdueOrders;
    
    // Performance metrics
    private double averageCompletionTime; // minutes
    private double averageWaitTime; // minutes
    private double completionRate; // percentage
    private double onTimeDeliveryRate; // percentage
    
    // Staff performance
    private Map<String, StaffPerformance> staffPerformance;
    private String topPerformer;
    private String mostAssignedStaff;
    
    // Trend analysis
    private List<HourlyTrend> hourlyTrends;
    private List<DailyTrend> dailyTrends;
    private String busiest_hour;
    private String busiestDay;
    
    // Order priority distribution
    private Map<String, Integer> priorityDistribution;
    private int urgentOrdersHandled;
    private double averageUrgentOrderTime;
    
    // Kitchen performance
    private double kitchenEfficiency; // percentage
    private int bottleneckOccurrences;
    private List<String> commonBottlenecks;
    
    // Revenue impact
    private double totalRevenue;
    private double averageOrderValue;
    private double revenuePerHour;
    
    // Additional fields for compatibility
    private String staffId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private int pendingOrders;
    private int processingOrders;
    private double averageProcessingTime;
    private double ordersPerHour;
    private double successRate;
    
    // Constructors
    public OrderStatistics() {
        this.generatedAt = LocalDateTime.now();
        this.period = "TODAY";
    }
    
    public OrderStatistics(String period, LocalDateTime periodStart, LocalDateTime periodEnd) {
        this();
        this.period = period;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
    }
    
    // Nested classes for detailed statistics
    public static class StaffPerformance {
        private String staffId;
        private String staffName;
        private int ordersCompleted;
        private double averageCompletionTime;
        private double efficiency; // percentage
        private int overdueOrders;
        private double customerSatisfactionScore;
        
        public StaffPerformance() {}
        
        public StaffPerformance(String staffId, String staffName, int ordersCompleted, 
                              double averageCompletionTime) {
            this.staffId = staffId;
            this.staffName = staffName;
            this.ordersCompleted = ordersCompleted;
            this.averageCompletionTime = averageCompletionTime;
        }
        
        // Getters and Setters
        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
        
        public String getStaffName() { return staffName; }
        public void setStaffName(String staffName) { this.staffName = staffName; }
        
        public int getOrdersCompleted() { return ordersCompleted; }
        public void setOrdersCompleted(int ordersCompleted) { this.ordersCompleted = ordersCompleted; }
        
        public double getAverageCompletionTime() { return averageCompletionTime; }
        public void setAverageCompletionTime(double averageCompletionTime) { this.averageCompletionTime = averageCompletionTime; }
        
        public double getEfficiency() { return efficiency; }
        public void setEfficiency(double efficiency) { this.efficiency = efficiency; }
        
        public int getOverdueOrders() { return overdueOrders; }
        public void setOverdueOrders(int overdueOrders) { this.overdueOrders = overdueOrders; }
        
        public double getCustomerSatisfactionScore() { return customerSatisfactionScore; }
        public void setCustomerSatisfactionScore(double customerSatisfactionScore) { this.customerSatisfactionScore = customerSatisfactionScore; }
    }
    
    public static class HourlyTrend {
        private int hour; // 0-23
        private int orderCount;
        private double averageCompletionTime;
        private double revenueGenerated;
        private int staffRequired;
        
        public HourlyTrend() {}
        
        public HourlyTrend(int hour, int orderCount) {
            this.hour = hour;
            this.orderCount = orderCount;
        }
        
        // Getters and Setters
        public int getHour() { return hour; }
        public void setHour(int hour) { this.hour = hour; }
        
        public int getOrderCount() { return orderCount; }
        public void setOrderCount(int orderCount) { this.orderCount = orderCount; }
        
        public double getAverageCompletionTime() { return averageCompletionTime; }
        public void setAverageCompletionTime(double averageCompletionTime) { this.averageCompletionTime = averageCompletionTime; }
        
        public double getRevenueGenerated() { return revenueGenerated; }
        public void setRevenueGenerated(double revenueGenerated) { this.revenueGenerated = revenueGenerated; }
        
        public int getStaffRequired() { return staffRequired; }
        public void setStaffRequired(int staffRequired) { this.staffRequired = staffRequired; }
    }
    
    public static class DailyTrend {
        private String dayOfWeek;
        private LocalDateTime date;
        private int orderCount;
        private double averageCompletionTime;
        private double revenueGenerated;
        private int peakHour;
        
        public DailyTrend() {}
        
        public DailyTrend(String dayOfWeek, LocalDateTime date, int orderCount) {
            this.dayOfWeek = dayOfWeek;
            this.date = date;
            this.orderCount = orderCount;
        }
        
        // Getters and Setters
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        
        public LocalDateTime getDate() { return date; }
        public void setDate(LocalDateTime date) { this.date = date; }
        
        public int getOrderCount() { return orderCount; }
        public void setOrderCount(int orderCount) { this.orderCount = orderCount; }
        
        public double getAverageCompletionTime() { return averageCompletionTime; }
        public void setAverageCompletionTime(double averageCompletionTime) { this.averageCompletionTime = averageCompletionTime; }
        
        public double getRevenueGenerated() { return revenueGenerated; }
        public void setRevenueGenerated(double revenueGenerated) { this.revenueGenerated = revenueGenerated; }
        
        public int getPeakHour() { return peakHour; }
        public void setPeakHour(int peakHour) { this.peakHour = peakHour; }
    }
    
    // Business logic methods
    public double getProductivity() {
        return totalOrders > 0 ? ((double) completedOrders / totalOrders) * 100 : 0;
    }
    
    public double getCancellationRate() {
        return totalOrders > 0 ? ((double) cancelledOrders / totalOrders) * 100 : 0;
    }
    
    public boolean isPerformanceGood() {
        return completionRate > 85 && onTimeDeliveryRate > 90;
    }
    
    public String getPerformanceGrade() {
        double overallScore = (completionRate + onTimeDeliveryRate) / 2;
        if (overallScore >= 95) return "A+";
        if (overallScore >= 90) return "A";
        if (overallScore >= 85) return "B+";
        if (overallScore >= 80) return "B";
        if (overallScore >= 75) return "C+";
        if (overallScore >= 70) return "C";
        return "D";
    }
    
    // Getters and Setters
    public String getPeriod() {
        return period;
    }
    
    public void setPeriod(String period) {
        this.period = period;
    }
    
    public LocalDateTime getPeriodStart() {
        return periodStart;
    }
    
    public void setPeriodStart(LocalDateTime periodStart) {
        this.periodStart = periodStart;
    }
    
    public LocalDateTime getPeriodEnd() {
        return periodEnd;
    }
    
    public void setPeriodEnd(LocalDateTime periodEnd) {
        this.periodEnd = periodEnd;
    }
    
    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }
    
    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
    
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
    
    public int getCancelledOrders() {
        return cancelledOrders;
    }
    
    public void setCancelledOrders(int cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }
    
    public int getActiveOrders() {
        return activeOrders;
    }
    
    public void setActiveOrders(int activeOrders) {
        this.activeOrders = activeOrders;
    }
    
    public int getOverdueOrders() {
        return overdueOrders;
    }
    
    public void setOverdueOrders(int overdueOrders) {
        this.overdueOrders = overdueOrders;
    }
    
    public double getAverageCompletionTime() {
        return averageCompletionTime;
    }
    
    public void setAverageCompletionTime(double averageCompletionTime) {
        this.averageCompletionTime = averageCompletionTime;
    }
    
    public double getAverageWaitTime() {
        return averageWaitTime;
    }
    
    public void setAverageWaitTime(double averageWaitTime) {
        this.averageWaitTime = averageWaitTime;
    }
    
    public double getCompletionRate() {
        return completionRate;
    }
    
    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }
    
    public double getOnTimeDeliveryRate() {
        return onTimeDeliveryRate;
    }
    
    public void setOnTimeDeliveryRate(double onTimeDeliveryRate) {
        this.onTimeDeliveryRate = onTimeDeliveryRate;
    }
    
    public Map<String, StaffPerformance> getStaffPerformance() {
        return staffPerformance;
    }
    
    public void setStaffPerformance(Map<String, StaffPerformance> staffPerformance) {
        this.staffPerformance = staffPerformance;
    }
    
    public String getTopPerformer() {
        return topPerformer;
    }
    
    public void setTopPerformer(String topPerformer) {
        this.topPerformer = topPerformer;
    }
    
    public String getMostAssignedStaff() {
        return mostAssignedStaff;
    }
    
    public void setMostAssignedStaff(String mostAssignedStaff) {
        this.mostAssignedStaff = mostAssignedStaff;
    }
    
    public List<HourlyTrend> getHourlyTrends() {
        return hourlyTrends;
    }
    
    public void setHourlyTrends(List<HourlyTrend> hourlyTrends) {
        this.hourlyTrends = hourlyTrends;
    }
    
    public List<DailyTrend> getDailyTrends() {
        return dailyTrends;
    }
    
    public void setDailyTrends(List<DailyTrend> dailyTrends) {
        this.dailyTrends = dailyTrends;
    }
    
    public String getBusiest_hour() {
        return busiest_hour;
    }
    
    public void setBusiest_hour(String busiest_hour) {
        this.busiest_hour = busiest_hour;
    }
    
    public String getBusiestDay() {
        return busiestDay;
    }
    
    public void setBusiestDay(String busiestDay) {
        this.busiestDay = busiestDay;
    }
    
    public Map<String, Integer> getPriorityDistribution() {
        return priorityDistribution;
    }
    
    public void setPriorityDistribution(Map<String, Integer> priorityDistribution) {
        this.priorityDistribution = priorityDistribution;
    }
    
    public int getUrgentOrdersHandled() {
        return urgentOrdersHandled;
    }
    
    public void setUrgentOrdersHandled(int urgentOrdersHandled) {
        this.urgentOrdersHandled = urgentOrdersHandled;
    }
    
    public double getAverageUrgentOrderTime() {
        return averageUrgentOrderTime;
    }
    
    public void setAverageUrgentOrderTime(double averageUrgentOrderTime) {
        this.averageUrgentOrderTime = averageUrgentOrderTime;
    }
    
    public double getKitchenEfficiency() {
        return kitchenEfficiency;
    }
    
    public void setKitchenEfficiency(double kitchenEfficiency) {
        this.kitchenEfficiency = kitchenEfficiency;
    }
    
    public int getBottleneckOccurrences() {
        return bottleneckOccurrences;
    }
    
    public void setBottleneckOccurrences(int bottleneckOccurrences) {
        this.bottleneckOccurrences = bottleneckOccurrences;
    }
    
    public List<String> getCommonBottlenecks() {
        return commonBottlenecks;
    }
    
    public void setCommonBottlenecks(List<String> commonBottlenecks) {
        this.commonBottlenecks = commonBottlenecks;
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
    
    public double getRevenuePerHour() {
        return revenuePerHour;
    }
    
    public void setRevenuePerHour(double revenuePerHour) {
        this.revenuePerHour = revenuePerHour;
    }
    
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public LocalDateTime getStartDate() {
        return startDate != null ? startDate : periodStart;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
        // Keep consistency with periodStart
        if (this.periodStart == null) {
            this.periodStart = startDate;
        }
    }
    
    public LocalDateTime getEndDate() {
        return endDate != null ? endDate : periodEnd;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
        // Keep consistency with periodEnd
        if (this.periodEnd == null) {
            this.periodEnd = endDate;
        }
    }
    
    public int getPendingOrders() {
        return pendingOrders;
    }
    
    public void setPendingOrders(int pendingOrders) {
        this.pendingOrders = pendingOrders;
    }
    
    public int getProcessingOrders() {
        return processingOrders;
    }
    
    public void setProcessingOrders(int processingOrders) {
        this.processingOrders = processingOrders;
    }
    
    public double getAverageProcessingTime() {
        return averageProcessingTime != 0 ? averageProcessingTime : averageCompletionTime;
    }
    
    public void setAverageProcessingTime(double averageProcessingTime) {
        this.averageProcessingTime = averageProcessingTime;
    }
    
    public double getOrdersPerHour() {
        return ordersPerHour;
    }
    
    public void setOrdersPerHour(double ordersPerHour) {
        this.ordersPerHour = ordersPerHour;
    }
    
    public double getSuccessRate() {
        return successRate != 0 ? successRate : completionRate;
    }
    
    public void setSuccessRate(double successRate) {
        this.successRate = successRate;
    }
    
    @Override
    public String toString() {
        return "OrderStatistics{" +
                "period='" + period + '\'' +
                ", totalOrders=" + totalOrders +
                ", completedOrders=" + completedOrders +
                ", completionRate=" + completionRate +
                ", averageCompletionTime=" + averageCompletionTime +
                ", onTimeDeliveryRate=" + onTimeDeliveryRate +
                ", generatedAt=" + generatedAt +
                '}';
    }
}