package com.enderdev.enderdoesbackend.user.mappers;

import com.enderdev.enderdoesbackend.todo.mappers.TodoMapper;
import com.enderdev.enderdoesbackend.user.dto.UserResponse;
import com.enderdev.enderdoesbackend.user.models.Role;
import com.enderdev.enderdoesbackend.user.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserMapper {
    private final TodoMapper todoMapper;
    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .imageUrl(user.getImageUrl())
                .accountLocked(user.getAccountLocked())
                .enabled(user.getEnabled())
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .todos(user.getTodos().stream().map(todoMapper::toTodoResponse).toList())
                .build();
    }
}
