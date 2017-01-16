using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Websilk
{
    public class Page
    {

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
            public List<Component> components;
            public List<Panel> panels;
            public List<int> layers;
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
        public string pagePathName = "";
        public string pagePathIds = "";
        public string PageTitleForBrowserTab = "";
        public string parentTitle = "";
        public string pageService = ""; //if pageType = 1, the name of the C# StaticPage class to execute (Websilk.Pages.???)
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

        public Page(Core WebsilkCore)
        {
            S = WebsilkCore;
            sql = new SqlQueries.Page(S);
        }

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
                pagePathName = reader.Get("path").ToLower();
                pagePathIds = reader.Get("pathIds");
                pageDescription = S.Sql.Decode(reader.Get("description"));
                pageCreated = reader.GetDateTime("datecreated");
                pageSecurity = reader.GetInt("security");
                pageType = reader.GetInt("pagetype");
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

        #region "Page Content"
        private List<structPage> loadPage(int pageid, string folderType = "pages")
        {
            //get a list of components to load onto the page
            var page = new List<structPage>();
            var filename = "page.json";
            var pagePath = "/App/Content/websites/" + websiteId + "/" + folderType + "/";
            if (pageid > 0)
            {
                var folder = S.Server.MapPath(pagePath + pageid + "/");

                if (S.Server.Cache.ContainsKey(folder + filename))
                {
                    //load page from cache
                    page.Add((structPage)S.Server.Cache[folder + filename]);
                }else
                {
                    //load page from file
                    if (File.Exists(folder + filename))
                    {
                        page.Add((structPage)S.Util.Serializer.OpenFromFile(typeof(structPage), folder + filename));
                    }
                }
            }
            if(page.Count == 0)
            {
                //load empty page
                var p = new structPage();
                p.components = new List<Component>();
                p.layers = new List<int>();
                p.panels = new List<Panel>();
                page.Add(p);

            }

            if(page[0].layers.Count > 0)
            {
                //load page layers associated with this page
                foreach(var id in page[0].layers)
                {
                    //load page layer from cache or file
                    var layers = loadPage(id, "layers");
                    foreach(var layer in layers)
                    {
                        //check for duplicate page layers
                        if(page.FindIndex(a => a.pageId == layer.pageId) == 0)
                        {
                            //add page layer
                            page.Add(layer); 
                        }
                    }
                }
            }

            return page;
        }

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

        public List<Panel> loadLayout(Scaffold scaffold)
        {
            var panels = new List<Panel>();
            foreach (var item in scaffold.elements)
            {
                if (item.name.IndexOf("panel-") == 0)
                {
                    //create a new panel for the layout
                    var id = item.name.Split('-')[1];
                    var p = new Panel(S, id, "panel " + id);
                    p.cells = new List<Panel.structCell>();
                    p.arrangement = new Panel.structArrangement();
                    p.AddCell();
                    panels.Add(p);
                }
            }
            return panels;
        }

        /// <summary>
        /// Initializes a component & sets up default properties if they don't already exist
        /// </summary>
        /// <param name="component"></param>
        /// <param name="panelId"></param>
        public Component loadComponent(Component component, Panel panel, Panel.structCell cell, bool isCreated = false)
        {
            if(component.id == "")
            {
                //component is new
                component.id = S.Util.Str.CreateID();
            }
            component.panelId = panel.id;
            component.panelCellId = cell.id;

            //add component to panel cell
            var cellIndex = panel.cells.FindIndex(a => a.id == cell.id);
            if (cellIndex < 0) { cellIndex = 0; }
            var compIndex = panel.cells[cellIndex].components.Count;
            panel.cells[cellIndex].components.Add(component);
            panel.cells[cellIndex].componentIds.Add(component.id);
            panel.cells[cellIndex].components[compIndex].Initialize(S, this);
            if(isCreated == true) { panel.cells[cellIndex].components[compIndex].Create(); }
            panel.cells[cellIndex].components[compIndex].Load();
            return panel.cells[cellIndex].components[compIndex];
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

                var scaffold = new Scaffold(S, "/App/Content/themes/" + websiteTheme + "/layout.html");

                //load page(s) from file/cache
                var pages = loadPage(pageId);

                //get a list of panels in the layout HTML
                var panels = loadLayout(scaffold);

                //add components to layout panels
                var components = new List<int[,,]>();
                for (var x = 0; x < panels.Count; x++)
                {
                    foreach (var page in pages)
                    {
                        //find components in this page & all page layers 
                        //associated with this page that belong to a layout panel
                        foreach (var c in page.components)
                        {
                            if (c.panelId == panels[x].id)
                            {
                                //add component to layout panel cell
                                loadComponent(c, panels[x], panels[x].cells[0]);
                                break;
                            }
                        }
                    }
                }

                //finally, render each layout panel
                //this will force all components & panels within the hierarchy to render as well
                foreach (var panel in panels)
                {
                    scaffold.Data["panel-" + panel.id] = panel.Render();
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
                    scaffold.Data["editor"] = Editor.Render(S);
                    useSVG = true;
                }
            }
            if(useSVG == true)
            {
                scaffold.Data["svg-icons"] = S.Server.LoadFileFromCache("/App/Content/themes/" + websiteTheme + "/icons.svg");
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
