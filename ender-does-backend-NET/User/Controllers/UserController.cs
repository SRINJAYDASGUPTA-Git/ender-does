using System.Security.Claims;
using ender_does_backend_NET.User.DTOs;
using ender_does_backend_NET.User.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ender_does_backend_NET.User.Controllers;

[ApiController]
[Route("api/v1/auth")]
[Authorize]
public class UserController(IUserService userService): ControllerBase
{
    [HttpGet("/me")]
    public async Task<ActionResult<UserResponse>> GetMe()
    {
        var userId = AuthenticatedUserId;
        var userResponse = await userService.GetCurrentUserAsync(userId);

        return Ok(userResponse);
    }
    
    [HttpPut("/me")]
    public async Task<ActionResult<UserResponse>> UpdateMe(UserUpdateRequest request)
    {
        var userId = AuthenticatedUserId;
        var userResponse = await userService.UpdateCurrentUserAsync(userId, request);
        
        return Ok(userResponse);
    }
    
    private Guid AuthenticatedUserId =>
        Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );
}