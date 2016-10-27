namespace Websilk.Element
{
    public class Panel : Element
    {
        public Panel(Core WebsilkCore, string path, string name = "") : base(WebsilkCore, path, name)
        {

        }

        public void Render(Websilk.Panel panel)
        {
            Data["content"] = "[content]";
            string p = scaffold.Render();
            int i = p.IndexOf("[content]");
            if(i >= 0)
            {
                panel.head = p.Substring(0, i);
                panel.foot = p.Substring(i + 9);
            }
            else
            {
                panel.head = "";
                panel.foot = "";
            }
        }
    }
}
