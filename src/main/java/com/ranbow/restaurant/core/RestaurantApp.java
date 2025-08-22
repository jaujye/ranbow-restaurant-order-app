package com.ranbow.restaurant.core;

import com.ranbow.restaurant.models.*;
import com.ranbow.restaurant.services.*;

import java.math.BigDecimal;
import java.util.Scanner;
import java.util.List;
import java.util.Optional;

public class RestaurantApp {
    private UserService userService;
    private MenuService menuService;
    private OrderService orderService;
    private PaymentService paymentService;
    private ReportService reportService;
    private Scanner scanner;
    private User currentUser;
    
    public RestaurantApp() {
        this.userService = new UserService();
        this.menuService = new MenuService();
        this.orderService = new OrderService();
        this.paymentService = new PaymentService();
        this.reportService = new ReportService();
        this.scanner = new Scanner(System.in);
    }
    
    public void start() {
        System.out.println("🍽️ 歡迎來到 Ranbow Restaurant Order Application!");
        System.out.println("==========================================");
        
        while (true) {
            if (currentUser == null) {
                showLoginMenu();
            } else {
                showMainMenu();
            }
        }
    }
    
    private void showLoginMenu() {
        System.out.println("\n=== 登入選單 ===");
        System.out.println("1. 登入");
        System.out.println("2. 註冊新顧客");
        System.out.println("3. 離開");
        System.out.print("請選擇: ");
        
        int choice = getIntInput();
        switch (choice) {
            case 1 -> login();
            case 2 -> registerCustomer();
            case 3 -> {
                System.out.println("感謝使用 Ranbow Restaurant！再見！");
                System.exit(0);
            }
            default -> System.out.println("無效選項，請重新選擇。");
        }
    }
    
    private void login() {
        System.out.print("請輸入 Email: ");
        String email = scanner.nextLine();
        System.out.print("請輸入密碼: ");
        String password = scanner.nextLine();
        
        if (userService.authenticateUser(email, password)) {
            Optional<User> user = userService.findUserByEmail(email);
            if (user.isPresent()) {
                currentUser = user.get();
                System.out.println("登入成功！歡迎 " + currentUser.getUsername());
            }
        } else {
            System.out.println("登入失敗，請檢查帳號密碼。");
        }
    }
    
    private void registerCustomer() {
        System.out.print("請輸入姓名: ");
        String username = scanner.nextLine();
        System.out.print("請輸入 Email: ");
        String email = scanner.nextLine();
        System.out.print("請輸入手機號碼: ");
        String phone = scanner.nextLine();
        System.out.print("請輸入密碼: ");
        String password = scanner.nextLine();
        
        try {
            User newUser = userService.createUser(username, email, phone, password, UserRole.CUSTOMER);
            System.out.println("註冊成功！請使用 Email 登入。");
        } catch (IllegalArgumentException e) {
            System.out.println("註冊失敗: " + e.getMessage());
        }
    }
    
    private void showMainMenu() {
        switch (currentUser.getRole()) {
            case ADMIN -> showAdminMenu();
            case STAFF -> showStaffMenu();
            case CUSTOMER -> showCustomerMenu();
        }
    }
    
    private void showCustomerMenu() {
        System.out.println("\n=== 顧客選單 ===");
        System.out.println("1. 瀏覽菜單");
        System.out.println("2. 建立新訂單");
        System.out.println("3. 查看我的訂單");
        System.out.println("4. 登出");
        System.out.print("請選擇: ");
        
        int choice = getIntInput();
        switch (choice) {
            case 1 -> browseMenu();
            case 2 -> createNewOrder();
            case 3 -> viewMyOrders();
            case 4 -> logout();
            default -> System.out.println("無效選項，請重新選擇。");
        }
    }
    
    private void showStaffMenu() {
        System.out.println("\n=== 員工選單 ===");
        System.out.println("1. 查看待處理訂單");
        System.out.println("2. 更新訂單狀態");
        System.out.println("3. 瀏覽所有訂單");
        System.out.println("4. 登出");
        System.out.print("請選擇: ");
        
        int choice = getIntInput();
        switch (choice) {
            case 1 -> viewPendingOrders();
            case 2 -> updateOrderStatus();
            case 3 -> viewAllOrders();
            case 4 -> logout();
            default -> System.out.println("無效選項，請重新選擇。");
        }
    }
    
