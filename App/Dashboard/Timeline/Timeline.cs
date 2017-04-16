using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Pages.DashboardPages
{
    public class Timeline: StaticPage
    {
        public Timeline(Core WebsilkCore, Page page): base(WebsilkCore, page) { }

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
                //load timeline
                scaffold = new Scaffold(S, "/Dashboard/Timeline/timeline.html");
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}
