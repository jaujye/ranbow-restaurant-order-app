package com.ranbow.restaurant.services;

import com.ranbow.restaurant.models.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class PaymentService {
    private List<Payment> payments;
    private OrderService orderService;
    
    public PaymentService(OrderService orderService) {
        this.payments = new ArrayList<>();
        this.orderService = orderService;
    }
    
    public Payment createPayment(String orderId, String customerId, PaymentMethod paymentMethod) {
        Optional<Order> orderOpt = orderService.findOrderById(orderId);
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("找不到訂單，ID: " + orderId);
        }
        
        Order order = orderOpt.get();
        if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.READY) {
            throw new IllegalStateException("訂單狀態不允許付款: " + order.getStatus());
        }
        
        // Check if payment already exists for this order
        Optional<Payment> existingPayment = findPaymentByOrderId(orderId);
        if (existingPayment.isPresent() && existingPayment.get().getStatus() == PaymentStatus.COMPLETED) {
            throw new IllegalStateException("此訂單已完成付款");
        }
        
        Payment payment = new Payment(orderId, customerId, order.getTotalAmount(), paymentMethod);
        payments.add(payment);
        return payment;
    }
    
    public Optional<Payment> findPaymentById(String paymentId) {
        return payments.stream()
                .filter(payment -> payment.getPaymentId().equals(paymentId))
                .findFirst();
    }
    
    public Optional<Payment> findPaymentByOrderId(String orderId) {
        return payments.stream()
                .filter(payment -> payment.getOrderId().equals(orderId))
                .findFirst();
    }
    
    public List<Payment> getAllPayments() {
        return new ArrayList<>(payments);
    }
    
    public List<Payment> getPaymentsByCustomerId(String customerId) {
        return payments.stream()
                .filter(payment -> payment.getCustomerId().equals(customerId))
                .toList();
    }
    
    public List<Payment> getPaymentsByStatus(PaymentStatus status) {
        return payments.stream()
                .filter(payment -> payment.getStatus() == status)
                .toList();
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
                
                // Update order status after successful payment
                orderService.updateOrderStatus(payment.getOrderId(), OrderStatus.PREPARING);
                
                return true;
            } else {
                payment.markAsFailed("付款處理失敗");
                return false;
            }
            
        } catch (Exception e) {
            payment.markAsFailed("付款處理異常: " + e.getMessage());
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
        
        // Cancel the associated order
        orderService.cancelOrder(payment.getOrderId(), "付款已退款: " + reason);
        
        return true;
    }
    
    public List<Payment> getTodaysPayments() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        return payments.stream()
                .filter(payment -> payment.getPaymentTime().isAfter(startOfDay) && 
                                 payment.getPaymentTime().isBefore(endOfDay))
                .toList();
    }
    
    public BigDecimal getTodaysRevenue() {
        return getTodaysPayments().stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public BigDecimal getTotalRevenue() {
        return payments.stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public int getSuccessfulPaymentsCount() {
        return (int) payments.stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.COMPLETED)
                .count();
    }
    
    public int getFailedPaymentsCount() {
        return (int) payments.stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.FAILED)
                .count();
    }
    
    public double getPaymentSuccessRate() {
        long totalAttempts = payments.size();
        if (totalAttempts == 0) return 0.0;
        
        long successfulPayments = getSuccessfulPaymentsCount();
        return (double) successfulPayments / totalAttempts * 100;
    }
}