using ender_does_backend_NET.Data;
using ender_does_backend_NET.User.DTOs;
using ender_does_backend_NET.User.Services.impl;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace ender_does_backend_NET.Tests.User;

public class UserServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly ApplicationDbContext _context;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new ApplicationDbContext(options);

        _context.Database.EnsureCreated();

        var passwordHasher = new PasswordHasher<ender_does_backend_NET.User.Models.User>();

        _userService = new UserService(
            _context,
            passwordHasher
        );
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }
    [Fact]
    public async Task GetCurrentUser_ShouldReturnUserWithTodos_WhenUserExists()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = userId,
            Name = "Srinjay",
            Email = "srinjay@test.com",
            ImageUrl = null,
            AccountLocked = false,
            Enabled = true,
            PasswordHash = "hashed-password"
        };

        var todo = new ender_does_backend_NET.Todo.Models.Todo
        {
            Id = Guid.NewGuid(),
            Title = "Test Todo",
            Body = "Testing UserService",
            IsDone = false,
            CreatedAt = DateTime.UtcNow,
            OwnerId = userId
        };

        user.Todos.Add(todo);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        var result = await _userService.GetCurrentUserAsync(userId);

        // Assert
        Assert.NotNull(result);

        Assert.Equal(userId, result.Id);
        Assert.Equal("Srinjay", result.Name);
        Assert.Equal("srinjay@test.com", result.Email);

        Assert.Single(result.Todos);

        Assert.Equal(todo.Id, result.Todos[0].Id);
        Assert.Equal("Test Todo", result.Todos[0].Title);
        Assert.Equal("Testing UserService", result.Todos[0].Body);
    }

    [Fact]
    public async Task GetCurrentUser_ShouldReturnNull_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var result = await _userService.GetCurrentUserAsync(userId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateCurrentUser_ShouldUpdateNameAndImage_WhenUserExists()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = userId,
            Name = "Old Name",
            Email = "srinjay@test.com",
            ImageUrl = "old-image.jpg",
            AccountLocked = false,
            Enabled = true,
            PasswordHash = "hashed-password"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new UserUpdateRequest(
            "New Name",
            "new-image.jpg"
        );

        // Act
        var result =
            await _userService.UpdateCurrentUserAsync(
                userId,
                request
            );

        // Assert
        Assert.NotNull(result);

        Assert.Equal("New Name", result.Name);
        Assert.Equal("new-image.jpg", result.ImageUrl);

        var updatedUser = await _context.Users
            .FirstAsync(u => u.Id == userId);

        Assert.Equal("New Name", updatedUser.Name);
        Assert.Equal("new-image.jpg", updatedUser.ImageUrl);
    }

    [Fact]
    public async Task UpdateCurrentUser_ShouldUpdateOnlyName_WhenImageUrlIsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = userId,
            Name = "Old Name",
            Email = "srinjay@test.com",
            ImageUrl = "old-image.jpg",
            AccountLocked = false,
            Enabled = true,
            PasswordHash = "hashed-password"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new UserUpdateRequest(
            "New Name",
            null
        );

        // Act
        var result =
            await _userService.UpdateCurrentUserAsync(
                userId,
                request
            );

        // Assert
        Assert.NotNull(result);

        Assert.Equal("New Name", result.Name);
        Assert.Equal("old-image.jpg", result.ImageUrl);
    }

    [Fact]
    public async Task UpdateCurrentUser_ShouldReturnNull_WhenUserDoesNotExist()
    {
        // Arrange
        var request = new UserUpdateRequest(
            "New Name",
            "new-image.jpg"
        );

        // Act
        var result =
            await _userService.UpdateCurrentUserAsync(
                Guid.NewGuid(),
                request
            );

        // Assert
        Assert.Null(result);
    }


}