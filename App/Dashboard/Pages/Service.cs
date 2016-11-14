using System;
using System.Collections.Generic;

namespace Websilk.Services.Dashboard
{
    public class Pages : Service
    {
        public Pages(Core WebsilkCore) : base(WebsilkCore) { }

        public Inject View(int start, int length, int orderby, int viewType, string search)
        {
            var response = new Inject();
            GetPage();
            if(!S.User.checkSecurity(page.websiteId, "dashboard/pages", 0)) { return response; }
            return response;
        }
    }
}
