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

        public override string Render(string[] path, string body = "", object metadata = null)
        {

                //load downloads list
                var scaffold = new Scaffold("/Pages/Dashboard/Settings/Themes/themes.html");
                return scaffold.Render();
        }
    }
}
