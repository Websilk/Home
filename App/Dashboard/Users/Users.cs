﻿
namespace Websilk.Pages.DashboardPages
{
    public class Users: Page
    {
        public Users(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public override string Render(string[] path, string body = "")
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
                //load downloads list
                var scaffold = new Scaffold(S, "/Dashboard/Users/users.html");
                return scaffold.Render();
            }
            return "";
        }
    }
}
