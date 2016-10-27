using System.Security.Cryptography;
using System.Text;

namespace Websilk.Utility
{
    public class Encryption
    {
        private Core S;
        public Encryption(Core WebsilkCore)
        {
            S = WebsilkCore;
        }

        public string GetMD5Hash(string str)
        {
            MD5 md5 = MD5.Create();
            byte[] bytes = Encoding.ASCII.GetBytes(str);
            byte[] hash = md5.ComputeHash(S.Util.Str.GetBytes(str));
            StringBuilder sb = new StringBuilder();
            for (int x = 0; x < hash.Length; x++)
            {
                sb.Append(hash[x].ToString("X2"));
            }
            return sb.ToString();
        }
    }
}
