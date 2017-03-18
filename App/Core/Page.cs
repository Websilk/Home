using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Newtonsoft.Json;

namespace Websilk
{
    public class Page
    {
        #region "properties"
        private Core S;
        public SqlQueries.Page sql;
        public Elements Elements;

        public struct structUrl
        {
            public string host;
            public string path;
            public string[] paths;
            public string[] query;
        }

        public struct structPage
        {
            //structure used to save page content to JSON file
            public int pageId;
            public string layout;
            public List<structArea> areas;
            [JsonIgnore]
            public bool changed;
        }

        public struct structArea
        {
            public string name;
            public List<structBlock> blocks;
        }

        public struct structBlock
        {
            public string name;
            public int id;
            public bool isPage;
            public List<Component> components;
        }

        public enum enumDomainProtocols
        {
            http = 0,
            https = 1
        }

        public struct structDomain
        {
            public enumDomainProtocols protocol;
            public string domain;
            public string subdomain;
        }

        public structUrl Url;

        //page info
        public int ownerId = 0;
        public int pageId = 0;
        public int pageType = 0; //0 = default, 1 = service, 2 = shadow, 3 = clone
        public int pageParentId = 0;
        public string pageTitle = "";
        public string pagePathName = ""; //page title hierarchy
        public string pagePathIds = ""; //page id hierarchy
        public string PageTitleForBrowserTab = "";
        public string parentTitle = "";
        public string pageLayout = "default";
        public string pageService = ""; //if pageType = 1, the name of the C# StaticPage class to execute, Websilk.Pages.[pageService]
        public string pageDescription = "";
        public string pageFavIcon = "";
        public string pageFolder = "";
        public string pagePhoto = "";
        public DateTime pageCreated;
        public DateTime pageModified;
        public int pageSecurity = 0;
        public string pageVersion = ""; //either empty or a history stamp

        //website info
        public int websiteId = 0;
        public int websiteOwner = 0;
        public string websiteTitle = "";
        public string websiteTitleSeparator = " - ";
        public string websiteTheme = "default";
        public string websiteColors = "beach";
        public string editorColors = "dark";
        public string dashboardColors = "aqua";
        public int websitePageAccessDenied = 0;
        public int websitePage404 = 0;
        public List<structDomain> domains = new List<structDomain>();

        public string googleWebPropertyId = ""; //google Analytics

        public bool accessDenied = false;
        public bool isEditable = false;
        public string editType = ""; //page type to edit (usually "edit" when isEditable = true)
        public string editFolder = ""; //sub-folder where page.json is located (usually used for "history" folder)

        public Page(Core WebsilkCore)
        {
            S = WebsilkCore;
            sql = new SqlQueries.Page(S);
        }
        #endregion

        #region "Page Info"
        public void getPageInfo(int pageId)
        {
            if (S.Server.Cache.ContainsKey("pageinfo_" + pageId))
            {
                loadPageInfo((SqlReader)S.Server.Cache["pageinfo_" + pageId]);
            }
            else
            {
                loadPageInfo(sql.GetPageInfo(pageId));
            }
        }

        public void getPageInfoFromUrl()
        {
            getPageInfoFromUrl(Url);
        }

