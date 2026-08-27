namespace ender_does_backend_NET.User.Models;

public class User
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public bool AccountLocked { get; set; }

    public bool Enabled { get; set; }
    
    public List<Todo.Models.Todo> Todos { get; set; } = [];
}