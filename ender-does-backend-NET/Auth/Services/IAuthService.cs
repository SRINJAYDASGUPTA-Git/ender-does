using ender_does_backend_NET.Auth.DTOs;

namespace ender_does_backend_NET.Auth.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);

    Task<AuthResponse?> LoginAsync(LoginRequest request);
}