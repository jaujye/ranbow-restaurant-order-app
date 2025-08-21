package com.ranbow.restaurant.services;

import com.ranbow.restaurant.models.AuditLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AuditService {
    
    // In-memory storage for demo purposes
    // In production, this should use a dedicated DAO/database table
    private List<AuditLog> auditLogs = new ArrayList<>();
    
    /**
     * Log an admin action
     */
    public void logAdminAction(String adminId, String adminName, String action, 
                              String resourceType, String resourceId, 
                              String oldValue, String newValue, 
                              String ipAddress, String userAgent, String result) {
        try {
            AuditLog log = new AuditLog(adminId, adminName, action, resourceType, resourceId);
            log.setOldValue(oldValue);
            log.setNewValue(newValue);
            log.setIpAddress(ipAddress);
            log.setUserAgent(userAgent);
            log.setResult(result);
            
            // Store the log (in production, save to database)
            auditLogs.add(log);
            
            // Print to console for debugging
            System.out.println("AUDIT LOG: " + log.toString());
            
        } catch (Exception e) {
            System.err.println("Failed to log admin action: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Log successful admin action
     */
    public void logSuccess(String adminId, String adminName, String action, 
                          String resourceType, String resourceId, 
                          String ipAddress, String userAgent) {
        logAdminAction(adminId, adminName, action, resourceType, resourceId, 
                      null, null, ipAddress, userAgent, "SUCCESS");
    }
    
    /**
     * Log failed admin action
     */
    public void logFailure(String adminId, String adminName, String action, 
                          String resourceType, String resourceId, 
                          String errorMessage, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog(adminId, adminName, action, resourceType, resourceId);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setResult("FAILURE");
        log.setErrorMessage(errorMessage);
        
        auditLogs.add(log);
        System.out.println("AUDIT LOG (FAILURE): " + log.toString());
    }
    
    /**
     * Log data change with before/after values
     */
    public void logDataChange(String adminId, String adminName, String action, 
                             String resourceType, String resourceId, 
                             String oldValue, String newValue, 
                             String ipAddress, String userAgent) {
        logAdminAction(adminId, adminName, action, resourceType, resourceId, 
                      oldValue, newValue, ipAddress, userAgent, "SUCCESS");
    }
    
    /**
     * Get audit logs with filters
     */
    public List<AuditLog> getAuditLogs(String adminId, String action, String resourceType, 
                                      LocalDateTime startDate, LocalDateTime endDate, 
                                      int limit) {
        return auditLogs.stream()
                .filter(log -> adminId == null || log.getAdminId().equals(adminId))
                .filter(log -> action == null || log.getAction().toLowerCase().contains(action.toLowerCase()))
                .filter(log -> resourceType == null || log.getResourceType().equals(resourceType))
                .filter(log -> startDate == null || log.getTimestamp().isAfter(startDate))
                .filter(log -> endDate == null || log.getTimestamp().isBefore(endDate))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp())) // Latest first
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Get recent audit logs
     */
    public List<AuditLog> getRecentAuditLogs(int limit) {
        return auditLogs.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Get audit statistics
     */
    public AuditStatistics getAuditStatistics() {
        AuditStatistics stats = new AuditStatistics();
        
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime thisWeek = LocalDateTime.now().minusDays(7);
        
        stats.setTotalLogs(auditLogs.size());
        stats.setTodayLogs((int) auditLogs.stream()
                .filter(log -> log.getTimestamp().isAfter(today))
                .count());
        stats.setThisWeekLogs((int) auditLogs.stream()
                .filter(log -> log.getTimestamp().isAfter(thisWeek))
                .count());
        stats.setFailedActions((int) auditLogs.stream()
                .filter(log -> "FAILURE".equals(log.getResult()))
                .count());
        
        return stats;
    }
    
    // Inner class for audit statistics
    public static class AuditStatistics {
        private int totalLogs;
        private int todayLogs;
        private int thisWeekLogs;
        private int failedActions;
        
        // Getters and setters
        public int getTotalLogs() { return totalLogs; }
        public void setTotalLogs(int totalLogs) { this.totalLogs = totalLogs; }
        
        public int getTodayLogs() { return todayLogs; }
        public void setTodayLogs(int todayLogs) { this.todayLogs = todayLogs; }
        
        public int getThisWeekLogs() { return thisWeekLogs; }
        public void setThisWeekLogs(int thisWeekLogs) { this.thisWeekLogs = thisWeekLogs; }
        
        public int getFailedActions() { return failedActions; }
        public void setFailedActions(int failedActions) { this.failedActions = failedActions; }
    }
}