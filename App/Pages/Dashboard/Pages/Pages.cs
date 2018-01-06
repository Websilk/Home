using System.Collections.Generic;
using System.Text;

namespace Websilk.Pages.DashboardPages
{
    public class Pages: Page
    {
        public Pages(Core WebsilkCore) : base(WebsilkCore)
        {
        }

        public override string Render(string[] path, string body = "", object metadata = null)
        {
            //check security first
            if (!User.checkSecurity(website.id, "websilk", User.enumSecurity.read)) { return ""; }

            //set up webpage info
            title = "Pages";
            if(path.Length > 0)
            {
                title += " > " + string.Join(" > ", path);
            }
            AddScript("js/pages/dashboard/pages/pages.js");

            //load pages list
            var scaffold = new Scaffold(S.Server.MapPath("/Pages/Dashboard/Pages/pages.html"), S.Server.Scaffold);
            var servePage = new Services.Dashboard.Pages(S);
            if (S.Request.Query.ContainsKey("websiteid")) { website.id = int.Parse(S.Request.Query["websiteid"]); }
            scaffold.Data["page-list"] = servePage.View(website.id, 0, 1, 1000, 4, 0, "");
            scaffold.Data["page-create"] = S.Server.LoadFileFromCache("/Pages/Dashboard/Pages/create.html");
            return scaffold.Render();
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
            if (!User.checkSecurity(websiteId, "websilk/pages", Websilk.User.enumSecurity.read)) { return ""; }

            var query = new Query.Pages(S.Server.sqlConnectionString);
            var parent = new Query.Models.PageInfo();

            if (parentId > 0)
            {
                //get information about parent page
                parent = query.GetPageInfo(websiteId, parentId);
            }
            var pages = query.GetPagesList(websiteId, parentId, start, length, orderby, search);
            if ((enumViewType)viewType == enumViewType.list)
            {
                return ViewPagesList(pages, websiteId, parentId, parent);
            }

            return "";
        }

        private string ViewPagesList(List<Query.Models.PageInfo> pages, int websiteId, int parentId, Query.Models.PageInfo parent = null)
        {
            var htm = new StringBuilder();
            var secureEdit = User.checkSecurity(websiteId, "websilk/pages", Websilk.User.enumSecurity.read);
            var secureCreate = User.checkSecurity(websiteId, "websilk/pages", Websilk.User.enumSecurity.create);
            var secureDelete = User.checkSecurity(websiteId, "websilk/pages", Websilk.User.enumSecurity.delete);
            var secureSettings = User.checkSecurity(websiteId, "websilk/pages", Websilk.User.enumSecurity.update);

            var options = new bool[] { false, false, false, false };
            var pageItem = new Scaffold(S.Server.MapPath("/Pages/Dashboard/Pages/page-item.html"), S.Server.Scaffold);

            var pageLink = "";
            var color = "";

            htm.Append("<ul class=\"columns-list\">");

            foreach(var page in pages)
            {
                color = "empty";
                pageLink = "/" + page.path.Replace(" ", "-");
                options = new bool[] { true, true, true, true }; //edit, create, settings, delete

                //disable delete button
                switch (page.title.ToLower())
                {
                    case "home":
                        options[3] = false;
                        break;
                    case "dashboard":
                        continue;
                }

                //disable sub-page creation
                //switch (page.title.ToLower())
                //{
                //    case "error 404":
                //    case "access denied":
                //        options[1] = false;
                //        break;
                //}
                

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
                htm.Append("<li>" + RenderListItem(pageItem, color, page.pageid, page.title, page.title, page.path, pageLink, page.description, page.datecreated.ToString("MMMM dd, yyyy"), options, page.haschildren > 0) + "</li>");
            }

            htm.Append("</ul>");
            return htm.ToString();
        }

        private string RenderListItem(Scaffold item, string color, int pageId, string pageTitle, string pageTitleHead, string pagePath, string pageLink, string pageSummary, string createdate, bool[] options, bool isfolder = false)
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
            if (!User.checkSecurity(websiteId, "websilk/pages", Websilk.User.enumSecurity.create)) { return "err"; }

            //create new web page
            var query = new Query.Pages(S.Server.sqlConnectionString);
            query.CreatePage(S.User.userId, websiteId, parentId, title, description, secure);

            //return list of sub-pages
            return View(websiteId, parentId, 0, 100, 0, 0, "");
        }
        #endregion

        #region "Settings"

        public string ViewSettings(int websiteId, int id)
        {
            var scaffold = new Scaffold(S.Server.MapPath("/pages/dashboard/pages/settings.html"), S.Server.Scaffold);
            var query = new Query.Pages(S.Server.sqlConnectionString);
            var page = query.GetPageInfo(websiteId, id);
            if (page != null)
            {
                scaffold.Data["page-title"] = page.title;
                scaffold.Data["url-title"] = page.title.Replace(" ","-");
                scaffold.Data["parent-title"] = page.parenttitle;
                scaffold.Data["title-head"] = page.title;
                scaffold.Data["description"] = page.description;
                scaffold.Data["secure"] = page.security ? "checked=\"checked\"" : "";
                scaffold.Data["active"] = page.enabled ? "checked=\"checked\"" : "";
            }

            return scaffold.Render();
        }

        public string UpdateSettings(int websiteId, int id, string title, string description, int type, int shadowId, int shadowChildId, bool secure, bool active)
        {
            if (!User.checkSecurity(websiteId, "websilk/pages", Websilk.User.enumSecurity.update)) { return "err"; }

            //create new web page
            var query = new Query.Pages(S.Server.sqlConnectionString);
            query.UpdatePage(websiteId, id, title, description, secure, active);

            return "success";
        }
        
        public string Delete(int websiteId, int id)
        {
            if (!User.checkSecurity(websiteId, "websilk/pages", Websilk.User.enumSecurity.update)) { return "err"; }

            //move page to trash can
            var query = new Query.Pages(S.Server.sqlConnectionString);
            query.DeletePage(websiteId, id);

            return "success";
        }
        #endregion
    }
}