using System;
using System.Collections.Generic;

namespace Websilk.Services
{
    public class Init: Service
    {
        public Init(Core WebsilkCore) : base(WebsilkCore){}

        public WebRequest Website()
        {
            //access this test from http://localhost:7770/api/Init/Website?name=home
            var response = new WebRequest();
            if (S.Server.environment != Server.enumEnvironment.development)
            {
                //exit function if not in development environment
                return response;
            }
            //generate all pages for the default website
            var pages = new string[]
            {
                "home", "login", "access-denied"
            };
            foreach(var page in pages)
            {
                GeneratePage(page);
            }
            
            response.contentType = "text/html";
            response.html = "Generated generic content for all web pages at " + DateTime.Now.ToString("h:mm:ss") + ".";
            return response;
        }

        private void GeneratePage(string name)
        {
            var P = new Page(S);
            var page = new Page.structPage();
            var scaffold = new Scaffold(S, "/App/Content/themes/default/layout.html");
            var panels = P.loadLayout(scaffold);
            var panelHead = panels[0];
            var panelBody = panels[1];
            var panelFoot = panels[2];

            page.layers = new List<int>();
            page.panels = new List<Panel>();
            page.components = new List<Component>();

            if (name == "home")
            {
                //generate a home page
                P.Url = P.parseUrl("/home");
                P.getPageInfoFromUrl();

            }else if (name == "login")
            {
                //generate login page
                P.Url = P.parseUrl("/login");
                P.getPageInfoFromUrl();
                var cLogin = P.loadComponent(new Websilk.Components.Login(), panelBody, panelBody.cells[0], true);
                var posLogin = cLogin.position[4];
                posLogin.padding.top = 50;
                cLogin.position[4] = posLogin;

            }else if (name == "access-denied")
            {
                //generate login page
                P.Url = P.parseUrl("/access-denied");
                P.getPageInfoFromUrl();
                var cLogin = P.loadComponent(new Websilk.Components.Login(), panelBody, panelBody.cells[0], true);
                var posLogin = cLogin.position[4];
                posLogin.padding.top = 50;
                cLogin.position[4] = posLogin;
            }

            page.pageId = P.pageId;

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
            S.Util.Serializer.SaveToFile(page, S.Server.MapPath("/App/Content/websites/1/pages/" + page.pageId + "/page.json"), Newtonsoft.Json.Formatting.None);
        }
    }
}
