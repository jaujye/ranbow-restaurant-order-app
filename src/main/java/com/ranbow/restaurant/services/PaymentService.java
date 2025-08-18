package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.PaymentDAO;
import com.ranbow.restaurant.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {
    @Autowired
    private PaymentDAO paymentDAO;
    
    @Autowired
    private OrderService orderService;
    
    public Payment createPayment(String orderId, String customerId, PaymentMethod paymentMethod) {
        Optional<Order> orderOpt = orderService.findOrderById(orderId);
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("找不到訂單，ID: " + orderId);
        }
        
        Order order = orderOpt.get();
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT && 
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
}