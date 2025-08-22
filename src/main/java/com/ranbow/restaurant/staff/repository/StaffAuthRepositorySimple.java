package com.ranbow.restaurant.staff.repository;

import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.model.entity.WorkShift;
import com.ranbow.restaurant.staff.model.vo.StaffSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
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
import java.util.ArrayList;
import java.util.UUID;

/**
 * Simple Staff Authentication Repository
 * Works with existing database structure
 */
@Repository
public class StaffAuthRepositorySimple {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Find staff member by login ID (employee number or email) - using actual database schema
     */
    public Optional<StaffMember> findStaffByLoginId(String loginId) {
        String sql = """
            SELECT staff_id, employee_number, email, password_hash, pin_hash, full_name, phone_number, 
                   role, department, avatar_url, is_active, quick_switch_enabled, 
                   permissions, created_at, updated_at, last_login_at
            FROM staff_members 
            WHERE (employee_number = ? OR email = ?) AND is_active = true
            """;
        
        try {
            return Optional.of(jdbcTemplate.queryForObject(sql, new StaffMemberRowMapper(), loginId, loginId));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Find staff member by staff ID
     */
    public Optional<StaffMember> findStaffById(String staffId) {
        String sql = """
            SELECT staff_id, employee_number, email, password_hash, pin_hash, full_name, phone_number, 
                   role, department, avatar_url, is_active, quick_switch_enabled, 
                   permissions, created_at, updated_at, last_login_at
            FROM staff_members 
            WHERE staff_id = ? AND is_active = true
            """;
        
        try {
            return Optional.of(jdbcTemplate.queryForObject(sql, new StaffMemberRowMapper(), UUID.fromString(staffId)));
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
     * Get current work shift for staff - simplified version
     */
    public Optional<WorkShift> getCurrentWorkShift(String staffId) {
        // For now, create a simple mock work shift
        // In a full implementation, this would query the work_shifts table
        WorkShift mockShift = new WorkShift();
        mockShift.setShiftId("shift-" + staffId.substring(0, 8));
        mockShift.setStaffId(staffId);
        mockShift.setScheduledStartTime(LocalDateTime.now().withHour(9).withMinute(0));
        mockShift.setScheduledEndTime(LocalDateTime.now().withHour(18).withMinute(0));
        mockShift.setActualStartTime(LocalDateTime.now());
        return Optional.of(mockShift);
    }
    
    /**
     * Create or update work shift - simplified version
     */
    public WorkShift createWorkShift(String staffId) {
        return getCurrentWorkShift(staffId).orElse(null);
    }
    
    /**
     * Save staff session - simplified version using staff_sessions table
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
            return Optional.of(jdbcTemplate.queryForObject(sql, new StaffSessionRowMapper(), refreshTokenHash));
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
     * Deactivate all sessions for staff
     */
    public void deactivateAllStaffSessions(String staffId) {
        String sql = "UPDATE staff_sessions SET is_active = false WHERE staff_id = ?";
        jdbcTemplate.update(sql, UUID.fromString(staffId));
    }
    
    /**
     * Get available staff for quick switch
     */
    public List<StaffMember> getQuickSwitchAvailableStaff() {
        String sql = """
            SELECT staff_id, employee_number, email, password_hash, pin_hash, full_name, phone_number, 
                   role, department, avatar_url, is_active, quick_switch_enabled, 
                   permissions, created_at, updated_at, last_login_at
            FROM staff_members 
            WHERE is_active = true AND quick_switch_enabled = true
            ORDER BY full_name
            """;
        
        return jdbcTemplate.query(sql, new StaffMemberRowMapper());
    }
    
    /**
     * Cleanup expired sessions
     */
    public int cleanupExpiredSessions() {
        String sql = """
            UPDATE staff_sessions SET is_active = false 
            WHERE (expires_at < CURRENT_TIMESTAMP OR refresh_expires_at < CURRENT_TIMESTAMP) 
            AND is_active = true
            """;
        return jdbcTemplate.update(sql);
    }
    
    // Row Mappers - mapped to work with existing StaffMember entity
    private static class StaffMemberRowMapper implements RowMapper<StaffMember> {
        @Override
        public StaffMember mapRow(ResultSet rs, int rowNum) throws SQLException {
            StaffMemberSimple staff = new StaffMemberSimple();
            staff.setStaffId(rs.getString("staff_id"));
            staff.setEmployeeNumber(rs.getString("employee_number"));
            staff.setEmail(rs.getString("email"));
            staff.setPasswordHash(rs.getString("password_hash"));
            staff.setPinHash(rs.getString("pin_hash"));
            staff.setFullName(rs.getString("full_name")); // Map full_name to fullName
            staff.setPhoneNumber(rs.getString("phone_number")); // Map phone_number to phoneNumber
            String roleStr = rs.getString("role");
            if (roleStr != null) {
                try {
                    staff.setRole(com.ranbow.restaurant.staff.model.entity.StaffRole.valueOf(roleStr));
                } catch (IllegalArgumentException e) {
                    staff.setRole(com.ranbow.restaurant.staff.model.entity.StaffRole.SERVICE); // Default role
                }
            }
            staff.setDepartment(rs.getString("department"));
            staff.setAvatarUrl(rs.getString("avatar_url"));
            staff.setIsActive(rs.getBoolean("is_active"));
            staff.setQuickSwitchEnabled(rs.getBoolean("quick_switch_enabled"));
            
            // Handle permissions array
            Array permissionsArray = rs.getArray("permissions");
            if (permissionsArray != null) {
                String[] permissions = (String[]) permissionsArray.getArray();
                staff.setPermissionsList(Arrays.asList(permissions));
            } else {
                staff.setPermissionsList(new ArrayList<>());
            }
            
            Timestamp lastLoginAt = rs.getTimestamp("last_login_at");
            if (lastLoginAt != null) {
                staff.setLastLoginAt(lastLoginAt.toLocalDateTime());
            }
            
            return staff;
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
    
    // Extended StaffMember class for authentication with additional fields
    public static class StaffMemberSimple extends StaffMember {
        private String pinHash;
        private String department;
        private String avatarUrl;
        private boolean quickSwitchEnabled;
        private List<String> permissionsList;
        
        // Additional getters and setters for fields not in base StaffMember
        public String getPinHash() { return pinHash; }
        public void setPinHash(String pinHash) { this.pinHash = pinHash; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        
        public boolean isQuickSwitchEnabled() { return quickSwitchEnabled; }
        public void setQuickSwitchEnabled(boolean quickSwitchEnabled) { this.quickSwitchEnabled = quickSwitchEnabled; }
        
        public List<String> getPermissionsList() { return permissionsList; }
        public void setPermissionsList(List<String> permissionsList) { this.permissionsList = permissionsList; }
        
        // Convenience methods for authentication
        public boolean verifyPin(String pin) {
            if (pinHash == null) return false;
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            return encoder.matches(pin, pinHash);
        }
        
        public String getName() {
            return getFullName(); // Delegate to existing fullName field
        }
        
        public String getPhone() {
            return getPhoneNumber(); // Delegate to existing phoneNumber field
        }
        
        // For compatibility with existing patterns
        public boolean isActive() {
            return getIsActive() != null ? getIsActive() : false;
        }
    }
}