using System;
using System.Text;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Websilk
{
    public class Page
    {

        private Core S;
        private SqlQueries.Page sql;
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

        public structUrl Url;

        //page info
        public int ownerId = 0;
        public int pageId = 0;
        public int pageType = 0; //0 = default, 1 = service, 2 = shadow, 3 = clone
        public int pageParentId = 0;
        public string pageTitle = "";
        public string PageTitleForBrowserTab = "";
        public string parentTitle = "";
        public string pageService = ""; //if pageType = 1, the name of the C# service class to execute (Websilk.Service.???)
        public string pageServiceArgs = ""; //if pageType = 1, arguments to pass to the C# service method
        public string pageDescription = "";
        public string pageFavIcon = "";
        public string pageFolder = "";
        public DateTime pageCreated;
        public DateTime pageModified;
        public int pageSecurity = 0;
        public string pageVersion = ""; //either empty or a history stamp

        //website info
        public int websiteId = 0;
        public string websiteTitle = "";
        public string websiteTitleSeparator = " - ";
        public string websiteTheme = "default";
        public string websiteColors = "modern";
        public int websitePageAccessDenied = 0;
        public int websitePage404 = 0;

        public string googleWebPropertyId = ""; //google Analytics
        public string pageFacebook = ""; //facebook meta tags

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
            loadPageInfo(sql.GetPageInfo(pageId));
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
                if (string.IsNullOrEmpty(subDomain))
                {
                    //get page info from website domain name & page title
                    reader = sql.GetPageInfoFromDomainAndTitle(domain, title);
                }
                else
                {
                    //get page info from website domain & sub domain & page title
                    reader = sql.GetPageInfoFromSubDomainAndTitle(domain, subDomain, title);
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
            }
            if (!S.Util.IsEmpty(reader))
            {
                loadPageInfo(reader);
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
                pageDescription = S.Sql.Decode(reader.Get("description"));
                pageCreated = reader.GetDateTime("datecreated");
                pageSecurity = reader.GetInt("security");
                pageParentId = reader.GetInt("parentid");
                parentTitle = reader.Get("parenttitle");
                websiteTheme = reader.Get("theme");
                websiteColors = reader.Get("colors");
                websiteId = reader.GetInt("websiteid");
                websiteTitle = reader.Get("websitetitle");
                websitePageAccessDenied = reader.GetInt("pagedenied");
                websitePage404 = reader.GetInt("page404");
                googleWebPropertyId = reader.Get("googlewebpropertyid");
                pageFavIcon = reader.Get("icon");

                //set up page properties
                PageTitleForBrowserTab = pageTitle + websiteTitleSeparator + websiteTitle;
                pageFolder = "/Content/websites/" + websiteId + "/pages/" + pageId + "/";
                Elements = new Elements(S, "/Content/themes/" + websiteTheme + "/");

                //set up facebook meta tags
                pageFacebook = "";
                if (reader.Get("photo") != "")
                {
                    pageFacebook = "<meta id=\"metafbimg\" property=\"og:image\" content=\"" + Url.host + reader.Get("photo") + "\" />";
                }
                pageFacebook += "<meta id=\"metafbtitle\" property=\"og:title\" content=\"" + pageTitle + "\" />" +
                                "<meta id=\"metafbsite\" property=\"og:site_name\" content=\"" + websiteTitle + "\" />";
            }

        }
        #endregion

        #region "Page Content"
        private List<structPage> loadPage(int pageid)
        {
            //get a list of components to load onto the page
            var page = new List<structPage>();
            var filename = "page.json";

            if (pageId > 0 && pageFolder != "")
            {
                var folder = S.Server.MapPath(pageFolder.TrimStart('/'));

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
                    var layers = loadPage(id);
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

        public string Render()
        {
            //setup page to render layout, panels, and components (and editor UI too if necessary)
            var scaffold = new Scaffold(S, "/app/core/page.html");

            //setup scaffold variables
            scaffold.Data["favicon"] = "/images/favicon.gif";
            scaffold.Data["body-class"] = GetBrowserType() + (S.User.isMobile ? (S.User.isTablet ? " s-tablet" : " s-mobile") : " s-hd");
            scaffold.Data["website-css"] = "/content/websites/" + websiteId + "/website.css?v=" + S.Server.Version;
            scaffold.Data["theme-css"] = "/css/colors/" + websiteColors + ".css";

            //setup base javascript files
            string min = "";
            if (S.Server.environment != Server.enumEnvironment.development) { min = ".min"; }
            S.javascriptFiles.Add("platform", "/js/platform" + min + ".js");
            if (isEditable == true)
            {
                S.javascriptFiles.Add("platform", "/js/editor" + min + ".js");
            }

            //render page layout (panels & components)
            scaffold.Data["body"] = renderLayout();

            //setup inline CSS
            scaffold.Data["head-css"] = S.css.renderCssWithTags();

            //setup inline javascript
            scaffold.Data["scripts"] = S.javascriptFiles.renderJavascriptFiles() + "\n" +
                                       S.javascript.renderJavascript();
            //finally, render web page
            return scaffold.Render();
        }

        private string renderLayout()
        {
            //render layout, panels, and page
            var scaffold = new Scaffold(S, "/Content/themes/" + websiteTheme + "/layout.html");

            //load page(s) from file/cache
            var pages = loadPage(pageId);

            //get a list of panels in the layout HTML
            var panels = loadLayout(scaffold);

            //add components to layout panels
            var components = new List<int[,,]>();
            for(var x = 0; x < panels.Count; x++)
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
            foreach(var panel in panels)
            {
                scaffold.Data["panel-" + panel.id] = panel.Render();
            } 

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
}
