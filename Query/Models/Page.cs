using System;
using System.Collections.Generic;
using System.Text;

namespace Websilk.Query.Models
{
    class PageInfo
    {
        public int websiteid { get; set; }
        public int pageid { get; set; }
        public int parentid { get; set; }
        public int ownerId { get; set; }
        public string websitetitle { get; set; }
        public string title { get; set; }
        public string title_head { get; set; }
        public short pagetype { get; set; }
        public int shadowId { get; set; }
        public int shadowChildId { get; set; }
        public string layout { get; set; }
        public string service { get; set; }
        public string path { get; set; }
        public string pathIds { get; set; }
        public string parenttitle { get; set; }
        public int? subpages { get; set; }
        public string theme { get; set; }
        public string colors { get; set; }
        public string colorsEditor { get; set; }
        public string colorsDash { get; set; }
        public string description { get; set; }
        public int? pagedenied { get; set; }
        public int? page404 { get; set; }
        public int? status { get; set; }
        public bool? icon { get; set; }
        public bool security { get; set; }
        public DateTime datecreated { get; set; }
        public bool enabled { get; set; }
        public bool deleted { get; set; }
        public string googlewebpropertyid { get; set; }

    }
}
