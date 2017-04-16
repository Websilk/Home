using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Pages.DashboardPages
{
    public class Users: StaticPage
    {
        public Users(Core WebsilkCore, Page page): base(WebsilkCore, page) { }

        public override Services.Inject LoadSubPage(string path)
        {
            var inject = new Services.Inject();
            if(path != "")
            {
                //load sub page
                switch (path)
                {
                    case "security":

                        break;
                }
            }else
            {
                //load users list
                scaffold = new Scaffold(S, "/Dashboard/Users/users.html");
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}
