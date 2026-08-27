using ender_does_backend_NET.Auth.DTOs;
using ender_does_backend_NET.Auth.Security;
using ender_does_backend_NET.Data;
using ender_does_backend_NET.User.Mappers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ender_does_backend_NET.Exceptions;
namespace ender_does_backend_NET.Auth.Services.impl;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher<User.Models.User> _passwordHasher;
    private readonly JwtService _jwtService;

    public AuthService(
        ApplicationDbContext context,
        IPasswordHasher<User.Models.User> passwordHasher,
        JwtService jwtService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    // methods...
    public async Task<AuthResponse> RegisterAsync(
        RegisterRequest request)
    {
        var emailExists = await _context.Users
            .AnyAsync(u => u.Email == request.Email);

        if (emailExists)
        {
            throw new Exceptions.ApplicationException(
                "A user with this email already exists.",
                StatusCodes.Status409Conflict
            );
        }

        var user = new User.Models.User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            ImageUrl = request.ImageUrl,
            AccountLocked = false,
            Enabled = true
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password
        );

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);

        return new AuthResponse(
            token,
            UserMapper.ToResponse(user)
        );
    }

    public async Task<AuthResponse?> LoginAsync(
        LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Todos)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null)
            return null;

        if (!user.Enabled || user.AccountLocked)
            return null;

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (result == PasswordVerificationResult.Failed)
            return null;

        var token = _jwtService.GenerateToken(user);

        return new AuthResponse(
            token,
            UserMapper.ToResponse(user)
        );
    }
}