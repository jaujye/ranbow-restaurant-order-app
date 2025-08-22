package com.ranbow.restaurant.staff.model.vo;

import java.time.LocalDateTime;

/**
 * WorkShift Value Object
 * Used for API responses and data transfer
 * Implements the exact specification from STAFF_UI_DEVELOPMENT_DOC.md
 */
public class WorkShift {
    
    private String shiftId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer breakTime; // minutes
    private String status;
    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;
    
    // Constructors
    public WorkShift() {}
    
    public WorkShift(String shiftId, LocalDateTime startTime, LocalDateTime endTime, Integer breakTime) {
        this.shiftId = shiftId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.breakTime = breakTime;
    }
    
    // Static factory method to create from entity
    public static WorkShift fromEntity(com.ranbow.restaurant.staff.model.entity.WorkShift entity) {
        WorkShift vo = new WorkShift();
        vo.setShiftId(entity.getShiftId());
        vo.setStartTime(entity.getScheduledStartTime());
        vo.setEndTime(entity.getScheduledEndTime());
        vo.setBreakTime(entity.getBreakMinutes());
        vo.setStatus(entity.getShiftStatus().name());
        vo.setActualStart(entity.getActualStartTime());
        vo.setActualEnd(entity.getActualEndTime());
        return vo;
    }
    
    // Getters and Setters
    public String getShiftId() {
        return shiftId;
    }
    
    public void setShiftId(String shiftId) {
        this.shiftId = shiftId;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public Integer getBreakTime() {
        return breakTime;
    }
    
    public void setBreakTime(Integer breakTime) {
        this.breakTime = breakTime;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getActualStart() {
        return actualStart;
    }
    
    public void setActualStart(LocalDateTime actualStart) {
        this.actualStart = actualStart;
    }
    
    public LocalDateTime getActualEnd() {
        return actualEnd;
    }
    
    public void setActualEnd(LocalDateTime actualEnd) {
        this.actualEnd = actualEnd;
    }
    
    @Override
    public String toString() {
        return "WorkShift{" +
                "shiftId='" + shiftId + '\'' +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", breakTime=" + breakTime +
                ", status='" + status + '\'' +
                '}';
    }
}