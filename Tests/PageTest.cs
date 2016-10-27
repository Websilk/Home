using System;
using System.Collections.Generic;


namespace Websilk.Services
{
    public class PageTest: Service
    {
        private Core S;

        public PageTest(Core WebsilkCore) : base(WebsilkCore)
        {
            S = WebsilkCore;
        }

        public WebRequest GeneratePage(string name)
        {
            //access this test from http://localhost:7770/api/PageTest/GeneratePage?name=home

            var response = new WebRequest();
            var page = new Page.structPage();
            page.layers = new List<int>();
            page.panels = new List<Panel>();
            page.components = new List<Component>();

            switch (name)
            {
                case "home":
                    //generate a home page
                    page.pageId = 101;
                    

                    break;

                case "login":
                    //generate login page

                    break;
            }

            //save page to file
            S.Util.Serializer.SaveToFile(page, S.Server.MapPath("/Content/websites/1/pages/" + page.pageId + "/page.json"));

            response.contentType = "text/html";
            response.html = "Generated page \"" + name + "\" at " + DateTime.Now.ToString("h:mm:ss") + ".";
            return response;
        }
    }
}
