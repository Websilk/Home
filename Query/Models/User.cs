using System;
namespace Websilk.Query.Models
{
    public class User
    {
        public int userId { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string displayname { get; set; }
        public string photo { get; set; }
        public DateTime lastlogin { get; set; }
        public DateTime datecreated { get; set; }
        public int status { get; set; }
        public string signupip { get; set; }
        public string referrer { get; set; }
        public string activation { get; set; }
        public bool deleted { get; set; }
    }
}
