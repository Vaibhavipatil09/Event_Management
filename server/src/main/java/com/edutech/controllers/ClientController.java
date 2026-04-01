package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.services.EventService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    @Autowired
    private EventService eventService;

    /** Kept for the existing test testClientShouldGetAllEvents */
    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    /** New — client sees only their assigned events */
    @GetMapping("/events/{clientId}")
    public ResponseEntity<List<Event>> getEventsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(eventService.getEventsByClient(clientId));
    }

    @PutMapping("/event/{eventId}")
    public ResponseEntity<Event> provideFeedback(@PathVariable Long eventId,
            @RequestParam String feedback) {
        return ResponseEntity.ok(eventService.updateFeedback(eventId, feedback));
    }
}