        public void getPageInfoFromUrl(structUrl url)
        {
            string domain = "";
            string subDomain = "";
            string[] domains = GetDomainParts(url.host);
            string title = url.path;
            SqlReader reader;

            domain = domains[1];
            subDomain = domains[0];
            if (string.IsNullOrEmpty(domain)) { domain = url.host; }

            //try to get page info based on domain name
            if (!string.IsNullOrEmpty(url.path))
            {
                //get page info from website domain name & page title
                while (title != "")
                {
                    if (string.IsNullOrEmpty(subDomain))
                    {
                        //domain name & page title
                        var cacheName = "pageinfo_" + url.host + "_" + title;
                        if (S.Server.Cache.ContainsKey(cacheName))
                        {
                            reader = (SqlReader)S.Server.Cache[cacheName];
                        }
                        else {
                            reader = sql.GetPageInfoFromDomainAndTitle(domain, title);
                            S.Server.Cache.Add(cacheName, reader);
                        }
                        if(reader.Rows.Count > 0)
                        {
                            loadPageInfo(reader);
                        }
                    }
                    else
                    {
                        //domain & sub domain & page title
                        var cacheName = "pageinfo_" + url.host + "_" + title;
                        if (S.Server.Cache.ContainsKey(cacheName))
                        {
                            reader = (SqlReader)S.Server.Cache[cacheName];
                            S.Server.Cache.Add(cacheName, reader);
                        }
                        else
                        {
                            reader = sql.GetPageInfoFromSubDomainAndTitle(domain, subDomain, title);
                        }
                        if (reader.Rows.Count > 0)
                        {
                            loadPageInfo(reader);
                        }
                    }
                    if (reader.Rows.Count == 0)
                    {
                        if (title.IndexOf("/") > 0)
                        {
                            //try to get parent page
                            title = String.Join("/", title.Split('/').Reverse().Skip(1).Reverse().ToArray());
                        }
                        else { break; }
                    }
                    else { break; }
                }
            }
            else
            {
                if (string.IsNullOrEmpty(subDomain))
                {
                    //get page info from website home page
                    reader = sql.GetPageInfoFromDomain(domain);
                }
                else
                {
                    //get page info from website sub domain home page
                    reader =  sql.GetPageInfoFromSubDomain(domain, subDomain);
                }
                if (reader.Rows.Count > 0)
                {
                    loadPageInfo(reader);
                }
            }
        }

        public void loadPageInfo(SqlReader reader)
        {
            //loads the page info from Sql
            if (reader.Rows.Count > 0)
            {
                reader.Read();

                if(reader.GetInt("security") > 0 && S.User.userId == 0)
                {
                    //redirect user to access denied page
                    getPageInfo(reader.GetInt("pagedenied"));
                    return;
                }

                //get page info
                ownerId = reader.GetInt("ownerId");
                pageId = reader.GetInt("pageId");
                pageTitle = reader.Get("title");
                pagePathName = reader.Get("path");
                pagePathIds = reader.Get("pathIds");
                pageDescription = S.Sql.Decode(reader.Get("description"));
                pageCreated = reader.GetDateTime("datecreated");
                pageSecurity = reader.GetInt("security");
                pageType = reader.GetInt("pagetype");
                pageLayout = reader.Get("layout");
                pageService = reader.Get("service");
                pageParentId = reader.GetInt("parentid");
                parentTitle = reader.Get("parenttitle");
                websiteTheme = reader.Get("theme");
                websiteColors = reader.Get("colors");
                editorColors = reader.Get("colorsEditor");
                dashboardColors = reader.Get("colorsDash");
                websiteId = reader.GetInt("websiteid");
                websiteOwner = reader.GetInt("ownerId");
                websiteTitle = reader.Get("websitetitle");
                websitePageAccessDenied = reader.GetInt("pagedenied");
                websitePage404 = reader.GetInt("page404");
                googleWebPropertyId = reader.Get("googlewebpropertyid");
                pageFavIcon = reader.Get("icon");
                pagePhoto = reader.Get("photo");

                //set up page properties
                if(pageLayout == "") { pageLayout = "default"; }
                PageTitleForBrowserTab = pageTitle + websiteTitleSeparator + websiteTitle;
                pageFolder = "/App/Content/websites/" + websiteId + "/pages/" + pageId + "/";

                //initialize theme Elements
                Elements = new Elements(S, "/App/Content/themes/" + websiteTheme + "/");

                //check if editable
                if(pageTitle != "Dashboard")
                {
                    if(S.User.checkSecurity(websiteId,"dashboard/pages", User.enumSecurity.update))
                    {
                        isEditable = true;
                    }
                }
            }

        }

        public List<structDomain> getDomainsForWebsite()
        {
            //get a list of available domains for this website
            var domains = new List<structDomain>();
            var reader = sql.GetWebsiteDomains(websiteId);
            if(reader.Rows.Count > 0)
            {
                while (reader.Read()) { 
                    domains.Add(GetDomain(reader.Get("domain")));
                }
            }
            return domains;
        }
        #endregion

