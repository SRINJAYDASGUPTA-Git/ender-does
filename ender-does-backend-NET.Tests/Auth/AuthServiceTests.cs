using ender_does_backend_NET.Auth.DTOs;
using ender_does_backend_NET.Auth.Security;
using ender_does_backend_NET.Auth.Services.impl;
using ender_does_backend_NET.Data;
using ender_does_backend_NET.User.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;

namespace ender_does_backend_NET.Tests.Auth;

public class AuthServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly ApplicationDbContext _context;
    private readonly Mock<IJwtService> _jwtService;
    private readonly IPasswordHasher<ender_does_backend_NET.User.Models.User> _passwordHasher;
    private readonly AuthService _authService;

    private static readonly JwtOptions JwtOptions = new()
    {
        Key = "test-secret-key-that-is-long-enough-for-jwt",
        Issuer = "test",
        Audience = "test",
        ExpirationMinutes = 60
    };

    public AuthServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new ApplicationDbContext(options);

        _context.Database.EnsureCreated();

        _jwtService = new Mock<IJwtService>();

        _passwordHasher = new PasswordHasher<ender_does_backend_NET.User.Models.User>();

        _authService = new AuthService(
            _context,
            _passwordHasher,
            _jwtService.Object
        );
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task Register_ShouldCreateUser_WhenEmailIsAvailable()
    {
        // Arrange
        var request = new RegisterRequest(
            "Srinjay",
            "srinjay@test.com",
            "password123",
            null
        );

        _jwtService
            .Setup(j => j.GenerateToken(It.IsAny<ender_does_backend_NET.User.Models.User>()))
            .Returns("test-jwt-token");

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(result);

        Assert.Equal("test-jwt-token", result.Token);

        Assert.Equal("Srinjay", result.User.Name);
        Assert.Equal("srinjay@test.com", result.User.Email);
        Assert.False(result.User.AccountLocked);
        Assert.True(result.User.Enabled);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == "srinjay@test.com");

        Assert.NotNull(user);

        Assert.Equal("Srinjay", user.Name);
        Assert.NotEqual("password123", user.PasswordHash);

        _jwtService.Verify(
            j => j.GenerateToken(It.Is<ender_does_backend_NET.User.Models.User>(u =>
                u.Email == "srinjay@test.com" &&
                u.Name == "Srinjay"
            )),
            Times.Once
        );
    }

    [Fact]
    public async Task Register_ShouldThrowConflict_WhenEmailAlreadyExists()
    {
        // Arrange
        var existingUser = new ender_does_backend_NET.User.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Existing User",
            Email = "srinjay@test.com",
            PasswordHash = "already-hashed",
            AccountLocked = false,
            Enabled = true
        };

        _context.Users.Add(existingUser);
        await _context.SaveChangesAsync();

        var request = new RegisterRequest(
            "Srinjay",
            "srinjay@test.com",
            "password123",
            null
        );

        // Act
        var exception = await Assert.ThrowsAsync<
            ender_does_backend_NET.Exceptions.ApplicationException
        >(
            () => _authService.RegisterAsync(request)
        );

        // Assert
        Assert.Equal(
            "A user with this email already exists.",
            exception.Message
        );

        Assert.Equal(
            StatusCodes.Status409Conflict,
            exception.StatusCode
        );
    }

    [Fact]
    public async Task Login_ShouldReturnAuthResponse_WhenCredentialsAreValid()
    {
        // Arrange
        var password = "password123";

        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Srinjay",
            Email = "srinjay@test.com",
            AccountLocked = false,
            Enabled = true
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            password
        );

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _jwtService
            .Setup(j => j.GenerateToken(It.IsAny<ender_does_backend_NET.User.Models.User>()))
            .Returns("test-jwt-token");

        var request = new LoginRequest(
            "srinjay@test.com",
            password
        );

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);

        Assert.Equal("test-jwt-token", result.Token);
        Assert.Equal(user.Id, result.User.Id);
        Assert.Equal("Srinjay", result.User.Name);
        Assert.Equal("srinjay@test.com", result.User.Email);

        _jwtService.Verify(
            j => j.GenerateToken(It.Is<ender_does_backend_NET.User.Models.User>(u =>
                u.Id == user.Id
            )),
            Times.Once
        );
    }

    [Fact]
    public async Task Login_ShouldReturnNull_WhenUserDoesNotExist()
    {
        // Arrange
        var request = new LoginRequest(
            "doesnotexist@test.com",
            "password123"
        );

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.Null(result);

        _jwtService.Verify(
            j => j.GenerateToken(It.IsAny<ender_does_backend_NET.User.Models.User>()),
            Times.Never
        );
    }

    [Fact]
    public async Task Login_ShouldReturnNull_WhenPasswordIsIncorrect()
    {
        // Arrange
        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Srinjay",
            Email = "srinjay@test.com",
            AccountLocked = false,
            Enabled = true
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            "correct-password"
        );

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new LoginRequest(
            "srinjay@test.com",
            "wrong-password"
        );

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.Null(result);

        _jwtService.Verify(
            j => j.GenerateToken(It.IsAny<ender_does_backend_NET.User.Models.User>()),
            Times.Never
        );
    }

    [Fact]
    public async Task Login_ShouldReturnNull_WhenUserIsDisabled()
    {
        // Arrange
        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Disabled User",
            Email = "disabled@test.com",
            AccountLocked = false,
            Enabled = false
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            "password123"
        );

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new LoginRequest(
            "disabled@test.com",
            "password123"
        );

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.Null(result);

        _jwtService.Verify(
            j => j.GenerateToken(It.IsAny<ender_does_backend_NET.User.Models.User>()),
            Times.Never
        );
    }

    [Fact]
    public async Task Login_ShouldReturnNull_WhenUserIsLocked()
    {
        // Arrange
        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Locked User",
            Email = "locked@test.com",
            AccountLocked = true,
            Enabled = true
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            "password123"
        );

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var request = new LoginRequest(
            "locked@test.com",
            "password123"
        );

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.Null(result);

        _jwtService.Verify(
            j => j.GenerateToken(It.IsAny<ender_does_backend_NET.User.Models.User>()),
            Times.Never
        );
    }


}