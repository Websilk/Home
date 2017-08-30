using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace Websilk
{
    public class Service
    {
        protected Core S;
        public Dictionary<string, string> Form = new Dictionary<string, string>();
        public IFormFileCollection Files;

        public Service(Core WebsilkCore) {
            S = WebsilkCore;
        }

    }
}
