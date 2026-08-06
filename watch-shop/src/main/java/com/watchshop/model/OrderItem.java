package com.watchshop.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String watchBrand;

    @Column(nullable = false)
    private String watchModel;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    public OrderItem(String watchBrand, String watchModel, BigDecimal price, Integer quantity) {
        this.watchBrand = watchBrand;
        this.watchModel = watchModel;
        this.price = price;
        this.quantity = quantity;
    }
}