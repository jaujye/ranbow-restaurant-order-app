package com.ranbow.restaurant.staff.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Staff-specific Redis Configuration
 * 
 * Provides specialized Redis templates and configurations for staff authentication
 * and session management system.
 * 
 * Beans:
 * - staffStringRedisTemplate: For string-based operations (sessions, cache keys)
 * - staffObjectRedisTemplate: For object serialization (complex data structures)
 * - staffRedisObjectMapper: Jackson mapper with staff-specific configurations
 * 
 * Features:
 * - Optimized serialization for staff data structures
 * - Proper handling of Java 8 time types
 * - Connection pooling for high-performance operations
 * - Key namespace separation for staff operations
 */
@Configuration
public class StaffRedisConfig {
    
    /**
     * Redis Template for String Operations
     * 
     * Optimized for simple key-value operations, session tokens,
     * failed login attempts, and cache keys.
     */
    @Bean("staffStringRedisTemplate")
    @Primary
    public RedisTemplate<String, String> staffStringRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Use String serializer for both keys and values
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);
        
        // Enable transaction support for atomic operations
        template.setEnableTransactionSupport(true);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * Redis Template for Object Operations
     * 
     * Optimized for complex data structures like staff sessions,
     * quick switch history, and cache objects.
     */
    @Bean("staffObjectRedisTemplate")
    public RedisTemplate<String, Object> staffObjectRedisTemplate(
            RedisConnectionFactory connectionFactory,
            @Qualifier("staffRedisObjectMapper") ObjectMapper objectMapper) {
        
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Serializer configuration
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(objectMapper);
        
        // Key serialization (always strings)
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        
        // Value serialization (JSON for objects)
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        // Enable transaction support for atomic operations
        template.setEnableTransactionSupport(true);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * Staff-specific Object Mapper for Redis
     * 
     * Configured for optimal serialization of staff-related data structures
     * with proper handling of Java 8 time types and custom formatting.
     */
    @Bean("staffRedisObjectMapper")
    public ObjectMapper staffRedisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Java 8 Time support
        mapper.registerModule(new JavaTimeModule());
        
        // Configure time serialization
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE, false);
        
        // Handle unknown properties gracefully
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        // Handle empty objects
        mapper.configure(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        
        // Pretty print for debugging (disable in production)
        mapper.configure(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT, false);
        
        return mapper;
    }
    
    /**
     * Staff Cache Configuration
     * 
     * Defines cache names, TTL settings, and key patterns for staff operations
     */
    @Bean
    public StaffCacheConfig staffCacheConfig() {
        StaffCacheConfig config = new StaffCacheConfig();
        
        // Session cache configuration
        config.setSessionTtlHours(8);
        config.setSessionKeyPrefix("staff:session:");
        
        // Device binding configuration
        config.setDeviceTtlDays(30);
        config.setDeviceKeyPrefix("staff:device:");
        
        // Failed login attempts configuration
        config.setFailedAttemptsTtlMinutes(15);
        config.setFailedAttemptsKeyPrefix("staff:failed:");
        
        // Quick switch history configuration
        config.setQuickSwitchTtlHours(24);
        config.setQuickSwitchKeyPrefix("staff:quick:");
        
        // Account lockout configuration
        config.setLockoutTtlMinutes(15);
        config.setLockoutKeyPrefix("staff:lockout:");
        
        // Token blacklist configuration
        config.setTokenBlacklistTtlHours(8);
        config.setTokenBlacklistKeyPrefix("staff:token:");
        
        // Active sessions tracking
        config.setActiveSessionsKey("staff:active:sessions");
        
        // Cache key patterns for monitoring
        config.addKeyPattern("staff:*", "Staff authentication data");
        config.addKeyPattern("staff:session:*", "Active staff sessions");
        config.addKeyPattern("staff:device:*", "Device bindings");
        config.addKeyPattern("staff:failed:*", "Failed login attempts");
        config.addKeyPattern("staff:lockout:*", "Account lockouts");
        
        return config;
    }
    
    /**
     * Staff Cache Configuration Helper
     * 
     * Centralized configuration for all staff-related cache settings
     */
    public static class StaffCacheConfig {
        private int sessionTtlHours = 8;
        private String sessionKeyPrefix = "staff:session:";
        
        private int deviceTtlDays = 30;
        private String deviceKeyPrefix = "staff:device:";
        
        private int failedAttemptsTtlMinutes = 15;
        private String failedAttemptsKeyPrefix = "staff:failed:";
        
        private int quickSwitchTtlHours = 24;
        private String quickSwitchKeyPrefix = "staff:quick:";
        
        private int lockoutTtlMinutes = 15;
        private String lockoutKeyPrefix = "staff:lockout:";
        
        private int tokenBlacklistTtlHours = 8;
        private String tokenBlacklistKeyPrefix = "staff:token:";
        
        private String activeSessionsKey = "staff:active:sessions";
        
        private final java.util.Map<String, String> keyPatterns = new java.util.HashMap<>();
        
        // Getters and setters
        public int getSessionTtlHours() { return sessionTtlHours; }
        public void setSessionTtlHours(int sessionTtlHours) { this.sessionTtlHours = sessionTtlHours; }
        
        public String getSessionKeyPrefix() { return sessionKeyPrefix; }
        public void setSessionKeyPrefix(String sessionKeyPrefix) { this.sessionKeyPrefix = sessionKeyPrefix; }
        
        public int getDeviceTtlDays() { return deviceTtlDays; }
        public void setDeviceTtlDays(int deviceTtlDays) { this.deviceTtlDays = deviceTtlDays; }
        
        public String getDeviceKeyPrefix() { return deviceKeyPrefix; }
        public void setDeviceKeyPrefix(String deviceKeyPrefix) { this.deviceKeyPrefix = deviceKeyPrefix; }
        
        public int getFailedAttemptsTtlMinutes() { return failedAttemptsTtlMinutes; }
        public void setFailedAttemptsTtlMinutes(int failedAttemptsTtlMinutes) { this.failedAttemptsTtlMinutes = failedAttemptsTtlMinutes; }
        
        public String getFailedAttemptsKeyPrefix() { return failedAttemptsKeyPrefix; }
        public void setFailedAttemptsKeyPrefix(String failedAttemptsKeyPrefix) { this.failedAttemptsKeyPrefix = failedAttemptsKeyPrefix; }
        
        public int getQuickSwitchTtlHours() { return quickSwitchTtlHours; }
        public void setQuickSwitchTtlHours(int quickSwitchTtlHours) { this.quickSwitchTtlHours = quickSwitchTtlHours; }
        
        public String getQuickSwitchKeyPrefix() { return quickSwitchKeyPrefix; }
        public void setQuickSwitchKeyPrefix(String quickSwitchKeyPrefix) { this.quickSwitchKeyPrefix = quickSwitchKeyPrefix; }
        
        public int getLockoutTtlMinutes() { return lockoutTtlMinutes; }
        public void setLockoutTtlMinutes(int lockoutTtlMinutes) { this.lockoutTtlMinutes = lockoutTtlMinutes; }
        
        public String getLockoutKeyPrefix() { return lockoutKeyPrefix; }
        public void setLockoutKeyPrefix(String lockoutKeyPrefix) { this.lockoutKeyPrefix = lockoutKeyPrefix; }
        
        public int getTokenBlacklistTtlHours() { return tokenBlacklistTtlHours; }
        public void setTokenBlacklistTtlHours(int tokenBlacklistTtlHours) { this.tokenBlacklistTtlHours = tokenBlacklistTtlHours; }
        
        public String getTokenBlacklistKeyPrefix() { return tokenBlacklistKeyPrefix; }
        public void setTokenBlacklistKeyPrefix(String tokenBlacklistKeyPrefix) { this.tokenBlacklistKeyPrefix = tokenBlacklistKeyPrefix; }
        
        public String getActiveSessionsKey() { return activeSessionsKey; }
        public void setActiveSessionsKey(String activeSessionsKey) { this.activeSessionsKey = activeSessionsKey; }
        
        public void addKeyPattern(String pattern, String description) {
            keyPatterns.put(pattern, description);
        }
        
        public java.util.Map<String, String> getKeyPatterns() { return keyPatterns; }
    }
}