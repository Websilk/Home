using Microsoft.AspNetCore.Http;

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

        public WebResources javascript;
        public WebResources javascriptFiles;
        public WebResources css;
        public WebResources cssFiles;
        public WebResources html;
        public WebResources htmlEditor;

        public Core(Server server, HttpContext context)
        {
            Server = server;
            Util = server.Util;
            Context = context;
            Request = context.Request;
            Response = context.Response;
            Session = context.Session;
            Sql = new Sql(Server, Util);
            User = new User();

            javascript = new WebResources(this);
            javascriptFiles = new WebResources(this);
            css = new WebResources(this);
            cssFiles = new WebResources(this);
            html = new WebResources(this);
            htmlEditor = new WebResources(this);

            //load user session
            if (Session.Get("user") != null)
            {
                User = (User)Util.Serializer.ReadObject(Util.Str.GetString(Session.Get("user")), User.GetType());
            }
            User.Load(this);
        }

        public void Unload()
        {
            if(User.saveSession == true)
            {
                Session.Set("user", Util.Serializer.WriteObject(User));
            }
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
