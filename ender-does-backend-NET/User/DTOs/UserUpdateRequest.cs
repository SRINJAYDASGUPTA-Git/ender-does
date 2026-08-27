namespace ender_does_backend_NET.User.DTOs;

public record UserUpdateRequest(
    string? Name,
    string? ImageUrl
    );