
namespace Websilk
{
    public class Page
    {

        public Core S;
        public int websiteId;
        
        //layout properties
        public string title = "Websilk";
        public string description = "";
        public string headCss = "";
        public string colorsCss = "";
        public string favicon = "";
        public string svgIcons = "";
        public string scripts = "";

        public Page(Core WebsilkCore)
        {
            S = WebsilkCore;
            svgIcons = S.Server.LoadFileFromCache("/content/themes/default/icons.svg");
        }

        public virtual string Render(string[] path, string query = "", string body = "")
        {
            var scaffold = new Scaffold(S, "/layout.html");
            scaffold.Data["title"] = title;
            scaffold.Data["description"] = description;
            scaffold.Data["head-css"] = headCss;
            scaffold.Data["colors-css"] = colorsCss;
            scaffold.Data["favicon"] = favicon;
            scaffold.Data["svg-icons"] = svgIcons;
            scaffold.Data["body"] = body;
            scaffold.Data["scripts"] = scripts;

            return scaffold.Render();
        }

        public string AccessDenied()
        {
            if(S.User.userId <= 0)
            {
                var login = new Pages.Login(S);
                return login.Render(new string[] { });
            }
            return "Access Denied";
        }
    }
}
