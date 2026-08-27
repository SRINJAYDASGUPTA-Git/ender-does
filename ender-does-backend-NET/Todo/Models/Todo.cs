namespace ender_does_backend_NET.Todo.Models;

public class Todo
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

    public bool IsDone { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? CompletedAt { get; set; }
    
    public Guid OwnerId { get; set; }

    public User.Models.User Owner { get; set; } = null!;
}