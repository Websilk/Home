using System.IO;
using System.Text;


namespace Websilk
{
    public static class EditorUI
    {

        public static string Render(Core S, Page page)
        {
            var sql = new SqlQueries.Editor(S);
            var editor = new Scaffold(S, "/app/editor/editor.html");
            var dashboard = new Scaffold(S, "/app/editor/ui/dashboard.html");
            var layout_dialog = new Scaffold(S, "/app/editor/ui/layout-dialog.html");
            var layout_addblock = new Scaffold(S, "/app/editor/ui/layout-addblock.html");

            var paths = new StringBuilder();
            var pathstep = "";
            var pagepaths = page.pagePathName.Split('/');
            var layoutpath = S.Server.MapPath("/App/Content/themes/" + page.websiteTheme + "/layouts/");
            var fname = "";

            //get page info for Dashboard
            foreach (var path in pagepaths)
            {
                pathstep += "/";
                if (paths.Length > 0) { paths.Append("/"); }
                pathstep += path;
                if (path == page.pageTitle)
                {
                    paths.Append(path.Replace(" ", "-"));
                }
                else
                {
                    paths.Append("<a href=\"" + pathstep.Replace(" ", "-") + "\">" + path.Replace(" ", "-") + "</a>");
                }

            }
            dashboard.Data["page-title"] = page.pageTitle;
            dashboard.Data["page-path"] = paths.ToString();
            dashboard.Data["page-paths"] = pagepaths.Length > 1 ? "1" : "0";


            //load layout list ////////////////////////////////////////////////////////////////
            if (!S.Server.Cache.ContainsKey("layout-options-" + page.websiteId))
            {
                //get list of layouts for page theme (from disk)
                var layoutFiles = Directory.GetFiles(layoutpath, "*.html");
                var layoutOptions = new StringBuilder();
                foreach (var file in layoutFiles)
                {
                    fname = file.Replace(layoutpath, "").Replace(".html", "");
                    layoutOptions.Append("<option value=\"" + fname + "\"" +
                        (page.pageLayout == fname ? " selected=\"selected\"" : "") + ">" +
                        S.Util.Str.Capitalize(fname.Replace("-", " ")) + "</option>");
                }
                layout_dialog.Data["layout-list"] = layoutOptions.ToString();
                S.Server.Cache["layout-options-" + page.websiteId] = layoutOptions.ToString();
            }
            else
            {
                //get list of layouts for page theme (from cache)
                layout_dialog.Data["layout-list"] = (string)S.Server.Cache["layout-options-" + page.websiteId];
            }

            //render Editor UI //////////////////////////////////////////////////////////////////////
            editor.Data["svg-logo"] = S.Server.LoadFileFromCache("/App/Content/logo-websilk.svg");
            editor.Data["template-window"] = S.Server.LoadFileFromCache("/app/editor/ui/window.html");
            editor.Data["template-dashboard"] = dashboard.Render();
            editor.Data["template-layout-dialog"] = layout_dialog.Render();
            editor.Data["template-layout-addblock"] = layout_addblock.Render();
            editor.Data["template-layout-options"] = S.Server.LoadFileFromCache("/app/editor/ui/layout-options.html");
            return editor.Render();
        }
    }
}
