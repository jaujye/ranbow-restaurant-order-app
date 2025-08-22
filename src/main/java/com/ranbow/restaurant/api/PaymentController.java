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
import java.util.HashMap;
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
    public ResponseEntity<?> getPayment(@PathVariable("paymentId") String paymentId) {
        Optional<Payment> payment = paymentService.findPaymentById(paymentId);
        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(@PathVariable("orderId") String orderId) {
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
    public ResponseEntity<List<Payment>> getPaymentsByCustomer(@PathVariable("customerId") String customerId) {
        List<Payment> payments = paymentService.getPaymentsByCustomerId(customerId);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Payment>> getPaymentsByStatus(@PathVariable("status") PaymentStatus status) {
        List<Payment> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/today")
    public ResponseEntity<List<Payment>> getTodaysPayments() {
        List<Payment> payments = paymentService.getTodaysPayments();
        return ResponseEntity.ok(payments);
    }
    
    @PostMapping("/{paymentId}/process")
    public ResponseEntity<?> processPayment(@PathVariable("paymentId") String paymentId) {
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
    public ResponseEntity<?> refundPayment(@PathVariable("paymentId") String paymentId, 
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
    
    // ========================= NEW PAYMENT FLOW API ENDPOINTS =========================
    
    /**
     * 模擬第三方支付處理 - 支付頁面回調使用
     * @param paymentId 支付ID
     * @param request 支付模擬請求
     * @return 支付處理結果
     */
    @PostMapping("/{paymentId}/simulate")
    public ResponseEntity<?> simulatePayment(@PathVariable("paymentId") String paymentId,
                                           @Valid @RequestBody SimulatePaymentRequest request) {
        try {
            boolean success = paymentService.simulateThirdPartyPayment(paymentId, request);
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "支付模擬處理成功",
                        "paymentId", paymentId,
                        "transactionId", request.getTransactionId()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "支付模擬處理失敗"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 查詢支付狀態 - 前端輪詢使用
     * @param paymentId 支付ID
     * @return 支付狀態信息
     */
    @GetMapping("/{paymentId}/status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable("paymentId") String paymentId) {
        try {
            Optional<Payment> payment = paymentService.findPaymentById(paymentId);
            if (payment.isPresent()) {
                Payment p = payment.get();
                Map<String, Object> response = new HashMap<>();
                response.put("paymentId", p.getPaymentId());
                response.put("orderId", p.getOrderId());
                response.put("status", p.getStatus());
                response.put("amount", p.getAmount());
                response.put("paymentMethod", p.getPaymentMethod());
                response.put("transactionId", p.getTransactionId() != null ? p.getTransactionId() : "");
                response.put("paymentTime", p.getPaymentTime());
                response.put("processedTime", p.getProcessedTime());
                response.put("failureReason", p.getFailureReason() != null ? p.getFailureReason() : "");
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 支付回調處理 - 第三方支付服務回調使用
     * @param paymentId 支付ID
     * @param request 回調請求數據
     * @return 回調處理結果
     */
    @PostMapping("/{paymentId}/callback")
    public ResponseEntity<?> handlePaymentCallback(@PathVariable("paymentId") String paymentId,
                                                 @Valid @RequestBody PaymentCallbackRequest request) {
        try {
            boolean success = paymentService.handlePaymentCallback(paymentId, request);
            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "支付回調處理成功",
                        "paymentId", paymentId
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "支付回調處理失敗"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 創建支付會話 - 返回支付頁面所需資訊
     * @param request 創建支付請求
     * @return 支付會話信息
     */
    @PostMapping("/session")
    public ResponseEntity<?> createPaymentSession(@Valid @RequestBody CreatePaymentRequest request) {
        try {
            Payment payment = paymentService.createPayment(
                    request.getOrderId(),
                    request.getCustomerId(),
                    request.getPaymentMethod());
            
            // 返回支付頁面所需的信息
            Map<String, Object> sessionData = Map.of(
                    "paymentId", payment.getPaymentId(),
                    "orderId", payment.getOrderId(),
                    "amount", payment.getAmount(),
                    "paymentMethod", payment.getPaymentMethod(),
                    "status", payment.getStatus(),
                    "paymentPageUrl", generatePaymentPageUrl(payment),
                    "callbackUrl", generateCallbackUrl(payment.getPaymentId()),
                    "statusCheckUrl", generateStatusCheckUrl(payment.getPaymentId())
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(sessionData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
    
    // ========================= NEW DTO CLASSES FOR ENHANCED PAYMENT FLOW =========================
    
    public static class SimulatePaymentRequest {
        private String transactionId;
        private Boolean success;
        private String failureReason;
        private Map<String, Object> providerData;
        
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        
        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }
        
        public String getFailureReason() { return failureReason; }
        public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
        
        public Map<String, Object> getProviderData() { return providerData; }
        public void setProviderData(Map<String, Object> providerData) { this.providerData = providerData; }
    }
    
    public static class PaymentCallbackRequest {
        private String transactionId;
        private PaymentStatus status;
        private String providerResponse;
        private String signature;
        private Map<String, Object> metadata;
        
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        
        public PaymentStatus getStatus() { return status; }
        public void setStatus(PaymentStatus status) { this.status = status; }
        
        public String getProviderResponse() { return providerResponse; }
        public void setProviderResponse(String providerResponse) { this.providerResponse = providerResponse; }
        
        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
        
        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    }
    
    // ========================= HELPER METHODS FOR URL GENERATION =========================
    
    /**
     * 生成支付頁面URL - 實際應用中會指向真實的第三方支付頁面
     */
    private String generatePaymentPageUrl(Payment payment) {
        // 在實際應用中，這裡會根據不同的支付方式生成對應的支付頁面URL
        String baseUrl = "http://localhost:8081/api/payments";
        return switch (payment.getPaymentMethod()) {
            case CREDIT_CARD -> baseUrl + "/" + payment.getPaymentId() + "/card-payment";
            case LINE_PAY -> baseUrl + "/" + payment.getPaymentId() + "/line-pay";
            case APPLE_PAY -> baseUrl + "/" + payment.getPaymentId() + "/apple-pay";
            case CASH -> baseUrl + "/" + payment.getPaymentId() + "/cash-confirmation";
            default -> baseUrl + "/" + payment.getPaymentId() + "/generic-payment";
        };
    }
    
    /**
     * 生成回調URL
     */
    private String generateCallbackUrl(String paymentId) {
        return "http://localhost:8081/api/payments/" + paymentId + "/callback";
    }
    
    /**
     * 生成狀態查詢URL
     */
    private String generateStatusCheckUrl(String paymentId) {
        return "http://localhost:8081/api/payments/" + paymentId + "/status";
    }
}