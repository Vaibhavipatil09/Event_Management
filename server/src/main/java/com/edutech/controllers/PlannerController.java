package com.edutech.controllers;

import com.edutech.entities.Client;
import com.edutech.entities.Event;
import com.edutech.entities.Staff;
import com.edutech.entities.Task;
import com.edutech.services.EventService;
import com.edutech.services.TaskService;
import com.edutech.repositories.ClientRepository;
import com.edutech.repositories.StaffRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planner")
public class PlannerController {

    @Autowired
    private EventService eventService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private ClientRepository clientRepository;

    @GetMapping("/staff")
    public ResponseEntity<List<Staff>> getAllStaff() {
        return ResponseEntity.ok(staffRepository.findAll());
    }

    /** New endpoint — returns all registered clients for the dropdown */
    @GetMapping("/clients")
    public ResponseEntity<List<Client>> getAllClients() {
        return ResponseEntity.ok(clientRepository.findAll());
    }

    /**
     * Create event. If clientId is provided the event is assigned to that client,
     * otherwise it is created without a client (existing test behaviour preserved).
     */
    @PostMapping("/event")
    public ResponseEntity<Event> createEvent(
            @RequestParam Long plannerId,
            @RequestParam(required = false) Long clientId,
            @RequestBody Event event) {
        if (clientId != null) {
            return ResponseEntity.status(201)
                    .body(eventService.createEvent(plannerId, clientId, event));
        }
        return ResponseEntity.status(201)
                .body(eventService.createEvent(plannerId, event));
    }

    @PutMapping("/event/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id,
            @RequestBody Event event) {
        return ResponseEntity.ok(eventService.updateEvent(id, event));
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getEventsByPlanner(@RequestParam Long plannerId) {
        return ResponseEntity.ok(eventService.getEventsByPlanner(plannerId));
    }

    @PostMapping("/task")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        return ResponseEntity.status(201).body(taskService.createTask(task));
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @PostMapping("/tasks/{taskId}/assign/{staffId}")
    public ResponseEntity<Task> assignTask(@PathVariable Long taskId,
            @PathVariable Long staffId) {
        return ResponseEntity.ok(taskService.assignTask(taskId, staffId));
    }
}
