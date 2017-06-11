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
            //load the current page
            GetPage();
            var tuple = page.loadPageAndLayout(page.pageId, true);

            //load page(s) from file/cache
            var newpage = tuple.Item3;

            //load list of panels
            var panels = tuple.Item4;

            //get list of blocks
            var blocks = page.GetBlocks(newpage);

            //find existing component
            var components = page.GetAllComponents(panels);

            Websilk.Page.structBlock block = new Websilk.Page.structBlock();
            Component component;

            //update existing components with json data changes, then save the page to memory & disk
            JArray json = JsonConvert.DeserializeObject<JArray>(changes);
            if (json != null)
            {
                string id = "";
                string type = "";
                string[] str;
                int level = -1;
                JToken data;
                
                //process each change within the JSON object
                foreach (JObject item in json)
                {
                    id = (string)item["id"];

                    //find component & block reference
                    component = null;
                    foreach (var c in components)
                    {
                        //find target component
                        if (c.id == id)
                        {
                            foreach (var b in blocks)
                            {
                                //find block that component belongs to
                                if (b.id == c.blockId)
                                {
                                    //find target component within target block
                                    foreach (var comp in b.components)
                                    {
                                        if (comp.id == id)
                                        {
                                            block = b;
                                            component = comp;
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                            break;
                        }
                    }

                    if(component != null && block.id != "")
                    {
                        data = item["data"];
                        type = (string)item["type"];
                        str = type.Split(':');
                        if (str.Length > 0) {
                            type = str[0];
                        }
                        Component.structPosition pos;
                        switch (type)
                        {
                            case "resize":
                                //resize component for a specific viewport size
                                level = int.Parse(str[1]);
                                pos = component.position[level];
                                foreach (JProperty child in data.Children<JProperty>())
                                {
                                    if(child.Name == "maxWidth")
                                    {
                                        pos.width = child.Value.ToObject<int>();
                                    }
                                }
                                component.position[level] = pos;
                                block.changed = true;
                                break;

                            case "alignment":
                                //change component alignment settings for a specific viewport size
                                level = int.Parse(str[1]);
                                pos = component.position[level];
                                foreach (JProperty child in data.Children<JProperty>())
                                {
                                    switch (child.Name)
                                    {
                                        case "align":
                                            pos.align = (Component.enumAlign)child.Value.ToObject<int>();
                                            break;
                                        case "fixedAlign":
                                            pos.fixedAlign = (Component.enumIsFixed)child.Value.ToObject<int>();
                                            break;
                                        case "position":
                                            pos.position = (Component.enumPosition)child.Value.ToObject<int>();
                                            break;
                                        case "top":
                                            pos.top = child.Value.ToObject<int>();
                                            break;
                                        case "widthType":
                                            pos.widthType = (Component.enumWidthType)child.Value.ToObject<int>();
                                            break;
                                        case "heightType":
                                            pos.heightType = (Component.enumHeightType)child.Value.ToObject<int>();
                                            break;
                                        case "padding":
                                            foreach (JProperty pad in child.First.Children<JProperty>())
                                            {
                                                switch (pad.Name)
                                                {
                                                    case "top":
                                                        pos.padding.top = pad.Value.ToObject<int>();
                                                        break;
                                                    case "right":
                                                        pos.padding.right = pad.Value.ToObject<int>();
                                                        break;
                                                    case "bottom":
                                                        pos.padding.bottom = pad.Value.ToObject<int>();
                                                        break;
                                                    case "left":
                                                        pos.padding.left = pad.Value.ToObject<int>();
                                                        break;
                                                }
                                            }
                                            break;
                                        case "forceNewLine":
                                            pos.forceNewLine = (bool)child.Value.ToObject<bool>();
                                            break;
                                    }
                                }
                                component.position[level] = pos;
                                block.changed = true;
                                break;
                            default:
                                //tries saving custom data to component
                                component.Save(type, data.ToObject(typeof(object)));
                                block.changed = true;
                                break;
                        }
                        page.UpdateBlock(ref newpage, block);
                    }
                }
            }

            //check all blocks for changes, then save changes to filesystem
            var savepage = false;
            blocks = page.GetBlocks(newpage);
            foreach (var b in blocks)
            {
                if (b.id.IndexOf("page_") == 0 && b.isPage == true && b.changed == true)
                {
                    //save page
                    savepage = true;
                }
                else if (b.id.IndexOf("page_") < 0 && b.changed == true)
                {
                    //save block
                    page.SaveBlock(b, true);
                }
            }
            if (savepage == true)
            {
                page.SavePage(newpage, true);
            }
        }
        #endregion

        #region "Blocks"
        public string GetBlocksList(string area)
        {
            var sql = new SqlQueries.Editor(S);
            var htm = new StringBuilder();
            htm.Append("<option value=\"\">[New Block]</option>");
            GetPage();

            //load layout list ////////////////////////////////////////////////////////////////
            if (!S.Server.Cache.ContainsKey("blocks-" + page.websiteId + '-' + area.ToLower()))
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

        public Inject AddBlock(string blockId, int insertAt, string name, string area, string element, bool isPageLevelBlock = false, bool changeOnly = false)
        {
            var inject = new Inject();
            inject.element = "#" + element;
            inject.inject = enumInjectTypes.after;
            inject.cssId = "block_" + blockId;
            GetPage();
            var sqlEditor = new SqlQueries.Editor(S);
            if (blockId == "" && name != "")
            {
                if (sqlEditor.HasBlock(page.websiteId, name) == true){
                    inject.html = "exists";
                    return inject;
                }
            }
            var id = blockId;
            var tuple = page.loadPageAndLayout(page.pageId, true);

            //load page layout scaffolding
            var scaffold = tuple.Item1;

            //load page(s) from file/cache
            var newpage = tuple.Item3;

            //load list of panels belonging to page
            var panels = tuple.Item4;

            //check if block already exists on the page
            for (var x = 0; x < newpage.areas.Count; x++)
            {
                for(var y = 0; y < newpage.areas[x].blocks.Count; y++)
                {
                    if(newpage.areas[x].blocks[y].id == blockId)
                    {
                        inject.html = "duplicate";
                        return inject;
                    }
                }
            }

            //clean cache
            S.Server.Cache.Remove("blocks-" + page.websiteId + '-' + area.ToLower());

            var block = new Websilk.Page.structBlock() { id = "" };
            for(var x = 0; x < newpage.areas.Count; x++)
            {
                if (newpage.areas[x].name.ToLower() == area.ToLower())
                {
                    //found matching area
                    if(blockId == "")
                    {
                        //create new block
                        id = sqlEditor.CreateBlock(page.websiteId, area.ToLower(), name).ToString();
                        inject.cssId = "block_" + id;
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
            if(block.id.IndexOf("page_") < 0)
            {
                //save changes to file
                page.SavePage(newpage, true);

                //reset cache for block list
                S.Server.Cache.Remove("blocks-" + page.websiteId + '-' + area);

                //load components into block-level panel
                var panelId = block.name.Replace(" ", "_").ToLower();
                var panel = page.CreatePanel(panelId, block.name, area, block.id, block.name, block.isPage);
                panel.AddCell(panelId);
                panel.hasSiblings = true;
                panels.Add(panel);
                page.loadComponents(block, panel, ref panels);

                //render panel & components
                inject.html = panel.Render();
                inject.js = RenderJs();
                inject.css = RenderCss();
            }
            return inject;
        }

        public Inject ChangeBlock(string blockId, int insertAt, string name, string area, string element, bool isPageLevelBlock = false)
        {
            return AddBlock(blockId, insertAt, name, area, element, isPageLevelBlock = false, true);
        }

        public string RemoveBlock(string blockId, string area)
        {
            if(blockId.IndexOf("page_") == 0) { return "error"; }
            GetPage();
            var id = blockId;
            var tuple = page.loadPageAndLayout(page.pageId, true);

            //load page layout scaffolding
            var scaffold = tuple.Item1;

            //load page(s) from file/cache
            var newpage = tuple.Item3;
            
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

        public string MoveBlock(string blockId, string area, int index, string direction)
        {
            GetPage();
            var sqlEditor = new SqlQueries.Editor(S);
            var id = blockId;
            var tuple = page.loadPageAndLayout(page.pageId, true);

            //load page layout scaffolding
            var scaffold = tuple.Item1;

            //load page(s) from file/cache
            var newpage = tuple.Item3;

            var block = new Websilk.Page.structBlock() { id = "" };
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

                            if (direction == "up")
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
            if (block.id.IndexOf("page_") < 0)
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
