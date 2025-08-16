package com.ranbow.restaurant.services;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    // JWT密鑰 - 在生產環境中應該從配置文件或環境變量讀取
    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Token過期時間（小時）
    private final int tokenExpirationHours = 24;

    /**
     * 生成JWT Token
     * @param userId 用戶ID
     * @param sessionId Redis會話ID
     * @param deviceInfo 設備信息
     * @return JWT token字符串
     */
    public String generateToken(String userId, String sessionId, String deviceInfo) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sessionId", sessionId);
        claims.put("deviceInfo", deviceInfo);
        
        Instant now = Instant.now();
        Instant expiration = now.plus(tokenExpirationHours, ChronoUnit.HOURS);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiration))
                .signWith(secretKey)
                .compact();
    }

    /**
     * 驗證JWT Token並提取信息
     * @param token JWT token
     * @return 包含用戶信息的TokenInfo對象，如果無效則返回null
     */
    public TokenInfo validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String userId = claims.getSubject();
            String sessionId = claims.get("sessionId", String.class);
            String deviceInfo = claims.get("deviceInfo", String.class);
            Date expiration = claims.getExpiration();

            // 檢查是否過期
            if (expiration.before(new Date())) {
                return null;
            }

            return new TokenInfo(userId, sessionId, deviceInfo, expiration);
            
        } catch (JwtException | IllegalArgumentException e) {
            // Token無效
            return null;
        }
    }

    /**
     * 刷新Token - 生成新的Token但保持相同的會話ID
     * @param oldToken 舊Token
     * @return 新Token，如果舊Token無效則返回null
     */
    public String refreshToken(String oldToken) {
        TokenInfo tokenInfo = validateToken(oldToken);
        if (tokenInfo == null) {
            return null;
        }
        
        return generateToken(tokenInfo.getUserId(), tokenInfo.getSessionId(), tokenInfo.getDeviceInfo());
    }

    /**
     * 檢查Token是否即將過期（1小時內）
     * @param token JWT token
     * @return 如果即將過期返回true
     */
    public boolean isTokenExpiringSoon(String token) {
        TokenInfo tokenInfo = validateToken(token);
        if (tokenInfo == null) {
            return true;
        }
        
        Instant expiration = tokenInfo.getExpiration().toInstant();
        Instant oneHourFromNow = Instant.now().plus(1, ChronoUnit.HOURS);
        
        return expiration.isBefore(oneHourFromNow);
    }

    /**
     * Token信息封裝類
     */
    public static class TokenInfo {
        private final String userId;
        private final String sessionId;
        private final String deviceInfo;
        private final Date expiration;

        public TokenInfo(String userId, String sessionId, String deviceInfo, Date expiration) {
            this.userId = userId;
            this.sessionId = sessionId;
            this.deviceInfo = deviceInfo;
            this.expiration = expiration;
        }

        public String getUserId() { return userId; }
        public String getSessionId() { return sessionId; }
        public String getDeviceInfo() { return deviceInfo; }
        public Date getExpiration() { return expiration; }
    }
}