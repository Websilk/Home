namespace Websilk
{
    public class Page : global::Page
    {
        public User User;
        public Website website = new Website();

        public Page(Core DatasilkCore) : base(DatasilkCore)
        {
            User = new User(DatasilkCore);
            AddCSS("/css/colors/default.css");
        }
        
    }
}
