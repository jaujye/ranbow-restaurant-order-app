package com.ranbow.restaurant.api;

import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.models.OrderStatus;
import com.ranbow.restaurant.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
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
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request.getCustomerId(), request.getTableNumber());
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable String orderId) {
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
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomer(@PathVariable String customerId) {
        List<Order> orders = orderService.getOrdersByCustomerId(customerId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
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
    
    @PostMapping("/{orderId}/items")
    public ResponseEntity<?> addItemToOrder(@PathVariable String orderId, 
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
    public ResponseEntity<?> removeItemFromOrder(@PathVariable String orderId, 
                                               @PathVariable String orderItemId) {
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
    public ResponseEntity<?> updateOrderItemQuantity(@PathVariable String orderId,
                                                    @PathVariable String orderItemId,
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
    public ResponseEntity<?> confirmOrder(@PathVariable String orderId) {
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
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, 
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
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId, 
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
}