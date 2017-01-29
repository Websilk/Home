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
            public List<string> componentIds;
            [JsonIgnore]
            public List<Component> components;
        }

        //panel properties /////////////////
        [JsonIgnore]
        private Core S;

        public string name = ""; //a human-readable name for human reference only
        public string id = ""; //a unique ID
        public structArrangement arrangement;
        public List<structCell> cells;

        [JsonIgnore]
        public string head = "";
        [JsonIgnore]
        public string foot = "";
        
        public Panel(Core WebsilkCore, string Id = "", string Name = "")
        {
            S = WebsilkCore;
            id = Id;
            name = Name;
        }

        public void AddCell()
        {
            //set up settings for a new cell
            var cell = new structCell();
            cell.components = new List<Component>();
            cell.componentIds = new List<string>();
            cell.id = S.Util.Str.CreateID();
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
                divcell.Classes.Add("cell-" + cell.id + " is-cell");
                divcell.innerHTML = cell.head + comps.ToString() + cell.foot;
                htm.Append(divcell.Render());
            }

            div.Classes.Add("panel-" + id + " is-panel");
            div.innerHTML = head + htm.ToString() + foot;

            return div.Render();
        }
    }
}
