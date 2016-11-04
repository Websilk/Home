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
        
        public bool UpdatePassword(int userId, string password)
        {
            var update = false; //security check
            var emailAddr = email;
            if(S.Server.encryption.reset == true && userId == 1)
            {
                //securely change admin password
                //get admin email address from database
                
                update = true;
            }
            if(update == true)
            {
                //generate salt
                var salt = emailAddr + S.Server.encryption.salt;
                var sqlUser = new SqlQueries.User(S);
                sqlUser.UpdatePassword(userId, salt);
            }
            return false;
        }
    }
}
