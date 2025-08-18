package com.ranbow.restaurant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class RestaurantApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(RestaurantApplication.class, args);
        System.out.println("🍽️ Ranbow Restaurant API Server Started!");
        System.out.println("📡 Server running on: http://localhost:8087/api");
        System.out.println("📚 API Documentation available at: http://localhost:8087/api/health");
    }
}