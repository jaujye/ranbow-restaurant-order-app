package com.ranbow.restaurant.staff.model.dto;

import com.ranbow.restaurant.staff.model.entity.StaffRole;
import java.util.List;
import java.util.Map;

/**
 * Workload Status Information
 * Provides real-time workload distribution and capacity information
 */
public class WorkloadStatus {
    
    private int totalActiveStaff;
    private int totalCapacity;
    private int currentWorkload;
    private double workloadPercentage;
    private String overallStatus; // GREEN, YELLOW, RED
    private List<StaffWorkload> staffWorkloads;
    private Map<StaffRole, RoleWorkload> roleWorkloads;
    private List<String> bottlenecks;
    private String recommendation;
    
    // Constructors
    public WorkloadStatus() {
        this.overallStatus = "GREEN";
    }
    
    public WorkloadStatus(int totalActiveStaff, int totalCapacity, int currentWorkload) {
        this();
        this.totalActiveStaff = totalActiveStaff;
        this.totalCapacity = totalCapacity;
        this.currentWorkload = currentWorkload;
        calculateWorkloadPercentage();
        determineOverallStatus();
    }
    
    // Business logic methods
    private void calculateWorkloadPercentage() {
        if (totalCapacity > 0) {
            this.workloadPercentage = ((double) currentWorkload / totalCapacity) * 100;
        } else {
            this.workloadPercentage = 0;
        }
    }
    
    private void determineOverallStatus() {
        if (workloadPercentage < 70) {
            this.overallStatus = "GREEN";
            this.recommendation = "Operating normally";
        } else if (workloadPercentage < 90) {
            this.overallStatus = "YELLOW";
            this.recommendation = "Consider redistributing workload";
        } else {
            this.overallStatus = "RED";
            this.recommendation = "Urgent: Need additional staff or reduce order volume";
        }
    }
    
    public boolean isOverloaded() {
        return "RED".equals(overallStatus);
    }
    
    public boolean needsAttention() {
        return "YELLOW".equals(overallStatus) || "RED".equals(overallStatus);
    }
    
    // Nested classes
    public static class StaffWorkload {
        private String staffId;
        private String staffName;
        private StaffRole role;
        private int assignedOrders;
        private int maxCapacity;
        private double workloadPercentage;
        private String status;
        
        public StaffWorkload() {}
        
        public StaffWorkload(String staffId, String staffName, StaffRole role, 
                           int assignedOrders, int maxCapacity) {
            this.staffId = staffId;
            this.staffName = staffName;
            this.role = role;
            this.assignedOrders = assignedOrders;
            this.maxCapacity = maxCapacity;
            this.workloadPercentage = maxCapacity > 0 ? ((double) assignedOrders / maxCapacity) * 100 : 0;
            this.status = workloadPercentage < 80 ? "AVAILABLE" : 
                         workloadPercentage < 100 ? "BUSY" : "OVERLOADED";
        }
        
        // Getters and Setters
        public String getStaffId() { return staffId; }
        public void setStaffId(String staffId) { this.staffId = staffId; }
        
        public String getStaffName() { return staffName; }
        public void setStaffName(String staffName) { this.staffName = staffName; }
        
        public StaffRole getRole() { return role; }
        public void setRole(StaffRole role) { this.role = role; }
        
        public int getAssignedOrders() { return assignedOrders; }
        public void setAssignedOrders(int assignedOrders) { this.assignedOrders = assignedOrders; }
        
        public int getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }
        
