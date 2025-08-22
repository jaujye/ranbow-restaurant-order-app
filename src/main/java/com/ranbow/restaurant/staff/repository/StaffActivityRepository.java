package com.ranbow.restaurant.staff.repository;

import com.ranbow.restaurant.staff.model.entity.StaffActivity;
import com.ranbow.restaurant.staff.model.entity.ActivityType;
import com.ranbow.restaurant.staff.model.entity.ActivityAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Staff Activity Repository
 * Handles database operations for StaffActivity entities
 */
@Repository
public interface StaffActivityRepository extends JpaRepository<StaffActivity, String> {
    
    /**
     * Find activities by staff member with pagination
     */
    Page<StaffActivity> findByStaffIdOrderByCreatedAtDesc(String staffId, Pageable pageable);
    
    /**
     * Find activities by staff member in date range
     */
    List<StaffActivity> findByStaffIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String staffId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find activities by type
     */
    List<StaffActivity> findByActivityTypeOrderByCreatedAtDesc(ActivityType activityType);
    
    /**
     * Find activities by action
     */
    List<StaffActivity> findByActivityActionOrderByCreatedAtDesc(ActivityAction activityAction);
    
    /**
     * Find error activities
     */
    List<StaffActivity> findBySuccessFalseOrderByCreatedAtDesc();
    
    /**
     * Find security-related activities
     */
    @Query("SELECT s FROM StaffActivity s WHERE s.activityType IN ('AUTHENTICATION', 'SECURITY') " +
           "ORDER BY s.createdAt DESC")
    List<StaffActivity> findSecurityActivities();
    
    /**
     * Find activities by order ID
     */
    List<StaffActivity> findByOrderIdOrderByCreatedAtDesc(String orderId);
    
    /**
     * Find activities by shift ID
     */
    List<StaffActivity> findByShiftIdOrderByCreatedAtDesc(String shiftId);
    
