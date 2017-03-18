using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Websilk.Services.Editor
{
    public class Page : Service
    {
        public Page(Core WebsilkCore) : base(WebsilkCore) { }

        #region "Save"
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

                    if (type == "arrange")
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
        #endregion

        #region "Blocks"
        public string GetBlocksList(string area)
        {
            var sql = new SqlQueries.Editor(S);
            var htm = new StringBuilder();
            htm.Append("<option value=\"0\">[New Block]</option>");
            GetPage();

            //load layout list ////////////////////////////////////////////////////////////////
            if (!S.Server.Cache.ContainsKey("blocks-" + page.websiteId + '-' + area))
            {
                //get list of layouts for page theme (from disk)
                var reader = sql.GetBlockList(page.websiteId, area);
                while (reader.Read())
                {
                    htm.Append("<option value=\"" + reader.GetInt("blockId") + "\">" +
                        S.Util.Str.Capitalize(reader.Get("name")) + "</option>");
                }
                S.Server.Cache["blocks-" + page.websiteId + '-' + area] = htm.ToString();
                return htm.ToString();
            }
            else
            {
                //get list of layouts for page theme (from cache)
                return (string)S.Server.Cache["blocks-" + page.websiteId + '-' + area];
            }
        }

        #endregion
    }
}
