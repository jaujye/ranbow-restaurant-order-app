package com.ranbow.restaurant.staff.model.dto;

/**
 * DTO for cooking time analysis by category
 */
public class CookingTimeAnalysis {
    
    private String category;
    private int sampleSize;
    private double averageMinutes;
    private double minMinutes;
    private double maxMinutes;
    
    // Constructors
    public CookingTimeAnalysis() {}
    
    public CookingTimeAnalysis(String category, int sampleSize, double averageMinutes,
                              double minMinutes, double maxMinutes) {
        this.category = category;
        this.sampleSize = sampleSize;
        this.averageMinutes = averageMinutes;
        this.minMinutes = minMinutes;
        this.maxMinutes = maxMinutes;
    }
    
    // Getters and Setters
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public int getSampleSize() {
        return sampleSize;
    }
    
    public void setSampleSize(int sampleSize) {
        this.sampleSize = sampleSize;
    }
    
    public double getAverageMinutes() {
        return averageMinutes;
    }
    
    public void setAverageMinutes(double averageMinutes) {
        this.averageMinutes = averageMinutes;
    }
    
    public double getMinMinutes() {
        return minMinutes;
    }
    
    public void setMinMinutes(double minMinutes) {
        this.minMinutes = minMinutes;
    }
    
    public double getMaxMinutes() {
        return maxMinutes;
    }
    
    public void setMaxMinutes(double maxMinutes) {
        this.maxMinutes = maxMinutes;
    }
    
    @Override
    public String toString() {
        return "CookingTimeAnalysis{" +
                "category='" + category + '\'' +
                ", sampleSize=" + sampleSize +
                ", averageMinutes=" + averageMinutes +
                ", minMinutes=" + minMinutes +
                ", maxMinutes=" + maxMinutes +
                '}';
    }
}