using ender_does_backend_NET.Todo.Mappers;
using ender_does_backend_NET.User.DTOs;

namespace ender_does_backend_NET.User.Mappers;

public static class UserMapper
{
    public static UserResponse ToResponse(Models.User user)
    {
        return new UserResponse(
            user.Id,
            user.Name,
            user.Email,
            user.ImageUrl,
            user.AccountLocked,
            user.Enabled,
            [
                .. user.Todos
                    .Select(TodoMapper.ToResponse)
            ]
        );
    }
}