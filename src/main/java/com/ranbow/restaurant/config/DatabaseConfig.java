package com.ranbow.restaurant.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

@Configuration
@EnableTransactionManagement
public class DatabaseConfig {
    
    @Value("${spring.datasource.url}")
    private String jdbcUrl;
    
    @Value("${spring.datasource.username}")
    private String username;
    
    @Value("${spring.datasource.password}")
    private String password;
    
    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;
    
    @Value("${spring.datasource.hikari.maximum-pool-size}")
    private int maximumPoolSize;
    
    @Value("${spring.datasource.hikari.minimum-idle}")
    private int minimumIdle;
    
    @Value("${spring.datasource.hikari.connection-timeout}")
    private long connectionTimeout;
    
    @Value("${spring.datasource.hikari.idle-timeout}")
    private long idleTimeout;
    
    @Value("${spring.datasource.hikari.max-lifetime}")
    private long maxLifetime;
    
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        
        // Database connection settings
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName(driverClassName);
        
        // Connection pool settings
        config.setMaximumPoolSize(maximumPoolSize);
        config.setMinimumIdle(minimumIdle);
        config.setConnectionTimeout(connectionTimeout);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        
        // Pool name for monitoring
        config.setPoolName("RanbowRestaurantPool");
        
        // Connection validation
        config.setConnectionTestQuery("SELECT 1");
        config.setValidationTimeout(5000);
        
        // Performance optimizations
        config.setLeakDetectionThreshold(60000); // 1 minute
        config.setRegisterMbeans(true); // Enable JMX monitoring
        
        // Additional PostgreSQL specific settings
        config.addDataSourceProperty("applicationName", "Ranbow Restaurant App");
        config.addDataSourceProperty("stringtype", "unspecified");
        config.addDataSourceProperty("prepareThreshold", "0");
        config.addDataSourceProperty("preparedStatementCacheQueries", "256");
        config.addDataSourceProperty("preparedStatementCacheSizeMiB", "5");
        config.addDataSourceProperty("defaultRowFetchSize", "1000");
        
        return new HikariDataSource(config);
    }
    
    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        
        // Configure query timeout (30 seconds)
        jdbcTemplate.setQueryTimeout(30);
        
        // Configure fetch size for better performance
        jdbcTemplate.setFetchSize(1000);
        
        return jdbcTemplate;
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
    
    @PostConstruct
    public void init() {
        System.out.println("🔗 Database Configuration Initialized");
        System.out.println("📊 Connection Pool: " + maximumPoolSize + " max connections");
        System.out.println("🏪 Database URL: " + maskPassword(jdbcUrl));
    }
    
    private String maskPassword(String url) {
        // Simple password masking for logging
        return url.replaceAll("(password=)[^&;]*", "$1***");
    }
}