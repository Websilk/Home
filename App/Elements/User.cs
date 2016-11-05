using System.Collections.Generic;
using Newtonsoft.Json;
using BCrypt.Net;

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
                var parameters = new List<SqlParameter>();
                parameters.Add(new SqlParameter("$userId", userId.ToString(), 0, enumSqlParameterType.isNumber));
                emailAddr = (string)S.Sql.ExecuteScalar("EXEC GetUserEmail @userId=$userId", parameters);
                if (emailAddr != "" && emailAddr != null) { update = true; }
            }
            if(update == true)
            {
                //generate salt
                var salt = S.Server.encryption.salt.Substring(0, S.Server.encryption.spliceIndex) + emailAddr +
                            S.Server.encryption.salt.Substring(S.Server.encryption.spliceIndex);
                var bCrypt = new BCrypt.Net.BCrypt();
                var encrypted = "";
                var sqlUser = new SqlQueries.User(S);
                sqlUser.UpdatePassword(userId, encrypted);
            }
            return false;
        }
    }
}
