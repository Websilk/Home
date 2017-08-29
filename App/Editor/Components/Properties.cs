using System;
using System.Collections.Generic;
using System.Text;

namespace Websilk.Editor.Component
{
    public class Properties
    {
        protected Core S;
        protected Websilk.Component component;
        protected Scaffold scaffold;
        protected Scaffold menuitem;
        protected Scaffold body;
        protected StringBuilder menuitems = new StringBuilder();
        protected bool hasItems = false;
        private int menuItemCount = 0;

        public Properties(Core WebsilkCore, Websilk.Component componentInstance)
        {
            S = WebsilkCore;
            component = componentInstance;
            scaffold = new Scaffold(S, "/Editor/UI/window-body.html");
            menuitem = new Scaffold(S, "/Editor/UI/window-menu-item.html");
            body = new Scaffold(S, Path + "/properties.html");
        }

        public virtual string Path { get { return ""; } }

        /// <summary>
        /// Executed when the component properties window is first loaded for a specific component instance
        /// </summary>
        public virtual void Load() { }

        public string Render()
        {
            scaffold.Data["body"] = body.Render();
            scaffold.Data["menu-items"] = menuitems.ToString();
            return scaffold.Render();
        }

        /// <summary>
        /// Executed whenever the user clicks the "save" button within the component properties window (in the Page Editor)
        /// </summary>
        /// <param name="data"></param>
        public virtual void Save(Dictionary<string, object> data) { }

        #region "Menu"
        public void AddMenuItem(string title, string javascript = "")
        {
            menuItemCount++;
            if (hasItems == false)
            {
                hasItems = true;
                scaffold.Data["menu"] = "1";
                menuitem.Data["selected"] = " selected";
            }
            else
            {
                menuitem.Data["selected"] = "";
            }
            menuitem.Data["title"] = title;
            menuitem.Data["onclick"] = "S.editor.window.tabMenu.select('ComponentProperties'," + menuItemCount + ");" + javascript;
            menuitems.Append(menuitem.Render());
        }
#endregion
    }
}
