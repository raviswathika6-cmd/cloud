package com.sandalsshop.service;

import com.sandalsshop.dto.CartItemDTO;
import com.sandalsshop.model.CartItem;
import com.sandalsshop.model.Product;
import com.sandalsshop.repository.CartItemRepository;
import com.sandalsshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {
    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartItemDTO> getCart(String sessionId) {
        List<CartItem> cartItems = cartItemRepository.findBySessionId(sessionId);
        return cartItems.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CartItemDTO addToCart(String sessionId, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return null;
        }

        Optional<CartItem> existingItem = cartItemRepository.findBySessionIdAndProductId(sessionId, productId);
        CartItem cartItem;

        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            cartItem = new CartItem();
            cartItem.setSessionId(sessionId);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
        }

        cartItem = cartItemRepository.save(cartItem);
        return convertToDTO(cartItem);
    }

    public CartItemDTO updateQuantity(Long cartItemId, Integer quantity) {
        Optional<CartItem> cartItem = cartItemRepository.findById(cartItemId);
        if (cartItem.isPresent()) {
            CartItem item = cartItem.get();
            item.setQuantity(quantity);
            item = cartItemRepository.save(item);
            return convertToDTO(item);
        }
        return null;
    }

    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    public void clearCart(String sessionId) {
        cartItemRepository.deleteBySessionId(sessionId);
    }

    public Double getCartTotal(String sessionId) {
        List<CartItem> cartItems = cartItemRepository.findBySessionId(sessionId);
        return cartItems.stream()
                .mapToDouble(CartItem::getSubtotal)
                .sum();
    }

    private CartItemDTO convertToDTO(CartItem cartItem) {
        return new CartItemDTO(
                cartItem.getId(),
                cartItem.getProduct().getId(),
                cartItem.getProduct().getName(),
                cartItem.getProduct().getPrice(),
                cartItem.getQuantity(),
                cartItem.getSubtotal()
        );
    }
}
