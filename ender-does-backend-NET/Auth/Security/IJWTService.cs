namespace ender_does_backend_NET.Auth.Security;

public interface IJwtService
{
    string GenerateToken(User.Models.User user);
}