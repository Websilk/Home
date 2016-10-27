using System.Collections.Generic;
using Newtonsoft.Json;

namespace Websilk
{
    public class Component
    {
        [JsonIgnore]
        protected Core S;

        public string id = ""; //unique ID
        public int pageId = 0; //can be page or layer id
        public string panelId = ""; //unique ID of panel this component belongs to
        public string panelCellId = ""; //unique ID of panel cell this component belongs to
        public string classPath = ""; //relative path where component class is stored

        //data stored about the component
        public List<string> position;
        public string css;

        //panels inside the component
        public List<string> panelIds;
        [JsonIgnore]
        public List<Panel> panels;
        [JsonIgnore]
        protected Scaffold scaffold;
        [JsonIgnore]
        protected Utility.DOM.Element div;

        public Component(Core WebsilkCore)
        {
            S = WebsilkCore;
        }

        #region "Properties"
        /// <summary>
        /// relative path where component class is located. Must end with a forward-slash
        /// </summary>
        public virtual string Path{
            get { return classPath; }
        }
        #endregion

        #region "Events"

        /// <summary>
        /// Executing after creating an instance of the Component class
        /// </summary>
        public void Initialize()
        {
            div = new Utility.DOM.Element("div");
            scaffold = new Scaffold(S, Path + "component.html");
        }

        /// <summary>
        /// Executed before the web page is rendered. 
        /// </summary>
        public virtual void Load()
        {
            
        }

        /// <summary>
        /// Executed when the user adds a new component to their web page when in edit mode.
        /// Used to set up default properties for the component before it is loaded onto the 
        /// web page for the first time.
        /// </summary>
        public virtual void Create()
        {
            
        }

        /// <summary>
        ///  Executed when the web page is being rendered or when the user adds a new component to their web page when in edit mode.
        ///  All panel cells & components that belong to this component's hierarchy will be rendered as well.
        /// </summary>
        /// <returns>HTML string</returns>
        public string Render()
        {
            return scaffold.Render();
        }

        #endregion
    }
}

