package com.ranbow.restaurant.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class SessionService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // 會話過期時間（分鐘）
    private final int SESSION_TIMEOUT_MINUTES = 30;
    
    // 最大會話數限制
    private final int MAX_SESSIONS_PER_USER = 5;

    /**
     * 創建新會話
     * @param userId 用戶ID
     * @param deviceInfo 設備信息
     * @param ipAddress IP地址
     * @return 會話ID
     */
    public String createSession(String userId, String deviceInfo, String ipAddress) {
        String sessionId = UUID.randomUUID().toString();
        
        // 檢查用戶會話數量限制
        cleanupExpiredSessions(userId);
        Set<Object> userSessions = redisTemplate.opsForSet().members("user:" + userId + ":sessions");
        if (userSessions != null && userSessions.size() >= MAX_SESSIONS_PER_USER) {
            // 移除最舊的會話
            removeOldestSession(userId);
        }
        
        // 創建會話數據
        SessionData sessionData = new SessionData();
        sessionData.setUserId(userId);
        sessionData.setSessionId(sessionId);
        sessionData.setDeviceInfo(deviceInfo);
        sessionData.setIpAddress(ipAddress);
        sessionData.setCreatedAt(LocalDateTime.now());
        sessionData.setLastAccess(LocalDateTime.now());
        sessionData.setActive(true);
        
        // 存儲會話數據到Redis
        String sessionKey = "session:" + sessionId;
        redisTemplate.opsForValue().set(sessionKey, sessionData, SESSION_TIMEOUT_MINUTES, TimeUnit.MINUTES);
        
        // 添加到用戶會話集合
        redisTemplate.opsForSet().add("user:" + userId + ":sessions", sessionId);
        
        // 添加到活躍用戶集合
        redisTemplate.opsForSet().add("active:users", userId);
        
        return sessionId;
    }

    /**
     * 驗證會話有效性
     * @param sessionId 會話ID
     * @return 會話數據，如果無效返回null
     */
    public SessionData validateSession(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            return null;
        }
        
        String sessionKey = "session:" + sessionId;
        Object sessionObj = redisTemplate.opsForValue().get(sessionKey);
        
        if (sessionObj == null) {
            return null;
        }
        
        try {
            SessionData sessionData;
            if (sessionObj instanceof SessionData) {
                sessionData = (SessionData) sessionObj;
            } else {
                // 處理反序列化
                sessionData = objectMapper.convertValue(sessionObj, SessionData.class);
            }
            
            if (!sessionData.isActive()) {
                return null;
            }
            
            // 更新最後訪問時間
            refreshSession(sessionId);
            
            return sessionData;
            
        } catch (Exception e) {
            // 反序列化失敗
            return null;
        }
    }

    /**
     * 刷新會話過期時間
     * @param sessionId 會話ID
     */
    public void refreshSession(String sessionId) {
        String sessionKey = "session:" + sessionId;
        SessionData sessionData = (SessionData) redisTemplate.opsForValue().get(sessionKey);
        
        if (sessionData != null) {
            sessionData.setLastAccess(LocalDateTime.now());
            redisTemplate.opsForValue().set(sessionKey, sessionData, SESSION_TIMEOUT_MINUTES, TimeUnit.MINUTES);
        }
    }

    /**
     * 銷毀指定會話
     * @param sessionId 會話ID
     */
    public void invalidateSession(String sessionId) {
        String sessionKey = "session:" + sessionId;
        SessionData sessionData = (SessionData) redisTemplate.opsForValue().get(sessionKey);
        
        if (sessionData != null) {
            String userId = sessionData.getUserId();
            
            // 從Redis刪除會話
            redisTemplate.delete(sessionKey);
            
            // 從用戶會話集合中移除
            redisTemplate.opsForSet().remove("user:" + userId + ":sessions", sessionId);
            
            // 檢查用戶是否還有其他活躍會話
            Set<Object> userSessions = redisTemplate.opsForSet().members("user:" + userId + ":sessions");
            if (userSessions == null || userSessions.isEmpty()) {
                redisTemplate.opsForSet().remove("active:users", userId);
            }
        }
    }

    /**
     * 銷毀用戶所有會話
     * @param userId 用戶ID
     */
    public void invalidateAllUserSessions(String userId) {
        Set<Object> sessionIds = redisTemplate.opsForSet().members("user:" + userId + ":sessions");
        
        if (sessionIds != null) {
            for (Object sessionId : sessionIds) {
                redisTemplate.delete("session:" + sessionId);
            }
        }
        
        // 清空用戶會話集合
        redisTemplate.delete("user:" + userId + ":sessions");
        
        // 從活躍用戶集合中移除
        redisTemplate.opsForSet().remove("active:users", userId);
    }

    /**
     * 獲取用戶所有活躍會話
     * @param userId 用戶ID
     * @return 會話列表
     */
    public List<SessionData> getUserActiveSessions(String userId) {
        Set<Object> sessionIds = redisTemplate.opsForSet().members("user:" + userId + ":sessions");
        List<SessionData> sessions = new ArrayList<>();
        
        if (sessionIds != null) {
            for (Object sessionId : sessionIds) {
                SessionData sessionData = validateSession((String) sessionId);
                if (sessionData != null) {
                    sessions.add(sessionData);
                }
            }
        }
        
        return sessions;
    }

    /**
     * 清理過期會話
     * @param userId 用戶ID
     */
    private void cleanupExpiredSessions(String userId) {
        Set<Object> sessionIds = redisTemplate.opsForSet().members("user:" + userId + ":sessions");
        
        if (sessionIds != null) {
            for (Object sessionId : sessionIds) {
                if (redisTemplate.opsForValue().get("session:" + sessionId) == null) {
                    redisTemplate.opsForSet().remove("user:" + userId + ":sessions", sessionId);
                }
            }
        }
    }

    /**
     * 移除最舊的會話
     * @param userId 用戶ID
     */
    private void removeOldestSession(String userId) {
        List<SessionData> sessions = getUserActiveSessions(userId);
        if (!sessions.isEmpty()) {
            SessionData oldestSession = sessions.stream()
                    .min(Comparator.comparing(SessionData::getCreatedAt))
                    .orElse(null);
            
            if (oldestSession != null) {
                invalidateSession(oldestSession.getSessionId());
            }
        }
    }

    /**
     * 獲取活躍用戶數量
     * @return 活躍用戶數量
     */
    public long getActiveUserCount() {
        Long size = redisTemplate.opsForSet().size("active:users");
        return size != null ? size : 0L;
    }

    /**
     * 獲取所有活躍用戶ID
     * @return 活躍用戶ID集合
     */
    public Set<Object> getActiveUsers() {
        return redisTemplate.opsForSet().members("active:users");
    }

    /**
     * 會話數據類
     */
    public static class SessionData {
        private String userId;
        private String sessionId;
        private String deviceInfo;
        private String ipAddress;
        private LocalDateTime createdAt;
        private LocalDateTime lastAccess;
        private boolean active;

        // Constructors
        public SessionData() {}

        // Getters and setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }

        public String getDeviceInfo() { return deviceInfo; }
        public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getLastAccess() { return lastAccess; }
        public void setLastAccess(LocalDateTime lastAccess) { this.lastAccess = lastAccess; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }
}