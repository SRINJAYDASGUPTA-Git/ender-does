namespace ender_does_backend_NET.Todo.DTOs;

public record TodoRequest(
    string? Title,
    string? Body
);