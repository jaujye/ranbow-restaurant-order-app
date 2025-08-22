package com.ranbow.restaurant.staff.repository;

import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.model.entity.StaffRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Staff Member Repository
 * Handles database operations for StaffMember entities
 */
@Repository
public interface StaffMemberRepository extends JpaRepository<StaffMember, String> {
    
    /**
     * Find staff member by employee number (for login)
     */
    Optional<StaffMember> findByEmployeeNumber(String employeeNumber);
    
    /**
     * Find all active staff members
     */
    List<StaffMember> findByIsActiveTrue();
    
    /**
     * Find all staff members by role
     */
    List<StaffMember> findByRoleAndIsActiveTrue(StaffRole role);
    
    /**
     * Find staff member by email
     */
    Optional<StaffMember> findByEmailAndIsActiveTrue(String email);
    
    /**
     * Find staff member by current device ID (for session management)
     */
    Optional<StaffMember> findByCurrentDeviceIdAndIsActiveTrue(String deviceId);
    
    /**
     * Find staff members who are currently locked
     */
    List<StaffMember> findByAccountLockedUntilAfter(LocalDateTime currentTime);
    
    /**
     * Find staff members who haven't logged in recently
     */
    @Query("SELECT s FROM StaffMember s WHERE s.lastLoginAt < :cutoffDate AND s.isActive = true")
    List<StaffMember> findInactiveStaff(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Find staff members with failed login attempts
     */
    @Query("SELECT s FROM StaffMember s WHERE s.failedLoginAttempts >= :threshold AND s.isActive = true")
    List<StaffMember> findStaffWithFailedLogins(@Param("threshold") int threshold);
    
    /**
     * Count active staff by role
     */
    @Query("SELECT COUNT(s) FROM StaffMember s WHERE s.role = :role AND s.isActive = true")
    long countActiveStaffByRole(@Param("role") StaffRole role);
    
    /**
     * Find staff members by full name (for search)
     */
    @Query("SELECT s FROM StaffMember s WHERE LOWER(s.fullName) LIKE LOWER(CONCAT('%', :name, '%')) AND s.isActive = true")
    List<StaffMember> findByFullNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Check if employee number is already taken
     */
    boolean existsByEmployeeNumberAndStaffIdNot(String employeeNumber, String staffId);
    
    /**
     * Check if email is already taken
     */
    boolean existsByEmailAndStaffIdNot(String email, String staffId);
    
    /**
     * Find recently created staff members
     */
    @Query("SELECT s FROM StaffMember s WHERE s.createdAt >= :fromDate ORDER BY s.createdAt DESC")
    List<StaffMember> findRecentlyCreated(@Param("fromDate") LocalDateTime fromDate);
    
    /**
     * Find staff members who need password change (old passwords)
     */
    @Query("SELECT s FROM StaffMember s WHERE s.passwordChangedAt < :cutoffDate AND s.isActive = true")
    List<StaffMember> findStaffNeedingPasswordChange(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Get staff statistics by role
     */
    @Query("SELECT s.role, COUNT(s), " +
           "SUM(CASE WHEN s.lastLoginAt >= :recentCutoff THEN 1 ELSE 0 END) as recentLogins " +
           "FROM StaffMember s WHERE s.isActive = true GROUP BY s.role")
    List<Object[]> getStaffStatisticsByRole(@Param("recentCutoff") LocalDateTime recentCutoff);
    
    /**
     * Find all staff members for administrative purposes (including inactive)
     */
    @Query("SELECT s FROM StaffMember s ORDER BY s.role ASC, s.fullName ASC")
    List<StaffMember> findAllForAdmin();
    
    /**
     * Update last login time for staff member
     */
    @Query("UPDATE StaffMember s SET s.lastLoginAt = :loginTime, s.currentDeviceId = :deviceId, " +
           "s.failedLoginAttempts = 0, s.accountLockedUntil = null, s.updatedAt = :loginTime " +
           "WHERE s.staffId = :staffId")
    int updateLoginInfo(@Param("staffId") String staffId, 
                        @Param("loginTime") LocalDateTime loginTime, 
                        @Param("deviceId") String deviceId);
    
    /**
     * Increment failed login attempts
     */
    @Query("UPDATE StaffMember s SET s.failedLoginAttempts = s.failedLoginAttempts + 1, " +
           "s.updatedAt = CURRENT_TIMESTAMP WHERE s.staffId = :staffId")
    int incrementFailedLoginAttempts(@Param("staffId") String staffId);
    
    /**
     * Lock staff account
     */
    @Query("UPDATE StaffMember s SET s.accountLockedUntil = :lockUntil, " +
           "s.updatedAt = CURRENT_TIMESTAMP WHERE s.staffId = :staffId")
    int lockAccount(@Param("staffId") String staffId, @Param("lockUntil") LocalDateTime lockUntil);
    
    /**
     * Unlock staff account
     */
    @Query("UPDATE StaffMember s SET s.accountLockedUntil = null, s.failedLoginAttempts = 0, " +
           "s.updatedAt = CURRENT_TIMESTAMP WHERE s.staffId = :staffId")
    int unlockAccount(@Param("staffId") String staffId);
    
    /**
     * Clear device ID on logout
     */
    @Query("UPDATE StaffMember s SET s.currentDeviceId = null, " +
           "s.updatedAt = CURRENT_TIMESTAMP WHERE s.staffId = :staffId")
    int clearDeviceId(@Param("staffId") String staffId);
    
    /**
     * Deactivate staff member
     */
    @Query("UPDATE StaffMember s SET s.isActive = false, s.currentDeviceId = null, " +
           "s.updatedAt = CURRENT_TIMESTAMP WHERE s.staffId = :staffId")
    int deactivateStaff(@Param("staffId") String staffId);
}