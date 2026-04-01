package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.services.EventService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client")
public class ClientController {

    @Autowired
    private EventService eventService;

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/events/{clientId}")
    public ResponseEntity<List<Event>> getEventsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(eventService.getEventsByClient(clientId));
    }

    @PutMapping("/event/{eventId}")
    public ResponseEntity<Event> provideFeedback(@PathVariable Long eventId,
            @RequestParam String feedback) {
        return ResponseEntity.ok(eventService.updateFeedback(eventId, feedback));
    }

    /**
     * NEW — Payment gateway endpoint.
     * Only allows payment if the event status is "Completed".
     * Returns a payment confirmation response.
     */
    @PostMapping("/event/{eventId}/pay")
    public ResponseEntity<Map<String, Object>> payForEvent(
            @PathVariable Long eventId,
            @RequestParam double amount) {

        Event event = eventService.getEventById(eventId);

        if (!"Completed".equalsIgnoreCase(event.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment is only allowed for completed events.");
        }

        // Simulate payment processing (integrate real gateway here)
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("eventId", eventId);
        response.put("eventTitle", event.getTitle());
        response.put("amountPaid", amount);
        response.put("message", "Payment processed successfully for event: " + event.getTitle());
        response.put("transactionId", "TXN-" + System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }
}
