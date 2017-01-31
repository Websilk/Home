﻿using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
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
            var parms = new List<SqlParameter>();
            parms.Add(new SqlParameter("@_category", category != "" ? category : "1"));
            var reader = new SqlReader(S, "EXEC GetComponents @category=@_category", parms);

            while (reader.Read())
            {
                component.Data["id"] = reader.Get("componentid");
                component.Data["icon"] = reader.Get("componentid");
                component.Data["name"] = reader.Get("name");
                component.Data["summary"] = reader.Get("description");
                html.AppendLine(component.Render());
            }
            ui.Data["components"] = html.ToString();
            return ui.Render();
        }

        public Inject Create(string name, int pageId, string panelId, string cellId, string componentId, int append)
        {
            //create a new component on the page
            var inject = new Inject();

            //load the current page
            GetPage();
            var tuple = page.loadPageAndLayout(page.pageId);

            //load page layout scaffolding
            var scaffold = tuple.Item1;

            //load page(s) from file/cache
            var pages = tuple.Item2;

            //get a list of panels from the layout HTML
            var panels = tuple.Item3;

            //find the correct panel to load the component into
            var panel = page.GetPanelById(panels, panelId);
            Component component = null;
            if(panel != null)
            {
                foreach(var cell in panel.cells)
                {
                    if(cell.id == cellId)
                    {
                        component = page.createNewComponent(name, panel.id, cell.id);
                    }
                }
            }
            if(component != null)
            {
                var list = page.GetAllPanels(panels);
                foreach (var layer in pages)
                {
                    //save page layers
                    if(layer.pageId == pageId)
                    {
                        var path = page.GetPageFilePath(layer.pageId == page.pageId ? "pages" : "layers", layer.pageId, page.editFolder, page.editType);
                        var serialize = "";
                        var save = new Page.structPage();
                        save.pageId = layer.pageId;
                        save.pageType = layer.pageType;
                        save.panels = layer.panels;
                        save.layers = layer.layers;
                        save.components = new List<Component>();

                        //build list of components
                        foreach (var p in list)
                        {
                            //check if new component should be inserted before any other components in panel
                            if (append == 0 && p.id == panelId && componentId == "" && layer.pageId == pageId)
                            {
                                save.components.Add(component);
                            }

                            //get all components in all panels
                            if (p.cells != null)
                            {
                                foreach (var cell in p.cells)
                                {
                                    if (cell.components != null)
                                    {
                                        foreach (var comp in cell.components)
                                        {
                                            //check for component to insert new component before
                                            if (append == 0 && cell.id == cellId && comp.id == componentId && layer.pageId == pageId)
                                            {
                                                save.components.Add(component);
                                            }

                                            if (comp.pageId == pageId)
                                            {
                                                save.components.Add(comp);
                                            }

                                            //check for component to insert new component after
                                            if (append == 1 && cell.id == cellId && comp.id == componentId && layer.pageId == pageId)
                                            {
                                                save.components.Add(component);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        //finally, save page to cache & file
                        serialize = S.Util.Serializer.WriteObjectAsString(save, Newtonsoft.Json.Formatting.None);
                        S.Server.Cache[path] = serialize;
                        File.WriteAllText(S.Server.MapPath(path), serialize);
                    }
                }
                //render component to inject onto the page
                inject.html = component.Render();
                inject.js =  S.javascriptFiles.renderJavascriptFiles(false, S.javascript.renderJavascript(false));
                inject.css = S.css.renderCss(false);
                inject.cssId = "comp" + component.id;
            }
            return inject;
        }
    }
}