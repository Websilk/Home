using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Websilk
{
    public class User
    {
        public Core S;

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

        public List<structSecurityWebsite> security;

        public User(Core DatasilkCore)
        {
            S = DatasilkCore;
        }

        public List<structSecurityWebsite> Security
        {
            get {
                if(security == null)
                {
                    if (S.Session.Keys.Contains("security"))
                    {
                        //get security from user session
                        var bytes = S.Session.Get("security");
                        var sec = Encoding.UTF8.GetString(bytes, 0, bytes.Length);
                        security = (List<structSecurityWebsite>)S.Util.Serializer.ReadObject(sec, typeof(List<structSecurityWebsite>));
                    }
                    else
                    {
                        //create new security object
                        security = new List<structSecurityWebsite>();
                    }
                }
                return security;
            }
            set { security = value; }
        }
        public bool LogIn(string email, string password, int websiteId, int ownerId)
        {
            var query = new Query.Users(S.Server.sqlConnectionString);
            var user = query.AuthenticateUser(email, password);
            if (user != null)
            {
                //populate S.User properties
                S.User.LogIn(user.userId, user.email, "", user.datecreated, user.displayname, 1, user.photo);

                //get initial security for this website
                if (!Security.Any(a => a.websiteId == websiteId))
                {
                    Security.Add(GetSecurityForWebsite(user.userId, websiteId, ownerId));
                    var sec = S.Util.Serializer.WriteObjectToString(security);
                    S.Session.Set("security", Encoding.ASCII.GetBytes(sec));
                }
                return true;
            }

            return false;
        }

        #region "passwords"
        public string EncryptPassword(string email, string password)
        {
            var bCrypt = new BCrypt.Net.BCrypt();
            return BCrypt.Net.BCrypt.HashPassword(email + S.Server.salt + password, S.Server.bcrypt_workfactor);
        }

        public bool DecryptPassword(string email, string password, string encrypted)
        {
            return BCrypt.Net.BCrypt.Verify(email + S.Server.salt + password, encrypted);
        }
        #endregion

        #region "security"
        public structSecurityWebsite GetSecurityForWebsite(int userId, int websiteId, int ownerId)
        {
            var query = new Query.Security(S.Server.sqlConnectionString);
            var secure = new structSecurityWebsite();
            var items = new Dictionary<string, bool[]>();
            secure.websiteId = websiteId;
            secure.ownerId = ownerId;
            var sec = query.GetSecurity(websiteId, userId);
            if (sec != null)
            {
                

                IEnumerable<bool> GetBits(byte b)
                {
                    for (int i = 0; i < 8; i++)
                    {
                        yield return (b & 0x80) != 0;
                        b *= 2;
                    }
                }

                foreach (var item in sec)
                {
                    var data = item.security;
                    if (data != null)
                    {
                        //get security items
                        bool[] bits = data.SelectMany(GetBits).ToArray();
                        items.Add(item.feature, bits);
                    }
                }
            }
            secure.security = items;
            return secure;
        }

        public bool checkSecurity(int websiteId, string feature, enumSecurity securityIndex)
        {
            var i = Security.FindIndex(a => a.websiteId == websiteId);
            if (i >= 0)
            {
                var website = Security[i];
                if (website.ownerId == S.User.userId) { return true; } //website owner
                if (website.security.ContainsKey(feature))
                {
                    var data = website.security[feature];
                    if (data != null)
                    {
                        if (data.Length >= (int)securityIndex + 1)
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