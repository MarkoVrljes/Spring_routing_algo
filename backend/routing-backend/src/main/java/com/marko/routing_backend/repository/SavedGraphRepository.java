package com.marko.routing_backend.repository;

import com.marko.routing_backend.model.SavedGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedGraphRepository extends JpaRepository<SavedGraph, Long> {
    List<SavedGraph> findByOrderByCreatedAtDesc();
    Optional<SavedGraph> findByName(String name);
    boolean existsByName(String name);
}