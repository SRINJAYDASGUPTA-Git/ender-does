package com.enderdev.enderdoesbackend.user.services;

import com.enderdev.enderdoesbackend.user.dto.UserResponse;
import com.enderdev.enderdoesbackend.user.dto.UserUpdateRequest;
import com.enderdev.enderdoesbackend.user.mappers.UserMapper;
import com.enderdev.enderdoesbackend.user.models.User;
import com.enderdev.enderdoesbackend.user.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayNameGeneration;
import org.junit.jupiter.api.DisplayNameGenerator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
class UserServicesTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserServices userServices;

    private User user;
    private UserResponse response;
    private UserUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {

        user = User.builder()
                .id(UUID.randomUUID())
                .name("John Doe")
                .email("john@example.com")
                .imageUrl("avatar.png")
                .enabled(true)
                .accountLocked(false)
                .roles(new ArrayList<>())
                .todos(new ArrayList<>())
                .build();

        response = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .imageUrl(user.getImageUrl())
                .enabled(true)
                .accountLocked(false)
                .roles(List.of())
                .todos(List.of())
                .build();

        updateRequest = new UserUpdateRequest(
                "Jane Doe",
                "new-avatar.png"
        );

        when(authentication.getPrincipal()).thenReturn(user);
    }

    @Test
    void should_return_current_user() {
        when(userMapper.toUserResponse(user))
                .thenReturn(response);

        // Act
        UserResponse result = userServices.getCurrentUser(authentication);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(userMapper).toUserResponse(user);
        verifyNoInteractions(userRepository);
    }

    @Test
    void should_update_name_and_image() {
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userMapper.toUserResponse(any(User.class)))
                .thenReturn(response);

        // Act
        userServices.updateCurrentUser(authentication, updateRequest);

        // Assert
        assertThat(user.getName()).isEqualTo("Jane Doe");
        assertThat(user.getImageUrl()).isEqualTo("new-avatar.png");

        verify(userRepository).save(user);
        verify(userMapper).toUserResponse(user);
//        verifyNoInteractions(userRepository);
    }

    @Test
    void should_update_name_only() {
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userMapper.toUserResponse(any(User.class)))
                .thenReturn(response);

        // Act
        UserUpdateRequest updateRequestNameOnly = new UserUpdateRequest("Jane Doe", null);
        userServices.updateCurrentUser(authentication, updateRequestNameOnly);

        // Assert
        assertThat(user.getName()).isEqualTo("Jane Doe");
        assertThat(user.getImageUrl()).isEqualTo("avatar.png");

        verify(userRepository).save(user);
        verify(userMapper).toUserResponse(user);
//        verifyNoInteractions(userRepository);
    }

    @Test
    void should_update_image_only() {
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userMapper.toUserResponse(any(User.class)))
                .thenReturn(response);

        // Act
        UserUpdateRequest updateRequestImageOnly = new UserUpdateRequest(null, "new-avatar.png");
        userServices.updateCurrentUser(authentication, updateRequestImageOnly);

        // Assert
        assertThat(user.getName()).isEqualTo("John Doe");
        assertThat(user.getImageUrl()).isEqualTo("new-avatar.png");

        verify(userRepository).save(user);
        verify(userMapper).toUserResponse(user);
//        verifyNoInteractions(userRepository);
    }

    @Test
    void should_ignore_null_fields() {
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(userMapper.toUserResponse(any(User.class)))
                .thenReturn(response);

        // Act
        UserUpdateRequest updateRequestNullFields = new UserUpdateRequest(null, null);
        userServices.updateCurrentUser(authentication, updateRequestNullFields);

        // Assert
        assertThat(user.getName()).isEqualTo("John Doe");
        assertThat(user.getImageUrl()).isEqualTo("avatar.png");

        verify(userRepository).save(user);
        verify(userMapper).toUserResponse(user);
//        verifyNoInteractions(userRepository);
    }
}