        #region "Dynamic Page"

        public List<structArea> loadLayout(Scaffold scaffold)
        {
            var areas = new List<structArea>();
            foreach (var item in scaffold.elements)
            {
                if (item.name != "")
                {
                    areas.Add(new structArea() {
                        name = item.name,
                        blocks = new List<structBlock>()
                    });
                }
            }
            return areas;
        }

        public string GetPageFilePath(int pageid = 0, string specialFolder = "", string pageType = "", bool checkIfExists = false)
        {

            var path = "/App/Content/websites/" + 
                websiteId + "/pages/" + pageid.ToString() + "/" + 
                (specialFolder != "" ? specialFolder + "/" : "") + 
                (pageType != "" ? pageType + "_" : "") + "page.json";

            if(File.Exists(S.Server.MapPath(path)))
            {
                return path;
            }else
            {
                return "/App/Content/websites/" + websiteId + "/pages/" + pageid.ToString() + "/" + "page.json";
            }
        }

        public string GetBlockFilePath(int blockid = 0, string specialFolder = "", string blockType = "", bool checkIfExists = false)
        {

            var path = "/App/Content/websites/" +
                websiteId + "/blocks/" + blockid.ToString() + "/" +
                (specialFolder != "" ? specialFolder + "/" : "") +
                (blockType != "" ? blockType + "_" : "") + "block.json";

            if (File.Exists(S.Server.MapPath(path)))
            {
                return path;
            }
            else
            {
                return "/App/Content/websites/" + websiteId + "/blocks/" + blockid.ToString() + "/" + "block.json";
            }
        }

        public structPage loadPage(int pageid)
        {
            //get a list of components to load onto the page
            var page = new structPage();
            var file = S.Server.LoadFileFromCache(GetPageFilePath(pageid, editFolder, editType, true));
            if(file != "")
            {
                page = (structPage)S.Util.Serializer.ReadObject(file, typeof(structPage));
            }
            else
            {
                //initialize a new page
                page = new structPage();
                page.areas = new List<structArea>();
            }

            if (page.areas.Count > 0)
            {
                foreach (var area in page.areas)
                {
                    //load blocks associated with this page
                    for (var x = 0; x < area.blocks.Count; x++)
                    {
                        if(area.blocks[x].components == null)
                        {
                            //external block
                            area.blocks[x] = loadBlock(area.blocks[x].id);
                        }
                    }
                }
            }
            return page;
        }

        public structBlock loadBlock(int blockid)
        {
            var block = new structBlock();
            var file = S.Server.LoadFileFromCache(GetBlockFilePath(blockid, editFolder, editType, true));
            if (file != "")
            {
                block = (structBlock)S.Util.Serializer.ReadObject(file, typeof(structBlock));
            }
            else
            {
                //initialize a new block
                var p = new structPage();
                p.areas = new List<structArea>();
            }
            return block;
        }

