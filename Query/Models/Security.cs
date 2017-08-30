using System;

namespace Websilk.Query.Models
{
    public class Security
    {
        public int websiteId { get; set; }
        public int pageId { get; set; }
        public int userId { get; set; }
        public string feature { get; set; }
        public string security { get; set; }
    }
}
