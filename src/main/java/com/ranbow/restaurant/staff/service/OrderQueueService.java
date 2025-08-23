package com.ranbow.restaurant.staff.service;

import com.ranbow.restaurant.dao.OrderDAO;
import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.models.OrderStatus;
import com.ranbow.restaurant.staff.model.dto.*;
import com.ranbow.restaurant.staff.model.entity.*;
import com.ranbow.restaurant.staff.repository.OrderAssignmentRepository;
import com.ranbow.restaurant.staff.repository.StaffMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Order Queue Service Implementation
 * Core service for staff order management operations
 * 
 * Features:
 * - Order queue management with filtering and pagination
 * - Order status updates with workflow validation
 * - Staff assignment management with workload tracking
 * - Performance analytics and statistics
 * - Cache integration for real-time updates
 * - Comprehensive error handling and logging
 */
@Service
@Transactional
public class OrderQueueService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderQueueService.class);
    
    @Autowired
    private OrderDAO orderDAO;
    
    @Autowired
    private OrderAssignmentRepository orderAssignmentRepository;
    
    @Autowired
    private StaffMemberRepository staffMemberRepository;
    
    @Autowired
    private OrderQueueCacheService cacheService;
    
    // Constants
    private static final int DEFAULT_OVERDUE_THRESHOLD_MINUTES = 30;
    private static final int MAX_STAFF_WORKLOAD = 5;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    /**
     * Order Queue Filter DTO
     * Used for filtering order queue results
     */
    public static class OrderQueueFilter {
        private String status;
        private String priority;
        private String assignedTo;
        private String tableNumber;
        private boolean overdue;
        private LocalDateTime fromDate;
        private LocalDateTime toDate;
        
        // Getters and Setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getAssignedTo() { return assignedTo; }
        public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
        public String getTableNumber() { return tableNumber; }
        public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }
        public boolean isOverdue() { return overdue; }
        public void setOverdue(boolean overdue) { this.overdue = overdue; }
        public LocalDateTime getFromDate() { return fromDate; }
        public void setFromDate(LocalDateTime fromDate) { this.fromDate = fromDate; }
        public LocalDateTime getToDate() { return toDate; }
        public void setToDate(LocalDateTime toDate) { this.toDate = toDate; }
    }
    
    /**
     * Enhanced Order Queue Response DTO
     * Comprehensive response with queue data, statistics, and metadata
     */
    public static class OrderQueueResponseEnhanced {
        private List<StaffOrderDetails> orders;
        private PaginationInfo pagination;
        private OrderQueueStatistics statistics;
        private WorkloadStatus workloadStatus;
        private LocalDateTime lastUpdated;
        private int totalActiveOrders;
        private int averageWaitTimeMinutes;
        
        public OrderQueueResponseEnhanced() {
            this.orders = new ArrayList<>();
            this.lastUpdated = LocalDateTime.now();
        }
        
        // Getters and Setters
        public List<StaffOrderDetails> getOrders() { return orders; }
        public void setOrders(List<StaffOrderDetails> orders) { this.orders = orders; }
        public PaginationInfo getPagination() { return pagination; }
        public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
        public OrderQueueStatistics getStatistics() { return statistics; }
        public void setStatistics(OrderQueueStatistics statistics) { this.statistics = statistics; }
        public WorkloadStatus getWorkloadStatus() { return workloadStatus; }
        public void setWorkloadStatus(WorkloadStatus workloadStatus) { this.workloadStatus = workloadStatus; }
        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
        public int getTotalActiveOrders() { return totalActiveOrders; }
        public void setTotalActiveOrders(int totalActiveOrders) { this.totalActiveOrders = totalActiveOrders; }
        public int getAverageWaitTimeMinutes() { return averageWaitTimeMinutes; }
        public void setAverageWaitTimeMinutes(int averageWaitTimeMinutes) { this.averageWaitTimeMinutes = averageWaitTimeMinutes; }
    }
    
    /**
     * Order Queue Statistics DTO
     */
    public static class OrderQueueStatistics {
        private int pendingCount;
        private int processingCount;
        private int completedCount;
        private int overdueCount;
        private double averageProcessingTime;
        private int totalOrdersToday;
        
        // Getters and Setters
        public int getPendingCount() { return pendingCount; }
        public void setPendingCount(int pendingCount) { this.pendingCount = pendingCount; }
        public int getProcessingCount() { return processingCount; }
        public void setProcessingCount(int processingCount) { this.processingCount = processingCount; }
        public int getCompletedCount() { return completedCount; }
        public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }
        public int getOverdueCount() { return overdueCount; }
        public void setOverdueCount(int overdueCount) { this.overdueCount = overdueCount; }
        public double getAverageProcessingTime() { return averageProcessingTime; }
        public void setAverageProcessingTime(double averageProcessingTime) { this.averageProcessingTime = averageProcessingTime; }
        public int getTotalOrdersToday() { return totalOrdersToday; }
        public void setTotalOrdersToday(int totalOrdersToday) { this.totalOrdersToday = totalOrdersToday; }
    }
    
    /**
     * Get Order Queue with Advanced Filtering
     * Returns paginated list of orders with comprehensive filtering options
     */
    public ApiResponse<OrderQueueResponseEnhanced> getOrderQueue(OrderQueueFilter filter, Pageable pageable) {
        try {
            logger.debug("Getting order queue with filter: status={}, assignedTo={}, overdue={}", 
                        filter.getStatus(), filter.getAssignedTo(), filter.isOverdue());
            
            // Get filtered orders
            List<Order> allOrders = getFilteredOrders(filter);
            
            // Apply pagination
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allOrders.size());
            List<Order> pageOrders = allOrders.subList(start, end);
            
            // Convert to staff order details
            List<StaffOrderDetails> orderDetails = pageOrders.stream()
                .map(this::convertToStaffOrderDetails)
                .collect(Collectors.toList());
            
            // Create enhanced response
            OrderQueueResponseEnhanced response = new OrderQueueResponseEnhanced();
            response.setOrders(orderDetails);
            
            // Create pagination info
            PaginationInfo pagination = new PaginationInfo();
            pagination.setPageNumber(pageable.getPageNumber());
            pagination.setPageSize(pageable.getPageSize());
            pagination.setTotalElements((long) allOrders.size());
            pagination.setTotalPages((int) Math.ceil((double) allOrders.size() / pageable.getPageSize()));
            pagination.setFirst(pageable.getPageNumber() == 0);
            pagination.setLast(pageable.getPageNumber() >= pagination.getTotalPages() - 1);
            response.setPagination(pagination);
            
            // Add statistics
            response.setStatistics(calculateQueueStatistics());
            
            // Add workload status
            response.setWorkloadStatus(calculateWorkloadStatus(filter.getAssignedTo()));
            
            // Set additional metrics
            response.setTotalActiveOrders(allOrders.size());
            response.setAverageWaitTimeMinutes(calculateAverageWaitTime());
            
            logger.info("Retrieved {} orders for queue (total: {})", orderDetails.size(), allOrders.size());
            
            return ApiResponse.success("Order queue retrieved successfully", response);
            
        } catch (Exception e) {
            logger.error("Error retrieving order queue: ", e);
            return ApiResponse.internalError("Failed to retrieve order queue");
        }
    }
    
    /**
     * Update Order Status
     * Updates order status with comprehensive validation and workflow enforcement
     */
    public ApiResponse<OrderStatusUpdateResponse> updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String staffId) {
        try {
            logger.info("Updating order {} status from {} to {} by staff {}", 
                       orderId, request.getCurrentStatus(), request.getNewStatus(), staffId);
            
            // Find order
            Optional<Order> orderOpt = orderDAO.findById(orderId.toString());
            if (orderOpt.isEmpty()) {
                return ApiResponse.notFound("Order not found: " + orderId);
            }
            
            Order order = orderOpt.get();
            OrderStatus currentStatus = order.getStatus();
            OrderStatus newStatus;
            
            try {
                newStatus = OrderStatus.valueOf(request.getNewStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ApiResponse.badRequest("Invalid order status: " + request.getNewStatus());
            }
            
            // Validate status transition
            if (!isValidStatusTransition(currentStatus, newStatus)) {
                return ApiResponse.invalidOrderStatus(currentStatus.toString(), newStatus.toString());
            }
            
            // Update order status
            boolean updated = orderDAO.updateStatus(orderId.toString(), newStatus);
            if (!updated) {
                return ApiResponse.error("Failed to update order status", "UPDATE_FAILED");
            }
            
            // Update assignment if exists
            Optional<OrderAssignment> assignmentOpt = orderAssignmentRepository.findByOrderId(orderId.toString());
            if (assignmentOpt.isPresent()) {
                OrderAssignment assignment = assignmentOpt.get();
                updateAssignmentStatus(assignment, newStatus, staffId, request.getNotes());
                orderAssignmentRepository.save(assignment);
            }
            
            // Update cache
            OrderPriority priority = OrderPriority.determinePriority(order.getOrderTime(), 
                                                                   order.getSpecialInstructions(),
                                                                   order.getOrderItems() != null ? order.getOrderItems().size() : 0);
            cacheService.moveOrderBetweenQueues(orderId.toString(), currentStatus, newStatus, priority);
            
            // Create response
            OrderStatusUpdateResponse response = new OrderStatusUpdateResponse();
            response.setOrderId(orderId.toString());
            response.setOldStatus(currentStatus.toString());
            response.setNewStatus(newStatus.toString());
            response.setUpdatedBy(staffId);
            response.setUpdatedAt(LocalDateTime.now());
            response.setNotes(request.getNotes());
            response.setSuccess(true);
            
            logger.info("Order {} status successfully updated from {} to {}", orderId, currentStatus, newStatus);
            
            return ApiResponse.success("Order status updated successfully", response);
            
        } catch (Exception e) {
            logger.error("Error updating order {} status: ", orderId, e);
            return ApiResponse.internalError("Failed to update order status");
        }
    }
    
    /**
     * Assign Order to Staff
     * Assigns order to a specific staff member with capacity validation
     */
    public ApiResponse<OrderAssignmentResponse> assignOrder(Long orderId, String staffId) {
        try {
            logger.info("Assigning order {} to staff {}", orderId, staffId);
            
            // Validate order exists
            Optional<Order> orderOpt = orderDAO.findById(orderId.toString());
            if (orderOpt.isEmpty()) {
                return ApiResponse.notFound("Order not found: " + orderId);
            }
            
            // Validate staff exists and is available
            Optional<StaffMember> staffOpt = staffMemberRepository.findById(staffId);
            if (staffOpt.isEmpty()) {
                return ApiResponse.staffNotFound(staffId);
            }
            
            StaffMember staff = staffOpt.get();
            if (!staff.isOnDuty()) {
                return ApiResponse.error("Staff member is not on duty", "STAFF_NOT_ON_DUTY");
            }
            
            // Check staff workload
            int currentWorkload = orderAssignmentRepository.countActiveAssignmentsByStaffId(staffId);
            if (currentWorkload >= MAX_STAFF_WORKLOAD) {
                return ApiResponse.error("Staff member has reached maximum workload", "STAFF_OVERLOADED");
            }
            
            // Check if order is already assigned
            Optional<OrderAssignment> existingAssignment = orderAssignmentRepository.findByOrderId(orderId.toString());
            if (existingAssignment.isPresent()) {
                OrderAssignment assignment = existingAssignment.get();
                if (assignment.getAssignmentStatus().isActive()) {
                    return ApiResponse.conflict("Order is already assigned to staff: " + assignment.getStaffId());
                }
            }
            
            Order order = orderOpt.get();
            
            // Create new assignment
            OrderAssignment assignment = new OrderAssignment(
                orderId.toString(), 
                staffId, 
                determineAssignmentType(order, staff)
            );
            
            // Set priority and estimated completion
            OrderPriority priority = OrderPriority.determinePriority(
                order.getOrderTime(), 
                order.getSpecialInstructions(),
                order.getOrderItems() != null ? order.getOrderItems().size() : 0
            );
            assignment.setPriority(priority);
            assignment.setEstimatedCompletionTime(calculateEstimatedCompletionTime(order));
            
            // Save assignment
            assignment = orderAssignmentRepository.save(assignment);
            
            // Update cache
            cacheService.addOrderToQueue(order, priority);
            cacheService.cacheAssignmentHistory(orderId.toString(), staffId, "ASSIGNED", "Order assigned to staff");
            
            // Update staff workload cache
            updateStaffWorkloadCache(staffId);
            
            // Create response
            OrderAssignmentResponse response = new OrderAssignmentResponse();
            response.setOrderId(orderId.toString());
            response.setStaffId(staffId);
            response.setAssignmentId(assignment.getAssignmentId());
            response.setAssignmentType(assignment.getAssignmentType().toString());
            response.setPriority(priority.toString());
            response.setEstimatedCompletionTime(assignment.getEstimatedCompletionTime());
            response.setAssignedAt(assignment.getAssignedAt());
            response.setSuccess(true);
            
            logger.info("Order {} successfully assigned to staff {} (assignment: {})", 
                       orderId, staffId, assignment.getAssignmentId());
            
            return ApiResponse.success("Order assigned successfully", response);
            
        } catch (Exception e) {
            logger.error("Error assigning order {} to staff {}: ", orderId, staffId, e);
            return ApiResponse.internalError("Failed to assign order");
        }
    }
    
    /**
     * Batch Assign Orders
     * Assign multiple orders to a staff member in a single operation
     */
    public ApiResponse<BatchAssignmentResponse> batchAssignOrders(List<Long> orderIds, String staffId) {
        try {
            logger.info("Batch assigning {} orders to staff {}", orderIds.size(), staffId);
            
            // Validate staff exists and capacity
            Optional<StaffMember> staffOpt = staffMemberRepository.findById(staffId);
            if (staffOpt.isEmpty()) {
                return ApiResponse.staffNotFound(staffId);
            }
            
            StaffMember staff = staffOpt.get();
            if (!staff.isOnDuty()) {
                return ApiResponse.error("Staff member is not on duty", "STAFF_NOT_ON_DUTY");
            }
            
            int currentWorkload = orderAssignmentRepository.countActiveAssignmentsByStaffId(staffId);
            int availableCapacity = MAX_STAFF_WORKLOAD - currentWorkload;
            
            if (orderIds.size() > availableCapacity) {
                return ApiResponse.error(
                    String.format("Insufficient capacity. Available: %d, Requested: %d", 
                                availableCapacity, orderIds.size()), 
                    "INSUFFICIENT_CAPACITY");
            }
            
            // Process assignments
            List<String> successfulAssignments = new ArrayList<>();
            List<String> failedAssignments = new ArrayList<>();
            
            for (Long orderId : orderIds) {
                try {
                    ApiResponse<OrderAssignmentResponse> result = assignOrder(orderId, staffId);
                    if (result.isSuccess()) {
                        successfulAssignments.add(orderId.toString());
                    } else {
                        failedAssignments.add(orderId.toString());
                        logger.warn("Failed to assign order {} in batch: {}", orderId, result.getMessage());
                    }
                } catch (Exception e) {
                    failedAssignments.add(orderId.toString());
                    logger.error("Exception during batch assignment of order {}: ", orderId, e);
                }
            }
            
            // Create response
            BatchAssignmentResponse response = new BatchAssignmentResponse();
            response.setTotalOrders(orderIds.size());
            response.setSuccessfulAssignments(successfulAssignments.size());
            response.setFailedAssignments(failedAssignments.size());
            response.setSuccessfulOrderIds(successfulAssignments);
            response.setFailedOrderIds(failedAssignments);
            response.setStaffId(staffId);
            response.setAssignedAt(LocalDateTime.now());
            
            boolean allSuccessful = failedAssignments.isEmpty();
            String message = allSuccessful 
                ? "All orders assigned successfully"
                : String.format("%d/%d orders assigned successfully", 
                               successfulAssignments.size(), orderIds.size());
            
            logger.info("Batch assignment completed: {}/{} orders assigned to staff {}", 
                       successfulAssignments.size(), orderIds.size(), staffId);
            
            return ApiResponse.success(message, response);
            
        } catch (Exception e) {
            logger.error("Error in batch assignment to staff {}: ", staffId, e);
            return ApiResponse.internalError("Batch assignment failed");
        }
    }
    
    /**
     * Get Order Details
     * Retrieve comprehensive order information for staff operations
     */
    public ApiResponse<StaffOrderDetails> getOrderDetails(Long orderId) {
        try {
            logger.debug("Getting order details for order {}", orderId);
            
            Optional<Order> orderOpt = orderDAO.findById(orderId.toString());
            if (orderOpt.isEmpty()) {
                return ApiResponse.notFound("Order not found: " + orderId);
            }
            
            Order order = orderOpt.get();
            StaffOrderDetails details = convertToStaffOrderDetails(order);
            
            // Add assignment information if exists
            Optional<OrderAssignment> assignmentOpt = orderAssignmentRepository.findByOrderId(orderId.toString());
            if (assignmentOpt.isPresent()) {
                OrderAssignment assignment = assignmentOpt.get();
                addAssignmentDetailsToOrderDetails(details, assignment);
            }
            
            return ApiResponse.success("Order details retrieved successfully", details);
            
        } catch (Exception e) {
            logger.error("Error retrieving order {} details: ", orderId, e);
            return ApiResponse.internalError("Failed to retrieve order details");
        }
    }
    
    /**
     * Get Order Statistics
     * Retrieve performance statistics for orders and staff
     */
    public ApiResponse<OrderStatistics> getOrderStatistics(String period, String staffId) {
        try {
            logger.debug("Getting order statistics for period: {}, staff: {}", period, staffId);
            
            LocalDateTime[] dateRange = calculateDateRange(period);
            LocalDateTime startDate = dateRange[0];
            LocalDateTime endDate = dateRange[1];
            
            List<Order> orders;
            if (staffId != null) {
                // Get orders for specific staff
                orders = getOrdersForStaffInDateRange(staffId, startDate, endDate);
            } else {
                // Get all orders in date range
                orders = orderDAO.findByDateRange(startDate, endDate);
            }
            
            // Calculate statistics
            OrderStatistics statistics = new OrderStatistics();
            statistics.setPeriod(period);
            statistics.setStaffId(staffId);
            statistics.setStartDate(startDate);
            statistics.setEndDate(endDate);
            statistics.setTotalOrders(orders.size());
            
            // Calculate status counts
            Map<OrderStatus, Long> statusCounts = orders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));
            
            statistics.setPendingOrders(statusCounts.getOrDefault(OrderStatus.PENDING, 0L).intValue());
            statistics.setProcessingOrders(statusCounts.getOrDefault(OrderStatus.PREPARING, 0L).intValue());
            statistics.setCompletedOrders(statusCounts.getOrDefault(OrderStatus.COMPLETED, 0L).intValue());
            
            // Calculate averages
            statistics.setAverageOrderValue(calculateAverageOrderValue(orders));
            statistics.setAverageProcessingTime(calculateAverageProcessingTimeForOrders(orders));
            
            // Calculate performance metrics
            statistics.setOrdersPerHour(calculateOrdersPerHour(orders, startDate, endDate));
            statistics.setSuccessRate(calculateSuccessRate(orders));
            
            logger.info("Generated statistics for period {} (staff: {}): {} total orders", period, staffId, orders.size());
            
            return ApiResponse.success("Order statistics retrieved successfully", statistics);
            
        } catch (Exception e) {
            logger.error("Error retrieving order statistics: ", e);
            return ApiResponse.internalError("Failed to retrieve order statistics");
        }
    }
    
    /**
     * Get Overdue Orders
     * Returns list of orders that are overdue and need immediate attention
     */
    public List<Order> getOverdueOrders() {
        try {
            return orderDAO.findOverdueOrders(DEFAULT_OVERDUE_THRESHOLD_MINUTES);
        } catch (Exception e) {
            logger.error("Error retrieving overdue orders: ", e);
            return Collections.emptyList();
        }
    }
    
    // Private helper methods
    
    private List<Order> getFilteredOrders(OrderQueueFilter filter) {
        List<Order> orders;
        
        // Start with base query
        if (filter.getStatus() != null) {
            try {
                OrderStatus status = OrderStatus.valueOf(filter.getStatus().toUpperCase());
                orders = orderDAO.findByStatus(status);
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid status filter: {}", filter.getStatus());
                orders = orderDAO.findActiveOrders();
            }
        } else if (filter.isOverdue()) {
            orders = getOverdueOrders();
        } else {
            orders = orderDAO.findActiveOrders();
        }
        
        // Apply additional filters
        if (filter.getAssignedTo() != null) {
            orders = orders.stream()
                .filter(order -> isOrderAssignedToStaff(order.getOrderId(), filter.getAssignedTo()))
                .collect(Collectors.toList());
        }
        
        if (filter.getTableNumber() != null) {
            orders = orders.stream()
                .filter(order -> filter.getTableNumber().equals(order.getTableNumber()))
                .collect(Collectors.toList());
        }
        
        // Date range filter
        if (filter.getFromDate() != null || filter.getToDate() != null) {
            LocalDateTime from = filter.getFromDate() != null ? filter.getFromDate() : LocalDateTime.MIN;
            LocalDateTime to = filter.getToDate() != null ? filter.getToDate() : LocalDateTime.MAX;
            
            orders = orders.stream()
                .filter(order -> {
                    LocalDateTime orderTime = order.getOrderTime();
                    return orderTime != null && 
                           !orderTime.isBefore(from) && 
                           !orderTime.isAfter(to);
                })
                .collect(Collectors.toList());
        }
        
        return orders;
    }
    
    private StaffOrderDetails convertToStaffOrderDetails(Order order) {
        StaffOrderDetails details = new StaffOrderDetails();
        details.setOrderId(Long.parseLong(order.getOrderId()));
        details.setOrderNumber(order.getOrderId());
        details.setCustomerId(order.getCustomerId());
        details.setTableNumber(order.getTableNumber());
        details.setStatus(order.getStatus().toString());
        details.setTotalAmount(order.getTotalAmount());
        details.setOrderTime(order.getOrderTime());
        details.setSpecialInstructions(order.getSpecialInstructions());
        
        // Calculate priority
        OrderPriority priority = OrderPriority.determinePriority(
            order.getOrderTime(),
            order.getSpecialInstructions(),
            order.getOrderItems() != null ? order.getOrderItems().size() : 0
        );
        details.setPriority(priority.toString());
        
        // Check if overdue
        if (order.getOrderTime() != null) {
            long waitTime = java.time.Duration.between(order.getOrderTime(), LocalDateTime.now()).toMinutes();
            details.setOverdue(waitTime > DEFAULT_OVERDUE_THRESHOLD_MINUTES);
            details.setOverdueMinutes(waitTime > DEFAULT_OVERDUE_THRESHOLD_MINUTES ? (int) waitTime : 0);
        }
        
        // Convert order items
        if (order.getOrderItems() != null) {
            List<OrderItemDetails> itemDetails = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemDetails itemDetail = new OrderItemDetails();
                    itemDetail.setItemId(item.getMenuItem().getItemId());
                    itemDetail.setItemName(item.getMenuItem().getName());
                    itemDetail.setQuantity(item.getQuantity());
                    itemDetail.setPrice(item.getMenuItem().getPrice());
                    itemDetail.setSpecialRequests(item.getSpecialRequests());
                    return itemDetail;
                })
                .collect(Collectors.toList());
            details.setItems(itemDetails);
        }
        
        return details;
    }
    
    private void addAssignmentDetailsToOrderDetails(StaffOrderDetails details, OrderAssignment assignment) {
        // Add staff assignment information
        Optional<StaffMember> staffOpt = staffMemberRepository.findById(assignment.getStaffId());
        if (staffOpt.isPresent()) {
            StaffMember staff = staffOpt.get();
            StaffOrderDetails.AssignedStaff assignedStaff = new StaffOrderDetails.AssignedStaff();
            assignedStaff.setStaffId(staff.getStaffId());
            assignedStaff.setName(staff.getName());
            assignedStaff.setDepartment(staff.getDepartment());
            details.setAssignedStaffInfo(assignedStaff);
        }
        
        details.setAssignmentType(assignment.getAssignmentType().toString());
        details.setAssignmentStatus(assignment.getAssignmentStatus().toString());
        details.setAssignedAt(assignment.getAssignedAt());
        details.setEstimatedCompletionTime(assignment.getEstimatedCompletionTime());
        
        if (assignment.getStartedAt() != null) {
            details.setStartedAt(assignment.getStartedAt());
        }
        
        if (assignment.getCompletedAt() != null) {
            details.setCompletedAt(assignment.getCompletedAt());
        }
    }
    
    private boolean isValidStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        // Define valid status transitions
        return switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED || 
                           newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PREPARING || 
                             newStatus == OrderStatus.CANCELLED;
            case PREPARING -> newStatus == OrderStatus.READY ||
                             newStatus == OrderStatus.CANCELLED;
            case READY -> newStatus == OrderStatus.DELIVERED ||
                         newStatus == OrderStatus.CANCELLED;
            case DELIVERED -> newStatus == OrderStatus.COMPLETED;
            case COMPLETED, CANCELLED -> false; // Terminal states
            default -> false;
        };
    }
    
    private void updateAssignmentStatus(OrderAssignment assignment, OrderStatus newOrderStatus, 
                                       String staffId, String notes) {
        switch (newOrderStatus) {
            case CONFIRMED:
                if (assignment.getAssignmentStatus() == AssignmentStatus.ASSIGNED) {
                    assignment.startWork();
                }
                break;
            case COMPLETED:
                assignment.complete();
                break;
            case CANCELLED:
                assignment.cancel("Order cancelled");
                break;
        }
        
        if (notes != null) {
            assignment.setNotes((assignment.getNotes() != null ? assignment.getNotes() + "; " : "") + notes);
        }
    }
    
    private AssignmentType determineAssignmentType(Order order, StaffMember staff) {
        // Simple logic - could be enhanced based on staff department and order complexity
        return switch (staff.getDepartment().toLowerCase()) {
            case "kitchen", "cooking" -> AssignmentType.PREPARATION;
            case "service", "waiter" -> AssignmentType.SERVICE;
            case "management" -> AssignmentType.MANAGEMENT;
            default -> AssignmentType.PREPARATION;
        };
    }
    
    private LocalDateTime calculateEstimatedCompletionTime(Order order) {
        // Simple estimation based on order complexity
        int estimatedMinutes = 15; // Base time
        
        if (order.getOrderItems() != null) {
            estimatedMinutes += order.getOrderItems().size() * 3; // 3 minutes per item
        }
        
        if (order.getSpecialInstructions() != null && !order.getSpecialInstructions().isEmpty()) {
            estimatedMinutes += 5; // Extra time for special requests
        }
        
        return LocalDateTime.now().plusMinutes(estimatedMinutes);
    }
    
    private OrderQueueStatistics calculateQueueStatistics() {
        OrderQueueStatistics stats = new OrderQueueStatistics();
        
        // Use cache if available, otherwise calculate directly
        Map<String, Object> cachedStats = cacheService.getQueueStatistics();
        
        if (cachedStats != null && !cachedStats.isEmpty()) {
            stats.setPendingCount(((Number) cachedStats.getOrDefault("pendingCount", 0)).intValue());
            stats.setProcessingCount(((Number) cachedStats.getOrDefault("processingCount", 0)).intValue());
            stats.setCompletedCount(((Number) cachedStats.getOrDefault("completedCount", 0)).intValue());
            stats.setOverdueCount(((Number) cachedStats.getOrDefault("overdueCount", 0)).intValue());
        } else {
            // Calculate from database
            stats.setPendingCount(orderDAO.countByStatus(OrderStatus.PENDING));
            stats.setProcessingCount(orderDAO.countByStatus(OrderStatus.PREPARING));
            stats.setCompletedCount(orderDAO.countByStatus(OrderStatus.COMPLETED));
            stats.setOverdueCount(getOverdueOrders().size());
        }
        
        stats.setAverageProcessingTime(orderDAO.getAverageProcessingTime());
        stats.setTotalOrdersToday(orderDAO.countTodays());
        
        return stats;
    }
    
    private WorkloadStatus calculateWorkloadStatus(String staffId) {
        WorkloadStatus status = new WorkloadStatus();
        
        if (staffId != null) {
            // Individual staff workload
            Map<String, Object> workload = cacheService.getStaffWorkload(staffId);
            if (workload != null) {
                status.setCurrentWorkload(((Number) workload.getOrDefault("currentOrders", 0)).intValue());
                status.setMaxCapacity(((Number) workload.getOrDefault("maxCapacity", MAX_STAFF_WORKLOAD)).intValue());
                status.setWorkloadPercentage(((Number) workload.getOrDefault("workloadPercentage", 0.0)).doubleValue());
                status.setStatus((String) workload.getOrDefault("status", "UNKNOWN"));
            } else {
                // Calculate directly
                int currentOrders = orderAssignmentRepository.countActiveAssignmentsByStaffId(staffId);
                status.setCurrentWorkload(currentOrders);
                status.setMaxCapacity(MAX_STAFF_WORKLOAD);
                status.setWorkloadPercentage((double) currentOrders / MAX_STAFF_WORKLOAD);
                status.setStatus(currentOrders >= MAX_STAFF_WORKLOAD ? "OVERLOADED" : "NORMAL");
            }
        } else {
            // Overall system workload
            List<StaffMember> onDutyStaff = staffMemberRepository.findOnDutyStaff();
            int totalCapacity = onDutyStaff.size() * MAX_STAFF_WORKLOAD;
            int totalWorkload = onDutyStaff.stream()
                .mapToInt(staff -> orderAssignmentRepository.countActiveAssignmentsByStaffId(staff.getStaffId()))
                .sum();
            
            status.setCurrentWorkload(totalWorkload);
            status.setMaxCapacity(totalCapacity);
            status.setWorkloadPercentage(totalCapacity > 0 ? (double) totalWorkload / totalCapacity : 0.0);
            
            double percentage = status.getWorkloadPercentage();
            status.setStatus(percentage >= 0.9 ? "CRITICAL" :
                           percentage >= 0.7 ? "HIGH" :
                           percentage >= 0.5 ? "MEDIUM" : "LOW");
        }
        
        return status;
    }
    
    private int calculateAverageWaitTime() {
        List<Order> activeOrders = orderDAO.findActiveOrders();
        if (activeOrders.isEmpty()) {
            return 0;
        }
        
        return (int) activeOrders.stream()
            .filter(order -> order.getOrderTime() != null)
            .mapToLong(order -> java.time.Duration.between(order.getOrderTime(), LocalDateTime.now()).toMinutes())
            .average()
            .orElse(0.0);
    }
    
    private void updateStaffWorkloadCache(String staffId) {
        try {
            int currentOrders = orderAssignmentRepository.countActiveAssignmentsByStaffId(staffId);
            // For now, use default values for other metrics
            cacheService.updateStaffWorkload(staffId, currentOrders, MAX_STAFF_WORKLOAD, 0.0, 1.0);
        } catch (Exception e) {
            logger.error("Error updating staff workload cache for {}: ", staffId, e);
        }
    }
    
    private boolean isOrderAssignedToStaff(String orderId, String staffId) {
        Optional<OrderAssignment> assignment = orderAssignmentRepository.findByOrderId(orderId);
        return assignment.isPresent() && 
               staffId.equals(assignment.get().getStaffId()) &&
               assignment.get().getAssignmentStatus().isActive();
    }
    
    private LocalDateTime[] calculateDateRange(String period) {
        LocalDateTime now = LocalDateTime.now();
        return switch (period.toUpperCase()) {
            case "TODAY" -> new LocalDateTime[]{now.toLocalDate().atStartOfDay(), now};
            case "WEEK" -> new LocalDateTime[]{now.minusWeeks(1), now};
            case "MONTH" -> new LocalDateTime[]{now.minusMonths(1), now};
            default -> new LocalDateTime[]{now.toLocalDate().atStartOfDay(), now};
        };
    }
    
    private List<Order> getOrdersForStaffInDateRange(String staffId, LocalDateTime startDate, LocalDateTime endDate) {
        // This is a simplified implementation - in reality, you'd need a more sophisticated query
        List<OrderAssignment> assignments = orderAssignmentRepository.findByStaffIdAndDateRange(staffId, startDate, endDate);
        return assignments.stream()
            .map(assignment -> orderDAO.findById(assignment.getOrderId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
    }
    
    private double calculateAverageOrderValue(List<Order> orders) {
        return orders.stream()
            .filter(order -> order.getTotalAmount() != null)
            .mapToDouble(order -> order.getTotalAmount().doubleValue())
            .average()
            .orElse(0.0);
    }
    
    private double calculateAverageProcessingTimeForOrders(List<Order> orders) {
        return orders.stream()
            .filter(order -> order.getOrderTime() != null && order.getCompletedTime() != null)
            .mapToLong(order -> java.time.Duration.between(order.getOrderTime(), order.getCompletedTime()).toMinutes())
            .average()
            .orElse(0.0);
    }
    
    private double calculateOrdersPerHour(List<Order> orders, LocalDateTime startDate, LocalDateTime endDate) {
        if (orders.isEmpty()) return 0.0;
        
        long totalHours = java.time.Duration.between(startDate, endDate).toHours();
        return totalHours > 0 ? (double) orders.size() / totalHours : 0.0;
    }
    
    private double calculateSuccessRate(List<Order> orders) {
        if (orders.isEmpty()) return 0.0;
        
        long completedOrders = orders.stream()
            .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
            .count();
        
        return (double) completedOrders / orders.size();
    }
}