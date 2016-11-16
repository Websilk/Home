using System;
using System.Collections.Generic;
using System.Text;
using Websilk.Services;
using System.Linq;

namespace Websilk.Pages
{
    public class Dashboard: StaticPage
    {
        public struct structMenuItem
        {
            public string label;
            public string href;
            public string icon;
            public List<structMenuItem> submenu;
        }

        public Dashboard(Core WebsilkCore, Page page): base(WebsilkCore, page){}

        public override void Load()
        {
            //load the dashboard layout
            scaffold = new Scaffold(S, "/App/Dashboard/page.html");
            S.cssFiles.Add("dashboard", "/css/dashboard/dashboard.css");
            var scaffMenu = new Scaffold(S, "/App/Dashboard/menu-item.html");

            //load user profile
            scaffold.Data["profile-img"] = "";
            scaffold.Data["btn-edit-img"] = "";
            scaffold.Data["profile-name"] = S.User.displayName;

            //load website info
            var domains = page.getDomainsForWebsite();
            if(domains.Count > 0)
            {
                scaffold.Data["has-domain"] = "true";
                scaffold.Data["website-name"] = page.websiteTitle;
                scaffold.Data["website-url"] = "http://www." + domains[0].domain;
                scaffold.Data["website-url-name"] = "www." + domains[0].domain;
            }

            //generate menu system
            var menu = new StringBuilder();
            var menus = new List<structMenuItem>()
            {
                menuItem("Timeline", "/dashboard/timeline", "timeline"),
                menuItem("Pages", "/dashboard/pages", "pages"),
                menuItem("Photos", "/dashboard/photos", "photos"),
                menuItem("Downloads", "/dashboard/downloads", "layers"),
                menuItem("Analytics", "/dashboard/analytics", "analytics"),
                menuItem("Users", "/dashboard/users", "users"),
                menuItem("Settings", "/dashboard/settings", "settings",
                    new List<structMenuItem>{
                        menuItem("Domains", "/dashboard/settings/domains", "domains"),
                        menuItem("Themes", "/dashboard/settings/themes", "themes"),
                        menuItem("Color Schemes", "/dashboard/settings/colors", "colors"),
                        menuItem("Cache", "/dashboard/settings/cache", "cache")
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

            //add js file
            S.javascriptFiles.Add("dashboard", "/js/dashboard/page.js");

            //finally, add content of dashboard section
            var inject = new Inject();
            if (page.Url.path != "dashboard")
            {
                inject = LoadSubPage(page.Url.path.Replace("dashboard/", ""));
            }else
            {
                inject = LoadSubPage("pages");
                S.javascript.Add("url", "S.url.push(S.page.title, 'dashboard/pages');");
            }
            scaffold.Data["body"] = inject.html;
        }

        public override Inject LoadSubPage(string path)
        {
            //get correct sub page from path
            StaticPage service;
            var inject = new Inject();
            var paths = path.Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries);
            var section = "";
            switch (paths[0]){
                case "analytics":
                    service = new DashboardPages.Analytics(S, page);
                    inject = service.LoadSubPage(string.Join("/", paths.Skip(1).ToArray()));
                    section = "analytics";
                    break;
                case "downloads":
                    service = new DashboardPages.Downloads(S, page);
                    inject = service.LoadSubPage(string.Join("/", paths.Skip(1).ToArray()));
                    section = "downloads";
                    break;
                case "pages":
                    service = new DashboardPages.Pages(S, page);
                    inject = service.LoadSubPage(string.Join("/", paths.Skip(1).ToArray()));
                    section = "pages";
                    break;
                case "photos":
                    service = new DashboardPages.Photos(S, page);
                    inject = service.LoadSubPage(string.Join("/", paths.Skip(1).ToArray()));
                    section = "photos";
                    break;
                case "settings":
                    service = new DashboardPages.Settings(S, page);
                    inject = service.LoadSubPage(string.Join("/", paths.Skip(1).ToArray()));
                    section = "settings";
                    break;
                case "timeline":
                    service = new DashboardPages.Timeline(S, page);
                    inject = service.LoadSubPage(string.Join("/", paths.Skip(1).ToArray()));
                    section = "timeline";
                    break;
                case "users":
                    service = new DashboardPages.Users(S, page);
                    inject = service.LoadSubPage(string.Join("/", paths.Skip(1).ToArray()));
                    section = "users";
                    break;
            }

            S.javascript.Add("dash-subpage", "S.dashboard.sections.show('" + section + "');");
            inject.element = ".dash-body";
            inject.remove = ".dash-body > .section-" + section;
            inject.html = "<div class=\"dash-section section-" + section + "\">" + inject.html + "</div>";
            inject.inject = enumInjectTypes.append;
            return inject;
        }

        private structMenuItem menuItem(string label, string href, string icon, List<structMenuItem> submenu = null)
        {
            var menu = new structMenuItem();
            menu.label = label;
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
            scaff.Data["icon"] = item.icon;
            scaff.Data["gutter"] = gutter;
            scaff.Data["submenu"] = subs.Length > 0 ? "<div class=\"row submenu\"><ul class=\"menu\">" + subs.ToString() + "</ul></div>" : "";
            return scaff.Render();
        }
    }
}
