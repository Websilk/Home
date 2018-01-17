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

        public override string Render(string[] path, string body = "", object metadata = null)
        {
            //start with initial default website Id
            this.website.id = 1;
            

            if (S.Request.Query.ContainsKey("website"))
            {
                this.website.id = int.Parse(S.Request.Query["website"].ToString());
            }

            //get website information from database
            var query = new Query.Websites(S.Server.sqlConnectionString);
            var website = query.GetWebsiteInfo(this.website.id);

            //check if website exists
            if (website == null) { return AccessDenied(true, new Login(S)); }

            this.website.protocol = "https://";
            this.website.host = website.domain;
            this.website.title = website.title;
            this.website.liveUrl = website.liveUrl;
            this.website.stageUrl = website.stageUrl;

            //check security
            if (!User.checkSecurity(this.website.id, "websilk", User.enumSecurity.read)) { return AccessDenied(true, new Login(S)); }

            //set up client-side dependencies
            AddCSS("/css/pages/dashboard/dashboard.css");
            AddScript("js/pages/dashboard/dashboard.js");

            //load the dashboard layout
            var scaffold = new Scaffold("/Pages/Dashboard/dashboard.html", S.Server.Scaffold);
            var scaffMenu = new Scaffold("/Pages/Dashboard/menu-item.html", S.Server.Scaffold);

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
                menuItem("Files", "files", "/dashboard/files", "layers"),
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

            //get dashboard section name
            var subPath = S.Request.Path.ToString().Replace("dashboard", "").Substring(1);
            if(subPath == "") { subPath = "pages"; }
            var html = "";

            //load dashboard section
            Page subpage = null;
            var t = LoadSubPage(subPath);
            subpage = t.Item1;
            html = t.Item2;
            if (html == "") { return AccessDenied(true, new Login(S)); }
            scaffold.Data["body"] = html;

            //set up page info
            title = website.title + " - Dashboard - " + subpage.title;

            //include dashboard section javascript dependencies
            scripts += subpage.scripts;

            //render base layout along with dashboard section
            return base.Render(path, scaffold.Render());
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
            service.website.id = this.website.id;
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
