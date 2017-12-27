using System;
using System.Collections.Generic;
using System.Text;

namespace Websilk.Query
{
    public class Security: QuerySql
    {
        public Security(string connectionString) : base(connectionString)
        {
        }

        public List<Models.Security> GetSecurity(int websiteId, int userId)
        {
            return Sql.Populate<Models.Security>("Security_GetWebsite",
                new Dictionary<string, object>()
                {
                    {"websiteId", websiteId },
                    {"userId", userId }
                }
            );
        }
    }
}
