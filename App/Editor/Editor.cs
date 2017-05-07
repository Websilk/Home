using System.IO;
using System.Text;
using Newtonsoft.Json;


namespace Websilk.Editor
{
    public static class UI
    {

        public static string Render(Core S, Page page)
        {
            var sql = new SqlQueries.Editor(S);
            var editor = new Scaffold(S, "/editor/editor.html");
            var dashboard = new Scaffold(S, "/editor/ui/dashboard.html");
            var layout_dialog = new Scaffold(S, "/editor/ui/layout-dialog.html");
            var layout_addblock = new Scaffold(S, "/editor/ui/layout-addblock.html");

            var paths = new StringBuilder();
            var pathstep = "";
            var pagepaths = page.pagePathName.Split('/');
            var layoutpath = S.Server.MapPath("/Content/themes/" + page.websiteTheme + "/layouts/");
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

            //check if in-memory page differs from either page on drive or page scheduled to be saved on drive
            var pagePath = page.GetPageFilePath(page.pageId, page.editFolder, page.editType);
            var absPath = S.Server.MapPath(pagePath);
            if (File.Exists(absPath))
            {
                var pageMem = S.Util.Serializer.WriteObjectAsString(page.loadPageAndLayout(page.pageId, true), Formatting.None, TypeNameHandling.Auto, page.IgnorablePagePropertiesResolver());
                var pageDrive = S.Util.Serializer.WriteObjectAsString(page.loadPageAndLayout(page.pageId, true, false), Formatting.None, TypeNameHandling.Auto, page.IgnorablePagePropertiesResolver());
                if (pageMem != pageDrive)
                {
                    //page data differs between page in-memory & page file(s) (including in-memory blocks & block files)
                    S.javascript.Add("editor-save", "S.editor.save.hasChanges(true);");
                }
            }


            //render Editor UI //////////////////////////////////////////////////////////////////////
            editor.Data["svg-logo"] = S.Server.LoadFileFromCache("/Content/logo-websilk.svg");
            editor.Data["template-window"] = S.Server.LoadFileFromCache("/editor/ui/window.html");
            editor.Data["template-dashboard"] = dashboard.Render();
            editor.Data["template-layout-dialog"] = layout_dialog.Render();
            editor.Data["template-layout-addblock"] = layout_addblock.Render();
            editor.Data["template-layout-options"] = S.Server.LoadFileFromCache("/editor/ui/layout-options.html");
            editor.Data["template-select-menu-props"] = S.Server.LoadFileFromCache("/editor/ui/select-menu-props.html");
            editor.Data["template-select-menu-alignment"] = S.Server.LoadFileFromCache("/editor/ui/select-menu-alignment.html");
            editor.Data["html"] = S.htmlEditor.renderHtml();
            return editor.Render();
        }
    }
}