        /// <summary>
        /// Load panels from the page layout, along with all components from the specified page
        /// </summary>
        /// <param name="pageid">the page to load</param>
        /// <returns></returns>
        public Tuple<Scaffold, List<structArea>, structPage, List<Panel>> loadPageAndLayout(int pageid, bool noExecution = false)
        {
            //load page layout scaffolding
            var scaffold = new Scaffold(S, "/App/Content/themes/" + websiteTheme + "/layouts/" + pageLayout + ".html");

            //load page(s) from file/cache
            var page = loadPage(pageId);

            //get a list of areas in the layout HTML
            var areas = loadLayout(scaffold);

            //initialize panel list
            var panels = new List<Panel>();

            //add missing areas from layout into page
            foreach (var area in areas)
            {
                var found = false;
                if (page.areas.Count > 0)
                {
                    //check for missing area in page
                    for(var x = 0; x < page.areas.Count; x++)
                    {
                        if(page.areas[x].name == area.name)
                        {
                            //set up page-level blocks
                            found = true;
                        }
                    }
                }
                if(found == false)
                {
                    //add missing layout area to page
                    page.areas.Add(area);
                }
            }

            //load panels within page area blocks
            for (var x = 0; x < page.areas.Count; x++)
            {
                var area = page.areas[x];
                if(area.blocks.Count == 0)
                {
                    //add page-level block to empty area
                    area.blocks.Add(new structBlock()
                    {
                        id = 0,
                        name = "Page " + S.Util.Str.Capitalize(area.name),
                        isPage = true,
                        components = new List<Component>()
                    });
                }

                for(var y = 0; y < area.blocks.Count; y++)
                {
                    //create a panel for each block within the area
                    var block = area.blocks[y];
                    var name = block.name.Replace(" ", "-").ToLower();
                    var panel = new Panel(S, this, name, block.name, S.Util.Str.Capitalize(area.name.Replace("-"," ")), block.id, block.name, block.isPage );
                    panel.cells = new List<Panel.structCell>();
                    panel.arrangement = new Panel.structArrangement();
                    panel.AddCell(name);

                    //add components to panels
                    if(block.components.Count > 0)
                    {
                        foreach(var comp in block.components)
                        {
                            if(comp.panelId == panel.id)
                            {
                                //load component into layout panel
                                loadComponent(comp, panel, panel.cells[0], false, noExecution);
                            }else
                            {
                                //load component into component panel instead
                                var p = GetPanelById(panels, comp.panelId);
                                foreach(var cell in p.cells)
                                {
                                    if(cell.id == comp.panelCellId)
                                    {
                                        loadComponent(comp, p, cell, false, noExecution);
                                    }
                                }
                            }

                        }
                    }
                    panels.Add(panel);
                }
            }

            return Tuple.Create(scaffold, areas, page, panels);
        }
        #endregion

        #region "Static Page"
        public StaticPage getStaticPage(string pageName)
        {
            Type type = Type.GetType("Websilk.Pages." + pageName);
            return (StaticPage)Activator.CreateInstance(type, new object[] { S, this });
        }

        private string loadStaticPage(string pageName)
        {
            StaticPage staticPage = getStaticPage(pageName);
            staticPage.Load();
            return staticPage.Render();
        }
        #endregion

        #region "Render"

        private string renderLayout()
        {
            //render layout, panels, and page

            if (pageType == 1)
            {
                //load a Static Page //////////////////
                return loadStaticPage(pageService);
            }
            else
            {
                //load a Dynamic Page //////////////////
                var htm = new StringBuilder();
                var tuple = loadPageAndLayout(pageId);

                //load page layout scaffolding
                var scaffold = tuple.Item1;

                //load page from file/cache
                var page = tuple.Item3;

                //load list of panels
                var panels = tuple.Item4;
                
                //finally, render each layout area
                //this will force all components & panels within the hierarchy to render as well
                foreach (var area in page.areas)
                {
                    htm = new StringBuilder();
                    foreach(var block in area.blocks)
                    {
                        htm.Append(GetPanelById(panels, block.name.Replace(" ", "-").ToLower()).Render());
                    }
                    scaffold.Data[area.name] = htm.ToString();
                }
                return scaffold.Render();
            }
        }

