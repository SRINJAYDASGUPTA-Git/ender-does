using Microsoft.AspNetCore.Mvc;

namespace ender_does_backend_NET.Controller;
[ApiController]
[Route("api/v1/")]
public class RootController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Get()
    {
        return Ok("EnderDoes .NET server Running perfectly");
    }
}