
namespace Websilk.Element
{
    public class Button:Element
    {
        public Button(Core WebsilkCore, string path, string name = "") : base(WebsilkCore, path, name)
        {

        }

        public string Render(string id, string url, string label, bool disabled = false)
        {
            string aurl = url;
            string jsurl = "";
            if(disabled == false)
            {
                if (aurl.IndexOf("javascript:") == 0)
                {
                    jsurl = url.Replace("javascript:", "");
                    aurl = "javascript:";
                }
            }else
            {
                //disabled
                aurl = "javascript:";
                jsurl = "return false";
            }
            
            Data["url"] = aurl;
            if(jsurl != "")
            {
                //use onclick attribute
                Data["jsurl"] = jsurl;
                Data["click"] = "true";
            }
            Data["label"] = label;
            Data["id"] = id;
            return scaffold.Render();
        }
    }
}
