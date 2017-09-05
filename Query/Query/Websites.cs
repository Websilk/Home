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
    }
}
