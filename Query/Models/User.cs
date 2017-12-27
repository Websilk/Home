using System;
namespace Websilk.Query.Models
{
    public class User
    {
        public int userId { get; set; } // int
        public string email { get; set; } // nvarchar(75)
        public string password { get; set; } // nvarchar(100)
        public string displayname { get; set; } // nvarchar(25)
        public bool photo { get; set; } // bit
        public DateTime lastlogin { get; set; } // datetime
        public DateTime datecreated { get; set; } // datetime
        public int status { get; set; } // int
        public string signupip { get; set; } // nvarchar(15)
        public string referrer { get; set; } // nvarchar(250)
        public string activation { get; set; } // nchar(20)
        public bool deleted { get; set; } // bit

    }
}
