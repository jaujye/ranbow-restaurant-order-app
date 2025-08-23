package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.CookingTimerDAO;
import com.ranbow.restaurant.dao.OrderDAO;
import com.ranbow.restaurant.models.*;
import com.ranbow.restaurant.staff.model.dto.KitchenCapacity;
import com.ranbow.restaurant.staff.model.dto.WorkloadAlert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Engine for managing kitchen capacity and workload
 */
@Component
public class KitchenCapacityEngine {
    
    public static final double CAPACITY_WARNING = 70.0;
    public static final double CAPACITY_CRITICAL = 90.0;
    
    @Autowired
    private CookingTimerDAO cookingTimerDAO;
    
    @Autowired
    private OrderDAO orderDAO;
    
    /**
     * Calculate current kitchen capacity
     */
    public KitchenCapacity calculateCurrentCapacity() {
        // Get active orders
        List<Order> activeOrders = orderDAO.findActiveOrders();
        List<Order> queuedOrders = orderDAO.findByStatus(OrderStatus.PENDING);
        
        int maxCapacity = 20; // Configuration value
        int activeCount = activeOrders.size();
        int queuedCount = queuedOrders.size();
        
        double capacityPercentage = (double) activeCount / maxCapacity * 100;
        
        // Calculate average wait time based on current load
        double waitTime = calculateWaitTime(capacityPercentage);
        
        String status = determineCapacityStatus(capacityPercentage);
        
        return new KitchenCapacity(capacityPercentage, activeCount, queuedCount, 
                                 maxCapacity, waitTime, status);
    }
    
    /**
     * Check if kitchen can accept new order
     */
    public boolean canAcceptNewOrder(Order order) {
        KitchenCapacity capacity = calculateCurrentCapacity();
        return capacity.getCapacityPercentage() < CAPACITY_CRITICAL;
    }
    
    /**
     * Calculate station-specific capacity
     */
    public StationCapacity calculateStationCapacity(String stationId) {
        // Get timers for this station
        List<CookingTimer> stationTimers = cookingTimerDAO.findByWorkstation(stationId);
        
        int maxStationCapacity = 5; // Configuration per station type
        int activeCount = stationTimers.size();
        double capacityPercentage = (double) activeCount / maxStationCapacity * 100;
        
        // Mock staff assignments - in real implementation would query staff database
        List<String> assignedStaff = Arrays.asList("CHEF001", "CHEF002");
        
        return new StationCapacity(stationId, capacityPercentage, activeCount, 
                                 maxStationCapacity, assignedStaff, 85.0);
    }
    
    /**
     * Check capacity thresholds and generate alerts
     */
    public WorkloadAlert checkCapacityThresholds() {
        KitchenCapacity capacity = calculateCurrentCapacity();
        
        if (capacity.getCapacityPercentage() >= CAPACITY_CRITICAL) {
            return new WorkloadAlert("CAPACITY_CRITICAL", 
                    "Kitchen at critical capacity: " + Math.round(capacity.getCapacityPercentage()) + "%", 
                    "CRITICAL");
        } else if (capacity.getCapacityPercentage() >= CAPACITY_WARNING) {
            return new WorkloadAlert("CAPACITY_WARNING", 
                    "Kitchen capacity high: " + Math.round(capacity.getCapacityPercentage()) + "%", 
                    "HIGH");
        }
        
        return null; // No alert needed
    }
    
    /**
     * Get workload distribution by station
     */
    public WorkloadDistribution getWorkloadByStation() {
        // Stub implementation
        return new WorkloadDistribution();
    }
    
    private double calculateWaitTime(double capacityPercentage) {
        if (capacityPercentage < 50) return 10.0;
        if (capacityPercentage < 70) return 15.0;
        if (capacityPercentage < 90) return 25.0;
        return 40.0;
    }
    
    private String determineCapacityStatus(double capacityPercentage) {
        if (capacityPercentage < 50) return "NORMAL";
        if (capacityPercentage < 70) return "BUSY";
        if (capacityPercentage < 90) return "CRITICAL";
        return "FULL";
    }
    
    /**
     * Station capacity information
     */
    public static class StationCapacity {
        private String stationId;
        private double capacityPercentage;
        private int activeOrders;
        private int maxCapacity;
        private List<String> assignedStaffIds;
        private double averageEfficiency;
        
        public StationCapacity(String stationId, double capacityPercentage, int activeOrders, 
                             int maxCapacity, List<String> assignedStaffIds, double averageEfficiency) {
            this.stationId = stationId;
            this.capacityPercentage = capacityPercentage;
            this.activeOrders = activeOrders;
            this.maxCapacity = maxCapacity;
            this.assignedStaffIds = assignedStaffIds;
            this.averageEfficiency = averageEfficiency;
        }
        
        // Getters
        public String getStationId() { return stationId; }
        public double getCapacityPercentage() { return capacityPercentage; }
        public int getActiveOrders() { return activeOrders; }
        public int getMaxCapacity() { return maxCapacity; }
        public List<String> getAssignedStaffIds() { return assignedStaffIds; }
        public double getAverageEfficiency() { return averageEfficiency; }
    }
    
    /**
     * Workload distribution data
     */
    public static class WorkloadDistribution {
        // Stub implementation - expand as needed
    }
}