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
            var dashboard = new Scaffold(S, "/app/editor/dashboard.html");

            //get page info for Dashboard
            var paths = new StringBuilder();
            var pathstep = "";
            var pagepaths = page.pagePathName.Split('/');
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

            //render Editor UI
            editor.Data["svg-logo"] = S.Server.LoadFileFromCache("/App/Content/logo-websilk.svg");
            editor.Data["template-window"] = S.Server.LoadFileFromCache("/App/Editor/window.html");
            editor.Data["template-dashboard"] = dashboard.Render();
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
                int pageid = 0;
                int cid = 0;


                bool matched = false;

                //load the current page
                GetPage();
                var tuple = page.loadPageAndLayout(page.pageId, true);

                //load page layout scaffolding
                var scaffold = tuple.Item1;

                //load page(s) from file/cache
                var pages = tuple.Item2;

                //get a list of panels from the layout HTML
                var panels = tuple.Item3;

                //process each change
                foreach (JObject item in data)
                {
                    //get info from JSON
                    id = (string)item["id"];
                    type = (string)item["type"];

                    if(type == "arrange")
                    {
                        //change is for a panel cell
                        for (var x = 0; x < pages.Count; x++)
                        {
                            //make sure page contains components that belong to cell
                            for (var y = 0; y < pages[x].components.Count; y++)
                            {
                                if (pages[x].components[y].panelCellId == id)
                                {
                                    pageid = x;
                                    matched = true;
                                    break;
                                }
                            }
                            if (matched == true) { break; }
                        }
                        if (matched == true)
                        {
                            switch (type)
                            {
                                case "arrange":
                                    //rearrange components within a panel
                                    var components = new List<Component>();

                                    //create new sorted list of components
                                    foreach (string compid in item["data"].ToString().Split(','))
                                    {
                                        foreach (var comp in pages[pageid].components)
                                        {
                                            if (comp.id == compid)
                                            {
                                                components.Add(comp);
                                            }
                                        }
                                    }

                                    //replace old list of components with new list
                                    var newpage = pages[pageid];
                                    newpage.components = components;
                                    newpage.changed = true;
                                    pages[pageid] = newpage;
                                    break;
                            }
                        }
                    }
                    else
                    {
                        //change is for a component
                        matched = false;
                        for (var x = 0; x < pages.Count; x++)
                        {
                            //found component match
                            for (var y = 0; y < pages[x].components.Count; y++)
                            {
                                if (pages[x].components[y].id == id)
                                {
                                    pageid = x;
                                    cid = y;
                                    matched = true;
                                    break;
                                }
                            }
                            if (matched == true) { break; }
                        }

                        if (matched == true)
                        {
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
                                    foreach (string compid in item["data"].ToString().Split(','))
                                    {
                                        foreach (var comp in pages[pageid].components)
                                        {
                                            if (comp.id == compid)
                                            {
                                                components.Add(comp);
                                            }
                                        }
                                    }

                                    //replace old list of components with new list
                                    var newpage = pages[pageid];
                                    newpage.components = components;
                                    newpage.changed = true;
                                    pages[pageid] = newpage;
                                    break;
                            }
                        }
                    }

                    
                }

                //save changes to pages
                foreach(var p in pages)
                {
                    if(p.changed == true)
                    {
                        //page has changes
                        page.SavePage(p, true);
                    }
                }
            }
        }
    }
}
