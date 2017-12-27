namespace Websilk
{
    public class Service : global::Service
    {
        public User User;
        public Website website = new Website();

        public Service(Core DatasilkCore) : base(DatasilkCore)
        {
            User = new User(DatasilkCore);
        }
    }
}
