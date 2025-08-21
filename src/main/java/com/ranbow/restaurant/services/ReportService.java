package com.ranbow.restaurant.services;

import com.ranbow.restaurant.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class ReportService {
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private MenuService menuService;
    
    public DailyReport generateDailyReport() {
        DailyReport report = new DailyReport();
        report.setReportDate(LocalDateTime.now());
        
        // Order statistics
        List<Order> todaysOrders = orderService.getTodaysOrders();
        report.setTotalOrders(todaysOrders.size());
        report.setCompletedOrders((int) todaysOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .count());
        report.setCancelledOrders((int) todaysOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.CANCELLED)
                .count());
        
        // Revenue statistics
        List<Payment> todaysPayments = paymentService.getTodaysPayments();
        report.setTotalRevenue(paymentService.getTodaysRevenue());
        report.setSuccessfulPayments((int) todaysPayments.stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.COMPLETED)
                .count());
        
        // Popular items
        report.setPopularItems(getPopularItemsToday());
        
        // Payment method breakdown
        report.setPaymentMethodBreakdown(getPaymentMethodBreakdown(todaysPayments));
        
        return report;
    }
    
    public SystemOverviewReport generateSystemOverview() {
        SystemOverviewReport report = new SystemOverviewReport();
        
        // General statistics
        report.setTotalUsers(userService.getTotalActiveUsers());
        report.setTotalCustomers(userService.getTotalCustomers());
        report.setTotalMenuItems(menuService.getTotalMenuItems());
        report.setAvailableMenuItems(menuService.getAvailableItemsCount());
        
        // Order statistics
        report.setTotalOrders(orderService.getTotalOrdersCount());
        report.setCompletedOrders(orderService.getCompletedOrdersCount());
        report.setTodaysOrders(orderService.getTodaysOrdersCount());
        
        // Revenue statistics
        report.setTotalRevenue(paymentService.getTotalRevenue());
        report.setTodaysRevenue(paymentService.getTodaysRevenue());
        report.setPaymentSuccessRate(paymentService.getPaymentSuccessRate());
        
        // Active orders by status
        report.setActiveOrdersByStatus(getActiveOrdersByStatus());
        
        return report;
    }
    
    private Map<String, Integer> getPopularItemsToday() {
        Map<String, Integer> itemCounts = new HashMap<>();
        
        List<Order> todaysOrders = orderService.getTodaysOrders();
        todaysOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .flatMap(order -> order.getOrderItems().stream())
                .forEach(orderItem -> {
                    String itemName = orderItem.getMenuItem().getName();
                    itemCounts.put(itemName, itemCounts.getOrDefault(itemName, 0) + orderItem.getQuantity());
                });
        
        return itemCounts;
    }
    
    private Map<String, Integer> getPaymentMethodBreakdown(List<Payment> payments) {
        Map<String, Integer> methodCounts = new HashMap<>();
        
        payments.stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.COMPLETED)
                .forEach(payment -> {
                    String method = payment.getPaymentMethod().getDisplayName();
                    methodCounts.put(method, methodCounts.getOrDefault(method, 0) + 1);
                });
        
        return methodCounts;
    }
    
    private Map<String, Integer> getActiveOrdersByStatus() {
        Map<String, Integer> statusCounts = new HashMap<>();
        
        orderService.getActiveOrders()
                .forEach(order -> {
                    String status = order.getStatus().getDisplayName();
                    statusCounts.put(status, statusCounts.getOrDefault(status, 0) + 1);
                });
        
        return statusCounts;
    }
    
    public String formatDailyReportAsString(DailyReport report) {
        StringBuilder sb = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        
        sb.append("=== 每日營運報告 ===\n");
        sb.append("報告時間: ").append(report.getReportDate().format(formatter)).append("\n\n");
        
        sb.append("📊 訂單統計:\n");
        sb.append("- 總訂單數: ").append(report.getTotalOrders()).append("\n");
        sb.append("- 已完成: ").append(report.getCompletedOrders()).append("\n");
        sb.append("- 已取消: ").append(report.getCancelledOrders()).append("\n\n");
        
        sb.append("💰 營收統計:\n");
        sb.append("- 今日營收: NT$ ").append(report.getTotalRevenue()).append("\n");
        sb.append("- 成功付款: ").append(report.getSuccessfulPayments()).append(" 筆\n\n");
        
        sb.append("🍽️ 熱門商品:\n");
        report.getPopularItems().entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .forEach(entry -> sb.append("- ").append(entry.getKey())
                        .append(": ").append(entry.getValue()).append(" 份\n"));
        
        sb.append("\n💳 付款方式統計:\n");
        report.getPaymentMethodBreakdown().forEach((method, count) -> 
                sb.append("- ").append(method).append(": ").append(count).append(" 筆\n"));
        
        return sb.toString();
    }
    
    public String formatSystemOverviewAsString(SystemOverviewReport report) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("=== 系統總覽報告 ===\n\n");
        
        sb.append("👥 使用者統計:\n");
        sb.append("- 總用戶數: ").append(report.getTotalUsers()).append("\n");
        sb.append("- 顧客數量: ").append(report.getTotalCustomers()).append("\n\n");
        
        sb.append("🍽️ 菜單統計:\n");
        sb.append("- 總菜單項目: ").append(report.getTotalMenuItems()).append("\n");
        sb.append("- 可用項目: ").append(report.getAvailableMenuItems()).append("\n\n");
        
        sb.append("📋 訂單統計:\n");
        sb.append("- 總訂單數: ").append(report.getTotalOrders()).append("\n");
        sb.append("- 已完成訂單: ").append(report.getCompletedOrders()).append("\n");
        sb.append("- 今日訂單: ").append(report.getTodaysOrders()).append("\n\n");
        
        sb.append("💰 營收統計:\n");
        sb.append("- 總營收: NT$ ").append(report.getTotalRevenue()).append("\n");
        sb.append("- 今日營收: NT$ ").append(report.getTodaysRevenue()).append("\n");
        sb.append("- 付款成功率: ").append(String.format("%.1f%%", report.getPaymentSuccessRate())).append("\n\n");
        
        sb.append("📊 目前訂單狀態:\n");
        report.getActiveOrdersByStatus().forEach((status, count) -> 
                sb.append("- ").append(status).append(": ").append(count).append(" 筆\n"));
        
        return sb.toString();
    }
    
    /**
     * Generate sales report for admin dashboard
     */
    public Map<String, Object> generateSalesReport(String startDate, String endDate, String period) {
        Map<String, Object> report = new HashMap<>();
        
        try {
            // Parse dates
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            // Get orders in date range  
            LocalDateTime startDateTime = start.atStartOfDay();
            LocalDateTime endDateTime = end.atTime(23, 59, 59);
            
            // Mock data for now - in production, should use DAO to get actual data
            List<Map<String, Object>> salesData = new ArrayList<>();
            
            // Generate sample sales data
            LocalDate current = start;
            while (!current.isAfter(end)) {
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("date", current.toString());
                dayData.put("revenue", Math.random() * 50000 + 10000); // Mock revenue
                dayData.put("orders", (int)(Math.random() * 100 + 20)); // Mock order count
                dayData.put("customers", (int)(Math.random() * 80 + 15)); // Mock customer count
                salesData.add(dayData);
                current = current.plusDays(1);
            }
            
            // Calculate totals
            double totalRevenue = salesData.stream()
                    .mapToDouble(data -> (Double) data.get("revenue"))
                    .sum();
            int totalOrders = salesData.stream()
                    .mapToInt(data -> (Integer) data.get("orders"))
                    .sum();
            int totalCustomers = salesData.stream()
                    .mapToInt(data -> (Integer) data.get("customers"))
                    .sum();
            
            // Build report
            report.put("period", period);
            report.put("startDate", startDate);
            report.put("endDate", endDate);
            report.put("salesData", salesData);
            report.put("summary", Map.of(
                    "totalRevenue", totalRevenue,
                    "totalOrders", totalOrders,
                    "totalCustomers", totalCustomers,
                    "averageOrderValue", totalOrders > 0 ? totalRevenue / totalOrders : 0,
                    "days", salesData.size()
            ));
            
            // Top selling items (mock data)
            report.put("topItems", List.of(
                    Map.of("name", "招牌牛排", "quantity", 85, "revenue", 32300),
                    Map.of("name", "彩虹沙拉", "quantity", 72, "revenue", 13680),
                    Map.of("name", "巧克力蛋糕", "quantity", 56, "revenue", 7840)
            ));
            
            // Payment method breakdown (mock data)
            report.put("paymentMethods", Map.of(
                    "信用卡", 45.2,
                    "現金", 28.7,
                    "LINE Pay", 15.3,
                    "其他", 10.8
            ));
            
        } catch (Exception e) {
            System.err.println("Error generating sales report: " + e.getMessage());
            report.put("error", "報表生成失敗：" + e.getMessage());
        }
        
        return report;
    }
    
    // Inner classes for report data structures
    public static class DailyReport {
        private LocalDateTime reportDate;
        private int totalOrders;
        private int completedOrders;
        private int cancelledOrders;
        private BigDecimal totalRevenue;
        private int successfulPayments;
        private Map<String, Integer> popularItems;
        private Map<String, Integer> paymentMethodBreakdown;
        
        // Getters and setters
        public LocalDateTime getReportDate() { return reportDate; }
        public void setReportDate(LocalDateTime reportDate) { this.reportDate = reportDate; }
        
        public int getTotalOrders() { return totalOrders; }
        public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
        
        public int getCompletedOrders() { return completedOrders; }
        public void setCompletedOrders(int completedOrders) { this.completedOrders = completedOrders; }
        
        public int getCancelledOrders() { return cancelledOrders; }
        public void setCancelledOrders(int cancelledOrders) { this.cancelledOrders = cancelledOrders; }
        
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
        
        public int getSuccessfulPayments() { return successfulPayments; }
        public void setSuccessfulPayments(int successfulPayments) { this.successfulPayments = successfulPayments; }
        
        public Map<String, Integer> getPopularItems() { return popularItems; }
        public void setPopularItems(Map<String, Integer> popularItems) { this.popularItems = popularItems; }
        
        public Map<String, Integer> getPaymentMethodBreakdown() { return paymentMethodBreakdown; }
        public void setPaymentMethodBreakdown(Map<String, Integer> paymentMethodBreakdown) { this.paymentMethodBreakdown = paymentMethodBreakdown; }
    }
    
    public static class SystemOverviewReport {
        private int totalUsers;
        private int totalCustomers;
        private int totalMenuItems;
        private int availableMenuItems;
        private int totalOrders;
        private int completedOrders;
        private int todaysOrders;
        private BigDecimal totalRevenue;
        private BigDecimal todaysRevenue;
        private double paymentSuccessRate;
        private Map<String, Integer> activeOrdersByStatus;
        
        // Getters and setters
        public int getTotalUsers() { return totalUsers; }
        public void setTotalUsers(int totalUsers) { this.totalUsers = totalUsers; }
        
        public int getTotalCustomers() { return totalCustomers; }
        public void setTotalCustomers(int totalCustomers) { this.totalCustomers = totalCustomers; }
        
        public int getTotalMenuItems() { return totalMenuItems; }
        public void setTotalMenuItems(int totalMenuItems) { this.totalMenuItems = totalMenuItems; }
        
        public int getAvailableMenuItems() { return availableMenuItems; }
        public void setAvailableMenuItems(int availableMenuItems) { this.availableMenuItems = availableMenuItems; }
        
        public int getTotalOrders() { return totalOrders; }
        public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
        
        public int getCompletedOrders() { return completedOrders; }
        public void setCompletedOrders(int completedOrders) { this.completedOrders = completedOrders; }
        
        public int getTodaysOrders() { return todaysOrders; }
        public void setTodaysOrders(int todaysOrders) { this.todaysOrders = todaysOrders; }
        
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
        
        public BigDecimal getTodaysRevenue() { return todaysRevenue; }
        public void setTodaysRevenue(BigDecimal todaysRevenue) { this.todaysRevenue = todaysRevenue; }
        
        public double getPaymentSuccessRate() { return paymentSuccessRate; }
        public void setPaymentSuccessRate(double paymentSuccessRate) { this.paymentSuccessRate = paymentSuccessRate; }
        
        public Map<String, Integer> getActiveOrdersByStatus() { return activeOrdersByStatus; }
        public void setActiveOrdersByStatus(Map<String, Integer> activeOrdersByStatus) { this.activeOrdersByStatus = activeOrdersByStatus; }
    }
}