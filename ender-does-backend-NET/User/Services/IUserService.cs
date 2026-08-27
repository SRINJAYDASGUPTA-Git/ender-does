using System.Security.Claims;
using ender_does_backend_NET.User.DTOs;

namespace ender_does_backend_NET.User.Services;

public interface IUserService
{
    Task<UserResponse?> GetCurrentUserAsync(Guid userId);
    
    Task<UserResponse?> UpdateCurrentUserAsync(Guid userId, UserUpdateRequest  request);
}