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
            var ui = new Scaffold(S, "/App/Editor/Components/ui.html");
            var component = new Scaffold(S, "/App/Editor/Components/component.html");
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
                        page.UpdateBlock(ref newpage, newblock);

                        if(panel.blockId == 0)
                        {
                            //save page-level block to page
                            page.SavePage(newpage);
                        }else
                        {
                            //save custom block
                            page.SaveBlock(block);
                        }
                        break;
                    }
                }
                
                //render component to inject onto the page
                inject.element = "#cell_" + cellId;
                inject.html = component.Render();
                inject.js =  S.javascriptFiles.renderJavascriptFiles(false, S.javascript.renderJavascript(false));
                inject.css = S.css.renderCss(false);
                inject.cssId = "comp" + component.id;
            }
            return inject;
        }
        
    }
}