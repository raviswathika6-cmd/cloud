package com.watchshop.service;

import com.watchshop.model.CartItem;
import com.watchshop.model.Watch;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private List<CartItem> cartItems = new ArrayList<>();

    public List<CartItem> getCartItems() {
        return cartItems;
    }

    public void addToCart(Watch watch, int quantity) {
        for (CartItem item : cartItems) {
            if (item.getWatch().getId().equals(watch.getId())) {
                item.setQuantity(item.getQuantity() + quantity);
                return;
            }
        }
        cartItems.add(new CartItem(watch, quantity));
    }

    public void removeFromCart(Long watchId) {
        cartItems.removeIf(item -> item.getWatch().getId().equals(watchId));
    }

    public void updateQuantity(Long watchId, int quantity) {
        for (CartItem item : cartItems) {
            if (item.getWatch().getId().equals(watchId)) {
                if (quantity <= 0) {
                    removeFromCart(watchId);
                } else {
                    item.setQuantity(quantity);
                }
                return;
            }
        }
    }

    public void clearCart() {
        cartItems.clear();
    }

    public double getTotal() {
        return cartItems.stream()
            .mapToDouble(item -> item.getSubtotal().doubleValue())
            .sum();
    }

    public int getItemCount() {
        return cartItems.stream()
            .mapToInt(CartItem::getQuantity)
            .sum();
    }
}