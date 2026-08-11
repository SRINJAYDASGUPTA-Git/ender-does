package com.enderdev.enderdoesbackend.todo.controllers;

import com.enderdev.enderdoesbackend.exceptions.UnauthorizedAccessException;
import com.enderdev.enderdoesbackend.security.JWTService;
import com.enderdev.enderdoesbackend.todo.dto.TodoRequest;
import com.enderdev.enderdoesbackend.todo.dto.TodoResponse;
import com.enderdev.enderdoesbackend.todo.repositories.TodoRepository;
import com.enderdev.enderdoesbackend.todo.services.TodoService;
import com.enderdev.enderdoesbackend.user.models.User;
import com.enderdev.enderdoesbackend.user.repositories.RoleRepository;
import com.enderdev.enderdoesbackend.user.repositories.UserRepository;
import org.apache.coyote.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.junit.jupiter.api.DisplayNameGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TodoController.class)
@AutoConfigureMockMvc
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
class TodoControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockitoBean
    TodoService todoService;

    @MockitoBean
    JWTService jwtService;

    @MockitoBean
    UserDetailsService userDetailsService;

    @MockitoBean
    RoleRepository roleRepository;

    private UUID id;
    private TodoRequest request;
    private TodoResponse response;

    @BeforeEach
    void setUp() {

        id = UUID.randomUUID();
        User owner = User.builder()
                .id(UUID.randomUUID())
                .name("Owner")
                .email("owner@test.com")
                .password("password")
                .enabled(true)
                .accountLocked(false)
                .build();
        request = new TodoRequest(
                "Learn Jenkins",
                "Write Pipeline"
        );

        response = new TodoResponse(
                LocalDateTime.now().toString(),
                null,
                false,
                "Learn Jenkins",
                "Write Pipeline",
                owner.getId(),
                id
        );

//        when(authentication.getPrincipal()).thenReturn(owner);
    }

    @Test
    @WithMockUser
    void should_return_todo_by_id() throws Exception {

        when(todoService.getTodoById(any(), eq(id)))
                .thenReturn(response);

        mockMvc.perform(get("/api/v1/todo/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.title").value("Learn Jenkins"))
                .andExpect(jsonPath("$.body").value("Write Pipeline"))
                .andExpect(jsonPath("$.done").value(false));

        verify(todoService).getTodoById(any(), eq(id));
    }

    @Test
    @WithMockUser
    void should_return_all_todos() throws Exception {

        when(todoService.getAllTodoForUser(any()))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/todo/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Learn Jenkins"));
    }

    @Test
    @WithMockUser
    void should_create_todo() throws Exception {

        when(todoService.createTodo(any(), any()))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/todo/")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Learn Jenkins"));
    }

    @Test
    @WithMockUser
    void should_update_todo() throws Exception {

        when(todoService.updateTodo(any(), eq(id), any()))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/todo/{id}", id)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Learn Jenkins"));
    }

    @Test
    @WithMockUser
    void should_complete_todo() throws Exception {

        when(todoService.completeTodo(any(), eq(id)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/v1/todo/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Learn Jenkins"));
    }

    @Test
    @WithMockUser
    void should_delete_todo() throws Exception {

        mockMvc.perform(delete("/api/v1/todo/{id}", id))
                .andExpect(status().isOk());

        verify(todoService).deleteTodo(any(), eq(id));
    }

    @Test
    @WithMockUser
    void should_return_404_when_todo_not_found() throws Exception {

        when(todoService.getTodoById(any(), eq(id)))
                .thenThrow(new NoSuchElementException("Not Found"));

        mockMvc.perform(get("/api/v1/todo/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void should_return_403_when_user_is_not_owner() throws Exception {

        when(todoService.getTodoById(any(), eq(id)))
                .thenThrow(new UnauthorizedAccessException("Unauthorized"));

        mockMvc.perform(get("/api/v1/todo/{id}", id))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void should_return_400_when_request_is_invalid() throws Exception {

        when(todoService.createTodo(any(), any()))
                .thenThrow(new BadRequestException("Invalid"));

        mockMvc.perform(post("/api/v1/todo/")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}