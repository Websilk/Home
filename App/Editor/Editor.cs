using System.IO;
using System.Text;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Websilk
{
    public static class EditorUI
    {

        public static string Render(Core S, Page page)
        {
            var editor = new Scaffold(S, "/app/editor/editor.html");
            var dashboard = new Scaffold(S, "/app/editor/ui/dashboard.html");
            var layout_dialog = new Scaffold(S, "/app/editor/ui/layout-dialog.html");

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
                if(path == page.pageTitle)
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

            if (!S.Server.Cache.ContainsKey("layout-options"))
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
                S.Server.Cache["layout-options"] = layoutOptions.ToString();
            }
            else
            {
                //get list of layouts for page theme (from cache)
                layout_dialog.Data["layout-list"] = (string)S.Server.Cache["layout-options"];
            }
            
            //render Editor UI
            editor.Data["svg-logo"] = S.Server.LoadFileFromCache("/App/Content/logo-websilk.svg");
            editor.Data["template-window"] = S.Server.LoadFileFromCache("/app/editor/ui/window.html");
            editor.Data["template-dashboard"] = dashboard.Render();
            editor.Data["template-layout-dialog"] = layout_dialog.Render();
            editor.Data["template-layout-options"] = S.Server.LoadFileFromCache("/app/editor/ui/layout-options.html");
            return editor.Render();
        }
    }

    public class Edit : Service
    {
        public Edit(Core WebsilkCore) : base(WebsilkCore) { }

        public void SaveChanges(string changes)
        {
            //update existing components with json data changes, then save the page to memory & disk
            JArray data = JsonConvert.DeserializeObject<JArray>(changes);
            if (data != null)
            {
                string id = "";
                string type = "";

                //load the current page
                GetPage();
                var tuple = page.loadPageAndLayout(page.pageId, true);

                //load page layout scaffolding
                var scaffold = tuple.Item1;

                //load page(s) from file/cache
                var newpage = tuple.Item3;

                //process each change
                foreach (JObject item in data)
                {
                    //get info from JSON
                    id = (string)item["id"];
                    type = (string)item["type"];

                    if(type == "arrange")
                    {
                        //change is for a panel cell
                        switch (type)
                        {
                            case "arrange":
                                //rearrange components within a panel
                                var components = new List<Component>();

                                //create new sorted list of components
                                foreach (string compid in item["data"].ToString().Split(','))
                                {
                                    //foreach (var comp in pages[pageid].components)
                                    //{
                                    //    if (comp.id == compid)
                                    //    {
                                    //        components.Add(comp);
                                    //    }
                                    //}
                                }

                                //TODO: replace old list of components with new list
                                newpage.changed = true;
                                break;
                        }
                    }
                    else
                    {
                        //change is for a component
                        switch (type)
                        {
                            case "position":
                                //update position data for a component
                                //pages[pid].components[cid].position = (string)item["data"];
                                break;

                            case "arrange":
                                //rearrange components within a panel
                                var components = new List<Component>();

                                //create new sorted list of components
                                //foreach (string compid in item["data"].ToString().Split(','))
                                //{
                                //    foreach (var comp in pages[pageid].components)
                                //    {
                                //        if (comp.id == compid)
                                //        {
                                //            components.Add(comp);
                                //        }
                                //    }
                                //}

                                //TODO: replace old list of components with new list
                                newpage.changed = true;
                                break;
                        }
                    }

                    
                }

                //save changes to pages
                if (newpage.changed == true)
                {
                    //page has changes
                    //page.SavePage(newpage, true);
                }
            }
        }
    }
}
