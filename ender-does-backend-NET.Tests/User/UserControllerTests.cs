using System.Security.Claims;
using ender_does_backend_NET.Todo.DTOs;
using ender_does_backend_NET.User.Controllers;
using ender_does_backend_NET.User.DTOs;
using ender_does_backend_NET.User.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace ender_does_backend_NET.Tests.User;

public class UserControllerTests
{
    private readonly Mock<IUserService> _userService;
    private readonly UserController _controller;

    public UserControllerTests()
    {
        _userService = new Mock<IUserService>();
        _controller = new UserController(_userService.Object);
    }

    private void Authenticate(Guid userId)
    {
        var claims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                userId.ToString()
            )
        };

        var identity = new ClaimsIdentity(
            claims,
            "TestAuthentication"
        );

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };
    }

    [Fact]
    public async Task GetMe_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var userId = Guid.NewGuid();

        Authenticate(userId);

        var expectedUser = new UserResponse(
            userId,
            "Srinjay",
            "srinjay@test.com",
            null,
            false,
            true,
            new List<TodoResponse>()
        );

        _userService
            .Setup(s => s.GetCurrentUserAsync(userId))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _controller.GetMe();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(
            result.Result
        );

        var response = Assert.IsType<UserResponse>(
            ok.Value
        );

        Assert.Equal(userId, response.Id);
        Assert.Equal("Srinjay", response.Name);
        Assert.Equal("srinjay@test.com", response.Email);

        _userService.Verify(
            s => s.GetCurrentUserAsync(userId),
            Times.Once
        );
    }
    [Fact]
    public async Task GetMe_ShouldReturnOkWithNull_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();

        Authenticate(userId);

        _userService
            .Setup(s => s.GetCurrentUserAsync(userId))
            .ReturnsAsync((UserResponse?)null);

        // Act
        var result = await _controller.GetMe();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(
            result.Result
        );

        Assert.Null(ok.Value);

        _userService.Verify(
            s => s.GetCurrentUserAsync(userId),
            Times.Once
        );
    }

    [Fact]
    public async Task UpdateMe_ShouldReturnUpdatedUser()
    {
        // Arrange
        var userId = Guid.NewGuid();

        Authenticate(userId);

        var request = new UserUpdateRequest(
            "New Name",
            "new-image.jpg"
        );

        var expectedUser = new UserResponse(
            userId,
            "New Name",
            "srinjay@test.com",
            "new-image.jpg",
            false,
            true,
            new List<TodoResponse>()
        );

        _userService
            .Setup(s =>
                s.UpdateCurrentUserAsync(userId, request)
            )
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _controller.UpdateMe(request);

        // Assert
        var ok = Assert.IsType<OkObjectResult>(
            result.Result
        );

        var response = Assert.IsType<UserResponse>(
            ok.Value
        );

        Assert.Equal(userId, response.Id);
        Assert.Equal("New Name", response.Name);
        Assert.Equal("new-image.jpg", response.ImageUrl);

        _userService.Verify(
            s => s.UpdateCurrentUserAsync(userId, request),
            Times.Once
        );
    }

    [Fact]
    public async Task UpdateMe_ShouldReturnOkWithNull_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();

        Authenticate(userId);

        var request = new UserUpdateRequest(
            "New Name",
            null
        );

        _userService
            .Setup(s =>
                s.UpdateCurrentUserAsync(userId, request)
            )
            .ReturnsAsync((UserResponse?)null);

        // Act
        var result = await _controller.UpdateMe(request);

        // Assert
        var ok = Assert.IsType<OkObjectResult>(
            result.Result
        );

        Assert.Null(ok.Value);

        _userService.Verify(
            s => s.UpdateCurrentUserAsync(userId, request),
            Times.Once
        );
    }
}