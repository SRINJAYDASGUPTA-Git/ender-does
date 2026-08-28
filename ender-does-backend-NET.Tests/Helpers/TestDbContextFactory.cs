using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using ender_does_backend_NET.Data;

namespace ender_does_backend_NET.Tests.Helpers;

public static class TestDbContextFactory
{
    public static (ApplicationDbContext Context, SqliteConnection Connection) Create()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new ApplicationDbContext(options);

        context.Database.EnsureCreated();

        return (context, connection);
    }
}