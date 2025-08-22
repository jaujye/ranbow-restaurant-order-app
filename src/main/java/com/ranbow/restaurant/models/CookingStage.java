package com.ranbow.restaurant.models;

/**
 * Cooking Stage Enumeration
 * Represents the different stages of food preparation process
 */
public enum CookingStage {
    PREP("準備", 15, "Preparation stage including ingredient prep and setup"),
    COOKING("烹飪", 70, "Main cooking process"),
    PLATING("擺盤", 10, "Plating and presentation stage"),
    READY("完成", 5, "Final quality check and ready for delivery");

    private final String displayName;
    private final int defaultPercentage;
    private final String description;

    CookingStage(String displayName, int defaultPercentage, String description) {
        this.displayName = displayName;
        this.defaultPercentage = defaultPercentage;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getDefaultPercentage() {
        return defaultPercentage;
    }

    public String getDescription() {
        return description;
    }

    public CookingStage getNextStage() {
        switch (this) {
            case PREP:
                return COOKING;
            case COOKING:
                return PLATING;
            case PLATING:
                return READY;
            case READY:
            default:
                return null;
        }
    }

    public boolean isLastStage() {
        return this == READY;
    }

    @Override
    public String toString() {
        return displayName;
    }
}