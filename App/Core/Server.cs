using System;
using System.Collections.Generic;
using System.IO;

namespace Websilk
{
    public class Server
    {
        ////////////////////////////////////////////////
        //Server     (for application-wide memory store)
        ////////////////////////////////////////////////

        public enum enumEnvironment
        {
            development = 0,
            staging = 1,
            production = 2
        }

        public string Version = "";
        // #.#.#.#.#.# =  years since github repo was created (10/22/2016) [#]
        //                current year, month, day of release [#.#.#]
        //                revision of the day (optional) [#]

        public Utility.Util Util = new Utility.Util();
        public enumEnvironment environment = enumEnvironment.development;
        public bool https = false;
        public DateTime serverStart = DateTime.Now;
        public int requestCount = 0;
        public float requestTime = 0;
        public string sqlActive = "";
        public string sqlConnection = "";
        public Random Random = new Random();
        public bool resetPass = false;
        public int bcrypt_workfactor = 10;
        private string _path = "";


        //Dictionary used for caching non-serialized objects, files from disk, or raw text
        //be careful not to leak memory into the cache while causing an implosion!
        public Dictionary<string, object> Cache = new Dictionary<string, object>();

        //Dictionary used for HTML scaffolding of various files on the server. 
        //Value for key/value pair is an array of HTML (scaffold["key"][x].htm), 
        //         separated by scaffold variable name (scaffold["key"][x].name),
        //         where data is injected in between each array item.
        public Dictionary<string, structScaffold> Scaffold = new Dictionary<string, structScaffold>();

        #region "System.UI.Web.Page.Server methods"
        public string path(string strPath = "")
        {
            if(_path == "") { _path = Path.GetFullPath("project.json").Replace("project.json", ""); }
            return _path + strPath.Replace("/", "\\");
        }

        public string MapPath(string strPath = "") { return path(strPath); }

        public string UrlDecode(string strPath)
        {
            return Uri.UnescapeDataString(strPath);
        }

        public string UrlEncode(string strPath)
        {
            return Uri.EscapeDataString(strPath);
        }
        
        #endregion

        public void CheckAdminPassword()
        {
            var Sql = new Sql(this, Util);
            if ((int)Sql.ExecuteScalar("EXEC HasPassword @userId=1") == 0)
            {
                resetPass = true;
            }
            Sql.Close();
        }

        #region "Cache"
        public string LoadFileFromCache(string filename)
        {
            if (Cache.ContainsKey(filename) && environment != enumEnvironment.development) {
                return (string)Cache[filename];
            }
            if (File.Exists(MapPath(filename)))
            {
                var file = File.ReadAllText(MapPath(filename));
                if(environment != enumEnvironment.development)
                {
                    Cache.Add(filename, file);
                }
                return file;
            }
            return "";
        }

        public void SaveToCache(string key, string value)
        {
            if (Cache.ContainsKey(key))
            {
                Cache[key] = value;
            }else
            {
                Cache.Add(key, value);
            }
        }
        #endregion
    }


}
