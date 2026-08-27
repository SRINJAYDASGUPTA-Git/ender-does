namespace ender_does_backend_NET.Todo.DTOs;

public record TodoResponse(
    Guid Id,
    string Title,
    string Body,
    bool IsDone,
    DateTime CreatedAt,
    DateTime? CompletedAt
);