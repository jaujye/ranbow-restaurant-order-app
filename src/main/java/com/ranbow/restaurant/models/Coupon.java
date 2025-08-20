package com.ranbow.restaurant.models;

import java.time.LocalDateTime;
import java.util.UUID;

public class Coupon {
    private String couponId;
    private String userId;
    private String title;
    private String description;
    private CouponType type;
    private double discountValue;
    private double minOrderAmount;
    private LocalDateTime expiryDate;
    private LocalDateTime usedAt;
    private boolean isUsed;
    private LocalDateTime createdAt;

    public Coupon() {
        this.couponId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.isUsed = false;
    }

    public Coupon(String userId, String title, String description, CouponType type,
                  double discountValue, double minOrderAmount, LocalDateTime expiryDate) {
        this();
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.type = type;
        this.discountValue = discountValue;
        this.minOrderAmount = minOrderAmount;
        this.expiryDate = expiryDate;
    }

    // Getters and Setters
    public String getCouponId() {
        return couponId;
    }

    public void setCouponId(String couponId) {
        this.couponId = couponId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CouponType getType() {
        return type;
    }

    public void setType(CouponType type) {
        this.type = type;
    }

    public double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(double discountValue) {
        this.discountValue = discountValue;
    }

    public double getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(double minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }

    public boolean isUsed() {
        return isUsed;
    }

    public void setUsed(boolean used) {
        isUsed = used;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isAvailable() {
        return !isUsed && !isExpired();
    }
}