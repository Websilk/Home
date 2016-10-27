using System;
using System.IO;
using Newtonsoft.Json;

namespace Websilk.Utility
{
    public class Serializer
    {
        private Core S;

        public Serializer(Core CollectorCore)
        {
            S = CollectorCore;
        }

        #region "Write"
        public string WriteObjectAsString(object obj, Formatting formatting = Formatting.Indented, TypeNameHandling nameHandling = TypeNameHandling.Auto)
        {
            return JsonConvert.SerializeObject(obj, formatting,
                    new JsonSerializerSettings
                    {
                        NullValueHandling = NullValueHandling.Ignore,
                        TypeNameHandling = nameHandling
                    });
        }

        public byte[] WriteObject(object obj, Formatting formatting = Formatting.Indented, TypeNameHandling nameHandling = TypeNameHandling.Auto)
        {
            return S.Util.Str.GetBytes(WriteObjectAsString(obj, formatting, nameHandling));
        }

        public void SaveToFile(object obj, string file, Formatting formatting = Formatting.Indented, TypeNameHandling nameHandling = TypeNameHandling.Auto)
        {
            var path = S.Util.Str.getFolder(file);
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            File.WriteAllText(file, WriteObjectAsString(obj, formatting, nameHandling));
        }
        #endregion

        #region "Read"
        public object ReadObject(string str, Type objType, TypeNameHandling nameHandling = TypeNameHandling.Auto)
        {
            return JsonConvert.DeserializeObject(str, objType, new JsonSerializerSettings() { TypeNameHandling = nameHandling });
        }

        public object OpenFromFile(Type objType, string file, TypeNameHandling nameHandling = TypeNameHandling.Auto)
        {
            return ReadObject(File.ReadAllText(file), objType);
        }
        
        #endregion







    }
}
