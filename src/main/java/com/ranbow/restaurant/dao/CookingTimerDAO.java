package com.ranbow.restaurant.dao;

import com.ranbow.restaurant.models.CookingStatus;
import com.ranbow.restaurant.models.CookingTimer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for CookingTimer entities
 * Provides database operations for cooking timer management
 */
@Repository
public class CookingTimerDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<CookingTimer> cookingTimerRowMapper = new CookingTimerRowMapper();

    /**
     * Save a new cooking timer
     * @param timer CookingTimer to save
     * @return Saved timer ID
     */
    public String save(CookingTimer timer) {
        String sql = """
            INSERT INTO cooking_timers (
                timer_id, order_id, staff_id, assignment_id, start_time, pause_time, resume_time, 
                end_time, estimated_end_time, estimated_duration_seconds, actual_duration_seconds, 
                paused_duration_seconds, status, stage, workstation_type, workstation_id, 
                alerts_sent, notes, temperature_target, quality_score, created_at, updated_at, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::cooking_status, ?::cooking_stage, 
                     ?::workstation_type, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        jdbcTemplate.update(sql,
                timer.getTimerId(),
                timer.getOrder() != null ? timer.getOrder().getOrderId() : null,
                timer.getChef() != null ? timer.getChef().getStaffId() : null,
                timer.getAssignment() != null ? timer.getAssignment().getAssignmentId() : null,
                timer.getStartTime(),
                timer.getPauseTime(),
                timer.getResumeTime(),
                timer.getEndTime(),
                timer.getEstimatedEndTime(),
                timer.getEstimatedDurationSeconds(),
                timer.getActualDurationSeconds(),
                timer.getPausedDurationSeconds(),
                timer.getStatus().name(),
                timer.getStage() != null ? timer.getStage().name() : null,
                timer.getWorkstationType() != null ? timer.getWorkstationType().name() : null,
                timer.getWorkstationId(),
                timer.getAlertsSent(),
                timer.getNotes(),
                timer.getTemperatureTarget(),
                timer.getQualityScore(),
                timer.getCreatedAt(),
                timer.getUpdatedAt(),
                timer.getVersion()
        );

        return timer.getTimerId();
    }

    /**
     * Update an existing cooking timer
     * @param timer CookingTimer to update
     * @return Number of affected rows
     */
    public int update(CookingTimer timer) {
        String sql = """
            UPDATE cooking_timers SET 
                start_time = ?, pause_time = ?, resume_time = ?, end_time = ?, 
                estimated_end_time = ?, estimated_duration_seconds = ?, actual_duration_seconds = ?, 
                paused_duration_seconds = ?, status = ?::cooking_status, stage = ?::cooking_stage, 
                workstation_type = ?::workstation_type, workstation_id = ?, alerts_sent = ?, 
                notes = ?, temperature_target = ?, quality_score = ?, updated_at = ?, version = version + 1
            WHERE timer_id = ? AND version = ?
        """;

        return jdbcTemplate.update(sql,
                timer.getStartTime(),
                timer.getPauseTime(),
                timer.getResumeTime(),
                timer.getEndTime(),
                timer.getEstimatedEndTime(),
                timer.getEstimatedDurationSeconds(),
                timer.getActualDurationSeconds(),
                timer.getPausedDurationSeconds(),
                timer.getStatus().name(),
                timer.getStage() != null ? timer.getStage().name() : null,
                timer.getWorkstationType() != null ? timer.getWorkstationType().name() : null,
                timer.getWorkstationId(),
                timer.getAlertsSent(),
                timer.getNotes(),
                timer.getTemperatureTarget(),
                timer.getQualityScore(),
                LocalDateTime.now(),
                timer.getTimerId(),
                timer.getVersion()
        );
    }

    /**
     * Find cooking timer by ID
     * @param timerId Timer ID
     * @return Optional CookingTimer
     */
    public Optional<CookingTimer> findById(String timerId) {
        String sql = """
            SELECT ct.*, o.customer_id, o.total_amount, o.table_number, o.special_instructions, 
                   o.order_time, o.completed_time, o.status as order_status
            FROM cooking_timers ct
            LEFT JOIN orders o ON ct.order_id = o.order_id
            WHERE ct.timer_id = ?
        """;

        try {
            CookingTimer timer = jdbcTemplate.queryForObject(sql, cookingTimerRowMapper, timerId);
            return Optional.ofNullable(timer);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Find cooking timer by order ID
     * @param orderId Order ID
     * @return Optional CookingTimer
     */
    public Optional<CookingTimer> findByOrderId(String orderId) {
        String sql = """
            SELECT ct.*, o.customer_id, o.total_amount, o.table_number, o.special_instructions, 
                   o.order_time, o.completed_time, o.status as order_status
            FROM cooking_timers ct
            LEFT JOIN orders o ON ct.order_id = o.order_id
            WHERE ct.order_id = ? AND ct.status NOT IN ('COMPLETED', 'CANCELLED')
            ORDER BY ct.created_at DESC
            LIMIT 1
        """;

        try {
            CookingTimer timer = jdbcTemplate.queryForObject(sql, cookingTimerRowMapper, orderId);
            return Optional.ofNullable(timer);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Find all active cooking timers
     * @return List of active timers
     */
    public List<CookingTimer> findActiveTimers() {
        String sql = """
            SELECT ct.*, o.customer_id, o.total_amount, o.table_number, o.special_instructions, 
                   o.order_time, o.completed_time, o.status as order_status
            FROM cooking_timers ct
            LEFT JOIN orders o ON ct.order_id = o.order_id
            WHERE ct.status IN ('RUNNING', 'PAUSED', 'OVERDUE')
            ORDER BY ct.start_time ASC
        """;

        return jdbcTemplate.query(sql, cookingTimerRowMapper);
    }

    /**
     * Find overdue cooking timers
     * @return List of overdue timers
     */
    public List<CookingTimer> findOverdueTimers() {
        String sql = """
            SELECT ct.*, o.customer_id, o.total_amount, o.table_number, o.special_instructions, 
                   o.order_time, o.completed_time, o.status as order_status
            FROM cooking_timers ct
            LEFT JOIN orders o ON ct.order_id = o.order_id
            WHERE (ct.status IN ('RUNNING', 'PAUSED') AND ct.estimated_end_time < NOW())
               OR ct.status = 'OVERDUE'
            ORDER BY ct.estimated_end_time ASC
        """;

        return jdbcTemplate.query(sql, cookingTimerRowMapper);
    }

    /**
     * Find cooking timers by staff ID
     * @param staffId Staff ID
     * @return List of timers assigned to staff
     */
    public List<CookingTimer> findByStaffId(String staffId) {
        String sql = """
            SELECT ct.*, o.customer_id, o.total_amount, o.table_number, o.special_instructions, 
                   o.order_time, o.completed_time, o.status as order_status
            FROM cooking_timers ct
            LEFT JOIN orders o ON ct.order_id = o.order_id
            WHERE ct.staff_id = ? AND ct.status NOT IN ('COMPLETED', 'CANCELLED')
            ORDER BY ct.start_time ASC
        """;

        return jdbcTemplate.query(sql, cookingTimerRowMapper, staffId);
    }

    /**
     * Find cooking timers by workstation
     * @param workstationId Workstation ID
     * @return List of timers at workstation
     */
    public List<CookingTimer> findByWorkstation(String workstationId) {
        String sql = """
            SELECT ct.*, o.customer_id, o.total_amount, o.table_number, o.special_instructions, 
                   o.order_time, o.completed_time, o.status as order_status
            FROM cooking_timers ct
            LEFT JOIN orders o ON ct.order_id = o.order_id
            WHERE ct.workstation_id = ? AND ct.status NOT IN ('COMPLETED', 'CANCELLED')
            ORDER BY ct.start_time ASC
        """;

        return jdbcTemplate.query(sql, cookingTimerRowMapper, workstationId);
    }

    /**
     * Find completed timers by dish type for analytics
     * @param dishType Dish type or category
     * @return List of completed timers for dish type
     */
    public List<CookingTimer> findCompletedByDishType(String dishType) {
        String sql = """
            SELECT ct.*, o.customer_id, o.total_amount, o.table_number, o.special_instructions, 
                   o.order_time, o.completed_time, o.status as order_status
            FROM cooking_timers ct
            LEFT JOIN orders o ON ct.order_id = o.order_id
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN menu_items mi ON oi.menu_item_id = mi.menu_item_id
            WHERE ct.status = 'COMPLETED' 
              AND ct.actual_duration_seconds IS NOT NULL
              AND mi.category = ?
            ORDER BY ct.end_time DESC
            LIMIT 100
        """;

        return jdbcTemplate.query(sql, cookingTimerRowMapper, dishType);
    }

    /**
     * Find timers by date range
     * @param startDate Start date
     * @param endDate End date
     * @return List of timers in date range
     */
    public List<CookingTimer> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT ct.*, o.customer_id, o.total_amount, o.table_number, o.special_instructions, 
                   o.order_time, o.completed_time, o.status as order_status
            FROM cooking_timers ct
            LEFT JOIN orders o ON ct.order_id = o.order_id
            WHERE ct.created_at BETWEEN ? AND ?
            ORDER BY ct.created_at DESC
        """;

        return jdbcTemplate.query(sql, cookingTimerRowMapper, startDate, endDate);
    }

    /**
     * Count active timers by workstation
     * @return List of workstation timer counts
     */
    public List<WorkstationTimerCount> countActiveTimersByWorkstation() {
        String sql = """
            SELECT workstation_id, workstation_type, COUNT(*) as timer_count
            FROM cooking_timers
            WHERE status IN ('RUNNING', 'PAUSED', 'OVERDUE')
            GROUP BY workstation_id, workstation_type
            ORDER BY timer_count DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new WorkstationTimerCount(
                rs.getString("workstation_id"),
                rs.getString("workstation_type"),
                rs.getInt("timer_count")
        ));
    }

    /**
     * Get cooking performance metrics
     * @param days Number of days to analyze
     * @return Performance metrics
     */
    public CookingPerformanceMetrics getPerformanceMetrics(int days) {
        String sql = """
            SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_orders,
                COUNT(CASE WHEN actual_duration_seconds <= estimated_duration_seconds THEN 1 END) as on_time_orders,
                AVG(actual_duration_seconds) as avg_cooking_time,
                AVG(CASE WHEN actual_duration_seconds IS NOT NULL AND estimated_duration_seconds IS NOT NULL 
                         THEN ABS(actual_duration_seconds - estimated_duration_seconds) END) as avg_variance
            FROM cooking_timers
            WHERE created_at >= NOW() - INTERVAL ? DAY
              AND status IN ('COMPLETED', 'CANCELLED')
        """;

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new CookingPerformanceMetrics(
                rs.getInt("total_orders"),
                rs.getInt("completed_orders"),
                rs.getInt("on_time_orders"),
                rs.getDouble("avg_cooking_time"),
                rs.getDouble("avg_variance")
        ), days);
    }

    /**
     * Delete old completed timers (cleanup)
     * @param beforeDate Delete timers created before this date
     * @return Number of deleted records
     */
    public int deleteOldCompletedTimers(LocalDateTime beforeDate) {
        String sql = """
            DELETE FROM cooking_timers 
            WHERE status IN ('COMPLETED', 'CANCELLED') 
              AND created_at < ?
        """;

        return jdbcTemplate.update(sql, beforeDate);
    }

    // Row mapper for CookingTimer
    private static class CookingTimerRowMapper implements RowMapper<CookingTimer> {
        @Override
        public CookingTimer mapRow(ResultSet rs, int rowNum) throws SQLException {
            CookingTimer timer = new CookingTimer();

            timer.setTimerId(rs.getString("timer_id"));
            timer.setStartTime(rs.getTimestamp("start_time") != null ? rs.getTimestamp("start_time").toLocalDateTime() : null);
            timer.setPauseTime(rs.getTimestamp("pause_time") != null ? rs.getTimestamp("pause_time").toLocalDateTime() : null);
            timer.setResumeTime(rs.getTimestamp("resume_time") != null ? rs.getTimestamp("resume_time").toLocalDateTime() : null);
            timer.setEndTime(rs.getTimestamp("end_time") != null ? rs.getTimestamp("end_time").toLocalDateTime() : null);
            timer.setEstimatedEndTime(rs.getTimestamp("estimated_end_time") != null ? rs.getTimestamp("estimated_end_time").toLocalDateTime() : null);
            timer.setEstimatedDurationSeconds(rs.getObject("estimated_duration_seconds", Integer.class));
            timer.setActualDurationSeconds(rs.getObject("actual_duration_seconds", Integer.class));
            timer.setPausedDurationSeconds(rs.getInt("paused_duration_seconds"));
            timer.setStatus(CookingStatus.valueOf(rs.getString("status")));
            
            String stage = rs.getString("stage");
            if (stage != null) {
                timer.setStage(com.ranbow.restaurant.models.CookingStage.valueOf(stage));
            }
            
            String workstationType = rs.getString("workstation_type");
            if (workstationType != null) {
                timer.setWorkstationType(com.ranbow.restaurant.models.WorkstationType.valueOf(workstationType));
            }
            
            timer.setWorkstationId(rs.getString("workstation_id"));
            timer.setAlertsSent(rs.getInt("alerts_sent"));
            timer.setNotes(rs.getString("notes"));
            timer.setTemperatureTarget(rs.getObject("temperature_target", Double.class));
            timer.setQualityScore(rs.getObject("quality_score", Double.class));
            timer.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            timer.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
            timer.setVersion(rs.getLong("version"));

            return timer;
        }
    }

    // Helper classes for query results
    public static class WorkstationTimerCount {
        private String workstationId;
        private String workstationType;
        private int timerCount;

        public WorkstationTimerCount(String workstationId, String workstationType, int timerCount) {
            this.workstationId = workstationId;
            this.workstationType = workstationType;
            this.timerCount = timerCount;
        }

        // Getters
        public String getWorkstationId() { return workstationId; }
        public String getWorkstationType() { return workstationType; }
        public int getTimerCount() { return timerCount; }
    }

    public static class CookingPerformanceMetrics {
        private int totalOrders;
        private int completedOrders;
        private int onTimeOrders;
        private double avgCookingTimeSeconds;
        private double avgVarianceSeconds;

        public CookingPerformanceMetrics(int totalOrders, int completedOrders, int onTimeOrders, 
                                       double avgCookingTimeSeconds, double avgVarianceSeconds) {
            this.totalOrders = totalOrders;
            this.completedOrders = completedOrders;
            this.onTimeOrders = onTimeOrders;
            this.avgCookingTimeSeconds = avgCookingTimeSeconds;
            this.avgVarianceSeconds = avgVarianceSeconds;
        }

        // Getters
        public int getTotalOrders() { return totalOrders; }
        public int getCompletedOrders() { return completedOrders; }
        public int getOnTimeOrders() { return onTimeOrders; }
        public double getAvgCookingTimeSeconds() { return avgCookingTimeSeconds; }
        public double getAvgVarianceSeconds() { return avgVarianceSeconds; }
        
        public double getCompletionRate() {
            return totalOrders > 0 ? (double) completedOrders / totalOrders * 100 : 0;
        }
        
        public double getOnTimeRate() {
            return completedOrders > 0 ? (double) onTimeOrders / completedOrders * 100 : 0;
        }
    }
}