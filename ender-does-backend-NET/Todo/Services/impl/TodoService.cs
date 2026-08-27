using ender_does_backend_NET.Data;
using ender_does_backend_NET.Todo.DTOs;
using ender_does_backend_NET.Todo.Mappers;
using Microsoft.EntityFrameworkCore;

namespace ender_does_backend_NET.Todo.Services.impl;

public class TodoService(ApplicationDbContext context) : ITodoService
{
    public async Task<TodoResponse?> GetTodoByIdAsync(
        Guid userId,
        Guid todoId)
    {
        var todo = await context.Todos
            .FirstOrDefaultAsync(t =>
                t.Id == todoId &&
                t.OwnerId == userId);

        return todo is null
            ? null
            : TodoMapper.ToResponse(todo);
    }

    public async Task<List<TodoResponse>> GetAllTodosAsync(
        Guid userId)
    {
        var todos = await context.Todos
            .Where(t => t.OwnerId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return todos
            .Select(TodoMapper.ToResponse)
            .ToList();
    }

    public async Task<TodoResponse> CreateTodoAsync(
        Guid userId,
        TodoRequest request)
    {
        
        if (request.Body == null || request.Title == null || request.Body.Trim().Length == 0 || request.Title.Trim().Length == 0)
            throw new BadHttpRequestException("Title and Body are required for creating a Todo");
        var todo = new Models.Todo
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Body = request.Body,
            IsDone = false,
            CreatedAt = DateTime.UtcNow,
            CompletedAt = null,
            OwnerId = userId
        };

        context.Todos.Add(todo);

        await context.SaveChangesAsync();

        return TodoMapper.ToResponse(todo);
    }

    public async Task<TodoResponse?> UpdateTodoAsync(
        Guid userId,
        Guid todoId,
        TodoRequest request)
    {
        var todo = await context.Todos
            .FirstOrDefaultAsync(t =>
                t.Id == todoId &&
                t.OwnerId == userId);

        if (todo is null)
            return null;

        if (request.Title != null) todo.Title = request.Title;
        if (request.Body != null)todo.Body = request.Body;

        await context.SaveChangesAsync();

        return TodoMapper.ToResponse(todo);
    }

    public async Task<bool> CompleteTodoAsync(
        Guid userId,
        Guid todoId)
    {
        var todo = await context.Todos
            .FirstOrDefaultAsync(t =>
                t.Id == todoId &&
                t.OwnerId == userId);

        if (todo is null)
            return false;

        todo.IsDone = true;
        todo.CompletedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReopenTodoAsync(
        Guid userId,
        Guid todoId)
    {
        var todo = await context.Todos
            .FirstOrDefaultAsync(t =>
                t.Id == todoId &&
                t.OwnerId == userId);

        if (todo is null)
            return false;

        todo.IsDone = false;
        todo.CompletedAt = null;

        await context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteTodoAsync(
        Guid userId,
        Guid todoId)
    {
        var todo = await context.Todos
            .FirstOrDefaultAsync(t =>
                t.Id == todoId &&
                t.OwnerId == userId);

        if (todo is null)
            return false;

        context.Todos.Remove(todo);

        await context.SaveChangesAsync();

        return true;
    }
}