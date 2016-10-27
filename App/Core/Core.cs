using System.Collections.Generic;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Http.Features;

namespace Websilk
{
    public class Core
    {
        public Server Server;
        public Utility.Util Util;
        public Sql Sql;
        public User User;
        public HttpContext Context;
        public HttpRequest Request;
        public HttpResponse Response;
        public ISession Session;

        public bool isFirstLoad = false;

        public Dictionary<string, string> javascript = new Dictionary<string, string>();
        public Dictionary<string, string> css = new Dictionary<string, string>();

        public Core(Server server, HttpContext context)
        {
            Server = server;
            Context = context;
            Request = context.Request;
            Response = context.Response;
            Session = context.Session;
            Sql = new Sql(this);
            Util = new Utility.Util(this);
            User = new User();

            //load user session
            if (Session.Get("user") != null)
            {
                User = (User)Util.Serializer.ReadObject(Util.Str.GetString(Session.Get("user")), User.GetType());
            }
            User.Load(this);
        }

        public void Unload()
        {
            Sql.Close();
        }

        public bool isSessionLost()
        {
            if(isFirstLoad == false && Session.Get("user") == null) {
                return true;
            }
            return false;
        }
    }
}
