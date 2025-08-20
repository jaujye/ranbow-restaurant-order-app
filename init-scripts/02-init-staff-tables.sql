-- Staff Management Database Schema
-- Creates tables for staff operations, statistics, notifications, and kitchen management
-- This script extends the existing restaurant database with staff-specific functionality

-- ================================
-- ENUM TYPES FOR STAFF SYSTEM
-- ================================

-- Statistics period enumeration
CREATE TYPE statistics_period AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- Notification type enumeration  
CREATE TYPE notification_type AS ENUM (
    'NEW_ORDER', 'ORDER_STATUS_CHANGE', 'ORDER_OVERTIME', 'EMERGENCY',
    'SHIFT_REMINDER', 'SYSTEM', 'CUSTOMER_FEEDBACK', 'ANNOUNCEMENT'
);

-- Notification priority enumeration
CREATE TYPE notification_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'EMERGENCY');

-- Kitchen status enumeration
CREATE TYPE kitchen_status AS ENUM (
    'QUEUED', 'PREPARING', 'COOKING', 'PLATING', 
    'READY', 'SERVED', 'PAUSED', 'CANCELLED'
);

-- ================================
-- STAFF MANAGEMENT TABLES
-- ================================

-- Staff table - extends User entity with staff-specific information
CREATE TABLE staff (
    staff_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    is_on_duty BOOLEAN DEFAULT FALSE,
    shift_start_time TIMESTAMP,
    shift_end_time TIMESTAMP,
    last_activity_time TIMESTAMP,
    daily_orders_processed INTEGER DEFAULT 0,
    efficiency_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (efficiency_rating >= 0.00 AND efficiency_rating <= 1.00),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for staff table
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_employee_id ON staff(employee_id);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_on_duty ON staff(is_on_duty);
CREATE INDEX idx_staff_activity_time ON staff(last_activity_time);

-- ================================
-- STAFF STATISTICS TABLES
-- ================================

-- Staff statistics table - tracks performance metrics
CREATE TABLE staff_statistics (
    statistics_id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36) NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period statistics_period NOT NULL,
    
    -- Performance Metrics
    orders_processed INTEGER DEFAULT 0,
    orders_completed INTEGER DEFAULT 0,
    orders_cancelled INTEGER DEFAULT 0,
    average_processing_time_minutes DECIMAL(5,2) DEFAULT 0.00,
    overtime_orders INTEGER DEFAULT 0,
    efficiency_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (efficiency_rating >= 0.00 AND efficiency_rating <= 1.00),
    
    -- Time Metrics
    working_minutes INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    break_minutes INTEGER DEFAULT 0,
    
    -- Quality Metrics
    customer_compliments INTEGER DEFAULT 0,
    customer_complaints INTEGER DEFAULT 0,
    customer_satisfaction_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (customer_satisfaction_rating >= 0.00 AND customer_satisfaction_rating <= 5.00),
    
    -- Revenue Metrics
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    average_order_value DECIMAL(8,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique statistics per staff, date, and period
    UNIQUE(staff_id, date, period)
);

-- Create indexes for staff statistics
CREATE INDEX idx_staff_stats_staff_id ON staff_statistics(staff_id);
CREATE INDEX idx_staff_stats_date ON staff_statistics(date);
CREATE INDEX idx_staff_stats_period ON staff_statistics(period);
CREATE INDEX idx_staff_stats_efficiency ON staff_statistics(efficiency_rating DESC);
CREATE INDEX idx_staff_stats_orders_completed ON staff_statistics(orders_completed DESC);

-- ================================
-- NOTIFICATION SYSTEM TABLES
-- ================================

-- Notifications table - handles staff notifications
CREATE TABLE notifications (
    notification_id VARCHAR(36) PRIMARY KEY,
    recipient_staff_id VARCHAR(36) NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
    sender_staff_id VARCHAR(36) REFERENCES staff(staff_id) ON DELETE SET NULL,
    type notification_type NOT NULL,
    priority notification_priority DEFAULT 'NORMAL',
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    related_order_id VARCHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    action_url VARCHAR(255)
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_staff_id);
CREATE INDEX idx_notifications_sender ON notifications(sender_staff_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX idx_notifications_related_order ON notifications(related_order_id);

-- ================================
-- KITCHEN MANAGEMENT TABLES
-- ================================

-- Kitchen orders table - tracks cooking workflow and timing
CREATE TABLE kitchen_orders (
    kitchen_order_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    assigned_staff_id VARCHAR(36) REFERENCES staff(staff_id) ON DELETE SET NULL,
    start_time TIMESTAMP,
    estimated_completion_time TIMESTAMP,
    actual_completion_time TIMESTAMP,
    estimated_cooking_minutes INTEGER DEFAULT 0,
    actual_cooking_minutes INTEGER DEFAULT 0,
    is_overtime BOOLEAN DEFAULT FALSE,
    cooking_notes TEXT,
    kitchen_status kitchen_status DEFAULT 'QUEUED',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique kitchen order per main order
    UNIQUE(order_id)
);

-- Create indexes for kitchen orders
CREATE INDEX idx_kitchen_orders_order_id ON kitchen_orders(order_id);
CREATE INDEX idx_kitchen_orders_assigned_staff ON kitchen_orders(assigned_staff_id);
CREATE INDEX idx_kitchen_orders_status ON kitchen_orders(kitchen_status);
CREATE INDEX idx_kitchen_orders_priority ON kitchen_orders(priority DESC);
CREATE INDEX idx_kitchen_orders_estimated_time ON kitchen_orders(estimated_completion_time);
CREATE INDEX idx_kitchen_orders_created_at ON kitchen_orders(created_at);
CREATE INDEX idx_kitchen_orders_is_overtime ON kitchen_orders(is_overtime);

-- ================================
-- SAMPLE DATA INSERTION
-- ================================

-- Insert sample staff members (assuming some users already exist with STAFF role)
-- This would be populated based on existing users with STAFF or ADMIN roles

INSERT INTO staff (staff_id, user_id, employee_id, department, position) 
SELECT 
    gen_random_uuid()::varchar(36),
    user_id,
    'ST' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 3, '0'),
    CASE 
        WHEN username LIKE '%chef%' OR username LIKE '%廚師%' THEN '廚房'
        WHEN username LIKE '%waiter%' OR username LIKE '%服務%' THEN '服務'
        ELSE '管理'
    END,
    CASE 
        WHEN role = 'ADMIN' THEN 'Manager'
        WHEN username LIKE '%chef%' OR username LIKE '%廚師%' THEN 'Chef'
        ELSE 'Waiter'
    END
FROM users 
WHERE role IN ('STAFF', 'ADMIN')
ON CONFLICT (employee_id) DO NOTHING;

-- ================================
-- TRIGGERS AND FUNCTIONS
-- ================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_statistics_updated_at BEFORE UPDATE ON staff_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kitchen_orders_updated_at BEFORE UPDATE ON kitchen_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily staff statistics (to be called daily)
CREATE OR REPLACE FUNCTION reset_daily_staff_counters()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE staff SET 
        daily_orders_processed = 0,
        updated_at = CURRENT_TIMESTAMP;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- VIEWS FOR REPORTING
-- ================================

-- View for staff performance dashboard
CREATE OR REPLACE VIEW staff_performance_summary AS
SELECT 
    s.staff_id,
    s.employee_id,
    u.username,
    s.department,
    s.position,
    s.is_on_duty,
    s.daily_orders_processed,
    s.efficiency_rating,
    COALESCE(ss.orders_completed, 0) as today_completed,
    COALESCE(ss.total_revenue, 0) as today_revenue,
    COALESCE(ss.average_processing_time_minutes, 0) as avg_processing_time,
    COUNT(n.notification_id) as unread_notifications
FROM staff s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN staff_statistics ss ON s.staff_id = ss.staff_id 
    AND ss.date = CURRENT_DATE 
    AND ss.period = 'DAILY'
LEFT JOIN notifications n ON s.staff_id = n.recipient_staff_id 
    AND n.is_read = FALSE
    AND (n.expires_at IS NULL OR n.expires_at > CURRENT_TIMESTAMP)
WHERE u.is_active = TRUE
GROUP BY s.staff_id, s.employee_id, u.username, s.department, s.position, 
         s.is_on_duty, s.daily_orders_processed, s.efficiency_rating,
         ss.orders_completed, ss.total_revenue, ss.average_processing_time_minutes;

-- View for kitchen queue summary
CREATE OR REPLACE VIEW kitchen_queue_summary AS
SELECT 
    ko.kitchen_order_id,
    ko.order_id,
    o.table_number,
    o.order_time,
    ko.kitchen_status,
    ko.priority,
    ko.estimated_completion_time,
    ko.assigned_staff_id,
    s.employee_id as assigned_staff_employee_id,
    CASE 
        WHEN ko.estimated_completion_time < CURRENT_TIMESTAMP 
             AND ko.kitchen_status NOT IN ('READY', 'SERVED', 'CANCELLED') 
        THEN TRUE 
        ELSE FALSE 
    END as is_overdue,
    CASE 
        WHEN ko.estimated_completion_time < CURRENT_TIMESTAMP 
        THEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ko.estimated_completion_time))/60
        ELSE 0
    END as overdue_minutes
