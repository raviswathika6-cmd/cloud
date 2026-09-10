package com.sandalsshop.service;

import com.sandalsshop.model.Product;
import com.sandalsshop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> filterByType(String type) {
        return productRepository.findByType(type);
    }

    public List<Product> filterByColor(String color) {
        return productRepository.findByColor(color);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            Product p = product.get();
            p.setName(productDetails.getName());
            p.setDescription(productDetails.getDescription());
            p.setType(productDetails.getType());
            p.setColor(productDetails.getColor());
            p.setSize(productDetails.getSize());
            p.setPrice(productDetails.getPrice());
            p.setStock(productDetails.getStock());
            p.setImageUrl(productDetails.getImageUrl());
            return productRepository.save(p);
        }
        return null;
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public void initializeProducts() {
        if (productRepository.count() == 0) {
            productRepository.save(new Product("Classic Flip Flops", "Comfortable everyday flip flops", "Flip Flop", "Black", "M", 19.99, 50));
            productRepository.save(new Product("Summer Slide Sandals", "Lightweight slides for summer", "Slide", "Blue", "L", 24.99, 40));
            productRepository.save(new Product("Strappy Sandals", "Elegant strappy design for casual outings", "Strappy", "Red", "S", 34.99, 30));
            productRepository.save(new Product("Beach Flip Flops", "Waterproof beach sandals", "Flip Flop", "White", "M", 22.99, 60));
            productRepository.save(new Product("Sport Sandals", "Performance sandals for active use", "Sport", "Black", "L", 44.99, 25));
            productRepository.save(new Product("Casual Slip-ons", "Easy slip-on sandals", "Slip-on", "Brown", "M", 29.99, 35));
        }
    }
}
