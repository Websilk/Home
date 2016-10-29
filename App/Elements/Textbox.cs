
namespace Websilk.Element
{
    public class Textbox : Element
    {

        public enum enumTextType
        {
            text = 1,
            password = 2,
            textarea = 3
        }

        public Textbox(Core WebsilkCore, string path, string name = "") : base(WebsilkCore, path, name)
        {
        }

        public string Render(string id, string value, string placeholder, string style, enumTextType textType = enumTextType.text)
        {
            string htm = "";
            string styling = style;
            string classes = "";
            string divclass = "";
            string labelinput = "";
            string type = "text";
            string val = "";
            string onblur = "";

            switch (textType)
            {
                case enumTextType.password:
                    type = "password"; break;
                case enumTextType.textarea:
                    type = "textarea"; break;
            }

            //setup classes & styling
            if(styling.Length > 0) { styling = " style=\"" + styling + "\""; }
            if(value.Length > 0) { val=" value=\"" + value + "\""; }
            
            if(textType == enumTextType.textarea)
            {
                //render textarea
                htm = "<div class=\"textbox\">" +
                      "<textarea id=\"txt" + id + "\" name=\"" + id + "\"" + styling + " class=\"" + classes + "\">" + value + "</textarea>" +
                      "</div>";
            }
            else
            {
                //render textbox
                htm = "<div class=\"textbox" + divclass + "\">" +
                    "<input type=\"" + type + "\" id=\"txt" + id + "\" name=\"" + id + "\"" + styling + " class=\"" + classes + "\" placeholder=\"" + placeholder + "\"" + val + onblur + "/>" +
                    labelinput + "</div>";
            }
            

            Data["input"] = htm;
            return scaffold.Render();
        }
    }
}
