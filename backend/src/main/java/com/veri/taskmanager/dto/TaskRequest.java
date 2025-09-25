package com.veri.taskmanager.dto;

import com.veri.taskmanager.model.TaskStatus;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private TaskStatus status;
}