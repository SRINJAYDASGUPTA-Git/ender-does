package com.enderdev.enderdoesbackend.todo.services;

import com.enderdev.enderdoesbackend.exceptions.UnauthorizedAccessException;
import com.enderdev.enderdoesbackend.todo.dto.TodoRequest;
import com.enderdev.enderdoesbackend.todo.dto.TodoResponse;
import com.enderdev.enderdoesbackend.todo.mappers.TodoMapper;
import com.enderdev.enderdoesbackend.todo.models.Todo;
import com.enderdev.enderdoesbackend.todo.repositories.TodoRepository;
import com.enderdev.enderdoesbackend.user.models.User;
import org.apache.coyote.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.junit.jupiter.api.DisplayNameGenerator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
class TodoServiceTest {

    @Mock
    private TodoRepository todoRepository;

    @Mock
    private TodoMapper todoMapper;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TodoService todoService;

    private User owner;
    private User otherUser;

    private Todo todo;

    private TodoRequest request;

    private TodoResponse response;

    @BeforeEach
    void setUp() {

        owner = User.builder()
                .id(UUID.randomUUID())
                .name("Owner")
                .email("owner@test.com")
                .password("password")
                .enabled(true)
                .accountLocked(false)
                .build();

        otherUser = User.builder()
                .id(UUID.randomUUID())
                .name("Other")
                .email("other@test.com")
                .password("password")
                .enabled(true)
                .accountLocked(false)
                .build();

        todo = Todo.builder()
                .id(UUID.randomUUID())
                .title("Learn Jenkins")
                .body("Write Pipeline")
                .isDone(false)
                .createdAt(LocalDateTime.now())
                .owner(owner)
                .build();

        request = new TodoRequest(
                "Learn Jenkins",
                "Write Pipeline"
        );

        response = TodoResponse.builder()
                .createdAt(todo.getCreatedAt().toString())
                .completedAt(todo.getCompletedAt() != null ? todo.getCompletedAt().toString() : "")
                .title(todo.getTitle())
                .body(todo.getBody())
                .ownerId(todo.getOwner().getId())
                .id(todo.getId())
                .build();


        when(authentication.getPrincipal()).thenReturn(owner);

    }

