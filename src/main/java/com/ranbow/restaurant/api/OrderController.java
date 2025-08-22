package com.ranbow.restaurant.api;

import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.models.OrderStatus;
import com.ranbow.restaurant.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            // Check if this is a simple order (legacy) or complete order (new format)
            if (request.containsKey("items") && request.get("items") != null) {
                // New format with items - create complete order
                CreateCompleteOrderRequest completeRequest = mapToCompleteOrderRequest(request);
                Order order = orderService.createCompleteOrder(completeRequest);
                return ResponseEntity.status(HttpStatus.CREATED).body(order);
            } else {
                // Legacy format - create simple order
                String customerId = (String) request.get("customerId");
                Integer tableNumber = (Integer) request.get("tableNumber");
                Order order = orderService.createOrder(customerId, tableNumber);
                return ResponseEntity.status(HttpStatus.CREATED).body(order);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/complete")
    public ResponseEntity<?> createCompleteOrder(@Valid @RequestBody CreateCompleteOrderRequest request) {
        try {
            Order order = orderService.createCompleteOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable("orderId") String orderId) {
        Optional<Order> order = orderService.findOrderById(orderId);
        if (order.isPresent()) {
            return ResponseEntity.ok(order.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(HttpServletRequest request) {
        try {
            // Get parameters with defaults
            String limitParam = request.getParameter("limit");
            String pageParam = request.getParameter("page");
            
            int limit = limitParam != null ? Integer.parseInt(limitParam) : 50;
            int page = pageParam != null ? Integer.parseInt(pageParam) : 1;
            
            // For demo purposes, we'll use a default user ID
            // In a real application, this would come from the authenticated user's session/JWT token
            String currentUserId = "2ab1d1ba-3ec6-4892-b4d6-ff445802cdb7"; // This should be extracted from authentication context
            
            List<Order> allOrders = orderService.getOrdersByCustomerId(currentUserId);
            List<Order> orders = allOrders != null ? allOrders : new ArrayList<>();
            
            // Simple pagination
            int startIndex = Math.max(0, (page - 1) * limit);
            int endIndex = Math.min(orders.size(), startIndex + limit);
            List<Order> paginatedOrders = orders.subList(startIndex, endIndex);
            
            // Return in the expected paginated format
            Map<String, Object> response = Map.of(
                "data", paginatedOrders,
                "total", orders.size(),
                "page", page,
                "limit", limit,
                "totalPages", (int) Math.ceil((double) orders.size() / limit)
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting user's orders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "無法載入訂單資料", "details", e.getMessage()));
        }
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getOrdersByCustomer(@PathVariable("customerId") String customerId) {
        try {
            List<Order> orders = orderService.getOrdersByCustomerId(customerId);
            return ResponseEntity.ok(orders != null ? orders : new java.util.ArrayList<>());
        } catch (Exception e) {
            System.err.println("Error getting orders for customer " + customerId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "無法載入訂單資料", "details", e.getMessage()));
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable("status") OrderStatus status) {
        List<Order> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<Order>> getPendingOrders() {
        List<Order> orders = orderService.getPendingOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Order>> getActiveOrders() {
        List<Order> orders = orderService.getActiveOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/today")
    public ResponseEntity<List<Order>> getTodaysOrders() {
        List<Order> orders = orderService.getTodaysOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/test-endpoint")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Test endpoint working", "timestamp", System.currentTimeMillis()));
    }
    
    @PostMapping("/{orderId}/items")
    public ResponseEntity<?> addItemToOrder(@PathVariable("orderId") String orderId, 
                                          @Valid @RequestBody AddOrderItemRequest request) {
        try {
            boolean success = orderService.addItemToOrder(
                    orderId, 
                    request.getMenuItemId(), 
                    request.getQuantity(),
                    request.getSpecialRequests());
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Item added to order"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add item to order"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{orderId}/items/{orderItemId}")
    public ResponseEntity<?> removeItemFromOrder(@PathVariable("orderId") String orderId, 
                                               @PathVariable("orderItemId") String orderItemId) {
        try {
            boolean success = orderService.removeItemFromOrder(orderId, orderItemId);
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Item removed from order"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{orderId}/items/{orderItemId}/quantity")
    public ResponseEntity<?> updateOrderItemQuantity(@PathVariable("orderId") String orderId,
                                                    @PathVariable("orderItemId") String orderItemId,
                                                    @RequestBody UpdateQuantityRequest request) {
        try {
            boolean success = orderService.updateOrderItemQuantity(
                    orderId, orderItemId, request.getQuantity());
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Quantity updated"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<?> confirmOrder(@PathVariable("orderId") String orderId) {
        try {
            boolean success = orderService.confirmOrder(orderId);
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Order confirmed"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot confirm order"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable("orderId") String orderId, 
                                             @RequestBody UpdateOrderStatusRequest request) {
        try {
            boolean success = orderService.updateOrderStatus(orderId, request.getStatus());
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true, 
                        "message", "Order status updated",
                        "status", request.getStatus()
                ));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable("orderId") String orderId, 
                                       @RequestBody CancelOrderRequest request) {
        try {
            boolean success = orderService.cancelOrder(orderId, request.getReason());
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Order cancelled"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getOrderStats() {
        return ResponseEntity.ok(Map.of(
                "totalOrders", orderService.getTotalOrdersCount(),
                "todaysOrders", orderService.getTodaysOrdersCount(),
                "completedOrders", orderService.getCompletedOrdersCount(),
                "orderStatuses", OrderStatus.values()
        ));
    }
    
    // DTO Classes
    public static class CreateOrderRequest {
        private String customerId;
        private int tableNumber;
        
        public String getCustomerId() { return customerId; }
        public void setCustomerId(String customerId) { this.customerId = customerId; }
        
        public int getTableNumber() { return tableNumber; }
        public void setTableNumber(int tableNumber) { this.tableNumber = tableNumber; }
    }
    
    public static class AddOrderItemRequest {
        private String menuItemId;
        private int quantity;
        private String specialRequests;
        
        public String getMenuItemId() { return menuItemId; }
        public void setMenuItemId(String menuItemId) { this.menuItemId = menuItemId; }
        
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        
        public String getSpecialRequests() { return specialRequests; }
        public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }
    }
    
    public static class UpdateQuantityRequest {
        private int quantity;
        
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
    
    public static class UpdateOrderStatusRequest {
        private OrderStatus status;
        
        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
    }
    
    public static class CancelOrderRequest {
        private String reason;
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
    
    // Helper method to map request to CreateCompleteOrderRequest
    private CreateCompleteOrderRequest mapToCompleteOrderRequest(Map<String, Object> request) {
        CreateCompleteOrderRequest completeRequest = new CreateCompleteOrderRequest();
        
        completeRequest.setCustomerId((String) request.get("customerId"));
        completeRequest.setTableNumber(((Number) request.get("tableNumber")).intValue());
        completeRequest.setSpecialInstructions((String) request.get("specialInstructions"));
        completeRequest.setPaymentMethod((String) request.get("paymentMethod"));
        completeRequest.setStatus((String) request.get("status"));
        
        if (request.get("subtotal") != null) {
            completeRequest.setSubtotal(((Number) request.get("subtotal")).doubleValue());
        }
        if (request.get("serviceFee") != null) {
            completeRequest.setServiceFee(((Number) request.get("serviceFee")).doubleValue());
        }
        if (request.get("tax") != null) {
            completeRequest.setTax(((Number) request.get("tax")).doubleValue());
        }
        if (request.get("totalAmount") != null) {
            completeRequest.setTotalAmount(((Number) request.get("totalAmount")).doubleValue());
        }
        
        // Map items
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemMaps = (List<Map<String, Object>>) request.get("items");
        if (itemMaps != null) {
            List<OrderItemRequest> items = new ArrayList<>();
            for (Map<String, Object> itemMap : itemMaps) {
                OrderItemRequest item = new OrderItemRequest();
                item.setMenuItemId((String) itemMap.get("menuItemId"));
                item.setQuantity(((Number) itemMap.get("quantity")).intValue());
                if (itemMap.get("price") != null) {
                    item.setPrice(((Number) itemMap.get("price")).doubleValue());
                }
                item.setSpecialRequests((String) itemMap.get("specialRequests"));
                items.add(item);
            }
            completeRequest.setItems(items);
        }
        
        return completeRequest;
    }
    
    public static class CreateCompleteOrderRequest {
        private String customerId;
        private int tableNumber;
        private List<OrderItemRequest> items;
        private String specialInstructions;
        private String paymentMethod;
        private double subtotal;
        private double serviceFee;
        private double tax;
        private double totalAmount;
        private String status;
        
        public String getCustomerId() { return customerId; }
        public void setCustomerId(String customerId) { this.customerId = customerId; }
        
        public int getTableNumber() { return tableNumber; }
        public void setTableNumber(int tableNumber) { this.tableNumber = tableNumber; }
        
        public List<OrderItemRequest> getItems() { return items; }
        public void setItems(List<OrderItemRequest> items) { this.items = items; }
        
        public String getSpecialInstructions() { return specialInstructions; }
        public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
        
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        
        public double getSubtotal() { return subtotal; }
        public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
        
        public double getServiceFee() { return serviceFee; }
        public void setServiceFee(double serviceFee) { this.serviceFee = serviceFee; }
        
        public double getTax() { return tax; }
        public void setTax(double tax) { this.tax = tax; }
        
        public double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    public static class OrderItemRequest {
        private String menuItemId;
        private int quantity;
        private double price;
        private String specialRequests;
        
        public String getMenuItemId() { return menuItemId; }
        public void setMenuItemId(String menuItemId) { this.menuItemId = menuItemId; }
        
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        
        public String getSpecialRequests() { return specialRequests; }
        public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }
    }
}