using System;
using System.Collections.Generic;
using System.Text;
using System.Data.SqlClient;

namespace Websilk.Services.Editor
{
    public class Support : Service
    {
        public Support(Core WebsilkCore):base(WebsilkCore) { }

        public string Get(string page)
        {
            var scaffold = new Scaffold(S, "/Editor/Support/support.html");
            scaffold.Data["content"] = S.Server.LoadFileFromCache("/Support/" + page + ".html");
            return scaffold.Render();
        }

        public string Search(string keywords)
        {
            var scaffold = new Scaffold(S, "/Editor/Support/support.html");
            var result = new Scaffold(S, "/Editor/Support/result.html");
            var htm = new StringBuilder();
            var parms = new List<SqlParameter>()
            {
                new SqlParameter("@keywords", keywords)
            };
            var reader = new SqlReader(S, "EXEC SearchDocumentation @keywords=@keywords", parms);
            while (reader.Read())
            {
                result.Data["page"] = reader.Get("path");
                result.Data["title"] = reader.Get("title");
                htm.Append(result.Render());
            }
            if(reader.Rows.Count == 0)
            {
                result = new Scaffold(S, "/Editor/Support/noresults.html");
                result.Data["search"] = keywords;
                htm.Append(result.Render());
            }
            scaffold.Data["search"] = keywords;
            scaffold.Data["content"] = htm.ToString();
            return scaffold.Render();
        }
    }
}
