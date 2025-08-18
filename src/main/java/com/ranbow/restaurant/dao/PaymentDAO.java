package com.ranbow.restaurant.dao;

import com.ranbow.restaurant.models.Payment;
import com.ranbow.restaurant.models.PaymentMethod;
import com.ranbow.restaurant.models.PaymentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class PaymentDAO {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private static final String INSERT_PAYMENT = """
        INSERT INTO payments (payment_id, order_id, customer_id, amount, payment_method, 
                             status, transaction_id, payment_time, processed_time, failure_reason) 
        VALUES (?, ?, ?, ?, ?::payment_method, ?::payment_status, ?, ?, ?, ?)
        """;
    
    private static final String SELECT_PAYMENT_BY_ID = """
        SELECT payment_id, order_id, customer_id, amount, payment_method, status, 
               transaction_id, payment_time, processed_time, failure_reason 
        FROM payments WHERE payment_id = ?
        """;
    
    private static final String SELECT_PAYMENT_BY_ORDER_ID = """
        SELECT payment_id, order_id, customer_id, amount, payment_method, status, 
               transaction_id, payment_time, processed_time, failure_reason 
        FROM payments WHERE order_id = ? 
        ORDER BY payment_time DESC
        """;
    
    private static final String SELECT_ALL_PAYMENTS = """
        SELECT payment_id, order_id, customer_id, amount, payment_method, status, 
               transaction_id, payment_time, processed_time, failure_reason 
        FROM payments ORDER BY payment_time DESC
        """;
    
    private static final String SELECT_PAYMENTS_BY_CUSTOMER = """
        SELECT payment_id, order_id, customer_id, amount, payment_method, status, 
               transaction_id, payment_time, processed_time, failure_reason 
        FROM payments WHERE customer_id = ? ORDER BY payment_time DESC
        """;
    
    private static final String SELECT_PAYMENTS_BY_STATUS = """
        SELECT payment_id, order_id, customer_id, amount, payment_method, status, 
               transaction_id, payment_time, processed_time, failure_reason 
        FROM payments WHERE status = ?::payment_status ORDER BY payment_time DESC
        """;
    
    private static final String SELECT_TODAYS_PAYMENTS = """
        SELECT payment_id, order_id, customer_id, amount, payment_method, status, 
               transaction_id, payment_time, processed_time, failure_reason 
        FROM payments WHERE DATE(payment_time) = CURRENT_DATE 
        ORDER BY payment_time DESC
        """;
    
    private static final String UPDATE_PAYMENT = """
        UPDATE payments 
        SET status = ?::payment_status, transaction_id = ?, processed_time = ?, failure_reason = ? 
        WHERE payment_id = ?
        """;
    
    private static final String SELECT_TODAYS_COMPLETED_REVENUE = """
        SELECT COALESCE(SUM(amount), 0) 
        FROM payments 
        WHERE DATE(payment_time) = CURRENT_DATE AND status = 'COMPLETED'
        """;
    
    private static final String SELECT_TOTAL_COMPLETED_REVENUE = """
        SELECT COALESCE(SUM(amount), 0) 
        FROM payments 
        WHERE status = 'COMPLETED'
        """;
    
    private static final String COUNT_SUCCESSFUL_PAYMENTS = """
        SELECT COUNT(*) FROM payments WHERE status = 'COMPLETED'
        """;
    
    private static final String COUNT_FAILED_PAYMENTS = """
        SELECT COUNT(*) FROM payments WHERE status = 'FAILED'
        """;
    
    private static final String COUNT_TOTAL_PAYMENT_ATTEMPTS = """
        SELECT COUNT(*) FROM payments
        """;
    
    private final RowMapper<Payment> paymentRowMapper = new RowMapper<Payment>() {
        @Override
        public Payment mapRow(ResultSet rs, int rowNum) throws SQLException {
            Payment payment = new Payment();
            payment.setPaymentId(rs.getString("payment_id"));
            payment.setOrderId(rs.getString("order_id"));
            payment.setCustomerId(rs.getString("customer_id"));
            payment.setAmount(rs.getBigDecimal("amount"));
            payment.setPaymentMethod(PaymentMethod.valueOf(rs.getString("payment_method")));
            payment.setStatus(PaymentStatus.valueOf(rs.getString("status")));
            payment.setTransactionId(rs.getString("transaction_id"));
            payment.setFailureReason(rs.getString("failure_reason"));
            
            java.sql.Timestamp paymentTimestamp = rs.getTimestamp("payment_time");
            if (paymentTimestamp != null) {
                payment.setPaymentTime(paymentTimestamp.toLocalDateTime());
            }
            
            java.sql.Timestamp processedTimestamp = rs.getTimestamp("processed_time");
            if (processedTimestamp != null) {
                payment.setProcessedTime(processedTimestamp.toLocalDateTime());
            }
            
            return payment;
        }
    };
    
    public Payment save(Payment payment) {
        java.sql.Timestamp processedTimestamp = payment.getProcessedTime() != null ? 
                java.sql.Timestamp.valueOf(payment.getProcessedTime()) : null;
        
        jdbcTemplate.update(INSERT_PAYMENT,
                payment.getPaymentId(),
                payment.getOrderId(),
                payment.getCustomerId(),
                payment.getAmount(),
                payment.getPaymentMethod().name(),
                payment.getStatus().name(),
                payment.getTransactionId(),
                java.sql.Timestamp.valueOf(payment.getPaymentTime()),
                processedTimestamp,
                payment.getFailureReason());
        return payment;
    }
    
    public Optional<Payment> findById(String paymentId) {
        try {
            Payment payment = jdbcTemplate.queryForObject(SELECT_PAYMENT_BY_ID, paymentRowMapper, paymentId);
            return Optional.of(payment);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    public Optional<Payment> findByOrderId(String orderId) {
        try {
            List<Payment> payments = jdbcTemplate.query(SELECT_PAYMENT_BY_ORDER_ID, paymentRowMapper, orderId);
            if (payments.isEmpty()) {
                return Optional.empty();
            }
            // Return the most recent payment (last in list, ordered by payment_time DESC)
            return Optional.of(payments.get(0));
        } catch (DataAccessException e) {
            return Optional.empty();
        }
    }
    
    public List<Payment> findAll() {
        return jdbcTemplate.query(SELECT_ALL_PAYMENTS, paymentRowMapper);
    }
    
    public List<Payment> findByCustomerId(String customerId) {
        return jdbcTemplate.query(SELECT_PAYMENTS_BY_CUSTOMER, paymentRowMapper, customerId);
    }
    
    public List<Payment> findByStatus(PaymentStatus status) {
        return jdbcTemplate.query(SELECT_PAYMENTS_BY_STATUS, paymentRowMapper, status.name());
    }
    
    public List<Payment> findTodaysPayments() {
        return jdbcTemplate.query(SELECT_TODAYS_PAYMENTS, paymentRowMapper);
    }
    
    public Payment update(Payment payment) {
        java.sql.Timestamp processedTimestamp = payment.getProcessedTime() != null ? 
                java.sql.Timestamp.valueOf(payment.getProcessedTime()) : null;
        
        int updated = jdbcTemplate.update(UPDATE_PAYMENT,
                payment.getStatus().name(),
                payment.getTransactionId(),
                processedTimestamp,
                payment.getFailureReason(),
                payment.getPaymentId());
        
        if (updated == 0) {
            throw new RuntimeException("Payment not found: " + payment.getPaymentId());
        }
        return payment;
    }
    
    public BigDecimal getTodaysRevenue() {
        BigDecimal revenue = jdbcTemplate.queryForObject(SELECT_TODAYS_COMPLETED_REVENUE, BigDecimal.class);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalRevenue() {
        BigDecimal revenue = jdbcTemplate.queryForObject(SELECT_TOTAL_COMPLETED_REVENUE, BigDecimal.class);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }
    
    public int countSuccessfulPayments() {
        Integer count = jdbcTemplate.queryForObject(COUNT_SUCCESSFUL_PAYMENTS, Integer.class);
        return count != null ? count : 0;
    }
    
    public int countFailedPayments() {
        Integer count = jdbcTemplate.queryForObject(COUNT_FAILED_PAYMENTS, Integer.class);
        return count != null ? count : 0;
    }
    
    public double getPaymentSuccessRate() {
        Integer totalAttempts = jdbcTemplate.queryForObject(COUNT_TOTAL_PAYMENT_ATTEMPTS, Integer.class);
        if (totalAttempts == null || totalAttempts == 0) {
            return 0.0;
        }
        
        int successful = countSuccessfulPayments();
        return (double) successful / totalAttempts * 100.0;
    }
}