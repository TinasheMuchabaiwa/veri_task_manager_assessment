package com.veri.taskmanager.controller;

import com.veri.taskmanager.dto.StandardResponse;
import com.veri.taskmanager.dto.TaskRequest;
import com.veri.taskmanager.dto.TaskResponse;
import com.veri.taskmanager.service.TaskService;
import com.veri.taskmanager.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tasks", description = "Task management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Operation(
            summary = "Get all user tasks",
            description = "Retrieves all tasks belonging to the authenticated user"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Tasks retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TaskResponse.class)
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token required",
                    content = @Content(mediaType = "application/json")
            )
    })
    @GetMapping
    public ResponseEntity<StandardResponse<List<TaskResponse>>> getAllTasks() {
        List<TaskResponse> tasks = taskService.getAllTasks();
        return ResponseUtil.success("Tasks retrieved successfully", tasks);
    }

    @Operation(
            summary = "Get task by ID",
            description = "Retrieves a specific task by ID. Only returns tasks owned by the authenticated user."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Task retrieved successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TaskResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Task not found or not owned by user",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token required",
                    content = @Content(mediaType = "application/json")
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<StandardResponse<TaskResponse>> getTaskById(@PathVariable Long id) {
        try {
            TaskResponse task = taskService.getTaskById(id);
            return ResponseUtil.success("Task retrieved successfully", task);
        } catch (RuntimeException e) {
            return ResponseUtil.notFound("Task not found");
        }
    }

    @Operation(
            summary = "Create a new task",
            description = "Creates a new task for the authenticated user"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Task created successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TaskResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Validation error - title is required",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token required",
                    content = @Content(mediaType = "application/json")
            )
    })
    @PostMapping
    public ResponseEntity<StandardResponse<TaskResponse>> createTask(@Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.createTask(request);
        return ResponseUtil.created("Task created successfully", task, task.getId());
    }

    @Operation(
            summary = "Update a task",
            description = "Updates an existing task. Only allows updating tasks owned by the authenticated user."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Task updated successfully",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TaskResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Task not found or not owned by user",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Validation error - title is required",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token required",
                    content = @Content(mediaType = "application/json")
            )
    })
    @PutMapping("/{id}")
    public ResponseEntity<StandardResponse<TaskResponse>> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        try {
            TaskResponse task = taskService.updateTask(id, request);
            return ResponseUtil.success("Task updated successfully", task);
        } catch (RuntimeException e) {
            return ResponseUtil.notFound("Task not found");
        }
    }

    @Operation(
            summary = "Delete a task",
            description = "Deletes a task. Only allows deleting tasks owned by the authenticated user."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Task deleted successfully",
                    content = @Content()
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Task not found or not owned by user",
                    content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token required",
                    content = @Content(mediaType = "application/json")
            )
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<StandardResponse<Void>> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseUtil.noContent("Task deleted successfully");
        } catch (RuntimeException e) {
            return ResponseUtil.notFound("Task not found");
        }
    }
}