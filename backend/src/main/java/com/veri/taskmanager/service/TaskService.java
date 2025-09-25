package com.veri.taskmanager.service;

import com.veri.taskmanager.dto.TaskRequest;
import com.veri.taskmanager.dto.TaskResponse;
import com.veri.taskmanager.model.Task;
import com.veri.taskmanager.model.TaskStatus;
import com.veri.taskmanager.model.User;
import com.veri.taskmanager.repository.TaskRepository;
import com.veri.taskmanager.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TaskResponse> getAllTasks() {
        String username = getCurrentUsername();
        User user = getUserByUsername(username);

        logger.info("Getting all tasks for user: {}", username);

        List<Task> tasks = taskRepository.findByUserId(user.getId());
        return tasks.stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(Long taskId) {
        String username = getCurrentUsername();
        User user = getUserByUsername(username);

        logger.info("Getting task {} for user: {}", taskId, username);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(user.getId())) {
            logger.warn("User {} attempted to access task {} owned by user {}",
                       username, taskId, task.getUser().getUsername());
            throw new RuntimeException("Task not found");
        }

        return mapToTaskResponse(task);
    }

    public TaskResponse createTask(TaskRequest request) {
        String username = getCurrentUsername();
        User user = getUserByUsername(username);

        logger.info("Creating task for user: {}", username);

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING);
        task.setUser(user);

        Task savedTask = taskRepository.save(task);
        logger.info("Task created with ID {} for user: {}", savedTask.getId(), username);

        return mapToTaskResponse(savedTask);
    }

    public TaskResponse updateTask(Long taskId, TaskRequest request) {
        String username = getCurrentUsername();
        User user = getUserByUsername(username);

        logger.info("Updating task {} for user: {}", taskId, username);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(user.getId())) {
            logger.warn("User {} attempted to update task {} owned by user {}",
                       username, taskId, task.getUser().getUsername());
            throw new RuntimeException("Task not found");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        Task updatedTask = taskRepository.save(task);
        logger.info("Task {} updated for user: {}", taskId, username);

        return mapToTaskResponse(updatedTask);
    }

    public void deleteTask(Long taskId) {
        String username = getCurrentUsername();
        User user = getUserByUsername(username);

        logger.info("Deleting task {} for user: {}", taskId, username);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(user.getId())) {
            logger.warn("User {} attempted to delete task {} owned by user {}",
                       username, taskId, task.getUser().getUsername());
            throw new RuntimeException("Task not found");
        }

        taskRepository.delete(task);
        logger.info("Task {} deleted for user: {}", taskId, username);
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private TaskResponse mapToTaskResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}