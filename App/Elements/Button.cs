
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
            string jsurl = url;
            if(disabled == false)
            {
                if (aurl.IndexOf("javascript:") == 0)
                {
                    jsurl = url.Replace("javascript:", "");
                }
            }else
            {
                //disabled
                aurl = "javascript:";
                jsurl = "return false";
            }
            
            Data["url"] = aurl;
            Data["jsurl"] = jsurl;
            Data["label"] = label;
            return "<div class=\"button\" id=\"" + id + "\">" + scaffold.Render() + "</div>";
        }
    }
}
