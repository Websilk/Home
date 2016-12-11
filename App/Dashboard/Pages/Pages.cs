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
                var textCreateTitle = (Element.Textbox)page.Elements.Load(ElementType.Textbox);
                var textCreateSummary = (Element.Textbox)page.Elements.Load(ElementType.Textbox);
                var websiteId = page.websiteId;
                if (S.Request.Query.ContainsKey("websiteid")) { websiteId = int.Parse(S.Request.Query["websiteid"]); }
                servePage.page = page;
                scaffold = new Scaffold(S, "/App/Dashboard/Pages/pages.html");
                scaffold.Data["page-list"] = servePage.View(websiteId, 0, 1, 1000, 4, 0, "");
                scaffold.Data["field-create-title"] = textCreateTitle.Render("txtcreatetitle","","", "New Page Title");
                scaffold.Data["field-create-summary"] = textCreateSummary.Render("txtcreatedesc", "", "", "Write a description about your new page", "", Element.Textbox.enumTextType.textarea);
                S.javascriptFiles.Add("dash-pages", "/js/dashboard/pages/pages.js");
                S.javascript.Add("dash-pages", "S.dashboard.pages.current_page=0;");
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}
