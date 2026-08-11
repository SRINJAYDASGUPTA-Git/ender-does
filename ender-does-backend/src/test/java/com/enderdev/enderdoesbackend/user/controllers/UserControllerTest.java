package com.enderdev.enderdoesbackend.user.controllers;

import com.enderdev.enderdoesbackend.security.JWTService;
import com.enderdev.enderdoesbackend.user.dto.UserResponse;
import com.enderdev.enderdoesbackend.user.dto.UserUpdateRequest;
import com.enderdev.enderdoesbackend.user.repositories.RoleRepository;
import com.enderdev.enderdoesbackend.user.services.UserServices;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.junit.jupiter.api.DisplayNameGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserServices userServices;

    @MockitoBean
    JWTService jwtService;

    @MockitoBean
    UserDetailsService userDetailsService;

    @MockitoBean
    RoleRepository roleRepository;

    private UserResponse response;
    private UserUpdateRequest request;

    @BeforeEach
    void setUp() {

        response = UserResponse.builder()
                .id(UUID.randomUUID())
                .name("John Doe")
                .email("john@example.com")
                .imageUrl("avatar.png")
                .enabled(true)
                .accountLocked(false)
                .roles(List.of("ROLE_USER"))
                .todos(List.of())
                .build();

        request = new UserUpdateRequest(
                "Jane Doe",
                "new-avatar.png"
        );
    }

    @Test
    @WithMockUser
    void should_return_current_user() throws Exception {

        when(userServices.getCurrentUser(any()))
                .thenReturn(response);

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isOk())
                .andExpect((ResultMatcher) jsonPath("$.name").value("John Doe"))
                .andExpect((ResultMatcher) jsonPath("$.email").value("john@example.com"))
                .andExpect((ResultMatcher) jsonPath("$.imageUrl").value("avatar.png"));

        verify(userServices).getCurrentUser(any());
    }

    @Test
    @WithMockUser
    void should_update_current_user() throws Exception {

        when(userServices.updateCurrentUser(any(), any()))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/users/me")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"));

        verify(userServices)
                .updateCurrentUser(any(), any(UserUpdateRequest.class));
    }




    @Test
    @WithMockUser
    void should_return_404_when_user_not_found() throws Exception {

        when(userServices.getCurrentUser(any()))
                .thenThrow(new NoSuchElementException("User not found"));

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void should_return_400_when_update_request_is_invalid() throws Exception {

        when(userServices.updateCurrentUser(any(), any()))
                .thenThrow(new IllegalArgumentException("Invalid request"));

        mockMvc.perform(put("/api/v1/users/me")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

}