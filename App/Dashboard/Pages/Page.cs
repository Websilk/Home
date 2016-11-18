﻿namespace Websilk.Pages.DashboardPages
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
                servePage.page = page;
                scaffold = new Scaffold(S, "/App/Dashboard/Pages/pages.html");
                scaffold.Data["page-list"] = servePage.View(0, 1, 1000, 4, 0, "").html;
                scaffold.Data["field-create-title"] = textCreateTitle.Render("txtcreatetitle","","", "Page Title");
                scaffold.Data["field-create-summary"] = textCreateSummary.Render("txtcreatetitle", "", "", "Page Title", "", Element.Textbox.enumTextType.textarea);
                S.javascriptFiles.Add("dash-pages", "/js/dashboard/pages/pages.js");
                S.javascript.Add("dash-pages", "S.dashboard.pages.current_page=0;");
            }
            
            inject.html = scaffold.Render();
            return inject;
        }
    }
}
