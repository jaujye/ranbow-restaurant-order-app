package com.ranbow.restaurant.staff.repository;

import com.ranbow.restaurant.staff.model.entity.CookingTimer;
import com.ranbow.restaurant.staff.model.entity.CookingStage;
import com.ranbow.restaurant.staff.model.entity.TimerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Cooking Timer Repository
 * Handles database operations for CookingTimer entities
 */
@Repository
public interface CookingTimerRepository extends JpaRepository<CookingTimer, String> {
    
    /**
     * Find all timers for a specific order
     */
    List<CookingTimer> findByOrderIdOrderByCreatedAtAsc(String orderId);
    
    /**
     * Find active timers for a staff member
     */
    List<CookingTimer> findByStaffIdAndTimerStatusInOrderByEstimatedCompletionTimeAsc(
            String staffId, List<TimerStatus> activeStatuses);
    
    /**
     * Find all active timers
     */
    List<CookingTimer> findByTimerStatusInOrderByEstimatedCompletionTimeAsc(List<TimerStatus> activeStatuses);
    
    /**
     * Find timers by cooking stage
     */
    List<CookingTimer> findByCookingStageAndTimerStatusInOrderByStartedAtAsc(
            CookingStage cookingStage, List<TimerStatus> activeStatuses);
    
    /**
     * Find overdue timers
     */
    @Query("SELECT c FROM CookingTimer c WHERE c.estimatedCompletionTime < :currentTime " +
           "AND c.timerStatus IN :activeStatuses")
    List<CookingTimer> findOverdueTimers(@Param("currentTime") LocalDateTime currentTime,
                                         @Param("activeStatuses") List<TimerStatus> activeStatuses);
    
    /**
     * Find timers that need alerts
     */
    @Query("SELECT c FROM CookingTimer c WHERE c.estimatedCompletionTime <= :alertTime " +
           "AND c.alertSentAt IS NULL AND c.timerStatus = 'RUNNING'")
    List<CookingTimer> findTimersNeedingAlert(@Param("alertTime") LocalDateTime alertTime);
    
    /**
     * Find timers by menu item
     */
    List<CookingTimer> findByMenuItemIdAndTimerStatusInOrderByStartedAtAsc(
            String menuItemId, List<TimerStatus> statuses);
    
    /**
     * Get cooking statistics by staff member
     */
    @Query("SELECT c.staffId, COUNT(c), AVG(c.actualDurationMinutes), " +
           "COUNT(CASE WHEN c.timerStatus = 'COMPLETED' THEN 1 END) " +
           "FROM CookingTimer c WHERE c.startedAt >= :startDate AND c.startedAt <= :endDate " +
           "GROUP BY c.staffId")
    List<Object[]> getCookingStatisticsByStaff(@Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);
    
