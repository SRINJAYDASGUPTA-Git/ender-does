using ender_does_backend_NET.User.DTOs;

namespace ender_does_backend_NET.Auth.DTOs;

public record AuthResponse(
    string Token,
    UserResponse User
);