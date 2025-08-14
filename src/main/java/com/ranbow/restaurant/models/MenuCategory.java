package com.ranbow.restaurant.models;

public enum MenuCategory {
    APPETIZER("開胃菜"),
    MAIN_COURSE("主菜"),
    DESSERT("甜點"),
    BEVERAGE("飲料"),
    SOUP("湯品"),
    SALAD("沙拉"),
    SIDE_DISH("配菜");
    
    private final String displayName;
    
    MenuCategory(String displayName) {
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