    private void showAdminMenu() {
        System.out.println("\n=== 管理員選單 ===");
        System.out.println("1. 菜單管理");
        System.out.println("2. 訂單管理");
        System.out.println("3. 用戶管理");
        System.out.println("4. 營收統計");
        System.out.println("5. 系統報告");
        System.out.println("6. 登出");
        System.out.print("請選擇: ");
        
        int choice = getIntInput();
        switch (choice) {
            case 1 -> menuManagement();
            case 2 -> orderManagement();
            case 3 -> userManagement();
            case 4 -> revenueStatistics();
            case 5 -> systemReports();
            case 6 -> logout();
            default -> System.out.println("無效選項，請重新選擇。");
        }
    }
    
    private void browseMenu() {
        System.out.println("\n=== 菜單瀏覽 ===");
        List<MenuItem> items = menuService.getAvailableMenuItems();
        
        for (MenuCategory category : MenuCategory.values()) {
            List<MenuItem> categoryItems = items.stream()
                    .filter(item -> item.getCategory() == category)
                    .toList();
            
            if (!categoryItems.isEmpty()) {
                System.out.println("\n📂 " + category.getDisplayName() + ":");
                for (MenuItem item : categoryItems) {
                    System.out.printf("   %s - NT$ %s (%d分鐘)\n", 
                            item.getName(), item.getPrice(), item.getPreparationTime());
                    System.out.printf("   %s\n", item.getDescription());
                }
            }
        }
    }
    
    private void createNewOrder() {
        System.out.println("\n=== 建立新訂單 ===");
        System.out.print("請輸入桌號: ");
        int tableNumber = getIntInput();
        
        Order order = orderService.createOrder(currentUser.getUserId(), String.valueOf(tableNumber));
        System.out.println("訂單已建立，訂單號: " + order.getOrderId());
        
        while (true) {
            System.out.println("\n1. 添加菜品");
            System.out.println("2. 查看當前訂單");
            System.out.println("3. 確認訂單");
            System.out.println("4. 取消訂單");
            System.out.print("請選擇: ");
            
            int choice = getIntInput();
            switch (choice) {
                case 1 -> addItemToOrder(order.getOrderId());
                case 2 -> displayOrder(order);
                case 3 -> {
                    if (confirmOrder(order.getOrderId())) {
                        return;
                    }
                }
                case 4 -> {
                    orderService.cancelOrder(order.getOrderId(), "用戶取消");
                    System.out.println("訂單已取消");
                    return;
                }
                default -> System.out.println("無效選項");
            }
        }
    }
    
    private void addItemToOrder(String orderId) {
        browseMenu();
        System.out.print("\n請輸入菜品名稱: ");
        String itemName = scanner.nextLine();
        
        Optional<MenuItem> item = menuService.getAllMenuItems().stream()
                .filter(menuItem -> menuItem.getName().contains(itemName) && menuItem.isAvailable())
                .findFirst();
        
        if (item.isPresent()) {
            System.out.print("請輸入數量: ");
            int quantity = getIntInput();
            System.out.print("特殊要求 (可留空): ");
            String specialRequests = scanner.nextLine();
            
            try {
                orderService.addItemToOrder(orderId, item.get().getItemId(), quantity, specialRequests);
                System.out.println("已添加到訂單: " + item.get().getName() + " x " + quantity);
            } catch (Exception e) {
                System.out.println("添加失敗: " + e.getMessage());
            }
        } else {
            System.out.println("找不到該菜品或菜品不可用");
        }
    }
    
    private void displayOrder(Order order) {
        System.out.println("\n=== 訂單詳情 ===");
        System.out.println("訂單號: " + order.getOrderId());
        System.out.println("桌號: " + order.getTableNumber());
        System.out.println("狀態: " + order.getStatus().getDisplayName());
        System.out.println("\n訂單項目:");
        
        for (OrderItem item : order.getOrderItems()) {
            System.out.printf("- %s x %d = NT$ %s\n", 
                    item.getMenuItem().getName(), 
                    item.getQuantity(),
                    item.getItemTotal());
            if (item.getSpecialRequests() != null && !item.getSpecialRequests().isEmpty()) {
                System.out.println("  特殊要求: " + item.getSpecialRequests());
            }
        }
        
        System.out.println("\n小計: NT$ " + order.getSubtotal());
        System.out.println("稅金: NT$ " + order.getTax());
        System.out.println("總計: NT$ " + order.getTotalAmount());
    }
    
