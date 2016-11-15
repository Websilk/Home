using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace Websilk.Services
{
    public enum enumInjectTypes
    {
        replace = 0,
        append = 1,
        before = 2,
        after = 3
    }

    public class PageComponent
    {
        public string panelClassId = "";
        public string id = "";
        public string html = "";
        public string js = "";
        public string css = "";
        [JsonIgnore]
        public Component Component;
    }

    public class PageRequest
    {
        public string url = "";
        public string pageTitle = "";
        public List<PageComponent> components = new List<PageComponent>();
        public List<string> @remove = new List<string>();
        public string js = "";
        public string css = "";
        public string editor = "";
        public bool already = false;
        public int pageId = 0;
    }

    public class Inject
    {
        public string element = "";
        public string html = "";
        public string js = "";
        public string css = "";
        public string cssid = "";
        public string remove = "";
        public enumInjectTypes inject = 0;
    }

    public class WebRequest
    {
        public string html = "";
        public string contentType = "text/html";
    }
}

namespace Websilk
{
    public class Service
    {
        protected Core S;
        public int pageId = 0;
        public Page page;
        public Dictionary<string, string> Form = new Dictionary<string, string>();
        public IFormFileCollection Files;

        public Service(Core WebsilkCore) {
            S = WebsilkCore;
        }

        public struct Response
        {
            public string html;
            public string css;
            public string js;
            public string window;
        }

        protected Response lostResponse()
        {
            //if session is lost, reload the page
            Response response = new Response();
            response.js = "S.lostSession();";
            return response;
        }

        protected Services.Inject lostInject()
        {
            //if session is lost, reload the page
            var response = new Services.Inject();
            response.js = "S.lostSession();";
            return response;
        }

        protected Services.PageRequest lostPageRequest()
        {
            //if session is lost, reload the page
            var response = new Services.PageRequest();
            response.js = "S.lostSession();";
            return response;
        }

        /// <summary>
        /// Load an instance of the currently loaded Page
        /// </summary>
        protected void GetPage()
        {
            if(page == null)
            {
                page = new Page(S);
                page.getPageInfo(pageId);
            }
        }
    }
}
