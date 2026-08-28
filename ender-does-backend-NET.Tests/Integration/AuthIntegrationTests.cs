using System.Net;
using System.Net.Http.Json;
using ender_does_backend_NET.Auth.DTOs;
using ender_does_backend_NET.User.DTOs;

namespace ender_does_backend_NET.Tests.Integration;

public class AuthIntegrationTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthIntegrationTests(
        CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_ShouldCreateUser()
    {
        // Arrange
        var request = new RegisterRequest(
            "Integration User",
            "integration@test.com",
            "Password123!",
            null
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/v1/auth/register",
            request
        );
        var body = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"STATUS: {response.StatusCode}");
        Console.WriteLine($"BODY: {body}");
        // Assert
        Assert.Equal(
            HttpStatusCode.Created,
            response.StatusCode
        );

        var result =
            await response.Content.ReadFromJsonAsync<AuthResponse>();

        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result.Token));

        Assert.Equal(
            "Integration User",
            result.User.Name
        );

        Assert.Equal(
            "integration@test.com",
            result.User.Email
        );
    }
}