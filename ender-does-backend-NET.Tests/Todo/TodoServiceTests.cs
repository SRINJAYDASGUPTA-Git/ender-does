using ender_does_backend_NET.Todo.DTOs;
using ender_does_backend_NET.Todo.Services.impl;
using ender_does_backend_NET.Tests.Helpers;
using Microsoft.AspNetCore.Http;

namespace ender_does_backend_NET.Tests.Todo;

public class TodoServiceTests
{
    [Fact]
    public async Task CreateTodo_ShouldCreateTodo()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();
        var userId = Guid.NewGuid();

        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = userId,
            Name = "Test User",
            Email = "test@example.com",
            AccountLocked = false,
            Enabled = true
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var request = new TodoRequest(
                "Test Todo",
                "Test Body"
            );

            // Act
            var result = await service.CreateTodoAsync(userId, request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Todo", result.Title);
            Assert.Equal("Test Body", result.Body);
            Assert.False(result.IsDone);
            Assert.Null(result.CompletedAt);
            Assert.Equal(userId, context.Todos.Single().OwnerId);
        }
    }

    [Fact]
    public async Task CreateTodo_ShouldRejectNullTitle()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var request = new TodoRequest(
                null,
                "Valid body"
            );

            // Act & Assert
            var exception = await Assert.ThrowsAsync<BadHttpRequestException>(
                () => service.CreateTodoAsync(Guid.NewGuid(), request)
            );

            Assert.Equal(
                "Title and Body are required for creating a Todo",
                exception.Message
            );
        }
    }

    [Fact]
    public async Task CreateTodo_ShouldRejectNullBody()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var request = new TodoRequest(
                "Valid title",
                null
            );

            // Act & Assert
            await Assert.ThrowsAsync<BadHttpRequestException>(
                () => service.CreateTodoAsync(Guid.NewGuid(), request)
            );
        }
    }

    [Theory]
    [InlineData("", "Valid body")]
    [InlineData("   ", "Valid body")]
    [InlineData("Valid title", "")]
    [InlineData("Valid title", "   ")]
    public async Task CreateTodo_ShouldRejectBlankTitleOrBody(
        string title,
        string body)
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var request = new TodoRequest(title, body);

            // Act & Assert
            await Assert.ThrowsAsync<BadHttpRequestException>(
                () => service.CreateTodoAsync(Guid.NewGuid(), request)
            );
        }
    }

    [Fact]
    public async Task GetTodoById_ShouldReturnTodo_WhenUserOwnsTodo()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();

            var user = new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            };

            context.Users.Add(user);

            var todoId = Guid.NewGuid();

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Test Todo",
                Body = "Test Body",
                IsDone = false,
                CreatedAt = DateTime.UtcNow,
                CompletedAt = null,
                OwnerId = userId
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodoByIdAsync(userId, todoId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(todoId, result.Id);
            Assert.Equal("Test Todo", result.Title);
            Assert.Equal("Test Body", result.Body);
            Assert.False(result.IsDone);
            Assert.Null(result.CompletedAt);
        }
    }

    [Fact]
    public async Task GetTodoById_ShouldReturnNull_WhenUserDoesNotOwnTodo()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var ownerId = Guid.NewGuid();
            var otherUserId = Guid.NewGuid();

            context.Users.AddRange(
                new ender_does_backend_NET.User.Models.User
                {
                    Id = ownerId,
                    Name = "Owner",
                    Email = "owner@example.com",
                    AccountLocked = false,
                    Enabled = true
                },
                new ender_does_backend_NET.User.Models.User
                {
                    Id = otherUserId,
                    Name = "Other User",
                    Email = "other@example.com",
                    AccountLocked = false,
                    Enabled = true
                }
            );

            var todoId = Guid.NewGuid();

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Private Todo",
                Body = "Only the owner should see this",
                IsDone = false,
                CreatedAt = DateTime.UtcNow,
                OwnerId = ownerId
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodoByIdAsync(otherUserId, todoId);

            // Assert
            Assert.Null(result);
        }
    }

    [Fact]
    public async Task GetTodoById_ShouldReturnNull_WhenTodoDoesNotExist()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.GetTodoByIdAsync(
                userId,
                Guid.NewGuid()
            );

            // Assert
            Assert.Null(result);
        }
    }

    [Fact]
    public async Task GetAllTodos_ShouldReturnOnlyUsersTodos()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();
            var otherUserId = Guid.NewGuid();

            context.Users.AddRange(
                new ender_does_backend_NET.User.Models.User
                {
                    Id = userId,
                    Name = "Test User",
                    Email = "test@example.com",
                    AccountLocked = false,
                    Enabled = true
                },
                new ender_does_backend_NET.User.Models.User
                {
                    Id = otherUserId,
                    Name = "Other User",
                    Email = "other@example.com",
                    AccountLocked = false,
                    Enabled = true
                }
            );

            context.Todos.AddRange(
                new ender_does_backend_NET.Todo.Models.Todo
                {
                    Id = Guid.NewGuid(),
                    Title = "My Todo",
                    Body = "Belongs to me",
                    IsDone = false,
                    CreatedAt = DateTime.UtcNow,
                    OwnerId = userId
                },
                new ender_does_backend_NET.Todo.Models.Todo
                {
                    Id = Guid.NewGuid(),
                    Title = "Other Todo",
                    Body = "Belongs to someone else",
                    IsDone = false,
                    CreatedAt = DateTime.UtcNow,
                    OwnerId = otherUserId
                }
            );

            await context.SaveChangesAsync();

            // Act
            var result = await service.GetAllTodosAsync(userId);

            // Assert
            var todo = Assert.Single(result);

            Assert.Equal("My Todo", todo.Title);
            Assert.Equal("Belongs to me", todo.Body);
        }
    }

    [Fact]
    public async Task GetAllTodos_ShouldReturnTodosNewestFirst()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            var oldest = new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = Guid.NewGuid(),
                Title = "Oldest",
                Body = "First",
                IsDone = false,
                CreatedAt = new DateTime(2026, 8, 20),
                OwnerId = userId
            };

            var middle = new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = Guid.NewGuid(),
                Title = "Middle",
                Body = "Second",
                IsDone = false,
                CreatedAt = new DateTime(2026, 8, 25),
                OwnerId = userId
            };

            var newest = new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = Guid.NewGuid(),
                Title = "Newest",
                Body = "Third",
                IsDone = false,
                CreatedAt = new DateTime(2026, 8, 28),
                OwnerId = userId
            };

            context.Todos.AddRange(oldest, middle, newest);

            await context.SaveChangesAsync();

            // Act
            var result = await service.GetAllTodosAsync(userId);

            // Assert
            Assert.Equal(3, result.Count);

            Assert.Equal("Newest", result[0].Title);
            Assert.Equal("Middle", result[1].Title);
            Assert.Equal("Oldest", result[2].Title);
        }
    }

    [Fact]
    public async Task GetAllTodos_ShouldReturnEmptyList_WhenUserHasNoTodos()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.GetAllTodosAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }

    [Fact]
    public async Task CompleteTodo_ShouldMarkTodoAsDone()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            var todoId = Guid.NewGuid();

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Complete me",
                Body = "This should become done",
                IsDone = false,
                CreatedAt = DateTime.UtcNow,
                CompletedAt = null,
                OwnerId = userId
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.CompleteTodoAsync(userId, todoId);

            // Assert
            Assert.True(result);

            var todo = await context.Todos.FindAsync(todoId);

            Assert.NotNull(todo);
            Assert.True(todo.IsDone);
            Assert.NotNull(todo.CompletedAt);
        }
    }

    [Fact]
    public async Task CompleteTodo_ShouldReturnFalse_WhenTodoDoesNotExist()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.CompleteTodoAsync(
                userId,
                Guid.NewGuid()
            );

            // Assert
            Assert.False(result);
        }
    }

    [Fact]
    public async Task CompleteTodo_ShouldReturnFalse_WhenUserDoesNotOwnTodo()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var ownerId = Guid.NewGuid();
            var otherUserId = Guid.NewGuid();

            context.Users.AddRange(
                new ender_does_backend_NET.User.Models.User
                {
                    Id = ownerId,
                    Name = "Owner",
                    Email = "owner@example.com",
                    AccountLocked = false,
                    Enabled = true
                },
                new ender_does_backend_NET.User.Models.User
                {
                    Id = otherUserId,
                    Name = "Other User",
                    Email = "other@example.com",
                    AccountLocked = false,
                    Enabled = true
                }
            );

            var todoId = Guid.NewGuid();

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Private Todo",
                Body = "Do not complete me",
                IsDone = false,
                CreatedAt = DateTime.UtcNow,
                CompletedAt = null,
                OwnerId = ownerId
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.CompleteTodoAsync(
                otherUserId,
                todoId
            );

            // Assert
            Assert.False(result);

            var todo = await context.Todos.FindAsync(todoId);

            Assert.NotNull(todo);
            Assert.False(todo.IsDone);
            Assert.Null(todo.CompletedAt);
        }
    }

    [Fact]
    public async Task ReopenTodo_ShouldMarkTodoAsNotDone()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            var todoId = Guid.NewGuid();

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Reopen me",
                Body = "This was completed",
                IsDone = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                CompletedAt = DateTime.UtcNow,
                OwnerId = userId
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.ReopenTodoAsync(userId, todoId);

            // Assert
            Assert.True(result);

            var todo = await context.Todos.FindAsync(todoId);

            Assert.NotNull(todo);
            Assert.False(todo.IsDone);
            Assert.Null(todo.CompletedAt);
        }
    }

    [Fact]
    public async Task ReopenTodo_ShouldReturnFalse_WhenUserDoesNotOwnTodo()
    {
        // Arrange
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var ownerId = Guid.NewGuid();
            var otherUserId = Guid.NewGuid();

            context.Users.AddRange(
                new ender_does_backend_NET.User.Models.User
                {
                    Id = ownerId,
                    Name = "Owner",
                    Email = "owner@example.com",
                    AccountLocked = false,
                    Enabled = true
                },
                new ender_does_backend_NET.User.Models.User
                {
                    Id = otherUserId,
                    Name = "Other User",
                    Email = "other@example.com",
                    AccountLocked = false,
                    Enabled = true
                }
            );

            var todoId = Guid.NewGuid();

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Private Todo",
                Body = "Do not reopen me",
                IsDone = true,
                CreatedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow,
                OwnerId = ownerId
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.ReopenTodoAsync(
                otherUserId,
                todoId
            );

            // Assert
            Assert.False(result);

            var todo = await context.Todos.FindAsync(todoId);

            Assert.NotNull(todo);
            Assert.True(todo.IsDone);
            Assert.NotNull(todo.CompletedAt);
        }
    }

    [Fact]
    public async Task UpdateTodo_ShouldUpdateTitleAndBody()
    {
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();
            var todoId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Old title",
                Body = "Old body",
                IsDone = false,
                CreatedAt = DateTime.UtcNow,
                OwnerId = userId
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.UpdateTodoAsync(
                userId,
                todoId,
                new TodoRequest("New title", "New body")
            );

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New title", result.Title);
            Assert.Equal("New body", result.Body);

            var todo = await context.Todos.FindAsync(todoId);

            Assert.NotNull(todo);
            Assert.Equal("New title", todo.Title);
            Assert.Equal("New body", todo.Body);
        }
    }

    [Fact]
    public async Task UpdateTodo_ShouldUpdateOnlyProvidedFields()
    {
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();
            var todoId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Original title",
                Body = "Original body",
                IsDone = false,
                CreatedAt = DateTime.UtcNow,
                OwnerId = userId
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.UpdateTodoAsync(
                userId,
                todoId,
                new TodoRequest("Updated title", null)
            );

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated title", result.Title);
            Assert.Equal("Original body", result.Body);
        }
    }

    [Fact]
    public async Task UpdateTodo_ShouldReturnNull_WhenTodoDoesNotExist()
    {
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            await context.SaveChangesAsync();

            var result = await service.UpdateTodoAsync(
                userId,
                Guid.NewGuid(),
                new TodoRequest("Title", "Body")
            );

            Assert.Null(result);
        }
    }

    [Fact]
    public async Task UpdateTodo_ShouldReturnNull_WhenUserDoesNotOwnTodo()
    {
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var ownerId = Guid.NewGuid();
            var otherUserId = Guid.NewGuid();
            var todoId = Guid.NewGuid();

            context.Users.AddRange(
                new ender_does_backend_NET.User.Models.User
                {
                    Id = ownerId,
                    Name = "Owner",
                    Email = "owner@example.com",
                    AccountLocked = false,
                    Enabled = true
                },
                new ender_does_backend_NET.User.Models.User
                {
                    Id = otherUserId,
                    Name = "Other",
                    Email = "other@example.com",
                    AccountLocked = false,
                    Enabled = true
                }
            );

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Original",
                Body = "Original body",
                IsDone = false,
                CreatedAt = DateTime.UtcNow,
                OwnerId = ownerId
            });

            await context.SaveChangesAsync();

            var result = await service.UpdateTodoAsync(
                otherUserId,
                todoId,
                new TodoRequest("Hacked", "Hacked")
            );

            Assert.Null(result);

            var todo = await context.Todos.FindAsync(todoId);

            Assert.NotNull(todo);
            Assert.Equal("Original", todo.Title);
            Assert.Equal("Original body", todo.Body);
        }
    }

    [Fact]
    public async Task DeleteTodo_ShouldDeleteTodo()
    {
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();
            var todoId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Delete me",
                Body = "This should disappear",
                IsDone = false,
                CreatedAt = DateTime.UtcNow,
                OwnerId = userId
            });

            await context.SaveChangesAsync();

            // Act
            var result = await service.DeleteTodoAsync(userId, todoId);

            // Assert
            Assert.True(result);

            var todo = await context.Todos.FindAsync(todoId);

            Assert.Null(todo);
        }
    }

    [Fact]
    public async Task DeleteTodo_ShouldReturnFalse_WhenTodoDoesNotExist()
    {
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var userId = Guid.NewGuid();

            context.Users.Add(new ender_does_backend_NET.User.Models.User
            {
                Id = userId,
                Name = "Test User",
                Email = "test@example.com",
                AccountLocked = false,
                Enabled = true
            });

            await context.SaveChangesAsync();

            var result = await service.DeleteTodoAsync(
                userId,
                Guid.NewGuid()
            );

            Assert.False(result);
        }
    }

    [Fact]
    public async Task DeleteTodo_ShouldReturnFalse_WhenUserDoesNotOwnTodo()
    {
        var (context, connection) = TestDbContextFactory.Create();

        await using (context)
        await using (connection)
        {
            var service = new TodoService(context);

            var ownerId = Guid.NewGuid();
            var otherUserId = Guid.NewGuid();
            var todoId = Guid.NewGuid();

            context.Users.AddRange(
                new ender_does_backend_NET.User.Models.User
                {
                    Id = ownerId,
                    Name = "Owner",
                    Email = "owner@example.com",
                    AccountLocked = false,
                    Enabled = true
                },
                new ender_does_backend_NET.User.Models.User
                {
                    Id = otherUserId,
                    Name = "Other",
                    Email = "other@example.com",
                    AccountLocked = false,
                    Enabled = true
                }
            );

            context.Todos.Add(new ender_does_backend_NET.Todo.Models.Todo
            {
                Id = todoId,
                Title = "Protected Todo",
                Body = "Do not delete",
                IsDone = false,
                CreatedAt = DateTime.UtcNow,
                OwnerId = ownerId
            });

            await context.SaveChangesAsync();

            var result = await service.DeleteTodoAsync(
                otherUserId,
                todoId
            );

            Assert.False(result);

            var todo = await context.Todos.FindAsync(todoId);

            Assert.NotNull(todo);
            Assert.Equal("Protected Todo", todo.Title);
        }
    }


}