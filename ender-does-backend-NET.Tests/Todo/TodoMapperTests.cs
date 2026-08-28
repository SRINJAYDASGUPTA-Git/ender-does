using ender_does_backend_NET.Todo.Mappers;

using Xunit;

namespace ender_does_backend_NET.Tests.Todo;

public class TodoMapperTests
{
    [Fact]
    public void ToResponse_ShouldMapTodoCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var createdAt = new DateTime(2026, 8, 28, 12, 0, 0);
        var completedAt = new DateTime(2026, 8, 28, 12, 30, 0);

        var todo = new ender_does_backend_NET.Todo.Models.Todo
        {
            Id = id,
            Title = "Learn xUnit",
            Body = "Write tests for Ender Does",
            IsDone = true,
            CreatedAt = createdAt,
            CompletedAt = completedAt,
            OwnerId = ownerId
        };

        // Act
        var response = TodoMapper.ToResponse(todo);

        // Assert
        Assert.Equal(id, response.Id);
        Assert.Equal("Learn xUnit", response.Title);
        Assert.Equal("Write tests for Ender Does", response.Body);
        Assert.True(response.IsDone);
        Assert.Equal(createdAt, response.CreatedAt);
        Assert.Equal(completedAt, response.CompletedAt);
    }
    [Fact]
    public void ToResponse_ShouldKeepCompletedAtNull_WhenTodoIsNotDone()
    {
        // Arrange
        var todo = new ender_does_backend_NET.Todo.Models.Todo
        {
            Id = Guid.NewGuid(),
            Title = "Incomplete todo",
            Body = "This isn't finished",
            IsDone = false,
            CreatedAt = DateTime.UtcNow,
            CompletedAt = null,
            OwnerId = Guid.NewGuid()
        };

        // Act
        var response = TodoMapper.ToResponse(todo);

        // Assert
        Assert.False(response.IsDone);
        Assert.Null(response.CompletedAt);
    }
}