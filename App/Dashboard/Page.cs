using System.Collections.Generic;
using System.Text;

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

            //generate menu system
            var menu = new StringBuilder();
            var menus = new List<structMenuItem>()
            {
                menuItem("Timeline", "dashboard/timeline", "timeline"),
                menuItem("Pages", "/dashboard/pages", "pages"),
                menuItem("Photos", "/dashboard/photos", "photo")
            };
            foreach(var item in menus)
            {
                menu.Append("<ul class=\"menu\">" + renderMenuItem(scaffMenu, item, 0) + "</ul>");
            }
            scaffold.Data["menu"] = menu.ToString();

            //TODO: get apps available to the user for this website
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
                        subs.Append("<div class=\"row submenu\"><ul class=\"menu\">" + renderMenuItem(scaff, sub, level + 1) + "</ul></div>");
                    }
                }
            }
            scaff.Data["label"] = item.label;
            scaff.Data["href"] = item.href == "" ? "javascript:" : item.href;
            scaff.Data["icon"] = item.icon;
            scaff.Data["gutter"] = gutter;
            scaff.Data["submenu"] = subs.ToString();
            return scaff.Render();
        }
    }
}
