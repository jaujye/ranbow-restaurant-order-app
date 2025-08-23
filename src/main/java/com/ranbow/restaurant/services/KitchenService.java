package com.ranbow.restaurant.services;

import com.ranbow.restaurant.dao.CookingTimerDAO;
import com.ranbow.restaurant.dao.KitchenOrderDAO;
import com.ranbow.restaurant.dao.OrderDAO;
import com.ranbow.restaurant.models.*;
import com.ranbow.restaurant.services.KitchenCapacityEngine.*;
import com.ranbow.restaurant.staff.model.dto.*;
import com.ranbow.restaurant.staff.model.dto.KitchenCapacity;
import com.ranbow.restaurant.staff.model.entity.OrderPriority;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Kitchen service for managing kitchen operations
 * Handles cooking workflow, timing, and kitchen-specific order management
 */
@Service
@Transactional
public class KitchenService {

    @Autowired
    private OrderDAO orderDAO;
    
    @Autowired
    private CookingTimerDAO cookingTimerDAO;
    
    @Autowired
    private KitchenOrderDAO kitchenOrderDAO;
    
    @Autowired
    private StaffService staffService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private CookingTimerEngine cookingTimerEngine;
    
    @Autowired
    private KitchenCapacityEngine capacityEngine;
    
    @Autowired
    private KitchenWebSocketService webSocketService;

    // ===== COOKING TIMER MANAGEMENT =====

    /**
     * Start cooking session with timer management
     * @param request Start cooking request
     * @param staffId Staff member ID
     * @return Cooking session response
     */
    @Transactional
    public CookingSessionResponse startCookingSession(StartCookingRequest request, String staffId) {
        try {
            // Get order
            Optional<Order> orderOpt = orderDAO.findById(request.getOrderId());
            if (orderOpt.isEmpty()) {
                return CookingSessionResponse.error("Order not found: " + request.getOrderId());
            }
            
            Order order = orderOpt.get();
            
            // Check kitchen capacity
            if (!capacityEngine.canAcceptNewOrder(order)) {
                return CookingSessionResponse.error("Kitchen at capacity - cannot start new order");
            }
            
            // Create cooking timer
            CookingTimer timer = cookingTimerEngine.createTimer(
                order, staffId, request.getEstimatedDurationSeconds()
            );
            
            // Start timer
            timer = cookingTimerEngine.startTimer(timer.getTimerId());
            
            // Update order status
            orderDAO.updateStatus(order.getOrderId(), OrderStatus.PREPARING);
            
            // Record staff activity
            staffService.updateStaffActivity(staffId);
            
            // Broadcast to WebSocket clients
            webSocketService.broadcastTimerStart(timer);
            webSocketService.broadcastNewOrderToKitchen(order);
            
            return CookingSessionResponse.success(timer);
            
        } catch (Exception e) {
            System.err.println("Error starting cooking session: " + e.getMessage());
            e.printStackTrace();
            return CookingSessionResponse.error("Failed to start cooking session: " + e.getMessage());
        }
    }

    /**
     * Update timer status
     * @param timerId Timer ID
     * @param newStatus New cooking status
     * @return Timer update response
     */
    @Transactional
    public TimerUpdateResponse updateTimerStatus(String timerId, CookingStatus newStatus) {
        try {
            CookingTimer timer = null;
            
            switch (newStatus) {
                case RUNNING:
                    timer = cookingTimerEngine.resumeTimer(timerId);
                    break;
                case PAUSED:
                    timer = cookingTimerEngine.pauseTimer(timerId, "Manual pause");
                    break;
                case COMPLETED:
                    timer = cookingTimerEngine.completeTimer(timerId, 0);
                    // Update order status to ready
                    orderDAO.updateStatus(timer.getOrder().getOrderId(), OrderStatus.READY);
                    break;
                case CANCELLED:
                    timer = cookingTimerEngine.cancelTimer(timerId, "Manual cancellation");
                    orderDAO.updateStatus(timer.getOrder().getOrderId(), OrderStatus.CANCELLED);
                    break;
                default:
                    return TimerUpdateResponse.error("Invalid status transition: " + newStatus);
            }
            
            return TimerUpdateResponse.success(timer);
            
        } catch (Exception e) {
            System.err.println("Error updating timer status: " + e.getMessage());
            e.printStackTrace();
            return TimerUpdateResponse.error("Failed to update timer: " + e.getMessage());
        }
    }

