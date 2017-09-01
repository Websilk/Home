using System;
using System.Collections.Generic;
using System.Text;
using Websilk.Services;
using System.Linq;

namespace Websilk.Pages
{
    public class Dashboard: Page
    {
        public struct structMenuItem
        {
            public string label;
            public string id;
            public string href;
            public string icon;
            public List<structMenuItem> submenu;
        }

        public Dashboard(Core WebsilkCore): base(WebsilkCore){}

        public override string Render(string[] path, string query)
        {
            //load the dashboard layout
            var scaffold = new Scaffold(S, "/Dashboard/dashboard.html");
            var scaffMenu = new Scaffold(S, "/Dashboard/menu-item.html");

            //load user profile
            scaffold.Data["profile-img"] = "";
            scaffold.Data["btn-edit-img"] = "";
            scaffold.Data["profile-name"] = S.User.displayName;

            //load website info
            //var domains = page.getDomainsForWebsite();
            //var domain = "";
            //if(domains.Count > 0)
            //{
            //    domain = domains[0].domain;
            //    scaffold.Data["has-domain"] = "true";
            //    scaffold.Data["website-name"] = page.websiteTitle;
            //    scaffold.Data["website-url"] = "http://www." + domain;
            //    scaffold.Data["website-url-name"] = "www." + domain;
            //}

            //generate menu system
            var menu = new StringBuilder();
            var menus = new List<structMenuItem>()
            {
                menuItem("Timeline", "timeline", "/dashboard/timeline", "timeline"),
                menuItem("Pages", "pages", "/dashboard/pages", "pages"),
                menuItem("Photos", "photos", "/dashboard/photos", "photos"),
                menuItem("Downloads", "downloads", "/dashboard/downloads", "layers"),
                menuItem("Analytics", "analytics", "/dashboard/analytics", "analytics"),
                menuItem("Users", "users",  "/dashboard/users", "users"),
                menuItem("Settings", "settings", "/dashboard/settings", "settings",
                    new List<structMenuItem>{
                        menuItem("Domains", "settings-domains", "/dashboard/settings/domains", "domains"),
                        menuItem("Themes", "settings-themes", "/dashboard/settings/themes", "themes"),
                        menuItem("Color Schemes", "settings-colorschemes", "/dashboard/settings/colors", "colors"),
                        menuItem("Cache", "settings-cache", "/dashboard/settings/cache", "cache"),
                        menuItem("Advanced", "settings-advanced", "/dashboard/settings/advanced", "component-admin")
                    }
                )
            };

            //TODO: get apps available to the user for this website

            //render menu system
            foreach (var item in menus)
            {
                menu.Append(renderMenuItem(scaffMenu, item, 0));
            }
            scaffold.Data["menu"] = "<ul class=\"menu\">" + menu.ToString() + "</ul>";

            //finally, add content of dashboard section

            var subPath = "";
            if (S.Request.Path.ToString() != "dashboard")
            {
                subPath = S.Request.Path.ToString().Replace("dashboard/", "");
            }
            else
            {
                subPath = "pages";
            }
            scaffold.Data["body"] = LoadSubPage(subPath);
            return scaffold.Render();
        }

        private string LoadSubPage(string path)
        {
            //get correct sub page from path
            Page service = null;
            var html = "";
            var paths = path.Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries);
            var subpath = paths.Skip(1).ToArray();

            if (paths[0] == "downloads") { 
                service = new DashboardPages.Downloads(S);
                html = service.Render(subpath);
            }
            else if (paths[0] == "pages")
            {
                service = new DashboardPages.Pages(S);
                html = service.Render(subpath);
            }
            else if (paths[0] == "photos")
            {
                service = new DashboardPages.Photos(S);
                html = service.Render(subpath);
            }
            else if (paths[0] == "settings")
            {
                if(paths.Length > 1)
                {
                    if(paths[1] == "themes")
                    {
                        service = new DashboardPages.Settings.Themes(S);
                        html = service.Render(paths.Skip(2).ToArray());
                    }
                }
            }
            else if (paths[0] == "timeline")
            {
                service = new DashboardPages.Timeline(S);
                html = service.Render(subpath);
            }
            else if (paths[0] == "users")
            {
                service = new DashboardPages.Users(S);
                html = service.Render(subpath);
            }
            return html;
        }

        private structMenuItem menuItem(string label, string id, string href, string icon, List<structMenuItem> submenu = null)
        {
            var menu = new structMenuItem();
            menu.label = label;
            menu.id = id;
            menu.href = href;
            menu.icon = icon;
            menu.submenu = submenu;
            return menu;
        }

        private string renderMenuItem(Scaffold scaff, structMenuItem item, int level = 0)
        {
            var gutter = "";
            var subs = new StringBuilder();
            for (var x = 0; x < level; x++)
            {
                gutter += "<div class=\"gutter\"></div>";
            }
            if (item.submenu != null)
            {
                if(item.submenu.Count > 0)
                {
                    foreach(var sub in item.submenu)
                    {
                        subs.Append(renderMenuItem(scaff, sub, level + 1));
                    }
                }
            }
            scaff.Data["label"] = item.label;
            scaff.Data["href"] = item.href == "" ? "javascript:" : item.href;
            scaff.Data["section-name"] = item.id;
            scaff.Data["icon"] = item.icon;
            scaff.Data["gutter"] = gutter;
            if(subs.Length > 0)
            {
                scaff.Data["target"] = " target=\"_self\"";
                scaff.Data["submenu"] = "<div class=\"row submenu\"><ul class=\"menu\">" + subs.ToString() + "</ul></div>";
            }
            else
            {
                scaff.Data["submenu"] = "";
            }
            
            return scaff.Render();
        }
    }
}
