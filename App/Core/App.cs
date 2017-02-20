using System;
using System.Collections.Generic;
using System.Linq;

namespace Websilk.Services
{
    public class App : Service
    {

        public App(Core WebsilkCore) : base(WebsilkCore) { }

        public PageRequest Url(string url)
        {
            if (S.isSessionLost()) { return lostPageRequest(); } //check session

            var response = new PageRequest();
            if (!string.IsNullOrEmpty(url))
            {
                var arrUrl = url.Split('\"');
                if (arrUrl[0].IndexOf("+") < 0)
                {
                    //found page with no query in url
                    var page = new Page(S);

                    //parse URL
                    page.Url = page.parseUrl(url.ToLower().Replace(" ", "-"));

                    //get page Info
                    page.getPageInfoFromUrl();

                    //load page content
                    page.Render();

                    //write to console
                    Console.WriteLine("Load page: " + page.pageTitle);

                    //set up response
                    response.components = new List<PageComponent>();
                    response.css = "";
                    response.editor = "";
                    response.js = "";
                    response.pageTitle = page.pageTitle;
                    response.url = url;
                    response.pageId = page.pageId;
                    response.already = true;

                    //load page components, excluding components from the currently loaded page

                    //render each component for the page

                }
            }
            return response;
        }

        public Inject StaticUrl(string url)
        {
            if (S.isSessionLost()) { return lostInject(); } //check session

            if (!string.IsNullOrEmpty(url))
            {
                var arrUrl = url.Split('\"');
                if (arrUrl[0].IndexOf("+") < 0)
                {
                    //found page with no query in url
                    var page = new Page(S);

                    //parse URL
                    page.Url = page.parseUrl(url.ToLower().Replace(" ", "-"));

                    //get page Info
                    page.getPageInfoFromUrl();

                    //get static page class
                    if(page.pageService != "")
                    {
                        var service = page.getStaticPage(page.pageService);
                        var response = service.LoadSubPage(page.Url.path.Replace(page.pagePathName.ToLower() + "/", ""));
                        S.javascript.Add("static-page", "S.url.push('" + page.pageTitle + "','" + url.Replace(" ", "-") + "');");
                        response.js =
                            S.cssFiles.renderCssFiles(false) + "\n" +
                            S.javascriptFiles.renderJavascriptFiles(false, S.javascript.renderJavascript(false));
                        return response;
                    }
                }
            }
            return new Inject();
        }
    }
}
