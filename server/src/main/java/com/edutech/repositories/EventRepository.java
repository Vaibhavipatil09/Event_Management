package com.edutech.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.entities.Client;
import com.edutech.entities.Event;
import com.edutech.entities.EventPlanner;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
   List<Event> findByPlanner(EventPlanner planner);
   List<Event> findByClient(Client client);
}
