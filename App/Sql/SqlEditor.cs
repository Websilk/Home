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

        public SqlReader GetBlock(int blockId)
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@blockId", blockId)
            };
            return new SqlReader(S, "EXEC GetBlock @blockId=@blockId", parms);
        }

        public bool HasBlock(int websiteId, string name)
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@websiteId", websiteId),
                new SqlParameter("@name", name)
            };
            return (int)S.Sql.ExecuteScalar("EXEC HasBlock @websiteId=@websiteId, @name=@name", parms) > 0;
        }

        public int CreateBlock(int websiteId, string area, string name)
        {
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@websiteId", websiteId),
                new SqlParameter("@area", area),
                new SqlParameter("@name", name)
            };
            return (int)S.Sql.ExecuteScalar("EXEC CreateBlock @websiteId=@websiteId, @area=@area, @name=@name", parms);
        }
        #endregion
    }
}
