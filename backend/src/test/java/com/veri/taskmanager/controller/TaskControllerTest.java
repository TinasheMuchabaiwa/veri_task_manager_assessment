package com.veri.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veri.taskmanager.dto.TaskRequest;
import com.veri.taskmanager.model.Task;
import com.veri.taskmanager.model.TaskStatus;
import com.veri.taskmanager.model.User;
import com.veri.taskmanager.repository.TaskRepository;
import com.veri.taskmanager.repository.UserRepository;
import com.veri.taskmanager.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User("taskuser", passwordEncoder.encode("password123"));
        testUser = userRepository.save(testUser);

        UserDetails userDetails = userDetailsService.loadUserByUsername(testUser.getUsername());
        jwtToken = jwtUtil.generateToken(userDetails);
    }

    @Test
    void shouldCreateTaskSuccessfully() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");
        request.setDescription("Task description");
        request.setStatus(TaskStatus.PENDING);

        mockMvc.perform(post("/api/tasks")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("New Task")))
                .andExpect(jsonPath("$.description", is("Task description")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.id", notNullValue()));
    }

    @Test
    void shouldGetAllTasksForUser() throws Exception {
        Task task1 = new Task();
        task1.setTitle("Task 1");
        task1.setDescription("Description 1");
        task1.setStatus(TaskStatus.PENDING);
        task1.setUser(testUser);
        taskRepository.save(task1);

        Task task2 = new Task();
        task2.setTitle("Task 2");
        task2.setDescription("Description 2");
        task2.setStatus(TaskStatus.COMPLETED);
        task2.setUser(testUser);
        taskRepository.save(task2);

        mockMvc.perform(get("/api/tasks")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title", is("Task 1")))
                .andExpect(jsonPath("$[1].title", is("Task 2")));
    }

    @Test
    void shouldGetTaskByIdSuccessfully() throws Exception {
        Task task = new Task();
        task.setTitle("Test Task");
        task.setDescription("Test Description");
        task.setStatus(TaskStatus.PENDING);
        task.setUser(testUser);
        task = taskRepository.save(task);

        mockMvc.perform(get("/api/tasks/" + task.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Test Task")))
                .andExpect(jsonPath("$.description", is("Test Description")))
                .andExpect(jsonPath("$.status", is("PENDING")));
    }

    @Test
    void shouldReturnNotFoundWhenTaskDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/tasks/999")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", is("Task not found")));
    }

    @Test
    void shouldUpdateTaskSuccessfully() throws Exception {
        Task task = new Task();
        task.setTitle("Original Title");
        task.setDescription("Original Description");
        task.setStatus(TaskStatus.PENDING);
        task.setUser(testUser);
        task = taskRepository.save(task);

        TaskRequest updateRequest = new TaskRequest();
        updateRequest.setTitle("Updated Title");
        updateRequest.setDescription("Updated Description");
        updateRequest.setStatus(TaskStatus.COMPLETED);

        mockMvc.perform(put("/api/tasks/" + task.getId())
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")))
                .andExpect(jsonPath("$.description", is("Updated Description")))
                .andExpect(jsonPath("$.status", is("COMPLETED")));
    }

    @Test
    void shouldDeleteTaskSuccessfully() throws Exception {
        Task task = new Task();
        task.setTitle("Task to Delete");
        task.setDescription("Description");
        task.setStatus(TaskStatus.PENDING);
        task.setUser(testUser);
        task = taskRepository.save(task);

        mockMvc.perform(delete("/api/tasks/" + task.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnUnauthorizedWhenNoToken() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnBadRequestWhenTitleMissing() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setDescription("Description only");

        mockMvc.perform(post("/api/tasks")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldNotAllowAccessToOtherUsersTasks() throws Exception {
        User otherUser = new User("otheruser", passwordEncoder.encode("password123"));
        otherUser = userRepository.save(otherUser);

        Task otherUserTask = new Task();
        otherUserTask.setTitle("Other User's Task");
        otherUserTask.setDescription("Should not be accessible");
        otherUserTask.setStatus(TaskStatus.PENDING);
        otherUserTask.setUser(otherUser);
        otherUserTask = taskRepository.save(otherUserTask);

        mockMvc.perform(get("/api/tasks/" + otherUserTask.getId())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", is("Task not found")));
    }
}