using ender_does_backend_NET.Todo.DTOs;

namespace ender_does_backend_NET.User.DTOs;

public record UserResponse(
    Guid Id,
    string Name,
    string Email,
    string? ImageUrl,
    bool AccountLocked,
    bool Enabled,
    List<TodoResponse>  Todos
    );