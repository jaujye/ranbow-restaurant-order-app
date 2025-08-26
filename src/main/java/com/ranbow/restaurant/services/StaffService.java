package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.StaffDAO;
import com.ranbow.restaurant.dao.UserDAO;
import com.ranbow.restaurant.models.Staff;
import com.ranbow.restaurant.models.User;
import com.ranbow.restaurant.models.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Staff service for managing restaurant staff operations
 * Handles authentication, profile management, and staff-specific business logic
 */
@Service
public class StaffService {

    @Autowired
    private StaffDAO staffDAO;
    
    @Autowired
    private UserDAO userDAO;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private PasswordService passwordService;

    /**
     * Authenticate staff member using employee ID/email and password
     * @param identifier Employee ID or email
     * @param password Staff password
     * @return Staff object if authentication successful
     */
    public Optional<Staff> authenticateStaff(String identifier, String password) {
        try {
            System.out.println("Attempting staff authentication for identifier: " + identifier);
            
            // Try to find staff by employee ID first
            Optional<Staff> staffByEmployeeId = staffDAO.findByEmployeeId(identifier);
            if (staffByEmployeeId.isPresent()) {
                Staff staff = staffByEmployeeId.get();
                Optional<User> user = userDAO.findById(staff.getUserId());
                
                if (user.isPresent() && user.get().isActive() && 
                    (user.get().getRole() == UserRole.STAFF || user.get().getRole() == UserRole.ADMIN)) {
                    
                    // 從資料庫獲取密碼雜湊進行驗證
                    Optional<String> passwordHash = userDAO.getPasswordHashByUserId(user.get().getUserId());
                    boolean passwordValid = passwordHash.isPresent() && 
                                            passwordService.verifyPassword(password, passwordHash.get());
                    System.out.println("Password verification result for employee ID " + identifier + ": " + passwordValid);
                    
                    if (passwordValid) {
                        userDAO.updateLastLogin(user.get().getUserId(), LocalDateTime.now());
                        staff.updateActivity();
                        staffDAO.update(staff);
                        System.out.println("Staff authentication successful for: " + identifier);
                        return Optional.of(staff);
                    } else {
                        System.out.println("Password verification failed for employee ID: " + identifier);
                    }
                }
            }
            
            // Try to find by email if employee ID search failed
            Optional<User> userByEmail = userDAO.findByEmail(identifier);
            if (userByEmail.isPresent()) {
                User user = userByEmail.get();
                if (user.isActive() && 
                    (user.getRole() == UserRole.STAFF || user.getRole() == UserRole.ADMIN)) {
                    
                    Optional<Staff> staffByUserId = staffDAO.findByUserId(user.getUserId());
                    if (staffByUserId.isPresent()) {
                        // 從資料庫獲取密碼雜湊進行驗證
                        Optional<String> passwordHash = userDAO.getPasswordHashByEmail(identifier);
                        boolean passwordValid = passwordHash.isPresent() && 
                                                passwordService.verifyPassword(password, passwordHash.get());
                        System.out.println("Password verification result for email " + identifier + ": " + passwordValid);
                        
                        if (passwordValid) {
                            userDAO.updateLastLogin(user.getUserId(), LocalDateTime.now());
                            Staff staff = staffByUserId.get();
                            staff.updateActivity();
                            staffDAO.update(staff);
                            System.out.println("Staff authentication successful for: " + identifier);
                            return Optional.of(staff);
                        } else {
                            System.out.println("Password verification failed for email: " + identifier);
                        }
                    }
                }
            }
            
            System.out.println("Staff authentication failed - user not found or password invalid for: " + identifier);
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error in staff authentication: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }

    /**
     * Get staff profile information by staff ID
     * @param staffId Staff ID
     * @return Staff profile with user details
     */
    public Optional<StaffProfile> getStaffProfile(String staffId) {
        try {
            Optional<Staff> staffOpt = staffDAO.findById(staffId);
            if (staffOpt.isPresent()) {
                Staff staff = staffOpt.get();
                Optional<User> userOpt = userDAO.findById(staff.getUserId());
                
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    return Optional.of(new StaffProfile(staff, user));
                }
            }
            return Optional.empty();
        } catch (Exception e) {
            System.err.println("Error getting staff profile: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }

    /**
     * Get list of available staff for quick switching
     * @param currentStaffId Current staff ID to exclude from list
     * @return List of available staff
     */
    public List<Staff> getAvailableStaffForSwitching(String currentStaffId) {
        List<Staff> allStaff = staffDAO.findAll();
        return allStaff.stream()
                .filter(staff -> !staff.getStaffId().equals(currentStaffId))
                .filter(staff -> {
                    // Check if user is active
                    Optional<User> user = userDAO.findById(staff.getUserId());
                    return user.isPresent() && user.get().isActive();
                })
                .toList();
    }

    /**
     * Switch to different staff member
     * @param fromStaffId Current staff ID
     * @param toStaffId Target staff ID
     * @return Success status
     */
    public boolean switchStaff(String fromStaffId, String toStaffId) {
        try {
            Optional<Staff> fromStaff = staffDAO.findById(fromStaffId);
            Optional<Staff> toStaff = staffDAO.findById(toStaffId);
            
            if (fromStaff.isPresent() && toStaff.isPresent()) {
                // End shift for current staff
                Staff currentStaff = fromStaff.get();
                currentStaff.endShift();
                staffDAO.update(currentStaff);
                
                // Start shift for new staff
                Staff newStaff = toStaff.get();
                newStaff.startShift();
                staffDAO.update(newStaff);
                
                // Create notification for the switch
                notificationService.createStaffSwitchNotification(fromStaffId, toStaffId);
                
                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error in staff switching: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Start staff shift
     * @param staffId Staff ID
     * @return Success status
     */
    public boolean startShift(String staffId) {
        try {
            Optional<Staff> staffOpt = staffDAO.findById(staffId);
            if (staffOpt.isPresent()) {
                Staff staff = staffOpt.get();
                staff.startShift();
                staffDAO.update(staff);
                
                // Create shift start notification
                notificationService.createShiftStartNotification(staffId);
                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error starting shift: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * End staff shift
     * @param staffId Staff ID
     * @return Success status
     */
    public boolean endShift(String staffId) {
        try {
            Optional<Staff> staffOpt = staffDAO.findById(staffId);
            if (staffOpt.isPresent()) {
                Staff staff = staffOpt.get();
                staff.endShift();
                staffDAO.update(staff);
                
                // Create shift end notification
                notificationService.createShiftEndNotification(staffId);
                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error ending shift: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Update staff activity timestamp
     * @param staffId Staff ID
     */
    public void updateStaffActivity(String staffId) {
        try {
            staffDAO.updateActivity(staffId);
        } catch (Exception e) {
            System.err.println("Error updating staff activity: " + e.getMessage());
        }
    }

    /**
     * Record order processed by staff
     * @param staffId Staff ID
     */
    public void recordOrderProcessed(String staffId) {
        try {
            staffDAO.incrementOrdersProcessed(staffId);
            
            // Update activity
            updateStaffActivity(staffId);
        } catch (Exception e) {
            System.err.println("Error recording order processed: " + e.getMessage());
        }
    }

    /**
     * Get all staff members
     * @return List of all staff
     */
    public List<Staff> getAllStaff() {
        return staffDAO.findAll();
    }

    /**
     * Get staff by department
     * @param department Department name
     * @return List of staff in department
     */
    public List<Staff> getStaffByDepartment(String department) {
        return staffDAO.findByDepartment(department);
    }

    /**
     * Get currently on-duty staff
     * @return List of on-duty staff
     */
    public List<Staff> getOnDutyStaff() {
        return staffDAO.findOnDutyStaff();
    }

    /**
     * Update staff efficiency rating
     * @param staffId Staff ID
     * @param rating New efficiency rating (0.0 - 1.0)
     * @return Success status
     */
    public boolean updateEfficiencyRating(String staffId, double rating) {
        try {
            return staffDAO.updateEfficiencyRating(staffId, rating);
        } catch (Exception e) {
            System.err.println("Error updating efficiency rating: " + e.getMessage());
            return false;
        }
    }

    /**
     * Create new staff member
     * @param userId User ID
     * @param employeeId Employee ID
     * @param department Department
     * @param position Position
     * @return Created staff object
     */
    public Staff createStaff(String userId, String employeeId, String department, String position) {
        try {
            // Verify user exists and has correct role
            Optional<User> userOpt = userDAO.findById(userId);
            if (userOpt.isEmpty()) {
                throw new IllegalArgumentException("User not found: " + userId);
            }
            
            User user = userOpt.get();
            if (user.getRole() != UserRole.STAFF && user.getRole() != UserRole.ADMIN) {
                throw new IllegalArgumentException("User must have STAFF or ADMIN role");
            }
            
            // Check if employee ID is already taken
            if (staffDAO.existsByEmployeeId(employeeId)) {
                throw new IllegalArgumentException("Employee ID already exists: " + employeeId);
            }
            
            Staff newStaff = new Staff(userId, employeeId, department, position);
            return staffDAO.save(newStaff);
        } catch (Exception e) {
            System.err.println("Error creating staff: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create staff member", e);
        }
    }

    /**
     * Reset daily counters for all staff (typically run at start of day)
     */
    public void resetDailyCounters() {
        try {
            staffDAO.resetDailyCounters();
        } catch (Exception e) {
            System.err.println("Error resetting daily counters: " + e.getMessage());
        }
    }

    // Inner class for staff profile combining Staff and User data
    public static class StaffProfile {
        private Staff staff;
        private User user;

        public StaffProfile(Staff staff, User user) {
            this.staff = staff;
            this.user = user;
        }

        public Staff getStaff() {
            return staff;
        }

        public User getUser() {
            return user;
        }

        public String getDisplayName() {
            return user.getUsername();
        }

        public String getEmployeeId() {
            return staff.getEmployeeId();
        }

        public String getDepartment() {
            return staff.getDepartment();
        }

        public String getPosition() {
            return staff.getPosition();
        }

        public boolean isOnDuty() {
            return staff.isOnDuty();
        }

        public double getEfficiencyRating() {
            return staff.getEfficiencyRating();
        }

        public int getDailyOrdersProcessed() {
            return staff.getDailyOrdersProcessed();
        }
    }
}