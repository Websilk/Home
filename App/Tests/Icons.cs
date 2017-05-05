using System.Text;
using System.Collections.Generic;

namespace Websilk.Services
{
    public class Icons : Service
    {
        public Icons(Core WebsilkCore) : base(WebsilkCore) { }

        public WebRequest List()
        {
            var scaffold = new Scaffold(S, "/Tests/icons.html");
            var icon = new Scaffold(S, "/Tests/icon.html");
            var icons = new StringBuilder();

            var list = new List<string>()
            {
                "btn-arrow-down",
                "btn-arrow-up",
                "icon-account",
                "icon-add",
                "icon-addsmall",
                "icon-admin",
                "icon-alerts",
                "icon-analytics",
                "icon-apps",
                "icon-arrow-down",
                "icon-arrow-left",
                "icon-arrow-right",
                "icon-background",
                "icon-close",
                "icon-collapse",
                "icon-colorschemes",
                "icon-componentselect",
                "icon-component-textbox",
                "icon-cycle",
                "icon-dashboard",
                "icon-design",
                "icon-expand",
                "icon-folder",
                "icon-folderfiles",
                "icons-fonts",
                "icon-grid",
                "icon-help",
                "icon-history",
                "icon-layers",
                "icon-layout",
                "icon-logo",
                "icon-logout",
                "icon-movefolder",
                "icon-openwindow",
                "icon-options",
                "icon-pages",
                "icon-panel",
                "icon-panelbook",
                "icon-panelgrid",
                "icon-panelrows",
                "icon-panelslideshow",
                "icon-photos",
                "icon-plus",
                "icon-position",
                "icon-publish",
                "icon-remove",
                "icon-resize",
                "icon-save",
                "icon-screencell",
                "icon-screendesktop",
                "icon-screenhd",
                "icon-screenmobile",
                "icon-screentablet",
                "icon-search",
                "icon-settings",
                "icon-sourcecode",
                "icon-style",
                "icon-submenu",
                "icon-textbgcolor",
                "icon-textbold",
                "icon-textbullet",
                "icon-textcenter",
                "icon-textcolor",
                "icon-textindent",
                "icon-textitalic",
                "icon-textleft",
                "icon-textlink",
                "icon-textmore",
                "icon-textnumbers",
                "icon-textoutdent",
                "icon-textphoto",
                "icon-textright",
                "icon-textsource",
                "icon-textstrikethru",
                "icon-texttable",
                "icon-textunderline",
                "icon-timeline",
                "icon-upload",
                "icon-users",
                "icon-websites",
                "icon-windowleftside",
                "icon-windowmaximize",
                "icon-windowminimize",
                "icon-windowrightside"
            };

            foreach(var a in list)
            {
                icons.Append(icon.Render(new Dictionary<string, string>() {{ "icon", a }, {"title", a}}));
            }
            scaffold.Data["icons"] = icons.ToString();
            scaffold.Data["svg-icons"] = S.Server.LoadFileFromCache("/Content/themes/default/icons.svg", true);
            return new WebRequest()
            {
                contentType = "text/html",
                html = scaffold.Render()
            };
        }
        

    }
}
