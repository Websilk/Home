using System.Text;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;

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

    public class WebResources
    {
        //used to collect javascript code & files, as well as CSS styles
        private Core S;
        private Dictionary<string, string> _resources;
        public WebResources(Core WebsilkCore)
        {
            S = WebsilkCore;
        }

        public void Add(string name, string resource)
        {
            if(_resources == null) { _resources = new Dictionary<string, string>(); }
            if (!_resources.ContainsKey(name)) { _resources.Add(name, resource); }
        }

        public Dictionary<string, string> Resources
        {
            get { return _resources; }
        }

        public string renderJavascript(bool withTags = true)
        {
            var js = new StringBuilder();
            if(withTags == true)
            {
                foreach (var item in _resources)
                {
                    js.Append("<script type=\"text/javascript\" id=\"js_" + item.Key.Replace(" ", "_") + "\">" + item.Value + "</script>");
                }
            }
            else
            {
                foreach (var item in _resources)
                {
                    js.Append(item.Value + "\n\n");
                }
            }
            
            return js.ToString();
        }

        public string renderJavascriptFiles(bool withTags = true)
        {
            var js = new StringBuilder();
            if(withTags == true)
            {
                foreach (var item in _resources)
                {
                    js.Append("<script type=\"text/javascript\" id=\"js_" + item.Key.Replace(" ", "_") + "\" src=\"" + item.Value + "?v=" + S.Server.Version + "\"></script>\n");
                }
            }
            else
            {
                foreach (var item in _resources)
                {
                    js.Append("S.util.js.load('" + item.Value + "');\n");
                }
            }
            return js.ToString();
        }

        public string renderCssWithTags()
        {
            var css = new StringBuilder();
            foreach(var item in _resources)
            {
                css.Append("<style type=\"text/css\" id=\"css_" + item.Key.Replace(" ", "_") + "\">\n" + item.Value + "\n</style>\n");
            }
            return css.ToString();
        }
    }
}
