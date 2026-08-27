package com.enderdev.enderdoesbackend.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TodoResponse {
    private String createdAt;
    private String completedAt;
    private boolean isDone;
    private String title;
    private String body;
    private UUID ownerId;
    private UUID id;
}
