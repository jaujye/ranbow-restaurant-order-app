package com.ranbow.restaurant.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class User {
    private String userId;
    @JsonProperty(value = "username")
    private String username;
    private String email;
    private String phoneNumber;
    private UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private boolean isActive;
    
    // 新增個人中心相關字段
    private String avatarUrl;
    private LocalDate birthday;
    private MemberLevel memberLevel;
    private double totalSpent;
    private int totalOrders;
    
    public User() {
        this.userId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.isActive = true;
        this.memberLevel = MemberLevel.BRONZE;
        this.totalSpent = 0.0;
        this.totalOrders = 0;
    }
    
    public User(String username, String email, String phoneNumber, UserRole role) {
        this();
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    // Frontend compatibility - allow "name" field to map to "username"
    @JsonProperty("name")
    public String getName() {
        return username;
    }
    
    @JsonProperty("name")
    public void setName(String name) {
        this.username = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }
    
    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    // 新增字段的getter和setter
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    public LocalDate getBirthday() {
        return birthday;
    }
    
    public void setBirthday(LocalDate birthday) {
        this.birthday = birthday;
    }
    
    public MemberLevel getMemberLevel() {
        return memberLevel;
    }
    
    public void setMemberLevel(MemberLevel memberLevel) {
        this.memberLevel = memberLevel;
    }
    
    public double getTotalSpent() {
        return totalSpent;
    }
    
    public void setTotalSpent(double totalSpent) {
        this.totalSpent = totalSpent;
    }
    
    public int getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    @Override
    public String toString() {
        return "User{" +
                "userId='" + userId + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", isActive=" + isActive +
                '}';
    }
}