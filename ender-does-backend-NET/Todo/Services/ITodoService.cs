using ender_does_backend_NET.Todo.DTOs;

namespace ender_does_backend_NET.Todo.Services;

public interface ITodoService
{
    Task<TodoResponse?> GetTodoByIdAsync(Guid userId, Guid todoId);

    Task<List<TodoResponse>> GetAllTodosAsync(Guid userId);

    Task<TodoResponse> CreateTodoAsync(
        Guid userId,
        TodoRequest request);

    Task<TodoResponse?> UpdateTodoAsync(
        Guid userId,
        Guid todoId,
        TodoRequest request);

    Task<bool> CompleteTodoAsync(
        Guid userId,
        Guid todoId);

    Task<bool> ReopenTodoAsync(
        Guid userId,
        Guid todoId);

    Task<bool> DeleteTodoAsync(
        Guid userId,
        Guid todoId);
}