    /**
     * Pause cooking timer
     * @param timerId Timer ID
     * @param staffId Staff member ID
     * @return Timer action response
     */
    @Transactional
    public TimerActionResponse pauseTimer(String timerId, String staffId) {
        try {
            CookingTimer timer = cookingTimerEngine.pauseTimer(timerId, "Paused by staff: " + staffId);
            staffService.updateStaffActivity(staffId);
            
            return TimerActionResponse.success("Timer paused successfully", timer);
            
        } catch (Exception e) {
            System.err.println("Error pausing timer: " + e.getMessage());
            e.printStackTrace();
            return TimerActionResponse.error("Failed to pause timer: " + e.getMessage());
        }
    }

    /**
     * Resume cooking timer
     * @param timerId Timer ID
     * @param staffId Staff member ID
     * @return Timer action response
     */
    @Transactional
    public TimerActionResponse resumeTimer(String timerId, String staffId) {
        try {
            CookingTimer timer = cookingTimerEngine.resumeTimer(timerId);
            staffService.updateStaffActivity(staffId);
            
            return TimerActionResponse.success("Timer resumed successfully", timer);
            
        } catch (Exception e) {
            System.err.println("Error resuming timer: " + e.getMessage());
            e.printStackTrace();
            return TimerActionResponse.error("Failed to resume timer: " + e.getMessage());
        }
    }

    /**
     * Complete cooking timer
     * @param timerId Timer ID
     * @param request Timer completion request
     * @return Timer completion response
     */
    @Transactional
    public TimerCompletionResponse completeTimer(String timerId, TimerCompletionRequest request) {
        try {
            CookingTimer timer = cookingTimerEngine.completeTimer(timerId, request.getActualDurationSeconds());
            
            // Set quality score if provided
            if (request.getQualityScore() != null) {
                timer.setQualityScore(request.getQualityScore());
                cookingTimerDAO.update(timer);
            }
            
            // Update order status
            orderDAO.updateStatus(timer.getOrder().getOrderId(), OrderStatus.READY);
            
            // Record staff completion
            if (timer.getChef() != null) {
                staffService.recordOrderProcessed(timer.getChef().getStaffId());
            }
            
            // Calculate efficiency
            var efficiency = cookingTimerEngine.calculateEfficiency(timer);
            
            return TimerCompletionResponse.success(timer, efficiency);
            
        } catch (Exception e) {
            System.err.println("Error completing timer: " + e.getMessage());
            e.printStackTrace();
            return TimerCompletionResponse.error("Failed to complete timer: " + e.getMessage());
        }
    }

    // ===== WORKLOAD MANAGEMENT =====

    /**
     * Calculate current kitchen workload
     * @return Kitchen workload response
     */
    public KitchenWorkloadResponse calculateCurrentWorkload() {
        try {
            KitchenCapacity capacity = capacityEngine.calculateCurrentCapacity();
            List<CookingTimer> activeTimers = cookingTimerEngine.getActiveTimers();
            
            // Calculate average cooking time
            double avgCookingTime = activeTimers.stream()
                    .filter(timer -> timer.getEstimatedDurationSeconds() != null)
                    .mapToInt(CookingTimer::getEstimatedDurationSeconds)
                    .average()
                    .orElse(1200.0) / 60.0; // Convert to minutes
            
            // Get station statuses
            List<KitchenStationStatus> stations = Arrays.stream(WorkstationType.values())
                    .map(this::mapToStationStatus)
                    .collect(Collectors.toList());
            
            // Check for alerts
            WorkloadAlert alert = capacityEngine.checkCapacityThresholds();
            if (alert != null) {
                webSocketService.broadcastCapacityAlert(alert);
            }
            
            // Create a simple response using the existing KitchenWorkloadResponse structure
            KitchenWorkloadResponse response = new KitchenWorkloadResponse();
            
            // Set basic statistics
            KitchenWorkloadResponse.KitchenStatistics stats = new KitchenWorkloadResponse.KitchenStatistics();
            stats.setTotalActiveTimers(capacity.getActiveOrders());
            stats.setCompletedToday(capacity.getActiveOrders()); 
            stats.setAverageWaitTime(avgCookingTime);
            stats.setKitchenEfficiency(85.0); // Default value
            stats.setBusyLevel(capacity.getStatus());
            
            response.setStatistics(stats);
            return response;
            
        } catch (Exception e) {
            System.err.println("Error calculating workload: " + e.getMessage());
            e.printStackTrace();
            KitchenWorkloadResponse errorResponse = new KitchenWorkloadResponse();
            // Set error state
            return errorResponse;
        }
    }