    /**
     * Get cooking statistics by menu item
     */
    @Query("SELECT c.menuItemId, c.menuItemName, COUNT(c), AVG(c.actualDurationMinutes), " +
           "AVG(c.estimatedDurationMinutes) FROM CookingTimer c " +
           "WHERE c.timerStatus = 'COMPLETED' AND c.startedAt >= :startDate AND c.startedAt <= :endDate " +
           "GROUP BY c.menuItemId, c.menuItemName")
    List<Object[]> getCookingStatisticsByMenuItem(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find timers with quality check results
     */
    @Query("SELECT c FROM CookingTimer c WHERE c.qualityCheckPassed IS NOT NULL " +
           "ORDER BY c.completedAt DESC")
    List<CookingTimer> findTimersWithQualityCheck();
    
    /**
     * Find failed quality check timers
     */
    @Query("SELECT c FROM CookingTimer c WHERE c.qualityCheckPassed = false " +
           "AND c.completedAt >= :startDate ORDER BY c.completedAt DESC")
    List<CookingTimer> findFailedQualityCheckTimers(@Param("startDate") LocalDateTime startDate);
    
    /**
     * Count timers by status for dashboard
     */
    @Query("SELECT c.timerStatus, COUNT(c) FROM CookingTimer c " +
           "WHERE DATE(c.createdAt) = DATE(:date) GROUP BY c.timerStatus")
    List<Object[]> countTimersByStatusForDate(@Param("date") LocalDateTime date);
    
    /**
     * Find timers by cooking method
     */
    List<CookingTimer> findByCookingMethodAndTimerStatusInOrderByStartedAtAsc(
            String cookingMethod, List<TimerStatus> statuses);
    
    /**
     * Find long-running timers
     */
    @Query("SELECT c FROM CookingTimer c WHERE c.startedAt IS NOT NULL " +
           "AND c.startedAt < :thresholdTime AND c.timerStatus = 'RUNNING'")
    List<CookingTimer> findLongRunningTimers(@Param("thresholdTime") LocalDateTime thresholdTime);
    
    /**
     * Find timers with high temperature requirements
     */
    @Query("SELECT c FROM CookingTimer c WHERE c.temperatureCelsius >= :minTemp " +
           "AND c.timerStatus IN :activeStatuses ORDER BY c.temperatureCelsius DESC")
    List<CookingTimer> findHighTemperatureTimers(@Param("minTemp") int minTemp,
                                                  @Param("activeStatuses") List<TimerStatus> activeStatuses);
    
    /**
     * Get kitchen workload (count of active timers)
     */
    @Query("SELECT COUNT(c) FROM CookingTimer c WHERE c.timerStatus IN :activeStatuses")
    long getKitchenWorkload(@Param("activeStatuses") List<TimerStatus> activeStatuses);
    
    /**
     * Get kitchen workload by staff
     */
    @Query("SELECT c.staffId, COUNT(c) FROM CookingTimer c " +
           "WHERE c.timerStatus IN :activeStatuses GROUP BY c.staffId")
    List<Object[]> getKitchenWorkloadByStaff(@Param("activeStatuses") List<TimerStatus> activeStatuses);
    
    /**
     * Find average cooking times by item
     */
    @Query("SELECT c.menuItemId, c.menuItemName, AVG(c.actualDurationMinutes) " +
           "FROM CookingTimer c WHERE c.timerStatus = 'COMPLETED' AND c.actualDurationMinutes IS NOT NULL " +
           "GROUP BY c.menuItemId, c.menuItemName HAVING COUNT(c) >= :minSampleSize")
    List<Object[]> getAverageCookingTimes(@Param("minSampleSize") long minSampleSize);
    
    /**
     * Find efficiency variations (actual vs estimated time)
     */
    @Query("SELECT c.staffId, AVG((c.actualDurationMinutes - c.estimatedDurationMinutes) / c.estimatedDurationMinutes) " +
           "FROM CookingTimer c WHERE c.timerStatus = 'COMPLETED' AND c.actualDurationMinutes IS NOT NULL " +
           "AND c.estimatedDurationMinutes > 0 GROUP BY c.staffId")
    List<Object[]> getCookingEfficiencyByStaff();
    
    /**
     * Start timer
     */
    @Query("UPDATE CookingTimer c SET c.startedAt = :startTime, c.timerStatus = 'RUNNING', " +
           "c.cookingStage = 'COOKING', c.estimatedCompletionTime = :completionTime, " +
           "c.updatedAt = :startTime WHERE c.timerId = :timerId")
    int startTimer(@Param("timerId") String timerId, 
                   @Param("startTime") LocalDateTime startTime,
                   @Param("completionTime") LocalDateTime completionTime);
    
    /**
     * Pause timer
     */
    @Query("UPDATE CookingTimer c SET c.pausedAt = :pauseTime, c.timerStatus = 'PAUSED', " +
           "c.updatedAt = :pauseTime WHERE c.timerId = :timerId")
    int pauseTimer(@Param("timerId") String timerId, @Param("pauseTime") LocalDateTime pauseTime);
    
    /**
     * Resume timer
     */
    @Query("UPDATE CookingTimer c SET c.pausedAt = null, c.timerStatus = 'RUNNING', " +
           "c.updatedAt = CURRENT_TIMESTAMP WHERE c.timerId = :timerId")
    int resumeTimer(@Param("timerId") String timerId);
    
    /**
     * Complete timer
     */
    @Query("UPDATE CookingTimer c SET c.completedAt = :completedTime, c.timerStatus = 'COMPLETED', " +
           "c.cookingStage = 'READY', c.updatedAt = :completedTime WHERE c.timerId = :timerId")
    int completeTimer(@Param("timerId") String timerId, @Param("completedTime") LocalDateTime completedTime);
    
    /**
     * Update cooking stage
     */
    @Query("UPDATE CookingTimer c SET c.cookingStage = :stage, c.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE c.timerId = :timerId")
    int updateCookingStage(@Param("timerId") String timerId, @Param("stage") CookingStage stage);
    
    /**
     * Record alert sent
     */
    @Query("UPDATE CookingTimer c SET c.alertSentAt = :alertTime, c.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE c.timerId = :timerId")
    int recordAlertSent(@Param("timerId") String timerId, @Param("alertTime") LocalDateTime alertTime);
    
    /**
     * Update quality check result
     */
    @Query("UPDATE CookingTimer c SET c.qualityCheckPassed = :passed, c.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE c.timerId = :timerId")
    int updateQualityCheckResult(@Param("timerId") String timerId, @Param("passed") boolean passed);
    
    /**
     * Update estimated completion time
     */
    @Query("UPDATE CookingTimer c SET c.estimatedCompletionTime = :completionTime, " +
           "c.updatedAt = CURRENT_TIMESTAMP WHERE c.timerId = :timerId")
    int updateEstimatedCompletionTime(@Param("timerId") String timerId, 
                                      @Param("completionTime") LocalDateTime completionTime);
    
    /**
     * Add pause time to total
     */
    @Query("UPDATE CookingTimer c SET c.totalPausedMinutes = c.totalPausedMinutes + :minutes, " +
           "c.updatedAt = CURRENT_TIMESTAMP WHERE c.timerId = :timerId")
    int addPauseTime(@Param("timerId") String timerId, @Param("minutes") int minutes);
}