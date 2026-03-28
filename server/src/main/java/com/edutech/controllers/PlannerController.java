package com.edutech.controllers;

import com.edutech.entities.Event;
import com.edutech.entities.Task;
import com.edutech.services.EventService;
import com.edutech.services.TaskService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/event")
    public ResponseEntity<Event> createEvent(@RequestParam Long plannerId,
            @RequestBody Event event) {
        return ResponseEntity.status(201).body(eventService.createEvent(plannerId, event));
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
