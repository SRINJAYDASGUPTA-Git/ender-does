package com.enderdev.enderdoesbackend.todo.services;

import com.enderdev.enderdoesbackend.exceptions.UnauthorizedAccessException;
import com.enderdev.enderdoesbackend.exceptions.UnauthorizedException;
import com.enderdev.enderdoesbackend.todo.dto.TodoRequest;
import com.enderdev.enderdoesbackend.todo.dto.TodoResponse;
import com.enderdev.enderdoesbackend.todo.mappers.TodoMapper;
import com.enderdev.enderdoesbackend.todo.models.Todo;
import com.enderdev.enderdoesbackend.todo.repositories.TodoRepository;
import com.enderdev.enderdoesbackend.user.models.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TodoService {
    private final TodoRepository todoRepository;
    private final TodoMapper todoMapper;

    public TodoResponse createTodo(Authentication connectedUser, TodoRequest request) throws BadRequestException {
        User user = (User) connectedUser.getPrincipal();
        verifyAuthentication(user);

        if (request.title().isEmpty() || request.body().isEmpty())
            throw new BadRequestException("Todo must contain a valid Title and Body");
        Todo todo = Todo.builder()
                .title(request.title())
                .body(request.body())
                .isDone(false)
                .createdAt(LocalDateTime.now())
                .completedAt(null)
                .owner(user)
                .build();

        todoRepository.save(todo);

        return todoMapper.toTodoResponse(todo);
    }

    public TodoResponse getTodoById(Authentication connectedUser, UUID id) throws NoSuchElementException, UnauthorizedAccessException{
        User user = (User) connectedUser.getPrincipal();
        verifyAuthentication(user);
        Todo todo = todoRepository.findById(id).orElseThrow(
                () -> new NoSuchElementException("Todo with id: "+id+" not found")
        );
//        log.info(String.valueOf(todo.getOwner().equals(user)));
//        log.info(todo.getOwner().getId().toString());
//        log.info(user.getId().toString());
        verifyOwnerShip(todo, user);

        return todoMapper.toTodoResponse(todo);
    }

    public List<TodoResponse> getAllTodoForUser(Authentication connectedUser){
        User user = (User) connectedUser.getPrincipal();
        verifyAuthentication(user);

        List<Todo> todos = todoRepository.findAllByOwner_Id(user.getId());

        return todos.stream().map(todoMapper::toTodoResponse).toList();
    }

    public TodoResponse completeTodo(Authentication connectedUser, UUID id) throws NoSuchElementException, UnauthorizedAccessException{
        User user = (User) connectedUser.getPrincipal();
        verifyAuthentication(user);
        Todo todo = todoRepository.findById(id).orElseThrow(
                () -> new NoSuchElementException("Todo with id: "+id+" not found")
        );

        verifyOwnerShip(todo, user);

        todo.setIsDone(true);
        todo.setCompletedAt(LocalDateTime.now());
        todoRepository.save(todo);

        return todoMapper.toTodoResponse(todo);
    }

    public TodoResponse updateTodo(Authentication connectedUser, UUID id, TodoRequest request) throws NoSuchElementException, UnauthorizedAccessException{
        User user = (User) connectedUser.getPrincipal();
        verifyAuthentication(user);
        Todo todo = todoRepository.findById(id).orElseThrow(
                () -> new NoSuchElementException("Todo with id: "+id+" not found")
        );

        verifyOwnerShip(todo, user);

        if(!request.title().isEmpty()){
            todo.setTitle(request.title());
        }

        if (!request.body().isEmpty()) todo.setBody(request.body());

        todoRepository.save(todo);
        return todoMapper.toTodoResponse(todo);
    }

    public void deleteTodo(Authentication connectedUser, UUID id) throws NoSuchElementException, UnauthorizedAccessException{
        User user = (User) connectedUser.getPrincipal();
        verifyAuthentication(user);
        Todo todo = todoRepository.findById(id).orElseThrow(
                () -> new NoSuchElementException("Todo with id: "+id+" not found")
        );

        verifyOwnerShip(todo, user);
        todoRepository.deleteTodoById(todo.getId());
        todoRepository.flush();

//        log.info("Deleted");
    }

    private static void verifyOwnerShip(Todo todo, User user) {
        if(!todo.getOwner().getId().equals(user.getId()))
            throw new UnauthorizedAccessException("Cannot access Todo: Unauthorized User");
    }

    private static void verifyAuthentication(User user) {
        if (user == null)
            throw new UnauthorizedException("User not Authorized");
    }

    public TodoResponse reopenTodo(Authentication connectedUser, UUID id) {
        User user = (User) connectedUser.getPrincipal();
        verifyAuthentication(user);
        Todo todo = todoRepository.findById(id).orElseThrow(
                () -> new NoSuchElementException("Todo with id: "+id+" not found")
        );

        verifyOwnerShip(todo, user);

        todo.setIsDone(false);
        todo.setCompletedAt(null);
        todoRepository.save(todo);

        return todoMapper.toTodoResponse(todo);
    }
}
