package com.sandalsshop.service;

import com.sandalsshop.dto.CheckoutDTO;
import com.sandalsshop.model.CartItem;
import com.sandalsshop.model.Order;
import com.sandalsshop.model.OrderItem;
import com.sandalsshop.repository.CartItemRepository;
import com.sandalsshop.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    public Order createOrder(String sessionId, CheckoutDTO checkoutDTO) {
        List<CartItem> cartItems = cartItemRepository.findBySessionId(sessionId);
        
        if (cartItems.isEmpty()) {
            return null;
        }

        List<OrderItem> orderItems = cartItems.stream()
                .map(cartItem -> new OrderItem(
                        cartItem.getProduct().getId(),
                        cartItem.getProduct().getName(),
                        cartItem.getProduct().getPrice(),
                        cartItem.getQuantity()
                ))
                .collect(Collectors.toList());

        Double totalPrice = orderItems.stream()
                .mapToDouble(OrderItem::getSubtotal)
                .sum();

        Order order = new Order(
                checkoutDTO.getCustomerName(),
                checkoutDTO.getCustomerEmail(),
                checkoutDTO.getCustomerPhone(),
                checkoutDTO.getShippingAddress(),
                orderItems,
                totalPrice
        );

        order = orderRepository.save(order);
        
        // Clear the cart after successful order
        cartItemRepository.deleteBySessionId(sessionId);
        
        return order;
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByCustomerEmail(String email) {
        return orderRepository.findByCustomerEmail(email);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public Order updateOrderStatus(Long id, String status) {
        Optional<Order> order = orderRepository.findById(id);
        if (order.isPresent()) {
            Order o = order.get();
            o.setStatus(status);
            return orderRepository.save(o);
        }
        return null;
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
