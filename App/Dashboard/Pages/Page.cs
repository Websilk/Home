using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Pages.DashboardPages
{
    public class Pages: StaticPage
    {
        public Pages(Core WebsilkCore, Page page): base(WebsilkCore, page) { }

        public override Services.Inject LoadSubPage(string path)
        {
            var inject = new Services.Inject();
            if(path != "")
            {
                //load sub page
                switch (path)
                {
                    case "settings":

                        break;
                }
            }else
            {
                //load pages list
                var servePage = new Services.Dashboard.Pages(S);
                servePage.page = page;
                scaffold = new Scaffold(S, "/App/Dashboard/Pages/pages.html");
                scaffold.Data["page-list"] = servePage.View(0, 1, 1000, 4, 0, "").html;
                S.javascriptFiles.Add("dash-pages", "/js/dashboard/pages/pages.js");
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}