FROM kitchen_orders ko
JOIN orders o ON ko.order_id = o.order_id
LEFT JOIN staff s ON ko.assigned_staff_id = s.staff_id
WHERE ko.kitchen_status NOT IN ('SERVED', 'CANCELLED')
ORDER BY ko.priority DESC, ko.created_at ASC;

-- ================================
-- PERMISSIONS AND SECURITY
-- ================================

-- Grant appropriate permissions (adjust based on your application user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO restaurant_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO restaurant_app_user;

-- ================================
-- COMPLETION MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Staff Management System Database Setup Complete!';
    RAISE NOTICE '=====================================';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '- staff (staff management)';
    RAISE NOTICE '- staff_statistics (performance tracking)';
    RAISE NOTICE '- notifications (staff notifications)';
    RAISE NOTICE '- kitchen_orders (kitchen workflow)';
    RAISE NOTICE '';
    RAISE NOTICE 'Created views:';
    RAISE NOTICE '- staff_performance_summary';
    RAISE NOTICE '- kitchen_queue_summary';
    RAISE NOTICE '';
    RAISE NOTICE 'Created functions:';
    RAISE NOTICE '- cleanup_expired_notifications()';
    RAISE NOTICE '- reset_daily_staff_counters()';
    RAISE NOTICE '';
    RAISE NOTICE 'System is ready for staff operations!';
END $$;