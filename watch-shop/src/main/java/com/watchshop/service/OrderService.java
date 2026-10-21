package com.watchshop.service;

import com.watchshop.model.Order;
import com.watchshop.model.OrderItem;
import com.watchshop.model.CartItem;
import com.watchshop.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Order createOrder(String customerName, String customerEmail, String customerPhone, 
                             String shippingAddress, List<CartItem> cartItems) {
        Order order = new Order();
        order.setCustomerName(customerName);
        order.setCustomerEmail(customerEmail);
        order.setCustomerPhone(customerPhone);
        order.setShippingAddress(shippingAddress);
        order.setStatus("PENDING");
        
        double total = 0;
        for (CartItem item : cartItems) {
            OrderItem orderItem = new OrderItem(
                item.getWatch().getBrand(),
                item.getWatch().getModel(),
                item.getWatch().getPrice(),
                item.getQuantity()
            );
            order.getItems().add(orderItem);
            total += item.getSubtotal().doubleValue();
        }
        order.setTotalAmount(total);
        
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public Order updateOrderStatus(Long id, String status) {
        Order order = getOrderById(id);
        if (order != null) {
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }
}