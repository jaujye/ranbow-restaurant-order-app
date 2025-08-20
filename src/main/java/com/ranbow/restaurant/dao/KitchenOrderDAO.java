package com.ranbow.restaurant.dao;

import com.ranbow.restaurant.models.KitchenOrder;
import com.ranbow.restaurant.models.KitchenStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class KitchenOrderDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String INSERT_KITCHEN_ORDER = """
        INSERT INTO kitchen_orders (
            kitchen_order_id, order_id, assigned_staff_id, start_time, 
            estimated_completion_time, actual_completion_time, estimated_cooking_minutes,
            actual_cooking_minutes, is_overtime, cooking_notes, kitchen_status,
            priority, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::kitchen_status, ?, ?, ?)
        """;

    private static final String SELECT_KITCHEN_ORDER_BY_ID = """
        SELECT kitchen_order_id, order_id, assigned_staff_id, start_time,
               estimated_completion_time, actual_completion_time, estimated_cooking_minutes,
               actual_cooking_minutes, is_overtime, cooking_notes, kitchen_status,
               priority, created_at, updated_at
        FROM kitchen_orders WHERE kitchen_order_id = ?
        """;

    private static final String SELECT_KITCHEN_ORDER_BY_ORDER_ID = """
        SELECT kitchen_order_id, order_id, assigned_staff_id, start_time,
               estimated_completion_time, actual_completion_time, estimated_cooking_minutes,
               actual_cooking_minutes, is_overtime, cooking_notes, kitchen_status,
               priority, created_at, updated_at
        FROM kitchen_orders WHERE order_id = ?
        """;

    private static final String SELECT_KITCHEN_ORDERS_BY_STATUS = """
        SELECT kitchen_order_id, order_id, assigned_staff_id, start_time,
               estimated_completion_time, actual_completion_time, estimated_cooking_minutes,
               actual_cooking_minutes, is_overtime, cooking_notes, kitchen_status,
               priority, created_at, updated_at
        FROM kitchen_orders WHERE kitchen_status = ?::kitchen_status
        ORDER BY priority DESC, created_at ASC
        """;

    private static final String SELECT_KITCHEN_ORDERS_BY_STAFF = """
        SELECT kitchen_order_id, order_id, assigned_staff_id, start_time,
               estimated_completion_time, actual_completion_time, estimated_cooking_minutes,
               actual_cooking_minutes, is_overtime, cooking_notes, kitchen_status,
               priority, created_at, updated_at
        FROM kitchen_orders WHERE assigned_staff_id = ?
        ORDER BY created_at DESC
        """;

    private static final String SELECT_ACTIVE_KITCHEN_ORDERS = """
        SELECT kitchen_order_id, order_id, assigned_staff_id, start_time,
               estimated_completion_time, actual_completion_time, estimated_cooking_minutes,
               actual_cooking_minutes, is_overtime, cooking_notes, kitchen_status,
               priority, created_at, updated_at
        FROM kitchen_orders 
        WHERE kitchen_status IN ('PREPARING', 'COOKING', 'PLATING')
        ORDER BY priority DESC, start_time ASC
        """;

    private static final String SELECT_OVERDUE_ORDERS = """
        SELECT kitchen_order_id, order_id, assigned_staff_id, start_time,
               estimated_completion_time, actual_completion_time, estimated_cooking_minutes,
               actual_cooking_minutes, is_overtime, cooking_notes, kitchen_status,
               priority, created_at, updated_at
        FROM kitchen_orders 
        WHERE estimated_completion_time < CURRENT_TIMESTAMP 
              AND kitchen_status NOT IN ('READY', 'SERVED', 'CANCELLED')
        ORDER BY estimated_completion_time ASC
        """;

    private static final String SELECT_KITCHEN_QUEUE = """
        SELECT kitchen_order_id, order_id, assigned_staff_id, start_time,
               estimated_completion_time, actual_completion_time, estimated_cooking_minutes,
               actual_cooking_minutes, is_overtime, cooking_notes, kitchen_status,
               priority, created_at, updated_at
        FROM kitchen_orders 
        WHERE kitchen_status = 'QUEUED'
        ORDER BY priority DESC, created_at ASC
        """;

    private static final String UPDATE_KITCHEN_ORDER = """
        UPDATE kitchen_orders SET
            assigned_staff_id = ?, start_time = ?, estimated_completion_time = ?,
            actual_completion_time = ?, estimated_cooking_minutes = ?,
            actual_cooking_minutes = ?, is_overtime = ?, cooking_notes = ?,
            kitchen_status = ?::kitchen_status, priority = ?, updated_at = ?
        WHERE kitchen_order_id = ?
        """;

    private static final String UPDATE_KITCHEN_STATUS = """
        UPDATE kitchen_orders SET kitchen_status = ?::kitchen_status, updated_at = ?
        WHERE kitchen_order_id = ?
        """;

    private static final String UPDATE_ASSIGNED_STAFF = """
        UPDATE kitchen_orders SET assigned_staff_id = ?, updated_at = ?
        WHERE kitchen_order_id = ?
        """;

    private static final String UPDATE_COOKING_NOTES = """
        UPDATE kitchen_orders SET cooking_notes = ?, updated_at = ?
        WHERE kitchen_order_id = ?
        """;

    private static final String UPDATE_PRIORITY = """
        UPDATE kitchen_orders SET priority = ?, updated_at = ?
        WHERE kitchen_order_id = ?
        """;

    private static final String DELETE_KITCHEN_ORDER = """
        DELETE FROM kitchen_orders WHERE kitchen_order_id = ?
        """;

    private final RowMapper<KitchenOrder> kitchenOrderRowMapper = new RowMapper<KitchenOrder>() {
        @Override
        public KitchenOrder mapRow(ResultSet rs, int rowNum) throws SQLException {
            KitchenOrder kitchenOrder = new KitchenOrder();
            kitchenOrder.setKitchenOrderId(rs.getString("kitchen_order_id"));
            kitchenOrder.setOrderId(rs.getString("order_id"));
            kitchenOrder.setAssignedStaffId(rs.getString("assigned_staff_id"));
            kitchenOrder.setEstimatedCookingMinutes(rs.getInt("estimated_cooking_minutes"));
            kitchenOrder.setActualCookingMinutes(rs.getInt("actual_cooking_minutes"));
            kitchenOrder.setOvertime(rs.getBoolean("is_overtime"));
            kitchenOrder.setCookingNotes(rs.getString("cooking_notes"));
            kitchenOrder.setKitchenStatus(KitchenStatus.valueOf(rs.getString("kitchen_status")));
            kitchenOrder.setPriority(rs.getInt("priority"));

            // Handle nullable timestamps
            Timestamp startTimestamp = rs.getTimestamp("start_time");
            if (startTimestamp != null) {
                kitchenOrder.setStartTime(startTimestamp.toLocalDateTime());
            }

            Timestamp estimatedTimestamp = rs.getTimestamp("estimated_completion_time");
            if (estimatedTimestamp != null) {
                kitchenOrder.setEstimatedCompletionTime(estimatedTimestamp.toLocalDateTime());
            }

            Timestamp actualTimestamp = rs.getTimestamp("actual_completion_time");
            if (actualTimestamp != null) {
                kitchenOrder.setActualCompletionTime(actualTimestamp.toLocalDateTime());
            }

            Timestamp createdTimestamp = rs.getTimestamp("created_at");
            if (createdTimestamp != null) {
                kitchenOrder.setCreatedAt(createdTimestamp.toLocalDateTime());
            }

            Timestamp updatedTimestamp = rs.getTimestamp("updated_at");
            if (updatedTimestamp != null) {
                kitchenOrder.setUpdatedAt(updatedTimestamp.toLocalDateTime());
            }

            return kitchenOrder;
        }
    };

    public KitchenOrder save(KitchenOrder kitchenOrder) {
        jdbcTemplate.update(INSERT_KITCHEN_ORDER,
                kitchenOrder.getKitchenOrderId(),
                kitchenOrder.getOrderId(),
                kitchenOrder.getAssignedStaffId(),
                kitchenOrder.getStartTime() != null ? Timestamp.valueOf(kitchenOrder.getStartTime()) : null,
                kitchenOrder.getEstimatedCompletionTime() != null ? 
                    Timestamp.valueOf(kitchenOrder.getEstimatedCompletionTime()) : null,
                kitchenOrder.getActualCompletionTime() != null ? 
                    Timestamp.valueOf(kitchenOrder.getActualCompletionTime()) : null,
                kitchenOrder.getEstimatedCookingMinutes(),
                kitchenOrder.getActualCookingMinutes(),
                kitchenOrder.isOvertime(),
                kitchenOrder.getCookingNotes(),
                kitchenOrder.getKitchenStatus().name(),
                kitchenOrder.getPriority(),
                Timestamp.valueOf(kitchenOrder.getCreatedAt()),
                Timestamp.valueOf(kitchenOrder.getUpdatedAt()));
        return kitchenOrder;
    }

    public Optional<KitchenOrder> findById(String kitchenOrderId) {
        try {
            KitchenOrder kitchenOrder = jdbcTemplate.queryForObject(SELECT_KITCHEN_ORDER_BY_ID, 
                    kitchenOrderRowMapper, kitchenOrderId);
            return Optional.of(kitchenOrder);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<KitchenOrder> findByOrderId(String orderId) {
        try {
            KitchenOrder kitchenOrder = jdbcTemplate.queryForObject(SELECT_KITCHEN_ORDER_BY_ORDER_ID, 
                    kitchenOrderRowMapper, orderId);
            return Optional.of(kitchenOrder);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<KitchenOrder> findByStatus(KitchenStatus status) {
        return jdbcTemplate.query(SELECT_KITCHEN_ORDERS_BY_STATUS, 
                kitchenOrderRowMapper, status.name());
    }

    public List<KitchenOrder> findByStaffId(String staffId) {
        return jdbcTemplate.query(SELECT_KITCHEN_ORDERS_BY_STAFF, kitchenOrderRowMapper, staffId);
    }

    public List<KitchenOrder> findActiveOrders() {
        return jdbcTemplate.query(SELECT_ACTIVE_KITCHEN_ORDERS, kitchenOrderRowMapper);
    }

    public List<KitchenOrder> findOverdueOrders() {
        return jdbcTemplate.query(SELECT_OVERDUE_ORDERS, kitchenOrderRowMapper);
    }

    public List<KitchenOrder> getKitchenQueue() {
        return jdbcTemplate.query(SELECT_KITCHEN_QUEUE, kitchenOrderRowMapper);
    }

    public KitchenOrder update(KitchenOrder kitchenOrder) {
        kitchenOrder.setUpdatedAt(LocalDateTime.now());
        
        int updated = jdbcTemplate.update(UPDATE_KITCHEN_ORDER,
                kitchenOrder.getAssignedStaffId(),
                kitchenOrder.getStartTime() != null ? Timestamp.valueOf(kitchenOrder.getStartTime()) : null,
                kitchenOrder.getEstimatedCompletionTime() != null ? 
                    Timestamp.valueOf(kitchenOrder.getEstimatedCompletionTime()) : null,
                kitchenOrder.getActualCompletionTime() != null ? 
                    Timestamp.valueOf(kitchenOrder.getActualCompletionTime()) : null,
                kitchenOrder.getEstimatedCookingMinutes(),
                kitchenOrder.getActualCookingMinutes(),
                kitchenOrder.isOvertime(),
                kitchenOrder.getCookingNotes(),
                kitchenOrder.getKitchenStatus().name(),
                kitchenOrder.getPriority(),
                Timestamp.valueOf(kitchenOrder.getUpdatedAt()),
                kitchenOrder.getKitchenOrderId());

        if (updated == 0) {
            throw new RuntimeException("Kitchen order not found: " + kitchenOrder.getKitchenOrderId());
        }
        return kitchenOrder;
    }

    public boolean updateStatus(String kitchenOrderId, KitchenStatus status) {
        int updated = jdbcTemplate.update(UPDATE_KITCHEN_STATUS,
                status.name(),
                Timestamp.valueOf(LocalDateTime.now()),
                kitchenOrderId);
        return updated > 0;
    }

    public boolean updateAssignedStaff(String kitchenOrderId, String staffId) {
        int updated = jdbcTemplate.update(UPDATE_ASSIGNED_STAFF,
                staffId,
                Timestamp.valueOf(LocalDateTime.now()),
                kitchenOrderId);
        return updated > 0;
    }

    public boolean updateCookingNotes(String kitchenOrderId, String notes) {
        int updated = jdbcTemplate.update(UPDATE_COOKING_NOTES,
                notes,
                Timestamp.valueOf(LocalDateTime.now()),
                kitchenOrderId);
        return updated > 0;
    }

    public boolean updatePriority(String kitchenOrderId, int priority) {
        int updated = jdbcTemplate.update(UPDATE_PRIORITY,
                Math.max(1, Math.min(10, priority)), // Clamp between 1 and 10
                Timestamp.valueOf(LocalDateTime.now()),
                kitchenOrderId);
        return updated > 0;
    }

    public boolean deleteById(String kitchenOrderId) {
        int deleted = jdbcTemplate.update(DELETE_KITCHEN_ORDER, kitchenOrderId);
        return deleted > 0;
    }
}