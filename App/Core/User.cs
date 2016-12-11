using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Websilk
{
    public class User
    {
        public enum enumSecurity
        {
            read = 0,
            create = 1,
            update = 2,
            delete = 3
        }

        public struct structSecurityWebsite
        {
            public int websiteId;
            public int ownerId;
            public Dictionary<string, bool[]> security;
        }

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

        public List<structSecurityWebsite> security = new List<structSecurityWebsite>();

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
        public bool LogIn(string email, string password, int websiteId, int ownerId)
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

                    //get initial security for this website
                    if(!security.Any(a => a.websiteId == websiteId)){
                        security.Add(GetSecurityForWebsite(userId, websiteId, ownerId));
                    }
                    
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

        #region "security"
        public structSecurityWebsite GetSecurityForWebsite(int userId, int websiteId, int ownerId)
        {
            var sqlUser = new SqlQueries.User(S);
            var security = new structSecurityWebsite();
            var items = new Dictionary<string, bool[]>();
            security.websiteId = websiteId;
            security.ownerId = ownerId;
            var reader = sqlUser.GetWebsiteSecurity(websiteId, userId);
            if(reader.Rows.Count > 0)
            {
                while (reader.Read())
                {
                    var data = reader.Get("security");
                    var d = new string[] { };
                    var b = new List<bool>();
                    if(data != "")
                    {
                        d = data.Split(',');
                        foreach(var v in d)
                        {
                            if(v == "1") { b.Add(true); }else { b.Add(false); }
                        }
                    }
                    items.Add(reader.Get("feature"), b.ToArray());
                }
            }
            security.security = items;
            return security;
        }

        public bool checkSecurity(int websiteId, string feature, enumSecurity securityIndex)
        {
            var i = security.FindIndex(a => a.websiteId == websiteId);
            if(i >= 0)
            {
                var website = security[i];
                if(website.ownerId == userId) { return true; } //website owner
                if (website.security.ContainsKey(feature))
                {
                    var data = website.security[feature];
                    if(data != null)
                    {
                        if(data.Length >= (int)securityIndex + 1)
                        {
                            return data[(int)securityIndex];
                        }
                    }
                }
            }
            return false;
        }
        #endregion
    }
}
