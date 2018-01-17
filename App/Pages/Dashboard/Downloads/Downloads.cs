namespace Websilk.Pages.DashboardPages
{
    public class Downloads: Page
    {
        public Downloads(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public override string Render(string[] path, string body = "", object metadata = null)
        {
            if(path.Length > 0)
            {
                //load sub page
                switch (path[0])
                {
                    case "folders":

                        break;
                }
            }else
            {
                //load downloads list
                var scaffold = new Scaffold("/Pages/Dashboard/Downloads/downloads.html", S.Server.Scaffold);
                return scaffold.Render();
            }
            return "";
        }
    }
}
