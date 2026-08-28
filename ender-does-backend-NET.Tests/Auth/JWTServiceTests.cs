using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ender_does_backend_NET.Auth.Security;
using ender_does_backend_NET.User.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ender_does_backend_NET.Tests.Auth;

public class JwtServiceTests
{
    private const string TestKey =
        "this-is-a-test-secret-key-that-is-long-enough";

    private readonly JwtOptions _options = new()
    {
        Key = TestKey,
        Issuer = "ender-does-test",
        Audience = "ender-does-test-client",
        ExpirationMinutes = 60
    };

    [Fact]
    public void GenerateToken_ShouldContainExpectedClaims()
    {
        // Arrange
        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Srinjay",
            Email = "srinjay@test.com"
        };

        var jwtService = new JwtService(
            Options.Create(_options)
        );

        // Act
        var tokenString = jwtService.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(tokenString);

        // Assert
        Assert.Equal(
            user.Id.ToString(),
            token.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value
        );

        Assert.Equal(
            user.Email,
            token.Claims.First(c => c.Type == ClaimTypes.Email).Value
        );

        Assert.Equal(
            user.Name,
            token.Claims.First(c => c.Type == ClaimTypes.Name).Value
        );

        Assert.Equal(_options.Issuer, token.Issuer);
        Assert.Contains(_options.Audience, token.Audiences);

        Assert.True(token.ValidTo > DateTime.UtcNow);
    }

    [Fact]
    public void GenerateToken_ShouldHaveValidSignature()
    {
        // Arrange
        var user = new ender_does_backend_NET.User.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Srinjay",
            Email = "srinjay@test.com"
        };

        var jwtService = new JwtService(
            Options.Create(_options)
        );

        // Act
        var tokenString = jwtService.GenerateToken(user);

        // Assert
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_options.Key)
            ),

            ValidateIssuer = true,
            ValidIssuer = _options.Issuer,

            ValidateAudience = true,
            ValidAudience = _options.Audience,

            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero
        };

        var handler = new JwtSecurityTokenHandler();

        var principal = handler.ValidateToken(
            tokenString,
            validationParameters,
            out var validatedToken
        );

        Assert.NotNull(principal);
        Assert.NotNull(validatedToken);

        Assert.Equal(
            user.Id.ToString(),
            principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
        );
    }
}