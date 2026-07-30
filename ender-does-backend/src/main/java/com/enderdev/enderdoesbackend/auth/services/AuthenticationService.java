package com.enderdev.enderdoesbackend.auth.services;

import com.enderdev.enderdoesbackend.auth.dto.AuthenticationRequest;
import com.enderdev.enderdoesbackend.auth.dto.AuthenticationResponse;
import com.enderdev.enderdoesbackend.exceptions.ExistingEmailConflictException;
import com.enderdev.enderdoesbackend.security.JWTService;
import com.enderdev.enderdoesbackend.user.models.User;
import com.enderdev.enderdoesbackend.user.repositories.RoleRepository;
import com.enderdev.enderdoesbackend.user.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JWTService jWTService;
    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationResponse login(AuthenticationRequest authenticationRequest) {
        userRepository.findByEmail(authenticationRequest.email())
                .orElseThrow(() -> new NoSuchElementException ("User not found"));
        return getAuthenticationResponse(authenticationRequest);
    }

    public AuthenticationResponse register(AuthenticationRequest authenticationRequest) throws BadRequestException {
        var userRole = roleRepository.findByName("USER")
                .orElseThrow (() -> new IllegalStateException ("ROLE USER was not initialized"));

        if (userRepository.existsByEmail(authenticationRequest.email())) {
            throw new ExistingEmailConflictException("Email already exists");
        }
        if (authenticationRequest.name() == null || authenticationRequest.email() == null || authenticationRequest.password() == null) {
            throw new BadRequestException("Name, email, and password must not be null");
        }
        User user = User.builder()
                .name(authenticationRequest.name())
                .email(authenticationRequest.email())
                .password(passwordEncoder.encode (authenticationRequest.password()))
                .imageUrl (authenticationRequest.imageUrl () == null ?
                        "https://avatar.vercel.sh/"+authenticationRequest.name ()+"?rounded=60" :
                        authenticationRequest.imageUrl ())
                .accountLocked (false)
                .enabled (true)
                .roles (List.of (userRole))
                .build();

        userRepository.save(user);
        return buildJwtResponse(user);
    }

    private AuthenticationResponse getAuthenticationResponse(AuthenticationRequest authenticationRequest) {
        var auth = authenticationManager.authenticate (
                new UsernamePasswordAuthenticationToken(
                        authenticationRequest.email (),
                        authenticationRequest.password ()
                )
        );
        var userVar = ((User) auth.getPrincipal ());
        return buildJwtResponse(userVar);
    }

    private AuthenticationResponse buildJwtResponse(User user){
        var claims = new HashMap<String, Object>();
        claims.put ("user_email", user.getUsername ());
        var jwtToken = jWTService.generateAccessToken (
                claims,
                user
        );

        var refreshToken = jWTService.generateRefreshToken (
                claims,
                user
        );

        return AuthenticationResponse.builder ()
                .access_token (jwtToken)
                .refresh_token (refreshToken)
                .build ();
    }

    @Transactional
    public AuthenticationResponse refreshToken(Authentication connectedUser) {
        User principal = (User) connectedUser.getPrincipal();
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        return buildJwtResponse(user);
    }
}