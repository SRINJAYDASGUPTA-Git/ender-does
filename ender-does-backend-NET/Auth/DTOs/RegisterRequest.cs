namespace ender_does_backend_NET.Auth.DTOs;

public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    string? ImageUrl
);