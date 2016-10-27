namespace Websilk.SqlQueries
{
    public class User : SqlQuery
    {
        public User(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        #region "Account"
            
        #endregion 

        #region "Security"
        public SqlReader GetWebsiteSecurity(int websiteId, int userId)
        {
            return new SqlReader(S, "EXEC GetSecurityForWebsite @websiteId=" + websiteId + ", @userId=" + userId);
        }
        #endregion
    }
}