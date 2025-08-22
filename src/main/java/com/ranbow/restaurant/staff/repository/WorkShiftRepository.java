package com.ranbow.restaurant.staff.repository;

import com.ranbow.restaurant.staff.model.entity.WorkShift;
import com.ranbow.restaurant.staff.model.entity.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Work Shift Repository
 * Handles database operations for WorkShift entities
 */
@Repository
public interface WorkShiftRepository extends JpaRepository<WorkShift, String> {
    
    /**
     * Find current active shift for a staff member
     */
    Optional<WorkShift> findByStaffIdAndShiftStatusIn(String staffId, List<ShiftStatus> activeStatuses);
    
    /**
     * Find all shifts for a staff member on a specific date
     */
    @Query("SELECT w FROM WorkShift w WHERE w.staffId = :staffId " +
           "AND DATE(w.shiftDate) = DATE(:date) ORDER BY w.scheduledStartTime ASC")
    List<WorkShift> findByStaffIdAndShiftDate(@Param("staffId") String staffId, 
                                              @Param("date") LocalDateTime date);
    
    /**
     * Find all active shifts currently in progress
     */
    List<WorkShift> findByShiftStatusInOrderByActualStartTimeAsc(List<ShiftStatus> activeStatuses);
    
    /**
     * Find shifts by date range
     */
    @Query("SELECT w FROM WorkShift w WHERE w.shiftDate >= :startDate AND w.shiftDate <= :endDate " +
           "ORDER BY w.shiftDate ASC, w.scheduledStartTime ASC")
    List<WorkShift> findByShiftDateBetween(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find shifts for specific staff member in date range
     */
    @Query("SELECT w FROM WorkShift w WHERE w.staffId = :staffId " +
           "AND w.shiftDate >= :startDate AND w.shiftDate <= :endDate " +
           "ORDER BY w.shiftDate ASC")
    List<WorkShift> findByStaffIdAndShiftDateBetween(@Param("staffId") String staffId,
                                                     @Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find shifts by status
     */
    List<WorkShift> findByShiftStatusOrderByShiftDateDescScheduledStartTimeDesc(ShiftStatus status);
    
    /**
     * Find overdue shifts (should have started but didn't)
     */
    @Query("SELECT w FROM WorkShift w WHERE w.shiftStatus = 'SCHEDULED' " +
           "AND w.scheduledStartTime < :currentTime")
    List<WorkShift> findOverdueShifts(@Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find shifts that need to end soon
     */
    @Query("SELECT w FROM WorkShift w WHERE w.shiftStatus IN ('IN_PROGRESS', 'ON_BREAK') " +
           "AND w.scheduledEndTime <= :endSoonTime")
    List<WorkShift> findShiftsEndingSoon(@Param("endSoonTime") LocalDateTime endSoonTime);
    
    /**
     * Count shifts by status for dashboard
     */
    @Query("SELECT w.shiftStatus, COUNT(w) FROM WorkShift w " +
           "WHERE DATE(w.shiftDate) = DATE(:date) GROUP BY w.shiftStatus")
    List<Object[]> countShiftsByStatusForDate(@Param("date") LocalDateTime date);
    
    /**
     * Get shift statistics for a date range
     */
    @Query("SELECT COUNT(w), AVG(w.ordersProcessed), AVG(w.overtimeMinutes), " +
           "AVG(w.performanceScore) FROM WorkShift w " +
           "WHERE w.shiftStatus = 'COMPLETED' AND w.shiftDate >= :startDate AND w.shiftDate <= :endDate")
    Object[] getShiftStatistics(@Param("startDate") LocalDateTime startDate, 
                                @Param("endDate") LocalDateTime endDate);
    
    /**
     * Get staff performance statistics
     */
    @Query("SELECT w.staffId, COUNT(w), AVG(w.ordersProcessed), AVG(w.performanceScore), " +
           "SUM(w.overtimeMinutes) FROM WorkShift w " +
           "WHERE w.shiftStatus = 'COMPLETED' AND w.shiftDate >= :startDate AND w.shiftDate <= :endDate " +
           "GROUP BY w.staffId")
    List<Object[]> getStaffPerformanceStatistics(@Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find late arrivals (started more than 15 minutes after scheduled)
     */
    @Query("SELECT w FROM WorkShift w WHERE w.actualStartTime > " +
           "w.scheduledStartTime + INTERVAL '15' MINUTE " +
           "AND w.shiftDate >= :startDate AND w.shiftDate <= :endDate")
    List<WorkShift> findLateArrivals(@Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find shifts with high overtime
     */
    @Query("SELECT w FROM WorkShift w WHERE w.overtimeMinutes > :overtimeThreshold " +
           "AND w.shiftStatus = 'COMPLETED' AND w.shiftDate >= :startDate")
    List<WorkShift> findHighOvertimeShifts(@Param("overtimeThreshold") int overtimeThreshold,
                                           @Param("startDate") LocalDateTime startDate);
    
    /**
     * Find best performing shifts
     */
    @Query("SELECT w FROM WorkShift w WHERE w.performanceScore >= :minScore " +
           "AND w.shiftStatus = 'COMPLETED' ORDER BY w.performanceScore DESC")
    List<WorkShift> findBestPerformingShifts(@Param("minScore") double minScore);
    
    /**
     * Get total hours worked by staff member in date range
     */
    @Query("SELECT SUM(EXTRACT(EPOCH FROM (w.actualEndTime - w.actualStartTime)) / 3600) " +
           "FROM WorkShift w WHERE w.staffId = :staffId " +
           "AND w.shiftStatus = 'COMPLETED' " +
           "AND w.actualStartTime >= :startDate AND w.actualEndTime <= :endDate")
    Double getTotalHoursWorked(@Param("staffId") String staffId,
                               @Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find upcoming shifts for notifications
     */
    @Query("SELECT w FROM WorkShift w WHERE w.shiftStatus = 'SCHEDULED' " +
           "AND w.scheduledStartTime >= :startTime AND w.scheduledStartTime <= :endTime " +
           "ORDER BY w.scheduledStartTime ASC")
    List<WorkShift> findUpcomingShifts(@Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);
    
    /**
     * Update shift status
     */
    @Query("UPDATE WorkShift w SET w.shiftStatus = :status, w.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE w.shiftId = :shiftId")
    int updateShiftStatus(@Param("shiftId") String shiftId, @Param("status") ShiftStatus status);
    
    /**
     * Start shift
     */
    @Query("UPDATE WorkShift w SET w.actualStartTime = :startTime, w.shiftStatus = 'IN_PROGRESS', " +
           "w.updatedAt = :startTime WHERE w.shiftId = :shiftId")
    int startShift(@Param("shiftId") String shiftId, @Param("startTime") LocalDateTime startTime);
    
    /**
     * End shift
     */
    @Query("UPDATE WorkShift w SET w.actualEndTime = :endTime, w.shiftStatus = 'COMPLETED', " +
           "w.updatedAt = :endTime WHERE w.shiftId = :shiftId")
    int endShift(@Param("shiftId") String shiftId, @Param("endTime") LocalDateTime endTime);
    
    /**
     * Update orders processed count
     */
    @Query("UPDATE WorkShift w SET w.ordersProcessed = w.ordersProcessed + 1, " +
           "w.updatedAt = CURRENT_TIMESTAMP WHERE w.shiftId = :shiftId")
    int incrementOrdersProcessed(@Param("shiftId") String shiftId);
    
    /**
     * Add break time
     */
    @Query("UPDATE WorkShift w SET w.breakMinutes = w.breakMinutes + :minutes, " +
           "w.updatedAt = CURRENT_TIMESTAMP WHERE w.shiftId = :shiftId")
    int addBreakTime(@Param("shiftId") String shiftId, @Param("minutes") int minutes);
}