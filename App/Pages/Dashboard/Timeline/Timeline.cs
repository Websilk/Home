namespace Websilk.Pages.DashboardPages
{
    public class Timeline: Page
    {
        public Timeline(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public override string Render(string[] path, string body = "", object metadata = null)
        {
            //load timeline
            var scaffold = new Scaffold("/Pages/Dashboard/Timeline/timeline.html");
            return scaffold.Render();
        }
    }
}