        public string Render()
        {
            //setup page to render layout, panels, and components (and editor UI too if necessary)
            var scaffold = new Scaffold(S, "/app/core/page.html");
            var useSVG = false;

            //setup scaffold variables
            scaffold.Data["favicon"] = "/images/favicon.gif";
            scaffold.Data["body-class"] = GetBrowserType() + (S.User.isMobile ? (S.User.isTablet ? " s-tablet" : " s-mobile") : " s-hd");
            scaffold.Data["website-css"] = "/content/websites/" + websiteId + "/website.css?v=" + S.Server.Version;
            scaffold.Data["theme-css"] = "/css/themes/" + websiteTheme + "/theme.css";

            //setup color scheme
            if(pageTitle == "Dashboard")
            {
                //load dashboard color scheme
                scaffold.Data["has-colors"] = "1";
                scaffold.Data["colors-css"] = "/css/colors/dashboard/" + dashboardColors + ".css";
                useSVG = true;
            }
            else
            {
                //load website color scheme (if desired)
                if(websiteColors != "")
                {
                    scaffold.Data["has-colors"] = "1";
                    scaffold.Data["colors-css"] = "/css/colors/websites/" + websiteColors + ".css";
                }
                if (isEditable == true)
                {
                    //load Editor UI
                    scaffold.Data["has-editor"] = "1";
                    scaffold.Data["editor-colors-css"] = "/css/colors/editor/" + editorColors + ".css";
                    scaffold.Data["editor"] = EditorUI.Render(S, this);
                    useSVG = true;
                }
            }
            if(useSVG == true)
            {
                scaffold.Data["svg-icons"] = S.Server.LoadFileFromCache("/App/Content/themes/" + websiteTheme + "/icons.svg");
            }

            if(isEditable == true)
            {
                //show grid at left & right sides of page body
                scaffold.Data["body-sides"] = "<div class=\"body-sides\"><div class=\"left-side\"></div><div class=\"right-side\"></div></div>";
            }

            //setup facebook meta tags
            scaffold.Data["facebook"] = "";
            if (pagePhoto != "")
            {
                scaffold.Data["facebook"] = "<meta id=\"metafbimg\" property=\"og:image\" content=\"" + Url.host + pagePhoto + "\" />";
            }
            scaffold.Data["facebook"] += "<meta id=\"metafbtitle\" property=\"og:title\" content=\"" + pageTitle + "\" />" +
                            "<meta id=\"metafbsite\" property=\"og:site_name\" content=\"" + websiteTitle + "\" />";

            //setup base javascript files
            S.javascriptFiles.Add("platform", "/js/platform.js");
            if (isEditable == true)
            {
                S.javascriptFiles.Add("editor", "/js/editor.js");
            }

            //render page layout (panels & components)
            scaffold.Data["body"] = renderLayout();

            //setup inline CSS
            scaffold.Data["head-css"] = S.css.renderCss();

            //setup CSS files
            scaffold.Data["css-files"] = S.cssFiles.renderCssFiles();

            //setup inline javascript
            scaffold.Data["scripts"] = S.javascriptFiles.renderJavascriptFiles(true, S.javascript.renderJavascript());
                                       ;
            //finally, render web page
            return scaffold.Render();
        }
        #endregion

        #region "Blocks"
        public List<structBlock> GetBlocks(structPage page)
        {
            var blocks = new List<structBlock>();
            foreach(var area in page.areas)
            {
                foreach(var block in area.blocks)
                {
                    blocks.Add(block);
                }
            }
            return blocks;
        }

        /// <summary>
        /// Removes references to components from all custom blocks,
        /// leaving page-level blocks untouched
        /// </summary>
        /// <param name="page"></param>
        /// <returns></returns>
        public void StripCustomBlocks(structPage page)
        {
            for(var x = 0; x < page.areas.Count; x++)
            {
                for(var y = 0; y < page.areas[x].blocks.Count; y++)
                {
                    if(page.areas[x].blocks[y].isPage == false)
                    {
                        var block = page.areas[x].blocks[y];
                        block.components = new List<Component>();
                        page.areas[x].blocks[y] = block;
                    }
                }
            }
        }

        public void UpdateBlock(structPage page, structBlock block)
        {
            for (var x = 0; x < page.areas.Count; x++)
            {
                for (var y = 0; y < page.areas[x].blocks.Count; y++)
                {
                    if (page.areas[x].blocks[y].name == block.name)
                    {
                        page.areas[x].blocks[y] = block;
                    }
                }
            }
        }
        #endregion

        #region "Panels"

        /// <summary>
        /// Find a specific panel instance based on the given panel id
        /// </summary>
        /// <param name="panels"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public Panel GetPanelById(List<Panel> panels, string id)
        {
            //traverse through the hierarchy of panels & components until we find the correct panel
            foreach(var panel in panels)
            {
                if(panel.id == id) { return panel; }
                foreach(var cell in panel.cells)
                {
                    if(cell.components.Count > 0)
                    {
                        foreach(var component in cell.components)
                        {
                            if(component.panels != null)
                            {
                                var p = GetPanelById(component.panels, id);
                                if(p != null) { return p; }
                            }
                        }
                    }
                }
            }
            return null;
        }

