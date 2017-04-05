using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.App.Support
{
    public class Support : Service
    {
        public Support(Core WebsilkCore):base(WebsilkCore) { }

        public string Get(string name)
        {
            return S.Server.LoadFileFromCache("/Support/" + name);
        }

        public string Search(string keywords)
        {
            return "";
        }
    }
}
