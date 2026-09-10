package com.sandalsshop.controller;

import com.sandalsshop.dto.CartItemDTO;
import com.sandalsshop.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart(@RequestParam(required = false, defaultValue = "default-session") String sessionId) {
        List<CartItemDTO> cart = cartService.getCart(sessionId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addToCart(
            @RequestParam(required = false, defaultValue = "default-session") String sessionId,
            @RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        CartItemDTO cartItem = cartService.addToCart(sessionId, productId, quantity);
        if (cartItem != null) {
            return ResponseEntity.ok(cartItem);
        }
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        CartItemDTO cartItem = cartService.updateQuantity(id, quantity);
        if (cartItem != null) {
            return ResponseEntity.ok(cartItem);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long id) {
        cartService.removeFromCart(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(@RequestParam(required = false, defaultValue = "default-session") String sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, Double>> getCartTotal(@RequestParam(required = false, defaultValue = "default-session") String sessionId) {
        Double total = cartService.getCartTotal(sessionId);
        return ResponseEntity.ok(Map.of("total", total));
    }
}
