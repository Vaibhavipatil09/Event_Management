package com.edutech.services;

import com.edutech.entities.Event;
import com.edutech.entities.EventPlanner;
import com.edutech.repositories.EventPlannerRepository;
import com.edutech.repositories.EventRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventPlannerRepository eventPlannerRepository;

    public Event createEvent(Long plannerId, Event event) {
        EventPlanner planner = eventPlannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));
        event.setPlanner(planner);
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event updateEvent(Long eventId, Event updatedEvent) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        event.setTitle(updatedEvent.getTitle());
        event.setDate(updatedEvent.getDate());
        event.setLocation(updatedEvent.getLocation());
        event.setDescription(updatedEvent.getDescription());
        event.setStatus(updatedEvent.getStatus());
        return eventRepository.save(event);
    }

    public List<Event> getEventsByPlanner(Long plannerId) {
        EventPlanner planner = eventPlannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));
        return eventRepository.findByPlanner(planner);
    }

    public Event updateFeedback(Long eventId, String feedback) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        event.setFeedback(feedback);
        return eventRepository.save(event);
    }
}
