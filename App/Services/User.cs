using System;
using System.Collections;
using System.Linq;

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
            var query = new Query.Users(S.Server.sqlConnectionString);
            var encrypted = query.GetPassword(email);
            if(encrypted != null){
                if (User.DecryptPassword(email, password, encrypted))
                {
                    if (User.LogIn(email, encrypted, websiteId, ownerId) == true)
                    {
                        return "success";
                    }
                }
            }
            return "err";
        }

        public string SaveAdminPassword(string password)
        {
            var queryUser = new Query.Users(S.Server.sqlConnectionString);
            if (S.Server.Cache.ContainsKey("resetPass") && S.Server.environment == Server.enumEnvironment.development)
            {
                //securely change admin password
                //get admin email address from database (userId = 1)
                var emailAddr = queryUser.GetEmail(1);
                if (emailAddr != "" && emailAddr != null)
                {
                    var bCrypt = new BCrypt.Net.BCrypt();
                    var encrypted = BCrypt.Net.BCrypt.HashPassword(password, S.Server.bcrypt_workfactor);

                    queryUser.UpdatePassword(1, encrypted);
                    S.Server.Cache.Remove("resetPass");
                    return Success();
                }
            }
            S.Response.StatusCode = 500;
            return "";
        }

        #region "admin account"
        public bool UpdateAdminPassword(string password)
        {
            var update = false; //security check
            var emailAddr = S.User.email;
            var queryUser = new Query.Users(S.Server.sqlConnectionString);
            var adminId = 1;
            if (S.Server.Cache.ContainsKey("resetPass") && S.Server.environment == Server.enumEnvironment.development)
            {
                //securely change admin password
                //get admin email address from database (userId = 1)
                emailAddr = queryUser.GetEmail(adminId);
                if (emailAddr != "" && emailAddr != null) { update = true; }
            }
            if (update == true)
            {
                queryUser.UpdatePassword(adminId, User.EncryptPassword(emailAddr, password));
                S.Server.Cache.Remove("resetPass");
            }
            return false;
        }

        public string CreateAdminAccount(string name, string email, string password, string website_name, string website_domain)
        {
            if (S.Server.Cache.ContainsKey("resetPass") && S.Server.environment == Server.enumEnvironment.development)
            {
                if((int)S.Server.Cache["resetPass"] > 0)
                {
                    //create user account
                    var queryUser = new Query.Users(S.Server.sqlConnectionString);
                    queryUser.CreateUser(new Query.Models.User()
                    {
                        displayname = name,
                        email = email,
                        password = User.EncryptPassword(email, password),
                        activation = "",
                        deleted = false,
                        lastlogin = DateTime.Now,
                        photo = false,
                        referrer = "",
                        signupip = "",
                        status = 1
                    });

                    //create initial website (if neccessary)
                    var queryWebsite = new Query.Websites(S.Server.sqlConnectionString);
                    if(queryWebsite.HasWebsites() == false)
                    {
                        //set up security for website owner
                        var bits = new BitArray(Enumerable.Range(0, 32 * 8).Select((a) => true).ToArray());
                        var bytes = new byte[32];
                        bits.CopyTo(bytes, 0);

                        //create initial website
                        queryWebsite.CreateWebsite(new Query.Models.Website()
                        {
                            ownerId = 1,
                            title = website_name,
                            description = "",
                            status = 1,
                            logo = false,
                            security = bytes,
                            enabled = true,
                            domain = website_domain,
                            liveUrl = "",
                            stageUrl = ""
                        });
                    }
                    S.Server.Cache.Remove("resetPass");
                    return "success";
                }
            }
            S.Response.StatusCode = 500;
            return "";
        }
        #endregion
    }
}
