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

            //get page info
            P.Url = P.parseUrl("/" + name);
            P.getPageInfoFromUrl();

            var tuple = P.loadPageAndLayout(P.pageId);

            var page = tuple.Item3;
            var panels = tuple.Item4;
            var panelHead = panels[0];
            var panelBody = panels[1];
            var panelFoot = panels[2];

            if (name == "home")
            {
                //generate a home page
                

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

            //save components from header area
            var area = page.areas[0];
            var block = area.blocks[0];
            block.components = new List<Component>();
            foreach(var cell in panelHead.cells)
            {
                foreach(var comp in cell.components)
                {
                    block.components.Add(comp);
                }
            }
            area.blocks[0] = block;
            page.areas[0] = area;

            //save components from body area
            area = page.areas[1];
            block = area.blocks[0];
            block.components = new List<Component>();
            foreach (var cell in panelBody.cells)
            {
                foreach (var comp in cell.components)
                {
                    block.components.Add(comp);
                }
            }
            area.blocks[0] = block;
            page.areas[1] = area;

            //save components from footer area
            area = page.areas[2];
            block = area.blocks[0];
            block.components = new List<Component>();
            foreach (var cell in panelFoot.cells)
            {
                foreach (var comp in cell.components)
                {
                    block.components.Add(comp);
                }
            }
            area.blocks[0] = block;
            page.areas[2] = area;
            
            page.pageId = P.pageId;

            //save page to file
            S.Util.Serializer.SaveToFile(page, S.Server.MapPath("/App/Content/websites/" + P.websiteId + "/pages/" + P.pageId + "/page.json"), Newtonsoft.Json.Formatting.None);
        }
    }
}
