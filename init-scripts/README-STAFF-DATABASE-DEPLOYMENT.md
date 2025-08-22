# Staff Management Database Schema Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the complete staff management database schema for the Ranbow Restaurant Order Application. The schema includes all tables, indexes, functions, triggers, and business rules required for the staff management system.

## 📋 Schema Components

### Core Tables
1. **staff_members** - Enhanced staff authentication and profile management
2. **work_shifts** - Complete shift tracking and time management  
3. **order_assignments** - Order-to-staff assignment system
4. **cooking_timers** - Kitchen timer management with alerts
5. **staff_activities** - Comprehensive audit logging
6. **staff_sessions** - JWT session management
7. **staff_performance** - Performance metrics tracking

### Supporting Features
- **Performance Indexes** - Optimized database queries
- **Business Rules** - Data integrity constraints
- **Automated Functions** - System maintenance and calculations
- **Triggers** - Auto-updating timestamps and validations
- **Views** - Dashboard and reporting queries

## 🚀 Deployment Steps

### Step 1: Pre-Deployment Verification

Check current database state:

```sql
-- Verify existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%staff%';

-- Check current staff count
SELECT COUNT(*) as existing_staff FROM staff_members;
```

### Step 2: Execute Schema Files (In Order)

Execute the SQL files in the following sequence:

#### 1. Complete Staff Management Schema
```bash
psql -d ranbow_restaurant -f init-scripts/04-staff-management-complete-schema.sql
```
**What it does:**
- Creates/updates all staff management tables with complete specifications
- Adds comprehensive indexes for optimal performance  
- Creates database functions for automation
- Inserts sample data for testing
- Creates performance views for dashboards

#### 2. Business Rules and Constraints
```bash
psql -d ranbow_restaurant -f init-scripts/05-staff-business-rules-constraints.sql
```
**What it does:**
- Applies data validation constraints
- Enforces business logic rules
- Creates cross-table validation triggers
- Adds data cleanup functions
- Ensures system integrity

### Step 3: Verification Queries

After deployment, verify the schema:

```sql
-- 1. Verify all tables exist
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
    'staff_members', 'work_shifts', 'order_assignments', 
    'cooking_timers', 'staff_activities', 'staff_sessions', 'staff_performance'
)
ORDER BY table_name;

-- 2. Verify indexes created
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN (
    'staff_members', 'work_shifts', 'order_assignments', 
    'cooking_timers', 'staff_activities', 'staff_sessions', 'staff_performance'
)
ORDER BY tablename, indexname;

-- 3. Verify functions created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%staff%'
OR routine_name IN (
    'record_staff_activity', 'start_work_shift', 'end_work_shift',
    'cleanup_expired_sessions', 'calculate_shift_duration'
)
ORDER BY routine_name;

-- 4. Verify sample data
SELECT sm.employee_number, sm.name, sm.role, sm.department,
       ws.status as shift_status, ws.shift_date
FROM staff_members sm
LEFT JOIN work_shifts ws ON sm.staff_id = ws.staff_id AND ws.shift_date = CURRENT_DATE
ORDER BY sm.employee_number;

-- 5. Test views
SELECT * FROM staff_dashboard_summary LIMIT 5;
SELECT * FROM kitchen_workload_summary LIMIT 5;
```

## 📊 Database Schema Details

### Staff Members Table Structure

```sql
staff_members (
    staff_id UUID PRIMARY KEY,           -- Unique identifier
    employee_number VARCHAR(20) UNIQUE,  -- Employee ID (e.g., ADMIN001)
    email VARCHAR(100) UNIQUE,           -- Login email
    password_hash VARCHAR(255),          -- BCrypt hashed password
    pin_hash VARCHAR(255),               -- Quick switch PIN (BCrypt)
    name VARCHAR(100),                   -- Full name
    role VARCHAR(50) CHECK(...),         -- ADMIN|MANAGER|KITCHEN|SERVICE|CASHIER
    department VARCHAR(50),              -- Department name
    permissions TEXT[],                  -- Array of permissions
    is_active BOOLEAN DEFAULT true,      -- Account status
    quick_switch_enabled BOOLEAN,        -- PIN login enabled
    failed_login_attempts INTEGER,       -- Security tracking
    account_locked_until TIMESTAMP,      -- Lockout expiry
    last_login_at TIMESTAMP,            -- Last successful login
    created_at/updated_at TIMESTAMP     -- Timestamps
)
```

### Key Relationships

```
staff_members (1) ←→ (many) work_shifts
staff_members (1) ←→ (many) order_assignments  
staff_members (1) ←→ (many) cooking_timers
staff_members (1) ←→ (many) staff_activities
staff_members (1) ←→ (many) staff_sessions
staff_members (1) ←→ (many) staff_performance

order_assignments (1) ←→ (many) cooking_timers
orders (1) ←→ (many) order_assignments
orders (1) ←→ (many) cooking_timers
```

### Performance Indexes

All tables include optimized indexes:
- **Primary keys** - UUID-based unique identifiers
- **Foreign keys** - Relationship constraints
- **Query optimization** - Frequently searched columns
- **Composite indexes** - Multi-column queries
- **Partial indexes** - Conditional filtering (e.g., active records only)

## 🔧 Database Functions

### Core Functions

