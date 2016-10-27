
namespace Websilk.Components
{
    public class Login: Component
    {
        public Login(Core WebsilkCore):base(WebsilkCore) { }

        public override string Path
        {
            get
            {
                return "/App/Components/Login/";
            }
        }

        public override void Load()
        {
            base.Load();
        }
    }
}
