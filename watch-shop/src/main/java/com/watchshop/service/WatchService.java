package com.watchshop.service;

import com.watchshop.model.Watch;
import com.watchshop.repository.WatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class WatchService {

    @Autowired
    private WatchRepository watchRepository;

    public List<Watch> getAllWatches() {
        return watchRepository.findAll();
    }

    public Optional<Watch> getWatchById(Long id) {
        return watchRepository.findById(id);
    }

    public List<Watch> getWatchesByCategory(String category) {
        return watchRepository.findByCategory(category);
    }

    public List<Watch> getFeaturedWatches() {
        return watchRepository.findByFeaturedTrue();
    }

    public Watch saveWatch(Watch watch) {
        return watchRepository.save(watch);
    }

    public List<Watch> searchWatches(String query) {
        return watchRepository.findByBrandContainingIgnoreCase(query);
    }
}