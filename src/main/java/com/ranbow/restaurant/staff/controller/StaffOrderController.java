package com.ranbow.restaurant.staff.controller;

import com.ranbow.restaurant.staff.model.dto.*;
import com.ranbow.restaurant.staff.service.OrderQueueService;
import com.ranbow.restaurant.staff.security.StaffJwtAuthenticationFilter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Staff Order Management Controller
 * REST API endpoints for comprehensive order management operations
 * 
 * Features:
 * - Order queue management with advanced filtering
 * - Status updates with validation and workflow enforcement
 * - Smart order assignment and batch operations
 * - Real-time statistics and performance analytics
 * - Role-based access control for different staff roles
 * - Comprehensive error handling and validation
 * 
 * Security:
 * - JWT authentication required for all endpoints
 * - Role-based authorization for specific operations
 * - Request validation and sanitization
 * - Rate limiting integration ready
 */
@RestController
@RequestMapping("/api/staff/orders")
@PreAuthorize("hasRole('STAFF')")
@Tag(name = "Staff Order Management", description = "Order queue and assignment operations for staff")
public class StaffOrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(StaffOrderController.class);
    
    @Autowired
    private OrderQueueService orderQueueService;
    
    /**
     * Get Order Queue with Advanced Filtering
     * Returns paginated list of orders with comprehensive filtering options
     * 
     * @param status Filter by order status (PENDING, CONFIRMED, PREPARING, READY, etc.)
     * @param priority Filter by priority level (LOW, NORMAL, HIGH, URGENT, EMERGENCY)
     * @param assignedTo Filter by assigned staff member ID
     * @param tableNumber Filter by table number
     * @param overdue Filter for overdue orders only
     * @param page Page number (0-based)
     * @param size Page size (max 50)
     * @param sort Sort criteria (format: property,direction)
     * @param authentication Current authenticated staff member
     * @return Paginated order queue with statistics and workload status
     */
    @GetMapping("/queue")
    @Operation(summary = "Get Order Queue", 
               description = "Retrieve paginated order queue with filtering and sorting options")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order queue retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "401", description = "Authentication required"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderQueueService.OrderQueueResponseEnhanced>> getOrderQueue(
            @Parameter(description = "Filter by order status") 
            @RequestParam(required = false) String status,
            
            @Parameter(description = "Filter by priority level") 
            @RequestParam(required = false) String priority,
            
            @Parameter(description = "Filter by assigned staff ID") 
            @RequestParam(required = false) String assignedTo,
            
            @Parameter(description = "Filter by table number") 
            @RequestParam(required = false) String tableNumber,
            
            @Parameter(description = "Show only overdue orders") 
            @RequestParam(required = false, defaultValue = "false") boolean overdue,
            
            @Parameter(description = "Page number (0-based)") 
            @RequestParam(defaultValue = "0") @Min(0) int page,
            
            @Parameter(description = "Page size (max 50)") 
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int size,
            
            @Parameter(description = "Sort criteria (format: property,direction)") 
            @RequestParam(defaultValue = "orderTime,desc") String sort,
            
            Authentication authentication) {
        
        try {
            logger.info("Staff {} requesting order queue with filters - status: {}, priority: {}, assignedTo: {}, page: {}", 
                       authentication.getName(), status, priority, assignedTo, page);
            
            // Parse sort parameter
            String[] sortParts = sort.split(",");
            String sortProperty = sortParts.length > 0 ? sortParts[0] : "orderTime";
            Sort.Direction sortDirection = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1]) ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
            
            // Create pageable
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortProperty));
            
            // Create filter
            OrderQueueService.OrderQueueFilter filter = new OrderQueueService.OrderQueueFilter();
            filter.setStatus(status);
            filter.setPriority(priority);
            filter.setAssignedTo(assignedTo);
            
            // Apply role-based filtering
            String currentStaffId = getCurrentStaffId(authentication);
            if (!hasManagerRole(authentication) && assignedTo == null) {
                // Non-managers can only see their own assignments by default
                filter.setAssignedTo(currentStaffId);
            }
            
            // Get order queue
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderQueueService.OrderQueueResponseEnhanced> response = 
                orderQueueService.getOrderQueue(filter, pageable);
            
            // Log successful request
            if (response.isSuccess()) {
                logger.info("Order queue retrieved successfully for staff {} - {} orders returned", 
                           authentication.getName(), response.getData().getOrders().size());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving order queue for staff {}: ", authentication.getName(), e);
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderQueueService.OrderQueueResponseEnhanced> errorResponse = 
                com.ranbow.restaurant.staff.model.dto.ApiResponse.internalError("Failed to retrieve order queue");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Update Order Status
     * Updates order status with comprehensive validation and workflow enforcement
     */
    @PutMapping("/{orderId}/status")
    @Operation(summary = "Update Order Status", 
               description = "Update order status with validation and workflow enforcement")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order status updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status transition or request"),
        @ApiResponse(responseCode = "404", description = "Order not found"),
        @ApiResponse(responseCode = "409", description = "Order status conflict"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions for status update")
    })
    public ResponseEntity<com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderStatusUpdateResponse>> updateOrderStatus(
            @Parameter(description = "Order ID to update") 
            @PathVariable Long orderId,
            
            @Parameter(description = "Status update request") 
            @Valid @RequestBody OrderStatusUpdateRequest request,
            
            Authentication authentication) {
        
        try {
            String staffId = getCurrentStaffId(authentication);
            logger.info("Staff {} updating order {} status from {} to {}", 
                       staffId, orderId, request.getCurrentStatus(), request.getNewStatus());
            
            // Validate request
            if (request.getCurrentStatus() == null || request.getNewStatus() == null) {
                return ResponseEntity.badRequest().body(
                    com.ranbow.restaurant.staff.model.dto.ApiResponse.badRequest(
                        "Current status and new status are required"));
            }
            
            // Update order status
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderStatusUpdateResponse> response = 
                orderQueueService.updateOrderStatus(orderId, request, staffId);
            
            // Return appropriate HTTP status
            if (response.isSuccess()) {
                logger.info("Order {} status successfully updated to {} by staff {}", 
                           orderId, request.getNewStatus(), staffId);
                return ResponseEntity.ok(response);
            } else {
                HttpStatus status = determineErrorStatus(response.getErrorCode());
                return ResponseEntity.status(status).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error updating order {} status: ", orderId, e);
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderStatusUpdateResponse> errorResponse = 
                com.ranbow.restaurant.staff.model.dto.ApiResponse.internalError("Failed to update order status");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Assign Order to Self
     * Allows staff to assign orders to themselves
     */
    @PostMapping("/{orderId}/assign")
    @Operation(summary = "Assign Order to Self", 
               description = "Assign order to the current authenticated staff member")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order assigned successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be assigned"),
        @ApiResponse(responseCode = "404", description = "Order not found"),
        @ApiResponse(responseCode = "409", description = "Staff capacity exceeded or order already assigned")
    })
    public ResponseEntity<com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderAssignmentResponse>> assignOrderToSelf(
            @Parameter(description = "Order ID to assign") 
            @PathVariable Long orderId,
            
            Authentication authentication) {
        
        try {
            String staffId = getCurrentStaffId(authentication);
            logger.info("Staff {} assigning order {} to self", staffId, orderId);
            
            // Assign order
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderAssignmentResponse> response = 
                orderQueueService.assignOrder(orderId, staffId);
            
            // Return appropriate response
            if (response.isSuccess()) {
                logger.info("Order {} successfully assigned to staff {}", orderId, staffId);
                return ResponseEntity.ok(response);
            } else {
                HttpStatus status = determineErrorStatus(response.getErrorCode());
                return ResponseEntity.status(status).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error assigning order {} to staff {}: ", orderId, getCurrentStaffId(authentication), e);
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderAssignmentResponse> errorResponse = 
                com.ranbow.restaurant.staff.model.dto.ApiResponse.internalError("Failed to assign order");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Batch Assign Orders
     * Assign multiple orders to a staff member in a single operation
     */
    @PostMapping("/batch/assign")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Batch Assign Orders", 
               description = "Assign multiple orders to a staff member efficiently")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Batch assignment completed"),
        @ApiResponse(responseCode = "400", description = "Invalid request or insufficient capacity"),
        @ApiResponse(responseCode = "404", description = "Staff member not found"),
        @ApiResponse(responseCode = "207", description = "Partial success - some assignments failed")
    })
    public ResponseEntity<com.ranbow.restaurant.staff.model.dto.ApiResponse<BatchAssignmentResponse>> batchAssignOrders(
            @Parameter(description = "Batch assignment request") 
            @Valid @RequestBody BatchAssignmentRequest request,
            
            Authentication authentication) {
        
        try {
            String currentStaffId = getCurrentStaffId(authentication);
            logger.info("Staff {} performing batch assignment of {} orders to staff {}", 
                       currentStaffId, request.getOrderCount(), request.getAssignedToStaffId());
            
            // Validate request
            if (!request.isValid()) {
                return ResponseEntity.badRequest().body(
                    com.ranbow.restaurant.staff.model.dto.ApiResponse.badRequest(
                        "Invalid batch assignment request"));
            }
            
            // Check if assigning to self or has manager permissions
            if (!currentStaffId.equals(request.getAssignedToStaffId()) && !hasManagerRole(authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    com.ranbow.restaurant.staff.model.dto.ApiResponse.forbidden(
                        "Only managers can assign orders to other staff members"));
            }
            
            // Perform batch assignment
            com.ranbow.restaurant.staff.model.dto.ApiResponse<BatchAssignmentResponse> response = 
                orderQueueService.batchAssignOrders(request.getOrderIds(), request.getAssignedToStaffId());
            
            // Determine response status
            if (response.isSuccess()) {
                BatchAssignmentResponse data = response.getData();
                if (data.isCompletelySuccessful()) {
                    logger.info("Batch assignment fully successful: {}/{} orders assigned", 
                               data.getSuccessfulAssignments(), data.getTotalOrders());
                    return ResponseEntity.ok(response);
                } else {
                    logger.warn("Batch assignment partially successful: {}/{} orders assigned", 
                               data.getSuccessfulAssignments(), data.getTotalOrders());
                    return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(response);
                }
            } else {
                HttpStatus status = determineErrorStatus(response.getErrorCode());
                return ResponseEntity.status(status).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error in batch assignment: ", e);
            com.ranbow.restaurant.staff.model.dto.ApiResponse<BatchAssignmentResponse> errorResponse = 
                com.ranbow.restaurant.staff.model.dto.ApiResponse.internalError("Batch assignment failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get Order Details
     * Retrieve comprehensive order information for staff operations
     */
    @GetMapping("/{orderId}/details")
    @Operation(summary = "Get Order Details", 
               description = "Retrieve detailed order information for staff operations")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order details retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Order not found"),
        @ApiResponse(responseCode = "403", description = "Access denied to order details")
    })
    public ResponseEntity<com.ranbow.restaurant.staff.model.dto.ApiResponse<StaffOrderDetails>> getOrderDetails(
            @Parameter(description = "Order ID to retrieve") 
            @PathVariable Long orderId,
            
            Authentication authentication) {
        
        try {
            String staffId = getCurrentStaffId(authentication);
            logger.info("Staff {} requesting details for order {}", staffId, orderId);
            
            // Get order details
            com.ranbow.restaurant.staff.model.dto.ApiResponse<StaffOrderDetails> response = 
                orderQueueService.getOrderDetails(orderId);
            
            // Apply access control for non-managers
            if (response.isSuccess() && !hasManagerRole(authentication)) {
                StaffOrderDetails orderDetails = response.getData();
                if (orderDetails.getAssignedStaff() != null && 
                    !staffId.equals(orderDetails.getAssignedStaff().getStaffId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        com.ranbow.restaurant.staff.model.dto.ApiResponse.forbidden(
                            "Access denied: Order not assigned to you"));
                }
            }
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                HttpStatus status = determineErrorStatus(response.getErrorCode());
                return ResponseEntity.status(status).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving order {} details: ", orderId, e);
            com.ranbow.restaurant.staff.model.dto.ApiResponse<StaffOrderDetails> errorResponse = 
                com.ranbow.restaurant.staff.model.dto.ApiResponse.internalError("Failed to retrieve order details");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get Order Statistics
     * Retrieve performance statistics for orders and staff
     */
    @GetMapping("/statistics")
    @Operation(summary = "Get Order Statistics", 
               description = "Retrieve comprehensive order and performance statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid period parameter"),
        @ApiResponse(responseCode = "403", description = "Insufficient permissions for requested statistics")
    })
    public ResponseEntity<com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderStatistics>> getOrderStatistics(
            @Parameter(description = "Statistics period (TODAY, WEEK, MONTH)") 
            @RequestParam(required = false, defaultValue = "TODAY") String period,
            
            @Parameter(description = "Filter statistics by staff ID (managers only)") 
            @RequestParam(required = false) String staffId,
            
            Authentication authentication) {
        
        try {
            String currentStaffId = getCurrentStaffId(authentication);
            logger.info("Staff {} requesting order statistics for period: {}, staffId: {}", 
                       currentStaffId, period, staffId);
            
            // Apply access control for staff filtering
            if (staffId != null && !hasManagerRole(authentication)) {
                if (!currentStaffId.equals(staffId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        com.ranbow.restaurant.staff.model.dto.ApiResponse.forbidden(
                            "Only managers can view other staff statistics"));
                }
            }
            
            // For non-managers, default to their own statistics
            if (!hasManagerRole(authentication) && staffId == null) {
                staffId = currentStaffId;
            }
            
            // Validate period
            if (!isValidPeriod(period)) {
                return ResponseEntity.badRequest().body(
                    com.ranbow.restaurant.staff.model.dto.ApiResponse.badRequest(
                        "Invalid period. Valid values: TODAY, WEEK, MONTH"));
            }
            
            // Get statistics
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderStatistics> response = 
                orderQueueService.getOrderStatistics(period, staffId);
            
            if (response.isSuccess()) {
                logger.info("Order statistics retrieved successfully for period: {}", period);
                return ResponseEntity.ok(response);
            } else {
                HttpStatus status = determineErrorStatus(response.getErrorCode());
                return ResponseEntity.status(status).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving order statistics: ", e);
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderStatistics> errorResponse = 
                com.ranbow.restaurant.staff.model.dto.ApiResponse.internalError("Failed to retrieve statistics");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get Overdue Orders
     * Retrieve list of orders that are overdue for immediate attention
     */
    @GetMapping("/overdue")
    @Operation(summary = "Get Overdue Orders", 
               description = "Retrieve orders that are overdue and need immediate attention")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Overdue orders retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<com.ranbow.restaurant.staff.model.dto.ApiResponse<List<StaffOrderDetails>>> getOverdueOrders(
            Authentication authentication) {
        
        try {
            String staffId = getCurrentStaffId(authentication);
            logger.info("Staff {} requesting overdue orders", staffId);
            
            // Get overdue orders
            List<com.ranbow.restaurant.models.Order> overdueOrders = orderQueueService.getOverdueOrders();
            
            // Convert to staff order details (simplified for this endpoint)
            List<StaffOrderDetails> staffOrderDetailsList = overdueOrders.stream()
                .map(this::convertToBasicStaffOrderDetails)
                .collect(java.util.stream.Collectors.toList());
            
            logger.info("Found {} overdue orders", staffOrderDetailsList.size());
            
            return ResponseEntity.ok(
                com.ranbow.restaurant.staff.model.dto.ApiResponse.success(
                    "Overdue orders retrieved successfully", staffOrderDetailsList));
            
        } catch (Exception e) {
            logger.error("Error retrieving overdue orders: ", e);
            com.ranbow.restaurant.staff.model.dto.ApiResponse<List<StaffOrderDetails>> errorResponse = 
                com.ranbow.restaurant.staff.model.dto.ApiResponse.internalError("Failed to retrieve overdue orders");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Emergency Status Update
     * Allows managers to perform emergency status updates
     */
    @PutMapping("/{orderId}/emergency-status")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @Operation(summary = "Emergency Status Update", 
               description = "Perform emergency status update (managers only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Emergency status update successful"),
        @ApiResponse(responseCode = "403", description = "Manager role required"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderStatusUpdateResponse>> emergencyStatusUpdate(
            @Parameter(description = "Order ID for emergency update") 
            @PathVariable Long orderId,
            
            @Parameter(description = "Emergency status update request") 
            @Valid @RequestBody OrderStatusUpdateRequest request,
            
            Authentication authentication) {
        
        try {
            String staffId = getCurrentStaffId(authentication);
            logger.warn("EMERGENCY STATUS UPDATE: Staff {} updating order {} status from {} to {} - Reason: {}", 
                       staffId, orderId, request.getCurrentStatus(), request.getNewStatus(), request.getReason());
            
            // Mark as emergency update
            request.setReason("EMERGENCY UPDATE: " + (request.getReason() != null ? request.getReason() : "No reason provided"));
            
            // Update order status (bypasses some validations for emergencies)
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderStatusUpdateResponse> response = 
                orderQueueService.updateOrderStatus(orderId, request, staffId);
            
            if (response.isSuccess()) {
                logger.warn("Emergency status update completed for order {} by staff {}", orderId, staffId);
                return ResponseEntity.ok(response);
            } else {
                HttpStatus status = determineErrorStatus(response.getErrorCode());
                return ResponseEntity.status(status).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error in emergency status update for order {}: ", orderId, e);
            com.ranbow.restaurant.staff.model.dto.ApiResponse<OrderStatusUpdateResponse> errorResponse = 
                com.ranbow.restaurant.staff.model.dto.ApiResponse.internalError("Emergency status update failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Private helper methods
    
    private String getCurrentStaffId(Authentication authentication) {
        return authentication.getName(); // JWT token contains staff ID as username
    }
    
    private boolean hasManagerRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_MANAGER") || 
                             auth.getAuthority().equals("ROLE_ADMIN"));
    }
    
    private HttpStatus determineErrorStatus(String errorCode) {
        return switch (errorCode != null ? errorCode : "UNKNOWN") {
            case "BAD_REQUEST", "VALIDATION_ERROR" -> HttpStatus.BAD_REQUEST;
            case "UNAUTHORIZED", "AUTHENTICATION_REQUIRED", "SESSION_EXPIRED" -> HttpStatus.UNAUTHORIZED;
            case "FORBIDDEN", "INSUFFICIENT_PERMISSIONS", "ACCESS_DENIED" -> HttpStatus.FORBIDDEN;
            case "NOT_FOUND", "ORDER_NOT_FOUND", "STAFF_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "CONFLICT", "INVALID_STATUS_TRANSITION", "STAFF_OVERLOADED" -> HttpStatus.CONFLICT;
            case "INSUFFICIENT_CAPACITY" -> HttpStatus.UNPROCESSABLE_ENTITY;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
    
    private boolean isValidPeriod(String period) {
        return period != null && 
               (period.equals("TODAY") || period.equals("WEEK") || period.equals("MONTH"));
    }
    
    private StaffOrderDetails convertToBasicStaffOrderDetails(com.ranbow.restaurant.models.Order order) {
        StaffOrderDetails details = new StaffOrderDetails();
        details.setOrderId(Long.parseLong(order.getOrderId()));
        details.setOrderNumber(order.getOrderId());
        details.setTableNumber(order.getTableNumber());
        details.setStatus(order.getStatus());
        details.setTotalAmount(order.getTotalAmount());
        details.setOrderTime(order.getOrderTime());
        details.setSpecialInstructions(order.getSpecialInstructions());
        
        // Mark as overdue
        details.setOverdue(true);
        if (order.getOrderTime() != null) {
            long overdueMinutes = java.time.Duration.between(
                order.getOrderTime().plusMinutes(30), // Assuming 30 min standard time
                LocalDateTime.now()).toMinutes();
            details.setOverdueMinutes(Math.max(0, overdueMinutes));
        }
        
        return details;
    }
}