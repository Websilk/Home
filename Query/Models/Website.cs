using System;

namespace Websilk.Query.Models
{
    public class Website
    {
        public int websiteId { get; set; } // int
        public int ownerId { get; set; } // int
        public string title { get; set; } // nvarchar(100)
        public string description { get; set; } 
        public DateTime datecreated { get; set; } // datetime
        public int? status { get; set; } // int
        public bool enabled { get; set; } // bit
        public bool deleted { get; set; } // bit
        public string domain { get; set; } // nvarchar(255)
        public string liveUrl { get; set; } // nvarchar(255)
        public string stageUrl { get; set; } // nvarchar(255)
        public bool logo { get; set; } // bit
        public byte[] security { get; set; } // binary(32)

    }
}
