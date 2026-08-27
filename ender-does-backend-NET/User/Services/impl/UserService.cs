using ender_does_backend_NET.Data;
using ender_does_backend_NET.User.DTOs;
using ender_does_backend_NET.User.Mappers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ender_does_backend_NET.User.Services.impl;

public class UserService: IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher<User.Models.User> _passwordHasher;

    public UserService(ApplicationDbContext context, IPasswordHasher<User.Models.User> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }
    
    public async Task<UserResponse?> GetCurrentUserAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Todos)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return  null;

        var response = UserMapper.ToResponse(user);
        return response;
    }

    public async Task<UserResponse?> UpdateCurrentUserAsync(Guid userId, UserUpdateRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Todos)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return  null;

        if (request.Name != null) user.Name = request.Name;
        if (request.ImageUrl != null) user.ImageUrl = request.ImageUrl;

        _context.Update(user);
        await _context.SaveChangesAsync();
        
        return UserMapper.ToResponse(user);
    }
}