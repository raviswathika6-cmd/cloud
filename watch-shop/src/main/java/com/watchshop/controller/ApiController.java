package com.watchshop.controller;

import com.watchshop.model.CartItem;
import com.watchshop.model.Watch;
import com.watchshop.service.WatchService;
import com.watchshop.service.CartService;
import com.watchshop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private WatchService watchService;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/watches")
    public List<Watch> getAllWatches() {
        return watchService.getAllWatches();
    }

    @GetMapping("/watches/featured")
    public List<Watch> getFeaturedWatches() {
        return watchService.getFeaturedWatches();
    }

    @GetMapping("/watches/category/{category}")
    public List<Watch> getWatchesByCategory(@PathVariable String category) {
        return watchService.getWatchesByCategory(category);
    }

    @GetMapping("/watches/{id}")
    public ResponseEntity<Watch> getWatchById(@PathVariable Long id) {
        return watchService.getWatchById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cart")
    public Map<String, Object> getCart() {
        Map<String, Object> response = new HashMap<>();
        response.put("items", cartService.getCartItems());
        response.put("total", cartService.getTotal());
        response.put("itemCount", cartService.getItemCount());
        return response;
    }

    @PostMapping("/cart/add/{id}")
    public ResponseEntity<Map<String, Object>> addToCart(@PathVariable Long id, @RequestParam(defaultValue = "1") int quantity) {
        Map<String, Object> response = new HashMap<>();
        Watch watch = watchService.getWatchById(id).orElse(null);
        if (watch == null) {
            response.put("success", false);
            response.put("message", "Watch not found");
            return ResponseEntity.badRequest().body(response);
        }
        cartService.addToCart(watch, quantity);
        response.put("success", true);
        response.put("cartItemCount", cartService.getItemCount());
        response.put("total", cartService.getTotal());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cart/update/{id}")
    public ResponseEntity<Map<String, Object>> updateCart(@PathVariable Long id, @RequestParam int quantity) {
        Map<String, Object> response = new HashMap<>();
        cartService.updateQuantity(id, quantity);
        response.put("success", true);
        response.put("cartItemCount", cartService.getItemCount());
        response.put("total", cartService.getTotal());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cart/remove/{id}")
    public ResponseEntity<Map<String, Object>> removeFromCart(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        cartService.removeFromCart(id);
        response.put("success", true);
        response.put("cartItemCount", cartService.getItemCount());
        response.put("total", cartService.getTotal());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cart/clear")
    public ResponseEntity<Map<String, Object>> clearCart() {
        Map<String, Object> response = new HashMap<>();
        cartService.clearCart();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> orderData) {
        Map<String, Object> response = new HashMap<>();
        List<CartItem> cartItems = cartService.getCartItems();
        
        if (cartItems.isEmpty()) {
            response.put("success", false);
            response.put("message", "Cart is empty");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            var order = orderService.createOrder(
                (String) orderData.get("customerName"),
                (String) orderData.get("customerEmail"),
                (String) orderData.get("customerPhone"),
                (String) orderData.get("shippingAddress"),
                cartItems
            );
            cartService.clearCart();
            response.put("success", true);
            response.put("orderId", order.getId());
            response.put("message", "Order placed successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}