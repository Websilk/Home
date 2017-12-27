
namespace Websilk.Pages.DashboardPages
{
    public class Photos: Page
    {
        public Photos(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public override string Render(string[] path, string body = "", object metadata = null)
        {
            if (path.Length > 0)
            {
                //load sub page
                switch (path[0])
                {
                    case "folders":

                        break;
                }
            }
            else
            {
                //load photos list
                var scaffold = new Scaffold(S, "/Pages/Dashboard/Photos/photos.html");
                return scaffold.Render();
            }
            return "";
        }
    }
}
