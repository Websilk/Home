using System.Collections.Generic;
using System.Data.SqlClient;

namespace Websilk.SqlQueries
{
    public class Editor : SqlQuery
    {
        public Editor(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        #region "Components"
        public SqlReader GetComponentList(string category = "")
        {
            var parms = new List<SqlParameter>();
            parms.Add(new SqlParameter("@_category", category != "" ? category : "1"));
            return new SqlReader(S, "EXEC GetComponents @category=@_category", parms);
        }
        #endregion

        #region "Blocks"
        public SqlReader GetBlockList(int websiteId, string area = "")
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@websiteId", websiteId),
                new SqlParameter("@area", area)
            };
            return new SqlReader(S, "EXEC GetBlocks @websiteId=@websiteId, @area=@area", parms);
        }
        #endregion
    }
}
