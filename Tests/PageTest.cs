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
            var P = new Page(S);
            var page = new Page.structPage();
            var scaffold = new Scaffold(S, "/Content/themes/default/layout.html");
            var panels = P.loadLayout(scaffold);
            var panelHead = panels[0];
            var panelBody = panels[1];
            var panelFoot = panels[2];

            page.layers = new List<int>();
            page.panels = new List<Panel>();
            page.components = new List<Component>();
            
            if(S.Server.environment != enumEnvironment.development) {
                //exit function if not in development environment
                return response;
            }

            switch (name)
            {
                case "home":
                    //generate a home page
                    page.pageId = 101;
                    break;

                case "login":
                    //generate login page
                    page.pageId = 102;
                    panelBody = P.loadComponent(new Components.Login(), panelBody, panelBody.cells[0]);
                    break;
            }

            //add components from head, body, & foot
            foreach (var component in panelHead.cells[0].components)
            {
                page.components.Add(component);
            }

            foreach (var component in panelBody.cells[0].components)
            {
                page.components.Add(component);
            }

            foreach (var component in panelFoot.cells[0].components)
            {
                page.components.Add(component);
            }

            //save page to file
            S.Util.Serializer.SaveToFile(page, S.Server.MapPath("/Content/websites/1/pages/" + page.pageId + "/page.json"));

            response.contentType = "text/html";
            response.html = "Generated page \"" + name + "\" at " + DateTime.Now.ToString("h:mm:ss") + ".";
            return response;
        }
    }
}
