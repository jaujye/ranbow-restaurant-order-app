package com.ranbow.restaurant.dao;

import com.ranbow.restaurant.models.User;
import com.ranbow.restaurant.models.UserRole;
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

@Repository
public class UserDAO {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private static final String INSERT_USER = """
        INSERT INTO users (user_id, username, email, phone_number, role, created_at, is_active) 
        VALUES (?, ?, ?, ?, ?::user_role, ?, ?)
        """;
    
    private static final String SELECT_USER_BY_ID = """
        SELECT user_id, username, email, phone_number, role, created_at, last_login_at, is_active 
        FROM users WHERE user_id = ?
        """;
    
    private static final String SELECT_USER_BY_EMAIL = """
        SELECT user_id, username, email, phone_number, role, created_at, last_login_at, is_active 
        FROM users WHERE email = ?
        """;
    
    private static final String SELECT_ALL_USERS = """
        SELECT user_id, username, email, phone_number, role, created_at, last_login_at, is_active 
        FROM users ORDER BY created_at DESC
        """;
    
    private static final String SELECT_USERS_BY_ROLE = """
        SELECT user_id, username, email, phone_number, role, created_at, last_login_at, is_active 
        FROM users WHERE role = ?::user_role ORDER BY created_at DESC
        """;
    
    private static final String UPDATE_USER = """
        UPDATE users SET username = ?, email = ?, phone_number = ?, role = ?::user_role 
        WHERE user_id = ?
        """;
    
    private static final String UPDATE_LAST_LOGIN = """
        UPDATE users SET last_login_at = ? WHERE user_id = ?
        """;
    
    private static final String UPDATE_USER_ACTIVE_STATUS = """
        UPDATE users SET is_active = ? WHERE user_id = ?
        """;
    
    private static final String COUNT_ACTIVE_USERS = """
        SELECT COUNT(*) FROM users WHERE is_active = true
        """;
    
    private static final String COUNT_CUSTOMERS = """
        SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER' AND is_active = true
        """;
    
    private final RowMapper<User> userRowMapper = new RowMapper<User>() {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User user = new User();
            user.setUserId(rs.getString("user_id"));
            user.setUsername(rs.getString("username"));
            user.setEmail(rs.getString("email"));
            user.setPhoneNumber(rs.getString("phone_number"));
            user.setRole(UserRole.valueOf(rs.getString("role")));
            
            // Handle timestamps
            java.sql.Timestamp createdTimestamp = rs.getTimestamp("created_at");
            if (createdTimestamp != null) {
                user.setCreatedAt(createdTimestamp.toLocalDateTime());
            }
            
            java.sql.Timestamp lastLoginTimestamp = rs.getTimestamp("last_login_at");
            if (lastLoginTimestamp != null) {
                user.setLastLoginAt(lastLoginTimestamp.toLocalDateTime());
            }
            
            user.setActive(rs.getBoolean("is_active"));
            return user;
        }
    };
    
    public User save(User user) {
        jdbcTemplate.update(INSERT_USER,
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().name(),
                java.sql.Timestamp.valueOf(user.getCreatedAt()),
                user.isActive());
        return user;
    }
    
    public Optional<User> findById(String userId) {
        try {
            User user = jdbcTemplate.queryForObject(SELECT_USER_BY_ID, userRowMapper, userId);
            return Optional.of(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    public Optional<User> findByEmail(String email) {
        try {
            User user = jdbcTemplate.queryForObject(SELECT_USER_BY_EMAIL, userRowMapper, email);
            return Optional.of(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
    
    public List<User> findAll() {
        return jdbcTemplate.query(SELECT_ALL_USERS, userRowMapper);
    }
    
    public List<User> findByRole(UserRole role) {
        return jdbcTemplate.query(SELECT_USERS_BY_ROLE, userRowMapper, role.name());
    }
    
    public User update(User user) {
        int updated = jdbcTemplate.update(UPDATE_USER,
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getUserId());
        
        if (updated == 0) {
            throw new RuntimeException("User not found: " + user.getUserId());
        }
        return user;
    }
    
    public void updateLastLogin(String userId, LocalDateTime lastLogin) {
        jdbcTemplate.update(UPDATE_LAST_LOGIN,
                java.sql.Timestamp.valueOf(lastLogin),
                userId);
    }
    
    public boolean updateActiveStatus(String userId, boolean isActive) {
        int updated = jdbcTemplate.update(UPDATE_USER_ACTIVE_STATUS, isActive, userId);
        return updated > 0;
    }
    
    public int countActiveUsers() {
        Integer count = jdbcTemplate.queryForObject(COUNT_ACTIVE_USERS, Integer.class);
        return count != null ? count : 0;
    }
    
    public int countCustomers() {
        Integer count = jdbcTemplate.queryForObject(COUNT_CUSTOMERS, Integer.class);
        return count != null ? count : 0;
    }
    
    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }
}