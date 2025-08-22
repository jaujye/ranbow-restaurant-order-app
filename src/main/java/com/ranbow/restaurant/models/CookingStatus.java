package com.ranbow.restaurant.models;

/**
 * Cooking Status Enumeration
 * Represents the current status of a cooking timer/session
 */
public enum CookingStatus {
    IDLE("待開始", "Timer is created but not started yet"),
    RUNNING("進行中", "Timer is actively running"),
    PAUSED("已暫停", "Timer is paused, can be resumed"),
    COMPLETED("已完成", "Cooking is completed successfully"),
    CANCELLED("已取消", "Cooking was cancelled"),
    OVERDUE("已超時", "Timer has exceeded estimated completion time");

    private final String displayName;
    private final String description;

    CookingStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return this == RUNNING || this == PAUSED;
    }

    public boolean isCompleted() {
        return this == COMPLETED || this == CANCELLED;
    }

    public boolean canBePaused() {
        return this == RUNNING;
    }

    public boolean canBeResumed() {
        return this == PAUSED;
    }

    public boolean canBeCompleted() {
        return this == RUNNING || this == PAUSED;
    }

    @Override
    public String toString() {
        return displayName;
    }
}