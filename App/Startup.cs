using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

public class Startup : Datasilk.Startup
{
    
    public override void Configured(IApplicationBuilder app, IHostingEnvironment env, IConfigurationRoot config)
    {
        base.Configured(app, env, config);
        var query = new Websilk.Query.Users(server.sqlConnectionString);
        var reset = query.HasPasswords();
        if (reset > 0)
        {
            server.Cache.Add("resetPass", reset);
        }
    }
}