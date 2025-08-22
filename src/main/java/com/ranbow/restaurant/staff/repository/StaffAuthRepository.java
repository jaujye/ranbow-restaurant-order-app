package com.ranbow.restaurant.staff.repository;

import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.model.entity.WorkShift;
import com.ranbow.restaurant.staff.model.vo.StaffSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Staff Authentication Repository
 * Handles database operations for staff authentication
 * Implements the exact specification from STAFF_UI_DEVELOPMENT_DOC.md
 */
@Repository
public class StaffAuthRepository {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Find staff member by login ID (employee number or email)
     */
    public Optional<StaffMember> findStaffByLoginId(String loginId) {
        String sql = """
            SELECT staff_id, employee_number, email, password_hash, full_name, phone_number, 
                   role, is_active, created_at, updated_at, last_login_at
            FROM staff_members 
            WHERE (employee_number = ? OR email = ?) AND is_active = true
            """;
        
        try {
            StaffMember staff = jdbcTemplate.queryForObject(sql, new StaffMemberRowMapper(), loginId, loginId);
            return Optional.of(staff);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Find staff member by staff ID
     */
    public Optional<StaffMember> findStaffById(String staffId) {
        String sql = """
            SELECT staff_id, employee_number, email, password_hash, pin_hash, name, phone, 
                   role, department, avatar_url, is_active, quick_switch_enabled, 
                   permissions, created_at, updated_at, last_login_at
            FROM staff_members 
            WHERE staff_id = ? AND is_active = true
            """;
        
        try {
            StaffMember staff = jdbcTemplate.queryForObject(sql, new StaffMemberRowMapper(), UUID.fromString(staffId));
            return Optional.of(staff);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Verify staff PIN for quick switch
     */
    public boolean verifyStaffPin(String staffId, String pin) {
        String sql = "SELECT pin_hash FROM staff_members WHERE staff_id = ? AND is_active = true";
        
        try {
            String storedPinHash = jdbcTemplate.queryForObject(sql, String.class, UUID.fromString(staffId));
            return storedPinHash != null && passwordEncoder.matches(pin, storedPinHash);
        } catch (EmptyResultDataAccessException e) {
            return false;
        }
    }
    
    /**
     * Update staff last login time
     */
    public void updateLastLogin(String staffId) {
        String sql = "UPDATE staff_members SET last_login_at = CURRENT_TIMESTAMP WHERE staff_id = ?";
        jdbcTemplate.update(sql, UUID.fromString(staffId));
    }
    
    /**
     * Get current work shift for staff
     */
    public Optional<WorkShift> getCurrentWorkShift(String staffId) {
        String sql = """
            SELECT shift_id, staff_id, shift_date, start_time, end_time, 
                   actual_start, actual_end, break_minutes, overtime_minutes, 
                   status, created_at
            FROM work_shifts 
            WHERE staff_id = ? AND shift_date = CURRENT_DATE 
            AND status IN ('SCHEDULED', 'ACTIVE')
            ORDER BY created_at DESC LIMIT 1
            """;
        
        try {
            WorkShift shift = jdbcTemplate.queryForObject(sql, new WorkShiftRowMapper(), UUID.fromString(staffId));
            return Optional.of(shift);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Create or update work shift
     */
    public WorkShift createWorkShift(String staffId) {
        // Check if shift already exists for today
        Optional<WorkShift> existingShift = getCurrentWorkShift(staffId);
        
        if (existingShift.isPresent()) {
            // Update existing shift to active
            String updateSql = """
                UPDATE work_shifts SET actual_start = CURRENT_TIMESTAMP, status = 'ACTIVE'
                WHERE staff_id = ? AND shift_date = CURRENT_DATE
                """;
            jdbcTemplate.update(updateSql, UUID.fromString(staffId));
            return existingShift.get();
        } else {
            // Create new shift
            String insertSql = """
                INSERT INTO work_shifts (staff_id, shift_date, start_time, end_time, actual_start, status)
                VALUES (?, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 hours', CURRENT_TIMESTAMP, 'ACTIVE')
                RETURNING shift_id
                """;
            
            String shiftId = jdbcTemplate.queryForObject(insertSql, String.class, UUID.fromString(staffId));
            return getCurrentWorkShift(staffId).orElse(null);
        }
    }
    
    /**
     * Save staff session
     */
    public void saveStaffSession(String sessionId, String staffId, String accessTokenHash, 
                                String refreshTokenHash, String deviceId, String deviceType, 
                                String appVersion, String ipAddress, String userAgent,
                                LocalDateTime expiresAt, LocalDateTime refreshExpiresAt) {
        String sql = """
            INSERT INTO staff_sessions (session_id, staff_id, access_token_hash, refresh_token_hash, 
                                      device_id, device_type, app_version, ip_address, user_agent,
                                      expires_at, refresh_expires_at, is_active, created_at, last_activity_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?::inet, ?, ?, ?, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """;
        
        jdbcTemplate.update(sql, 
            UUID.fromString(sessionId), UUID.fromString(staffId), 
            accessTokenHash, refreshTokenHash, deviceId, deviceType, 
            appVersion, ipAddress, userAgent, 
            Timestamp.valueOf(expiresAt), Timestamp.valueOf(refreshExpiresAt));
    }
    
    /**
     * Find active session by refresh token hash
     */
    public Optional<StaffSession> findSessionByRefreshToken(String refreshTokenHash) {
        String sql = """
            SELECT session_id, staff_id, device_id, device_type, app_version, 
                   created_at as login_time, last_activity_at, expires_at, is_active, ip_address
            FROM staff_sessions 
            WHERE refresh_token_hash = ? AND is_active = true AND refresh_expires_at > CURRENT_TIMESTAMP
            """;
        
        try {
            StaffSession session = jdbcTemplate.queryForObject(sql, new StaffSessionRowMapper(), refreshTokenHash);
            return Optional.of(session);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Update session activity
     */
    public void updateSessionActivity(String sessionId) {
        String sql = "UPDATE staff_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE session_id = ?";
        jdbcTemplate.update(sql, UUID.fromString(sessionId));
    }
    
    /**
     * Deactivate session
     */
    public void deactivateSession(String sessionId) {
        String sql = "UPDATE staff_sessions SET is_active = false WHERE session_id = ?";
        jdbcTemplate.update(sql, UUID.fromString(sessionId));
    }
    
    /**
     * Deactivate all sessions for staff (for logout all devices)
     */
    public void deactivateAllStaffSessions(String staffId) {
        String sql = "UPDATE staff_sessions SET is_active = false WHERE staff_id = ?";
        jdbcTemplate.update(sql, UUID.fromString(staffId));
    }
    
    /**
     * Clean up expired sessions
     */
    public int cleanupExpiredSessions() {
        String sql = """
            UPDATE staff_sessions SET is_active = false 
            WHERE (expires_at < CURRENT_TIMESTAMP OR refresh_expires_at < CURRENT_TIMESTAMP) 
            AND is_active = true
            """;
        return jdbcTemplate.update(sql);
    }
    
    /**
     * Get available staff for quick switch (staff with quick_switch_enabled = true)
     */
    public List<StaffMember> getQuickSwitchAvailableStaff() {
        String sql = """
            SELECT staff_id, employee_number, email, password_hash, pin_hash, name, phone, 
                   role, department, avatar_url, is_active, quick_switch_enabled, 
                   permissions, created_at, updated_at, last_login_at
            FROM staff_members 
            WHERE is_active = true AND quick_switch_enabled = true
            ORDER BY name
            """;
        
        return jdbcTemplate.query(sql, new StaffMemberRowMapper());
    }
    
    // Custom Row Mappers
    private static class StaffMemberRowMapper implements RowMapper<StaffMember> {
        @Override
        public StaffMember mapRow(ResultSet rs, int rowNum) throws SQLException {
            StaffMember staff = new StaffMember();
            staff.setStaffId(rs.getString("staff_id"));
            staff.setEmployeeNumber(rs.getString("employee_number"));
            staff.setEmail(rs.getString("email"));
            staff.setPasswordHash(rs.getString("password_hash"));
            staff.setPinHash(rs.getString("pin_hash"));
            staff.setName(rs.getString("name"));
            staff.setPhone(rs.getString("phone"));
            staff.setRole(rs.getString("role"));
            staff.setDepartment(rs.getString("department"));
            staff.setAvatarUrl(rs.getString("avatar_url"));
            staff.setActive(rs.getBoolean("is_active"));
            staff.setQuickSwitchEnabled(rs.getBoolean("quick_switch_enabled"));
            
            // Handle permissions array
            Array permissionsArray = rs.getArray("permissions");
            if (permissionsArray != null) {
                String[] permissions = (String[]) permissionsArray.getArray();
                staff.setPermissions(Arrays.asList(permissions));
            }
            
            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                staff.setCreatedAt(createdAt.toLocalDateTime());
            }
            
            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                staff.setUpdatedAt(updatedAt.toLocalDateTime());
            }
            
            Timestamp lastLoginAt = rs.getTimestamp("last_login_at");
            if (lastLoginAt != null) {
                staff.setLastLoginAt(lastLoginAt.toLocalDateTime());
            }
            
            return staff;
        }
    }
    
    private static class WorkShiftRowMapper implements RowMapper<WorkShift> {
        @Override
        public WorkShift mapRow(ResultSet rs, int rowNum) throws SQLException {
            WorkShift shift = new WorkShift();
            shift.setShiftId(rs.getString("shift_id"));
            shift.setStaffId(rs.getString("staff_id"));
            
            Timestamp shiftDate = rs.getTimestamp("shift_date");
            if (shiftDate != null) {
                shift.setShiftDate(shiftDate.toLocalDateTime());
            }
            
            Timestamp startTime = rs.getTimestamp("start_time");
            if (startTime != null) {
                shift.setScheduledStartTime(startTime.toLocalDateTime());
            }
            
            Timestamp endTime = rs.getTimestamp("end_time");
            if (endTime != null) {
                shift.setScheduledEndTime(endTime.toLocalDateTime());
            }
            
            Timestamp actualStart = rs.getTimestamp("actual_start");
            if (actualStart != null) {
                shift.setActualStartTime(actualStart.toLocalDateTime());
            }
            
            Timestamp actualEnd = rs.getTimestamp("actual_end");
            if (actualEnd != null) {
                shift.setActualEndTime(actualEnd.toLocalDateTime());
            }
            
            shift.setBreakMinutes(rs.getInt("break_minutes"));
            shift.setOvertimeMinutes(rs.getInt("overtime_minutes"));
            // shift.setShiftStatus(ShiftStatus.valueOf(rs.getString("status")));
            
            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                shift.setCreatedAt(createdAt.toLocalDateTime());
            }
            
            return shift;
        }
    }
    
    private static class StaffSessionRowMapper implements RowMapper<StaffSession> {
        @Override
        public StaffSession mapRow(ResultSet rs, int rowNum) throws SQLException {
            StaffSession session = new StaffSession();
            session.setSessionId(rs.getString("session_id"));
            session.setStaffId(rs.getString("staff_id"));
            session.setDeviceId(rs.getString("device_id"));
            session.setDeviceType(rs.getString("device_type"));
            session.setAppVersion(rs.getString("app_version"));
            session.setIpAddress(rs.getString("ip_address"));
            session.setActive(rs.getBoolean("is_active"));
            
            Timestamp loginTime = rs.getTimestamp("login_time");
            if (loginTime != null) {
                session.setLoginTime(loginTime.toLocalDateTime());
            }
            
            Timestamp lastActivity = rs.getTimestamp("last_activity_at");
            if (lastActivity != null) {
                session.setLastActivity(lastActivity.toLocalDateTime());
            }
            
            Timestamp expiresAt = rs.getTimestamp("expires_at");
            if (expiresAt != null) {
                session.setExpiresAt(expiresAt.toLocalDateTime());
            }
            
            return session;
        }
    }
}