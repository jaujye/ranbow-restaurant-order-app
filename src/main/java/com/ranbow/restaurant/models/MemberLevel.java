package com.ranbow.restaurant.models;

public enum MemberLevel {
    BRONZE("Bronze", "🥉 銅牌會員", 0),
    SILVER("Silver", "🥈 銀牌會員", 5000),
    GOLD("Gold", "🥇 金牌會員", 15000),
    PLATINUM("Platinum", "💎 白金會員", 30000);

    private final String code;
    private final String displayName;
    private final double threshold;

    MemberLevel(String code, String displayName, double threshold) {
        this.code = code;
        this.displayName = displayName;
        this.threshold = threshold;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getThreshold() {
        return threshold;
    }

    public static MemberLevel fromTotalSpent(double totalSpent) {
        if (totalSpent >= PLATINUM.threshold) {
            return PLATINUM;
        } else if (totalSpent >= GOLD.threshold) {
            return GOLD;
        } else if (totalSpent >= SILVER.threshold) {
            return SILVER;
        } else {
            return BRONZE;
        }
    }
}