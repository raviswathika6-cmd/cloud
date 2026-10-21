package com.watchshop.config;

import com.watchshop.model.Watch;
import com.watchshop.repository.WatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private WatchRepository watchRepository;

    @Override
    public void run(String... args) throws Exception {
        if (watchRepository.count() == 0) {
            // Luxury Watches
            watchRepository.save(new Watch("Rolex", "Submariner", 
                "The Oyster Perpetual Submariner in Oystersteel with a black Cerachrom bezel insert and black dial. Waterproof to 300 metres.", 
                new BigDecimal("12500.00"), "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400", "Luxury", 5, true));
            
            watchRepository.save(new Watch("Omega", "Speedmaster Moonwatch", 
                "The Speedmaster Moonwatch is the iconic chronograph that was worn on the moon during the Apollo missions.", 
                new BigDecimal("7500.00"), "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400", "Luxury", 3, true));
            
            watchRepository.save(new Watch("Patek Philippe", "Calatrava", 
                "The quintessential round dress watch, the Calatrava embodies the very essence of the round wristwatch.", 
                new BigDecimal("35000.00"), "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400", "Luxury", 2, true));
            
            // Sport Watches
            watchRepository.save(new Watch("TAG Heuer", "Carrera", 
                "The Carrera collection was created for professional drivers and sports car enthusiasts.", 
                new BigDecimal("5500.00"), "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=400", "Sport", 8, true));
            
            watchRepository.save(new Watch("Tudor", "Black Bay", 
                "Inspired by the brand's潜水 watches from the 1950s, the Black Bay combines traditional aesthetics with modern watchmaking.", 
                new BigDecimal("4100.00"), "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=400", "Sport", 6, false));
            
            watchRepository.save(new Watch("Breitling", "Navitimer", 
                "The Navitimer is one of the most iconic pilot's watches, featuring a circular slide rule bezel.", 
                new BigDecimal("6800.00"), "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400", "Sport", 4, false));
            
            // Dress Watches
            watchRepository.save(new Watch("Jaeger-LeCoultre", "Reverso", 
                "The Reverso Classic Medium Duoface features two faces: one for daily use, one for a second time zone.", 
                new BigDecimal("8900.00"), "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400", "Dress", 3, true));
            
            watchRepository.save(new Watch("Cartier", "Santos", 
                "The Santos de Cartier was the first modern wristwatch, designed for aviator Alberto Santos-Dumont.", 
                new BigDecimal("8100.00"), "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=400", "Dress", 4, false));
            
            // Casual Watches
            watchRepository.save(new Watch("Seiko", "Presage", 
                "The Presage collection offers a blend of traditional Japanese craftsmanship with contemporary watchmaking.", 
                new BigDecimal("450.00"), "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400", "Casual", 15, false));
            
            watchRepository.save(new Watch("Hamilton", "Khaki Field", 
                "Inspired by military watches from the 1940s, the Khaki Field is built to withstand the toughest conditions.", 
                new BigDecimal("595.00"), "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400", "Casual", 12, false));
            
            watchRepository.save(new Watch("Longines", "Master Collection", 
                "The Master Collection embodies the essence of classical elegance with its refined dials and complications.", 
                new BigDecimal("2100.00"), "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "Casual", 7, false));
            
            watchRepository.save(new Watch("Citizen", "Eco-Drive", 
                "Powered by any light source, the Eco-Drive never needs a battery. Features atomic timekeeping.", 
                new BigDecimal("380.00"), "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=400", "Casual", 20, false));
            
            System.out.println("Sample watches have been initialized!");
        }
    }
}