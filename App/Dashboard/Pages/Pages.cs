using System;
using System.Collections.Generic;
using System.Text;

namespace Websilk.Pages.DashboardPages
{
    public class Pages: StaticPage
    {
        public Pages(Core WebsilkCore, Page page): base(WebsilkCore, page) { }

        public override Services.Inject LoadSubPage(string path)
        {
            var inject = new Services.Inject();
            if(path != "")
            {
                //load sub page
                switch (path)
                {
                    case "settings":

                        break;
                }
            }else
            {
                //load pages list
                var servePage = new Services.Dashboard.Pages(S);
                var websiteId = page.websiteId;
                if (S.Request.Query.ContainsKey("websiteid")) { websiteId = int.Parse(S.Request.Query["websiteid"]); }
                servePage.page = page;
                scaffold = new Scaffold(S, "/Dashboard/Pages/pages.html");
                scaffold.Data["page-list"] = servePage.View(websiteId, 0, 1, 1000, 4, 0, "");
                scaffold.Data["page-create"] = S.Server.LoadFileFromCache("/Dashboard/Pages/create.html");
                S.javascriptFiles.Add("dash-pages", "/js/dashboard/pages/pages.js");
                S.javascript.Add("dash-pages", "S.dashboard.pages.init();");

                //get list of available shadow templates
                var reader = page.sql.GetShadowTemplatesForWebsite(page.websiteId);
                var js = "S.dashboard.pages.shadow_templates = [";
                var i = 0;
                while (reader.Read())
                {
                    if(i > 0) { js += ","; }
                    js += "{id:" + reader.GetInt("pageId").ToString() + ", title:'" + reader.Get("title").Replace("'", "\\'") + "', url:'/" + reader.Get("path").Replace(" ", "-") + "'}";
                    i++;
                }
                js += "];";
                S.javascript.Add("dash-page-shadows", js);
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}

namespace Websilk.Services.Dashboard
{
    public class Pages : Service
    {
        public enum enumViewType
        {
            list = 0,
            details = 1
        }

        public Pages(Core WebsilkCore) : base(WebsilkCore) { }

        #region "View"

        public string View(int websiteId, int parentId, int start, int length, int orderby, int viewType, string search)
        {
            GetPage();
            if (!S.User.checkSecurity(websiteId, "dashboard/pages", User.enumSecurity.read)) { return ""; }

            int parentPageId = 0;
            string pageTitle = "";
            string parentTitle = "";
            string parentPath = "";
            string parentPathIds = "";
            if (parentId > 0)
            {
                //get information about parent page
                var reader2 = page.sql.GetPageTitle(parentId);
                if (reader2.Rows.Count > 0)
                {
                    reader2.Read();
                    pageTitle = reader2.Get("title");
                    parentPageId = reader2.GetInt("parentid");
                    parentTitle = reader2.Get("parenttitle");
                    parentPath = reader2.Get("path");
                    parentPathIds = reader2.Get("pathids");
                }
            }
            var reader = page.sql.GetPagesForWebsite(websiteId, parentId, start, length, orderby, search);
            if ((enumViewType)viewType == enumViewType.list)
            {
                return ViewPagesList(reader, websiteId, parentId, pageTitle, parentPageId, parentTitle, parentPath, parentPathIds);
            }

            return "";
        }

        private string ViewPagesList(SqlReader reader, int websiteId, int parentId, string pageTitle, int parentPageId, string parentTitle, string parentPath, string parentPathIds)
        {
            var htm = new StringBuilder();
            var secureEdit = S.User.checkSecurity(websiteId, "dashboard/pages", User.enumSecurity.read);
            var secureCreate = S.User.checkSecurity(websiteId, "dashboard/pages", User.enumSecurity.create);
            var secureDelete = S.User.checkSecurity(websiteId, "dashboard/pages", User.enumSecurity.delete);
            var secureSettings = S.User.checkSecurity(websiteId, "dashboard/pages", User.enumSecurity.update);

            var subpageTitle = "";
            var titleHead = "";
            var pagePath = "";
            var pageLink = "";
            var pageSummary = "";
            var pageCreated = "";
            var useTemplate = false;
            var templateName = "";
            var templateUrl = "";
            var subpageId = 0;
            var hasChildren = 0;
            var color = "";
            var options = new bool[] { false, false, false, false };
            var pageItem = new Scaffold(S, "/Dashboard/Pages/page-item.html");

            htm.Append("<ul class=\"columns-list\">");

            while (reader.Read())
            {
                color = "empty";
                subpageTitle = reader.Get("title");
                titleHead = reader.Get("title_head");
                if(titleHead == "") { titleHead = subpageTitle; }
                pagePath = reader.Get("path");
                pageSummary = reader.Get("description");
                pageCreated = reader.GetDateTime("datecreated").ToString("MMMM dd, yyyy");
                useTemplate = reader.GetInt("shadowId") > 0;
                templateName = reader.Get("templatename");
                templateUrl = "/" + reader.Get("templatepath");
                subpageId = reader.GetInt("pageid");
                hasChildren = reader.GetInt("haschildren");
                pageLink = "/" + (pagePath).Replace(" ", "-");
                options = new bool[] { true, true, true, true }; //edit, create, settings, delete

                //disable delete button
                switch (subpageTitle.ToLower())
                {
                    case "home":
                    case "login":
                    case "error 404":
                    case "access denied":
                    case "about":
                    case "contact":
                        options[3] = false;
                        break;
                    case "dashboard":
                        continue;
                }

                //disable sub-page creation
                switch (subpageTitle.ToLower())
                {
                    case "login":
                    case "error 404":
                    case "access denied":
                        options[1] = false;
                        break;
                }

                //change row color
                switch (subpageTitle.ToLower())
                {
                    case "login":
                    case "about":
                    case "contact":
                        color = "yellow";
                        break;
                    case "error 404":
                    case "access denied":
                        color = "red";
                        break;
                    case "home":
                        color = "turqoise";
                        break;
                }

                //setup options
                if (secureDelete == false)
                {
                    //delete
                    options[3] = false;
                }
                if (secureSettings == false)
                {
                    //settings
                    options[2] = false;
                }
                if (secureCreate == false)
                {
                    //create
                    options[1] = false;
                }
                htm.Append("<li>" + RenderListItem(pageItem, color, subpageId, subpageTitle, titleHead, pagePath, pageLink, pageSummary, useTemplate, templateName, templateUrl, pageCreated, options, hasChildren > 0) + "</li>");
            }

            htm.Append("</ul>");
            return htm.ToString();
        }

        private string RenderListItem(Scaffold item, string color, int pageId, string pageTitle, string pageTitleHead, string pagePath, string pageLink, string pageSummary, bool useTemplate, string templateName, string templateUrl, string createdate, bool[] options, bool isfolder = false)
        {
            item.Data["id"] = pageId.ToString();
            item.Data["title"] = pageTitle;
            item.Data["title-head"] = (pageTitleHead == pageTitle ? "" : pageTitleHead);
            item.Data["path"] = pagePath;
            item.Data["link"] = pageLink;
            item.Data["summary"] = pageSummary.Replace("\"", "&quot;");
            item.Data["created"] = createdate;
            item.Data["color"] = color;
            item.Data["folder"] = isfolder == true ? "true" : "false";
            item.Data["use-template"] = useTemplate ? "1" : "";
            item.Data["template-name"] = templateName;
            item.Data["template-url"] = templateUrl;

            if (isfolder == true)
            {
                item.Data["icon"] = "<svg viewBox=\"0 0 15 15\"><use xlink:href=\"#icon-folder\" x=\"0\" y=\"0\" width=\"15\" height=\"15\" /></svg>";
            }
            else
            {
                item.Data["icon"] = "<svg viewBox=\"0 0 15 15\"><use xlink:href=\"#icon-websites\" x=\"0\" y=\"0\" width=\"15\" height=\"15\" /></svg>";
            }

            return item.Render();
        }

        #endregion

        #region "Create"

        public string Create(int websiteId, int parentId, string title, string description, int type, int shadowId, int shadowChildId, bool secure, string layout = "", string service = "")
        {
            if (!S.User.checkSecurity(websiteId, "dashboard/pages", User.enumSecurity.create)) { return "err"; }

            //create new web page
            GetPage();
            page.sql.Create(S.User.userId, websiteId, parentId, title, description, (SqlQueries.Page.enumPageType)Enum.Parse(typeof(SqlQueries.Page.enumPageType), type.ToString()), shadowId, shadowChildId, layout, service, secure);

            //return list of sub-pages
            return View(websiteId, parentId, 0, 100, 0, 0, "");
        }
        #endregion

        #region "Settings"

        public string ViewSettings(int id)
        {
            var scaffold = new Scaffold(S, "/dashboard/pages/settings.html");
            var sqlPage = new SqlQueries.Page(S);
            var reader = sqlPage.GetPageInfo(id);
            if (reader.Read())
            {
                scaffold.Data["page-title"] = reader.Get("title");
                scaffold.Data["url-title"] = reader.Get("title").ToLower();
                scaffold.Data["parent-title"] = reader.Get("parenttitle");
                scaffold.Data["title-head"] = reader.Get("title_head") != "" ? reader.Get("title_head") : reader.Get("title");
                scaffold.Data["description"] = reader.Get("description");
                scaffold.Data["secure"] = reader.GetBool("security") ? "checked=\"checked\"" : "";
                scaffold.Data["active"] = reader.GetBool("enabled") ? "checked=\"checked\"" : "";
                scaffold.Data["use-shadow"] = reader.GetInt("shadowId") > 0 ? "checked=\"checked\"" : "";
                scaffold.Data["use-child-shadow"] = reader.GetInt("shadowChildId") > 0 ? "checked=\"checked\"" : "";
                scaffold.Data["shadow-id"] = reader.GetInt("shadowId").ToString();
                scaffold.Data["shadow-child-id"] = reader.GetInt("shadowChildId").ToString();
                switch (reader.GetShort("pagetype"))
                {
                    case 0: scaffold.Data["pagetype"] = "1"; break;
                    case 2: scaffold.Data["pagetype-shadow"] = "1"; break;
                }
            }

            return scaffold.Render();
        }

        public string UpdateSettings(int websiteId, int id, string title, string description, int type, int shadowId, int shadowChildId, bool secure, bool active)
        {
            if (!S.User.checkSecurity(websiteId, "dashboard/pages", User.enumSecurity.update)) { return "err"; }

            //create new web page
            GetPage();
            page.sql.Update(websiteId, id, title, description, (SqlQueries.Page.enumPageType)Enum.Parse(typeof(SqlQueries.Page.enumPageType), type.ToString()), shadowId, shadowChildId, "", "", secure, active);

            return "success";
        }
        #endregion

        #region "Shadow Templates"
        public string CreateShadowTemplate(int websiteId, string name)
        {
            if (!S.User.checkSecurity(websiteId, "dashboard/pages", User.enumSecurity.create)) { return "err"; }

            //create new shadow template
            GetPage();
            page.sql.Create(S.User.userId, websiteId, 0, name, "", SqlQueries.Page.enumPageType.shadow, 0, 0);

            //get a list of shadow templates
            var reader = page.sql.GetShadowTemplatesForWebsite(page.websiteId);
            var js = "S.dashboard.pages.shadow_templates = [";
            var i = 0;
            while (reader.Read())
            {
                if (i > 0) { js += ","; }
                js += "{id:" + reader.GetInt("pageId").ToString() + ", title:'" + reader.Get("title").Replace("'", "\\'") + "', url:'/" + reader.Get("path").Replace(" ", "-") + "'}";
                i++;
            }
            js += "];";
            return js;

        }
        #endregion
    }
}