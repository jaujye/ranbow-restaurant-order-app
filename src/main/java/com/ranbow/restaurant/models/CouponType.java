package com.ranbow.restaurant.models;

public enum CouponType {
    PERCENTAGE("Percentage", "百分比折扣"),
    FIXED_AMOUNT("Fixed Amount", "固定金額折扣"),
    FREE_ITEM("Free Item", "免費商品"),
    BIRTHDAY("Birthday", "生日優惠"),
    WELCOME("Welcome", "新會員優惠");

    private final String code;
    private final String displayName;

    CouponType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }
}