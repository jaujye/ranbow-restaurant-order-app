package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.PaymentDAO;
import com.ranbow.restaurant.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PaymentService {
    @Autowired
    private PaymentDAO paymentDAO;
    
    @Autowired
    private OrderService orderService;
    
    @Transactional(isolation = Isolation.READ_COMMITTED, propagation = Propagation.REQUIRED)
    public Payment createPayment(String orderId, String customerId, PaymentMethod paymentMethod) {
        Optional<Order> orderOpt = orderService.findOrderById(orderId);
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("找不到訂單，ID: " + orderId);
        }
        
        Order order = orderOpt.get();
        if (order.getStatus() != OrderStatus.PENDING && 
            order.getStatus() != OrderStatus.PENDING_PAYMENT && 
            order.getStatus() != OrderStatus.CONFIRMED && 
            order.getStatus() != OrderStatus.READY) {
            throw new IllegalStateException("訂單狀態不允許付款: " + order.getStatus());
        }
        
        // Check if payment already exists for this order
        Optional<Payment> existingPayment = findPaymentByOrderId(orderId);
        if (existingPayment.isPresent()) {
            Payment existing = existingPayment.get();
            if (existing.getStatus() == PaymentStatus.COMPLETED) {
                throw new IllegalStateException("此訂單已完成付款");
            } else if (existing.getStatus() == PaymentStatus.PENDING || existing.getStatus() == PaymentStatus.PROCESSING) {
                // Allow creating new payment record for failed or stuck payments
                // This handles cases where payment process was interrupted
                System.out.println("Found existing non-completed payment for order " + orderId + ", creating new payment record");
            }
        }
        
        Payment payment = new Payment(orderId, customerId, order.getTotalAmount(), paymentMethod);
        return paymentDAO.save(payment);
    }
    
    public Optional<Payment> findPaymentById(String paymentId) {
        return paymentDAO.findById(paymentId);
    }
    
    public Optional<Payment> findPaymentByOrderId(String orderId) {
        return paymentDAO.findByOrderId(orderId);
    }
    
    public List<Payment> getAllPayments() {
        return paymentDAO.findAll();
    }
    
    public List<Payment> getPaymentsByCustomerId(String customerId) {
        return paymentDAO.findByCustomerId(customerId);
    }
    
    public List<Payment> getPaymentsByStatus(PaymentStatus status) {
        return paymentDAO.findByStatus(status);
    }
    
    @Transactional(isolation = Isolation.SERIALIZABLE, propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public boolean processPayment(String paymentId) {
        Optional<Payment> paymentOpt = findPaymentById(paymentId);
        if (paymentOpt.isEmpty()) {
            return false;
        }
        
        Payment payment = paymentOpt.get();
        
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("付款狀態不允許處理: " + payment.getStatus());
        }
        
        try {
            // Simulate payment processing
            payment.setStatus(PaymentStatus.PROCESSING);
            
            // Mock payment gateway integration
            boolean paymentSuccess = mockPaymentGateway(payment);
            
            if (paymentSuccess) {
                String transactionId = generateTransactionId();
                payment.markAsProcessed(transactionId);
                paymentDAO.update(payment);
                
                // Update order status after successful payment
                orderService.updateOrderStatus(payment.getOrderId(), OrderStatus.CONFIRMED);
                
                return true;
            } else {
                payment.markAsFailed("付款處理失敗");
                paymentDAO.update(payment);
                return false;
            }
            
        } catch (Exception e) {
            payment.markAsFailed("付款處理異常: " + e.getMessage());
            paymentDAO.update(payment);
            return false;
        }
    }
    
    private boolean mockPaymentGateway(Payment payment) {
        // Mock payment gateway - in real implementation, this would call external APIs
        try {
            Thread.sleep(1000); // Simulate processing time
            
            // Simulate different payment method processing
            return switch (payment.getPaymentMethod()) {
                case CASH -> true; // Cash payments always succeed
                case CREDIT_CARD, DEBIT_CARD -> Math.random() > 0.1; // 90% success rate
                case MOBILE_PAYMENT, LINE_PAY, APPLE_PAY, GOOGLE_PAY -> Math.random() > 0.05; // 95% success rate
            };
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
    
    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    public boolean refundPayment(String paymentId, String reason) {
        Optional<Payment> paymentOpt = findPaymentById(paymentId);
        if (paymentOpt.isEmpty()) {
            return false;
        }
        
        Payment payment = paymentOpt.get();
        
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new IllegalStateException("只能退款已完成的付款");
        }
        
        // Create refund record (in real implementation, you might have a separate Refund entity)
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setFailureReason("退款原因: " + reason);
        paymentDAO.update(payment);
        
        // Cancel the associated order
        orderService.cancelOrder(payment.getOrderId(), "付款已退款: " + reason);
        
        return true;
    }
    
    public List<Payment> getTodaysPayments() {
        return paymentDAO.findTodaysPayments();
    }
    
    public BigDecimal getTodaysRevenue() {
        return paymentDAO.getTodaysRevenue();
    }
    
    public BigDecimal getTotalRevenue() {
        return paymentDAO.getTotalRevenue();
    }
    
    public int getSuccessfulPaymentsCount() {
        return paymentDAO.countSuccessfulPayments();
    }
    
    public int getFailedPaymentsCount() {
        return paymentDAO.countFailedPayments();
    }
    
    public double getPaymentSuccessRate() {
        return paymentDAO.getPaymentSuccessRate();
    }
    
    // ========================= NEW ENHANCED PAYMENT PROCESSING METHODS =========================
    
    // Thread-safe cache for payment sessions - 在實際應用中應該使用Redis
    private final Map<String, PaymentSession> paymentSessions = new ConcurrentHashMap<>();
    
    /**
     * 模擬第三方支付處理 - 用於支付頁面模擬
     * @param paymentId 支付ID
     * @param request 模擬支付請求
     * @return 處理成功與否
     */
    @Transactional(isolation = Isolation.SERIALIZABLE, propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public boolean simulateThirdPartyPayment(String paymentId, Object request) {
        Optional<Payment> paymentOpt = findPaymentById(paymentId);
        if (paymentOpt.isEmpty()) {
            return false;
        }
        
        Payment payment = paymentOpt.get();
        
        // 使用支付ID作為鎖來防止併發處理同一筆支付
        synchronized (("payment_lock_" + paymentId).intern()) {
            // 重新獲取支付記錄以確保最新狀態
            Optional<Payment> refreshedPaymentOpt = findPaymentById(paymentId);
            if (refreshedPaymentOpt.isEmpty()) {
                return false;
            }
            payment = refreshedPaymentOpt.get();
            
            // 檢查支付狀態是否允許處理
            if (payment.getStatus() != PaymentStatus.PENDING) {
                throw new IllegalStateException("支付狀態不允許處理: " + payment.getStatus());
            }
        
        try {
            // 更新支付狀態為處理中
            payment.setStatus(PaymentStatus.PROCESSING);
            paymentDAO.update(payment);
            
            // 模擬支付處理延遲
            Thread.sleep(2000);
            
            // 根據請求中的成功標誌決定結果
            boolean simulatedSuccess = extractSuccessFromRequest(request);
            String transactionId = extractTransactionIdFromRequest(request);
            
            if (simulatedSuccess && transactionId != null) {
                // 支付成功
                payment.markAsProcessed(transactionId);
                paymentDAO.update(payment);
                
                // 異步更新訂單狀態
                updateOrderStatusAfterPayment(payment.getOrderId(), OrderStatus.CONFIRMED);
                
                return true;
            } else {
                // 支付失敗
                String failureReason = extractFailureReasonFromRequest(request);
                payment.markAsFailed(failureReason != null ? failureReason : "模擬支付失敗");
                paymentDAO.update(payment);
                return false;
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            payment.markAsFailed("支付處理被中斷");
            paymentDAO.update(payment);
            return false;
        } catch (Exception e) {
            payment.markAsFailed("支付處理異常: " + e.getMessage());
            paymentDAO.update(payment);
            return false;
        }
        } // 關閉 synchronized 區塊
    }
    
    /**
     * 處理支付回調 - 第三方支付服務回調處理
     * @param paymentId 支付ID
     * @param callbackRequest 回調數據
     * @return 處理成功與否
     */
    @Transactional(isolation = Isolation.SERIALIZABLE, propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public boolean handlePaymentCallback(String paymentId, Object callbackRequest) {
        Optional<Payment> paymentOpt = findPaymentById(paymentId);
        if (paymentOpt.isEmpty()) {
            return false;
        }
        
        Payment payment = paymentOpt.get();
        
        // 使用支付ID作為鎖來防止併發處理同一筆支付回調
        synchronized (("payment_callback_lock_" + paymentId).intern()) {
            // 重新獲取支付記錄以確保最新狀態
            Optional<Payment> refreshedPaymentOpt = findPaymentById(paymentId);
            if (refreshedPaymentOpt.isEmpty()) {
                return false;
            }
            payment = refreshedPaymentOpt.get();
        
        try {
            // 驗證回調請求的合法性（在實際應用中需要驗證簽名等）
            if (!validateCallbackRequest(callbackRequest)) {
                throw new SecurityException("回調請求驗證失敗");
            }
            
            // 提取回調數據
            PaymentStatus callbackStatus = extractStatusFromCallback(callbackRequest);
            String transactionId = extractTransactionIdFromCallback(callbackRequest);
            String providerResponse = extractProviderResponseFromCallback(callbackRequest);
            
            // 根據回調狀態更新支付記錄
            switch (callbackStatus) {
                case COMPLETED -> {
                    payment.markAsProcessed(transactionId);
                    paymentDAO.update(payment);
                    
                    // 更新訂單狀態
                    updateOrderStatusAfterPayment(payment.getOrderId(), OrderStatus.CONFIRMED);
                    
                    // 清理支付會話
                    paymentSessions.remove(paymentId);
                    
                    return true;
                }
                case FAILED -> {
                    payment.markAsFailed("第三方支付處理失敗: " + providerResponse);
                    paymentDAO.update(payment);
                    
                    // 清理支付會話
                    paymentSessions.remove(paymentId);
                    
                    return false;
                }
                case PROCESSING -> {
                    payment.setStatus(PaymentStatus.PROCESSING);
                    paymentDAO.update(payment);
                    return true;
                }
                default -> {
                    throw new IllegalArgumentException("未知的回調狀態: " + callbackStatus);
                }
            }
            
        } catch (Exception e) {
            payment.markAsFailed("回調處理異常: " + e.getMessage());
            paymentDAO.update(payment);
            return false;
        }
        } // 關閉 synchronized 區塊
    }
    
    /**
     * 獲取支付詳細狀態 - 用於前端輪詢
     * @param paymentId 支付ID
     * @return 支付詳細信息
     */
    public Optional<PaymentStatus> getPaymentDetailedStatus(String paymentId) {
        Optional<Payment> paymentOpt = findPaymentById(paymentId);
        return paymentOpt.map(Payment::getStatus);
    }
    
    /**
     * 創建支付會話 - 增強版本，返回更多會話信息
     * @param orderId 訂單ID
     * @param customerId 客戶ID
     * @param paymentMethod 支付方式
     * @return 支付對象和會話信息
     */
    public Payment createPaymentWithSession(String orderId, String customerId, PaymentMethod paymentMethod) {
        Payment payment = createPayment(orderId, customerId, paymentMethod);
        
        // 創建支付會話
        PaymentSession session = new PaymentSession(
                payment.getPaymentId(),
                payment.getOrderId(),
                payment.getAmount(),
                paymentMethod,
                LocalDateTime.now()
        );
        
        paymentSessions.put(payment.getPaymentId(), session);
        
        return payment;
    }
    
    // ========================= PRIVATE HELPER METHODS =========================
    
    /**
     * 從請求中提取成功標誌
     */
    private boolean extractSuccessFromRequest(Object request) {
        if (request instanceof Map) {
            Map<?, ?> requestMap = (Map<?, ?>) request;
            Object success = requestMap.get("success");
            return success instanceof Boolean ? (Boolean) success : true; // 默認成功
        }
        return true; // 默認成功
    }
    
    /**
     * 從請求中提取交易ID
     */
    private String extractTransactionIdFromRequest(Object request) {
        if (request instanceof Map) {
            Map<?, ?> requestMap = (Map<?, ?>) request;
            Object transactionId = requestMap.get("transactionId");
            return transactionId instanceof String ? (String) transactionId : generateTransactionId();
        }
        return generateTransactionId();
    }
    
    /**
     * 從請求中提取失敗原因
     */
    private String extractFailureReasonFromRequest(Object request) {
        if (request instanceof Map) {
            Map<?, ?> requestMap = (Map<?, ?>) request;
            Object failureReason = requestMap.get("failureReason");
            return failureReason instanceof String ? (String) failureReason : "未知錯誤";
        }
        return "未知錯誤";
    }
    
    /**
     * 驗證回調請求
     */
    private boolean validateCallbackRequest(Object callbackRequest) {
        // 在實際應用中，這裡會驗證簽名、時間戳等安全要素
        // 目前僅做基本檢查
        return callbackRequest != null;
    }
    
    /**
     * 從回調中提取狀態
     */
    private PaymentStatus extractStatusFromCallback(Object callbackRequest) {
        if (callbackRequest instanceof Map) {
            Map<?, ?> requestMap = (Map<?, ?>) callbackRequest;
            Object status = requestMap.get("status");
            if (status instanceof String) {
                try {
                    return PaymentStatus.valueOf((String) status);
                } catch (IllegalArgumentException e) {
                    return PaymentStatus.FAILED;
                }
            }
        }
        return PaymentStatus.FAILED;
    }
    
    /**
     * 從回調中提取交易ID
     */
    private String extractTransactionIdFromCallback(Object callbackRequest) {
        if (callbackRequest instanceof Map) {
            Map<?, ?> requestMap = (Map<?, ?>) callbackRequest;
            Object transactionId = requestMap.get("transactionId");
            return transactionId instanceof String ? (String) transactionId : generateTransactionId();
        }
        return generateTransactionId();
    }
    
    /**
     * 從回調中提取提供商響應
     */
    private String extractProviderResponseFromCallback(Object callbackRequest) {
        if (callbackRequest instanceof Map) {
            Map<?, ?> requestMap = (Map<?, ?>) callbackRequest;
            Object providerResponse = requestMap.get("providerResponse");
            return providerResponse instanceof String ? (String) providerResponse : "";
        }
        return "";
    }
    
    /**
     * 支付成功後更新訂單狀態
     */
    private void updateOrderStatusAfterPayment(String orderId, OrderStatus newStatus) {
        try {
            orderService.updateOrderStatus(orderId, newStatus);
        } catch (Exception e) {
            System.err.println("Failed to update order status after payment: " + e.getMessage());
            // 在實際應用中，這裡應該記錄到日誌系統並可能觸發補償機制
        }
    }
    
    // ========================= INNER CLASS FOR PAYMENT SESSION =========================
    
    /**
     * 支付會話類 - 用於跟踪支付過程中的臨時狀態
     */
    private static class PaymentSession {
        private final String paymentId;
        private final String orderId;
        private final BigDecimal amount;
        private final PaymentMethod paymentMethod;
        private final LocalDateTime createdAt;
        private LocalDateTime lastAccessedAt;
        
        public PaymentSession(String paymentId, String orderId, BigDecimal amount, 
                            PaymentMethod paymentMethod, LocalDateTime createdAt) {
            this.paymentId = paymentId;
            this.orderId = orderId;
            this.amount = amount;
            this.paymentMethod = paymentMethod;
            this.createdAt = createdAt;
            this.lastAccessedAt = LocalDateTime.now();
        }
        
        public void touch() {
            this.lastAccessedAt = LocalDateTime.now();
        }
        
        // Getters
        public String getPaymentId() { return paymentId; }
        public String getOrderId() { return orderId; }
        public BigDecimal getAmount() { return amount; }
        public PaymentMethod getPaymentMethod() { return paymentMethod; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getLastAccessedAt() { return lastAccessedAt; }
    }
}