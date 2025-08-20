package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.StaffStatisticsDAO;
import com.ranbow.restaurant.dao.StaffDAO;
import com.ranbow.restaurant.models.Staff;
import com.ranbow.restaurant.models.StaffStatistics;
import com.ranbow.restaurant.models.StatisticsPeriod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Staff statistics service for performance tracking and reporting
 * Handles calculation and management of staff performance metrics
 */
@Service
public class StaffStatisticsService {

    @Autowired
    private StaffStatisticsDAO statisticsDAO;
    
    @Autowired
    private StaffDAO staffDAO;

    /**
     * Get daily statistics for a staff member
     * @param staffId Staff ID
     * @param date Target date (null for today)
     * @return Daily statistics
     */
    public Optional<StaffStatistics> getDailyStatistics(String staffId, LocalDate date) {
        try {
            LocalDate targetDate = date != null ? date : LocalDate.now();
            return statisticsDAO.findByStaffAndDate(staffId, targetDate, StatisticsPeriod.DAILY);
        } catch (Exception e) {
            System.err.println("Error getting daily statistics: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }

    /**
     * Get weekly statistics for a staff member
     * @param staffId Staff ID
     * @param weekStartDate Start date of the week (null for current week)
     * @return Weekly statistics
     */
    public Optional<StaffStatistics> getWeeklyStatistics(String staffId, LocalDate weekStartDate) {
        try {
            LocalDate targetDate = weekStartDate != null ? weekStartDate : getStartOfCurrentWeek();
            return statisticsDAO.findByStaffAndDate(staffId, targetDate, StatisticsPeriod.WEEKLY);
        } catch (Exception e) {
            System.err.println("Error getting weekly statistics: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }

    /**
     * Get monthly statistics for a staff member
     * @param staffId Staff ID
     * @param monthStartDate Start date of the month (null for current month)
     * @return Monthly statistics
     */
    public Optional<StaffStatistics> getMonthlyStatistics(String staffId, LocalDate monthStartDate) {
        try {
            LocalDate targetDate = monthStartDate != null ? monthStartDate : LocalDate.now().withDayOfMonth(1);
            return statisticsDAO.findByStaffAndDate(staffId, targetDate, StatisticsPeriod.MONTHLY);
        } catch (Exception e) {
            System.err.println("Error getting monthly statistics: " + e.getMessage());
            e.printStackTrace();
            return Optional.empty();
        }
    }

    /**
     * Get team performance metrics for current day
     * @return Team statistics summary
     */
    public TeamStatistics getTeamStatistics() {
        try {
            LocalDate today = LocalDate.now();
            List<Staff> allStaff = staffDAO.findAll();
            
            TeamStatistics teamStats = new TeamStatistics();
            teamStats.setDate(today);
            teamStats.setTotalStaff(allStaff.size());
            teamStats.setOnDutyStaff((int) allStaff.stream().filter(Staff::isOnDuty).count());
            
            int totalOrdersProcessed = 0;
            int totalOrdersCompleted = 0;
            double totalRevenue = 0.0;
            double totalEfficiencyRating = 0.0;
            int staffWithStats = 0;
            
            for (Staff staff : allStaff) {
                Optional<StaffStatistics> statsOpt = getDailyStatistics(staff.getStaffId(), today);
                if (statsOpt.isPresent()) {
                    StaffStatistics stats = statsOpt.get();
                    totalOrdersProcessed += stats.getOrdersProcessed();
                    totalOrdersCompleted += stats.getOrdersCompleted();
                    totalRevenue += stats.getTotalRevenue();
                    totalEfficiencyRating += stats.getEfficiencyRating();
                    staffWithStats++;
                }
            }
            
            teamStats.setTotalOrdersProcessed(totalOrdersProcessed);
            teamStats.setTotalOrdersCompleted(totalOrdersCompleted);
            teamStats.setTotalRevenue(totalRevenue);
            teamStats.setAverageEfficiencyRating(staffWithStats > 0 ? totalEfficiencyRating / staffWithStats : 0.0);
            teamStats.setCompletionRate(totalOrdersProcessed > 0 ? 
                (double) totalOrdersCompleted / totalOrdersProcessed : 0.0);
            
            return teamStats;
        } catch (Exception e) {
            System.err.println("Error getting team statistics: " + e.getMessage());
            e.printStackTrace();
            return new TeamStatistics(); // Return empty stats on error
        }
    }

    /**
     * Get staff leaderboard rankings
     * @param period Ranking period (DAILY, WEEKLY, MONTHLY)
     * @param limit Maximum number of results
     * @return List of top performing staff
     */
    public List<StaffLeaderboard> getStaffLeaderboard(StatisticsPeriod period, int limit) {
        try {
            LocalDate startDate = getStartDateForPeriod(period);
            List<StaffStatistics> topPerformers = statisticsDAO.findTopPerformers(period, startDate, limit);
            
            return topPerformers.stream()
                .map(stats -> {
                    Optional<Staff> staffOpt = staffDAO.findById(stats.getStaffId());
                    if (staffOpt.isPresent()) {
                        return new StaffLeaderboard(staffOpt.get(), stats);
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting staff leaderboard: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Record order completion for statistics
     * @param staffId Staff ID
     * @param processingTimeMinutes Time taken to process order
     * @param orderValue Order total value
     */
    public void recordOrderCompletion(String staffId, double processingTimeMinutes, double orderValue) {
        try {
            LocalDate today = LocalDate.now();
            StaffStatistics dailyStats = statisticsDAO.getOrCreateDailyStatistics(staffId, today);
            
            dailyStats.recordOrderCompleted(processingTimeMinutes, orderValue);
            statisticsDAO.update(dailyStats);
            
            // Update staff efficiency rating
            Optional<Staff> staffOpt = staffDAO.findById(staffId);
            if (staffOpt.isPresent()) {
                Staff staff = staffOpt.get();
                staff.setEfficiencyRating(dailyStats.getEfficiencyRating());
                staffDAO.update(staff);
            }
        } catch (Exception e) {
            System.err.println("Error recording order completion: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Record order cancellation for statistics
     * @param staffId Staff ID
     */
    public void recordOrderCancellation(String staffId) {
        try {
            LocalDate today = LocalDate.now();
            StaffStatistics dailyStats = statisticsDAO.getOrCreateDailyStatistics(staffId, today);
            
            dailyStats.recordOrderCancelled();
            statisticsDAO.update(dailyStats);
            
            // Update staff efficiency rating
            Optional<Staff> staffOpt = staffDAO.findById(staffId);
            if (staffOpt.isPresent()) {
                Staff staff = staffOpt.get();
                staff.setEfficiencyRating(dailyStats.getEfficiencyRating());
                staffDAO.update(staff);
            }
        } catch (Exception e) {
            System.err.println("Error recording order cancellation: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Record working time for a staff member
     * @param staffId Staff ID
     * @param workingMinutes Minutes worked
     * @param activeMinutes Minutes actively working on orders
     */
    public void recordWorkingTime(String staffId, int workingMinutes, int activeMinutes) {
        try {
            LocalDate today = LocalDate.now();
            StaffStatistics dailyStats = statisticsDAO.getOrCreateDailyStatistics(staffId, today);
            
            dailyStats.addWorkingTime(workingMinutes);
            dailyStats.addActiveTime(activeMinutes);
            
            int breakMinutes = Math.max(0, workingMinutes - activeMinutes);
            dailyStats.addBreakTime(breakMinutes);
            
            statisticsDAO.update(dailyStats);
        } catch (Exception e) {
            System.err.println("Error recording working time: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Get historical statistics for a staff member
     * @param staffId Staff ID
     * @param period Statistics period
     * @param limit Number of records to return
     * @return List of historical statistics
     */
    public List<StaffStatistics> getHistoricalStatistics(String staffId, StatisticsPeriod period, int limit) {
        try {
            if (period == StatisticsPeriod.DAILY) {
                return statisticsDAO.findDailyStatistics(staffId, limit);
            } else {
                return statisticsDAO.findByStaffAndPeriod(staffId, period);
            }
        } catch (Exception e) {
            System.err.println("Error getting historical statistics: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    // Utility methods
    private LocalDate getStartOfCurrentWeek() {
        return LocalDate.now().with(WeekFields.ISO.dayOfWeek(), 1);
    }

    private LocalDate getStartDateForPeriod(StatisticsPeriod period) {
        return switch (period) {
            case DAILY -> LocalDate.now();
            case WEEKLY -> getStartOfCurrentWeek();
            case MONTHLY -> LocalDate.now().withDayOfMonth(1);
        };
    }

    // Inner classes for response DTOs
    public static class TeamStatistics {
        private LocalDate date;
        private int totalStaff;
        private int onDutyStaff;
        private int totalOrdersProcessed;
        private int totalOrdersCompleted;
        private double totalRevenue;
        private double averageEfficiencyRating;
        private double completionRate;

        // Getters and Setters
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        
        public int getTotalStaff() { return totalStaff; }
        public void setTotalStaff(int totalStaff) { this.totalStaff = totalStaff; }
        
        public int getOnDutyStaff() { return onDutyStaff; }
        public void setOnDutyStaff(int onDutyStaff) { this.onDutyStaff = onDutyStaff; }
        
        public int getTotalOrdersProcessed() { return totalOrdersProcessed; }
        public void setTotalOrdersProcessed(int totalOrdersProcessed) { this.totalOrdersProcessed = totalOrdersProcessed; }
        
        public int getTotalOrdersCompleted() { return totalOrdersCompleted; }
        public void setTotalOrdersCompleted(int totalOrdersCompleted) { this.totalOrdersCompleted = totalOrdersCompleted; }
        
        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        
        public double getAverageEfficiencyRating() { return averageEfficiencyRating; }
        public void setAverageEfficiencyRating(double averageEfficiencyRating) { this.averageEfficiencyRating = averageEfficiencyRating; }
        
        public double getCompletionRate() { return completionRate; }
        public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }
    }

    public static class StaffLeaderboard {
        private Staff staff;
        private StaffStatistics statistics;
        private int rank;

        public StaffLeaderboard(Staff staff, StaffStatistics statistics) {
            this.staff = staff;
            this.statistics = statistics;
        }

        // Getters and Setters
        public Staff getStaff() { return staff; }
        public void setStaff(Staff staff) { this.staff = staff; }
        
        public StaffStatistics getStatistics() { return statistics; }
        public void setStatistics(StaffStatistics statistics) { this.statistics = statistics; }
        
        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }
        
        public String getEmployeeId() { return staff.getEmployeeId(); }
        public String getDepartment() { return staff.getDepartment(); }
        public String getPosition() { return staff.getPosition(); }
        public int getOrdersCompleted() { return statistics.getOrdersCompleted(); }
        public double getEfficiencyRating() { return statistics.getEfficiencyRating(); }
        public double getTotalRevenue() { return statistics.getTotalRevenue(); }
    }
}