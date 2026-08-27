package com.enderdev.enderdoesbackend.user.services;

import com.enderdev.enderdoesbackend.exceptions.UnauthorizedAccessException;
import com.enderdev.enderdoesbackend.user.dto.UserResponse;
import com.enderdev.enderdoesbackend.user.dto.UserUpdateRequest;
import com.enderdev.enderdoesbackend.user.mappers.UserMapper;
import com.enderdev.enderdoesbackend.user.models.User;
import com.enderdev.enderdoesbackend.user.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServices {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public UserResponse getCurrentUser(Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        //        log.info(response.toString());
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateCurrentUser(Authentication connectedUser, UserUpdateRequest request) {
        User user = (User) connectedUser.getPrincipal();
        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.imageUrl() != null) {
            user.setImageUrl(request.imageUrl());
        }
        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

}
