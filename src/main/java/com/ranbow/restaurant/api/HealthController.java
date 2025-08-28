package com.ranbow.restaurant.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@CrossOrigin(origins = "*")
public class HealthController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // Test database connection
            String dbTest = jdbcTemplate.queryForObject("SELECT 'OK'", String.class);
            
            health.put("status", "UP");
            health.put("timestamp", LocalDateTime.now());
            health.put("service", "Ranbow Restaurant Order Application");
            health.put("version", "1.0.0");
            health.put("database", "Connected");
            
            // Add some basic stats
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            Integer menuCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM menu_items", Integer.class);
            Integer orderCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM orders", Integer.class);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userCount);
            stats.put("totalMenuItems", menuCount);
            stats.put("totalOrders", orderCount);
            
            health.put("stats", stats);
            
            // Add API endpoints info
            Map<String, String> endpoints = new HashMap<>();
            endpoints.put("users", "/api/users");
            endpoints.put("menu", "/api/menu");
            endpoints.put("orders", "/api/orders");
            endpoints.put("payments", "/api/payments");
            endpoints.put("reports", "/api/reports");
            
            health.put("endpoints", endpoints);
            
            return ResponseEntity.ok(health);
            
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("timestamp", LocalDateTime.now());
            health.put("error", e.getMessage());
            health.put("database", "Disconnected");
            
            return ResponseEntity.status(503).body(health);
        }
    }
    
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> getDatabaseHealth() {
        Map<String, Object> dbHealth = new HashMap<>();
        
        try {
            // Test connection
            String connectionTest = jdbcTemplate.queryForObject("SELECT 'Connected'", String.class);
            
            // Get PostgreSQL version
            String version = jdbcTemplate.queryForObject("SELECT version()", String.class);
            
            // Get current time from database
            String dbTime = jdbcTemplate.queryForObject("SELECT NOW()::text", String.class);
            
            // Get table counts
            Integer tableCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'", 
                Integer.class);
            
            dbHealth.put("status", "UP");
            dbHealth.put("connection", connectionTest);
            dbHealth.put("version", version != null && version.contains(" ") ? version.split(" ")[1] : version);
            dbHealth.put("currentTime", dbTime);
            dbHealth.put("tableCount", tableCount);
            
            return ResponseEntity.ok(dbHealth);
            
        } catch (Exception e) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
            
            return ResponseEntity.status(503).body(dbHealth);
        }
    }
    
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getApplicationInfo() {
        Map<String, Object> info = new HashMap<>();
        
        info.put("application", "Ranbow Restaurant Order Application");
        info.put("description", "餐廳點餐付款應用程式 - 使用者可以透過這個手機應用程式來進行點餐並且付款，管理員可使用本應用程式完成訂單並查看統計營收");
        info.put("version", "1.0.0");
        info.put("author", "Claude Code");
        info.put("framework", "Spring Boot");
        info.put("database", "PostgreSQL");
        info.put("features", new String[]{
            "User Management",
            "Menu Management", 
            "Order Processing",
            "Payment Processing",
            "Revenue Analytics",
            "REST API",
            "Database Integration"
        });
        
        Map<String, String> apiEndpoints = new HashMap<>();
        apiEndpoints.put("GET /api/health", "Application health check");
        apiEndpoints.put("GET /api/users", "Get all users");
        apiEndpoints.put("POST /api/users", "Create new user");
        apiEndpoints.put("GET /api/menu", "Get all menu items");
        apiEndpoints.put("GET /api/menu/available", "Get available menu items");
        apiEndpoints.put("POST /api/orders", "Create new order");
        apiEndpoints.put("GET /api/orders", "Get all orders");
        apiEndpoints.put("POST /api/payments", "Create payment");
        apiEndpoints.put("GET /api/reports/daily", "Get daily report");
        apiEndpoints.put("GET /api/reports/system-overview", "Get system overview");
        
        info.put("apiEndpoints", apiEndpoints);
        
        return ResponseEntity.ok(info);
    }
}