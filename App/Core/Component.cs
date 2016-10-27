using System.Collections.Generic;
using Newtonsoft.Json;

namespace Websilk
{
    public class Component
    {
        [JsonIgnore]
        protected Core S;

        [JsonIgnore]
        protected Panel panel;

        public string id = ""; //unique ID
        public int pageId = 0; //can be page or layer id
        public string panelId = ""; //unique ID of panel this component belongs to
        public string panelCellId = ""; //unique ID of panel cell this component belongs to

        //data stored about the component
        public List<string> data;
        public List<string> design;
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

        public Component(Core WebsilkCore, string path)
        {
            S = WebsilkCore;
            div = new Utility.DOM.Element("div");
            scaffold = new Scaffold(S, path + "component.html");
        }

        public virtual void Load()
        {
            //when the component is first initialized onto the page
        }

        public string Render()
        {
            return scaffold.Render();
        }
    }
}

