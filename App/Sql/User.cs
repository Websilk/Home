using System.Collections.Generic;

namespace Websilk.SqlQueries
{
    public class User : SqlQuery
    {
        public User(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        #region "Account"
        public SqlReader UpdatePassword(int userId, string password)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$userId", userId.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$password", password, 100));
            return new SqlReader(S, "EXEC UpdatePassword @userId=$userId, @password=$password", parameters);
        }

        public string GetEmail(int userId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$userId", userId.ToString(), 0, enumSqlParameterType.isNumber));
            return (string)S.Sql.ExecuteScalar("EXEC GetUserEmail @userId=$userId", parameters);
        }
        #endregion

        #region "Security"
        public SqlReader GetWebsiteSecurity(int websiteId, int userId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$websiteId", websiteId.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$userId", userId.ToString(), 0, enumSqlParameterType.isNumber));
            return new SqlReader(S, "EXEC GetSecurityForWebsite @websiteId=$websiteId, @userId=$userId", parameters);
        }


        #endregion
    }
}