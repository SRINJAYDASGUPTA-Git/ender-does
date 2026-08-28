using System.Security.Claims;
using ender_does_backend_NET.Todo.Controllers;
using ender_does_backend_NET.Todo.DTOs;
using ender_does_backend_NET.Todo.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace ender_does_backend_NET.Tests.Todo;

public class TodoControllerTests
{
    private static readonly Guid UserId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");

    private static readonly Guid TodoId =
        Guid.Parse("22222222-2222-2222-2222-222222222222");

    private static TodoController CreateController(
        Mock<ITodoService> service)
    {
        var controller = new TodoController(service.Object);

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                UserId.ToString()
            )
        };

        var identity = new ClaimsIdentity(
            claims,
            authenticationType: "TestAuth"
        );

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };

        return controller;
    }

    [Fact]
    public async Task GetTodo_ShouldReturnOk_WhenTodoExists()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        var expectedTodo = new TodoResponse(
            TodoId,
            "Test Todo",
            "Test Body",
            false,
            DateTime.UtcNow,
            null
        );

        service
            .Setup(s => s.GetTodoByIdAsync(UserId, TodoId))
            .ReturnsAsync(expectedTodo);

        var controller = CreateController(service);

        // Act
        var result = await controller.GetTodo(TodoId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);

        var response = Assert.IsType<TodoResponse>(okResult.Value);

        Assert.Equal(TodoId, response.Id);
        Assert.Equal("Test Todo", response.Title);
        Assert.Equal("Test Body", response.Body);
    }

    [Fact]
    public async Task GetTodo_ShouldPassAuthenticatedUserIdToService()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.GetTodoByIdAsync(UserId, TodoId))
            .ReturnsAsync(
                new TodoResponse(
                    TodoId,
                    "Test Todo",
                    "Test Body",
                    false,
                    DateTime.UtcNow,
                    null
                )
            );

        var controller = CreateController(service);

        // Act
        await controller.GetTodo(TodoId);

        // Assert
        service.Verify(
            s => s.GetTodoByIdAsync(UserId, TodoId),
            Times.Once
        );
    }

    [Fact]
    public async Task GetTodo_ShouldReturnNotFound_WhenTodoDoesNotExist()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.GetTodoByIdAsync(UserId, TodoId))
            .ReturnsAsync((TodoResponse?)null);

        var controller = CreateController(service);

        // Act
        var result = await controller.GetTodo(TodoId);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetAllTodos_ShouldReturnOk_WithTodos()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        var todos = new List<TodoResponse>
        {
            new(
                Guid.NewGuid(),
                "Todo 1",
                "Body 1",
                false,
                DateTime.UtcNow,
                null
            ),
            new(
                Guid.NewGuid(),
                "Todo 2",
                "Body 2",
                true,
                DateTime.UtcNow.AddMinutes(-10),
                DateTime.UtcNow
            )
        };

        service
            .Setup(s => s.GetAllTodosAsync(UserId))
            .ReturnsAsync(todos);

        var controller = CreateController(service);

        // Act
        var result = await controller.GetAllTodos();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);

        var response = Assert.IsType<List<TodoResponse>>(okResult.Value);

        Assert.Equal(2, response.Count);
        Assert.Equal("Todo 1", response[0].Title);
        Assert.Equal("Todo 2", response[1].Title);
    }

    [Fact]
    public async Task GetAllTodos_ShouldUseAuthenticatedUserId()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.GetAllTodosAsync(UserId))
            .ReturnsAsync(new List<TodoResponse>());

        var controller = CreateController(service);

        // Act
        await controller.GetAllTodos();

        // Assert
        service.Verify(
            s => s.GetAllTodosAsync(UserId),
            Times.Once
        );
    }

    [Fact]
    public async Task GetAllTodos_ShouldReturnOk_WhenUserHasNoTodos()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.GetAllTodosAsync(UserId))
            .ReturnsAsync(new List<TodoResponse>());

        var controller = CreateController(service);

        // Act
        var result = await controller.GetAllTodos();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);

        var response = Assert.IsType<List<TodoResponse>>(okResult.Value);

        Assert.Empty(response);
    }

    [Fact]
    public async Task CreateTodo_ShouldReturnCreated_WhenTodoIsCreated()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        var request = new TodoRequest(
            "New Todo",
            "New Body"
        );

        var createdTodo = new TodoResponse(
            TodoId,
            "New Todo",
            "New Body",
            false,
            DateTime.UtcNow,
            null
        );

        service
            .Setup(s => s.CreateTodoAsync(UserId, request))
            .ReturnsAsync(createdTodo);

        var controller = CreateController(service);

        // Act
        var result = await controller.CreateTodo(request);

        // Assert
        var createdResult =
            Assert.IsType<CreatedAtActionResult>(result.Result);

        Assert.Equal(
            nameof(TodoController.GetTodo),
            createdResult.ActionName
        );

        Assert.Equal(
            TodoId,
            createdResult.RouteValues!["id"]
        );

        var response =
            Assert.IsType<TodoResponse>(createdResult.Value);

        Assert.Equal(TodoId, response.Id);
        Assert.Equal("New Todo", response.Title);
        Assert.Equal("New Body", response.Body);
    }

    [Fact]
    public async Task CreateTodo_ShouldUseAuthenticatedUserId()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        var request = new TodoRequest(
            "New Todo",
            "Body"
        );

        var todo = new TodoResponse(
            TodoId,
            "New Todo",
            "Body",
            false,
            DateTime.UtcNow,
            null
        );

        service
            .Setup(s => s.CreateTodoAsync(UserId, request))
            .ReturnsAsync(todo);

        var controller = CreateController(service);

        // Act
        await controller.CreateTodo(request);

        // Assert
        service.Verify(
            s => s.CreateTodoAsync(UserId, request),
            Times.Once
        );
    }

    [Fact]
    public async Task CreateTodo_ShouldReturnBadRequest_WhenRequestIsInvalid()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        var request = new TodoRequest(
            null,
            null
        );

        service
            .Setup(s => s.CreateTodoAsync(UserId, request))
            .ThrowsAsync(
                new BadHttpRequestException(
                    "Title and Body are required for creating a Todo"
                )
            );

        var controller = CreateController(service);

        // Act
        var result = await controller.CreateTodo(request);

        // Assert
        var badRequest =
            Assert.IsType<BadRequestObjectResult>(result.Result);

        Assert.Equal(
            "Title and Body are required for creating a Todo",
            badRequest.Value
        );
    }

    [Fact]
    public async Task CreateTodo_ShouldReturnProblem_WhenUnexpectedExceptionOccurs()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        var request = new TodoRequest(
            "Todo",
            "Body"
        );

        service
            .Setup(s => s.CreateTodoAsync(UserId, request))
            .ThrowsAsync(
                new Exception("Something went horribly wrong")
            );

        var controller = CreateController(service);

        // Act
        var result = await controller.CreateTodo(request);

        // Assert
        var problem =
            Assert.IsType<ObjectResult>(result.Result);

        Assert.Equal(500, problem.StatusCode);

        var details =
            Assert.IsType<ProblemDetails>(problem.Value);

        Assert.Equal(
            "Something went horribly wrong",
            details.Detail
        );
    }

    [Fact]
    public async Task UpdateTodo_ShouldReturnOk_WhenTodoExists()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        var request = new TodoRequest(
            "Updated Todo",
            "Updated Body"
        );

        var updatedTodo = new TodoResponse(
            TodoId,
            "Updated Todo",
            "Updated Body",
            false,
            DateTime.UtcNow,
            null
        );

        service
            .Setup(s => s.UpdateTodoAsync(UserId, TodoId, request))
            .ReturnsAsync(updatedTodo);

        var controller = CreateController(service);

        // Act
        var result = await controller.UpdateTodo(TodoId, request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);

        var response = Assert.IsType<TodoResponse>(okResult.Value);

        Assert.Equal(TodoId, response.Id);
        Assert.Equal("Updated Todo", response.Title);
        Assert.Equal("Updated Body", response.Body);
    }

    [Fact]
    public async Task UpdateTodo_ShouldReturnNotFound_WhenTodoDoesNotExist()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        var request = new TodoRequest(
            "Updated Todo",
            "Updated Body"
        );

        service
            .Setup(s => s.UpdateTodoAsync(UserId, TodoId, request))
            .ReturnsAsync((TodoResponse?)null);

        var controller = CreateController(service);

        // Act
        var result = await controller.UpdateTodo(TodoId, request);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task UpdateTodo_ShouldUseAuthenticatedUserId()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        var request = new TodoRequest(
            "Updated Todo",
            "Updated Body"
        );

        var todo = new TodoResponse(
            TodoId,
            "Updated Todo",
            "Updated Body",
            false,
            DateTime.UtcNow,
            null
        );

        service
            .Setup(s => s.UpdateTodoAsync(UserId, TodoId, request))
            .ReturnsAsync(todo);

        var controller = CreateController(service);

        // Act
        await controller.UpdateTodo(TodoId, request);

        // Assert
        service.Verify(
            s => s.UpdateTodoAsync(UserId, TodoId, request),
            Times.Once
        );
    }

    [Fact]
    public async Task CompleteTodo_ShouldReturnNoContent_WhenTodoExists()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.CompleteTodoAsync(UserId, TodoId))
            .ReturnsAsync(true);

        var controller = CreateController(service);

        // Act
        var result = await controller.CompleteTodo(TodoId);

        // Assert
        Assert.IsType<NoContentResult>(result);

        service.Verify(
            s => s.CompleteTodoAsync(UserId, TodoId),
            Times.Once
        );
    }

    [Fact]
    public async Task CompleteTodo_ShouldReturnNotFound_WhenTodoDoesNotExist()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.CompleteTodoAsync(UserId, TodoId))
            .ReturnsAsync(false);

        var controller = CreateController(service);

        // Act
        var result = await controller.CompleteTodo(TodoId);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task ReopenTodo_ShouldReturnNoContent_WhenTodoExists()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.ReopenTodoAsync(UserId, TodoId))
            .ReturnsAsync(true);

        var controller = CreateController(service);

        // Act
        var result = await controller.ReopenTodo(TodoId);

        // Assert
        Assert.IsType<NoContentResult>(result);

        service.Verify(
            s => s.ReopenTodoAsync(UserId, TodoId),
            Times.Once
        );
    }

    [Fact]
    public async Task ReopenTodo_ShouldReturnNotFound_WhenTodoDoesNotExist()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.ReopenTodoAsync(UserId, TodoId))
            .ReturnsAsync(false);

        var controller = CreateController(service);

        // Act
        var result = await controller.ReopenTodo(TodoId);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteTodo_ShouldReturnNoContent_WhenTodoExists()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.DeleteTodoAsync(UserId, TodoId))
            .ReturnsAsync(true);

        var controller = CreateController(service);

        // Act
        var result = await controller.DeleteTodo(TodoId);

        // Assert
        Assert.IsType<NoContentResult>(result);

        service.Verify(
            s => s.DeleteTodoAsync(UserId, TodoId),
            Times.Once
        );
    }

    [Fact]
    public async Task DeleteTodo_ShouldReturnNotFound_WhenTodoDoesNotExist()
    {
        // Arrange
        var service = new Mock<ITodoService>();

        service
            .Setup(s => s.DeleteTodoAsync(UserId, TodoId))
            .ReturnsAsync(false);

        var controller = CreateController(service);

        // Act
        var result = await controller.DeleteTodo(TodoId);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }


}