using System;
using System.Collections.Generic;

namespace Websilk
{
    public enum ElementType
    {
        Button = 1,
        List = 2,
        Panel = 3,
        Textbox = 4
    }

    public class Elements
    {

        private Core S;
        private string Path = ""; //relative path

        public Elements(Core WebsilkCore, string path)
        {
            S = WebsilkCore;
            Path = path; //path to the theme folder
        }

        public Element.Element Load(ElementType type, string name = "", string themePath = "")
        {
            string pth = themePath;
            Element.Element elem;
            if(pth == "") { pth = Path; }

            switch (type)
            {
                case ElementType.Button:
                    elem = new Element.Button(S, pth + "elements/button.html", name != "" ? name : "button");
                    break;

                case ElementType.List:
                    elem = new Element.List(S, pth + "elements/list.html", name != "" ? name : "list");
                    break;

                case ElementType.Panel:
                    elem = new Element.Panel(S, pth + "elements/panel.html", name != "" ? name : "panel");
                    break;

                case ElementType.Textbox:
                    elem = new Element.Textbox(S, pth + "elements/textbox.html", name != "" ? name : "textbox");
                    break;

                default:
                    elem = new Element.Element(S, pth, name);
                    break;
            }

            return elem;
        }
    }
}

namespace Websilk.Element
{
    public class Element
    {
        protected Core S;
        protected Scaffold scaffold;
        public string Name = "";
        public string Folder = "";

        public Element(Core WebsilkCore, string path, string name = "")
        {
            S = WebsilkCore;
            scaffold = new Scaffold(S, path, "", name);
        }

        public Dictionary<string, string> Data
        {
            get { return scaffold.Data; }
        }

        public string Render()
        {
            return scaffold.Render();
        }
    }
}
