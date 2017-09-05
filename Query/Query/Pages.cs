using System;
using System.Collections.Generic;

namespace Websilk.Query
{
    public class Pages : QuerySql
    {
        public Pages(string connectionString) : base(connectionString)
        {
        }

        public void CreatePage(int ownerId, int websiteId, int parentId, string title, string description, bool security = false, bool enabled = true)
        {
            Sql.ExecuteNonQuery(
                "Page_Create",
                new Dictionary<string, object>()
                {
                    {"ownerId", ownerId },
                    {"websiteId", websiteId },
                    {"parentId", parentId },
                    {"title", title },
                    {"description", description },
                    {"security", security },
                    {"enabled", enabled }
                }
            );
        }

        public void DeletePage(int websiteId, int pageId)
        {
            Sql.ExecuteNonQuery(
                "Page_Delete",
                new Dictionary<string, object>()
                {
                    {"websiteId", websiteId },
                    {"pageId", pageId }
                }
            );
        }

        public Models.PageInfo GetPageInfo(int websiteId, int pageId)
        {
            var list = Sql.Populate<Models.PageInfo>(
                "Page_Get",
                new Dictionary<string, object>()
                {
                    {"websiteId", websiteId },
                    {"pageId", pageId }
                }
            );
            if(list.Count > 0) { return list[0]; }
            return null;
        }

        public void UpdatePage(int websiteId, int pageId, string title, string description, bool security, bool enabled)
        {
            Sql.ExecuteNonQuery("Page_Update",
                new Dictionary<string, object>()
                {
                    {"websiteId", websiteId },
                    {"title", title },
                    {"description", description },
                    {"security", security },
                    {"enabled", enabled }
                }
            );
        }

        public void UpdatePageModifiedDate(int websiteId, int pageId)
        {
            Sql.ExecuteNonQuery("Page_UpdateModified",
                new Dictionary<string, object>()
                {
                    {"websiteId", websiteId },
                    {"pageId", pageId }
                }
            );
        }

        public List<Models.PageInfo> GetPagesList(int websiteId, int parentId, int start = 1, int length = 50, int orderby = 0, string search = "")
        {
            return Sql.Populate<Models.PageInfo>(
                "Pages_GetList",
                new Dictionary<string, object>()
                {
                    {"websiteId", websiteId },
                    {"parentId", parentId },
                    {"start", start },
                    {"length", length },
                    {"orderby", orderby },
                    {"search", search }
                }
            );
        }
    }
}
