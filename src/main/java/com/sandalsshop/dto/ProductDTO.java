package com.sandalsshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private String type;
    private String color;
    private String size;
    private Double price;
    private Integer stock;
    private String imageUrl;
}