```sql
-- Activity logging
record_staff_activity(staff_id, activity_type, order_id, description, metadata)

-- Shift management  
start_work_shift(staff_id, device_id, session_id) RETURNS shift_id
end_work_shift(staff_id, device_id, session_id) RETURNS boolean

-- Session management
cleanup_expired_sessions() RETURNS integer

-- Time calculations
calculate_shift_duration(start_time, end_time, break_minutes) RETURNS integer
calculate_timer_duration(start_time, end_time, paused_duration) RETURNS integer

-- System maintenance
cleanup_old_staff_data() RETURNS (activities, sessions, performance)
```

### Automated Triggers

- **Updated timestamps** - Auto-update `updated_at` fields
- **Duration calculations** - Auto-calculate assignment/timer durations
- **Business rule validation** - Enforce constraints
- **Single active shift** - Prevent multiple active shifts per staff
- **Assignment limits** - Role-based concurrent assignment limits

## 📈 Dashboard Views

### staff_dashboard_summary
Complete staff overview with:
- Current shift status
- Active assignments and timers  
- Today's performance metrics
- Recent activity counts

### kitchen_workload_summary  
Kitchen operations focus:
- Active orders by priority
- Timer status and alerts
- Workstation assignments
- Efficiency metrics

## 🛡️ Business Rules & Constraints

### Data Validation
- **Email format** - RFC-compliant email addresses
- **Phone format** - International phone number patterns  
- **Employee numbers** - Standardized format (PREFIX000)
- **Duration limits** - Reasonable time ranges for all duration fields
- **Score ranges** - Performance scores within valid bounds (0-100)

### Business Logic
- **Role-department matching** - Roles must match appropriate departments
- **Quick switch security** - Quick switch requires PIN hash
- **Shift duration limits** - 2-16 hour shifts, reasonable break times
- **Assignment limits** - Role-based concurrent assignment maximums
- **Timer consistency** - Timer assignments must match order assignments

### Security Features
- **Account lockout** - Failed login attempt tracking
- **Session management** - JWT token lifecycle management
- **Activity logging** - Comprehensive audit trail
- **Permission arrays** - Flexible role-based permissions

## 🧪 Testing & Validation

### Sample Data Included
- **4 Staff Members** with different roles:
  - ADMIN001 - System Administrator
  - KITCHEN001 - Head Chef  
  - SERVICE001 - Service Staff
  - CASHIER001 - Cashier
- **Work shifts** scheduled for today
- **Default passwords** - "password123" (BCrypt hashed)

### Test Scenarios
1. **Authentication flow** - Login with sample credentials
2. **Shift management** - Start/end shifts with functions
3. **Order assignment** - Create and track order assignments
4. **Timer operations** - Kitchen timer lifecycle
5. **Performance tracking** - Metrics calculation and reporting

## 🔄 Maintenance & Operations

### Regular Maintenance
Run these functions periodically:

```sql
-- Daily: Clean up expired sessions
SELECT cleanup_expired_sessions();

-- Weekly: Clean up old data  
SELECT * FROM cleanup_old_staff_data();

-- Monthly: Validate system integrity
SELECT * FROM validate_staff_system_integrity();
```

### Backup Considerations
Critical tables for backup priority:
1. **staff_members** - Core user data
2. **work_shifts** - Historical time tracking
3. **staff_performance** - Performance metrics  
4. **staff_activities** - Audit logs (partial retention)

### Monitoring Queries

```sql
-- Active staff count
SELECT COUNT(*) FROM staff_members WHERE is_active = true;

-- Current shift status
SELECT role, COUNT(*) as on_shift
FROM staff_members sm
JOIN work_shifts ws ON sm.staff_id = ws.staff_id
WHERE ws.shift_date = CURRENT_DATE AND ws.status = 'ACTIVE'
GROUP BY role;

-- System health check
SELECT 
    (SELECT COUNT(*) FROM staff_members WHERE is_active = true) as active_staff,
    (SELECT COUNT(*) FROM staff_sessions WHERE is_active = true) as active_sessions,
    (SELECT COUNT(*) FROM order_assignments WHERE status IN ('ASSIGNED', 'IN_PROGRESS')) as active_assignments,
    (SELECT COUNT(*) FROM cooking_timers WHERE status = 'RUNNING') as active_timers;
```

## ⚠️ Important Notes

### Data Migration
If upgrading from existing staff tables:
1. **Backup current data** before deployment
2. **Review schema differences** in existing tables
3. **Plan data migration** for new required fields
4. **Test thoroughly** in staging environment first

### Performance Considerations
- **Index maintenance** - Monitor index usage and performance
- **Activity log growth** - Consider archiving old activity records
- **Session cleanup** - Run cleanup functions regularly
- **Query optimization** - Use provided views for complex queries

### Security Recommendations
- **Password policy** - Enforce strong passwords in application layer
- **Session timeout** - Configure appropriate session durations
- **Permission review** - Regularly audit staff permissions
- **Activity monitoring** - Monitor for suspicious activity patterns

## 🎯 Next Steps

After successful deployment:

1. **Update application configuration** to use new schema
2. **Implement authentication endpoints** using staff_members table
3. **Create shift management UI** using work_shifts functions
4. **Build kitchen timer system** using cooking_timers table  
5. **Implement performance dashboards** using provided views
6. **Set up monitoring** and maintenance schedules

## 📞 Support

For deployment issues or questions:
- Review error messages carefully - constraints provide descriptive errors
- Check function return values for debugging information  
- Use provided verification queries to validate deployment
- Monitor system logs for constraint violations or performance issues

---

**Database Schema Version:** 1.0  
**Deployment Date:** 2025-08-22  
**Compatibility:** PostgreSQL 12+, UUID Extension Required