    private boolean confirmOrder(String orderId) {
        Optional<Order> orderOpt = orderService.findOrderById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            displayOrder(order);
            
            System.out.print("\n確認訂單？(y/n): ");
            String confirm = scanner.nextLine();
            
            if (confirm.toLowerCase().startsWith("y")) {
                orderService.confirmOrder(orderId);
                System.out.println("訂單已確認！");
                
                // Process payment
                return processPayment(order);
            }
        }
        return false;
    }
    
    private boolean processPayment(Order order) {
        System.out.println("\n=== 選擇付款方式 ===");
        PaymentMethod[] methods = PaymentMethod.values();
        for (int i = 0; i < methods.length; i++) {
            System.out.println((i + 1) + ". " + methods[i].getDisplayName());
        }
        
        System.out.print("請選擇付款方式: ");
        int choice = getIntInput();
        
        if (choice >= 1 && choice <= methods.length) {
            PaymentMethod selectedMethod = methods[choice - 1];
            
            try {
                Payment payment = paymentService.createPayment(
                        order.getOrderId(), 
                        order.getCustomerId(), 
                        selectedMethod);
                
                System.out.println("處理付款中...");
                boolean success = paymentService.processPayment(payment.getPaymentId());
                
                if (success) {
                    System.out.println("付款成功！訂單進入準備階段。");
                    return true;
                } else {
                    System.out.println("付款失敗，請重試。");
                    return false;
                }
            } catch (Exception e) {
                System.out.println("付款處理錯誤: " + e.getMessage());
                return false;
            }
        }
        
        System.out.println("無效的付款方式選擇");
        return false;
    }
    
    private void viewMyOrders() {
        System.out.println("\n=== 我的訂單 ===");
        List<Order> orders = orderService.getOrdersByCustomerId(currentUser.getUserId());
        
        if (orders.isEmpty()) {
            System.out.println("目前沒有訂單記錄");
            return;
        }
        
        for (Order order : orders) {
            System.out.printf("訂單 %s - %s - NT$ %s - %s\n",
                    order.getOrderId().substring(0, 8),
                    order.getStatus().getDisplayName(),
                    order.getTotalAmount(),
                    order.getOrderTime().toLocalDate());
        }
    }
    
    private void viewPendingOrders() {
        System.out.println("\n=== 待處理訂單 ===");
        List<Order> orders = orderService.getPendingOrders();
        
        if (orders.isEmpty()) {
            System.out.println("目前沒有待處理訂單");
            return;
        }
        
        for (Order order : orders) {
            System.out.printf("訂單 %s - 桌號 %d - NT$ %s\n",
                    order.getOrderId().substring(0, 8),
                    order.getTableNumber(),
                    order.getTotalAmount());
        }
    }
    
    private void updateOrderStatus() {
        System.out.print("請輸入訂單號前8位: ");
        String orderIdPrefix = scanner.nextLine();
        
        Optional<Order> orderOpt = orderService.getAllOrders().stream()
                .filter(order -> order.getOrderId().startsWith(orderIdPrefix))
                .findFirst();
        
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            System.out.println("當前狀態: " + order.getStatus().getDisplayName());
            
            System.out.println("選擇新狀態:");
            OrderStatus[] statuses = OrderStatus.values();
            for (int i = 0; i < statuses.length; i++) {
                System.out.println((i + 1) + ". " + statuses[i].getDisplayName());
            }
            
            System.out.print("請選擇: ");
            int choice = getIntInput();
            
            if (choice >= 1 && choice <= statuses.length) {
                OrderStatus newStatus = statuses[choice - 1];
                try {
                    orderService.updateOrderStatus(order.getOrderId(), newStatus);
                    System.out.println("訂單狀態已更新為: " + newStatus.getDisplayName());
                } catch (Exception e) {
                    System.out.println("更新失敗: " + e.getMessage());
                }
            }
        } else {
            System.out.println("找不到該訂單");
        }
    }
    
    private void viewAllOrders() {
        System.out.println("\n=== 所有訂單 ===");
        List<Order> orders = orderService.getAllOrders();
        
        for (Order order : orders) {
            System.out.printf("訂單 %s - 桌號 %d - %s - NT$ %s\n",
                    order.getOrderId().substring(0, 8),
                    order.getTableNumber(),
                    order.getStatus().getDisplayName(),
                    order.getTotalAmount());
        }
    }
    
    private void menuManagement() {
        System.out.println("\n=== 菜單管理 ===");
        System.out.println("1. 查看所有菜品");
        System.out.println("2. 添加新菜品");
        System.out.println("3. 更新菜品狀態");
        System.out.println("4. 返回");
        System.out.print("請選擇: ");
        
        int choice = getIntInput();
        switch (choice) {
            case 1 -> viewAllMenuItems();
            case 2 -> addNewMenuItem();
            case 3 -> updateMenuItemStatus();
            case 4 -> { return; }
            default -> System.out.println("無效選項");
        }
    }
    
    private void viewAllMenuItems() {
        System.out.println("\n=== 所有菜品 ===");
        List<MenuItem> items = menuService.getAllMenuItems();
        
        for (MenuItem item : items) {
            String status = item.isAvailable() ? "✅" : "❌";
            System.out.printf("%s %s - NT$ %s (%s)\n", 
                    status, item.getName(), item.getPrice(), item.getCategory().getDisplayName());
        }
    }
    
    private void addNewMenuItem() {
        System.out.print("菜品名稱: ");
        String name = scanner.nextLine();
        System.out.print("描述: ");
        String description = scanner.nextLine();
        System.out.print("價格: ");
        BigDecimal price = new BigDecimal(scanner.nextLine());
        
        System.out.println("選擇類別:");
        MenuCategory[] categories = MenuCategory.values();
        for (int i = 0; i < categories.length; i++) {
            System.out.println((i + 1) + ". " + categories[i].getDisplayName());
        }
        
        System.out.print("請選擇: ");
        int choice = getIntInput();
        
        if (choice >= 1 && choice <= categories.length) {
            MenuCategory category = categories[choice - 1];
            MenuItem newItem = menuService.addMenuItem(name, description, price, category);
            System.out.println("菜品已添加: " + newItem.getName());
        }
    }
    
    private void updateMenuItemStatus() {
        viewAllMenuItems();
        System.out.print("請輸入菜品名稱: ");
        String itemName = scanner.nextLine();
        
        Optional<MenuItem> item = menuService.getAllMenuItems().stream()
                .filter(menuItem -> menuItem.getName().contains(itemName))
                .findFirst();
        
        if (item.isPresent()) {
            boolean newStatus = !item.get().isAvailable();
            menuService.setMenuItemAvailability(item.get().getItemId(), newStatus);
            System.out.println("菜品狀態已更新: " + item.get().getName() + " -> " + 
                    (newStatus ? "可用" : "不可用"));
        } else {
            System.out.println("找不到該菜品");
        }
    }
    
    private void orderManagement() {
        System.out.println("\n=== 訂單管理 ===");
        List<Order> activeOrders = orderService.getActiveOrders();
        
        if (activeOrders.isEmpty()) {
            System.out.println("目前沒有進行中的訂單");
            return;
        }
        
        for (Order order : activeOrders) {
            System.out.printf("訂單 %s - 桌號 %d - %s - NT$ %s\n",
                    order.getOrderId().substring(0, 8),
                    order.getTableNumber(),
                    order.getStatus().getDisplayName(),
                    order.getTotalAmount());
        }
    }
    
    private void userManagement() {
        System.out.println("\n=== 用戶管理 ===");
        System.out.println("總用戶數: " + userService.getTotalActiveUsers());
        System.out.println("顧客數量: " + userService.getTotalCustomers());
        
        List<User> allUsers = userService.getAllUsers();
        for (User user : allUsers) {
            String status = user.isActive() ? "✅" : "❌";
            System.out.printf("%s %s (%s) - %s\n", 
                    status, user.getUsername(), user.getRole().getDisplayName(), user.getEmail());
        }
    }
    
    private void revenueStatistics() {
        System.out.println("\n=== 營收統計 ===");
        BigDecimal todaysRevenue = paymentService.getTodaysRevenue();
        BigDecimal totalRevenue = paymentService.getTotalRevenue();
        
        System.out.println("今日營收: NT$ " + todaysRevenue);
        System.out.println("總營收: NT$ " + totalRevenue);
        System.out.println("付款成功率: " + String.format("%.1f%%", paymentService.getPaymentSuccessRate()));
        System.out.println("今日訂單數: " + orderService.getTodaysOrdersCount());
        System.out.println("總訂單數: " + orderService.getTotalOrdersCount());
    }
    
    private void systemReports() {
        System.out.println("\n=== 系統報告 ===");
        System.out.println("1. 每日報告");
        System.out.println("2. 系統總覽");
        System.out.println("3. 返回");
        System.out.print("請選擇: ");
        
        int choice = getIntInput();
        switch (choice) {
            case 1 -> {
                ReportService.DailyReport dailyReport = reportService.generateDailyReport();
                System.out.println(reportService.formatDailyReportAsString(dailyReport));
            }
            case 2 -> {
                ReportService.SystemOverviewReport overviewReport = reportService.generateSystemOverview();
                System.out.println(reportService.formatSystemOverviewAsString(overviewReport));
            }
            case 3 -> { return; }
            default -> System.out.println("無效選項");
        }
    }
    
    private void logout() {
        System.out.println("已登出，感謝使用！");
        currentUser = null;
    }
    
    private int getIntInput() {
        try {
            int result = Integer.parseInt(scanner.nextLine());
            return result;
        } catch (NumberFormatException e) {
            System.out.println("請輸入有效數字");
            return -1;
        }
    }
    
    public static void main(String[] args) {
        RestaurantApp app = new RestaurantApp();
        app.start();
    }
}