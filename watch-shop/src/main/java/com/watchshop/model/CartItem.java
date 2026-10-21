package com.watchshop.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private Watch watch;
    private int quantity;
    
    public BigDecimal getSubtotal() {
        return watch.getPrice().multiply(BigDecimal.valueOf(quantity));
    }
}