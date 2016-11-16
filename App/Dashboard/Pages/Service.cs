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

            var row = "";
            var hasDelete = false;
            var subpageTitle = "";
            var pagePath = "";
            var pageLink = "";
            var subpageId = 0;
            var options = "";
            var hasCreate = false;
            var hasChildren = 0;
            var color = "";

            htm.Append("<ul class=\"columns-list\">");

            if(parentId > 0)
            {
                //render parent folder item
                htm.Append(RenderListItem(row, "empty", parentPageId, parentTitle, "..", "", true, "Go back to the parent folder"));
            }

            while (reader.Read())
            {
                row = "";
                color = "empty";
                subpageTitle = reader.Get("title");
                pagePath = reader.Get("path");
                subpageId = reader.GetInt("pageid");
                hasChildren = reader.GetInt("haschildren");
                hasDelete = true;
                hasCreate = true;
                pageLink = "";
                options = "";

                //disable delete button
                switch (subpageTitle.ToLower())
                {
                    case "home":
                    case "login":
                    case "error 404":
                    case "access denied":
                    case "about":
                    case "contact":
                        hasDelete = false;
                        break;
                }

                //disable sub-page creation
                switch (subpageTitle.ToLower())
                {
                    case "login":
                    case "error 404":
                    case "access denied":
                        hasCreate = false;
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

                //setup page link

                pageLink = "/" + (pagePath).Replace(" ", "-");

                //setup options
                if (secureDelete == true & hasDelete == true)
                {
                    //remove link
                    options += "<div class=\"col icon small right pad-right\"><a href=\"javascript:\" onclick=\"S.editor.pages.remove('" + subpageId + "');return false\" title=\"Permanently delete the page '" + subpageTitle + "' and all of its sub-pages\"><svg viewBox=\"0 0 15 15\"><use xlink:href=\"#icon-close\" x=\"0\" y=\"0\" width=\"36\" height=\"36\" /></svg></a></div>";
                }
                if (secureSettings == true)
                {
                    //settings link
                    options += "<div class=\"col icon small right pad-right\"><a href=\"javascript:\" onclick=\"S.editor.pages.settings.show('" + subpageId + "');return false\" title=\"Page Settings for '" + subpageTitle + "'\"><svg viewBox=\"0 0 36 36\"><use xlink:href=\"#icon-settings\" x=\"0\" y=\"0\" width=\"36\" height=\"36\" /></svg></a></div>";
                }
                if (secureCreate == true & hasCreate == true)
                {
                    //add sub-page link
                    options += "<div class=\"col icon small right pad-right\"><a href=\"javascript:\" onclick=\"S.editor.pages.add.show('" + subpageId + "','" + pagePath + "');return false\" title=\"Create a new Sub-Page for '" + subpageTitle + "'\"><svg viewBox=\"0 0 15 15\"><use xlink:href=\"#icon-add\" x=\"0\" y=\"0\" width=\"15\" height=\"15\" /></svg></a></div>";
                }

                //page link
                options += "<div class=\"col icon small right pad-right\"><a href=\"" + pageLink + "\" title=\"View Web Page\"><svg viewBox=\"0 0 15 15\"><use xlink:href=\"#icon-openwindow\" x=\"0\" y=\"0\" width=\"15\" height=\"15\" /></svg></a></div>";

                htm.Append("<li>" + RenderListItem(row, color, subpageId, subpageTitle, subpageTitle, options, hasChildren > 0, "View a list of sub-pages for '" + subpageTitle + "'") + "</li>");
            }

            htm.Append("</ul>");
            return htm.ToString();
        }

        private string RenderListItem(string columnName, string color, int pageId, string pageTitle, string label, string options, bool onclick = false, string folderTooltip = "")
        {
            return "<div class=\"row hover" + columnName + " item page-" + pageId + "\">" +
                        "<div class=\"color-tag " + color + "\"><div class=\"bg dark\">&nbsp;</div></div><div class=\"col color-contents pad-sm clear\">" +
                            "<div class=\"col" + (onclick == true ? " has-folder\" onclick=\"S.editor.pages.load(" + pageId + ",'" + pageTitle + "','down')\" style=\"cursor:pointer\"" : "\"") + ">" +
                                "<div class=\"col icon small\">" +
                                    (onclick == true ?
                                    "<a href=\"javascript:\" title=\"" + folderTooltip + "\">" +
                                        "<svg viewBox=\"0 0 15 15\"><use xlink:href=\"#icon-folder\" x=\"0\" y=\"0\" width=\"15\" height=\"15\" /></svg>" +
                                    "</a>" : " ") +
                                "</div>" +
                                "<div class=\"col label\">" + label + "</div>" +
                            "</div>" +
                            "<div class=\"col hover-only right\">" + options + "</div>" +
                        "</div>" +
                    "</div>";
        }
    }
}
