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

        public Inject View(int parentId, int start, int length, int orderby, int viewType, string search)
        {
            var response = new Inject();
            GetPage();
            if(!S.User.checkSecurity(page.websiteId, "dashboard/pages", 0)) { return response; }

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
            var reader = page.sql.GetPagesForWebsite(page.websiteId, parentId, start, length, orderby, search);
            if((enumViewType)viewType == enumViewType.list)
            {
                response.html = ViewPagesList(reader, parentId, pageTitle, parentPageId, parentTitle, parentPath, parentPathIds);
            }

            return response;
        }

        private string ViewPagesList(SqlReader reader, int parentId, string pageTitle, int parentPageId, string parentTitle, string parentPath, string parentPathIds)
        {
            var htm = new StringBuilder();
            var secureEdit = S.User.checkSecurity(page.websiteId, "dashboard/pages", 0);
            var secureCreate = S.User.checkSecurity(page.websiteId, "dashboard/pages", 1);
            var secureDelete = S.User.checkSecurity(page.websiteId, "dashboard/pages", 2);
            var secureSettings = S.User.checkSecurity(page.websiteId, "dashboard/pages", 3);
            
            var subpageTitle = "";
            var pagePath = "";
            var pageLink = "";
            var pageSummary = "";
            var pageCreated = "";
            var subpageId = 0;
            var hasChildren = 0;
            var color = "";
            var options = new bool[] { false, false, false, false };

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
                htm.Append("<li>" + RenderListItem(color, subpageId, subpageTitle, pageLink, pageSummary, pageCreated, options, hasChildren > 0) + "</li>");
            }

            htm.Append("</ul>");
            return htm.ToString();
        }

        private string RenderListItem(string color, int pageId, string pageTitle, string pageLink, string pageSummary, string createdate, bool[] options, bool isfolder = false)
        {
            return "<div class=\"row hover item\" onclick=\"S.dashboard.pages.details(this)\"" + 
                    (isfolder == true ? " data-folder=\"true\"" : "") + "\" data-pageid=\"" + pageId + "\" data-title=\"" + pageTitle + "\" data-link=\"" + pageLink + "\" data-summary=\"" + pageSummary.Replace("\"", "&quot;") + "\" data-created=\"" + createdate + "\">" +
                        "<div class=\"color-tag " + color + "\"><div class=\"bg dark\">&nbsp;</div></div>" + 
                        "<div class=\"col color-contents pad-sm clear\">" +
                            "<div class=\"col icon small\">" +
                                (isfolder == true ?
                                    "<svg viewBox=\"0 0 15 15\"><use xlink:href=\"#icon-folder\" x=\"0\" y=\"0\" width=\"15\" height=\"15\" /></svg>" 
                                : "") +
                            "</div>" +
                            "<div class=\"col label\">" + pageTitle + "</div>" +
                        "</div>" +
                    "</div>";
        }

        #endregion

        #region "Create"

        public Inject Create(int parentId, string title, string description, bool secure)
        {
            var response = new Inject();
            if (!S.User.checkSecurity(page.websiteId, "dashboard/pages", 1)) { return response; }


            return response;
        }
        #endregion
    }
}
