using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Pages.DashboardPages
{
    public class Photos: StaticPage
    {
        public Photos(Core WebsilkCore, Page page): base(WebsilkCore, page) { }

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
                //load photos list
                scaffold = new Scaffold(S, "/Dashboard/Photos/photos.html");
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}
