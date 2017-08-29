using System.Text;

namespace Websilk.ComponentProperties
{
    public class Menu: Editor.Component.Properties
    {
        public Components.Menu Component;

        public override string Path{ get { return "/Components/Menu"; } }

        public Menu(Core WebsilkCore, Component componentInstance):base (WebsilkCore, componentInstance) { }

        public override void Load()
        {
            var html = new StringBuilder();

            //create tab menu
            AddMenuItem("Menu Items");
            AddMenuItem("Design", "S.componentProperties.design.loadAce();");

            //create menu item list
            var item = new Scaffold(S, Path + "/prop-menuitem.html");
            Component = (Components.Menu)component;
            for (var x = 0; x < Component.menuItems.Count; x++)
            {
                var menuitem = Component.menuItems[x];
                item.Data["text"] = menuitem.text;
                item.Data["url"] = menuitem.url;
                item.Data["target"] = menuitem.target != "" ? " target=\"" + menuitem.target + "\"" : "";
                html.Append(item.Render());
            }
            body.Data["menu-items"] = html.ToString();

            //add javascript dependency
            S.javascriptFiles.Add("componentProperties", "/js/components/menu/properties.js");
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Web API calls
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

namespace Websilk.Services.Editor.Component.Menu
{
    public class Properties: Service
    {
        public Properties (Core WebsilkCore):base(WebsilkCore) { }

        //public Inject GetList()
        //{
        //    GetPage();
        //    
        //}
    }
}