    /**
     * Get workload distribution by station
     * @return Workload distribution
     */
    public WorkloadDistribution getWorkloadByStation() {
        return capacityEngine.getWorkloadByStation();
    }

    /**
     * Check if kitchen is at capacity
     * @return true if at capacity
     */
    public boolean isKitchenAtCapacity() {
        KitchenCapacity capacity = capacityEngine.calculateCurrentCapacity();
        return capacity.getCapacityPercentage() >= KitchenCapacityEngine.CAPACITY_CRITICAL;
    }

    /**
     * Get overdue timers
     * @return List of overdue cooking timers
     */
    public List<CookingTimer> getOverdueTimers() {
        return cookingTimerEngine.getOverdueTimers();
    }

    // ===== STATION MANAGEMENT =====

    /**
     * Get all station status
     * @return List of kitchen station statuses
     */
    public List<KitchenStationStatus> getAllStationStatus() {
        return Arrays.stream(WorkstationType.values())
                .map(this::mapToStationStatus)
                .collect(Collectors.toList());
    }

    /**
     * Assign order to station
     * @param stationId Station ID
     * @param orderId Order ID
     * @param staffId Staff member ID
     * @return Station assignment response
     */
    @Transactional
    public StationAssignmentResponse assignOrderToStation(String stationId, String orderId, String staffId) {
        try {
            // Check station capacity
            StationCapacity capacity = capacityEngine.calculateStationCapacity(stationId);
            if (capacity.getCapacityPercentage() >= 100) {
                return StationAssignmentResponse.error("Station at full capacity");
            }
            
            // Get order
            Optional<Order> orderOpt = orderDAO.findById(orderId);
            if (orderOpt.isEmpty()) {
                return StationAssignmentResponse.error("Order not found");
            }
            
            // Check if timer already exists
            Optional<CookingTimer> timerOpt = cookingTimerDAO.findByOrderId(orderId);
            if (timerOpt.isPresent()) {
                // Update existing timer's workstation
                CookingTimer timer = timerOpt.get();
                timer.setWorkstationId(stationId);
                try {
                    timer.setWorkstationType(WorkstationType.valueOf(stationId));
                } catch (IllegalArgumentException e) {
                    // Handle custom station IDs
                }
                cookingTimerDAO.update(timer);
            }
            
            // Record staff activity
            staffService.updateStaffActivity(staffId);
            
            return StationAssignmentResponse.success(stationId, orderId, staffId);
            
        } catch (Exception e) {
            System.err.println("Error assigning order to station: " + e.getMessage());
            e.printStackTrace();
            return StationAssignmentResponse.error("Failed to assign order: " + e.getMessage());
        }
    }

    /**
     * Calculate station capacity
     * @param stationId Station ID
     * @return Station capacity
     */
    public StationCapacity calculateStationCapacity(String stationId) {
        return capacityEngine.calculateStationCapacity(stationId);
    }

    // ===== PERFORMANCE ANALYTICS =====

    /**
     * Get performance metrics
     * @param period Time period (daily, weekly, monthly)
     * @param stationId Optional station filter
     * @return Kitchen performance metrics
     */
    public KitchenPerformanceMetrics getPerformanceMetrics(String period, String stationId) {
        try {
            int days = switch (period != null ? period.toLowerCase() : "daily") {
                case "weekly" -> 7;
                case "monthly" -> 30;
                default -> 1;
            };
            
            var baseMetrics = cookingTimerDAO.getPerformanceMetrics(days);
            
            return new KitchenPerformanceMetrics(
                baseMetrics.getTotalOrders(),
                baseMetrics.getCompletedOrders(),
                baseMetrics.getOnTimeOrders(),
                baseMetrics.getAvgCookingTimeSeconds() / 60.0, // Convert to minutes
                baseMetrics.getAvgVarianceSeconds() / 60.0, // Convert to minutes
                baseMetrics.getCompletionRate(),
                baseMetrics.getOnTimeRate(),
                period,
                LocalDateTime.now()
            );
            
        } catch (Exception e) {
            System.err.println("Error getting performance metrics: " + e.getMessage());
            e.printStackTrace();
            return KitchenPerformanceMetrics.empty();
        }
    }

