using System;

namespace Websilk.Query.Models
{
    public class Website
    {
        public int ownerId { get; set; }
        public string title { get; set; }
        public DateTime datecreated { get; set; }
        public int status { get; set; }
        public bool enabled { get; set; }
        public bool deleted { get; set; }
        public string liveUrl { get; set; }
        public string stageUrl { get; set; }
        public bool logo { get; set; }
    }
}
