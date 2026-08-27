package com.enderdev.enderdoesbackend.todo.mappers;

import com.enderdev.enderdoesbackend.todo.dto.TodoResponse;
import com.enderdev.enderdoesbackend.todo.models.Todo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TodoMapper {
    public TodoResponse toTodoResponse(Todo todo){
        return TodoResponse.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .ownerId(todo.getOwner().getId())
                .body(todo.getBody())
                .isDone(todo.getIsDone())
                .completedAt(todo.getCompletedAt() != null ? todo.getCompletedAt().toString() : "")
                .createdAt(todo.getCreatedAt().toString())
                .build();
    }
}
