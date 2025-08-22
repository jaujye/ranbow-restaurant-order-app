package com.ranbow.restaurant.staff.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * JWT Token Provider for Staff Authentication
 * Implements JWT token generation, validation, and parsing according to specification
 */
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    
    @Value("${jwt.access-token.expiration:3600000}") // 1 hour default
    private long accessTokenExpiration;
    
    @Value("${jwt.refresh-token.expiration:604800000}") // 7 days default
    private long refreshTokenExpiration;
    
    @Value("${jwt.issuer:ranbow-restaurant}")
    private String issuer;

    public JwtTokenProvider(@Value("${jwt.secret:defaultSecretKeyForRanbowRestaurantStaffAuthenticationSystem}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generate access token for staff member
     */
    public String generateAccessToken(String staffId, String employeeNumber, String name, 
                                    String role, List<String> permissions, String deviceId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(staffId)
                .claim("employeeNumber", employeeNumber)
                .claim("name", name)
                .claim("role", role)
                .claim("permissions", permissions)
                .claim("deviceId", deviceId)
                .claim("tokenType", "access")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate refresh token for staff member
     */
    public String generateRefreshToken(String staffId, String deviceId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(staffId)
                .claim("deviceId", deviceId)
                .claim("tokenType", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .setId(UUID.randomUUID().toString()) // Unique token ID
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token);
            return true;
        } catch (SecurityException ex) {
            System.err.println("Invalid JWT signature: " + ex.getMessage());
        } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token: " + ex.getMessage());
        } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token: " + ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty: " + ex.getMessage());
        }
        return false;
    }

    /**
     * Get staff ID from JWT token
     */
    public String getStaffIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    /**
     * Get all claims from JWT token
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Get token expiration date
     */
    public Date getExpirationDateFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getExpiration();
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    /**
     * Get device ID from token
     */
    public String getDeviceIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("deviceId", String.class);
    }

    /**
     * Get token type (access/refresh)
     */
    public String getTokenTypeFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("tokenType", String.class);
    }

    /**
     * Get permissions from access token
     */
    @SuppressWarnings("unchecked")
    public List<String> getPermissionsFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("permissions", List.class);
    }

    /**
     * Get role from access token
     */
    public String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("role", String.class);
    }

    /**
     * Refresh access token using refresh token
     */
    public String refreshAccessToken(String refreshToken, String employeeNumber, String name, 
                                   String role, List<String> permissions) {
        if (!validateToken(refreshToken)) {
            throw new JwtException("Invalid refresh token");
        }

        Claims claims = getClaimsFromToken(refreshToken);
        String tokenType = claims.get("tokenType", String.class);
        
        if (!"refresh".equals(tokenType)) {
            throw new JwtException("Token is not a refresh token");
        }

        String staffId = claims.getSubject();
        String deviceId = claims.get("deviceId", String.class);

        return generateAccessToken(staffId, employeeNumber, name, role, permissions, deviceId);
    }

    /**
     * Generate JWT hash for database storage
     */
    public String generateTokenHash(String token) {
        // Use a simple hash for database storage (first 64 characters)
        // In production, consider using BCrypt or SHA-256
        return token.length() > 64 ? token.substring(token.length() - 64) : token;
    }

    /**
     * Get access token expiration in seconds
     */
    public long getAccessTokenExpirationInSeconds() {
        return accessTokenExpiration / 1000;
    }

    /**
     * Get refresh token expiration in seconds
     */
    public long getRefreshTokenExpirationInSeconds() {
        return refreshTokenExpiration / 1000;
    }

    /**
     * Create token response DTO
     */
    public static class TokenResponse {
        private String accessToken;
        private String refreshToken;
        private long expiresIn;
        private String tokenType = "Bearer";

        public TokenResponse(String accessToken, String refreshToken, long expiresIn) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresIn = expiresIn;
        }

        // Getters and setters
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        
        public long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
        
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    }
}