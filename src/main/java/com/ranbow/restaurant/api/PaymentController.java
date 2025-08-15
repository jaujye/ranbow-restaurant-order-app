package com.ranbow.restaurant.api;

import com.ranbow.restaurant.models.Payment;
import com.ranbow.restaurant.models.PaymentMethod;
import com.ranbow.restaurant.models.PaymentStatus;
import com.ranbow.restaurant.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @PostMapping
    public ResponseEntity<?> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        try {
            Payment payment = paymentService.createPayment(
                    request.getOrderId(),
                    request.getCustomerId(),
                    request.getPaymentMethod());
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(@PathVariable String paymentId) {
        Optional<Payment> payment = paymentService.findPaymentById(paymentId);
        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(@PathVariable String orderId) {
        Optional<Payment> payment = paymentService.findPaymentByOrderId(orderId);
        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Payment>> getPaymentsByCustomer(@PathVariable String customerId) {
        List<Payment> payments = paymentService.getPaymentsByCustomerId(customerId);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Payment>> getPaymentsByStatus(@PathVariable PaymentStatus status) {
        List<Payment> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/today")
    public ResponseEntity<List<Payment>> getTodaysPayments() {
        List<Payment> payments = paymentService.getTodaysPayments();
        return ResponseEntity.ok(payments);
    }
    
    @PostMapping("/{paymentId}/process")
    public ResponseEntity<?> processPayment(@PathVariable String paymentId) {
        try {
            boolean success = paymentService.processPayment(paymentId);
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true, 
                        "message", "Payment processed successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Payment processing failed"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<?> refundPayment(@PathVariable String paymentId, 
                                         @RequestBody RefundRequest request) {
        try {
            boolean success = paymentService.refundPayment(paymentId, request.getReason());
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true, 
                        "message", "Payment refunded successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Refund failed"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/revenue/today")
    public ResponseEntity<?> getTodaysRevenue() {
        return ResponseEntity.ok(Map.of(
                "todaysRevenue", paymentService.getTodaysRevenue(),
                "date", java.time.LocalDate.now().toString()
        ));
    }
    
    @GetMapping("/revenue/total")
    public ResponseEntity<?> getTotalRevenue() {
        return ResponseEntity.ok(Map.of(
                "totalRevenue", paymentService.getTotalRevenue()
        ));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getPaymentStats() {
        return ResponseEntity.ok(Map.of(
                "totalRevenue", paymentService.getTotalRevenue(),
                "todaysRevenue", paymentService.getTodaysRevenue(),
                "successfulPayments", paymentService.getSuccessfulPaymentsCount(),
                "failedPayments", paymentService.getFailedPaymentsCount(),
                "paymentSuccessRate", paymentService.getPaymentSuccessRate(),
                "paymentMethods", PaymentMethod.values(),
                "paymentStatuses", PaymentStatus.values()
        ));
    }
    
    // DTO Classes
    public static class CreatePaymentRequest {
        private String orderId;
        private String customerId;
        private PaymentMethod paymentMethod;
        
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        
        public String getCustomerId() { return customerId; }
        public void setCustomerId(String customerId) { this.customerId = customerId; }
        
        public PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    }
    
    public static class RefundRequest {
        private String reason;
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}