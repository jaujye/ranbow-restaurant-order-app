package com.ranbow.restaurant.staff.model.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for efficiency report
 */
public class EfficiencyReport {
    
    private int totalRecords;
    private double avgEfficiency;
    private double onTimePercentage;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Object> efficiencies; // Generic efficiency objects
    
    // Constructors
    public EfficiencyReport() {}
    
    public EfficiencyReport(int totalRecords, double avgEfficiency, double onTimePercentage,
                           LocalDate startDate, LocalDate endDate, List<Object> efficiencies) {
        this.totalRecords = totalRecords;
        this.avgEfficiency = avgEfficiency;
        this.onTimePercentage = onTimePercentage;
        this.startDate = startDate;
        this.endDate = endDate;
        this.efficiencies = efficiencies;
    }
    
    // Factory method for empty report
    public static EfficiencyReport empty() {
        return new EfficiencyReport(0, 0.0, 0.0, LocalDate.now(), LocalDate.now(), List.of());
    }
    
    // Getters and Setters
    public int getTotalRecords() {
        return totalRecords;
    }
    
    public void setTotalRecords(int totalRecords) {
        this.totalRecords = totalRecords;
    }
    
    public double getAvgEfficiency() {
        return avgEfficiency;
    }
    
    public void setAvgEfficiency(double avgEfficiency) {
        this.avgEfficiency = avgEfficiency;
    }
    
    public double getOnTimePercentage() {
        return onTimePercentage;
    }
    
    public void setOnTimePercentage(double onTimePercentage) {
        this.onTimePercentage = onTimePercentage;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public List<Object> getEfficiencies() {
        return efficiencies;
    }
    
    public void setEfficiencies(List<Object> efficiencies) {
        this.efficiencies = efficiencies;
    }
    
    @Override
    public String toString() {
        return "EfficiencyReport{" +
                "totalRecords=" + totalRecords +
                ", avgEfficiency=" + avgEfficiency +
                ", onTimePercentage=" + onTimePercentage +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                '}';
    }
}