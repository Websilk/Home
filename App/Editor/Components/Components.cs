using System.Collections.Generic;
using System.Text;

namespace Websilk.Services.Editor
{
    public class Components : Service
    {
        public Components(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public string Load(string category)
        {
            var ui = new Scaffold(S, "/Editor/Components/ui.html");
            var component = new Scaffold(S, "/Editor/Components/component.html");
            var html = new StringBuilder();
            var sqlEditor = new SqlQueries.Editor(S);
            var reader = sqlEditor.GetComponentList(category);

            while (reader.Read())
            {
                component.Data["id"] = reader.Get("namespace");
                component.Data["icon"] = reader.Get("componentid");
                component.Data["name"] = reader.Get("name");
                component.Data["summary"] = reader.Get("description");
                html.AppendLine(component.Render());
            }
            ui.Data["components"] = html.ToString();
            return ui.Render();
        }

        public Inject Create(string name, int layerId, string panelId, string cellId, string componentId, int append)
        {
            //create a new component on the page
            var inject = new Inject();

            //load the current page
            GetPage();
            var tuple = page.loadPageAndLayout(page.pageId, true);

            //load page(s) from file/cache
            var newpage = tuple.Item3;

            //load list of panels
            var panels = tuple.Item4;

            //find the correct panel to load the component into
            var panel = page.GetPanelById(panels, panelId);
            Component component = null;
            if(panel != null)
            {
                component = page.createNewComponent(name, panel.id, cellId, panel.blockId);
            }
            if(component != null)
            {

                //get a list of all panels within the page
                var list = page.GetAllPanels(panels);

                //get a list of blocks that belong to the page
                var blocks = page.GetBlocks(newpage);
                foreach (var block in blocks)
                {
                    if (block.name == panel.blockName)
                    {
                        //add component to block
                        var newblock = block;
                        var comps = new List<Component>();
                        var added = false;
                        if(append == 0 && componentId == "")
                        {
                            //add component to beginning of new list
                            comps.Add(component);
                            added = true;
                        }
                        foreach(var comp in block.components)
                        {
                            if(append == 0 && comp.id == componentId)
                            {
                                //add new component to new list before adding current component
                                comps.Add(component);
                                inject.node = "#c" + comp.id;
                                inject.inject = enumInjectTypes.beforeNode;
                                added = true;
                            }

                            //add current component to new list
                            comps.Add(comp);

                            if (append == 1 && comp.id == componentId)
                            {
                                //add new component to new list after adding current component
                                comps.Add(component);
                                inject.node = "#c" + comp.id;
                                inject.inject = enumInjectTypes.afterNode;
                                added = true;
                            }
                        }
                        if(added == false)
                        {
                            //add new component to the end of the list
                            comps.Add(component);
                            inject.inject = enumInjectTypes.append;
                        }

                        //update page block
                        newblock.components = comps;
                        newblock.changed = true;
                        page.UpdateBlock(ref newpage, newblock);

                        if(panel.blockId.IndexOf("page_") == 0)
                        {
                            //save page-level block to page
                            page.SavePage(newpage);
                        }else
                        {
                            //save custom block
                            page.SaveBlock(newblock);
                        }
                        break;
                    }
                }
                
                //render component to inject onto the page
                inject.element = "#cell_" + cellId;
                inject.newId = component.id;
                inject.html = component.Render();
                inject.js =  S.javascriptFiles.renderJavascriptFiles(false, S.javascript.renderJavascript(false));
                inject.css = S.css.renderCss(false);
                inject.cssId = "css_component_c" + component.id;


                //inject html resources
                var html = S.html.renderHtml();
                if(html != "")
                {
                    inject.js += "$('.webpage').before('" + html.Replace("'", "\\'").Replace("\n","").Replace("\r","") + "');";
                }
                html = S.htmlEditor.renderHtml();
                if (html != "")
                {
                    inject.js += "$('.editor').append('" + html.Replace("'", "\\'").Replace("\n", "").Replace("\r", "") + "');";
                }
            }
            return inject;
        }
        
        public string Move(string componentId, string blockName, string panelId, string cellId, string targetId, int append)
        {
            //load the current page
            GetPage();
            var tuple = page.loadPageAndLayout(page.pageId, true);

            //load page(s) from file/cache
            var newpage = tuple.Item3;

            //load list of panels
            var panels = tuple.Item4;

            //find existing component
            var components = page.GetAllComponents(panels);

            foreach(var c in components)
            {
                if(c.id == componentId)
                {
                    //remove component from existing block
                    var blocks = page.GetBlocks(newpage);
                    foreach(var block in blocks)
                    {
                        if(block.id == c.blockId)
                        {
                            //make sure component exists in block
                            var exists = false;
                            foreach (var comp in block.components)
                            {
                                if(comp.id == componentId)
                                {
                                    exists = true;
                                    break;
                                }
                            }

                            if(exists == true)
                            {
                                //found existing block
                                var newblock = block;
                                var comps = new List<Component>();

                                //add all components (excluding existing component)
                                foreach(var comp in block.components)
                                {
                                    if(comp.id != componentId)
                                    {
                                        comps.Add(comp);
                                    }
                                }

                                //update existing block
                                newblock.components = comps;
                                newblock.changed = true;
                                page.UpdateBlock(ref newpage, newblock);

                                //save page or block
                                if (block.id.IndexOf("page_") == 0)
                                {
                                    //save page-level block to page
                                    page.SavePage(newpage);
                                }
                                else
                                {
                                    //save custom block
                                    page.SaveBlock(newblock);
                                }
                                break;
                            }
                            
                        }
                    }

                    //add component to new block
                    blocks = page.GetBlocks(newpage);
                    foreach (var block in blocks)
                    {
                        if (block.name == blockName)
                        {
                            //found new block
                            var newblock = block;
                            var comps = new List<Component>();
                            var added = false;

                            c.blockId = block.id;
                            c.panelId = panelId;
                            c.panelCellId = cellId;

                            if (append == 0 && targetId == "")
                            {
                                //add component to beginning of new list
                                comps.Add(c);
                                added = true;
                            }
                            foreach (var comp in block.components)
                            {
                                if (append == 0 && comp.id == targetId)
                                {
                                    //add new component to new list before adding current component
                                    comps.Add(c);
                                    added = true;
                                }

                                //add current component to new list
                                comps.Add(comp);

                                if (append == 1 && comp.id == targetId)
                                {
                                    //add new component to new list after adding current component
                                    comps.Add(c);
                                    added = true;
                                }
                            }
                            if (added == false)
                            {
                                //add new component to the end of the list
                                comps.Add(c);
                            }

                            //update new block
                            newblock.components = comps;
                            newblock.changed = true;
                            page.UpdateBlock(ref newpage, newblock);

                            //save page or block
                            if (block.id.IndexOf("page_") == 0)
                            {
                                //save page-level block to page
                                page.SavePage(newpage);
                            }
                            else
                            {
                                //save custom block
                                page.SaveBlock(newblock);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
            return "success";
        }
    }
}