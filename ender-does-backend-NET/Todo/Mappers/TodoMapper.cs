using ender_does_backend_NET.Todo.DTOs;
using ender_does_backend_NET.Todo.Models;

namespace ender_does_backend_NET.Todo.Mappers;

public static class TodoMapper
{
    public static TodoResponse ToResponse(Models.Todo todo)
    {
        return new TodoResponse(
            todo.Id,
            todo.Title,
            todo.Body,
            todo.IsDone,
            todo.CreatedAt,
            todo.CompletedAt
        );
    }
}