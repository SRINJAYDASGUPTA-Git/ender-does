using ender_does_backend_NET.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ender_does_backend_NET.Tests.Integration;

public class CustomWebApplicationFactory
    : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection =
        new("DataSource=:memory:");

    protected override void ConfigureWebHost(
        IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        _connection.Open();
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] =
                    "this-is-a-test-secret-key-that-is-long-enough",

                ["Jwt:Issuer"] =
                    "ender-does-tests",

                ["Jwt:Audience"] =
                    "ender-does-tests",

                ["Jwt:ExpirationMinutes"] =
                    "60"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.AddDbContext<ApplicationDbContext>(
                options =>
                {
                    options.UseSqlite(_connection);
                }
            );
        });
    }

    protected override IHost CreateHost(
        IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();

        var db = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        db.Database.EnsureCreated();

        return host;
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection.Close();
            _connection.Dispose();
        }

        base.Dispose(disposing);
    }
}