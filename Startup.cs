using System;
using System.IO;
using System.Linq;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNet.StaticFiles;

namespace Websilk
{

    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCaching();
            services.AddSession();
        }

        public void Configure(IApplicationBuilder app)
        {

            //load application-wide memory store
            Server server = new Server();

            //handle static files
            var options = new StaticFileOptions {ContentTypeProvider = new FileExtensionContentTypeProvider()};
            app.UseStaticFiles(options);

            //exception handling
            var errOptions = new ErrorPageOptions();
            errOptions.SourceCodeLineCount = 10;
            app.UseDeveloperExceptionPage();

            //use session
            app.UseSession();

            //get server info from config.json
            if (!File.Exists(Path.GetFullPath("config.json")))
            {
                //generate config.json
                createConfig();
            }

            var configBuilder = new ConfigurationBuilder()
                .AddJsonFile(server.MapPath("config.json"))
                .AddEnvironmentVariables();
            IConfiguration config = configBuilder.Build();

            server.sqlActive = config.GetSection("Data:Active").Value;
            server.sqlConnection = config.GetSection("Data:" + server.sqlActive).Value;
            server.https = config.GetSection("https").Value.ToLower() == "true" ? true : false;
            server.encryption.salt = config.GetSection("Encryption:Salt").Value;

            var isdev = false;
            switch (config.GetSection("Environment").Value)
            {
                case "development": case "dev":
                    server.environment = Server.enumEnvironment.development;
                    isdev = true;
                    break;
                case "staging": case "stage":
                    server.environment = Server.enumEnvironment.staging;
                    break;
                case "production": case "prod":
                    server.environment = Server.enumEnvironment.production;
                    break;
            }

            //configure server security
            if(server.encryption.salt == "")
            {
                //if no salt exists in config.json, create a new one
                var Util = new Utility.Util();
                server.encryption.salt = createSalt(Util);

                //reset all passwords in the database
                var Sql = new Sql(server, Util);
                Sql.ExecuteNonQuery("EXEC ResetAllPasswords");
                server.encryption.reset = true;
            }else
            {
                //check to see if admin account has a password
                var Util = new Utility.Util();
                var Sql = new Sql(server, Util);
                if((int)Sql.ExecuteScalar("EXEC HasPassword @userId=1") == 0){
                    server.encryption.reset = true;
                }
            }

            //run Websilk application
            app.Run(async (context) =>
            {
                var requestStart = DateTime.Now;
                DateTime requestEnd;
                TimeSpan tspan;
                var requestType = "";
                var path = cleanPath(context.Request.Path.ToString());
                var paths = path.Split('/').Skip(1).ToArray();                
                var extension = "";

                //get request file extension (if exists)
                if(path.IndexOf(".")>= 0)
                {
                    for (int x = path.Length - 1; x >= 0; x += -1)
                    {
                        if (path.Substring(x, 1) == ".")
                        {
                            extension = path.Substring(x + 1); return;
                        }
                    }
                }
                
                server.requestCount += 1;
                if (isdev)
                {
                    Console.WriteLine("--------------------------------------------");
                    Console.WriteLine("{0} GET {1}", DateTime.Now.ToString("hh:mm:ss"), context.Request.Path);
                }

                if (paths.Length > 1)
                {
                    if(paths[0]=="api")
                    {
                        //run a web service via ajax (e.g. /api/namespace/class/function)
                         IFormCollection form = null;
                        if(context.Request.ContentType != null)
                        {
                            if (context.Request.ContentType.IndexOf("application/x-www-form-urlencoded") >= 0)
                            {
                            }else if (context.Request.ContentType.IndexOf("multipart/form-data") >= 0)
                            {
                                //get files collection from form data
                                form = await context.Request.ReadFormAsync();
                            }
                        }

                        
                        if (cleanNamespace(paths))
                        {
                            //execute web service
                            var ws = new Pipeline.WebService(server, context, paths, form);
                            requestType = "service";
                        }
                    }
                }

                if(requestType == "" && extension == "")
                {
                    //initial page request
                    var r = new Pipeline.PageRequest(server, context);
                    requestType = "page";
                }

                if (isdev)
                {
                    requestEnd = DateTime.Now;
                    tspan = requestEnd - requestStart;
                    server.requestTime += (tspan.Seconds);
                    Console.WriteLine("END GET {0} {1} ms {2}", context.Request.Path, tspan.Milliseconds, requestType);
                    Console.WriteLine("");
                }
                
            });
        }

        private string cleanPath(string path)
        {
            //check for malicious path input
            if(path == "") { return path; }

            if (path.Replace("/", "").Replace("-","").Replace("+","").All(char.IsLetterOrDigit)) {
                //path is clean
                return path;
            }

            //path needs to be cleaned
            return path
                .Replace("{", "")
                .Replace("}", "")
                .Replace("'", "")
                .Replace("\"", "")
                .Replace(":","")
                .Replace("$","")
                .Replace("!","")
                .Replace("*","");
        }

        private bool cleanNamespace(string[] paths)
        {
            //check for malicious namespace in web service request
            foreach(var p in paths)
            {
                if (!p.All(char.IsLetter)) { return false; }
            }
            return true;
        }

        private string createSalt(Utility.Util Util)
        {
            //no salt has been generated yet. generate salt & save to config.json
            var encryption = new Utility.Encryption(Util);
            var configPath = Path.GetFullPath("config.json");
            var salt = encryption.getNewCSPRNG();
            //open config.json as raw file
            var f = File.ReadAllText(configPath);
            if (f != "")
            {
                //parse config.json & insert salt manually
                var i = new int[3];
                i[0] = f.IndexOf("\"salt\"");
                if (i[0] > 0)
                {
                    i[1] = f.IndexOf("\"\"", i[0] + 6);
                    if (i[1] > i[0])
                    {
                        //inject salt into config.json
                        f = f.Substring(0, i[1] + 1) + salt + f.Substring(i[1] + 1);
                        File.WriteAllText(configPath, f);
                    }
                }
            }
            return salt;
        }

        private void createConfig()
        {
            var configPath = Path.GetFullPath("project.json").Replace("project.json","config.json");
            File.WriteAllText(configPath,
                "{\n" +
                "    \"environment\": \"development\",\n" +
                "    \"https\": false,\n" +
                "    \"data\": {\n" +
                "        \"active\": \"SqlServerTrusted\",\n" +
                "        \"SqlServerDev\": \"server=.\\\\SQL2014; database=WebsilkDev; user=WebsilkDev; password=development\",\n" +
                "        \"SqlServerTrusted\": \"server=.\\\\SQL2014; database=WebsilkDev; Trusted_Connection=true\"\n" +
                "    },\n" +
                "    \"encryption\": {\n" +
                "        \"salt\": \"\"\n" +
                "    }\n" +
                "}\n"
                );
        }
    }
}
