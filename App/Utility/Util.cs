namespace Websilk.Utility
{
    public class Util
    {
        private Core S;

        public Str Str;
        public Serializer Serializer;

        public Util(Core WebsilkCore)
        {
            S = WebsilkCore;
            Str = new Str(S);
            Serializer = new Serializer(S);
        }

        #region "Validation"

        public bool IsEmpty(object obj)
        {
            if(obj == null) { return true; }
            if (string.IsNullOrEmpty(obj.ToString())==true) { return true; }
            return false;
        }

        #endregion
        
    }
}
