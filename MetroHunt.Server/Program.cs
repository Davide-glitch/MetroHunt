using System.Text;
using MetroHunt.Server.Data;
using MetroHunt.Server.Hubs;
using MetroHunt.Server.Models;
using MetroHunt.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (SQL Server)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<MetroHuntDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Security & Identity
builder.Services.AddIdentity<PlayerUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 4;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<MetroHuntDbContext>()
.AddDefaultTokenProviders();

// 3. JWT & External Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "MetroHuntSuperSecretKeyForDevelopmentJwtTokensOnly32CharsLong";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };

    // Support SignalR token passing in query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Optional Google OAuth if configured
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrEmpty(googleClientId) && !googleClientId.StartsWith("YOUR_"))
{
    builder.Services.AddAuthentication().AddGoogle(googleOptions =>
    {
        googleOptions.ClientId = googleClientId;
        googleOptions.ClientSecret = googleClientSecret!;
    });
}

builder.Services.AddAuthorization();

// 4. SignalR WebSockets
builder.Services.AddSignalR();

// 5. Simulation Engine Service
builder.Services.AddScoped<ISimulationEngine, SimulationEngine>();

// 6. Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// 7. OpenAPI / Swagger Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 8. CORS Configuration for Decoupled Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ClientCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

// Map SignalR Hub and API Controllers
app.MapHub<GameHub>("/hubs/game");
app.MapControllers();

// 9. Startup Seeding & Database Verification
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<MetroHuntDbContext>();
        context.Database.EnsureCreated();

        // Ensure AuditLogs table exists if database was created prior to AuditLog model addition
        try
        {
            context.Database.ExecuteSqlRaw(@"
                IF OBJECT_ID('AuditLogs', 'U') IS NULL
                CREATE TABLE AuditLogs (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    PlayerUserId NVARCHAR(450) NOT NULL,
                    PropertyId INT NULL,
                    ActionType INT NOT NULL,
                    Description NVARCHAR(250) NOT NULL,
                    Amount DECIMAL(18,2) NOT NULL,
                    PostBalance DECIMAL(18,2) NOT NULL,
                    TurnNumber INT NOT NULL,
                    Timestamp DATETIME2 NOT NULL
                );");
        }
        catch { }

        // Ensure active game session exists
        if (!context.GameSessions.Any())
        {
            context.GameSessions.Add(new GameSession
            {
                TargetNetWorth = 100_000_000.00m, // Target: $100M for demo
                CurrentRound = 1,
                IsCompleted = false
            });
            context.SaveChanges();
        }

        // Seed initial market properties if empty
        if (!context.Properties.Any())
        {
            var engine = services.GetRequiredService<ISimulationEngine>();
            engine.GenerateProceduralPropertiesAsync(8).GetAwaiter().GetResult();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating or seeding the SQL Server database.");
    }
}

app.Run();
