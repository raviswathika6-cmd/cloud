package com.sandalsshop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String type; // e.g., "Flip Flop", "Slip-on", "Strappy"
    private String color;
    private String size;
    private Double price;
    private Integer stock;
    private String imageUrl;

    public Product(String name, String description, String type, String color, String size, Double price, Integer stock) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.color = color;
        this.size = size;
        this.price = price;
        this.stock = stock;
    }
}
