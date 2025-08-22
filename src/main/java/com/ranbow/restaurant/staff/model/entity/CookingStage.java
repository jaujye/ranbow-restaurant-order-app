package com.ranbow.restaurant.staff.model.entity;

/**
 * Cooking Stage Enumeration
 * Represents different stages in the cooking process
 */
public enum CookingStage {
    PREP("Preparation", "Initial preparation of ingredients", 1),
    COOKING("Cooking", "Main cooking process", 2),
    RESTING("Resting", "Resting period for certain dishes", 3),
    FINISHING("Finishing", "Final touches and seasoning", 4),
    PLATING("Plating", "Plating and presentation", 5),
    QUALITY_CHECK("Quality Check", "Final quality inspection", 6),
    READY("Ready", "Ready for service", 7);
    
    private final String displayName;
    private final String description;
    private final int stageOrder;
    
    CookingStage(String displayName, String description, int stageOrder) {
        this.displayName = displayName;
        this.description = description;
        this.stageOrder = stageOrder;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public int getStageOrder() {
        return stageOrder;
    }
    
    /**
     * Check if this stage comes before another stage
     */
    public boolean isBefore(CookingStage other) {
        return this.stageOrder < other.stageOrder;
    }
    
    /**
     * Check if this stage comes after another stage
     */
    public boolean isAfter(CookingStage other) {
        return this.stageOrder > other.stageOrder;
    }
    
    /**
     * Get the next stage in the cooking process
     */
    public CookingStage getNextStage() {
        return switch (this) {
            case PREP -> COOKING;
            case COOKING -> FINISHING;
            case RESTING -> FINISHING;
            case FINISHING -> PLATING;
            case PLATING -> QUALITY_CHECK;
            case QUALITY_CHECK -> READY;
            case READY -> READY; // Terminal stage
        };
    }
    
    /**
     * Get the previous stage in the cooking process
     */
    public CookingStage getPreviousStage() {
        return switch (this) {
            case PREP -> PREP; // Initial stage
            case COOKING -> PREP;
            case RESTING -> COOKING;
            case FINISHING -> COOKING;
            case PLATING -> FINISHING;
            case QUALITY_CHECK -> PLATING;
            case READY -> QUALITY_CHECK;
        };
    }
    
    /**
     * Check if this stage is a critical timing stage
     */
    public boolean isCriticalTimingStage() {
        return this == COOKING || this == RESTING;
    }
    
    /**
     * Check if this stage allows for pausing
     */
    public boolean allowsPausing() {
        return this == PREP || this == FINISHING || this == PLATING;
    }
    
    /**
     * Get the typical duration for this stage in minutes
     */
    public int getTypicalDurationMinutes() {
        return switch (this) {
            case PREP -> 5;
            case COOKING -> 15;
            case RESTING -> 3;
            case FINISHING -> 2;
            case PLATING -> 3;
            case QUALITY_CHECK -> 1;
            case READY -> 0;
        };
    }
    
    /**
     * Get CSS class for UI styling
     */
    public String getCssClass() {
        return switch (this) {
            case PREP -> "stage-prep";
            case COOKING -> "stage-cooking";
            case RESTING -> "stage-resting";
            case FINISHING -> "stage-finishing";
            case PLATING -> "stage-plating";
            case QUALITY_CHECK -> "stage-quality";
            case READY -> "stage-ready";
        };
    }
    
    /**
     * Get color code for progress indicators
     */
    public String getColorCode() {
        return switch (this) {
            case PREP -> "#6c757d";       // Gray
            case COOKING -> "#fd7e14";    // Orange
            case RESTING -> "#20c997";    // Teal
            case FINISHING -> "#ffc107";  // Yellow
            case PLATING -> "#17a2b8";    // Info blue
            case QUALITY_CHECK -> "#6f42c1"; // Purple
            case READY -> "#28a745";      // Green
        };
    }
}