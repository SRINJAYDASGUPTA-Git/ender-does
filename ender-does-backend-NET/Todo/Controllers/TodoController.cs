using ender_does_backend_NET.Todo.DTOs;
using ender_does_backend_NET.Todo.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace ender_does_backend_NET.Todo.Controllers;

[ApiController]
[Route("api/v1/todo")]
[Authorize]
public class TodoController(ITodoService todoService) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TodoResponse>> GetTodo(Guid id)
    {
        var userId = AuthenticatedUserId;
        var todo = await todoService.GetTodoByIdAsync(userId, id);

        if (todo is null)
            return NotFound();

        return Ok(todo);
    }

    [HttpGet]
    public async Task<ActionResult<List<TodoResponse>>> GetAllTodos()
    {
        var userId = AuthenticatedUserId;
        var todos = await todoService.GetAllTodosAsync(userId);

        return Ok(todos);
    }

    [HttpPost]
    public async Task<ActionResult<TodoResponse>> CreateTodo(
        TodoRequest request)
    {
        var userId = AuthenticatedUserId;
        TodoResponse todo;
        try
        {
            todo = await todoService.CreateTodoAsync(userId, request);
        }
        catch (BadHttpRequestException badReq)
        {
            return BadRequest(badReq.Message);
        }
        catch (Exception e)
        {
            return Problem(e.Message);
        }
        

        return CreatedAtAction(
            nameof(GetTodo),
            new { id = todo.Id },
            todo
        );
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TodoResponse>> UpdateTodo(
        Guid id,
        TodoRequest request)
    {
        var userId = AuthenticatedUserId;
        var todo = await todoService.UpdateTodoAsync(userId, id, request);

        if (todo is null)
            return NotFound();

        return Ok(todo);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> CompleteTodo(Guid id)
    {
        var userId = AuthenticatedUserId;
        var success = await todoService.CompleteTodoAsync(userId, id);

        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id:guid}/reopen")]
    public async Task<IActionResult> ReopenTodo(Guid id)
    {
        var userId = AuthenticatedUserId;
        var success = await todoService.ReopenTodoAsync(userId, id);

        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTodo(Guid id)
    {
        var userId = AuthenticatedUserId;
        var success = await todoService.DeleteTodoAsync(userId, id);

        if (!success)
            return NotFound();

        return NoContent();
    }
    
    private Guid AuthenticatedUserId =>
        Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );
}