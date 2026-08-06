package com.watchshop.repository;

import com.watchshop.model.Watch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WatchRepository extends JpaRepository<Watch, Long> {
    List<Watch> findByCategory(String category);
    List<Watch> findByBrandContainingIgnoreCase(String brand);
    List<Watch> findByFeaturedTrue();
}