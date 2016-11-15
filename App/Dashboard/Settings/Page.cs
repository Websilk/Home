using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Pages.DashboardPages
{
    public class Settings: StaticPage
    {
        public Settings(Core WebsilkCore, Page page): base(WebsilkCore, page) { }

        public override Services.Inject LoadSubPage(string path)
        {
            var inject = new Services.Inject();
            if(path != "")
            {
                //load sub page
                switch (path)
                {
                    case "domains":

                        break;
                }
            }else
            {
                //load settings interface
                scaffold = new Scaffold(S, "/App/Dashboard/Settings/settings.html");
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}
