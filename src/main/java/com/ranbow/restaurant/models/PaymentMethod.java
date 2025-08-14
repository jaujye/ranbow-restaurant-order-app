package com.ranbow.restaurant.models;

public enum PaymentMethod {
    CASH("現金"),
    CREDIT_CARD("信用卡"),
    DEBIT_CARD("簽帳卡"),
    MOBILE_PAYMENT("行動支付"),
    LINE_PAY("LINE Pay"),
    APPLE_PAY("Apple Pay"),
    GOOGLE_PAY("Google Pay");
    
    private final String displayName;
    
    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}