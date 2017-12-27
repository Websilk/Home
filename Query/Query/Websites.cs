using System;
using System.Collections.Generic;

namespace Websilk.Query
{
    public class Websites : QuerySql
    {
        public Websites(string connectionString) : base(connectionString)
        {
        }

        public Models.Website GetWebsiteInfo(int websiteId)
        {
            var list = Sql.Populate<Models.Website>("Website_Get",
                new Dictionary<string, object>()
                {
                    {"websiteId", websiteId }
                }
            );
            if(list.Count > 0) { return list[0]; }
            return null;
        }

        public void CreateWebsite(Models.Website website)
        {
            Sql.ExecuteNonQuery("Website_Create",
                new Dictionary<string, object>()
                {
                    {"ownerId", website.ownerId },
                    {"title", website.title },
                    {"description", website.description },
                    {"status", website.status },
                    {"logo", website.logo },
                    {"security", website.security },
                    {"enabled", website.enabled },
                    {"domain", website.domain },
                    {"liveUrl", website.liveUrl },
                    {"stageUrl", website.stageUrl }
                }
            );
        }

        public bool HasWebsites()
        {
            return Sql.ExecuteScalar<int>(
                "Websites_Exist", null) == 1;
        }
    }
}
