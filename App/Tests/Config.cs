namespace Websilk.Tests
{
    public class Config
    {
        //generate config.json
        public string NewConfig()
        {
            var serialize = new Utility.Serializer(new Utility.Util());
            return serialize.WriteObjectAsString(new
            {
                environment = "development",
                data = new
                {
                    active = "SqlServerTrusted",
                    SqlServerTrusted = "server=.\\SQL2016; database=WebsilkDev; Trusted_Connection=true"
                },
                encryption = new
                {
                    bcrypt_work_factor = "10"
                },
                scheduler = new
                {
                    saveFileInterval = "20"
                }
            }, Newtonsoft.Json.Formatting.Indented);
        }
    }
}
