using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk.Services
{
    public class User: Service
    {
        public User(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public string Authenticate(string email, string password)
        {
            var websiteId = 1;
            var ownerId = 1;
            if(S.User.LogIn(email, password, websiteId, ownerId) == true)
            {
                return "success";
            }
            return "err";
        }

        public string SaveAdminPassword(string password)
        {
            if(S.Server.resetPass == true)
            {
                S.User.UpdateAdminPassword(password);
                return "success";
            }
            S.Response.StatusCode = 500;
            return "";
        }
    }
}
