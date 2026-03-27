package com.edutech.repositories;

import com.edutech.entities.EventPlanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface EventPlannerRepository extends JpaRepository<EventPlanner, Long> {

    Optional<EventPlanner> findByUsername(String username);
}
