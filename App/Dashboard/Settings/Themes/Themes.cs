using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Pages.DashboardPages.Settings
{
    public class Themes: Page
    {
        public Themes(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public override string Render(string[] path, string query = "", string body = "")
        {

                //load downloads list
                var scaffold = new Scaffold(S, "/Dashboard/Settings/Themes/themes.html");
                return scaffold.Render();
        }
    }
}
