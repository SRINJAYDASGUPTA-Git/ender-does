package com.enderdev.enderdoesbackend.user.dto;

import com.enderdev.enderdoesbackend.todo.dto.TodoResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;

import java.util.List;
import java.util.UUID;

@Builder
@Data
@AllArgsConstructor
@ToString
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String imageUrl;
    private Boolean accountLocked;
    private Boolean enabled;
    private List<String> roles;
    private List<TodoResponse> todos;
}
