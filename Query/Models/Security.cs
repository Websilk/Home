using System;

namespace Websilk.Query.Models
{
    public class Security
    {
        public byte[] security { get; set; } // binary(32)
        public int websiteId { get; set; } // int
        public int pageId { get; set; } // int
        public int groupId { get; set; } // int
        public int userId { get; set; } // int
        public string feature { get; set; } // nvarchar(50)

    }
}
