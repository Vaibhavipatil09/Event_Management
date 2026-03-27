package com.edutech.repositories;

import com.edutech.entities.EventPlanner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventPlannerRepository extends JpaRepository<EventPlanner, Long> {

    Optional<EventPlanner> findByUsername(String username);
}
