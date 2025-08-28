package com.ranbow.restaurant.events;

import com.ranbow.restaurant.models.Order;
import com.ranbow.restaurant.models.OrderStatus;
import org.springframework.context.ApplicationEvent;

/**
 * Event fired when an order status changes
 */
public class OrderStatusChangeEvent extends ApplicationEvent {
    private final String orderId;
    private final OrderStatus oldStatus;
    private final OrderStatus newStatus;
    private final Order order;

    public OrderStatusChangeEvent(Object source, String orderId, OrderStatus oldStatus, OrderStatus newStatus, Order order) {
        super(source);
        this.orderId = orderId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.order = order;
    }

    public String getOrderId() {
        return orderId;
    }

    public OrderStatus getOldStatus() {
        return oldStatus;
    }

    public OrderStatus getNewStatus() {
        return newStatus;
    }

    public Order getOrder() {
        return order;
    }
}