using System.Collections.Generic;
using System.Data.SqlClient;

namespace Websilk.SqlQueries
{
    public class User : SqlQuery
    {
        public User(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        #region "Account"
        public SqlReader AuthenticateUser(string email, string password)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_email", email));
            parameters.Add(new SqlParameter("@_password", password));
            return new SqlReader(S, "EXEC AuthenticateUser @email=@_email, @password=@_password", parameters);
        }

        public SqlReader UpdatePassword(int userId, string password)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_userId", userId.ToString()));
            parameters.Add(new SqlParameter("@_password", password));
            return new SqlReader(S, "EXEC UpdateUserPassword @userId=@_userId, @password=@_password", parameters);
        }

        public string GetEmail(int userId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_userId", userId.ToString()));
            return (string)S.Sql.ExecuteScalar("EXEC GetUserEmail @userId=@_userId", parameters);
        }

        public string GetPassword(string email)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_email", email));
            return (string)S.Sql.ExecuteScalar("EXEC GetUserPassword @email=@_email", parameters);
        }

        public SqlReader UpdateEmail(int userId, string email)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_userId", userId.ToString()));
            parameters.Add(new SqlParameter("@_email", email));
            return new SqlReader(S, "EXEC UpdateUserEmail @userId=@_userId, @email=@_email", parameters);
        }
        #endregion

        #region "Security"
        public SqlReader GetWebsiteSecurity(int websiteId, int userId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_websiteId", websiteId.ToString()));
            parameters.Add(new SqlParameter("@_userId", userId.ToString()));
            return new SqlReader(S, "EXEC GetSecurityForWebsite @websiteId=@_websiteId, @userId=@_userId", parameters);
        }


        #endregion
    }
}