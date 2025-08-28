package com.ranbow.restaurant.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import java.nio.charset.StandardCharsets;

@Component
public class DatabaseInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public void run(String... args) throws Exception {
        logger.info("🚀 Starting database initialization...");
        
        try {
            // Check if database is accessible
            testConnection();
            
            // Check if tables exist
            if (!tablesExist()) {
                logger.info("📊 Tables not found, initializing database schema...");
                initializeSchema();
            } else {
                logger.info("✅ Database tables already exist, skipping initialization");
            }
            
            // Verify data integrity
            verifyData();
            
            logger.info("🎉 Database initialization completed successfully!");
            
        } catch (Exception e) {
            logger.error("❌ Database initialization failed: {}", e.getMessage());
            throw new RuntimeException("Database initialization failed", e);
        }
    }
    
    private void testConnection() {
        try {
            String result = jdbcTemplate.queryForObject("SELECT 'Database connection successful'", String.class);
            logger.info("✅ Database connection test: {}", result);
        } catch (Exception e) {
            logger.error("❌ Database connection failed: {}", e.getMessage());
            throw new RuntimeException("Cannot connect to database", e);
        }
    }
    
    private boolean tablesExist() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'", 
                Integer.class);
            return count != null && count > 0;
        } catch (Exception e) {
            logger.warn("Could not check if tables exist: {}", e.getMessage());
            return false;
        }
    }
    
    private void initializeSchema() {
        try {
            // Read schema.sql from classpath
            ClassPathResource resource = new ClassPathResource("schema.sql");
            byte[] bytes = FileCopyUtils.copyToByteArray(resource.getInputStream());
            String schema = new String(bytes, StandardCharsets.UTF_8);
            
            // Split by semicolon and execute each statement
            String[] statements = schema.split(";");
            
            int successCount = 0;
            int skipCount = 0;
            
            for (String statement : statements) {
                String trimmed = statement.trim();
                if (!trimmed.isEmpty() && !trimmed.startsWith("--") && !trimmed.startsWith("/*")) {
                    try {
                        jdbcTemplate.execute(trimmed);
                        successCount++;
                    } catch (Exception e) {
                        if (e.getMessage().contains("already exists") || 
                            e.getMessage().contains("duplicate")) {
                            skipCount++;
                            logger.debug("Skipped existing object: {}", e.getMessage());
                        } else {
                            logger.error("Failed to execute statement: {}", trimmed);
                            throw e;
                        }
                    }
                }
            }
            
            logger.info("📊 Schema initialization: {} statements executed, {} skipped", successCount, skipCount);
            
        } catch (Exception e) {
            logger.error("❌ Failed to initialize database schema: {}", e.getMessage());
            throw new RuntimeException("Schema initialization failed", e);
        }
    }
    
    private void verifyData() {
        try {
            // Check if default users exist
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            logger.info("👥 Users in database: {}", userCount);
            
            // Check if default menu items exist  
            Integer menuCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM menu_items", Integer.class);
            logger.info("🍽️ Menu items in database: {}", menuCount);
            
            // Check database version/info
            String version = jdbcTemplate.queryForObject("SELECT version()", String.class);
            logger.info("🗄️ PostgreSQL version: {}", version != null && version.contains(" ") ? version.split(" ")[1] : version);
            
        } catch (Exception e) {
            logger.warn("Could not verify data: {}", e.getMessage());
        }
    }
}