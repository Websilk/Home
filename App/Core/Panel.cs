using System.Text;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Websilk
{


    public class Panel
    {
        //arrangement settings for panel cells //////////////////////////////////
        public enum enumArrangeType
        {
            none = -1,
            grid = 0,
            rows = 1,
            slideshow = 2,
            book = 3
        }

        public struct structArrangeGrid
        {

        }

        public struct structArrangeRows
        {

        }

        public struct structArrangeSlideshow
        {

        }

        public struct structArrangeBook
        {

        }

        public struct structArrangement
        {
            public enumArrangeType type;
            public structCellGrid grid;
            public structCellRows rows;
            public structCellSlideshow slideshow;
            public structCellBook book;
        }

        //settings for a panel cell //////////////////////////////////

        public struct structCellGrid
        {
            
        }

        public struct structCellRows
        {

        }

        public struct structCellSlideshow
        {

        }

        public struct structCellBook
        {

        }

        public struct structCell
        {
            public string id;
            public string head;
            public string foot;
            public string css;
            public bool overflow;
            [JsonIgnore]
            public List<Component> components;
        }

        //panel properties /////////////////
        [JsonIgnore]
        private Core S;
        [JsonIgnore]
        private Page page;

        public string name = ""; //a human-readable name for reference only
        public string id = ""; //a unique ID
        public string blockId = "";
        public bool isPageBlock = false;
        public string areaName = ""; //name of layout area this panel belongs to
        public string blockName = ""; //name of block section to load into

        [JsonIgnore]
        public bool hasSiblings = false;
        [JsonIgnore]
        public bool isDisabled = false; //cannot drag & drop components into panel (page editor only)

        public structArrangement arrangement;
        public List<structCell> cells;

        [JsonIgnore]
        public string head = "";
        [JsonIgnore]
        public string foot = "";
        
        public Panel(Core WebsilkCore, Page page, string Id = "", string Name = "", string AreaName = "", string BlockId = "", string BlockName = "", bool IsPageBlock = false)
        {
            S = WebsilkCore;
            id = Id;
            name = Name;
            areaName = AreaName;
            blockId = BlockId;
            blockName = BlockName;
            isPageBlock = IsPageBlock;
            this.page = page;
        }

        public void AddCell(string cellId = "")
        {
            //set up settings for a new cell
            var cell = new structCell();
            cell.components = new List<Component>();
            if(cellId != "")
            {
                cell.id = cellId;
            }else
            {
                cell.id = S.Util.Str.CreateID();
            }
            cells.Add(cell);
        }

        public string Render()
        {
            //render panel, its cells, and all components within each cell
            var div = new Utility.DOM.Element("div");
            var htm = new StringBuilder();
            var comps = new StringBuilder();
            foreach(var cell in cells)
            {
                //render all components for a cell
                comps = new StringBuilder();
                foreach(var component in cell.components)
                {
                    comps.Append(component.Render());
                }

                //render cell
                var divcell = new Utility.DOM.Element("div");
                divcell.Classes.Add("is-cell");
                if (isDisabled) { divcell.Classes.Add("is-disabled"); }
                if(cell.css != "") { divcell.Attributes.Add("style",cell.css); }
                divcell.id = "cell_" + cell.id.Replace("-", "_").Replace(" ","_");
                divcell.innerHTML = cell.head + comps.ToString() + cell.foot;
                htm.Append(divcell.Render());
            }

            div.Classes.Add("is-panel");
            if(blockName != "") {
                div.Classes.Add("is-block");
                if (page.isEditable)
                {
                    div.Attributes.Add("data-area", areaName);
                    div.Attributes.Add("data-block", blockName);
                    div.Attributes.Add("data-block-id", blockId);
                    if(isPageBlock == true)
                    {
                        div.Attributes.Add("data-page-level", "true");
                    }
                }
            }
            if (hasSiblings) { div.Classes.Add("has-siblings"); }
            div.id = "panel_" + id.Replace("-", "_").Replace(" ", "_");
            div.innerHTML = head + htm.ToString() + foot;

            return div.Render();
        }
    }
}
