using System;
using Microsoft.AspNetCore.Http;

namespace Websilk.Pipeline
{
    public class PageRequest
    {
        private Core S;
        public Scaffold scaffold;

        public PageRequest(Server server, HttpContext context)
        {
            //the Pipeline.PageRequest is simply the first page request for a Websilk website. 

            S = new Core(server, context);

            var pathquery = context.Request.Path.ToString().Substring(1).Split('?', 2);
            var path = pathquery[0].Split('/');
            var page = GetWebPage("websilk.pages." + path[0]);

            //render the server response
            S.Response.ContentType = "text/html";
            S.Response.WriteAsync(page.Render(path, pathquery.Length == 2 ? pathquery[1] : null));

        }

        private Page GetWebPage(string className)
        {
            //hard-code all known services to increase server performance
            switch (className.ToLower())
            {
                case "websilk.pages.dashboard":
                    return new Pages.Dashboard(S);

                default:
                    //last resort, find service class manually
                    Type type = Type.GetType(className);
                    return (Page)Activator.CreateInstance(type, new object[] { S });
            }
        }
    }
}
