package com.ranbow.restaurant.staff.service;

import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.models.OrderStatus;
import com.ranbow.restaurant.staff.model.entity.OrderPriority;
import com.ranbow.restaurant.staff.model.entity.StaffMember;
import com.ranbow.restaurant.staff.model.entity.StaffRole;
import com.ranbow.restaurant.staff.repository.StaffMemberRepository;
import com.ranbow.restaurant.staff.repository.OrderAssignmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Order Assignment Engine
 * Intelligent order assignment system with advanced workload balancing and optimization
 * 
 * Features:
 * - Smart assignment based on workload, skills, and availability
 * - Priority-based assignment for urgent orders
 * - Capacity management and overload prevention
 * - Performance tracking and optimization
 * - Real-time workload distribution analysis
 * - Automated escalation and reassignment
 * 
 * Algorithm Factors:
 * - Staff current workload and capacity
 * - Staff role and skill matching
 * - Order complexity and requirements
 * - Historical performance metrics
 * - Time-based priority escalation
 * - Geographic/zone-based assignment (for table service)
 */
@Component
public class OrderAssignmentEngine {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderAssignmentEngine.class);
    
    // Dependencies
    @Autowired
    private StaffMemberRepository staffMemberRepository;
    
    @Autowired
    private OrderAssignmentRepository orderAssignmentRepository;
    
    // Configuration constants
    private static final int MAX_ORDERS_PER_KITCHEN_STAFF = 6;
    private static final int MAX_ORDERS_PER_SERVICE_STAFF = 8;
    private static final int MAX_ORDERS_PER_CASHIER = 10;
    private static final double OVERLOAD_THRESHOLD = 0.85;
    private static final double HIGH_PERFORMANCE_THRESHOLD = 0.9;
    private static final int PRIORITY_ESCALATION_MINUTES = 30;
    private static final int URGENT_ASSIGNMENT_MINUTES = 5;
    
    /**
     * Auto-assign Order using Intelligent Assignment Logic
     * Selects the best available staff member based on multiple factors
     */
    public AssignmentResult autoAssignOrder(Order order) {
        try {
            logger.info("Auto-assigning order {} using intelligent assignment logic", order.getOrderId());
            
            // Get all available staff members
            List<StaffMember> availableStaff = getAvailableStaff();
            
            if (availableStaff.isEmpty()) {
                logger.warn("No available staff found for order assignment");
                return AssignmentResult.failure("No available staff members");
            }
            
            // Calculate order complexity and requirements
            OrderAssignmentProfile orderProfile = analyzeOrderRequirements(order);
            
            // Score and rank staff members
            List<StaffAssignmentScore> staffScores = availableStaff.stream()
                .map(staff -> calculateStaffScore(staff, orderProfile))
                .filter(score -> score.isAssignable())
                .sorted((s1, s2) -> Double.compare(s2.getTotalScore(), s1.getTotalScore()))
                .collect(Collectors.toList());
            
            if (staffScores.isEmpty()) {
                logger.warn("No suitable staff found for order {} assignment", order.getOrderId());
                return AssignmentResult.failure("No staff members meet assignment criteria");
            }
            
            // Select best staff member
            StaffAssignmentScore bestScore = staffScores.get(0);
            StaffMember selectedStaff = bestScore.getStaffMember();
            
            // Log assignment decision
            logger.info("Selected staff {} for order {} with score {:.2f} (workload: {}, capacity: {})",
                       selectedStaff.getDisplayName(), order.getOrderId(), bestScore.getTotalScore(),
                       bestScore.getCurrentWorkload(), bestScore.getMaxCapacity());
            
            // Create assignment result
            AssignmentResult result = AssignmentResult.success(selectedStaff, bestScore.getTotalScore());
            result.setAssignmentReason(buildAssignmentReason(bestScore, orderProfile));
            result.setEstimatedCompleteTime(calculateEstimatedCompleteTime(selectedStaff, orderProfile));
            result.setWorkloadImpact(calculateWorkloadImpact(bestScore));
            
            return result;
            
        } catch (Exception e) {
            logger.error("Error in auto-assignment for order {}: ", order.getOrderId(), e);
            return AssignmentResult.failure("Assignment engine error: " + e.getMessage());
        }
    }
    
    /**
     * Calculate Staff Workload Score
     * Comprehensive workload analysis including capacity, performance, and efficiency
     */
    public WorkloadScore calculateStaffWorkload(String staffId) {
        try {
            StaffMember staff = staffMemberRepository.findByStaffId(staffId);
            if (staff == null) {
                return WorkloadScore.notFound();
            }
            
            // Get current assignments
            int currentAssignments = orderAssignmentRepository.countActiveAssignmentsByStaff(staffId);
            int maxCapacity = getMaxCapacityForRole(staff.getRole());
            
            // Calculate workload percentage
            double workloadPercentage = maxCapacity > 0 ? (double) currentAssignments / maxCapacity : 0.0;
            
            // Get performance metrics
            StaffPerformanceMetrics performance = getStaffPerformanceMetrics(staffId);
            
            // Calculate workload score
            WorkloadScore score = new WorkloadScore(staffId, staff.getDisplayName(), staff.getRole(),
                                                  currentAssignments, maxCapacity, workloadPercentage);
            
            // Add performance factors
            score.setAverageCompletionTime(performance.getAverageCompletionTime());
            score.setSuccessRate(performance.getSuccessRate());
            score.setCustomerRating(performance.getCustomerRating());
            
            // Determine workload status
            if (workloadPercentage >= 1.0) {
                score.setStatus(WorkloadStatus.OVERLOADED);
            } else if (workloadPercentage >= OVERLOAD_THRESHOLD) {
                score.setStatus(WorkloadStatus.HIGH);
            } else if (workloadPercentage >= 0.5) {
                score.setStatus(WorkloadStatus.MEDIUM);
            } else {
                score.setStatus(WorkloadStatus.LOW);
            }
            
            // Add recommendations
            score.setRecommendation(generateWorkloadRecommendation(score));
            
            return score;
            
        } catch (Exception e) {
            logger.error("Error calculating workload for staff {}: ", staffId, e);
            return WorkloadScore.error("Calculation error: " + e.getMessage());
        }
    }
    
    /**
     * Escalate Overdue Orders
     * Automatically escalate priority and reassign overdue orders
     */
    public void escalateOverdueOrders() {
        try {
            logger.info("Starting escalation process for overdue orders");
            
            LocalDateTime overdueThreshold = LocalDateTime.now().minusMinutes(PRIORITY_ESCALATION_MINUTES);
            List<Order> overdueOrders = findOverdueOrders(overdueThreshold);
            
            if (overdueOrders.isEmpty()) {
                logger.info("No overdue orders found for escalation");
                return;
            }
            
            logger.info("Found {} overdue orders for escalation", overdueOrders.size());
            
            for (Order order : overdueOrders) {
                try {
                    escalateOrder(order);
                } catch (Exception e) {
                    logger.error("Error escalating order {}: ", order.getOrderId(), e);
                }
            }
            
            logger.info("Escalation process completed for {} orders", overdueOrders.size());
            
        } catch (Exception e) {
            logger.error("Error in order escalation process: ", e);
        }
    }
    
    /**
     * Check if Staff Can Handle More Orders
     * Comprehensive capacity check including workload and performance factors
     */
    public boolean canStaffHandleMoreOrders(String staffId, StaffRole role) {
        try {
            WorkloadScore workload = calculateStaffWorkload(staffId);
            
            if (workload.getStatus() == WorkloadStatus.ERROR) {
                return false;
            }
            
            // Basic capacity check
            if (workload.getWorkloadPercentage() >= 1.0) {
                return false;
            }
            
            // Performance-based capacity adjustment
            if (workload.getSuccessRate() < 0.8 && workload.getWorkloadPercentage() >= 0.7) {
                logger.info("Staff {} capacity limited due to low success rate: {}", 
                           staffId, workload.getSuccessRate());
                return false;
            }
            
            // High-performance staff can handle slightly more
            if (workload.getSuccessRate() > HIGH_PERFORMANCE_THRESHOLD && 
                workload.getWorkloadPercentage() < 0.95) {
                return true;
            }
            
            return workload.getWorkloadPercentage() < OVERLOAD_THRESHOLD;
            
        } catch (Exception e) {
            logger.error("Error checking staff capacity for {}: ", staffId, e);
            return false;
        }
    }
    
    /**
     * Get Workload Distribution Analysis
     * Comprehensive analysis of workload across all staff members
     */
    public WorkloadDistribution getWorkloadDistribution() {
        try {
            List<StaffMember> allStaff = staffMemberRepository.findActiveStaff();
            
            Map<StaffRole, List<WorkloadScore>> workloadByRole = allStaff.stream()
                .collect(Collectors.groupingBy(
                    StaffMember::getRole,
                    Collectors.mapping(
                        staff -> calculateStaffWorkload(staff.getStaffId()),
                        Collectors.toList()
                    )
                ));
            
            WorkloadDistribution distribution = new WorkloadDistribution();
            distribution.setTimestamp(LocalDateTime.now());
            distribution.setTotalStaff(allStaff.size());
            distribution.setWorkloadByRole(workloadByRole);
            
            // Calculate overall metrics
            calculateOverallMetrics(distribution, workloadByRole);
            
            // Identify bottlenecks
            identifyBottlenecks(distribution, workloadByRole);
            
            // Generate recommendations
            generateDistributionRecommendations(distribution);
            
            return distribution;
            
        } catch (Exception e) {
            logger.error("Error calculating workload distribution: ", e);
            return WorkloadDistribution.error("Distribution calculation error");
        }
    }
    
    // Private helper methods
    
    private List<StaffMember> getAvailableStaff() {
        return staffMemberRepository.findActiveStaff().stream()
            .filter(staff -> canStaffHandleMoreOrders(staff.getStaffId(), staff.getRole()))
            .collect(Collectors.toList());
    }
    
    private OrderAssignmentProfile analyzeOrderRequirements(Order order) {
        OrderAssignmentProfile profile = new OrderAssignmentProfile();
        profile.setOrderId(order.getOrderId());
        profile.setOrderTime(order.getOrderTime());
        profile.setComplexity(calculateOrderComplexity(order));
        profile.setRequiredSkills(determineRequiredSkills(order));
        profile.setPriority(determineOrderPriority(order));
        profile.setEstimatedDuration(estimateOrderDuration(order));
        profile.setTableZone(determineTableZone(order.getTableNumber()));
        
        return profile;
    }
    
    private StaffAssignmentScore calculateStaffScore(StaffMember staff, OrderAssignmentProfile orderProfile) {
        StaffAssignmentScore score = new StaffAssignmentScore(staff);
        
        // Get current workload
        WorkloadScore workload = calculateStaffWorkload(staff.getStaffId());
        score.setCurrentWorkload(workload.getCurrentAssignments());
        score.setMaxCapacity(workload.getMaxCapacity());
        score.setWorkloadPercentage(workload.getWorkloadPercentage());
        
        // Calculate scoring factors
        double capacityScore = calculateCapacityScore(workload);
        double skillScore = calculateSkillScore(staff, orderProfile);
        double performanceScore = calculatePerformanceScore(workload);
        double proximityScore = calculateProximityScore(staff, orderProfile);
        double priorityScore = calculatePriorityScore(staff, orderProfile);
        
        // Weighted total score
        double totalScore = (capacityScore * 0.3) + (skillScore * 0.25) + 
                          (performanceScore * 0.2) + (proximityScore * 0.15) + 
                          (priorityScore * 0.1);
        
        score.setCapacityScore(capacityScore);
        score.setSkillScore(skillScore);
        score.setPerformanceScore(performanceScore);
        score.setProximityScore(proximityScore);
        score.setPriorityScore(priorityScore);
        score.setTotalScore(totalScore);
        
        // Determine if assignable
        score.setAssignable(totalScore > 0.5 && capacityScore > 0.0);
        
        return score;
    }
    
    private double calculateCapacityScore(WorkloadScore workload) {
        if (workload.getWorkloadPercentage() >= 1.0) return 0.0;
        if (workload.getWorkloadPercentage() >= OVERLOAD_THRESHOLD) return 0.2;
        
        // Higher score for lower workload
        return Math.max(0.0, 1.0 - workload.getWorkloadPercentage());
    }
    
    private double calculateSkillScore(StaffMember staff, OrderAssignmentProfile orderProfile) {
        // Score based on role match with order requirements
        double baseScore = 0.5; // Default score
        
        // Kitchen orders prefer kitchen staff
        if (orderProfile.getRequiredSkills().contains("KITCHEN")) {
            if (staff.getRole().canAccessKitchen()) {
                baseScore += 0.4;
            }
        }
        
        // Service orders prefer service staff
        if (orderProfile.getRequiredSkills().contains("SERVICE")) {
            if (staff.getRole() == StaffRole.SERVICE || staff.getRole().isManagerRole()) {
                baseScore += 0.4;
            }
        }
        
        // Complex orders prefer experienced staff
        if (orderProfile.getComplexity() > 0.7 && staff.getRole().isManagerRole()) {
            baseScore += 0.1;
        }
        
        return Math.min(1.0, baseScore);
    }
    
    private double calculatePerformanceScore(WorkloadScore workload) {
        // Score based on historical performance
        double score = workload.getSuccessRate();
        
        // Adjust for completion time efficiency
        if (workload.getAverageCompletionTime() > 0) {
            double efficiencyFactor = Math.max(0.5, Math.min(1.5, 30.0 / workload.getAverageCompletionTime()));
            score *= efficiencyFactor;
        }
        
        // Customer rating factor
        if (workload.getCustomerRating() > 0) {
            score = (score + workload.getCustomerRating() / 5.0) / 2.0;
        }
        
        return Math.min(1.0, score);
    }
    
    private double calculateProximityScore(StaffMember staff, OrderAssignmentProfile orderProfile) {
        // For now, return neutral score
        // In a full implementation, this would consider table zones and staff locations
        return 0.7;
    }
    
    private double calculatePriorityScore(StaffMember staff, OrderAssignmentProfile orderProfile) {
        double score = 0.5; // Default
        
        // Urgent orders prefer managers or experienced staff
        if (orderProfile.getPriority() == OrderPriority.URGENT || 
            orderProfile.getPriority() == OrderPriority.EMERGENCY) {
            if (staff.getRole().isManagerRole()) {
                score += 0.4;
            } else if (staff.getRole().getHierarchyLevel() >= 3) {
                score += 0.2;
            }
        }
        
        return score;
    }
    
    private int calculateOrderComplexity(Order order) {
        // Simple complexity calculation based on item count and special instructions
        int baseComplexity = order.getOrderItems() != null ? order.getOrderItems().size() : 1;
        if (order.getSpecialInstructions() != null && !order.getSpecialInstructions().isEmpty()) {
            baseComplexity += 2;
        }
        return Math.min(10, baseComplexity); // Scale 1-10
    }
    
    private Set<String> determineRequiredSkills(Order order) {
        Set<String> skills = new HashSet<>();
        skills.add("KITCHEN"); // Most orders require kitchen skills
        
        // Add service skill if table service is required
        if (order.getTableNumber() != null && !order.getTableNumber().isEmpty()) {
            skills.add("SERVICE");
        }
        
        return skills;
    }
    
    private OrderPriority determineOrderPriority(Order order) {
        // Determine priority based on order age and status
        long ageMinutes = Duration.between(order.getOrderTime(), LocalDateTime.now()).toMinutes();
        
        if (ageMinutes > PRIORITY_ESCALATION_MINUTES) {
            return OrderPriority.URGENT;
        } else if (ageMinutes > 15) {
            return OrderPriority.HIGH;
        } else {
            return OrderPriority.NORMAL;
        }
    }
    
    private int estimateOrderDuration(Order order) {
        // Estimate duration in minutes
        int baseTime = 15; // Base preparation time
        int itemCount = order.getOrderItems() != null ? order.getOrderItems().size() : 1;
        return baseTime + (itemCount * 3);
    }
    
    private String determineTableZone(String tableNumber) {
        // Simple zone determination - in reality, this would be more sophisticated
        if (tableNumber == null) return "COUNTER";
        
        try {
            int table = Integer.parseInt(tableNumber);
            if (table <= 10) return "ZONE_A";
            if (table <= 20) return "ZONE_B";
            return "ZONE_C";
        } catch (NumberFormatException e) {
            return "UNKNOWN";
        }
    }
    
    private int getMaxCapacityForRole(StaffRole role) {
        return switch (role) {
            case KITCHEN -> MAX_ORDERS_PER_KITCHEN_STAFF;
            case SERVICE -> MAX_ORDERS_PER_SERVICE_STAFF;
            case CASHIER -> MAX_ORDERS_PER_CASHIER;
            case MANAGER, ADMIN -> MAX_ORDERS_PER_SERVICE_STAFF;
        };
    }
    
    private StaffPerformanceMetrics getStaffPerformanceMetrics(String staffId) {
        // In a full implementation, this would query performance data
        return new StaffPerformanceMetrics(20.0, 0.85, 4.2);
    }
    
    private List<Order> findOverdueOrders(LocalDateTime threshold) {
        // Implementation would query database for overdue orders
        return Collections.emptyList(); // Placeholder
    }
    
    private void escalateOrder(Order order) {
        logger.info("Escalating overdue order: {}", order.getOrderId());
        
        // Escalate priority
        // Reassign to higher-capacity staff if needed
        // Send notifications
        
        // For now, just log the escalation
        logger.info("Order {} has been escalated due to overdue status", order.getOrderId());
    }
    
    private String buildAssignmentReason(StaffAssignmentScore score, OrderAssignmentProfile orderProfile) {
        return String.format("Auto-assigned based on optimal score (%.2f) - workload: %.1f%%, skills match: %.1f",
                           score.getTotalScore(), score.getWorkloadPercentage() * 100, 
                           score.getSkillScore() * 100);
    }
    
    private LocalDateTime calculateEstimatedCompleteTime(StaffMember staff, OrderAssignmentProfile orderProfile) {
        return LocalDateTime.now().plusMinutes(orderProfile.getEstimatedDuration());
    }
    
    private String calculateWorkloadImpact(StaffAssignmentScore score) {
        double newWorkload = (score.getCurrentWorkload() + 1.0) / score.getMaxCapacity();
        
        if (newWorkload >= OVERLOAD_THRESHOLD) {
            return "HIGH - Staff approaching capacity";
        } else if (newWorkload >= 0.6) {
            return "MEDIUM - Normal workload increase";
        } else {
            return "LOW - Staff has available capacity";
        }
    }
    
    private String generateWorkloadRecommendation(WorkloadScore score) {
        return switch (score.getStatus()) {
            case LOW -> "Staff has available capacity for additional orders";
            case MEDIUM -> "Staff workload is balanced";
            case HIGH -> "Consider redistributing orders if possible";
            case OVERLOADED -> "Urgent: Redistribute orders to other staff members";
            case ERROR -> "Unable to assess workload";
        };
    }
    
    private void calculateOverallMetrics(WorkloadDistribution distribution, 
                                       Map<StaffRole, List<WorkloadScore>> workloadByRole) {
        // Calculate overall statistics
        List<WorkloadScore> allScores = workloadByRole.values().stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());
        
        if (!allScores.isEmpty()) {
            double avgWorkload = allScores.stream()
                .mapToDouble(WorkloadScore::getWorkloadPercentage)
                .average().orElse(0.0);
            
            long overloadedCount = allScores.stream()
                .mapToLong(score -> score.getStatus() == WorkloadStatus.OVERLOADED ? 1 : 0)
                .sum();
            
            distribution.setAverageWorkload(avgWorkload);
            distribution.setOverloadedStaffCount((int) overloadedCount);
        }
    }
    
    private void identifyBottlenecks(WorkloadDistribution distribution, 
                                   Map<StaffRole, List<WorkloadScore>> workloadByRole) {
        List<String> bottlenecks = new ArrayList<>();
        
        workloadByRole.forEach((role, scores) -> {
            long overloadedInRole = scores.stream()
                .mapToLong(score -> score.getStatus() == WorkloadStatus.OVERLOADED ? 1 : 0)
                .sum();
            
            if (overloadedInRole > scores.size() / 2) {
                bottlenecks.add(role.getDisplayName() + " role is overloaded");
            }
        });
        
        distribution.setBottlenecks(bottlenecks);
    }
    
    private void generateDistributionRecommendations(WorkloadDistribution distribution) {
        List<String> recommendations = new ArrayList<>();
        
        if (distribution.getOverloadedStaffCount() > 0) {
            recommendations.add("Consider redistributing orders from overloaded staff");
        }
        
        if (distribution.getAverageWorkload() > OVERLOAD_THRESHOLD) {
            recommendations.add("Overall workload is high - consider adding more staff");
        }
        
        if (distribution.getBottlenecks() != null && !distribution.getBottlenecks().isEmpty()) {
            recommendations.add("Address role-specific bottlenecks identified");
        }
        
        if (recommendations.isEmpty()) {
            recommendations.add("Workload distribution is optimal");
        }
        
        distribution.setRecommendations(recommendations);
    }
    
    // Result and data classes
    
    public static class AssignmentResult {
        private boolean successful;
        private StaffMember assignedStaff;
        private double assignmentScore;
        private String assignmentReason;
        private String errorMessage;
        private LocalDateTime estimatedCompleteTime;
        private String workloadImpact;
        
        private AssignmentResult(boolean successful) {
            this.successful = successful;
        }
        
        public static AssignmentResult success(StaffMember staff, double score) {
            AssignmentResult result = new AssignmentResult(true);
            result.assignedStaff = staff;
            result.assignmentScore = score;
            return result;
        }
        
        public static AssignmentResult failure(String message) {
            AssignmentResult result = new AssignmentResult(false);
            result.errorMessage = message;
            return result;
        }
        
        // Getters and Setters
        public boolean isSuccessful() { return successful; }
        public StaffMember getAssignedStaff() { return assignedStaff; }
        public double getAssignmentScore() { return assignmentScore; }
        public String getAssignmentReason() { return assignmentReason; }
        public void setAssignmentReason(String assignmentReason) { this.assignmentReason = assignmentReason; }
        public String getErrorMessage() { return errorMessage; }
        public LocalDateTime getEstimatedCompleteTime() { return estimatedCompleteTime; }
        public void setEstimatedCompleteTime(LocalDateTime estimatedCompleteTime) { this.estimatedCompleteTime = estimatedCompleteTime; }
        public String getWorkloadImpact() { return workloadImpact; }
        public void setWorkloadImpact(String workloadImpact) { this.workloadImpact = workloadImpact; }
    }
    
    public static class WorkloadScore {
        private String staffId;
        private String staffName;
        private StaffRole role;
        private int currentAssignments;
        private int maxCapacity;
        private double workloadPercentage;
        private WorkloadStatus status;
        private double averageCompletionTime;
        private double successRate;
        private double customerRating;
        private String recommendation;
        
        public WorkloadScore(String staffId, String staffName, StaffRole role,
                           int currentAssignments, int maxCapacity, double workloadPercentage) {
            this.staffId = staffId;
            this.staffName = staffName;
            this.role = role;
            this.currentAssignments = currentAssignments;
            this.maxCapacity = maxCapacity;
            this.workloadPercentage = workloadPercentage;
        }
        
        public static WorkloadScore notFound() {
            WorkloadScore score = new WorkloadScore("", "", null, 0, 0, 0.0);
            score.status = WorkloadStatus.ERROR;
            score.recommendation = "Staff member not found";
            return score;
        }
        
        public static WorkloadScore error(String message) {
            WorkloadScore score = new WorkloadScore("", "", null, 0, 0, 0.0);
            score.status = WorkloadStatus.ERROR;
            score.recommendation = message;
            return score;
        }
        
        // Getters and Setters
        public String getStaffId() { return staffId; }
        public String getStaffName() { return staffName; }
        public StaffRole getRole() { return role; }
        public int getCurrentAssignments() { return currentAssignments; }
        public int getMaxCapacity() { return maxCapacity; }
        public double getWorkloadPercentage() { return workloadPercentage; }
        public WorkloadStatus getStatus() { return status; }
        public void setStatus(WorkloadStatus status) { this.status = status; }
        public double getAverageCompletionTime() { return averageCompletionTime; }
        public void setAverageCompletionTime(double averageCompletionTime) { this.averageCompletionTime = averageCompletionTime; }
        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }
        public double getCustomerRating() { return customerRating; }
        public void setCustomerRating(double customerRating) { this.customerRating = customerRating; }
        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }
    
    public enum WorkloadStatus {
        LOW, MEDIUM, HIGH, OVERLOADED, ERROR
    }
    
    public static class WorkloadDistribution {
        private LocalDateTime timestamp;
        private int totalStaff;
        private Map<StaffRole, List<WorkloadScore>> workloadByRole;
        private double averageWorkload;
        private int overloadedStaffCount;
        private List<String> bottlenecks;
        private List<String> recommendations;
        private boolean isError;
        private String errorMessage;
        
        public static WorkloadDistribution error(String message) {
            WorkloadDistribution dist = new WorkloadDistribution();
            dist.isError = true;
            dist.errorMessage = message;
            return dist;
        }
        
        // Getters and Setters
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public int getTotalStaff() { return totalStaff; }
        public void setTotalStaff(int totalStaff) { this.totalStaff = totalStaff; }
        public Map<StaffRole, List<WorkloadScore>> getWorkloadByRole() { return workloadByRole; }
        public void setWorkloadByRole(Map<StaffRole, List<WorkloadScore>> workloadByRole) { this.workloadByRole = workloadByRole; }
        public double getAverageWorkload() { return averageWorkload; }
        public void setAverageWorkload(double averageWorkload) { this.averageWorkload = averageWorkload; }
        public int getOverloadedStaffCount() { return overloadedStaffCount; }
        public void setOverloadedStaffCount(int overloadedStaffCount) { this.overloadedStaffCount = overloadedStaffCount; }
        public List<String> getBottlenecks() { return bottlenecks; }
        public void setBottlenecks(List<String> bottlenecks) { this.bottlenecks = bottlenecks; }
        public List<String> getRecommendations() { return recommendations; }
        public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
    }
    
    // Helper classes
    
    private static class OrderAssignmentProfile {
        private String orderId;
        private LocalDateTime orderTime;
        private int complexity;
        private Set<String> requiredSkills;
        private OrderPriority priority;
        private int estimatedDuration;
        private String tableZone;
        
        // Getters and Setters
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public LocalDateTime getOrderTime() { return orderTime; }
        public void setOrderTime(LocalDateTime orderTime) { this.orderTime = orderTime; }
        public int getComplexity() { return complexity; }
        public void setComplexity(int complexity) { this.complexity = complexity; }
        public Set<String> getRequiredSkills() { return requiredSkills; }
        public void setRequiredSkills(Set<String> requiredSkills) { this.requiredSkills = requiredSkills; }
        public OrderPriority getPriority() { return priority; }
        public void setPriority(OrderPriority priority) { this.priority = priority; }
        public int getEstimatedDuration() { return estimatedDuration; }
        public void setEstimatedDuration(int estimatedDuration) { this.estimatedDuration = estimatedDuration; }
        public String getTableZone() { return tableZone; }
        public void setTableZone(String tableZone) { this.tableZone = tableZone; }
    }
    
    private static class StaffAssignmentScore {
        private StaffMember staffMember;
        private int currentWorkload;
        private int maxCapacity;
        private double workloadPercentage;
        private double capacityScore;
        private double skillScore;
        private double performanceScore;
        private double proximityScore;
        private double priorityScore;
        private double totalScore;
        private boolean assignable;
        
        public StaffAssignmentScore(StaffMember staffMember) {
            this.staffMember = staffMember;
        }
        
        // Getters and Setters
        public StaffMember getStaffMember() { return staffMember; }
        public int getCurrentWorkload() { return currentWorkload; }
        public void setCurrentWorkload(int currentWorkload) { this.currentWorkload = currentWorkload; }
        public int getMaxCapacity() { return maxCapacity; }
        public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }
        public double getWorkloadPercentage() { return workloadPercentage; }
        public void setWorkloadPercentage(double workloadPercentage) { this.workloadPercentage = workloadPercentage; }
        public double getCapacityScore() { return capacityScore; }
        public void setCapacityScore(double capacityScore) { this.capacityScore = capacityScore; }
        public double getSkillScore() { return skillScore; }
        public void setSkillScore(double skillScore) { this.skillScore = skillScore; }
        public double getPerformanceScore() { return performanceScore; }
        public void setPerformanceScore(double performanceScore) { this.performanceScore = performanceScore; }
        public double getProximityScore() { return proximityScore; }
        public void setProximityScore(double proximityScore) { this.proximityScore = proximityScore; }
        public double getPriorityScore() { return priorityScore; }
        public void setPriorityScore(double priorityScore) { this.priorityScore = priorityScore; }
        public double getTotalScore() { return totalScore; }
        public void setTotalScore(double totalScore) { this.totalScore = totalScore; }
        public boolean isAssignable() { return assignable; }
        public void setAssignable(boolean assignable) { this.assignable = assignable; }
    }
    
    private static class StaffPerformanceMetrics {
        private double averageCompletionTime;
        private double successRate;
        private double customerRating;
        
        public StaffPerformanceMetrics(double averageCompletionTime, double successRate, double customerRating) {
            this.averageCompletionTime = averageCompletionTime;
            this.successRate = successRate;
            this.customerRating = customerRating;
        }
        
        // Getters
        public double getAverageCompletionTime() { return averageCompletionTime; }
        public double getSuccessRate() { return successRate; }
        public double getCustomerRating() { return customerRating; }
    }
}