using System.Collections.Generic;
using Newtonsoft.Json;

namespace Websilk
{
    public class Component
    {
        public enum enumAlign
        {
            left = 0,
            center = 1,
            right = 2
        }

        public enum enumPosition
        {
            isRelative = 0,
            isFixed = 1
        }

        public enum enumIsFixed
        {
            top = 0,
            middle = 1,
            bottom = 2
        }

        public struct structPadding
        {
            public string top;
            public string right;
            public string bottom;
            public string left;
        }

        public struct structPosition
        {
            public bool isUsed;
            public string width;
            public string height;
            public enumAlign align;
            public enumPosition position;
            public int left;
            public int top;
            public structPadding padding;
            public bool forceNewLine;
        }

        [JsonIgnore]
        protected Core S;
        [JsonIgnore]
        protected Page Page;

        public string id = ""; //unique ID
        [JsonIgnore]
        public int pageId = 0; //can be page or layer id
        public string panelId = ""; //unique ID of panel this component belongs to
        public string panelCellId = ""; //unique ID of panel cell this component belongs to

        //data stored about the component
        public List<structPosition> position;
        public string css;
        
        //panels inside the component
        public List<string> panelIds;
        [JsonIgnore]
        public List<Panel> panels;
        [JsonIgnore]

        //rendering objects
        protected Scaffold scaffold;
        [JsonIgnore]
        protected Utility.DOM.Element div;

        public Component(){}

        #region "Properties"
        /// <summary>
        /// A required override. The relative path where the component class is located. Must end with a forward-slash
        /// </summary>
        [JsonIgnore]
        public virtual string Path{
            get { return ""; }
        }
        #endregion

        #region "Events"
        /// <summary>
        /// Executing after creating a new instance of the Component class
        /// </summary>
        public void Initialize(Core WebsilkCore, Page page)
        {
            S = WebsilkCore;
            Page = page;
            div = new Utility.DOM.Element("div");
            scaffold = new Scaffold(S, Path + "component.html");
        }

        /// <summary>
        /// Executed before the web page is rendered. 
        /// </summary>
        public virtual void Load(){}

        /// <summary>
        /// Executed when the user adds a new component to their web page when in edit mode.
        /// Used to set up default properties for the component before it is loaded onto the 
        /// web page for the first time.
        /// </summary>
        public virtual void Create()
        {
            //set up default position settings
            var posHD = new structPosition();
            posHD.isUsed = true;
            posHD.left = 0;
            posHD.top = 0;
            posHD.position = enumPosition.isRelative;
            posHD.forceNewLine = false;
            posHD.align = enumAlign.center;

            position = new List<structPosition>();
            for (var x = 1; x <= 4; x++)
            {
                //add 4 empty position objects (for Cell, Mobile, Tablet, & Desktop)
                position.Add(new structPosition());
            }
            //add HD position object
            position.Add(posHD);
            
        }

        /// <summary>
        ///  Executed when the web page is being rendered and when the user adds a new component to their web page when in edit mode.
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

