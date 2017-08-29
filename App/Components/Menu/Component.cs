using System.Text;
using System.Collections.Generic;
using ProtoBuf;

namespace Websilk.Components
{
    public class Menu : Component
    {
        [ProtoContract]
        public struct item
        {
            [ProtoMember(1)]
            public string url;
            [ProtoMember(2)]
            public string text;
            [ProtoMember(3)]
            public string icon;
            [ProtoMember(4)]
            public string target;
            [ProtoMember(5)]
            public int design; //index of HTML design to use for menu item
        }

        [ProtoMember(1)]
        public List<item> menuItems;

        [ProtoMember(2)]
        public bool isHorizontal = false;

        private Scaffold menuItem;

        public Menu() { }

        #region "Overrides"

        public override string Name
        {
            get
            {
                return "Menu";
            }
        }

        public override string Path
        {
            get
            {
                return "/Components/Menu/";
            }
        }

        public override int defaultWidth
        {
            get
            {
                return 200;
            }
        }

        public override Editor.Component.Properties GetProperties() {
            return new ComponentProperties.Menu(S, this);
        }

        #endregion

        #region "Load"
        public override void Load()
        {
            var items = new StringBuilder();
            scaffold = new Scaffold(S, "/Components/Menu/component.html");
            menuItem = new Scaffold(S, "/Components/Menu/menu-item.html");

            if(menuItems == null) {
                menuItems = new List<item>(){
                    new item()
                    {
                        url = "javascript:",
                        text = "New Menu Item #1",
                        icon = "",
                        target = "",
                        design = 0
                    }
                };
            }

            foreach(var item in menuItems)
            {
                menuItem.Data["url"] = item.url;
                menuItem.Data["text"] = item.text;
                menuItem.Data["icon"] = item.icon != "" ? "1" : "";
                menuItem.Data["target"] = item.target != "" ? "target=\"" + item.target + "\"" : "";
                items.Append(menuItem.Render());
            }
            scaffold.Data["menu-items"] = items.ToString();
        }
        #endregion
    }
}
