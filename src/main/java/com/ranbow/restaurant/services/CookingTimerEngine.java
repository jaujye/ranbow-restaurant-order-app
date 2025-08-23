package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.CookingTimerDAO;
import com.ranbow.restaurant.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Engine for managing cooking timers
 */
@Component
public class CookingTimerEngine {
    
    @Autowired
    private CookingTimerDAO cookingTimerDAO;
    
    /**
     * Create a new cooking timer for an order
     */
    public CookingTimer createTimer(Order order, String staffId, Integer estimatedDurationSeconds) {
        CookingTimer timer = new CookingTimer();
        timer.setTimerId(UUID.randomUUID().toString());
        timer.setOrder(order);
        timer.setEstimatedDurationSeconds(estimatedDurationSeconds != null ? estimatedDurationSeconds : 1200); // Default 20 minutes
        timer.setStatus(CookingStatus.CREATED);
        timer.setCreatedTime(LocalDateTime.now());
        
        // Set chef info if available
        if (staffId != null) {
            // Create a basic Chef object - in real implementation you'd fetch from StaffDAO
            Chef chef = new Chef();
            chef.setStaffId(staffId);
            timer.setChef(chef);
        }
        
        return cookingTimerDAO.save(timer);
    }
    
    /**
     * Start a cooking timer
     */
    public CookingTimer startTimer(String timerId) {
        CookingTimer timer = cookingTimerDAO.findById(timerId)
                .orElseThrow(() -> new RuntimeException("Timer not found: " + timerId));
        
        timer.setStatus(CookingStatus.RUNNING);
        timer.setStartTime(LocalDateTime.now());
        
        return cookingTimerDAO.update(timer);
    }
    
    /**
     * Pause a cooking timer
     */
    public CookingTimer pauseTimer(String timerId, String reason) {
        CookingTimer timer = cookingTimerDAO.findById(timerId)
                .orElseThrow(() -> new RuntimeException("Timer not found: " + timerId));
        
        timer.setStatus(CookingStatus.PAUSED);
        // In real implementation, you'd track pause time and adjust duration
        
        return cookingTimerDAO.update(timer);
    }
    
    /**
     * Resume a cooking timer
     */
    public CookingTimer resumeTimer(String timerId) {
        CookingTimer timer = cookingTimerDAO.findById(timerId)
                .orElseThrow(() -> new RuntimeException("Timer not found: " + timerId));
        
        timer.setStatus(CookingStatus.RUNNING);
        
        return cookingTimerDAO.update(timer);
    }
    
    /**
     * Complete a cooking timer
     */
    public CookingTimer completeTimer(String timerId, int actualDurationSeconds) {
        CookingTimer timer = cookingTimerDAO.findById(timerId)
                .orElseThrow(() -> new RuntimeException("Timer not found: " + timerId));
        
        timer.setStatus(CookingStatus.COMPLETED);
        timer.setCompletedTime(LocalDateTime.now());
        timer.setActualDurationSeconds(actualDurationSeconds);
        
        return cookingTimerDAO.update(timer);
    }
    
    /**
     * Cancel a cooking timer
     */
    public CookingTimer cancelTimer(String timerId, String reason) {
        CookingTimer timer = cookingTimerDAO.findById(timerId)
                .orElseThrow(() -> new RuntimeException("Timer not found: " + timerId));
        
        timer.setStatus(CookingStatus.CANCELLED);
        
        return cookingTimerDAO.update(timer);
    }
    
    /**
     * Get all active timers
     */
    public List<CookingTimer> getActiveTimers() {
        return cookingTimerDAO.findActiveTimers();
    }
    
    /**
     * Get overdue timers
     */
    public List<CookingTimer> getOverdueTimers() {
        return cookingTimerDAO.findOverdueTimers();
    }
    
    /**
     * Get timers by workstation
     */
    public List<CookingTimer> getTimersByWorkstation(String workstationId) {
        return cookingTimerDAO.findByWorkstation(workstationId);
    }
    
    /**
     * Calculate efficiency for a completed timer
     */
    public Object calculateEfficiency(CookingTimer timer) {
        if (timer.getEstimatedDurationSeconds() == null || timer.getActualDurationSeconds() == null) {
            return 0.0;
        }
        
        double efficiency = (double) timer.getEstimatedDurationSeconds() / timer.getActualDurationSeconds();
        return Math.min(efficiency, 1.0) * 100; // Cap at 100% efficiency
    }
    
    /**
     * Get average cooking time for a category
     */
    public AverageCookingTime getAverageCookingTime(String category) {
        // Stub implementation - in real version would query database
        return new AverageCookingTime(category, 10, 15.5, 8.0, 25.0);
    }
    
    /**
     * Inner class for average cooking time data
     */
    public static class AverageCookingTime {
        private String category;
        private int sampleSize;
        private double averageMinutes;
        private double minMinutes;
        private double maxMinutes;
        
        public AverageCookingTime(String category, int sampleSize, double averageMinutes, double minMinutes, double maxMinutes) {
            this.category = category;
            this.sampleSize = sampleSize;
            this.averageMinutes = averageMinutes;
            this.minMinutes = minMinutes;
            this.maxMinutes = maxMinutes;
        }
        
        // Getters
        public String getCategory() { return category; }
        public int getSampleSize() { return sampleSize; }
        public double getAverageMinutes() { return averageMinutes; }
        public double getMinMinutes() { return minMinutes; }
        public double getMaxMinutes() { return maxMinutes; }
    }
}