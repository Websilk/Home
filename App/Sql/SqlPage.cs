using System.Collections.Generic;
using System.Data.SqlClient;

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
            parameters.Add(new SqlParameter("@_pageId", pageId.ToString()));
            return new SqlReader(S, "EXEC GetPageInfoFromPageId @pageId=@_pageId", parameters);
        }

        public SqlReader GetPageInfoFromDomain(string domain)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_domain", domain));
            return new SqlReader(S, "EXEC GetPageInfoFromDomain @domain=@_domain", parameters);
        }

        public SqlReader GetPageInfoFromDomainAndTitle(string domain, string title)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_domain", domain));
            parameters.Add(new SqlParameter("@_title", title));
            return new SqlReader(S, "EXEC GetPageInfoFromDomainAndTitle @domain=@_domain, @title=@_title", parameters);
        }

        public SqlReader GetPageInfoFromSubDomain(string domain, string subDomain)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_domain", domain));
            parameters.Add(new SqlParameter("@_subdomain", subDomain));
            return new SqlReader(S, "EXEC GetPageInfoFromSubDomain @domain=@_domain, @subdomain=@_subdomain", parameters);
        }

        public SqlReader GetPageInfoFromSubDomainAndTitle(string domain, string subDomain, string title)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_domain", domain));
            parameters.Add(new SqlParameter("@_subdomain", subDomain));
            parameters.Add(new SqlParameter("@_title", title));
            return new SqlReader(S, "EXEC GetPageInfoFromSubDomainAndTitle @domain=@_domain, @subdomain=@_subdomain, @title=@_title", parameters);
        }

        public SqlReader GetPageTitle(int pageId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_pageId", pageId.ToString()));
            return new SqlReader(S, "EXEC GetPageTitle @pageId=@_pageId", parameters);
        }

        public SqlReader GetPagesForWebsite(int websiteId, int parentId = 0, int start = 1, int length = 100, int orderby = 4, string search = "")
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_websiteId", websiteId.ToString()));
            parameters.Add(new SqlParameter("@_parentId", parentId.ToString()));
            parameters.Add(new SqlParameter("@_start", start.ToString()));
            parameters.Add(new SqlParameter("@_length", length.ToString()));
            parameters.Add(new SqlParameter("@_orderby", orderby.ToString()));
            parameters.Add(new SqlParameter("@_search", search));
            return new SqlReader(S, "EXEC GetPagesForWebsite @websiteId=@_websiteId, @parentId=@_parentId, @start=@_start, @length=@_length, @orderby=@_orderby, @search=@_search", parameters);
        }

        public SqlReader GetWebsiteDomains(int websiteId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_websiteId", websiteId.ToString()));
            return new SqlReader(S, "EXEC GetWebsiteDomains @websiteId=@_websiteId", parameters);
        }

        #endregion

        #region "Create"
        public void Create(int ownerId, int websiteId, int parentId, string title, string description, enumPageType pageType, string service = "", bool security = false, bool enabled = true)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@_ownerId", ownerId.ToString()));
            parameters.Add(new SqlParameter("@_websiteId", websiteId.ToString()));
            parameters.Add(new SqlParameter("@_parentId", parentId.ToString()));
            parameters.Add(new SqlParameter("@_title", title));
            parameters.Add(new SqlParameter("@_description", description));
            parameters.Add(new SqlParameter("@_pageType", ((int)pageType).ToString()));
            parameters.Add(new SqlParameter("@_service", service));
            parameters.Add(new SqlParameter("@_security", security == true ? "1" : "0"));
            parameters.Add(new SqlParameter("@_enabled", enabled == true ? "1" : "0"));
            S.Sql.ExecuteNonQuery("EXEC AddWebsitePage @ownerId=@_ownerId, @websiteId=@_websiteId, @parentId=@_parentId, @title=@_title, @description=@_description, @pageType=@_pageType, @service=@_service, @security=@_security, @enabled=@_enabled", parameters);
        }
        #endregion
    }
}
