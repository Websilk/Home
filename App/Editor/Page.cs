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
                var reader = sql.GetBlockList(page.websiteId, area.ToLower());
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

        public string AddBlock(int blockId, int insertAt, string name, string area, bool isPageLevelBlock = false, bool changeOnly = false)
        {
            GetPage();
            var sqlEditor = new SqlQueries.Editor(S);
            if (blockId == 0 && name != "")
            {
                if (sqlEditor.HasBlock(page.websiteId, name) == true){
                    return "exists";
                }
            }
            var id = blockId;
            var tuple = page.loadPageAndLayout(page.pageId, true);

            //load page layout scaffolding
            var scaffold = tuple.Item1;

            //load page(s) from file/cache
            var newpage = tuple.Item3;

            //check if block already exists on the page
            for (var x = 0; x < newpage.areas.Count; x++)
            {
                for(var y = 0; y < newpage.areas[x].blocks.Count; y++)
                {
                    if(newpage.areas[x].blocks[y].id == blockId)
                    {
                        return "duplicate";
                    }
                }
            }

            var block = new Websilk.Page.structBlock() { id = 0 };
            for(var x = 0; x < newpage.areas.Count; x++)
            {
                if (newpage.areas[x].name.ToLower() == area.ToLower())
                {
                    //found matching area
                    if(blockId == 0)
                    {
                        //create new block
                        id = sqlEditor.CreateBlock(page.websiteId, area.ToLower(), name);
                    }
                    block = page.loadBlock(id);
                    newpage.areas[x].blocks.Insert(insertAt, block);
                    if(changeOnly == true)
                    {
                        //remove existing block
                        newpage.areas[x].blocks.RemoveAt(insertAt - 1);
                    }
                    break;
                }
            }
            if(block.id > 0)
            {
                //save changes to file
                page.SavePage(newpage, true);

                //reset cache for block list
                S.Server.Cache.Remove("blocks-" + page.websiteId + '-' + area);

                //finally, render new block onto the existing page

                //load components into block-level panel
                var panel = page.CreatePanel(block.name.Replace(" ", "_").ToLower(), block.name, area, block.id, block.name, block.isPage);
                panel.hasSiblings = true;
                page.loadComponents(block, panel, new List<Panel>(), true);

                //render panel & components
                return panel.Render();
            }
            return "error";
        }

        public string ChangeBlock(int blockId, int insertAt, string name, string area, bool isPageLevelBlock = false)
        {
            return AddBlock(blockId, insertAt, name, area, isPageLevelBlock = false, true);
        }

        public string RemoveBlock(int blockId, string area)
        {
            if(blockId == 0) { return "error"; }
            GetPage();
            var id = blockId;
            var tuple = page.loadPageAndLayout(page.pageId, true);

            //load page layout scaffolding
            var scaffold = tuple.Item1;

            //load page(s) from file/cache
            var newpage = tuple.Item3;

            var block = new Websilk.Page.structBlock() { id = 0 };
            for (var x = 0; x < newpage.areas.Count; x++)
            {
                if (newpage.areas[x].name.ToLower() == area.ToLower())
                {
                    //found matching area
                    for(var y = 0; y < newpage.areas[x].blocks.Count; y++)
                    {
                        if(newpage.areas[x].blocks[y].id == blockId)
                        {
                            newpage.areas[x].blocks.RemoveAt(y);
                        }
                    }
                    break;
                }
            }

            //save changes to file
            page.SavePage(newpage, true);
            return "success";
        }

        public string MoveBlock(int blockId, string area, int index, string direction)
        {
            GetPage();
            var sqlEditor = new SqlQueries.Editor(S);
            var id = blockId;
            var tuple = page.loadPageAndLayout(page.pageId, true);

            //load page layout scaffolding
            var scaffold = tuple.Item1;

            //load page(s) from file/cache
            var newpage = tuple.Item3;

            var block = new Websilk.Page.structBlock() { id = 0 };
            for (var x = 0; x < newpage.areas.Count; x++)
            {
                if (newpage.areas[x].name.ToLower() == area.ToLower())
                {
                    //found matching area
                    for (var y = 0; y < newpage.areas[x].blocks.Count; y++)
                    {
                        if (newpage.areas[x].blocks[y].id == blockId)
                        {
                            //found matching block
                            block = newpage.areas[x].blocks[y];
                            newpage.areas[x].blocks.Remove(newpage.areas[x].blocks[y]);
                            if(direction == "up")
                            {
                                newpage.areas[x].blocks.Insert(y - 1, block);
                            }
                            else
                            {
                                newpage.areas[x].blocks.Insert(y + 1, block);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
            if (block.id > 0)
            {
                //save changes to file
                page.SavePage(newpage, true);
                return "success";
            }
            return "fail";
        }
        #endregion
    }
}
