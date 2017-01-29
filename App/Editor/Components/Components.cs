using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;

namespace Websilk.Services.Editor
{
    public class Components : Service
    {
        public Components(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public string Load(string category)
        {
            var ui = new Scaffold(S, "/App/Editor/Components/ui.html");
            var component = new Scaffold(S, "/App/Editor/Components/component.html");
            var html = new StringBuilder();
            var parms = new List<SqlParameter>();
            parms.Add(new SqlParameter("@_category", category != "" ? category : "1"));
            var reader = new SqlReader(S, "EXEC GetComponents @category=@_category", parms);

            while (reader.Read())
            {
                component.Data["id"] = reader.Get("componentid");
                component.Data["icon"] = reader.Get("componentid");
                component.Data["name"] = reader.Get("name");
                component.Data["summary"] = reader.Get("description");
                html.AppendLine(component.Render());
            }
            ui.Data["components"] = html.ToString();
            return ui.Render();
        }
    }
}
