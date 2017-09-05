using System;
using System.Collections.Generic;

namespace Websilk.Models
{
    public class Page
    {
        public string title;
        public DateTime dateCreated;
        public DateTime dateModified;
        public int userIdModified;
    }

    public class Pages
    {
        public List<Page> Items;
    }
}