        /// <summary>
        /// Get a list of all panels loaded on the page
        /// </summary>
        /// <param name="panels"></param>
        /// <returns></returns>
        public List<Panel> GetAllPanels(List<Panel> panels)
        {
            var list = new List<Panel>();
            foreach (var panel in panels)
            {
                list.Add(panel);
                //get a list of cells within each panel
                foreach (var cell in panel.cells)
                {
                    if (cell.components.Count > 0)
                    {
                        //get a list of components within each panel cell
                        foreach (var component in cell.components)
                        {
                            if (component.panels != null)
                            {
                                //get a list of panels within each component
                                var p = GetAllPanels(component.panels);
                                if (p != null) {
                                    foreach(var q in p)
                                    {
                                        list.Add(q);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return list;
        }
        #endregion

        #region "Components"

        /// <summary>
        /// Initializes a component & sets up default properties if they don't already exist
        /// </summary>
        /// <param name="component"></param>
        /// <param name="panelId"></param>
        public Component loadComponent(Component component, Panel panel, Panel.structCell cell, bool isCreated = false, bool noExecution = false)
        {
            if (component.id == "")
            {
                //component is new
                component.id = S.Util.Str.CreateID();
            }
            component.Page = this;
            component.blockId = panel.blockId;
            component.panelId = panel.id;
            component.panelCellId = cell.id;

            //add component to panel cell
            var cellIndex = panel.cells.FindIndex(a => a.id == cell.id);
            if (cellIndex < 0) { cellIndex = 0; }
            var compIndex = panel.cells[cellIndex].components.Count;
            panel.cells[cellIndex].components.Add(component);

            //initialize new component
            panel.cells[cellIndex].components[compIndex].Initialize(S, this);

            if (!noExecution)
            {
                //call component Create() function if this is a newly created component (in the Editor by drag & drop)
                if (isCreated == true) { panel.cells[cellIndex].components[compIndex].Create(); }

                //call component Load() function
                panel.cells[cellIndex].components[compIndex].Load();
            }
            return panel.cells[cellIndex].components[compIndex];
        }

        /// <summary>
        /// Create a new component on the page (from within the Editor)
        /// </summary>
        /// <param name="name">name of the component class within the Websilk.Components namespace</param>
        /// <param name="panel">instance of the panel which contains the cell instance</param>
        /// <param name="cell">panel cell instance to load the component into</param>
        /// <returns></returns>
        public Component createNewComponent(string name, string panelId, string cellId, int blockId)
        {
            //first, find component class by name
            string className = "Websilk.Components." + name;
            Type type = Type.GetType(className);
            var component = (Component)Activator.CreateInstance(type);
            component.id = S.Util.Str.CreateID();
            component.blockId = blockId;
            component.panelId = panelId;
            component.panelCellId = cellId;
            component.Initialize(S, this);
            component.Create();
            component.Load();

            return component;
        }

        /// <summary>
        /// Get a list of all the components loaded on the page
        /// </summary>
        /// <param name="panels"></param>
        /// <returns></returns>
        public List<Component> GetAllComponents(List<Panel> panels)
        {
            var list = new List<Component>();

            return list;
        }
        #endregion

        #region "Save"
        public void SavePage(structPage page, bool saveToDisk = false)
        {
            var path = GetPageFilePath(page.pageId, editFolder, editType);
            var serialize = S.Util.Serializer.WriteObjectAsString(page, Newtonsoft.Json.Formatting.None);
            S.Server.SaveToCache(path, serialize);
            if (saveToDisk == true) { File.WriteAllText(S.Server.MapPath(path), serialize); }
        }

        public void SaveBlock(structBlock block, bool saveToDisk = false)
        {
            var path = GetBlockFilePath(block.id, editFolder, editType);
            var serialize = S.Util.Serializer.WriteObjectAsString(block, Newtonsoft.Json.Formatting.None);
            S.Server.SaveToCache(path, serialize);
            if (saveToDisk == true) { File.WriteAllText(S.Server.MapPath(path), serialize); }
        }
        #endregion

        #region "Utility"
        public structUrl parseUrl(string url)
        {
            var r = new structUrl();
            var path = url;
            if (path.Substring(0, 1) == "/") { path = path.Substring(1); }

            if (path != "")
            {
                //parse path (e.g. /path/to/page )
                var arr = path.Split(new char[] { '+' });
                r.path = arr[0].Replace("-", " ");
                if (arr.Length > 1)
                {
                    //get query after path (e.g. /path/to/page+query+id+7 )
                    r.query = path.Split(new char[] { '+' }, 2)[1].Split(new char[] { '+' });
                }
            }
            else
            {
                r.path = "home";
            }

            //get host
            r.host = S.Request.Host.ToString();
            if (r.host.Substring(r.host.Length - 1) != "/") { r.host += "/"; }

            return r;
        }

        public string GetDomainName(string url)
        {
            string[] tmpDomain = GetSubDomainAndDomain(url).Split(new char[] { '.' });
            if (tmpDomain.Length == 2)
            {
                return url;
            }
            else if (tmpDomain.Length >= 3)
            {
                if (tmpDomain[tmpDomain.Length - 2] == "co")
                {
                    return tmpDomain[tmpDomain.Length - 3] + "." +
                            tmpDomain[tmpDomain.Length - 2] + "." +
                            tmpDomain[tmpDomain.Length - 1];
                }
                return tmpDomain[tmpDomain.Length - 2] + "." + tmpDomain[tmpDomain.Length - 1];
            }
            return url;
        }

        public string GetSubDomainAndDomain(string url)
        {
            string strDomain = url.Replace("http://", "").Replace("https://", "").Replace("www.", "").Split('/')[0];
            if (strDomain.IndexOf("localhost") >= 0 | strDomain.IndexOf("192.168") >= 0)
            {
                strDomain = "websilk.com";
            }
            return strDomain.Replace("/", "");
        }

        public string[] GetDomainParts(string url)
        {
            string subdomain = GetSubDomainAndDomain(url);
            string domain = GetDomainName(subdomain);
            string sub = subdomain.Replace("." + domain, "").Replace(domain, "");
            if (sub != "")
            {
                return new string[] { sub, subdomain.Replace(sub, "") };
            }
            return new string[] { "", subdomain };
        }

        public structDomain GetDomain(string url)
        {
            var domain = GetDomainParts(url);
            var d = new structDomain();
            d.domain = domain[1];
            d.subdomain = domain[0];
            if(url.IndexOf("https://") >= 0)
            {
                d.protocol = enumDomainProtocols.https;
            }
            else if(url.IndexOf("http://") >= 0)
            {
                d.protocol = enumDomainProtocols.http;
            }
            return d;
        }

        public string GetBrowserType()
        {
            string browser = S.Request.Headers["User-Agent"].ToString().ToLower();
            int major = 11;
            int minor = 0;
            if (browser.IndexOf("chrome") >= 0)
            {
                if (major > 10)
                {
                    return "chrome";
                }
                else
                {
                    return "legacy-chrome";
                }
            }
            else if (browser.IndexOf("firefox") >= 0)
            {
                if (major == 3 & minor >= 6)
                {
                    return "firefox";
                }
                else if (major > 3)
                {
                    return "firefox";
                }
                else
                {
                    return "legacy-firefox";
                }
            }
            else if (browser.IndexOf("safari") >= 0)
            {
                if (browser.IndexOf("iphone") >= 0)
                {
                    return "iphone";
                }
                else if (browser.IndexOf("ipad") >= 0)
                {
                    return "ipad";
                }
                else if (major <= 4)
                {
                    return "legacy-safari";
                }
                return "safari";
            }
            return "";
        }
        #endregion
    }

    public class StaticPage
    {
        protected Core S;
        protected Page page;
        protected Scaffold scaffold;

        public StaticPage(Core WebsilkCore, Page page)
        {
            S = WebsilkCore;
            this.page = page;
        }

        /// <summary>
        /// Executed when the page is being loaded
        /// </summary>
        public virtual void Load() { }

        /// <summary>
        /// Executed when loading a sub page
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public virtual Services.Inject LoadSubPage(string path) { return new Services.Inject(); }

        public string Render()
        {
            return scaffold.Render();
        }
    }
}
