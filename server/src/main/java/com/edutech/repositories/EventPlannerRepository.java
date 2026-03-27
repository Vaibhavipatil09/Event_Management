package com.edutech.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.entities.EventPlanner;

@Repository
public interface EventPlannerRepository extends JpaRepository<EventPlanner,Long>  {
}
