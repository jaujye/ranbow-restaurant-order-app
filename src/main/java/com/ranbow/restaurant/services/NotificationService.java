package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.NotificationDAO;
import com.ranbow.restaurant.dao.StaffDAO;
import com.ranbow.restaurant.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Notification service for managing staff notifications
 * Handles creation, delivery, and management of various notification types
 */
@Service
public class NotificationService {

    @Autowired
    private NotificationDAO notificationDAO;
    
    @Autowired
    private StaffDAO staffDAO;

    /**
     * Get all notifications for a staff member
     * @param staffId Staff ID
     * @return List of notifications
     */
    public List<Notification> getStaffNotifications(String staffId) {
        try {
            return notificationDAO.findByStaffId(staffId);
        } catch (Exception e) {
            System.err.println("Error getting staff notifications: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Get unread notifications for a staff member
     * @param staffId Staff ID
     * @return List of unread notifications
     */
    public List<Notification> getUnreadNotifications(String staffId) {
        try {
            return notificationDAO.findUnreadByStaffId(staffId);
        } catch (Exception e) {
            System.err.println("Error getting unread notifications: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Count unread notifications for a staff member
     * @param staffId Staff ID
     * @return Number of unread notifications
     */
    public int countUnreadNotifications(String staffId) {
        try {
            return notificationDAO.countUnreadNotifications(staffId);
        } catch (Exception e) {
            System.err.println("Error counting unread notifications: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Mark notification as read
     * @param notificationId Notification ID
     * @return Success status
     */
    public boolean markAsRead(String notificationId) {
        try {
            return notificationDAO.markAsRead(notificationId);
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            return false;
        }
    }

    /**
     * Mark all notifications as read for a staff member
     * @param staffId Staff ID
     * @return Number of notifications marked as read
     */
    public int markAllAsRead(String staffId) {
        try {
            return notificationDAO.markAllAsRead(staffId);
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Create new order notification for staff
     * @param orderId Order ID
     * @param customerInfo Customer information
     * @param tableNumber Table number
     */
    public void createNewOrderNotification(String orderId, String customerInfo, int tableNumber) {
        try {
            List<Staff> kitchenStaff = staffDAO.findByDepartment("廚房");
            String message = String.format("桌號 %d 的新訂單 - %s", tableNumber, customerInfo);
            
            for (Staff staff : kitchenStaff) {
                if (staff.isOnDuty()) {
                    Notification notification = Notification.newOrderNotification(staff.getStaffId(), orderId, message);
                    notificationDAO.save(notification);
                }
            }
        } catch (Exception e) {
            System.err.println("Error creating new order notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Create order status update notification
     * @param orderId Order ID
     * @param oldStatus Previous status
     * @param newStatus New status
     * @param updatedByStaffId Staff ID who made the update
     */
    public void createOrderStatusUpdateNotification(String orderId, OrderStatus oldStatus, 
                                                  OrderStatus newStatus, String updatedByStaffId) {
        try {
            List<Staff> allStaff = staffDAO.findOnDutyStaff();
            
            for (Staff staff : allStaff) {
                // Don't notify the staff member who made the update
                if (!staff.getStaffId().equals(updatedByStaffId)) {
                    Notification notification = Notification.orderStatusUpdateNotification(
                        staff.getStaffId(), orderId, oldStatus, newStatus);
                    notificationDAO.save(notification);
                }
            }
        } catch (Exception e) {
            System.err.println("Error creating order status update notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Create emergency order notification
     * @param orderId Order ID
     * @param reason Emergency reason
     */
    public void createEmergencyNotification(String orderId, String reason) {
        try {
            List<Staff> allOnDutyStaff = staffDAO.findOnDutyStaff();
            
            for (Staff staff : allOnDutyStaff) {
                Notification notification = Notification.emergencyNotification(staff.getStaffId(), orderId, reason);
                notificationDAO.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Error creating emergency notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Create overtime order notification
     * @param orderId Order ID
     * @param overdueMinutes Minutes overdue
     * @param assignedStaffId Staff assigned to the order
     */
    public void createOvertimeOrderNotification(String orderId, int overdueMinutes, String assignedStaffId) {
        try {
            // Notify the assigned staff member
            if (assignedStaffId != null) {
                Notification notification = Notification.overtimeOrderNotification(
                    assignedStaffId, orderId, overdueMinutes);
                notificationDAO.save(notification);
            }
            
            // Also notify management/supervisors
            List<Staff> managers = staffDAO.findByPosition("Manager");
            for (Staff manager : managers) {
                if (manager.isOnDuty() && !manager.getStaffId().equals(assignedStaffId)) {
                    Notification notification = Notification.overtimeOrderNotification(
                        manager.getStaffId(), orderId, overdueMinutes);
                    notificationDAO.save(notification);
                }
            }
        } catch (Exception e) {
            System.err.println("Error creating overtime order notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Create staff switch notification
     * @param fromStaffId Staff switching out
     * @param toStaffId Staff switching in
     */
    public void createStaffSwitchNotification(String fromStaffId, String toStaffId) {
        try {
            Optional<Staff> fromStaff = staffDAO.findById(fromStaffId);
            Optional<Staff> toStaff = staffDAO.findById(toStaffId);
            
            if (fromStaff.isPresent() && toStaff.isPresent()) {
                String message = String.format("員工切換: %s → %s", 
                    fromStaff.get().getEmployeeId(), toStaff.get().getEmployeeId());
                
                // Notify both staff members
                Notification notificationFrom = Notification.systemNotification(
                    fromStaffId, "班次結束", "您的班次已結束");
                notificationDAO.save(notificationFrom);
                
                Notification notificationTo = Notification.systemNotification(
                    toStaffId, "班次開始", "您的班次已開始");
                notificationDAO.save(notificationTo);
                
                // Notify other staff in the same department
                List<Staff> departmentStaff = staffDAO.findByDepartment(toStaff.get().getDepartment());
                for (Staff staff : departmentStaff) {
                    if (staff.isOnDuty() && 
                        !staff.getStaffId().equals(fromStaffId) && 
                        !staff.getStaffId().equals(toStaffId)) {
                        Notification notification = Notification.systemNotification(
                            staff.getStaffId(), "員工切換", message);
                        notificationDAO.save(notification);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error creating staff switch notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Create shift start notification
     * @param staffId Staff ID
     */
    public void createShiftStartNotification(String staffId) {
        try {
            Notification notification = Notification.systemNotification(
                staffId, "班次開始", "歡迎回來！您的班次已開始。");
            notificationDAO.save(notification);
        } catch (Exception e) {
            System.err.println("Error creating shift start notification: " + e.getMessage());
        }
    }

    /**
     * Create shift end notification
     * @param staffId Staff ID
     */
    public void createShiftEndNotification(String staffId) {
        try {
            Notification notification = Notification.systemNotification(
                staffId, "班次結束", "感謝您今天的辛勤工作！");
            notificationDAO.save(notification);
        } catch (Exception e) {
            System.err.println("Error creating shift end notification: " + e.getMessage());
        }
    }

    /**
     * Broadcast notification to multiple staff members
     * @param staffIds List of staff IDs
     * @param type Notification type
     * @param title Notification title
     * @param message Notification message
     * @param priority Notification priority
     */
    public void broadcastNotification(List<String> staffIds, NotificationType type, 
                                    String title, String message, NotificationPriority priority) {
        try {
            notificationDAO.broadcastNotification(staffIds, type, title, message, priority);
        } catch (Exception e) {
            System.err.println("Error broadcasting notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Broadcast to all on-duty staff
     * @param type Notification type
     * @param title Notification title
     * @param message Notification message
     * @param priority Notification priority
     */
    public void broadcastToOnDutyStaff(NotificationType type, String title, 
                                     String message, NotificationPriority priority) {
        try {
            List<Staff> onDutyStaff = staffDAO.findOnDutyStaff();
            List<String> staffIds = onDutyStaff.stream()
                .map(Staff::getStaffId)
                .toList();
            
            if (!staffIds.isEmpty()) {
                broadcastNotification(staffIds, type, title, message, priority);
            }
        } catch (Exception e) {
            System.err.println("Error broadcasting to on-duty staff: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Broadcast to department staff
     * @param department Department name
     * @param type Notification type
     * @param title Notification title
     * @param message Notification message
     * @param priority Notification priority
     */
    public void broadcastToDepartment(String department, NotificationType type, String title, 
                                    String message, NotificationPriority priority) {
        try {
            List<Staff> departmentStaff = staffDAO.findByDepartment(department);
            List<String> staffIds = departmentStaff.stream()
                .filter(Staff::isOnDuty)
                .map(Staff::getStaffId)
                .toList();
            
            if (!staffIds.isEmpty()) {
                broadcastNotification(staffIds, type, title, message, priority);
            }
        } catch (Exception e) {
            System.err.println("Error broadcasting to department: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Get recent notifications within specified time period
     * @param staffId Staff ID
     * @param hours Number of hours to look back
     * @return List of recent notifications
     */
    public List<Notification> getRecentNotifications(String staffId, int hours) {
        try {
            LocalDateTime since = LocalDateTime.now().minusHours(hours);
            return notificationDAO.findRecentNotifications(staffId, since);
        } catch (Exception e) {
            System.err.println("Error getting recent notifications: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Clean up expired and old notifications
     * @return Number of notifications cleaned up
     */
    public int cleanupNotifications() {
        try {
            int expiredDeleted = notificationDAO.deleteExpiredNotifications();
            int oldDeleted = notificationDAO.deleteOldReadNotifications(LocalDateTime.now().minusDays(30));
            return expiredDeleted + oldDeleted;
        } catch (Exception e) {
            System.err.println("Error cleaning up notifications: " + e.getMessage());
            return 0;
        }
    }
}