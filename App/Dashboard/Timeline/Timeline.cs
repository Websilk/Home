namespace Websilk.Pages.DashboardPages
{
    public class Timeline: Page
    {
        public Timeline(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public override string Render(string[] path, string query = "", string body = "")
        {
            //load timeline
            var scaffold = new Scaffold(S, "/Dashboard/Timeline/timeline.html");
            return scaffold.Render();
        }
    }
}
