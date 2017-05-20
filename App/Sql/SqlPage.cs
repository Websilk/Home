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
            parameters.Add(new SqlParameter("@pageId", pageId.ToString()));
            return new SqlReader(S, "EXEC Page_Info_GetFromPageId @pageId=@pageId", parameters);
        }

        public SqlReader GetPageInfoFromDomain(string domain)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@domain", domain));
            return new SqlReader(S, "EXEC Page_Info_GetFromDomain @domain=@domain", parameters);
        }

        public SqlReader GetPageInfoFromDomainAndTitle(string domain, string title)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@domain", domain));
            parameters.Add(new SqlParameter("@title", title));
            return new SqlReader(S, "EXEC Page_Info_GetFromDomainAndTitle @domain=@domain, @title=@title", parameters);
        }

        public SqlReader GetPageInfoFromSubDomain(string domain, string subDomain)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@domain", domain));
            parameters.Add(new SqlParameter("@subdomain", subDomain));
            return new SqlReader(S, "EXEC Page_Info_GetFromSubDomain @domain=@domain, @subdomain=@subdomain", parameters);
        }

        public SqlReader GetPageInfoFromSubDomainAndTitle(string domain, string subDomain, string title)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@domain", domain));
            parameters.Add(new SqlParameter("@subdomain", subDomain));
            parameters.Add(new SqlParameter("@title", title));
            return new SqlReader(S, "EXEC Page_Info_GetFromSubDomainAndTitle @domain=@domain, @subdomain=@subdomain, @title=@title", parameters);
        }

        public SqlReader GetPageTitle(int pageId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@pageId", pageId.ToString()));
            return new SqlReader(S, "EXEC Page_GetTitle @pageId=@pageId", parameters);
        }

        public SqlReader GetPagesForWebsite(int websiteId, int parentId = 0, int start = 1, int length = 100, int orderby = 4, string search = "")
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@websiteId", websiteId.ToString()));
            parameters.Add(new SqlParameter("@parentId", parentId.ToString()));
            parameters.Add(new SqlParameter("@start", start.ToString()));
            parameters.Add(new SqlParameter("@length", length.ToString()));
            parameters.Add(new SqlParameter("@orderby", orderby.ToString()));
            parameters.Add(new SqlParameter("@search", search));
            return new SqlReader(S, "EXEC Pages_GetList @websiteId=@websiteId, @parentId=@parentId, @start=@start, @length=@length, @orderby=@orderby, @search=@search", parameters);
        }

        public SqlReader GetWebsiteDomains(int websiteId)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@websiteId", websiteId.ToString()));
            return new SqlReader(S, "EXEC Website_Domains_GetList @websiteId=@websiteId", parameters);
        }

        #endregion

        #region "Create"
        public void Create(int ownerId, int websiteId, int parentId, string title, string description, enumPageType pageType, string layout = "", string service = "", bool security = false, bool enabled = true)
        {
            var parameters = new List<SqlParameter>();
            parameters.Add(new SqlParameter("@ownerId", ownerId.ToString()));
            parameters.Add(new SqlParameter("@websiteId", websiteId.ToString()));
            parameters.Add(new SqlParameter("@parentId", parentId.ToString()));
            parameters.Add(new SqlParameter("@title", title));
            parameters.Add(new SqlParameter("@description", description));
            parameters.Add(new SqlParameter("@pageType", ((int)pageType).ToString()));
            parameters.Add(new SqlParameter("@layout", service));
            parameters.Add(new SqlParameter("@service", service));
            parameters.Add(new SqlParameter("@security", security == true ? "1" : "0"));
            parameters.Add(new SqlParameter("@enabled", enabled == true ? "1" : "0"));
            S.Sql.ExecuteNonQuery("EXEC Page_Create @ownerId=@ownerId, @websiteId=@websiteId, @parentId=@parentId, @title=@title, @description=@description, @pageType=@pageType, @layout=@layout, @service=@service, @security=@security, @enabled=@enabled", parameters);
        }
        #endregion
    }
}
