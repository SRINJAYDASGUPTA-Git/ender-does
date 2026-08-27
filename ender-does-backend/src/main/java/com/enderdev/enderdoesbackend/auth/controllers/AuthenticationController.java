package com.enderdev.enderdoesbackend.auth.controllers;

import com.enderdev.enderdoesbackend.auth.dto.AuthenticationRequest;
import com.enderdev.enderdoesbackend.auth.dto.AuthenticationResponse;
import com.enderdev.enderdoesbackend.auth.services.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag (name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    @Operation(
            summary = "User Login",
            description = "Allows a user to log in with their credentials and receive an authentication token."
    )
    public ResponseEntity<AuthenticationResponse> login(
            @RequestBody AuthenticationRequest request
    ){
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/register")
    @Operation(
            summary = "User Registration",
            description = "Allows a new user to register with their name, email, and password. Returns an authentication token upon successful registration.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "201",
                            description = "User registered successfully"
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "400",
                            description = "Bad Request - Invalid input data"
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "409",
                            description = "Conflict - Email already exists"
                    )
            }
    )
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody AuthenticationRequest request
    ) throws BadRequestException {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @GetMapping("/refresh")
    @Operation(
            summary = "Refresh Token",
            description = "Refreshes the authentication token for the user. This is useful for maintaining user sessions without requiring re-login."
    )
    public ResponseEntity<AuthenticationResponse> refreshToken(
            Authentication connectedUser
    ) {
        return ResponseEntity.ok(authenticationService.refreshToken(connectedUser));
    }
}