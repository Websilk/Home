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
            parameters.Add(new SqlParameter("@email", email));
            parameters.Add(new SqlParameter("@password", password));
            return new SqlReader(S, "EXEC Security_AuthenticateUser @email=@email, @password=@password", parameters);
        }

        public SqlReader UpdatePassword(int userId, string password)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@userId", userId.ToString()));
            parameters.Add(new SqlParameter("@password", password));
            return new SqlReader(S, "EXEC User_UpdatePassword @userId=@userId, @password=@password", parameters);
        }

        public string GetEmail(int userId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@userId", userId.ToString()));
            return (string)S.Sql.ExecuteScalar("EXEC User_GetEmail @userId=@userId", parameters);
        }

        public string GetPassword(string email)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@email", email));
            return (string)S.Sql.ExecuteScalar("EXEC User_GetPassword @email=@email", parameters);
        }

        public SqlReader UpdateEmail(int userId, string email)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@userId", userId.ToString()));
            parameters.Add(new SqlParameter("@email", email));
            return new SqlReader(S, "EXEC User_UpdateEmail @userId=@userId, @email=@email", parameters);
        }
        #endregion

        #region "Security"
        public SqlReader GetWebsiteSecurity(int websiteId, int userId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@websiteId", websiteId.ToString()));
            parameters.Add(new SqlParameter("@userId", userId.ToString()));
            return new SqlReader(S, "EXEC Security_GetWebsite @websiteId=@websiteId, @userId=@userId", parameters);
        }


        #endregion
    }
}