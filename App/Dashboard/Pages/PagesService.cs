using System;
using System.Text;

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
            if(!S.User.checkSecurity(websiteId, "dashboard/pages", 0)) { return ""; }

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
            if((enumViewType)viewType == enumViewType.list)
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
            var pagePath = "";
            var pageLink = "";
            var pageSummary = "";
            var pageCreated = "";
            var subpageId = 0;
            var hasChildren = 0;
            var color = "";
            var options = new bool[] { false, false, false, false };
            var pageItem = new Scaffold(S, "/App/Dashboard/Pages/page-item.html");

            htm.Append("<ul class=\"columns-list\">");

            while (reader.Read())
            {
                color = "empty";
                subpageTitle = reader.Get("title");
                pagePath = reader.Get("path");
                pageSummary = reader.Get("description");
                pageCreated = DateTime.Parse(reader.Get("datecreated")).ToString("MMMM dd, yyyy");
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
                htm.Append("<li>" + RenderListItem(pageItem, color, subpageId, subpageTitle, pagePath, pageLink, pageSummary, pageCreated, options, hasChildren > 0) + "</li>");
            }

            htm.Append("</ul>");
            return htm.ToString();
        }

        private string RenderListItem(Scaffold item, string color, int pageId, string pageTitle, string pagePath, string pageLink, string pageSummary, string createdate, bool[] options, bool isfolder = false)
        {
            item.Data["id"] = pageId.ToString();
            item.Data["title"] = pageTitle;
            item.Data["path"] = pagePath;
            item.Data["link"] = pageLink;
            item.Data["summary"] = pageSummary.Replace("\"", "&quot;");
            item.Data["created"] = createdate;
            item.Data["color"] = color;
            item.Data["folder"] = isfolder == true ? "true" : "false";

            if(isfolder == true) {
                item.Data["icon"] = "<svg viewBox=\"0 0 15 15\"><use xlink:href=\"#icon-folder\" x=\"0\" y=\"0\" width=\"15\" height=\"15\" /></svg>";
            }
            else
            {
                item.Data["icon"] = "&nbsp;";
            }

            return item.Render();
        }

        #endregion

        #region "Create"

        public string Create(int websiteId, int parentId, string title, string description, bool secure, string layout = "", string service = "")
        {
            if (!S.User.checkSecurity(websiteId, "dashboard/pages", User.enumSecurity.create)) { return "err"; }

            //create new web page
            GetPage();
            page.sql.Create(S.User.userId, websiteId, parentId, title, description, SqlQueries.Page.enumPageType.dynamic, layout, service, secure);

            //return list of sub-pages
            return View(websiteId, parentId, 0, 100, 0, 0, "");
        }
        #endregion
    }
}
