using System.Text;
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

        public enum enumWidthType
        {
            pixels = 0,
            percent = 1,
            window = 2
        }

        public enum enumHeightType
        {
            pixels = 0,
            auto = 1,
            window = 2
        }

        public struct structPadding
        {
            public int top;
            public int right;
            public int bottom;
            public int left;
        }

        public struct structPosition
        {
            public int left;
            public int top;
            public int width;
            public int height;
            public bool isUsed;
            public bool forceNewLine;
            public enumAlign align;
            public enumPosition position;
            public enumIsFixed fixedAlign;
            public enumWidthType widthType;
            public enumHeightType heightType;
            public structPadding padding;
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
        public string css = "";

        //resources attached to this component
        [JsonIgnore]
        public List<string> resourcesForInstance;
        [JsonIgnore]
        public List<string> resourcesForComponentType;

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
        /// A required override. The human-readable name of this component
        /// </summary>
        [JsonIgnore]
        public virtual string Name
        {
            get { return "Component"; }
        }

        /// <summary>
        /// A required override. The relative path where the component class is located. Must end with a forward-slash
        /// </summary>
        [JsonIgnore]
        public virtual string Path{
            get { return ""; }
        }

        [JsonIgnore]
        public virtual int defaultWidth
        {
            get { return 320; }
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
            posHD.left = 0;
            posHD.top = 0;
            posHD.width = defaultWidth;
            posHD.align = enumAlign.center;
            posHD.position = enumPosition.isRelative;
            posHD.widthType = enumWidthType.pixels;
            posHD.heightType = enumHeightType.auto;
            posHD.padding = new structPadding();
            posHD.forceNewLine = false;
            posHD.isUsed = true;

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
            StringBuilder js = new StringBuilder();
            StringBuilder css = new StringBuilder();
            StringBuilder style;
            structPosition pos;
            for(var x = 4; x >= 0; x--)
            {
                //set up each window size breakpoint (cell, mobile, tablet, desktop, HD)
                pos = position[x];

                if(pos.width == 0) { continue; } //0 width means no position data available

                style = new StringBuilder();

                //horizontal alignment
                switch (pos.align)
                {
                    case enumAlign.left:
                        style.Append("float:left;display:block;");
                        break;
                    case enumAlign.center:
                        if(pos.forceNewLine == true)
                        {
                            style.Append("float:none;display:block;");
                        }else
                        {
                            style.Append("float:none;display:inline-block;");
                        }
                        break;
                    case enumAlign.right:
                        style.Append("float:right;display:block;");
                        break;
                }

                //position type
                if(pos.position == enumPosition.isFixed)
                {
                    style.Append("position:fixed;");
                    switch (pos.fixedAlign)
                    {
                        case enumIsFixed.top:
                            style.Append("top:auto;bottom:auto;");
                            break;
                        case enumIsFixed.middle:
                            style.Append("top:50%;bottom:50%;");
                            break;
                        case enumIsFixed.bottom:
                            style.Append("top:auto;bottom:0;");
                            break;
                    }
                }
                else
                {
                    style.Append("position:relative;");
                }
                
                //x & y offset position
                style.Append("left:" + pos.left + "px;top:" + pos.top + "px;width:100%;");

                //width & height
                switch (pos.widthType)
                {
                    case enumWidthType.pixels:
                        style.Append("max-width:" + pos.width + "px;");
                        break;
                    case enumWidthType.percent:
                        style.Append("max-width:" + pos.width + "%;");
                        break;
                    case enumWidthType.window:
                        style.Append("max-width:100%;");
                        break;
                }
                switch (pos.heightType)
                {
                    case enumHeightType.pixels:
                        style.Append("height:" + pos.height + "px;");
                        break;
                    case enumHeightType.auto:
                    case enumHeightType.window:
                        style.Append("height:auto;");
                        break;
                }

                //padding
                style.Append("padding:" + 
                    pos.padding.top + "px " + 
                    pos.padding.right + "px " + 
                    pos.padding.bottom + "px " + 
                    pos.padding.left + "px;");

                //force new line
                if (pos.forceNewLine == true)
                {
                    style.Append("margin:0 auto;");
                }

                //compile style with CSS selector
                switch (x)
                {
                    case 0://Cell
                        css.Append(".s-cell #c" + id + "{" + style.ToString() + "}\n");
                        break;
                    case 1://Mobile
                        css.Append(".s-mobile #c" + id + ", .s-cell #c" + id + "{" + style.ToString() + "}\n");
                        break;
                    case 2://Tablet
                        css.Append(".s-tablet #c" + id + ", .s-mobile #c" + id + ", .s-cell #c" + id + "{" + style.ToString() + "}\n");
                        break;
                    case 3://Desktop
                        css.Append(".s-desktop #c" + id + ", .s-tablet #c" + id + ", .s-mobile #c" + id + ", .s-cell #c" + id + "{" + style.ToString() + "}\n");
                        break;
                    case 4://HD
                        css.Append(".s-hd #c" + id + ",  .s-desktop #c" + id + ", .s-tablet #c" + id + ", .s-mobile #c" + id + ", .s-cell #c" + id + "{" + style.ToString() + "}\n");
                        break;
                }
                x--;
            }

            //add compiled CSS to renderer
            S.css.Add("layer_" + pageId, css.ToString());

            //add component reference (with component instance-specific resource references) to page
            js.Append("S.components.add('" + id + "', '" + Name + "', [");
            if(resourcesForInstance != null)
            {
                for (var x = 0; x < resourcesForInstance.Count; x++)
                {
                    js.Append((x > 0 ? "," : "") + "'" + resourcesForInstance[x] + "'");
                }
            }
            js.Append("]);");

            //add component-type resource references to page (js & css)
            if(resourcesForComponentType != null)
            {
                if (resourcesForComponentType.Count > 0)
                {
                    js.Append("S.components.addReferences('" + Name + "', [");
                    for (var x = 0; x < resourcesForComponentType.Count; x++)
                    {
                        js.Append((x > 0 ? "," : "") + "'" + resourcesForComponentType[x] + "'");
                    }
                    js.Append("]);");
                }
            }
            

            S.javascript.Add('c' + id + "_ref", js.ToString());
            

            //set up div container for component
            div.id = "c" + id;
            div.Classes.Add("component");

            //finally, render contents of component
            div.innerHTML = scaffold.Render();
            return div.Render();
        }

        /// <summary>
        /// Sets a value for a custom variable within the component that is later saved to the page.json file 
        /// </summary>
        /// <param name="data"></param>
        public virtual void SetValue(object data)
        {

        }
        #endregion

        #region "Utility"
        protected void AddJavascriptCode(string name, string javascript, bool forInstanceOnly = false)
        {
            //add javascript code reference for this component (instance or type)
            var n = (forInstanceOnly ? "c" + id : Name.Replace(" ", "-")) + '_' + name;
            S.javascript.Add(n, javascript);
            if (forInstanceOnly)
            {
                if(resourcesForInstance == null) { resourcesForInstance = new List<string>(); }
                resourcesForInstance.Add("js_" + n);
            }else
            {
                if (resourcesForComponentType == null) { resourcesForComponentType = new List<string>(); }
                resourcesForComponentType.Add("js_" + n);
            }
        }

        protected void AddJavascriptFile(string name, string file, bool forInstanceOnly = false)
        {
            //add javascript file reference for this component (instance or type)
            var n = (forInstanceOnly ? "c" + id : Name.Replace(" ","-")) + '_' + name;
            S.javascriptFiles.Add(n, file);
            if (forInstanceOnly)
            {
                if (resourcesForInstance == null) { resourcesForInstance = new List<string>(); }
                resourcesForInstance.Add("js_" + n);
            }
            else
            {
                if (resourcesForComponentType == null) { resourcesForComponentType = new List<string>(); }
                resourcesForComponentType.Add("js_" + n);
            }
        }

        protected void AddCss(string name, string css, bool forInstanceOnly = false)
        {
            //add css styles reference for this component (instance or type)
            var n = (forInstanceOnly ? "c" + id : Name.Replace(" ", "-")) + '_' + name;
            S.css.Add(n, css);
            if (forInstanceOnly)
            {
                if (resourcesForInstance == null) { resourcesForInstance = new List<string>(); }
                resourcesForInstance.Add("css_" + n);
            }
            else
            {
                if (resourcesForComponentType == null) { resourcesForComponentType = new List<string>(); }
                resourcesForComponentType.Add("css_" + n);
            }
        }
        #endregion
    }
}

