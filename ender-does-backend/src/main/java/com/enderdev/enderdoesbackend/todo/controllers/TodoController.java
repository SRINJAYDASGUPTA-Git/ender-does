package com.enderdev.enderdoesbackend.todo.controllers;

import com.enderdev.enderdoesbackend.todo.dto.TodoRequest;
import com.enderdev.enderdoesbackend.todo.dto.TodoResponse;
import com.enderdev.enderdoesbackend.todo.services.TodoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/todo")
@RequiredArgsConstructor
@Tag(name = "Todo Management", description = "Endpoints for managing todos")
public class TodoController {

    private final TodoService todoService;

    @GetMapping("/{id}")
    public ResponseEntity<TodoResponse> getTodoById(
            @PathVariable(name = "id") UUID id,
            Authentication connectedUser
    ){
        return ResponseEntity.ok(todoService.getTodoById(connectedUser, id));
    }

    @GetMapping("/")
    public ResponseEntity<List<TodoResponse>> getAllTodosByUser(Authentication connectedUser){
        return ResponseEntity.ok(todoService.getAllTodoForUser(connectedUser));
    }

    @PostMapping("/")
    public ResponseEntity<TodoResponse> createTodo(
            @RequestBody TodoRequest request,
            Authentication connectedUser
    ) throws BadRequestException {
        return ResponseEntity.status(HttpStatus.CREATED).body(todoService.createTodo(connectedUser, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoResponse> updateTodo(
            @PathVariable(name = "id") UUID id,
            @RequestBody TodoRequest request,
            Authentication connectedUser
    ){
        return ResponseEntity.ok(todoService.updateTodo(connectedUser, id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TodoResponse> completeTodo(
            @PathVariable(name = "id") UUID id,
            Authentication connectedUser
    ){
        return ResponseEntity.ok(todoService.completeTodo(connectedUser, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(
            @PathVariable(name = "id") UUID id,
            Authentication connectedUser
    ){
        todoService.deleteTodo(connectedUser,id);

        return ResponseEntity.ok().build();
    }

}