        public double getWorkloadPercentage() { return workloadPercentage; }
        public void setWorkloadPercentage(double workloadPercentage) { this.workloadPercentage = workloadPercentage; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    public static class RoleWorkload {
        private StaffRole role;
        private int totalStaff;
        private int activeStaff;
        private int totalAssignedOrders;
        private int maxCapacity;
        private double utilizationPercentage;
        private String status;
        
        public RoleWorkload() {}
        
        public RoleWorkload(StaffRole role, int totalStaff, int activeStaff, 
                          int totalAssignedOrders, int maxCapacity) {
            this.role = role;
            this.totalStaff = totalStaff;
            this.activeStaff = activeStaff;
            this.totalAssignedOrders = totalAssignedOrders;
            this.maxCapacity = maxCapacity;
            this.utilizationPercentage = maxCapacity > 0 ? ((double) totalAssignedOrders / maxCapacity) * 100 : 0;
            this.status = utilizationPercentage < 70 ? "OPTIMAL" :
                         utilizationPercentage < 90 ? "BUSY" : "OVERLOADED";
        }
        
        // Getters and Setters
        public StaffRole getRole() { return role; }
        public void setRole(StaffRole role) { this.role = role; }
        
        public int getTotalStaff() { return totalStaff; }
        public void setTotalStaff(int totalStaff) { this.totalStaff = totalStaff; }
        
        public int getActiveStaff() { return activeStaff; }
        public void setActiveStaff(int activeStaff) { this.activeStaff = activeStaff; }
        
        public int getTotalAssignedOrders() { return totalAssignedOrders; }
        public void setTotalAssignedOrders(int totalAssignedOrders) { this.totalAssignedOrders = totalAssignedOrders; }
        
        public int getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }
        
        public double getUtilizationPercentage() { return utilizationPercentage; }
        public void setUtilizationPercentage(double utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // Main class getters and setters
    public int getTotalActiveStaff() {
        return totalActiveStaff;
    }
    
    public void setTotalActiveStaff(int totalActiveStaff) {
        this.totalActiveStaff = totalActiveStaff;
    }
    
    public int getTotalCapacity() {
        return totalCapacity;
    }
    
    public void setTotalCapacity(int totalCapacity) {
        this.totalCapacity = totalCapacity;
        calculateWorkloadPercentage();
        determineOverallStatus();
    }
    
    public void setMaxCapacity(int maxCapacity) {
        this.totalCapacity = maxCapacity;
        calculateWorkloadPercentage();
        determineOverallStatus();
    }
    
    public int getCurrentWorkload() {
        return currentWorkload;
    }
    
    public void setCurrentWorkload(int currentWorkload) {
        this.currentWorkload = currentWorkload;
        calculateWorkloadPercentage();
        determineOverallStatus();
    }
    
    public void setCurrentOrders(int currentOrders) {
        this.currentWorkload = currentOrders;
        calculateWorkloadPercentage();
        determineOverallStatus();
    }
    
    public double getWorkloadPercentage() {
        return workloadPercentage;
    }
    
    public void setWorkloadPercentage(double workloadPercentage) {
        this.workloadPercentage = workloadPercentage;
    }
    
    public String getOverallStatus() {
        return overallStatus;
    }
    
    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }
    
    public void setStatus(String status) {
        this.overallStatus = status;
    }
    
    public List<StaffWorkload> getStaffWorkloads() {
        return staffWorkloads;
    }
    
    public void setStaffWorkloads(List<StaffWorkload> staffWorkloads) {
        this.staffWorkloads = staffWorkloads;
    }
    
    public Map<StaffRole, RoleWorkload> getRoleWorkloads() {
        return roleWorkloads;
    }
    
    public void setRoleWorkloads(Map<StaffRole, RoleWorkload> roleWorkloads) {
        this.roleWorkloads = roleWorkloads;
    }
    
    public List<String> getBottlenecks() {
        return bottlenecks;
    }
    
    public void setBottlenecks(List<String> bottlenecks) {
        this.bottlenecks = bottlenecks;
    }
    
    public String getRecommendation() {
        return recommendation;
    }
    
    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
    
    @Override
    public String toString() {
        return "WorkloadStatus{" +
                "totalActiveStaff=" + totalActiveStaff +
                ", totalCapacity=" + totalCapacity +
                ", currentWorkload=" + currentWorkload +
                ", workloadPercentage=" + workloadPercentage +
                ", overallStatus='" + overallStatus + '\'' +
                '}';
    }
}