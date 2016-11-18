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
            var page = new Page(S);
            S.isFirstLoad = true;

            if (S.isFirstLoad == true)
            {
                getUserAgent(context);
            }

            //parse URL
            page.Url = page.parseUrl(S.Request.Path.ToString().ToLower().Replace(" ", "-"));

            //get page Info
            page.getPageInfoFromUrl();

            //register initial javascript
            S.javascript.Add("init", "S.init(" + (S.User.useAjax ? "true" : "false") + "," + page.pageId + "," + page.pageType + ",'" + page.pagePathName + "','" + page.pageTitle + "','" + page.PageTitleForBrowserTab + "'," + page.websiteId + ",'" + page.websiteTitle + "', '" + (S.Request.IsHttps ? "https://" : "http://") + "','" + page.Url.host + "');");

            //render the page
            var response = page.Render();

            //unload the core (before sending response)
            S.Unload();

            //render the server response
            S.Response.ContentType = "text/html";
            S.Response.WriteAsync(response);

        }

        private void getUserAgent(HttpContext context)
        {
            //check for web bots such as google bot
            string agent = context.Request.Headers["User-Agent"].ToString().ToLower();
            if (agent.Contains("bot") | agent.Contains("crawl") | agent.Contains("spider"))
            {
                S.User.useAjax = false;
                S.User.isBot = true;
            }

            //check for mobile agent
            if (agent.Contains("mobile") | agent.Contains("blackberry") | agent.Contains("android") | agent.Contains("symbian") | agent.Contains("windows ce") |
                agent.Contains("fennec") | agent.Contains("phone") | agent.Contains("iemobile") | agent.Contains("iris") | agent.Contains("midp") | agent.Contains("minimo") |
                agent.Contains("kindle") | agent.Contains("opera mini") | agent.Contains("opera mobi") | agent.Contains("ericsson") | agent.Contains("iphone") | agent.Contains("ipad"))
            {
                S.User.isMobile = true;
            }
            if (agent.Contains("tablet") | agent.Contains("ipad")) { S.User.isTablet = true; }
        }
    }
}
