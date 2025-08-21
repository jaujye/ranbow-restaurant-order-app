package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.UserDAO;
import com.ranbow.restaurant.dao.OrderDAO;
import com.ranbow.restaurant.dao.MenuDAO;
import com.ranbow.restaurant.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {
    
    @Autowired
    private UserDAO userDAO;
    
    @Autowired
    private OrderDAO orderDAO;
    
    @Autowired
    private MenuDAO menuDAO;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private SessionService sessionService;
    
    /**
     * Admin authentication with role verification
     */
    public Optional<User> authenticateAdmin(String email, String password) {
        Optional<User> userOpt = userDAO.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Verify admin role
            if (user.getRole() != UserRole.ADMIN) {
                return Optional.empty();
            }
            
            // Verify user is active
            if (!user.isActive()) {
                return Optional.empty();
            }
            
            // In production, verify password hash
            // For demo purposes, we'll validate basic authentication
            userDAO.updateLastLogin(user.getUserId(), LocalDateTime.now());
            return userOpt;
        }
        
        return Optional.empty();
    }
    
    /**
     * Get admin permissions based on user role
     */
    public List<AdminPermission> getAdminPermissions(User admin) {
        // For super admin, grant all permissions
        List<AdminPermission> permissions = new ArrayList<>();
        
        if (admin.getRole() == UserRole.ADMIN) {
            // Grant standard admin permissions
            permissions.addAll(Arrays.asList(
                AdminPermission.DASHBOARD_VIEW,
                AdminPermission.DASHBOARD_EXPORT,
                AdminPermission.MENU_VIEW,
                AdminPermission.MENU_CREATE,
                AdminPermission.MENU_UPDATE,
                AdminPermission.MENU_DELETE,
                AdminPermission.MENU_BULK_OPERATIONS,
                AdminPermission.ORDER_VIEW,
                AdminPermission.ORDER_UPDATE,
                AdminPermission.ORDER_CANCEL,
                AdminPermission.ORDER_ASSIGN,
                AdminPermission.USER_VIEW,
                AdminPermission.USER_UPDATE,
                AdminPermission.USER_DEACTIVATE,
                AdminPermission.STAFF_VIEW,
                AdminPermission.STAFF_UPDATE,
                AdminPermission.STAFF_SCHEDULE,
                AdminPermission.REPORTS_VIEW,
                AdminPermission.REPORTS_EXPORT,
                AdminPermission.SETTINGS_VIEW,
                AdminPermission.AUDIT_VIEW
            ));
            
            // Check if this is a super admin (could be based on email or special flag)
            if (admin.getEmail().contains("super") || admin.getEmail().contains("master")) {
                permissions.add(AdminPermission.SUPER_ADMIN);
                permissions.addAll(Arrays.asList(
                    AdminPermission.USER_CREATE,
                    AdminPermission.USER_DELETE,
                    AdminPermission.STAFF_CREATE,
                    AdminPermission.REPORTS_ADVANCED,
                    AdminPermission.SETTINGS_UPDATE,
                    AdminPermission.SETTINGS_BACKUP,
                    AdminPermission.SECURITY_MANAGE
                ));
            }
        }
        
        return permissions;
    }
    
    /**
     * Generate dashboard overview data
     */
    public DashboardOverview getDashboardOverview() {
        DashboardOverview overview = new DashboardOverview();
        
        // Revenue metrics
        DashboardOverview.RevenueMetrics revenue = new DashboardOverview.RevenueMetrics();
        revenue.setToday(getTodayRevenue());
        revenue.setYesterday(getYesterdayRevenue());
        revenue.setGrowthRate(calculateRevenueGrowthRate(revenue.getToday(), revenue.getYesterday()));
        revenue.setTargetProgress(calculateTargetProgress(revenue.getToday()));
        revenue.setWeeklyTotal(getWeeklyRevenue());
        revenue.setMonthlyTotal(getMonthlyRevenue());
        overview.setRevenue(revenue);
        
        // Order metrics
        DashboardOverview.OrderMetrics orders = new DashboardOverview.OrderMetrics();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        List<Order> todayOrders = orderDAO.findByDateRange(startOfDay, endOfDay);
        orders.setTotal(todayOrders.size());
        orders.setPending((int) todayOrders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count());
        orders.setProcessing((int) todayOrders.stream().filter(o -> o.getStatus() == OrderStatus.PREPARING).count());
        orders.setCompleted((int) todayOrders.stream().filter(o -> o.getStatus() == OrderStatus.COMPLETED).count());
        orders.setCancelled((int) todayOrders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count());
        orders.setGrowthRate(calculateOrderGrowthRate());
        orders.setAvgProcessingTime(calculateAvgProcessingTime(todayOrders));
        orders.setUrgentOrders(getUrgentOrderCount());
        overview.setOrders(orders);
        
        // Customer metrics
        DashboardOverview.CustomerMetrics customers = new DashboardOverview.CustomerMetrics();
        List<User> allCustomers = userDAO.findByRole(UserRole.CUSTOMER);
        customers.setActive((int) allCustomers.stream().filter(User::isActive).count());
        customers.setVip((int) allCustomers.stream().filter(u -> u.getMemberLevel() == MemberLevel.GOLD || u.getMemberLevel() == MemberLevel.PLATINUM).count());
        customers.setRegular(customers.getActive() - customers.getVip());
        customers.setGrowthRate(calculateCustomerGrowthRate());
        customers.setNewCustomersToday(getNewCustomersToday());
        customers.setSatisfactionRate(95.5); // Mock data
        overview.setCustomers(customers);
        
        // Staff metrics
        DashboardOverview.StaffMetrics staff = new DashboardOverview.StaffMetrics();
        List<User> allStaff = userDAO.findByRole(UserRole.STAFF);
        staff.setTotal(allStaff.size());
        staff.setOnline((int) (allStaff.size() * 0.8)); // Mock 80% online
        staff.setBusy((int) (staff.getOnline() * 0.6)); // Mock 60% of online staff busy
        staff.setOnBreak(staff.getOnline() - staff.getBusy());
        staff.setEfficiency(87.3); // Mock efficiency percentage
        staff.setScheduledToday(staff.getTotal());
        overview.setStaff(staff);
        
        // Popular items
        overview.setPopularItems(getPopularItems());
        
        // System alerts
        overview.setAlerts(getSystemAlerts());
        
        return overview;
    }
    
    /**
     * Get comprehensive user management data
     */
    public Map<String, Object> getUserManagementData(int page, int size, String role, String status, String search) {
        List<User> allUsers = userDAO.findAll();
        
        // Apply filters
        if (role != null && !role.isEmpty() && !role.equals("all")) {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            allUsers = allUsers.stream()
                    .filter(u -> u.getRole() == userRole)
                    .collect(Collectors.toList());
        }
        
        if (status != null && !status.isEmpty() && !status.equals("all")) {
            boolean isActive = status.equals("active");
            allUsers = allUsers.stream()
                    .filter(u -> u.isActive() == isActive)
                    .collect(Collectors.toList());
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            allUsers = allUsers.stream()
                    .filter(u -> u.getUsername().toLowerCase().contains(searchLower) ||
                               u.getEmail().toLowerCase().contains(searchLower) ||
                               u.getPhoneNumber().contains(search))
                    .collect(Collectors.toList());
        }
        
        // Pagination
        int totalElements = allUsers.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalElements);
        
        List<User> paginatedUsers = allUsers.subList(startIndex, endIndex);
        
        Map<String, Object> result = new HashMap<>();
        result.put("users", paginatedUsers);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("currentPage", page);
        result.put("size", size);
        
        // Statistics
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("total", userDAO.findAll().size());
        statistics.put("customers", userDAO.findByRole(UserRole.CUSTOMER).size());
        statistics.put("staff", userDAO.findByRole(UserRole.STAFF).size());
        statistics.put("admins", userDAO.findByRole(UserRole.ADMIN).size());
        statistics.put("active", userDAO.countActiveUsers());
        statistics.put("newThisWeek", getNewUsersThisWeek());
        result.put("statistics", statistics);
        
        return result;
    }
    
    /**
     * Get menu management data with analytics
     */
    public Map<String, Object> getMenuManagementData(String category, String status, String search) {
        List<MenuItem> allItems = menuDAO.findAll();
        
        // Apply filters
        if (category != null && !category.isEmpty() && !category.equals("all")) {
            MenuCategory menuCategory = MenuCategory.valueOf(category.toUpperCase());
            allItems = allItems.stream()
                    .filter(item -> item.getCategory() == menuCategory)
                    .collect(Collectors.toList());
        }
        
        if (status != null && !status.isEmpty() && !status.equals("all")) {
            boolean isAvailable = status.equals("available");
            allItems = allItems.stream()
                    .filter(item -> item.isAvailable() == isAvailable)
                    .collect(Collectors.toList());
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            allItems = allItems.stream()
                    .filter(item -> item.getName().toLowerCase().contains(searchLower) ||
                                  item.getDescription().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", allItems);
        
        // Menu statistics
        Map<String, Object> statistics = new HashMap<>();
        List<MenuItem> allMenuItems = menuDAO.findAll();
        statistics.put("total", allMenuItems.size());
        statistics.put("available", (int) allMenuItems.stream().filter(MenuItem::isAvailable).count());
        statistics.put("outOfStock", (int) allMenuItems.stream().filter(item -> !item.isAvailable()).count());
        statistics.put("categories", Arrays.stream(MenuCategory.values()).count());
        statistics.put("totalValue", allMenuItems.stream().mapToDouble(item -> item.getPrice().doubleValue()).sum());
        result.put("statistics", statistics);
        
        return result;
    }
    
    /**
     * Get system alerts and notifications
     */
    private List<DashboardOverview.Alert> getSystemAlerts() {
        List<DashboardOverview.Alert> alerts = new ArrayList<>();
        
        // Check for urgent orders
        int urgentOrders = getUrgentOrderCount();
        if (urgentOrders > 0) {
            DashboardOverview.Alert alert = new DashboardOverview.Alert();
            alert.setId(UUID.randomUUID().toString());
            alert.setType("URGENT_ORDERS");
            alert.setMessage("有 " + urgentOrders + " 個訂單超時，需要立即處理");
            alert.setSeverity("HIGH");
            alert.setTimestamp(LocalDateTime.now());
            alert.setResolved(false);
            alerts.add(alert);
        }
        
        // Check for low stock items
        List<MenuItem> lowStockItems = menuDAO.findAll().stream()
                .filter(item -> !item.isAvailable())
                .collect(Collectors.toList());
        
        if (!lowStockItems.isEmpty()) {
            DashboardOverview.Alert alert = new DashboardOverview.Alert();
            alert.setId(UUID.randomUUID().toString());
            alert.setType("LOW_STOCK");
            alert.setMessage("有 " + lowStockItems.size() + " 個菜品缺貨");
            alert.setSeverity("MEDIUM");
            alert.setTimestamp(LocalDateTime.now());
            alert.setResolved(false);
            alerts.add(alert);
        }
        
        return alerts;
    }
    
    // Helper methods for calculations
    private double getTodayRevenue() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        List<Order> todayOrders = orderDAO.findByDateRange(startOfDay, endOfDay);
        return todayOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .sum();
    }
    
    private double getYesterdayRevenue() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfDay = yesterday.atStartOfDay();
        LocalDateTime endOfDay = yesterday.atTime(23, 59, 59);
        List<Order> yesterdayOrders = orderDAO.findByDateRange(startOfDay, endOfDay);
        return yesterdayOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .sum();
    }
    
    private double getWeeklyRevenue() {
        LocalDateTime weekStart = LocalDate.now().minusDays(7).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        List<Order> weekOrders = orderDAO.findByDateRange(weekStart, now);
        return weekOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .sum();
    }
    
    private double getMonthlyRevenue() {
        LocalDateTime monthStart = LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        List<Order> monthOrders = orderDAO.findByDateRange(monthStart, now);
        return monthOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                .sum();
    }
    
    private double calculateRevenueGrowthRate(double today, double yesterday) {
        if (yesterday == 0) return 0;
        return ((today - yesterday) / yesterday) * 100;
    }
    
    private double calculateTargetProgress(double todayRevenue) {
        double dailyTarget = 150000; // Mock daily target
        return (todayRevenue / dailyTarget) * 100;
    }
    
    private double calculateOrderGrowthRate() {
        // Mock calculation - should compare with previous period
        return 8.3;
    }
    
    private double calculateAvgProcessingTime(List<Order> orders) {
        // Mock calculation - should calculate actual processing time
        return 23.5; // minutes
    }
    
    private int getUrgentOrderCount() {
        List<Order> allOrders = orderDAO.findAll();
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        
        return (int) allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.PREPARING)
                .filter(order -> order.getOrderTime() != null && order.getOrderTime().isBefore(cutoff))
                .count();
    }
    
    private double calculateCustomerGrowthRate() {
        // Mock calculation
        return 15.2;
    }
    
    private int getNewCustomersToday() {
        LocalDate today = LocalDate.now();
        return (int) userDAO.findByRole(UserRole.CUSTOMER).stream()
                .filter(user -> user.getCreatedAt() != null && user.getCreatedAt().toLocalDate().equals(today))
                .count();
    }
    
    private int getNewUsersThisWeek() {
        LocalDate weekStart = LocalDate.now().minusDays(7);
        return (int) userDAO.findAll().stream()
                .filter(user -> user.getCreatedAt() != null && user.getCreatedAt().toLocalDate().isAfter(weekStart))
                .count();
    }
    
    private List<DashboardOverview.PopularItem> getPopularItems() {
        // Mock popular items - should be calculated from actual order data
        List<DashboardOverview.PopularItem> popularItems = new ArrayList<>();
        
        DashboardOverview.PopularItem item1 = new DashboardOverview.PopularItem();
        item1.setItemId("item1");
        item1.setName("招牌牛排");
        item1.setSalesCount(28);
        item1.setRevenue(10640.0);
        item1.setCategory("主菜");
        popularItems.add(item1);
        
        DashboardOverview.PopularItem item2 = new DashboardOverview.PopularItem();
        item2.setItemId("item2");
        item2.setName("彩虹沙拉");
        item2.setSalesCount(22);
        item2.setRevenue(4180.0);
        item2.setCategory("前菜");
        popularItems.add(item2);
        
        DashboardOverview.PopularItem item3 = new DashboardOverview.PopularItem();
        item3.setItemId("item3");
        item3.setName("巧克力蛋糕");
        item3.setSalesCount(19);
        item3.setRevenue(2660.0);
        item3.setCategory("甜點");
        popularItems.add(item3);
        
        return popularItems;
    }
}