namespace ender_does_backend_NET.Auth.DTOs;

public record LoginRequest(
    string Email,
    string Password
);