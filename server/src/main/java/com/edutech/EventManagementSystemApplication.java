package com.edutech;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import com.edutech.services.TaskService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EventManagementSystemApplication {

	public static void main(String[] args) {
		// SpringApplication.run(EventManagementSystemApplication.class, args);
		SpringApplication.run(EventManagementSystemApplication.class, args);
		// TaskService service=ctx.getBean(TaskService.class);

	}

}
