using System.Collections.Generic;

namespace Websilk.SqlQueries
{
    public class Page : SqlQuery
    {
        public enum enumPageType
        {
            dynamic = 0,
            service = 1,
            shadow = 2,
            clone = 3
        }

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

        public SqlReader GetPageTitle(int pageId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$pageId", pageId.ToString(), 0, enumSqlParameterType.isNumber));
            return new SqlReader(S, "EXEC GetPageTitle @pageId=$pageId", parameters);
        }

        public SqlReader GetPagesForWebsite(int websiteId, int parentId = 0, int start = 1, int length = 100, int orderby = 4, string search = "")
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$websiteId", websiteId.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$parentId", parentId.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$start", start.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$length", length.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$orderby", orderby.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$search", search, 50));
            return new SqlReader(S, "EXEC GetPagesForWebsite @websiteId=$websiteId, @parentId=$parentId, @start=$start, @length=$length, @orderby=$orderby, @search=$search", parameters);
        }

        public SqlReader GetWebsiteDomains(int websiteId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$websiteId", websiteId.ToString()));
            return new SqlReader(S, "EXEC GetWebsiteDomains @websiteId=$websiteId", parameters);
        }

        #endregion

        #region "Create"
        public void Create(int ownerId, int websiteId, int parentId, string title, string description, enumPageType pageType, string service = "", bool security = false, bool enabled = true)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("$ownerId", ownerId.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$websiteId", websiteId.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$parentId", parentId.ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$title", title, 250));
            parameters.Add(new SqlParameter("$description", description, 160));
            parameters.Add(new SqlParameter("$pageType", ((int)pageType).ToString(), 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$service", service, 100));
            parameters.Add(new SqlParameter("$security", security == true ? "1" : "0", 0, enumSqlParameterType.isNumber));
            parameters.Add(new SqlParameter("$enabled", enabled == true ? "1" : "0", 0, enumSqlParameterType.isNumber));
            S.Sql.ExecuteNonQuery("EXEC AddWebsitePage @ownerId=$ownerId, @websiteId=$websiteId, @parentId=$parentId, @title=$title, @description=$description, @pageType=$pageType, @service=$service, @security=$security, @enabled=$enabled", parameters);
        }
        #endregion
    }
}
