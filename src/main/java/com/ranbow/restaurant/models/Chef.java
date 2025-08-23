package com.ranbow.restaurant.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Chef Entity
 * Represents a chef/kitchen staff member for cooking operations
 */
@Entity
@Table(name = "chefs", indexes = {
    @Index(name = "idx_chef_name", columnList = "name"),
    @Index(name = "idx_chef_available", columnList = "available"),
    @Index(name = "idx_chef_speciality", columnList = "speciality")
})
public class Chef {
    
    @Id
    @Column(name = "chef_id", updatable = false, nullable = false, length = 36)
    private String chefId;
    
    @NotBlank(message = "Chef name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "available", nullable = false)
    private Boolean available = true;
    
    @Size(max = 50, message = "Speciality must not exceed 50 characters")
    @Column(name = "speciality", length = 50)
    private String speciality;
    
    @Column(name = "skill_level", nullable = false)
    private Integer skillLevel = 1;
    
    @Column(name = "max_concurrent_orders", nullable = false)
    private Integer maxConcurrentOrders = 5;
    
    @Column(name = "current_orders", nullable = false)
    private Integer currentOrders = 0;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Version
    @Column(name = "version")
    private Long version;
    
    // Constructors
    public Chef() {
        this.chefId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Chef(String name, String speciality) {
        this();
        this.name = name;
        this.speciality = speciality;
    }
    
    // Business Methods
    public boolean canTakeOrder() {
        return available && currentOrders < maxConcurrentOrders;
    }
    
    public void assignOrder() {
        if (!canTakeOrder()) {
            throw new IllegalStateException("Chef cannot take more orders");
        }
        this.currentOrders++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void completeOrder() {
        if (this.currentOrders > 0) {
            this.currentOrders--;
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    public void setAvailable(boolean available) {
        this.available = available;
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getChefId() {
        return chefId;
    }
    
    public void setChefId(String chefId) {
        this.chefId = chefId;
    }
    
    public void setStaffId(String staffId) {
        this.chefId = staffId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Boolean getAvailable() {
        return available;
    }
    
    public void setAvailable(Boolean available) {
        this.available = available;
    }
    
    public String getSpeciality() {
        return speciality;
    }
    
    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }
    
    public Integer getSkillLevel() {
        return skillLevel;
    }
    
    public void setSkillLevel(Integer skillLevel) {
        this.skillLevel = skillLevel;
    }
    
    public Integer getMaxConcurrentOrders() {
        return maxConcurrentOrders;
    }
    
    public void setMaxConcurrentOrders(Integer maxConcurrentOrders) {
        this.maxConcurrentOrders = maxConcurrentOrders;
    }
    
    public Integer getCurrentOrders() {
        return currentOrders;
    }
    
    public void setCurrentOrders(Integer currentOrders) {
        this.currentOrders = currentOrders;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Long getVersion() {
        return version;
    }
    
    public void setVersion(Long version) {
        this.version = version;
    }
    
    @Override
    public String toString() {
        return "Chef{" +
                "chefId='" + chefId + '\'' +
                ", name='" + name + '\'' +
                ", available=" + available +
                ", speciality='" + speciality + '\'' +
                ", skillLevel=" + skillLevel +
                ", currentOrders=" + currentOrders +
                ", maxConcurrentOrders=" + maxConcurrentOrders +
                '}';
    }
}