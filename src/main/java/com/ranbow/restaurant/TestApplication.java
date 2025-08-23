package com.ranbow.restaurant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Test Application for Staff Authentication System
 * Minimal configuration for testing authentication endpoints
 */
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.ranbow.restaurant.staff.controller",
    "com.ranbow.restaurant.staff.service", 
    "com.ranbow.restaurant.staff.repository",
    "com.ranbow.restaurant.staff.security",
    "com.ranbow.restaurant.config",
    "com.ranbow.restaurant.staff.model"
})
public class TestApplication {

    public static void main(String[] args) {
        System.out.println("Starting Staff Authentication Test Application...");
        SpringApplication.run(TestApplication.class, args);
    }
}