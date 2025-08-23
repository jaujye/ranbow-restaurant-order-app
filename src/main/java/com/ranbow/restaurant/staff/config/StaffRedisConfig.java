package com.ranbow.restaurant.staff.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ranbow.restaurant.staff.model.dto.KitchenWorkloadResponse;
import com.ranbow.restaurant.staff.model.dto.OrderStatistics;
import com.ranbow.restaurant.staff.model.vo.StaffSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis Configuration for Staff Management System
 * 
 * Provides specialized Redis templates for different data types used in the
 * staff management system. Optimizes serialization and performance for
 * specific use cases while maintaining consistency with the global Redis configuration.
 * 
 * Templates:
 * - staffSessionTemplate: Staff authentication sessions
 * - orderQueueTemplate: Order queue summaries and statistics
 * - kitchenWorkloadTemplate: Kitchen capacity and workload data
 * - notificationTemplate: Staff notifications and alerts
 * 
 * Features:
 * - Type-safe Redis operations
 * - Optimized serialization for complex objects
 * - Consistent time zone handling
 * - Memory-efficient caching strategies
 */
@Configuration
public class StaffRedisConfig {
    
    @Autowired
    private RedisConnectionFactory redisConnectionFactory;
    
    /**
     * ObjectMapper specifically configured for Redis serialization
     * with time module support and optimal settings
     */
    @Bean("staffRedisObjectMapper")
    public ObjectMapper staffRedisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register Java Time module for LocalDateTime, etc.
        mapper.registerModule(new JavaTimeModule());
        
        // Disable timestamp serialization (use ISO format instead)
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // Handle unknown properties gracefully
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        // Include non-null values only to save space
        mapper.setSerializationInclusion(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL);
        
        return mapper;
    }
    
    /**
     * Redis template for staff session management
     * Handles authentication sessions, login tracking, and device binding
     */
    @Bean("staffSessionTemplate")
    public RedisTemplate<String, StaffSession> staffSessionTemplate() {
        RedisTemplate<String, StaffSession> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // Key serialization
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        
        // Value serialization
        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(staffRedisObjectMapper());
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * Redis template for order queue statistics and summaries
     * Handles order queue data, performance metrics, and workload distribution
     */
    @Bean("orderQueueTemplate")
    public RedisTemplate<String, OrderStatistics> orderQueueTemplate() {
        RedisTemplate<String, OrderStatistics> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // Key serialization
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        
        // Value serialization
        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(staffRedisObjectMapper());
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * Redis template for kitchen workload and capacity management
     * Handles kitchen status, cooking timers, and capacity alerts
     */
    @Bean("kitchenWorkloadTemplate")
    public RedisTemplate<String, KitchenWorkloadResponse> kitchenWorkloadTemplate() {
        RedisTemplate<String, KitchenWorkloadResponse> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // Key serialization
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        
        // Value serialization
        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(staffRedisObjectMapper());
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * Generic Redis template for notifications and messages
     * Handles staff notifications, alerts, and system messages
     */
    @Bean("notificationTemplate")
    public RedisTemplate<String, Object> notificationTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // Key serialization
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        
        // Value serialization
        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(staffRedisObjectMapper());
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * High-performance Redis template for real-time data
     * Optimized for frequent read/write operations like counters and flags
     */
    @Bean("realtimeTemplate")
    public RedisTemplate<String, String> realtimeTemplate() {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // Use string serializer for both keys and values for maximum performance
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * Redis template for complex staff data structures
     * Handles multi-level staff information, permissions, and relationships
     */
    @Bean("staffDataTemplate")
    public RedisTemplate<String, Object> staffDataTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // Key serialization
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        
        // Value serialization with type information for complex objects
        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(staffRedisObjectMapper());
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        // Enable default typing for polymorphic deserialization
        template.setDefaultSerializer(jsonSerializer);
        
        template.afterPropertiesSet();
        return template;
    }
    
    /**
     * Redis template for caching frequently accessed data
     * Optimized for read-heavy operations with longer TTLs
     */
    @Bean("cacheTemplate")
    public RedisTemplate<String, Object> cacheTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // Key serialization
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        
        // Value serialization
        GenericJackson2JsonRedisSerializer jsonSerializer = 
            new GenericJackson2JsonRedisSerializer(staffRedisObjectMapper());
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        // Enable transaction support for atomic operations
        template.setEnableTransactionSupport(true);
        
        template.afterPropertiesSet();
        return template;
    }
}