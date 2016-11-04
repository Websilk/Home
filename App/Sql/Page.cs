using System.Collections.Generic;

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
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$pageId", pageId.ToString(), 0, enumSqlParameterType.isNumber));
            return new SqlReader(S, "EXEC GetPageInfoFromPageId @pageId=$pageId", parameters);
        }

        public SqlReader GetPageInfoFromDomain(string domain)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$domain", domain, 50));
            return new SqlReader(S, "EXEC GetPageInfoFromDomain @domain=$domain", parameters);
        }

        public SqlReader GetPageInfoFromDomainAndTitle(string domain, string title)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$domain", domain, 50));
            parameters.Add(new SqlParameter("$title", title, 250));
            return new SqlReader(S, "EXEC GetPageInfoFromDomainAndTitle @domain=$domain, @title=$title", parameters);
        }

        public SqlReader GetPageInfoFromSubDomain(string domain, string subDomain)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$domain", domain, 50));
            parameters.Add(new SqlParameter("$subdomain", subDomain, 25));
            return new SqlReader(S, "EXEC GetPageInfoFromSubDomain @domain=$domain, @subdomain=$subdomain", parameters);
        }

        public SqlReader GetPageInfoFromSubDomainAndTitle(string domain, string subDomain, string title)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$domain", domain, 50));
            parameters.Add(new SqlParameter("$subdomain", subDomain, 25));
            parameters.Add(new SqlParameter("$title", title, 250));
            return new SqlReader(S, "EXEC GetPageInfoFromSubDomainAndTitle @domain=$domain, @subdomain=$subdomain, @title=$title", parameters);
        }

        #endregion
    }
}
