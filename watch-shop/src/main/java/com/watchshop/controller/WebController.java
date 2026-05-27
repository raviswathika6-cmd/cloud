package com.watchshop.controller;

import com.watchshop.model.Watch;
import com.watchshop.service.WatchService;
import com.watchshop.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
public class WebController {

    @Autowired
    private WatchService watchService;

    @Autowired
    private CartService cartService;

    @GetMapping("/")
    public String home(Model model) {
        List<Watch> featuredWatches = watchService.getFeaturedWatches();
        List<Watch> allWatches = watchService.getAllWatches();
        model.addAttribute("featuredWatches", featuredWatches);
        model.addAttribute("allWatches", allWatches);
        model.addAttribute("cartItemCount", cartService.getItemCount());
        return "index";
    }

    @GetMapping("/catalog")
    public String catalog(@RequestParam(required = false) String category, Model model) {
        List<Watch> watches;
        if (category != null && !category.isEmpty()) {
            watches = watchService.getWatchesByCategory(category);
        } else {
            watches = watchService.getAllWatches();
        }
        model.addAttribute("watches", watches);
        model.addAttribute("selectedCategory", category);
        model.addAttribute("cartItemCount", cartService.getItemCount());
        return "catalog";
    }

    @GetMapping("/watch/{id}")
    public String watchDetails(@PathVariable Long id, Model model) {
        Watch watch = watchService.getWatchById(id).orElse(null);
        if (watch == null) {
            return "redirect:/catalog";
        }
        model.addAttribute("watch", watch);
        model.addAttribute("cartItemCount", cartService.getItemCount());
        return "product";
    }

    @GetMapping("/cart")
    public String cart(Model model) {
        model.addAttribute("cartItems", cartService.getCartItems());
        model.addAttribute("total", cartService.getTotal());
        model.addAttribute("cartItemCount", cartService.getItemCount());
        return "cart";
    }

    @PostMapping("/cart/add/{id}")
    public String addToCart(@PathVariable Long id, @RequestParam(defaultValue = "1") int quantity) {
        watchService.getWatchById(id).ifPresent(watch -> cartService.addToCart(watch, quantity));
        return "redirect:/cart";
    }

    @PostMapping("/cart/update/{id}")
    public String updateCart(@PathVariable Long id, @RequestParam int quantity) {
        cartService.updateQuantity(id, quantity);
        return "redirect:/cart";
    }

    @PostMapping("/cart/remove/{id}")
    public String removeFromCart(@PathVariable Long id) {
        cartService.removeFromCart(id);
        return "redirect:/cart";
    }

    @GetMapping("/checkout")
    public String checkout(Model model) {
        model.addAttribute("cartItems", cartService.getCartItems());
        model.addAttribute("total", cartService.getTotal());
        model.addAttribute("cartItemCount", cartService.getItemCount());
        return "checkout";
    }
}