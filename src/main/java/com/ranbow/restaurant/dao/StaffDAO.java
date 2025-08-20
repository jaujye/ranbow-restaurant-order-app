package com.ranbow.restaurant.dao;

import com.ranbow.restaurant.models.Staff;
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
public class StaffDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String INSERT_STAFF = """
        INSERT INTO staff (staff_id, user_id, employee_id, department, position, 
                          is_on_duty, daily_orders_processed, efficiency_rating, 
                          created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

    private static final String SELECT_STAFF_BY_ID = """
        SELECT staff_id, user_id, employee_id, department, position, is_on_duty,
               shift_start_time, shift_end_time, last_activity_time,
               daily_orders_processed, efficiency_rating, created_at, updated_at
        FROM staff WHERE staff_id = ?
        """;

    private static final String SELECT_STAFF_BY_USER_ID = """
        SELECT staff_id, user_id, employee_id, department, position, is_on_duty,
               shift_start_time, shift_end_time, last_activity_time,
               daily_orders_processed, efficiency_rating, created_at, updated_at
        FROM staff WHERE user_id = ?
        """;

    private static final String SELECT_STAFF_BY_EMPLOYEE_ID = """
        SELECT staff_id, user_id, employee_id, department, position, is_on_duty,
               shift_start_time, shift_end_time, last_activity_time,
               daily_orders_processed, efficiency_rating, created_at, updated_at
        FROM staff WHERE employee_id = ?
        """;

    private static final String SELECT_ALL_STAFF = """
        SELECT staff_id, user_id, employee_id, department, position, is_on_duty,
               shift_start_time, shift_end_time, last_activity_time,
               daily_orders_processed, efficiency_rating, created_at, updated_at
        FROM staff ORDER BY created_at DESC
        """;

    private static final String SELECT_STAFF_BY_DEPARTMENT = """
        SELECT staff_id, user_id, employee_id, department, position, is_on_duty,
               shift_start_time, shift_end_time, last_activity_time,
               daily_orders_processed, efficiency_rating, created_at, updated_at
        FROM staff WHERE department = ? ORDER BY employee_id
        """;

    private static final String SELECT_ON_DUTY_STAFF = """
        SELECT staff_id, user_id, employee_id, department, position, is_on_duty,
               shift_start_time, shift_end_time, last_activity_time,
               daily_orders_processed, efficiency_rating, created_at, updated_at
        FROM staff WHERE is_on_duty = true ORDER BY shift_start_time
        """;

    private static final String SELECT_STAFF_BY_POSITION = """
        SELECT staff_id, user_id, employee_id, department, position, is_on_duty,
               shift_start_time, shift_end_time, last_activity_time,
               daily_orders_processed, efficiency_rating, created_at, updated_at
        FROM staff WHERE position = ? ORDER BY employee_id
        """;

    private static final String UPDATE_STAFF = """
        UPDATE staff SET user_id = ?, employee_id = ?, department = ?, position = ?,
                        is_on_duty = ?, shift_start_time = ?, shift_end_time = ?,
                        last_activity_time = ?, daily_orders_processed = ?,
                        efficiency_rating = ?, updated_at = ?
        WHERE staff_id = ?
        """;

    private static final String UPDATE_STAFF_DUTY_STATUS = """
        UPDATE staff SET is_on_duty = ?, shift_start_time = ?, shift_end_time = ?,
                        last_activity_time = ?, updated_at = ?
        WHERE staff_id = ?
        """;

    private static final String UPDATE_STAFF_ACTIVITY = """
        UPDATE staff SET last_activity_time = ?, updated_at = ?
        WHERE staff_id = ?
        """;

    private static final String UPDATE_ORDERS_PROCESSED = """
        UPDATE staff SET daily_orders_processed = daily_orders_processed + 1,
                        last_activity_time = ?, updated_at = ?
        WHERE staff_id = ?
        """;

    private static final String UPDATE_EFFICIENCY_RATING = """
        UPDATE staff SET efficiency_rating = ?, updated_at = ?
        WHERE staff_id = ?
        """;

    private static final String RESET_DAILY_COUNTERS = """
        UPDATE staff SET daily_orders_processed = 0, updated_at = ?
        """;

    private final RowMapper<Staff> staffRowMapper = new RowMapper<Staff>() {
        @Override
        public Staff mapRow(ResultSet rs, int rowNum) throws SQLException {
            Staff staff = new Staff();
            staff.setStaffId(rs.getString("staff_id"));
            staff.setUserId(rs.getString("user_id"));
            staff.setEmployeeId(rs.getString("employee_id"));
            staff.setDepartment(rs.getString("department"));
            staff.setPosition(rs.getString("position"));
            staff.setOnDuty(rs.getBoolean("is_on_duty"));
            staff.setDailyOrdersProcessed(rs.getInt("daily_orders_processed"));
            staff.setEfficiencyRating(rs.getDouble("efficiency_rating"));

            // Handle nullable timestamps
            Timestamp shiftStartTimestamp = rs.getTimestamp("shift_start_time");
            if (shiftStartTimestamp != null) {
                staff.setShiftStartTime(shiftStartTimestamp.toLocalDateTime());
            }

            Timestamp shiftEndTimestamp = rs.getTimestamp("shift_end_time");
            if (shiftEndTimestamp != null) {
                staff.setShiftEndTime(shiftEndTimestamp.toLocalDateTime());
            }

            Timestamp lastActivityTimestamp = rs.getTimestamp("last_activity_time");
            if (lastActivityTimestamp != null) {
                staff.setLastActivityTime(lastActivityTimestamp.toLocalDateTime());
            }

            Timestamp createdTimestamp = rs.getTimestamp("created_at");
            if (createdTimestamp != null) {
                staff.setCreatedAt(createdTimestamp.toLocalDateTime());
            }

            Timestamp updatedTimestamp = rs.getTimestamp("updated_at");
            if (updatedTimestamp != null) {
                staff.setUpdatedAt(updatedTimestamp.toLocalDateTime());
            }

            return staff;
        }
    };

    public Staff save(Staff staff) {
        jdbcTemplate.update(INSERT_STAFF,
                staff.getStaffId(),
                staff.getUserId(),
                staff.getEmployeeId(),
                staff.getDepartment(),
                staff.getPosition(),
                staff.isOnDuty(),
                staff.getDailyOrdersProcessed(),
                staff.getEfficiencyRating(),
                Timestamp.valueOf(staff.getCreatedAt()),
                Timestamp.valueOf(staff.getUpdatedAt()));
        return staff;
    }

    public Optional<Staff> findById(String staffId) {
        try {
            Staff staff = jdbcTemplate.queryForObject(SELECT_STAFF_BY_ID, staffRowMapper, staffId);
            return Optional.of(staff);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Staff> findByUserId(String userId) {
        try {
            Staff staff = jdbcTemplate.queryForObject(SELECT_STAFF_BY_USER_ID, staffRowMapper, userId);
            return Optional.of(staff);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Staff> findByEmployeeId(String employeeId) {
        try {
            Staff staff = jdbcTemplate.queryForObject(SELECT_STAFF_BY_EMPLOYEE_ID, staffRowMapper, employeeId);
            return Optional.of(staff);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Staff> findAll() {
        return jdbcTemplate.query(SELECT_ALL_STAFF, staffRowMapper);
    }

    public List<Staff> findByDepartment(String department) {
        return jdbcTemplate.query(SELECT_STAFF_BY_DEPARTMENT, staffRowMapper, department);
    }

    public List<Staff> findOnDutyStaff() {
        return jdbcTemplate.query(SELECT_ON_DUTY_STAFF, staffRowMapper);
    }

    public List<Staff> findByPosition(String position) {
        return jdbcTemplate.query(SELECT_STAFF_BY_POSITION, staffRowMapper, position);
    }

    public Staff update(Staff staff) {
        int updated = jdbcTemplate.update(UPDATE_STAFF,
                staff.getUserId(),
                staff.getEmployeeId(),
                staff.getDepartment(),
                staff.getPosition(),
                staff.isOnDuty(),
                staff.getShiftStartTime() != null ? Timestamp.valueOf(staff.getShiftStartTime()) : null,
                staff.getShiftEndTime() != null ? Timestamp.valueOf(staff.getShiftEndTime()) : null,
                staff.getLastActivityTime() != null ? Timestamp.valueOf(staff.getLastActivityTime()) : null,
                staff.getDailyOrdersProcessed(),
                staff.getEfficiencyRating(),
                Timestamp.valueOf(staff.getUpdatedAt()),
                staff.getStaffId());

        if (updated == 0) {
            throw new RuntimeException("Staff member not found: " + staff.getStaffId());
        }
        return staff;
    }

    public boolean updateDutyStatus(String staffId, boolean isOnDuty, 
                                  LocalDateTime shiftStartTime, LocalDateTime shiftEndTime) {
        LocalDateTime now = LocalDateTime.now();
        int updated = jdbcTemplate.update(UPDATE_STAFF_DUTY_STATUS,
                isOnDuty,
                shiftStartTime != null ? Timestamp.valueOf(shiftStartTime) : null,
                shiftEndTime != null ? Timestamp.valueOf(shiftEndTime) : null,
                Timestamp.valueOf(now),
                Timestamp.valueOf(now),
                staffId);
        return updated > 0;
    }

    public boolean updateActivity(String staffId) {
        LocalDateTime now = LocalDateTime.now();
        int updated = jdbcTemplate.update(UPDATE_STAFF_ACTIVITY,
                Timestamp.valueOf(now),
                Timestamp.valueOf(now),
                staffId);
        return updated > 0;
    }

    public boolean incrementOrdersProcessed(String staffId) {
        LocalDateTime now = LocalDateTime.now();
        int updated = jdbcTemplate.update(UPDATE_ORDERS_PROCESSED,
                Timestamp.valueOf(now),
                Timestamp.valueOf(now),
                staffId);
        return updated > 0;
    }

    public boolean updateEfficiencyRating(String staffId, double rating) {
        LocalDateTime now = LocalDateTime.now();
        int updated = jdbcTemplate.update(UPDATE_EFFICIENCY_RATING,
                rating,
                Timestamp.valueOf(now),
                staffId);
        return updated > 0;
    }

    public void resetDailyCounters() {
        LocalDateTime now = LocalDateTime.now();
        jdbcTemplate.update(RESET_DAILY_COUNTERS, Timestamp.valueOf(now));
    }

    public boolean existsByEmployeeId(String employeeId) {
        return findByEmployeeId(employeeId).isPresent();
    }
}