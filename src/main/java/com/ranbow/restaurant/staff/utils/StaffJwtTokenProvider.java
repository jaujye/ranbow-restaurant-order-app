package com.ranbow.restaurant.staff.utils;

import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.model.entity.StaffPermission;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * JWT Token Provider for Staff Authentication
 * Handles JWT token generation, validation, and parsing for staff members
 */
@Component
public class StaffJwtTokenProvider {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffJwtTokenProvider.class);
    
    @Value("${staff.jwt.secret:StaffJwtSecretKey2024RanbowRestaurantStaffManagementSystem}")
    private String jwtSecret;
    
    @Value("${staff.jwt.expiration:3600000}") // 1 hour in milliseconds
    private long jwtExpirationMs;
    
    @Value("${staff.jwt.refresh-expiration:86400000}") // 24 hours in milliseconds
    private long refreshTokenExpirationMs;
    
    @Value("${staff.jwt.issuer:ranbow-restaurant-staff}")
    private String jwtIssuer;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    /**
     * Generate JWT token for staff member
     */
    public String generateToken(StaffMember staffMember) {
        return generateToken(staffMember, jwtExpirationMs);
    }
    
    /**
     * Generate refresh token for staff member
     */
    public String generateRefreshToken(StaffMember staffMember) {
        return generateToken(staffMember, refreshTokenExpirationMs);
    }
    
    /**
     * Generate JWT token with custom expiration
     */
    private String generateToken(StaffMember staffMember, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);
        
        Map<String, Object> claims = createClaims(staffMember);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(staffMember.getStaffId())
                .setIssuer(jwtIssuer)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * Create claims for JWT token
     */
    private Map<String, Object> createClaims(StaffMember staffMember) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("staffId", staffMember.getStaffId());
        claims.put("employeeNumber", staffMember.getEmployeeNumber());
        claims.put("fullName", staffMember.getFullName());
        claims.put("role", staffMember.getRole().name());
        
        // Add permissions as a list of strings
        if (staffMember.getPermissions() != null) {
            Set<String> permissions = staffMember.getPermissions().stream()
                    .map(StaffPermission::name)
                    .collect(Collectors.toSet());
            claims.put("permissions", permissions);
        }
        
        // Add device information if available
        if (staffMember.getCurrentDeviceId() != null) {
            claims.put("deviceId", staffMember.getCurrentDeviceId());
        }
        
        // Add timestamp for security
        claims.put("loginTime", System.currentTimeMillis());
        
        return claims;
    }
    
    /**
     * Get staff ID from JWT token
     */
    public String getStaffIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getSubject();
    }
    
    /**
     * Get employee number from JWT token
     */
    public String getEmployeeNumberFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("employeeNumber", String.class);
    }
    
    /**
     * Get staff role from JWT token
     */
    public String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("role", String.class);
    }
    
    /**
     * Get permissions from JWT token
     */
    @SuppressWarnings("unchecked")
    public Set<String> getPermissionsFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return (Set<String>) claims.get("permissions");
    }
    
    /**
     * Get device ID from JWT token
     */
    public String getDeviceIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("deviceId", String.class);
    }
    
    /**
     * Get token expiration date
     */
    public LocalDateTime getExpirationFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return LocalDateTime.ofInstant(claims.getExpiration().toInstant(), ZoneId.systemDefault());
    }
    
    /**
     * Get login time from JWT token
     */
    public LocalDateTime getLoginTimeFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        Long loginTime = claims.get("loginTime", Long.class);
        if (loginTime != null) {
            return LocalDateTime.ofInstant(new Date(loginTime).toInstant(), ZoneId.systemDefault());
        }
        return null;
    }
    
    /**
     * Get all claims from JWT token
     */
    private Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Failed to parse JWT token: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid JWT token", e);
        }
    }
    
    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            logger.debug("JWT token is expired: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            logger.debug("JWT token is unsupported: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            logger.debug("JWT token is malformed: {}", e.getMessage());
            return false;
        } catch (SignatureException e) {
            logger.debug("JWT token signature validation failed: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            logger.debug("JWT token compact of handler are invalid: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
    
    /**
     * Check if token is about to expire (within 5 minutes)
     */
    public boolean isTokenAboutToExpire(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            Date expiration = claims.getExpiration();
            Date fiveMinutesFromNow = new Date(System.currentTimeMillis() + 5 * 60 * 1000);
            return expiration.before(fiveMinutesFromNow);
        } catch (Exception e) {
            return true;
        }
    }
    
    /**
     * Refresh JWT token
     */
    public String refreshToken(String token, StaffMember staffMember) {
        if (validateToken(token) && !isTokenExpired(token)) {
            return generateToken(staffMember);
        }
        throw new IllegalArgumentException("Cannot refresh invalid or expired token");
    }
    
    /**
     * Create a new token with updated permissions
     */
    public String updateTokenPermissions(String token, StaffMember updatedStaffMember) {
        if (validateToken(token)) {
            return generateToken(updatedStaffMember);
        }
        throw new IllegalArgumentException("Cannot update permissions for invalid token");
    }
    
    /**
     * Extract token from Authorization header
     */
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    /**
     * Create device-specific token (includes device binding)
     */
    public String generateDeviceToken(StaffMember staffMember, String deviceId) {
        // Update staff member's device ID temporarily for token generation
        String originalDeviceId = staffMember.getCurrentDeviceId();
        staffMember.setCurrentDeviceId(deviceId);
        
        try {
            return generateToken(staffMember);
        } finally {
            // Restore original device ID
            staffMember.setCurrentDeviceId(originalDeviceId);
        }
    }
    
    /**
     * Validate device binding in token
     */
    public boolean validateDeviceBinding(String token, String requestDeviceId) {
        try {
            String tokenDeviceId = getDeviceIdFromToken(token);
            return tokenDeviceId != null && tokenDeviceId.equals(requestDeviceId);
        } catch (Exception e) {
            logger.debug("Failed to validate device binding: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get remaining token lifetime in milliseconds
     */
    public long getRemainingTokenLifetime(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            long expirationTime = claims.getExpiration().getTime();
            long currentTime = System.currentTimeMillis();
            return Math.max(0, expirationTime - currentTime);
        } catch (Exception e) {
            return 0;
        }
    }
    
    /**
     * Check if staff member has specific permission based on token
     */
    public boolean hasPermission(String token, StaffPermission permission) {
        try {
            Set<String> permissions = getPermissionsFromToken(token);
            return permissions != null && permissions.contains(permission.name());
        } catch (Exception e) {
            logger.debug("Failed to check permission: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Check if staff member has any of the specified permissions
     */
    public boolean hasAnyPermission(String token, StaffPermission... permissions) {
        try {
            Set<String> tokenPermissions = getPermissionsFromToken(token);
            if (tokenPermissions == null) return false;
            
            for (StaffPermission permission : permissions) {
                if (tokenPermissions.contains(permission.name())) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            logger.debug("Failed to check permissions: {}", e.getMessage());
            return false;
        }
    }
}