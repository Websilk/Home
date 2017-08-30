using System.Collections.Generic;

namespace Websilk.Query
{
    public class Users : QuerySql
    {

        #region "Account"
        public Models.User AuthenticateUser(string email, string password)
        {
            var list = Sql.Populate<Models.User>("User_Authenticate",
                new Dictionary<string, object>()
                {
                    {"email", email },
                    {"password", password }
                }
            );
            if (list.Count > 0) { return list[0]; }
            return null;
        }

        public void UpdatePassword(int userId, string password)
        {
            Sql.ExecuteNonQuery("User_UpdatePassword",
                new Dictionary<string, object>()
                {
                    {"userId", userId },
                    {"password", password }
                }
            );
        }

        public string GetEmail(int userId)
        {
            return Sql.ExecuteScalar<string>("User_GetEmail",
                new Dictionary<string, object>()
                {
                    {"userId", userId }
                }
            );
        }

        public string GetPassword(string email)
        {
            return Sql.ExecuteScalar<string>("User_GetPassword",
                new Dictionary<string, object>()
                {
                    {"email", email }
                }
            );
        }

        public void UpdateEmail(int userId, string email)
        {
            Sql.ExecuteNonQuery("User_UpdateEmail",
                new Dictionary<string, object>()
                {
                    {"userId", userId },
                    {"email", email }
                }
            );
        }
        #endregion
    }
}
