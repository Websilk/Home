namespace Websilk.Pages
{
    public class Login: Page
    {
        public Login(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public override string Render(string[] path, string query = "", string body = "")
        {
            //set up client-side dependencies
            colorsCss = "/css/colors/dashboard/aqua.css";

            //check for database reset
            var scaffold = new Scaffold(S, "/Login/login.html");
            if (S.Server.environment == Server.enumEnvironment.development && S.Server.resetPass == true)
            {
                //load new password form (for admin only)
                scaffold = new Scaffold(S, "/Login/new-pass.html");
                scaffold.Data["title"] = "Create an administrator password";
                scripts += "<script src=\"/js/login/new-pass.js\"></script>";
            }
            else
            {
                //load login form (default)
                scripts += "<script src=\"/js/login/login.js\"></script>";
            }

            //load login page
            return base.Render(path, query, scaffold.Render());
        }
    }
}
