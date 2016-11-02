using System.Collections.Generic;
using Newtonsoft.Json;

namespace Websilk
{
    public class User
    {
        [JsonIgnore]
        public Core S;
        
        public int userId = 0;
        public string visitorId = "";
        public string email = "";
        public string photo = "";
        public string displayName = "";
        public bool isBot = false;
        public bool useAjax = true;
        public bool isMobile = false;
        public bool isTablet = false;

        public User()
        {
        }

        public void Load(Core WebsilkCore)
        {
            S = WebsilkCore;

            //generate visitor id
            if (visitorId == "" || visitorId == null) { visitorId = S.Util.Str.CreateID(); }
        }


        public bool LogIn(string email, string pass)
        {
            return false;
        }

        public void LogOut()
        {
            S.Session.Remove("user");
        }
        
    }
}
