namespace Websilk.SqlQueries
{
    public class Page : SqlQuery
    {
        public Page(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        #region "Page Info"
        public SqlReader GetPageInfo(int pageId)
        {
            return new SqlReader(S, "EXEC GetPageInfoFromPageId @pageId=" + pageId);
        }

        public SqlReader GetPageInfoFromDomain(string domain)
        {
            return new SqlReader(S, "EXEC GetPageInfoFromDomain @domain='" + domain + "'");
        }

        public SqlReader GetPageInfoFromDomainAndTitle(string domain, string title)
        {
            return new SqlReader(S, "EXEC GetPageInfoFromDomainAndTitle @domain='" + domain + "', @title='" + title + "'");
        }

        public SqlReader GetPageInfoFromSubDomain(string domain, string subDomain)
        {
            return new SqlReader(S, "EXEC GetPageInfoFromSubDomain @domain = '" + domain + "', @subdomain='" + subDomain + "'");
        }

        public SqlReader GetPageInfoFromSubDomainAndTitle(string domain, string subDomain, string title)
        {
            return new SqlReader(S, "EXEC GetPageInfoFromSubDomainAndTitle @domain='" + domain + "', @subdomain='" + subDomain + "', @title='" + title + "'");
        }

        #endregion
    }
}
