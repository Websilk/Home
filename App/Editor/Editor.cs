namespace Websilk
{
    public static class Editor
    {

        public static string Render(Core S)
        {
            var editor = new Scaffold(S, "/app/editor/editor.html");
            editor.Data["svg-logo"] = S.Server.LoadFileFromCache("/App/Content/logo-websilk.svg");
            return editor.Render();
        }
    }
}
