namespace Utility
{
    public struct structImage
    {
        public string path;
        public string filename;
        public int width;
        public int height;
    }
        

    public class Images
    {
        private Core S;

        public Images(Core WebsilkCore)
        {
            S = WebsilkCore;
        }
    }
}
