using System;

namespace Websilk.Query.Models
{
    public class PageInfo
    {
        public int websiteid { get; set; }
        public int pageid { get; set; }
        public int parentid { get; set; }
        public int ownerId { get; set; }
        public string websitetitle { get; set; }
        public string title { get; set; }
        public string description { get; set; }
        public string path { get; set; }
        public string pathIds { get; set; }
        public int pathlvl { get; set; }
        public string parenttitle { get; set; }
        public int haschildren { get; set; }
        public int subpages { get; set; }
        public int status { get; set; }
        public bool security { get; set; }
        public bool favorite { get; set; }
        public DateTime datecreated { get; set; }
        public bool enabled { get; set; }
        public bool deleted { get; set; }
    }
}
