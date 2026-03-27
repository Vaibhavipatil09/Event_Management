package com.edutech.services;

import com.edutech.entities.Staff;
import com.edutech.entities.Task;
import com.edutech.repositories.StaffRepository;
import com.edutech.repositories.TaskRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private StaffRepository staffRepository;

    public Task createTask(Task task) {

        return taskRepository.save(task);

    }

    public List<Task> getAllTasks() {

        return taskRepository.findAll();

    }

    public Task assignTask(Long taskId, Long staffId) {

        Task task = taskRepository.findById(taskId)

                .orElseThrow(() -> new RuntimeException("Task not found"));

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
