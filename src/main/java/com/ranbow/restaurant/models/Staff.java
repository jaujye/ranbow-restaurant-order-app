package com.ranbow.restaurant.models;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Staff entity extending User model for restaurant staff members
 * Includes staff-specific information and work-related data
 */
public class Staff {
    private String staffId;
    private String userId; // Reference to User entity
    private String employeeId; // Employee ID for quick login
    private String department; // Kitchen, Service, Management
    private String position; // Chef, Waiter, Manager
    private boolean isOnDuty;
    private LocalDateTime shiftStartTime;
    private LocalDateTime shiftEndTime;
    private LocalDateTime lastActivityTime;
    private int dailyOrdersProcessed;
    private double efficiencyRating; // Performance rating (0.0 - 1.0)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Staff() {
        this.staffId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isOnDuty = false;
        this.dailyOrdersProcessed = 0;
        this.efficiencyRating = 0.0;
    }
    
    public Staff(String userId, String employeeId, String department, String position) {
        this();
        this.userId = userId;
        this.employeeId = employeeId;
        this.department = department;
        this.position = position;
    }
    
    // Business methods
    public void startShift() {
        this.isOnDuty = true;
        this.shiftStartTime = LocalDateTime.now();
        this.dailyOrdersProcessed = 0; // Reset daily counter
        this.lastActivityTime = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void endShift() {
        this.isOnDuty = false;
        this.shiftEndTime = LocalDateTime.now();
        this.lastActivityTime = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void recordOrderProcessed() {
        this.dailyOrdersProcessed++;
        this.lastActivityTime = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateActivity() {
        this.lastActivityTime = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean isActiveInLast(int minutes) {
        if (lastActivityTime == null) return false;
        return lastActivityTime.isAfter(LocalDateTime.now().minusMinutes(minutes));
    }
    
    // Getters and Setters
    public String getStaffId() {
        return staffId;
    }
    
    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getPosition() {
        return position;
    }
    
    public void setPosition(String position) {
        this.position = position;
    }
    
    public boolean isOnDuty() {
        return isOnDuty;
    }
    
    public void setOnDuty(boolean onDuty) {
        isOnDuty = onDuty;
    }
    
    public LocalDateTime getShiftStartTime() {
        return shiftStartTime;
    }
    
    public void setShiftStartTime(LocalDateTime shiftStartTime) {
        this.shiftStartTime = shiftStartTime;
    }
    
    public LocalDateTime getShiftEndTime() {
        return shiftEndTime;
    }
    
    public void setShiftEndTime(LocalDateTime shiftEndTime) {
        this.shiftEndTime = shiftEndTime;
    }
    
    public LocalDateTime getLastActivityTime() {
        return lastActivityTime;
    }
    
    public void setLastActivityTime(LocalDateTime lastActivityTime) {
        this.lastActivityTime = lastActivityTime;
    }
    
    public int getDailyOrdersProcessed() {
        return dailyOrdersProcessed;
    }
    
    public void setDailyOrdersProcessed(int dailyOrdersProcessed) {
        this.dailyOrdersProcessed = dailyOrdersProcessed;
    }
    
    public double getEfficiencyRating() {
        return efficiencyRating;
    }
    
    public void setEfficiencyRating(double efficiencyRating) {
        this.efficiencyRating = Math.max(0.0, Math.min(1.0, efficiencyRating)); // Clamp between 0.0 and 1.0
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
    
    @Override
    public String toString() {
        return "Staff{" +
                "staffId='" + staffId + '\'' +
                ", userId='" + userId + '\'' +
                ", employeeId='" + employeeId + '\'' +
                ", department='" + department + '\'' +
                ", position='" + position + '\'' +
                ", isOnDuty=" + isOnDuty +
                ", dailyOrdersProcessed=" + dailyOrdersProcessed +
                ", efficiencyRating=" + efficiencyRating +
                '}';
    }
}