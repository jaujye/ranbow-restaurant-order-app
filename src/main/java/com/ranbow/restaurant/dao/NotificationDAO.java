package com.ranbow.restaurant.dao;

import com.ranbow.restaurant.models.Notification;
import com.ranbow.restaurant.models.NotificationType;
import com.ranbow.restaurant.models.NotificationPriority;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class NotificationDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String INSERT_NOTIFICATION = """
        INSERT INTO notifications (
            notification_id, recipient_staff_id, sender_staff_id, type, priority,
            title, message, related_order_id, is_read, sent_at, expires_at, action_url
        ) VALUES (?, ?, ?, ?::notification_type, ?::notification_priority, ?, ?, ?, ?, ?, ?, ?)
        """;

    private static final String SELECT_NOTIFICATION_BY_ID = """
        SELECT notification_id, recipient_staff_id, sender_staff_id, type, priority,
               title, message, related_order_id, is_read, sent_at, read_at, expires_at, action_url
        FROM notifications WHERE notification_id = ?
        """;

    private static final String SELECT_NOTIFICATIONS_BY_STAFF = """
        SELECT notification_id, recipient_staff_id, sender_staff_id, type, priority,
               title, message, related_order_id, is_read, sent_at, read_at, expires_at, action_url
        FROM notifications 
        WHERE recipient_staff_id = ? AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY priority DESC, sent_at DESC
        """;

    private static final String SELECT_UNREAD_NOTIFICATIONS_BY_STAFF = """
        SELECT notification_id, recipient_staff_id, sender_staff_id, type, priority,
               title, message, related_order_id, is_read, sent_at, read_at, expires_at, action_url
        FROM notifications 
        WHERE recipient_staff_id = ? AND is_read = false 
              AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY priority DESC, sent_at DESC
        """;

    private static final String SELECT_NOTIFICATIONS_BY_TYPE = """
        SELECT notification_id, recipient_staff_id, sender_staff_id, type, priority,
               title, message, related_order_id, is_read, sent_at, read_at, expires_at, action_url
        FROM notifications 
        WHERE recipient_staff_id = ? AND type = ?::notification_type
              AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY sent_at DESC
        """;

    private static final String SELECT_NOTIFICATIONS_BY_PRIORITY = """
        SELECT notification_id, recipient_staff_id, sender_staff_id, type, priority,
               title, message, related_order_id, is_read, sent_at, read_at, expires_at, action_url
        FROM notifications 
        WHERE recipient_staff_id = ? AND priority = ?::notification_priority
              AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY sent_at DESC
        """;

    private static final String SELECT_RECENT_NOTIFICATIONS = """
        SELECT notification_id, recipient_staff_id, sender_staff_id, type, priority,
               title, message, related_order_id, is_read, sent_at, read_at, expires_at, action_url
        FROM notifications 
        WHERE recipient_staff_id = ? AND sent_at >= ?
              AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY priority DESC, sent_at DESC
        """;

    private static final String UPDATE_NOTIFICATION = """
        UPDATE notifications SET
            recipient_staff_id = ?, sender_staff_id = ?, type = ?::notification_type,
            priority = ?::notification_priority, title = ?, message = ?,
            related_order_id = ?, is_read = ?, read_at = ?, expires_at = ?, action_url = ?
        WHERE notification_id = ?
        """;

    private static final String MARK_AS_READ = """
        UPDATE notifications SET is_read = true, read_at = ?
        WHERE notification_id = ?
        """;

    private static final String MARK_ALL_AS_READ = """
        UPDATE notifications SET is_read = true, read_at = ?
        WHERE recipient_staff_id = ? AND is_read = false
        """;

    private static final String COUNT_UNREAD_NOTIFICATIONS = """
        SELECT COUNT(*) FROM notifications 
        WHERE recipient_staff_id = ? AND is_read = false
              AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        """;

    private static final String DELETE_EXPIRED_NOTIFICATIONS = """
        DELETE FROM notifications WHERE expires_at < CURRENT_TIMESTAMP
        """;

    private static final String DELETE_OLD_READ_NOTIFICATIONS = """
        DELETE FROM notifications WHERE is_read = true AND read_at < ?
        """;

    private final RowMapper<Notification> notificationRowMapper = new RowMapper<Notification>() {
        @Override
        public Notification mapRow(ResultSet rs, int rowNum) throws SQLException {
            Notification notification = new Notification();
            notification.setNotificationId(rs.getString("notification_id"));
            notification.setRecipientStaffId(rs.getString("recipient_staff_id"));
            notification.setSenderStaffId(rs.getString("sender_staff_id"));
            notification.setType(NotificationType.valueOf(rs.getString("type")));
            notification.setPriority(NotificationPriority.valueOf(rs.getString("priority")));
            notification.setTitle(rs.getString("title"));
            notification.setMessage(rs.getString("message"));
            notification.setRelatedOrderId(rs.getString("related_order_id"));
            notification.setRead(rs.getBoolean("is_read"));
            notification.setActionUrl(rs.getString("action_url"));

            Timestamp sentTimestamp = rs.getTimestamp("sent_at");
            if (sentTimestamp != null) {
                notification.setSentAt(sentTimestamp.toLocalDateTime());
            }

            Timestamp readTimestamp = rs.getTimestamp("read_at");
            if (readTimestamp != null) {
                notification.setReadAt(readTimestamp.toLocalDateTime());
            }

            Timestamp expiresTimestamp = rs.getTimestamp("expires_at");
            if (expiresTimestamp != null) {
                notification.setExpiresAt(expiresTimestamp.toLocalDateTime());
            }

            return notification;
        }
    };

    public Notification save(Notification notification) {
        jdbcTemplate.update(INSERT_NOTIFICATION,
                notification.getNotificationId(),
                notification.getRecipientStaffId(),
                notification.getSenderStaffId(),
                notification.getType().name(),
                notification.getPriority().name(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getRelatedOrderId(),
                notification.isRead(),
                Timestamp.valueOf(notification.getSentAt()),
                notification.getExpiresAt() != null ? Timestamp.valueOf(notification.getExpiresAt()) : null,
                notification.getActionUrl());
        return notification;
    }

    public Optional<Notification> findById(String notificationId) {
        try {
            Notification notification = jdbcTemplate.queryForObject(SELECT_NOTIFICATION_BY_ID, 
                    notificationRowMapper, notificationId);
            return Optional.of(notification);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Notification> findByStaffId(String staffId) {
        return jdbcTemplate.query(SELECT_NOTIFICATIONS_BY_STAFF, notificationRowMapper, staffId);
    }

    public List<Notification> findUnreadByStaffId(String staffId) {
        return jdbcTemplate.query(SELECT_UNREAD_NOTIFICATIONS_BY_STAFF, notificationRowMapper, staffId);
    }

    public List<Notification> findByStaffAndType(String staffId, NotificationType type) {
        return jdbcTemplate.query(SELECT_NOTIFICATIONS_BY_TYPE, 
                notificationRowMapper, staffId, type.name());
    }

    public List<Notification> findByStaffAndPriority(String staffId, NotificationPriority priority) {
        return jdbcTemplate.query(SELECT_NOTIFICATIONS_BY_PRIORITY, 
                notificationRowMapper, staffId, priority.name());
    }

    public List<Notification> findRecentNotifications(String staffId, LocalDateTime since) {
        return jdbcTemplate.query(SELECT_RECENT_NOTIFICATIONS,
                notificationRowMapper, staffId, Timestamp.valueOf(since));
    }

    public Notification update(Notification notification) {
        int updated = jdbcTemplate.update(UPDATE_NOTIFICATION,
                notification.getRecipientStaffId(),
                notification.getSenderStaffId(),
                notification.getType().name(),
                notification.getPriority().name(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getRelatedOrderId(),
                notification.isRead(),
                notification.getReadAt() != null ? Timestamp.valueOf(notification.getReadAt()) : null,
                notification.getExpiresAt() != null ? Timestamp.valueOf(notification.getExpiresAt()) : null,
                notification.getActionUrl(),
                notification.getNotificationId());

        if (updated == 0) {
            throw new RuntimeException("Notification not found: " + notification.getNotificationId());
        }
        return notification;
    }

    public boolean markAsRead(String notificationId) {
        int updated = jdbcTemplate.update(MARK_AS_READ,
                Timestamp.valueOf(LocalDateTime.now()),
                notificationId);
        return updated > 0;
    }

    public int markAllAsRead(String staffId) {
        return jdbcTemplate.update(MARK_ALL_AS_READ,
                Timestamp.valueOf(LocalDateTime.now()),
                staffId);
    }

    public int countUnreadNotifications(String staffId) {
        Integer count = jdbcTemplate.queryForObject(COUNT_UNREAD_NOTIFICATIONS, Integer.class, staffId);
        return count != null ? count : 0;
    }

    public int deleteExpiredNotifications() {
        return jdbcTemplate.update(DELETE_EXPIRED_NOTIFICATIONS);
    }

    public int deleteOldReadNotifications(LocalDateTime cutoffDate) {
        return jdbcTemplate.update(DELETE_OLD_READ_NOTIFICATIONS, Timestamp.valueOf(cutoffDate));
    }

    // Batch operations for better performance
    public void broadcastNotification(List<String> staffIds, NotificationType type, 
                                    String title, String message, NotificationPriority priority) {
        LocalDateTime now = LocalDateTime.now();
        
        for (String staffId : staffIds) {
            Notification notification = new Notification(staffId, type, title, message);
            notification.setPriority(priority);
            notification.setSentAt(now);
            save(notification);
        }
    }
}