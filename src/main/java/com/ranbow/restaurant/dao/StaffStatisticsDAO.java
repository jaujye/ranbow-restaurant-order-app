package com.ranbow.restaurant.dao;

import com.ranbow.restaurant.models.StaffStatistics;
import com.ranbow.restaurant.models.StatisticsPeriod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class StaffStatisticsDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String INSERT_STATISTICS = """
        INSERT INTO staff_statistics (
            statistics_id, staff_id, date, period, orders_processed, orders_completed,
            orders_cancelled, average_processing_time_minutes, overtime_orders,
            efficiency_rating, working_minutes, active_minutes, break_minutes,
            customer_compliments, customer_complaints, customer_satisfaction_rating,
            total_revenue, average_order_value, created_at, updated_at
        ) VALUES (?, ?, ?, ?::statistics_period, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

    private static final String SELECT_STATISTICS_BY_ID = """
        SELECT statistics_id, staff_id, date, period, orders_processed, orders_completed,
               orders_cancelled, average_processing_time_minutes, overtime_orders,
               efficiency_rating, working_minutes, active_minutes, break_minutes,
               customer_compliments, customer_complaints, customer_satisfaction_rating,
               total_revenue, average_order_value, created_at, updated_at
        FROM staff_statistics WHERE statistics_id = ?
        """;

    private static final String SELECT_STATISTICS_BY_STAFF_AND_DATE = """
        SELECT statistics_id, staff_id, date, period, orders_processed, orders_completed,
               orders_cancelled, average_processing_time_minutes, overtime_orders,
               efficiency_rating, working_minutes, active_minutes, break_minutes,
               customer_compliments, customer_complaints, customer_satisfaction_rating,
               total_revenue, average_order_value, created_at, updated_at
        FROM staff_statistics WHERE staff_id = ? AND date = ? AND period = ?::statistics_period
        """;

    private static final String SELECT_STATISTICS_BY_STAFF_AND_PERIOD = """
        SELECT statistics_id, staff_id, date, period, orders_processed, orders_completed,
               orders_cancelled, average_processing_time_minutes, overtime_orders,
               efficiency_rating, working_minutes, active_minutes, break_minutes,
               customer_compliments, customer_complaints, customer_satisfaction_rating,
               total_revenue, average_order_value, created_at, updated_at
        FROM staff_statistics WHERE staff_id = ? AND period = ?::statistics_period
        ORDER BY date DESC
        """;

    private static final String SELECT_DAILY_STATISTICS_BY_STAFF = """
        SELECT statistics_id, staff_id, date, period, orders_processed, orders_completed,
               orders_cancelled, average_processing_time_minutes, overtime_orders,
               efficiency_rating, working_minutes, active_minutes, break_minutes,
               customer_compliments, customer_complaints, customer_satisfaction_rating,
               total_revenue, average_order_value, created_at, updated_at
        FROM staff_statistics WHERE staff_id = ? AND period = 'DAILY'
        ORDER BY date DESC LIMIT ?
        """;

    private static final String SELECT_TOP_PERFORMERS = """
        SELECT statistics_id, staff_id, date, period, orders_processed, orders_completed,
               orders_cancelled, average_processing_time_minutes, overtime_orders,
               efficiency_rating, working_minutes, active_minutes, break_minutes,
               customer_compliments, customer_complaints, customer_satisfaction_rating,
               total_revenue, average_order_value, created_at, updated_at
        FROM staff_statistics 
        WHERE period = ?::statistics_period AND date >= ? 
        ORDER BY efficiency_rating DESC, orders_completed DESC LIMIT ?
        """;

    private static final String UPDATE_STATISTICS = """
        UPDATE staff_statistics SET
            orders_processed = ?, orders_completed = ?, orders_cancelled = ?,
            average_processing_time_minutes = ?, overtime_orders = ?, efficiency_rating = ?,
            working_minutes = ?, active_minutes = ?, break_minutes = ?,
            customer_compliments = ?, customer_complaints = ?, customer_satisfaction_rating = ?,
            total_revenue = ?, average_order_value = ?, updated_at = ?
        WHERE statistics_id = ?
        """;

    private static final String DELETE_OLD_STATISTICS = """
        DELETE FROM staff_statistics WHERE created_at < ?
        """;

    private final RowMapper<StaffStatistics> statisticsRowMapper = new RowMapper<StaffStatistics>() {
        @Override
        public StaffStatistics mapRow(ResultSet rs, int rowNum) throws SQLException {
            StaffStatistics stats = new StaffStatistics();
            stats.setStatisticsId(rs.getString("statistics_id"));
            stats.setStaffId(rs.getString("staff_id"));
            stats.setDate(rs.getDate("date").toLocalDate());
            stats.setPeriod(StatisticsPeriod.valueOf(rs.getString("period")));
            stats.setOrdersProcessed(rs.getInt("orders_processed"));
            stats.setOrdersCompleted(rs.getInt("orders_completed"));
            stats.setOrdersCancelled(rs.getInt("orders_cancelled"));
            stats.setAverageProcessingTimeMinutes(rs.getDouble("average_processing_time_minutes"));
            stats.setOvertimeOrders(rs.getInt("overtime_orders"));
            stats.setEfficiencyRating(rs.getDouble("efficiency_rating"));
            stats.setWorkingMinutes(rs.getInt("working_minutes"));
            stats.setActiveMinutes(rs.getInt("active_minutes"));
            stats.setBreakMinutes(rs.getInt("break_minutes"));
            stats.setCustomerCompliments(rs.getInt("customer_compliments"));
            stats.setCustomerComplaints(rs.getInt("customer_complaints"));
            stats.setCustomerSatisfactionRating(rs.getDouble("customer_satisfaction_rating"));
            stats.setTotalRevenue(rs.getDouble("total_revenue"));
            stats.setAverageOrderValue(rs.getDouble("average_order_value"));

            Timestamp createdTimestamp = rs.getTimestamp("created_at");
            if (createdTimestamp != null) {
                stats.setCreatedAt(createdTimestamp.toLocalDateTime());
            }

            Timestamp updatedTimestamp = rs.getTimestamp("updated_at");
            if (updatedTimestamp != null) {
                stats.setUpdatedAt(updatedTimestamp.toLocalDateTime());
            }

            return stats;
        }
    };

    public StaffStatistics save(StaffStatistics statistics) {
        jdbcTemplate.update(INSERT_STATISTICS,
                statistics.getStatisticsId(),
                statistics.getStaffId(),
                java.sql.Date.valueOf(statistics.getDate()),
                statistics.getPeriod().name(),
                statistics.getOrdersProcessed(),
                statistics.getOrdersCompleted(),
                statistics.getOrdersCancelled(),
                statistics.getAverageProcessingTimeMinutes(),
                statistics.getOvertimeOrders(),
                statistics.getEfficiencyRating(),
                statistics.getWorkingMinutes(),
                statistics.getActiveMinutes(),
                statistics.getBreakMinutes(),
                statistics.getCustomerCompliments(),
                statistics.getCustomerComplaints(),
                statistics.getCustomerSatisfactionRating(),
                statistics.getTotalRevenue(),
                statistics.getAverageOrderValue(),
                Timestamp.valueOf(statistics.getCreatedAt()),
                Timestamp.valueOf(statistics.getUpdatedAt()));
        return statistics;
    }

    public Optional<StaffStatistics> findById(String statisticsId) {
        try {
            StaffStatistics statistics = jdbcTemplate.queryForObject(SELECT_STATISTICS_BY_ID, 
                    statisticsRowMapper, statisticsId);
            return Optional.of(statistics);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<StaffStatistics> findByStaffAndDate(String staffId, LocalDate date, StatisticsPeriod period) {
        try {
            StaffStatistics statistics = jdbcTemplate.queryForObject(SELECT_STATISTICS_BY_STAFF_AND_DATE,
                    statisticsRowMapper, staffId, java.sql.Date.valueOf(date), period.name());
            return Optional.of(statistics);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<StaffStatistics> findByStaffAndPeriod(String staffId, StatisticsPeriod period) {
        return jdbcTemplate.query(SELECT_STATISTICS_BY_STAFF_AND_PERIOD, 
                statisticsRowMapper, staffId, period.name());
    }

    public List<StaffStatistics> findDailyStatistics(String staffId, int days) {
        return jdbcTemplate.query(SELECT_DAILY_STATISTICS_BY_STAFF, 
                statisticsRowMapper, staffId, days);
    }

    public List<StaffStatistics> findTopPerformers(StatisticsPeriod period, LocalDate startDate, int limit) {
        return jdbcTemplate.query(SELECT_TOP_PERFORMERS, 
                statisticsRowMapper, period.name(), java.sql.Date.valueOf(startDate), limit);
    }

    public StaffStatistics update(StaffStatistics statistics) {
        statistics.setUpdatedAt(LocalDateTime.now());
        
        int updated = jdbcTemplate.update(UPDATE_STATISTICS,
                statistics.getOrdersProcessed(),
                statistics.getOrdersCompleted(),
                statistics.getOrdersCancelled(),
                statistics.getAverageProcessingTimeMinutes(),
                statistics.getOvertimeOrders(),
                statistics.getEfficiencyRating(),
                statistics.getWorkingMinutes(),
                statistics.getActiveMinutes(),
                statistics.getBreakMinutes(),
                statistics.getCustomerCompliments(),
                statistics.getCustomerComplaints(),
                statistics.getCustomerSatisfactionRating(),
                statistics.getTotalRevenue(),
                statistics.getAverageOrderValue(),
                Timestamp.valueOf(statistics.getUpdatedAt()),
                statistics.getStatisticsId());

        if (updated == 0) {
            throw new RuntimeException("Statistics record not found: " + statistics.getStatisticsId());
        }
        return statistics;
    }

    public void deleteOldStatistics(LocalDateTime cutoffDate) {
        jdbcTemplate.update(DELETE_OLD_STATISTICS, Timestamp.valueOf(cutoffDate));
    }

    public StaffStatistics getOrCreateDailyStatistics(String staffId, LocalDate date) {
        Optional<StaffStatistics> existing = findByStaffAndDate(staffId, date, StatisticsPeriod.DAILY);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        StaffStatistics newStats = new StaffStatistics(staffId, date, StatisticsPeriod.DAILY);
        return save(newStats);
    }
}