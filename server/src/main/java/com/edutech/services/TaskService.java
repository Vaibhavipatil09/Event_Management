package com.edutech.services;

import com.edutech.entities.Event;
import com.edutech.entities.Staff;
import com.edutech.entities.Task;
import com.edutech.repositories.EventRepository;
import com.edutech.repositories.StaffRepository;
import com.edutech.repositories.TaskRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private EventRepository eventRepository;

    /**
     * Create a task. If eventId is provided the task is linked to that event.
     */
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task createTask(Task task, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        task.setEvent(event);
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    /**
     * Assign a staff member to a task.
     * BUSINESS RULE: If the task is already "Completed", assignment is blocked.
     */
    public Task assignTask(Long taskId, Long staffId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Block assignment when task is completed
        if ("Completed".equalsIgnoreCase(task.getStatus()) || "COMPLETED".equalsIgnoreCase(task.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot assign staff to a completed task.");
        }

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        task.setAssignedStaff(staff);
        return taskRepository.save(task);
    }

    public List<Task> getAssignedTasks(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        return taskRepository.findByAssignedStaff(staff);
    }

    public Task updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        return taskRepository.save(task);
    }
}