    @Test
    void should_create_todo() throws BadRequestException {

        // Arrange
        when(todoRepository.save(any(Todo.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(todoMapper.toTodoResponse(any(Todo.class)))
                .thenReturn(response);

        // Act
        TodoResponse result =
                todoService.createTodo(authentication, request);

        // Assert
        assertThat(result).isNotNull();

        assertThat(result.getTitle())
                .isEqualTo(request.title());

        assertThat(result.getBody())
                .isEqualTo(request.body());

        verify(todoRepository).save(any(Todo.class));

        verify(todoMapper).toTodoResponse(any(Todo.class));
    }

    @Test
    void should_throw_when_title_is_empty() {

        TodoRequest invalid =
                new TodoRequest("", "Body");

        assertThatThrownBy(() ->
                todoService.createTodo(authentication, invalid)
        )
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Todo must contain");

        verifyNoInteractions(todoRepository);
        verifyNoInteractions(todoMapper);
    }

    @Test
    void should_throw_when_body_is_empty() {

        TodoRequest invalid =
                new TodoRequest("Title", "");

        assertThatThrownBy(() ->
                todoService.createTodo(authentication, invalid)
        )
                .isInstanceOf(BadRequestException.class);

        verifyNoInteractions(todoRepository);
        verifyNoInteractions(todoMapper);
    }

    @Test
    void should_return_todo_by_id() {

        // Arrange
        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        when(todoMapper.toTodoResponse(todo))
                .thenReturn(response);

        // Act
        TodoResponse result =
                todoService.getTodoById(authentication, todo.getId());

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo(todo.getTitle());
        assertThat(result.getBody()).isEqualTo(todo.getBody());

        verify(todoRepository).findById(todo.getId());
        verify(todoMapper).toTodoResponse(todo);
    }

    @Test
    void should_throw_when_accessing_other_users_todo() {

        todo.setOwner(otherUser);

        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        assertThatThrownBy(() ->
                todoService.getTodoById(authentication, todo.getId())
        )
                .isInstanceOf(UnauthorizedAccessException.class)
                .hasMessageContaining("Unauthorized");

        verify(todoRepository).findById(todo.getId());
        verify(todoMapper, never()).toTodoResponse(any());
    }

    @Test
    void should_throw_when_todo_not_found() {

        UUID id = UUID.randomUUID();

        when(todoRepository.findById(id))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                todoService.getTodoById(authentication, id)
        )
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("not found");

        verify(todoRepository).findById(id);
        verifyNoInteractions(todoMapper);
    }

    @Test
    void should_return_all_todos_for_user() {

        // Arrange
        Todo todo1 = Todo.builder()
                .id(UUID.randomUUID())
                .title("Todo 1")
                .body("Body 1")
                .owner(owner)
                .build();

        Todo todo2 = Todo.builder()
                .id(UUID.randomUUID())
                .title("Todo 2")
                .body("Body 2")
                .owner(owner)
                .build();

        TodoResponse response1 = new TodoResponse(
                null,
                null,
                false,
                todo1.getTitle(),
                todo1.getBody(),
                todo1.getOwner().getId(),
                todo1.getId()
        );

        TodoResponse response2 = new TodoResponse(
                null,
                null,
                false,
                todo2.getTitle(),
                todo2.getBody(),
                todo2.getOwner().getId(),
                todo2.getId()
        );

        when(todoRepository.findAllByOwner_Id(owner.getId()))
                .thenReturn(List.of(todo1, todo2));

        when(todoMapper.toTodoResponse(todo1))
                .thenReturn(response1);

        when(todoMapper.toTodoResponse(todo2))
                .thenReturn(response2);

        // Act
        List<TodoResponse> result =
                todoService.getAllTodoForUser(authentication);

        // Assert
        assertThat(result)
                .hasSize(2);

        assertThat(result)
                .extracting(TodoResponse::getTitle)
                .containsExactly("Todo 1", "Todo 2");

        verify(todoRepository).findAllByOwner_Id(owner.getId());
        verify(todoMapper).toTodoResponse(todo1);
        verify(todoMapper).toTodoResponse(todo2);
    }

    @Test
    void should_return_empty_list_when_user_has_no_todos() {

        when(todoRepository.findAllByOwner_Id(owner.getId()))
                .thenReturn(List.of());

        List<TodoResponse> result =
                todoService.getAllTodoForUser(authentication);

        assertThat(result).isEmpty();

        verify(todoRepository).findAllByOwner_Id(owner.getId());
        verifyNoInteractions(todoMapper);
    }

    @Test
    void should_complete_todo() {

        // Arrange
        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        when(todoRepository.save(any(Todo.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(todoMapper.toTodoResponse(any(Todo.class)))
                .thenReturn(response);

        ArgumentCaptor<Todo> captor =
                ArgumentCaptor.forClass(Todo.class);

        // Act
        todoService.completeTodo(authentication, todo.getId());

        // Assert
        verify(todoRepository).save(captor.capture());

        Todo savedTodo = captor.getValue();

        assertThat(savedTodo.getIsDone()).isTrue();
        assertThat(savedTodo.getCompletedAt()).isNotNull();

        verify(todoMapper).toTodoResponse(savedTodo);
    }

    @Test
    void should_throw_when_completing_nonexistent_todo() {

        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                todoService.completeTodo(authentication, todo.getId())
        )
                .isInstanceOf(NoSuchElementException.class);

        verify(todoRepository, never()).save(any());
        verifyNoInteractions(todoMapper);
    }

    @Test
    void should_throw_when_completing_other_users_todo() {

        todo.setOwner(otherUser);

        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        assertThatThrownBy(() ->
                todoService.completeTodo(authentication, todo.getId())
        )
                .isInstanceOf(UnauthorizedAccessException.class);

        verify(todoRepository, never()).save(any());
        verify(todoMapper, never()).toTodoResponse(any());
    }

    @Test
    void should_update_title_and_body() {

        // Arrange
        TodoRequest request = new TodoRequest(
                "Updated Title",
                "Updated Body"
        );

        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        when(todoRepository.save(any(Todo.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(todoMapper.toTodoResponse(any(Todo.class)))
                .thenReturn(response);

        ArgumentCaptor<Todo> captor =
                ArgumentCaptor.forClass(Todo.class);

        // Act
        todoService.updateTodo(authentication, todo.getId(), request);

        // Assert
        verify(todoRepository).save(captor.capture());

        Todo updated = captor.getValue();

        assertThat(updated.getTitle()).isEqualTo("Updated Title");
        assertThat(updated.getBody()).isEqualTo("Updated Body");
    }

    @Test
    void should_update_only_title() {

        String originalBody = todo.getBody();

        TodoRequest request = new TodoRequest(
                "New Title",
                ""
        );

        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        when(todoRepository.save(any(Todo.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(todoMapper.toTodoResponse(any(Todo.class)))
                .thenReturn(response);

        ArgumentCaptor<Todo> captor =
                ArgumentCaptor.forClass(Todo.class);

        todoService.updateTodo(authentication, todo.getId(), request);

        verify(todoRepository).save(captor.capture());

        Todo updated = captor.getValue();

        assertThat(updated.getTitle()).isEqualTo("New Title");
        assertThat(updated.getBody()).isEqualTo(originalBody);
    }

    @Test
    void should_update_only_body() {

        String originalTitle = todo.getTitle();

        TodoRequest request = new TodoRequest(
                "",
                "New Body"
        );

        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        when(todoRepository.save(any(Todo.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(todoMapper.toTodoResponse(any(Todo.class)))
                .thenReturn(response);

        ArgumentCaptor<Todo> captor =
                ArgumentCaptor.forClass(Todo.class);

        todoService.updateTodo(authentication, todo.getId(), request);

        verify(todoRepository).save(captor.capture());

        Todo updated = captor.getValue();

        assertThat(updated.getTitle()).isEqualTo(originalTitle);
        assertThat(updated.getBody()).isEqualTo("New Body");
    }

    @Test
    void should_throw_when_updating_nonexistent_todo() {

        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                todoService.updateTodo(authentication, todo.getId(), request)
        )
                .isInstanceOf(NoSuchElementException.class);

        verify(todoRepository, never()).save(any());
        verifyNoInteractions(todoMapper);
    }

    @Test
    void should_throw_when_updating_other_users_todo() {

        todo.setOwner(otherUser);

        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        assertThatThrownBy(() ->
                todoService.updateTodo(authentication, todo.getId(), request)
        )
                .isInstanceOf(UnauthorizedAccessException.class);

        verify(todoRepository, never()).save(any());
        verify(todoMapper, never()).toTodoResponse(any());
    }

    @Test
    void should_delete_todo() {

        // Arrange
        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        // Act
        todoService.deleteTodo(authentication, todo.getId());

        // Assert
        verify(todoRepository).findById(todo.getId());
        verify(todoRepository).deleteTodoById(todo.getId());
        verify(todoRepository).flush();

        verify(todoMapper, never()).toTodoResponse(any());
    }

    @Test
    void should_throw_when_deleting_nonexistent_todo() {

        // Arrange
        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() ->
                todoService.deleteTodo(authentication, todo.getId())
        )
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("not found");

        verify(todoRepository).findById(todo.getId());

        verify(todoRepository, never()).deleteTodoById(any());

        verify(todoRepository, never()).flush();

        verifyNoInteractions(todoMapper);
    }

    @Test
    void should_throw_when_deleting_other_users_todo() {

        // Arrange
        todo.setOwner(otherUser);

        when(todoRepository.findById(todo.getId()))
                .thenReturn(Optional.of(todo));

        // Act + Assert
        assertThatThrownBy(() ->
                todoService.deleteTodo(authentication, todo.getId())
        )
                .isInstanceOf(UnauthorizedAccessException.class)
                .hasMessageContaining("Unauthorized");

        verify(todoRepository).findById(todo.getId());

        verify(todoRepository, never()).deleteTodoById(any());

        verify(todoRepository, never()).flush();

        verifyNoInteractions(todoMapper);
    }
}