using ender_does_backend_NET.Auth.Controllers;
using ender_does_backend_NET.Auth.DTOs;
using ender_does_backend_NET.Auth.Services;
using ender_does_backend_NET.Todo.DTOs;
using ender_does_backend_NET.User.DTOs;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace ender_does_backend_NET.Tests.Auth;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authService = new Mock<IAuthService>();
        _controller = new AuthController(_authService.Object);
    }

    [Fact]
    public async Task Register_ShouldReturnCreated_WhenRegistrationSucceeds()
    {
        // Arrange
        var request = new RegisterRequest(
            "Srinjay",
            "srinjay@test.com",
            "password123",
            null
        );

        var user = new UserResponse(
            Guid.NewGuid(),
            "Srinjay",
            "srinjay@test.com",
            null,
            false,
            true,
            new List<TodoResponse>()
        );

        var expectedResponse = new AuthResponse(
            "test-jwt-token",
            user
        );

        _authService
            .Setup(s => s.RegisterAsync(request))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var created =
            Assert.IsType<CreatedResult>(result.Result);

        Assert.Equal(201, created.StatusCode);
        Assert.Equal("", created.Location);

        var response =
            Assert.IsType<AuthResponse>(created.Value);

        Assert.Equal("test-jwt-token", response.Token);
        Assert.Equal("Srinjay", response.User.Name);

        _authService.Verify(
            s => s.RegisterAsync(request),
            Times.Once
        );
    }

    [Fact]
    public async Task Register_ShouldPropagateException_WhenServiceFails()
    {
        // Arrange
        var request = new RegisterRequest(
            "Srinjay",
            "srinjay@test.com",
            "password123",
            null
        );

        var exception =
            new ender_does_backend_NET.Exceptions.ApplicationException(
                "A user with this email already exists.",
                409
            );

        _authService
            .Setup(s => s.RegisterAsync(request))
            .ThrowsAsync(exception);

        // Act
        var thrown = await Assert.ThrowsAsync<
            ender_does_backend_NET.Exceptions.ApplicationException
        >(
            () => _controller.Register(request)
        );

        // Assert
        Assert.Equal(
            "A user with this email already exists.",
            thrown.Message
        );

        Assert.Equal(409, thrown.StatusCode);
    }

    [Fact]
    public async Task Login_ShouldReturnOk_WhenCredentialsAreValid()
    {
        // Arrange
        var request = new LoginRequest(
            "srinjay@test.com",
            "password123"
        );

        var user = new UserResponse(
            Guid.NewGuid(),
            "Srinjay",
            "srinjay@test.com",
            null,
            false,
            true,
            new List<TodoResponse>()
        );

        var expectedResponse = new AuthResponse(
            "test-jwt-token",
            user
        );

        _authService
            .Setup(s => s.LoginAsync(request))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var ok =
            Assert.IsType<OkObjectResult>(result.Result);

        var response =
            Assert.IsType<AuthResponse>(ok.Value);

        Assert.Equal("test-jwt-token", response.Token);
        Assert.Equal(
            "srinjay@test.com",
            response.User.Email
        );

        _authService.Verify(
            s => s.LoginAsync(request),
            Times.Once
        );
    }

    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenCredentialsAreInvalid()
    {
        // Arrange
        var request = new LoginRequest(
            "srinjay@test.com",
            "wrong-password"
        );

        _authService
            .Setup(s => s.LoginAsync(request))
            .ReturnsAsync((AuthResponse?)null);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var unauthorized =
            Assert.IsType<UnauthorizedObjectResult>(
                result.Result
            );

        Assert.Equal(401, unauthorized.StatusCode);

        _authService.Verify(
            s => s.LoginAsync(request),
            Times.Once
        );
    }
}