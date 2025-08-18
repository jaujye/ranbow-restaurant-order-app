package com.ranbow.restaurant.dao;

import com.ranbow.restaurant.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class OrderDAO {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private MenuDAO menuDAO;
    
    private static final String INSERT_ORDER = """
        INSERT INTO orders (order_id, customer_id, status, subtotal, tax, total_amount, 
                           special_instructions, table_number, order_time) 
        VALUES (?, ?, ?::order_status, ?, ?, ?, ?, ?, ?)
        """;
    
    private static final String INSERT_ORDER_ITEM = """
        INSERT INTO order_items (order_item_id, order_id, menu_item_id, quantity, 
                                special_requests, item_total) 
        VALUES (?, ?, ?, ?, ?, ?)
        """;
    
    private static final String SELECT_ORDER_BY_ID = """
        SELECT order_id, customer_id, status, subtotal, tax, total_amount, 
               special_instructions, table_number, order_time, completed_time 
        FROM orders WHERE order_id = ?
        """;
    
    private static final String SELECT_ALL_ORDERS = """
        SELECT order_id, customer_id, status, subtotal, tax, total_amount, 
               special_instructions, table_number, order_time, completed_time 
        FROM orders ORDER BY order_time DESC
        """;
    
    private static final String SELECT_ORDERS_BY_CUSTOMER = """
        SELECT order_id, customer_id, status, subtotal, tax, total_amount, 
               special_instructions, table_number, order_time, completed_time 
        FROM orders WHERE customer_id = ? ORDER BY order_time DESC
        """;
    
    private static final String SELECT_ORDERS_BY_STATUS = """
        SELECT order_id, customer_id, status, subtotal, tax, total_amount, 
               special_instructions, table_number, order_time, completed_time 
        FROM orders WHERE status = ?::order_status ORDER BY order_time DESC
        """;
    
    private static final String SELECT_ACTIVE_ORDERS = """
        SELECT order_id, customer_id, status, subtotal, tax, total_amount, 
               special_instructions, table_number, order_time, completed_time 
        FROM orders 
        WHERE status NOT IN ('COMPLETED', 'CANCELLED') 
        ORDER BY order_time ASC
        """;
    
    private static final String SELECT_TODAYS_ORDERS = """
        SELECT order_id, customer_id, status, subtotal, tax, total_amount, 
               special_instructions, table_number, order_time, completed_time 
        FROM orders 
        WHERE DATE(order_time) = CURRENT_DATE 
        ORDER BY order_time DESC
        """;
    
    private static final String SELECT_ORDER_ITEMS_BY_ORDER = """
        SELECT oi.order_item_id, oi.order_id, oi.menu_item_id, oi.quantity, 
               oi.special_requests, oi.item_total,
               mi.name, mi.description, mi.price, mi.category, mi.is_available, 
               mi.image_url, mi.preparation_time, mi.created_at, mi.updated_at
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.item_id
        WHERE oi.order_id = ?
        ORDER BY oi.order_item_id
        """;
    
    private static final String UPDATE_ORDER = """
        UPDATE orders 
        SET subtotal = ?, tax = ?, total_amount = ?, special_instructions = ? 
        WHERE order_id = ?
        """;
    
    private static final String UPDATE_ORDER_STATUS = """
        UPDATE orders 
        SET status = ?::order_status, completed_time = ? 
        WHERE order_id = ?
        """;
    
    private static final String DELETE_ORDER_ITEM = """
        DELETE FROM order_items WHERE order_item_id = ?
        """;
    
    private static final String COUNT_TOTAL_ORDERS = """
        SELECT COUNT(*) FROM orders
        """;
    
    private static final String COUNT_TODAYS_ORDERS = """
        SELECT COUNT(*) FROM orders WHERE DATE(order_time) = CURRENT_DATE
        """;
    
    private static final String COUNT_COMPLETED_ORDERS = """
        SELECT COUNT(*) FROM orders WHERE status = 'COMPLETED'
        """;
    
    private final RowMapper<Order> orderRowMapper = new RowMapper<Order>() {
        @Override
        public Order mapRow(ResultSet rs, int rowNum) throws SQLException {
            Order order = new Order();
            order.setOrderId(rs.getString("order_id"));
            order.setCustomerId(rs.getString("customer_id"));
            order.setStatus(OrderStatus.valueOf(rs.getString("status")));
            order.setSubtotal(rs.getBigDecimal("subtotal"));
            order.setTax(rs.getBigDecimal("tax"));
            order.setTotalAmount(rs.getBigDecimal("total_amount"));
            order.setSpecialInstructions(rs.getString("special_instructions"));
            order.setTableNumber(rs.getInt("table_number"));
            
            java.sql.Timestamp orderTimestamp = rs.getTimestamp("order_time");
            if (orderTimestamp != null) {
                order.setOrderTime(orderTimestamp.toLocalDateTime());
            }
            
            java.sql.Timestamp completedTimestamp = rs.getTimestamp("completed_time");
            if (completedTimestamp != null) {
                order.setCompletedTime(completedTimestamp.toLocalDateTime());
            }
            
            return order;
        }
    };
    
    private final RowMapper<OrderItem> orderItemRowMapper = new RowMapper<OrderItem>() {
        @Override
        public OrderItem mapRow(ResultSet rs, int rowNum) throws SQLException {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderItemId(rs.getString("order_item_id"));
            orderItem.setQuantity(rs.getInt("quantity"));
            orderItem.setSpecialRequests(rs.getString("special_requests"));
            orderItem.setItemTotal(rs.getBigDecimal("item_total"));
            
            // Create MenuItem from joined data
            MenuItem menuItem = new MenuItem();
            menuItem.setItemId(rs.getString("menu_item_id"));
            menuItem.setName(rs.getString("name"));
            menuItem.setDescription(rs.getString("description"));
            menuItem.setPrice(rs.getBigDecimal("price"));
            menuItem.setCategory(MenuCategory.valueOf(rs.getString("category")));
            menuItem.setAvailable(rs.getBoolean("is_available"));
            menuItem.setImageUrl(rs.getString("image_url"));
            menuItem.setPreparationTime(rs.getInt("preparation_time"));
            
            java.sql.Timestamp createdTimestamp = rs.getTimestamp("created_at");
            if (createdTimestamp != null) {
                menuItem.setCreatedAt(createdTimestamp.toLocalDateTime());
            }
            
            java.sql.Timestamp updatedTimestamp = rs.getTimestamp("updated_at");
            if (updatedTimestamp != null) {
                menuItem.setUpdatedAt(updatedTimestamp.toLocalDateTime());
            }
            
            orderItem.setMenuItem(menuItem);
            return orderItem;
        }
    };
    
    @Transactional
    public Order save(Order order) {
        // Save order
        LocalDateTime completedTime = order.getStatus() == OrderStatus.COMPLETED ? 
                order.getCompletedTime() : null;
        
        jdbcTemplate.update(INSERT_ORDER,
                order.getOrderId(),
                order.getCustomerId(),
                order.getStatus().name(),
                order.getSubtotal(),
                order.getTax(),
                order.getTotalAmount(),
                order.getSpecialInstructions(),
                order.getTableNumber(),
                java.sql.Timestamp.valueOf(order.getOrderTime()));
        
        // Save order items
        for (OrderItem item : order.getOrderItems()) {
            jdbcTemplate.update(INSERT_ORDER_ITEM,
                    item.getOrderItemId(),
                    order.getOrderId(),
                    item.getMenuItem().getItemId(),
                    item.getQuantity(),
                    item.getSpecialRequests(),
                    item.getItemTotal());
        }
        
        return order;
    }
    
    public Optional<Order> findById(String orderId) {
        try {
            Order order = jdbcTemplate.queryForObject(SELECT_ORDER_BY_ID, orderRowMapper, orderId);
            if (order != null) {
                // Load order items
                List<OrderItem> orderItems = jdbcTemplate.query(SELECT_ORDER_ITEMS_BY_ORDER, 
                        orderItemRowMapper, orderId);
                order.setOrderItems(orderItems);
            }
            return Optional.of(order);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    public List<Order> findAll() {
        List<Order> orders = jdbcTemplate.query(SELECT_ALL_ORDERS, orderRowMapper);
        // Load order items for each order
        for (Order order : orders) {
            List<OrderItem> orderItems = jdbcTemplate.query(SELECT_ORDER_ITEMS_BY_ORDER, 
                    orderItemRowMapper, order.getOrderId());
            order.setOrderItems(orderItems);
        }
        return orders;
    }
    
    public List<Order> findByCustomerId(String customerId) {
        try {
            List<Order> orders = jdbcTemplate.query(SELECT_ORDERS_BY_CUSTOMER, orderRowMapper, customerId);
            for (Order order : orders) {
                try {
                    List<OrderItem> orderItems = jdbcTemplate.query(SELECT_ORDER_ITEMS_BY_ORDER, 
                            orderItemRowMapper, order.getOrderId());
                    order.setOrderItems(orderItems);
                } catch (Exception e) {
                    // If order items fail to load, set empty list to prevent null pointer
                    System.err.println("Failed to load order items for order " + order.getOrderId() + ": " + e.getMessage());
                    order.setOrderItems(new java.util.ArrayList<>());
                }
            }
            return orders;
        } catch (Exception e) {
            System.err.println("Failed to find orders by customer ID " + customerId + ": " + e.getMessage());
            return new java.util.ArrayList<>();
        }
    }
    
    public List<Order> findByStatus(OrderStatus status) {
        List<Order> orders = jdbcTemplate.query(SELECT_ORDERS_BY_STATUS, orderRowMapper, status.name());
        for (Order order : orders) {
            List<OrderItem> orderItems = jdbcTemplate.query(SELECT_ORDER_ITEMS_BY_ORDER, 
                    orderItemRowMapper, order.getOrderId());
            order.setOrderItems(orderItems);
        }
        return orders;
    }
    
    public List<Order> findActiveOrders() {
        List<Order> orders = jdbcTemplate.query(SELECT_ACTIVE_ORDERS, orderRowMapper);
        for (Order order : orders) {
            List<OrderItem> orderItems = jdbcTemplate.query(SELECT_ORDER_ITEMS_BY_ORDER, 
                    orderItemRowMapper, order.getOrderId());
            order.setOrderItems(orderItems);
        }
        return orders;
    }
    
    public List<Order> findTodaysOrders() {
        List<Order> orders = jdbcTemplate.query(SELECT_TODAYS_ORDERS, orderRowMapper);
        for (Order order : orders) {
            List<OrderItem> orderItems = jdbcTemplate.query(SELECT_ORDER_ITEMS_BY_ORDER, 
                    orderItemRowMapper, order.getOrderId());
            order.setOrderItems(orderItems);
        }
        return orders;
    }
    
    @Transactional
    public Order addOrderItem(String orderId, OrderItem orderItem) {
        jdbcTemplate.update(INSERT_ORDER_ITEM,
                orderItem.getOrderItemId(),
                orderId,
                orderItem.getMenuItem().getItemId(),
                orderItem.getQuantity(),
                orderItem.getSpecialRequests(),
                orderItem.getItemTotal());
        
        return findById(orderId).orElse(null);
    }
    
    @Transactional
    public boolean removeOrderItem(String orderItemId) {
        int deleted = jdbcTemplate.update(DELETE_ORDER_ITEM, orderItemId);
        return deleted > 0;
    }
    
    @Transactional
    public Order update(Order order) {
        LocalDateTime completedTime = order.getStatus() == OrderStatus.COMPLETED ? 
                order.getCompletedTime() : null;
        
        int updated = jdbcTemplate.update(UPDATE_ORDER,
                order.getSubtotal(),
                order.getTax(),
                order.getTotalAmount(),
                order.getSpecialInstructions(),
                order.getOrderId());
        
        if (updated == 0) {
            throw new RuntimeException("Order not found: " + order.getOrderId());
        }
        
        // Update order items - delete existing and insert new ones
        jdbcTemplate.update("DELETE FROM order_items WHERE order_id = ?", order.getOrderId());
        
        // Insert updated order items
        for (OrderItem item : order.getOrderItems()) {
            jdbcTemplate.update(INSERT_ORDER_ITEM,
                    item.getOrderItemId(),
                    order.getOrderId(),
                    item.getMenuItem().getItemId(),
                    item.getQuantity(),
                    item.getSpecialRequests(),
                    item.getItemTotal());
        }
        
        return order;
    }
    
    public boolean updateStatus(String orderId, OrderStatus status) {
        LocalDateTime completedTime = status == OrderStatus.COMPLETED ? LocalDateTime.now() : null;
        java.sql.Timestamp completedTimestamp = completedTime != null ? 
                java.sql.Timestamp.valueOf(completedTime) : null;
        
        int updated = jdbcTemplate.update(UPDATE_ORDER_STATUS, status.name(), completedTimestamp, orderId);
        return updated > 0;
    }
    
    public int countTotal() {
        Integer count = jdbcTemplate.queryForObject(COUNT_TOTAL_ORDERS, Integer.class);
        return count != null ? count : 0;
    }
    
    public int countTodays() {
        Integer count = jdbcTemplate.queryForObject(COUNT_TODAYS_ORDERS, Integer.class);
        return count != null ? count : 0;
    }
    
    public int countCompleted() {
        Integer count = jdbcTemplate.queryForObject(COUNT_COMPLETED_ORDERS, Integer.class);
        return count != null ? count : 0;
    }
}