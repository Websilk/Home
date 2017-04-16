using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Pages.DashboardPages.Settings
{
    public class Themes: StaticPage
    {
        public Themes(Core WebsilkCore, Page page): base(WebsilkCore, page) { }

        public override Services.Inject LoadSubPage(string path)
        {
            var inject = new Services.Inject();
            if(path != "")
            {
                //load sub page
                switch (path)
                {
                    case "???":

                        break;
                }
            }else
            {
                //load settings interface
                scaffold = new Scaffold(S, "/Dashboard/Settings/Themes/themes.html");
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}
