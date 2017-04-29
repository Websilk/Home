using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Chroniton;

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

        private struct saveFile
        {
            public string file;
            public string data;
            public DateTime created;
        }

        public string Version = "";
        // #.#.#.#.#.# =  years since github repo was created (10/22/2016) [#]
        //                current year, month, day of release [#.#.#]
        //                revision of the day (optional) [#]

        public Utility.Util Util = new Utility.Util();
        public enumEnvironment environment = enumEnvironment.development;
        public DateTime serverStart = DateTime.Now;
        public int requestCount = 0;
        public float requestTime = 0;
        public string sqlActive = "";
        public string sqlConnection = "";
        public Random Random = new Random();
        public bool resetPass = false;
        public int bcrypt_workfactor = 10;
        public int saveFileInterval = 20;
        private string _path = "";


        //Dictionary used for caching non-serialized objects, files from disk, or raw text
        //be careful not to leak memory into the cache while causing an implosion!
        public Dictionary<string, object> Cache = new Dictionary<string, object>();

        //Dictionary used for HTML scaffolding of various files on the server. 
        //Value for key/value pair is an array of HTML (scaffold["key"][x].htm), 
        //         separated by scaffold variable name (scaffold["key"][x].name),
        //         where data is injected in between each array item.
        public Dictionary<string, structScaffold> Scaffold = new Dictionary<string, structScaffold>();

        //Scheduler that runs once every 1 minute
        public Scheduler scheduleEveryMinute = new Scheduler();

        //scheduler objects to check every 1 minute
        private List<saveFile> scheduleSaveFiles = new List<saveFile>();

        public Server()
        {
            //start 1 minute interval schedule
            scheduleEveryMinute.Start(60, CheckScheduleEveryMinute);
        }

        #region "System.UI.Web.Page.Server methods"
        public string path(string strPath = "")
        {
            if(_path == "") { _path = Path.GetFullPath(".") + "\\"; }
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

        #region "Startup"
        public void CheckAdminPassword()
        {
            var Sql = new Sql(this, Util);
            if ((int)Sql.ExecuteScalar("EXEC HasPassword @userId=1") == 0)
            {
                resetPass = true;
            }
            Sql.Close();
        }
        #endregion

        #region "Cache"
        /// <summary>
        /// Loads a file from cache. If the file hasn't been cached yet, then load file from a drive.
        /// </summary>
        /// <param name="filename"></param>
        /// <param name="noDevEnvCache">If true, it will not load a file from cache if the app is running in a development environment. Instead, it will always load the file from a drive.</param>
        /// <returns></returns>
        public string LoadFileFromCache(string filename, bool noDevEnvCache = false, bool noCache = false)
        {
            if((environment != enumEnvironment.development || noDevEnvCache == false) && noCache == false)
            {
                if (Cache.ContainsKey(filename))
                {
                    return (string)Cache[filename];
                }
            }
            if (File.Exists(MapPath(filename)))
            {
                var file = File.ReadAllText(MapPath(filename));
                if(environment != enumEnvironment.development && noCache == false)
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

        #region "Scheduler"
        private void CheckScheduleEveryMinute()
        {
            //check queue for files to save
            if(scheduleSaveFiles.Count > 0)
            {
                foreach (var f in scheduleSaveFiles)
                {
                    if((f.created - DateTime.Now).TotalMinutes >= saveFileInterval)
                    {
                        if (!Directory.Exists(Path.GetFullPath(f.file)))
                        {
                            Directory.CreateDirectory(Path.GetFullPath(f.file));
                        }
                        File.WriteAllText(f.file, f.data);
                        scheduleSaveFiles.Remove(f);            
                    }
                }
            }
        }

        public void ScheduleSaveFile(string filePath, string data)
        {
            RemoveScheduledSaveFile(filePath);
            scheduleSaveFiles.Add(new saveFile()
            {
                file = filePath,
                data = data,
                created = DateTime.Now
            });
        }

        public void RemoveScheduledSaveFile(string filePath)
        {
            var i = scheduleSaveFiles.FindIndex(a => a.file == filePath);
            if (i >= 0)
            {
                scheduleSaveFiles.RemoveAt(i);
            }
        }
        #endregion
    }


}
