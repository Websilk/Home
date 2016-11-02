
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

        public string Render(string id, string name = "", string value = "", string placeholder = "", string style = "", enumTextType textType = enumTextType.text)
        {
            string htm = "";
            string styling = style;
            string type = "text";
            string val = "";
            string named = "";
            string placeholding = "";
            
            switch (textType)
            {
                case enumTextType.password:
                    type = "password"; break;
                case enumTextType.textarea:
                    type = "textarea"; break;
            }

            //setup attributes
            if(styling.Length > 0) { styling = " style=\"" + styling + "\""; }
            if (value.Length > 0) { val = " value=\"" + value + "\""; }
            if(name != "") { named = " name=\"" + id + "\""; }
            if(placeholder != "") { placeholding = " placeholder=\"" + placeholder + "\""; }
            
            if(textType == enumTextType.textarea)
            {
                //render textarea
                htm = "<textarea id=\"" + id + "\"" + name + styling + ">" + value + "</textarea>";
            }
            else
            {
                //render textbox
                htm = "<input type=\"" + type + "\" id=\"" + id + "\"" + named + styling + placeholding + val + "/>";
            }
            Data["input"] = htm;
            return scaffold.Render();
        }
    }
}
