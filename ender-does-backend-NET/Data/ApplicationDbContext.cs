using ender_does_backend_NET.Todo.Models;
using Microsoft.EntityFrameworkCore;

namespace ender_does_backend_NET.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options)
    {
    }

    public DbSet<Todo.Models.Todo> Todos => Set<Todo.Models.Todo>();
    public DbSet<User.Models.User> Users => Set<User.Models.User>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User.Models.User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Todo.Models.Todo>()
            .HasOne(t => t.Owner)
            .WithMany()
            .HasForeignKey(t => t.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}