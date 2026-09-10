package com.sandalsshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutDTO {
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String shippingAddress;
}
