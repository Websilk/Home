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

        [JsonIgnore]
        public bool saveSession = false;

        public User()
        {
        }

        public void Load(Core WebsilkCore)
        {
            S = WebsilkCore;

            //generate visitor id
            if (visitorId == "" || visitorId == null) { visitorId = S.Util.Str.CreateID(); saveSession = true; }
        }

        /// <summary>
        /// Authenticate user credentials and log into user account
        /// </summary>
        /// <param name="email"></param>
        /// <param name="pass"></param>
        /// <returns></returns>
        public bool LogIn(string email, string password)
        {
            saveSession = true;
            var sqlUser = new SqlQueries.User(S);
            var dbpass = sqlUser.GetPassword(email);
            if(dbpass == "") { return false; }
            if(BCrypt.Net.BCrypt.Verify(password, dbpass))
            {
                //password verified by Bcrypt
                var user = sqlUser.AuthenticateUser(email, dbpass);
                if (user.Rows.Count > 0)
                {
                    user.Read();
                    userId = user.GetInt("userId");
                    this.email = email;
                    photo = user.Get("photo");
                    displayName = user.Get("displayname");
                    return true;
                }
            }
            
            return false;
        }

        public void LogOut()
        {
            saveSession = true;
            S.Session.Remove("user");
        }
        
        public bool UpdatePassword(int userId, string password)
        {
            var update = false; //security check
            var emailAddr = email;
            if(S.Server.resetPass == true && userId == 1)
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
                var bCrypt = new BCrypt.Net.BCrypt();
                var encrypted = BCrypt.Net.BCrypt.HashPassword(password, S.Server.bcrypt_workfactor);
                var sqlUser = new SqlQueries.User(S);
                sqlUser.UpdatePassword(userId, encrypted);
                S.Server.resetPass = false;
            }
            return false;
        }
    }
}