    /**
     * Generate efficiency report
     * @param startDate Start date
     * @param endDate End date
     * @return Efficiency report
     */
    public EfficiencyReport generateEfficiencyReport(LocalDate startDate, LocalDate endDate) {
        try {
            List<CookingTimer> timers = cookingTimerDAO.findByDateRange(
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59)
            );
            
            double avgEfficiency = timers.stream()
                    .filter(timer -> timer.getStatus().isCompleted())
                    .mapToDouble(timer -> {
                        Object effObj = cookingTimerEngine.calculateEfficiency(timer);
                        return effObj instanceof Double ? (Double) effObj : 0.0;
                    })
                    .average()
                    .orElse(0.0);
            
            int efficiencyCount = (int) timers.stream()
                    .filter(timer -> timer.getStatus().isCompleted())
                    .count();
            
            long onTimeCount = timers.stream()
                    .filter(timer -> timer.getStatus().isCompleted())
                    .mapToLong(timer -> {
                        // Consider on-time if actual duration <= estimated duration
                        if (timer.getEstimatedDurationSeconds() != null && timer.getActualDurationSeconds() != null) {
                            return timer.getActualDurationSeconds() <= timer.getEstimatedDurationSeconds() ? 1 : 0;
                        }
                        return 0;
                    })
                    .sum();
            
            return new EfficiencyReport(
                efficiencyCount,
                avgEfficiency,
                efficiencyCount > 0 ? onTimeCount * 100.0 / efficiencyCount : 0.0,
                startDate,
                endDate,
                List.of() // Empty list since efficiencies variable was removed
            );
            
        } catch (Exception e) {
            System.err.println("Error generating efficiency report: " + e.getMessage());
            e.printStackTrace();
            return EfficiencyReport.empty();
        }
    }

    /**
     * Analyze cooking times by dish type
     * @return List of cooking time analyses
     */
    public List<CookingTimeAnalysis> analyzeCookingTimes() {
        try {
            // Get distinct dish categories
            List<String> categories = List.of("主食", "飲品", "甜點", "小食", "湯品");
            
            return categories.stream()
                    .map(category -> {
                        var avgTime = cookingTimerEngine.getAverageCookingTime(category);
                        return new CookingTimeAnalysis(
                            category,
                            avgTime.getSampleSize(),
                            avgTime.getAverageMinutes(),
                            avgTime.getMinMinutes(),
                            avgTime.getMaxMinutes()
                        );
                    })
                    .filter(analysis -> analysis.getSampleSize() > 0)
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            System.err.println("Error analyzing cooking times: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    // ===== STAFF CONTROLLER API METHODS =====

    /**
     * Get detailed kitchen order information
     * @param orderId Order ID
     * @return Kitchen order details
     */
    public KitchenOrderDetails getKitchenOrderDetails(String orderId) {
        try {
            Optional<Order> orderOpt = orderDAO.findById(orderId);
            if (orderOpt.isEmpty()) {
                return null;
            }
            
            Order order = orderOpt.get();
            KitchenOrderDetails details = new KitchenOrderDetails(order);
            
            // Check for assigned chef
            Optional<CookingTimer> timerOpt = cookingTimerDAO.findByOrderId(orderId);
            if (timerOpt.isPresent() && timerOpt.get().getChef() != null) {
                details.setAssignedChef(timerOpt.get().getChef().getName());
            }
            
            return details;
            
        } catch (Exception e) {
            System.err.println("Error getting kitchen order details: " + e.getMessage());
            return null;
        }
    }

    /**
     * Get kitchen queue (orders waiting to be prepared)
     * @return List of kitchen orders in queue
     */
    public List<KitchenOrder> getKitchenQueue() {
        try {
            return kitchenOrderDAO.findByStatus(KitchenStatus.QUEUED);
        } catch (Exception e) {
            System.err.println("Error getting kitchen queue: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get active kitchen orders (currently being prepared)
     * @return List of kitchen orders currently being prepared
     */
    public List<KitchenOrder> getActiveKitchenOrders() {
        try {
            return kitchenOrderDAO.findByStatus(KitchenStatus.COOKING);
        } catch (Exception e) {
            System.err.println("Error getting active kitchen orders: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get overdue orders
     * @return List of overdue kitchen orders
     */
    public List<KitchenOrder> getOverdueOrders() {
        try {
            return kitchenOrderDAO.findOverdueOrders();
        } catch (Exception e) {
            System.err.println("Error getting overdue orders: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Start preparing an order
     * @param orderId Order ID
     * @param staffId Staff member ID
     * @return Success status
     */
    @Transactional
    public boolean startPreparingOrder(String orderId, String staffId) {
        try {
            Optional<Order> orderOpt = orderDAO.findById(orderId);
            if (orderOpt.isEmpty()) {
                return false;
            }
            
            Order order = orderOpt.get();
            
            // Update order status
            orderDAO.updateStatus(orderId, OrderStatus.PREPARING);
            
            // Create cooking timer if not exists
            Optional<CookingTimer> existingTimer = cookingTimerDAO.findByOrderId(orderId);
            if (existingTimer.isEmpty()) {
                // Calculate estimated duration
                int estimatedMinutes = 15; // Default
                if (order.getItems() != null && !order.getItems().isEmpty()) {
                    estimatedMinutes = order.getItems().size() * 5; // 5 minutes per item
                    estimatedMinutes = Math.min(Math.max(estimatedMinutes, 5), 45); // Between 5-45 minutes
                }
                
                StartCookingRequest request = new StartCookingRequest();
                request.setOrderId(orderId);
                request.setEstimatedDurationSeconds(estimatedMinutes * 60);
                
                CookingSessionResponse response = startCookingSession(request, staffId);
                return response.isSuccess();
            }
            
            // Update staff activity
            staffService.updateStaffActivity(staffId);
            
            return true;
            
        } catch (Exception e) {
            System.err.println("Error starting order preparation: " + e.getMessage());
            return false;
        }
    }

    /**
     * Update cooking timer for an order
     * @param orderId Order ID
     * @param minutes Additional minutes needed
     * @param staffId Staff member ID
     * @return Success status
     */
    @Transactional
    public boolean updateCookingTimer(String orderId, int minutes, String staffId) {
        try {
            Optional<CookingTimer> timerOpt = cookingTimerDAO.findByOrderId(orderId);
            if (timerOpt.isEmpty()) {
                return false;
            }
            
            CookingTimer timer = timerOpt.get();
            
            // Add additional time to the timer
            timer.setEstimatedDurationSeconds(timer.getEstimatedDurationSeconds() + (minutes * 60));
            cookingTimerDAO.update(timer);
            
            // Update staff activity
            staffService.updateStaffActivity(staffId);
            
            // Broadcast timer update
            webSocketService.broadcastTimerUpdate(timer.getTimerId(), timer.getElapsedSeconds());
            
            return true;
            
        } catch (Exception e) {
            System.err.println("Error updating cooking timer: " + e.getMessage());
            return false;
        }
    }

    /**
     * Complete an order
     * @param orderId Order ID
     * @param staffId Staff member ID
     * @return Success status
     */
    @Transactional
    public boolean completeOrder(String orderId, String staffId) {
        try {
            Optional<Order> orderOpt = orderDAO.findById(orderId);
            if (orderOpt.isEmpty()) {
                return false;
            }
            
            // Update order status
            orderDAO.updateStatus(orderId, OrderStatus.READY);
            
            // Complete cooking timer if exists
            Optional<CookingTimer> timerOpt = cookingTimerDAO.findByOrderId(orderId);
            if (timerOpt.isPresent()) {
                CookingTimer timer = timerOpt.get();
                cookingTimerEngine.completeTimer(timer.getTimerId(), timer.getElapsedSeconds());
            }
            
            // Update staff activity and record completion
            staffService.updateStaffActivity(staffId);
            staffService.recordOrderProcessed(staffId);
            
            // Send notification
            Order order = orderOpt.get();
            // Note: notifyOrderReady method not available, implement if needed
            
            return true;
            
        } catch (Exception e) {
            System.err.println("Error completing order: " + e.getMessage());
            return false;
        }
    }

    // Helper methods
    
    private KitchenStationStatus mapToStationStatus(WorkstationType stationType) {
        String stationId = stationType.getStationId();
        StationCapacity capacity = capacityEngine.calculateStationCapacity(stationId);
        
        List<CookingTimerSummary> activeTimers = cookingTimerEngine.getTimersByWorkstation(stationId)
                .stream()
                .map(timer -> new CookingTimerSummary(
                    timer.getTimerId(),
                    timer.getOrder().getOrderId(),
                    timer.getElapsedSeconds(),
                    timer.getRemainingSeconds(),
                    timer.getStage().toString(),
                    timer.getProgressPercentage()
                ))
                .collect(Collectors.toList());
        
        return new KitchenStationStatus(
            stationId,
            stationType.getName(),
            capacity.getCapacityPercentage(),
            capacity.getActiveOrders(),
            capacity.getAssignedStaffIds(),
            activeTimers,
            capacity.getAverageEfficiency()
        );
    }
}