    /**
     * Find recent activities for dashboard
     */
    @Query("SELECT s FROM StaffActivity s WHERE s.createdAt >= :cutoffTime " +
           "ORDER BY s.createdAt DESC")
    List<StaffActivity> findRecentActivities(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Find high importance activities
     */
    @Query("SELECT s FROM StaffActivity s WHERE s.activityType IN " +
           "('AUTHENTICATION', 'PAYMENT_PROCESSING', 'SYSTEM_ADMINISTRATION', 'SECURITY', 'ERROR') " +
           "ORDER BY s.createdAt DESC")
    List<StaffActivity> findHighImportanceActivities();
    
    /**
     * Count activities by type for statistics
     */
    @Query("SELECT s.activityType, COUNT(s) FROM StaffActivity s " +
           "WHERE s.createdAt >= :startDate AND s.createdAt <= :endDate " +
           "GROUP BY s.activityType")
    List<Object[]> countActivitiesByType(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);
    
    /**
     * Count activities by staff member
     */
    @Query("SELECT s.staffId, COUNT(s) FROM StaffActivity s " +
           "WHERE s.createdAt >= :startDate AND s.createdAt <= :endDate " +
           "GROUP BY s.staffId ORDER BY COUNT(s) DESC")
    List<Object[]> countActivitiesByStaff(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find failed activities by staff member
     */
    @Query("SELECT s FROM StaffActivity s WHERE s.staffId = :staffId AND s.success = false " +
           "ORDER BY s.createdAt DESC")
    List<StaffActivity> findFailedActivitiesByStaff(@Param("staffId") String staffId);
    
    /**
     * Count failed login attempts by staff member in time window
     */
    @Query("SELECT COUNT(s) FROM StaffActivity s WHERE s.staffId = :staffId " +
           "AND s.activityAction = 'LOGIN_FAILED' AND s.createdAt >= :cutoffTime")
    long countFailedLoginAttempts(@Param("staffId") String staffId, 
                                  @Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Find suspicious activities (multiple failed logins, unauthorized access, etc.)
     */
    @Query("SELECT s FROM StaffActivity s WHERE s.activityAction IN " +
           "('LOGIN_FAILED', 'UNAUTHORIZED_ACCESS', 'SECURITY_VIOLATION') " +
           "AND s.createdAt >= :cutoffTime ORDER BY s.createdAt DESC")
    List<StaffActivity> findSuspiciousActivities(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Get activity statistics for dashboard
     */
    @Query("SELECT COUNT(s), COUNT(CASE WHEN s.success = false THEN 1 END), " +
           "COUNT(CASE WHEN s.activityType = 'ORDER_MANAGEMENT' THEN 1 END), " +
           "COUNT(CASE WHEN s.activityType = 'KITCHEN_OPERATIONS' THEN 1 END) " +
           "FROM StaffActivity s WHERE DATE(s.createdAt) = DATE(:date)")
    Object[] getActivityStatisticsForDate(@Param("date") LocalDateTime date);
    
    /**
     * Find activities with long duration
     */
    @Query("SELECT s FROM StaffActivity s WHERE s.durationSeconds IS NOT NULL " +
           "AND s.durationSeconds > :maxSeconds ORDER BY s.durationSeconds DESC")
    List<StaffActivity> findLongDurationActivities(@Param("maxSeconds") int maxSeconds);
    
    /**
     * Find activities by device ID (for session tracking)
     */
    List<StaffActivity> findByDeviceIdOrderByCreatedAtDesc(String deviceId);
    
    /**
     * Find activities by IP address (for security monitoring)
     */
    List<StaffActivity> findByIpAddressOrderByCreatedAtDesc(String ipAddress);
    
    /**
     * Find latest login activity for staff member
     */
    @Query("SELECT s FROM StaffActivity s WHERE s.staffId = :staffId " +
           "AND s.activityAction = 'LOGIN' ORDER BY s.createdAt DESC LIMIT 1")
    Optional<StaffActivity> findLatestLoginActivity(@Param("staffId") String staffId);
    
    /**
     * Find all activities for audit trail
     */
    @Query("SELECT s FROM StaffActivity s WHERE s.activityType IN " +
           "('AUTHENTICATION', 'PAYMENT_PROCESSING', 'SYSTEM_ADMINISTRATION', 'SECURITY') " +
           "AND s.createdAt >= :startDate AND s.createdAt <= :endDate " +
           "ORDER BY s.createdAt DESC")
    List<StaffActivity> findAuditTrailActivities(@Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);
    
    /**
     * Get performance-related activities for staff evaluation
     */
    @Query("SELECT s FROM StaffActivity s WHERE s.staffId = :staffId " +
           "AND s.activityType IN ('ORDER_MANAGEMENT', 'KITCHEN_OPERATIONS', 'CUSTOMER_SERVICE') " +
           "AND s.createdAt >= :startDate AND s.createdAt <= :endDate " +
           "ORDER BY s.createdAt ASC")
    List<StaffActivity> findPerformanceActivitiesForStaff(@Param("staffId") String staffId,
                                                          @Param("startDate") LocalDateTime startDate,
                                                          @Param("endDate") LocalDateTime endDate);
    
    /**
     * Get hourly activity distribution for a date
     */
    @Query("SELECT EXTRACT(HOUR FROM s.createdAt) as hour, COUNT(s) FROM StaffActivity s " +
           "WHERE DATE(s.createdAt) = DATE(:date) GROUP BY EXTRACT(HOUR FROM s.createdAt) " +
           "ORDER BY EXTRACT(HOUR FROM s.createdAt)")
    List<Object[]> getHourlyActivityDistribution(@Param("date") LocalDateTime date);
    
    /**
     * Find most active staff members in date range
     */
    @Query("SELECT s.staffId, COUNT(s) as activityCount FROM StaffActivity s " +
           "WHERE s.createdAt >= :startDate AND s.createdAt <= :endDate " +
           "GROUP BY s.staffId ORDER BY COUNT(s) DESC")
    List<Object[]> findMostActiveStaff(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);
    
    /**
     * Delete old activities for cleanup (respecting retention policy)
     */
    @Query("DELETE FROM StaffActivity s WHERE s.createdAt < :cutoffDate " +
           "AND s.activityType NOT IN ('AUTHENTICATION', 'SECURITY', 'PAYMENT_PROCESSING')")
    int deleteOldActivities(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Delete old low-importance activities
     */
    @Query("DELETE FROM StaffActivity s WHERE s.createdAt < :cutoffDate " +
           "AND s.activityType IN ('SHIFT_MANAGEMENT', 'TRAINING', 'OTHER')")
    int deleteOldLowImportanceActivities(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Count total activities for staff member
     */
    long countByStaffId(String staffId);
    
    /**
     * Count successful activities for staff member
     */
    long countByStaffIdAndSuccessTrue(String staffId);
    
    /**
     * Count activities by type and success status
     */
    @Query("SELECT s.activityType, s.success, COUNT(s) FROM StaffActivity s " +
           "WHERE s.createdAt >= :startDate AND s.createdAt <= :endDate " +
           "GROUP BY s.activityType, s.success")
    List<Object[]> countActivitiesByTypeAndSuccess(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
}