namespace Websilk.Pages
{
    public class Logout : Page
    {
        public Logout(Core LegendaryCore) : base(LegendaryCore)
        {
        }

        public override string Render(string[] path, string body = "", object metadata = null)
        {
            S.User.LogOut();

            return Redirect("/login");
        }
    }
}
