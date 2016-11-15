using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Pages.DashboardPages
{
    public class Downloads: StaticPage
    {
        public Downloads(Core WebsilkCore, Page page): base(WebsilkCore, page) { }

        public override Services.Inject LoadSubPage(string path)
        {
            var inject = new Services.Inject();
            if(path != "")
            {
                //load sub page
                switch (path)
                {
                    case "folders":

                        break;
                }
            }else
            {
                //load downloads list
                scaffold = new Scaffold(S, "/App/Dashboard/Downloads/downloads.html");
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}
