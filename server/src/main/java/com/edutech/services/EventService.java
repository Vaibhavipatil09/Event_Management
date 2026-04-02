package com.edutech.services;

import com.edutech.entities.Client;
import com.edutech.entities.Event;
import com.edutech.entities.EventPlanner;
import com.edutech.repositories.ClientRepository;
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

    @Autowired
    private ClientRepository clientRepository;

    /** Original — used by existing tests (no clientId) */
    public Event createEvent(Long plannerId, Event event) {
        EventPlanner planner = eventPlannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));
        event.setPlanner(planner);
        return eventRepository.save(event);
    }

    /** New overload — assigns both planner and client */
    public Event createEvent(Long plannerId, Long clientId, Event event) {
        EventPlanner planner = eventPlannerRepository.findById(plannerId)
                .orElseThrow(() -> new RuntimeException("Planner not found"));
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        event.setPlanner(planner);
        event.setClient(client);
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    /** NEW — fetch a single event by ID (used by payment endpoint) */
    public Event getEventById(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Event updateEvent(Long eventId, Event updatedEvent) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
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

    public List<Event> getEventsByClient(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));
        return eventRepository.findByClient(client);
    }

    public Event updateFeedback(Long eventId, String feedback) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setFeedback(feedback);
        return eventRepository.save(event);
    }

    public void updatePaymentStatus(Long eventId, String status) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        event.setPaymentStatus(status);
        eventRepository.save(event);
    }
}
