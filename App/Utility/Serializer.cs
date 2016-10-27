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

        public object ReadObject(string str, Type objType)
        {
            return JsonConvert.DeserializeObject(str, objType, new JsonSerializerSettings() { TypeNameHandling = TypeNameHandling.Objects });
        }

        public byte[] WriteObject(object obj, Formatting formatting = Formatting.Indented)
        {
            return S.Util.Str.GetBytes(JsonConvert.SerializeObject(obj, formatting, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }));
        }

        public string WriteObjectAsString(object obj, Formatting formatting = Formatting.Indented)
        {
            return JsonConvert.SerializeObject(obj, formatting);
        }

        public void SaveToFile(object obj, string file, Formatting formatting = Formatting.Indented)
        {
            var path = S.Util.Str.getFolder(file);
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            File.WriteAllText(file, WriteObjectAsString(obj, formatting));
        }

        public object OpenFromFile(Type objType, string file)
        {
            return ReadObject(File.ReadAllText(file), objType);
        }
    }
}
