using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace Websilk.SqlQueries
{
    public class Page : SqlQuery
    {
        public enum enumPageType
        {
            none = -1, //used to signify not to update page type (in SQL)
            dynamic = 0, //drag & drop (classsical) page type
            service = 1, //Websilk.Services.Service page type
            shadow = 2, //is dynamic, and loads its page layout (blocks) for all child pages
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
        public void Create(int ownerId, int websiteId, int parentId, string title, string description, enumPageType pageType, int shadowId, int shadowChildId, string layout = "", string service = "", bool security = false, bool enabled = true)
        {
            var parms = new List<SqlParameter>(){
                new SqlParameter("@ownerId", ownerId.ToString()),
                new SqlParameter("@websiteId", websiteId.ToString()),
                new SqlParameter("@parentId", parentId.ToString()),
                new SqlParameter("@title", title),
                new SqlParameter("@description", description),
                new SqlParameter("@pageType", pageType),
                new SqlParameter("@shadowId", shadowId),
                new SqlParameter("@shadowChildId", shadowChildId),
                new SqlParameter("@layout", layout),
                new SqlParameter("@service", service),
                new SqlParameter("@security", security == true ? "1" : "0"),
                new SqlParameter("@enabled", enabled == true ? "1" : "0")
            };
            S.Sql.ExecuteNonQuery("EXEC Page_Create @ownerId=@ownerId, @websiteId=@websiteId, @parentId=@parentId, @title=@title, @description=@description, @pageType=@pageType, @shadowId=@shadowId, @shadowChildId=@shadowChildId, @layout=@layout, @service=@service, @security=@security, @enabled=@enabled", parms);
        }
        #endregion

        #region "Settings"
        public void Update(int websiteId, int pageId, string titlehead, string description, enumPageType pageType, int shadowId, int shadowChildId, string layout = "", string service = "", bool security = false, bool enabled = true)
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@websiteId", websiteId.ToString()),
                new SqlParameter("@pageId", pageId.ToString()),
                new SqlParameter("@titlehead", titlehead),
                new SqlParameter("@description", description),
                new SqlParameter("@pageType", ((int)pageType).ToString()),
                new SqlParameter("@shadowId", shadowId),
                new SqlParameter("@shadowChildId", shadowChildId),
                new SqlParameter("@layout", layout),
                new SqlParameter("@service", service),
                new SqlParameter("@security", security),
                new SqlParameter("@enabled", enabled)
            };
            S.Sql.ExecuteNonQuery("EXEC Page_Update @websiteId=@websiteId, @pageId=@pageId, @titlehead=@titlehead, @description=@description, @pageType=@pageType, @shadowId=@shadowId, @shadowChildId=@shadowChildId, @layout=@layout, @service=@service, @security=@security, @enabled=@enabled", parms);
        }

        public void Delete(int websiteId, int pageId)
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@websiteId", websiteId),
                new SqlParameter("@pageId", pageId)
            };
            S.Sql.ExecuteNonQuery("EXEC Page_Delete @websiteId=@websiteId, @pageId=@pageId", parms);
        }
        #endregion

        #region "History"
        public void CreatePageHistory(int websiteId, int pageId, int userId, DateTime date)
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@websiteId", websiteId),
                new SqlParameter("@pageId", pageId),
                new SqlParameter("@userId", S.User.userId),
                new SqlParameter("@datemodified", date)
            };
            S.Sql.ExecuteNonQuery("EXEC Page_History_Create @websiteId=@websiteId, @pageId=@pageId, @userId=@userId, @datemodified=@datemodified", parms);
        }

        public SqlReader GetPageHistoryList(int websiteId, int pageId, DateTime dateStart, int length = 100)
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@websiteId", websiteId),
                new SqlParameter("@pageId", pageId),
                new SqlParameter("@dateStart", dateStart),
                new SqlParameter("@length", length)
            };
            return new SqlReader(S, "EXEC Pages_History_GetList @websiteId=@websiteId, @pageId=@pageId, @dateStart=@dateStart, @length=@length", parms);
        }
        #endregion

        #region "Shadow Templates"
        public SqlReader GetShadowTemplatesForWebsite(int websiteId)
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@websiteId", websiteId)
            };
            return new SqlReader(S, "EXEC Pages_Shadow_GetList @websiteId=@websiteId", parms);
        }

        public bool ShadowTemplateNameExists(int websiteId, string name)
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@websiteId", websiteId),
                new SqlParameter("@name", name)
            };
            return (int)S.Sql.ExecuteScalar("EXEC Pages_Shadow_Exists @websiteId=@websiteId, @name=@name", parms) > 0;
        }
        #endregion
    }
}
