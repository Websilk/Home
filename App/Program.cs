using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;

namespace Websilk
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                    .UseKestrel()
                    .UseUrls(new string[] { "http://localhost:7770"})
                    .UseContentRoot(Directory.GetCurrentDirectory())
                    .UseStartup<Startup>()
                    .Build();

            host.Run();
        }
    }
}