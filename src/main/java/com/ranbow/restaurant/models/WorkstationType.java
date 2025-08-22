package com.ranbow.restaurant.models;

/**
 * Workstation Type Enumeration
 * Represents different kitchen workstations with their capacities
 */
public enum WorkstationType {
    GRILL("燒烤區", 4, "Grilling station for steaks, burgers, etc."),
    WOK("炒鍋區", 3, "Wok station for stir-fry dishes"),
    PREP("準備區", 6, "Preparation station for ingredients and cold dishes"),
    DEEP_FRY("油炸區", 2, "Deep frying station for fried foods"),
    SALAD("沙拉區", 2, "Salad and cold food preparation"),
    DESSERT("甜點區", 2, "Dessert preparation station"),
    BEVERAGE("飲品區", 4, "Beverage preparation station");

    private final String name;
    private final int maxCapacity;
    private final String description;

    WorkstationType(String name, int maxCapacity, String description) {
        this.name = name;
        this.maxCapacity = maxCapacity;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public String getDescription() {
        return description;
    }

    public String getStationId() {
        return this.name();
    }

    @Override
    public String toString() {
        return name;
    }
}