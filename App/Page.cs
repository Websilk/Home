﻿using System;

namespace Websilk
{
    public class Page
    {

        public Core S;

        public Page(Core WebsilkCore)
        {
            S = WebsilkCore;
        }

        public virtual string Render(string[] path, string query)
        {
            return "";
        }
    }
}
