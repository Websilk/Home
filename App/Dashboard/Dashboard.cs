using System;
using System.Collections.Generic;
using System.Text;
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

        public override string Render(string[] path, string query = "", string body = "")
        {
            websiteId = 1;
            if (!S.User.checkSecurity(websiteId,"websilk", User.enumSecurity.read)) { return AccessDenied(); }

            //set up client-side dependencies
            colorsCss = "/css/colors/dashboard/aqua.css";
            headCss += "<link type=\"text/css\" rel=\"stylesheet\" href=\"/css/dashboard/dashboard.css\"/>";
            scripts += "<script src=\"/js/dashboard/dashboard.js\"></script>";

            //load the dashboard layout
            var scaffold = new Scaffold(S, "/Dashboard/dashboard.html");
            var scaffMenu = new Scaffold(S, "/Dashboard/menu-item.html");
            var queryWebsites = new Query.Websites(S.SqlConnectionString);
            var website = queryWebsites.GetWebsiteInfo(websiteId);

            //load user profile
            scaffold.Data["profile-img"] = "";
            scaffold.Data["btn-edit-img"] = "";
            scaffold.Data["profile-name"] = S.User.displayName;

            //load website info
            scaffold.Data["website-name"] = website.title;
            scaffold.Data["website-url"] = "http://" + website.liveUrl;
            scaffold.Data["website-url-name"] = website.liveUrl;

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
                        menuItem("Themes", "settings-themes", "/dashboard/settings/themes", "themes"),
                        menuItem("Cache", "settings-cache", "/dashboard/settings/cache", "cache"),
                        menuItem("Advanced", "settings-advanced", "/dashboard/settings/advanced", "component-admin")
                    }
                )
            };

            //TODO: get vendor apps available to the user for this website

            //render menu system
            foreach (var item in menus)
            {
                menu.Append(renderMenuItem(scaffMenu, item, 0));
            }
            scaffold.Data["menu"] = "<ul class=\"menu\">" + menu.ToString() + "</ul>";

            //finally, add content of dashboard section

            var subPath = "";
            subPath = S.Request.Path.ToString().Replace("dashboard", "").Substring(1);
            if(subPath == "") { 
                subPath = "pages";
            }
            var html = "";
            Page subpage = null;
            var t = LoadSubPage(subPath);
            subpage = t.Item1;
            html = t.Item2;
            scaffold.Data["body"] = html;

            if(html == "") { return AccessDenied(); }

            //set up page info
            title = website.title + " - Dashboard - " + subpage.title;
            scripts += subpage.scripts;

            return base.Render(path, query, scaffold.Render());
        }

        private Tuple<Page, string> LoadSubPage(string path)
        {
            //get correct sub page from path
            Page service = null;
            var html = "";
            var paths = path.Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries);
            var subpath = paths.Skip(1).ToArray();

            if (paths[0] == "downloads") { 
                service = new DashboardPages.Downloads(S);
            }
            else if (paths[0] == "pages")
            {
                service = new DashboardPages.Pages(S);
            }
            else if (paths[0] == "photos")
            {
                service = new DashboardPages.Photos(S);
            }
            else if (paths[0] == "settings")
            {
                if(paths.Length > 1)
                {
                    if(paths[1] == "themes")
                    {
                        service = new DashboardPages.Settings.Themes(S);
                        subpath = paths.Skip(2).ToArray();
                    }
                }
            }
            else if (paths[0] == "timeline")
            {
                service = new DashboardPages.Timeline(S);
            }
            else if (paths[0] == "users")
            {
                service = new DashboardPages.Users(S);
            }

            //render sub page
            service.websiteId = websiteId;
            html = service.Render(subpath);

            return new Tuple<Page, string>(service, html);
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
