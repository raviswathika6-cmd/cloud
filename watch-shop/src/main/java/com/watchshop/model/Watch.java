package com.watchshop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "watches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Watch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private String category;

    private Integer stockQuantity = 10;

    @Column(nullable = false)
    private Boolean featured = false;

    public Watch(String brand, String model, String description, BigDecimal price, 
                 String imageUrl, String category, Integer stockQuantity, Boolean featured) {
        this.brand = brand;
        this.model = model;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.category = category;
        this.stockQuantity = stockQuantity;
        this.featured = featured;
    }
}