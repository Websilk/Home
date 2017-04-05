using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Services.Editor
{
    public class Support : Service
    {
        public Support(Core WebsilkCore):base(WebsilkCore) { }

        public string Get(string page)
        {
            return S.Server.LoadFileFromCache("/App/Support/" + page + ".html");
        }

        public string Search(string keywords)
        {
            return "";
        }
    }
}
