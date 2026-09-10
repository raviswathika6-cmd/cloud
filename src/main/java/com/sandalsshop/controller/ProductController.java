package com.sandalsshop.controller;

import com.sandalsshop.dto.ProductDTO;
import com.sandalsshop.model.Product;
import com.sandalsshop.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        List<ProductDTO> dtos = products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(p -> ResponseEntity.ok(convertToDTO(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam String query) {
        List<Product> products = productService.searchByName(query);
        List<ProductDTO> dtos = products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/filter/type")
    public ResponseEntity<List<ProductDTO>> filterByType(@RequestParam String type) {
        List<Product> products = productService.filterByType(type);
        List<ProductDTO> dtos = products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/filter/color")
    public ResponseEntity<List<ProductDTO>> filterByColor(@RequestParam String color) {
        List<Product> products = productService.filterByColor(color);
        List<ProductDTO> dtos = products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        Product product = convertToEntity(productDTO);
        Product created = productService.createProduct(product);
        return ResponseEntity.ok(convertToDTO(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        Product product = convertToEntity(productDTO);
        Product updated = productService.updateProduct(id, product);
        if (updated != null) {
            return ResponseEntity.ok(convertToDTO(updated));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    private ProductDTO convertToDTO(Product product) {
        return new ProductDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getType(),
                product.getColor(),
                product.getSize(),
                product.getPrice(),
                product.getStock(),
                product.getImageUrl()
        );
    }

    private Product convertToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setId(dto.getId());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setType(dto.getType());
        product.setColor(dto.getColor());
        product.setSize(dto.getSize());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setImageUrl(dto.getImageUrl());
        return product;
    }
}
