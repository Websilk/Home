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
        after = 3,
        beforeNode = 4,
        afterNode = 5
    }

    /// <summary>
    /// Used to load a single component onto the page
    /// </summary>
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

    /// <summary>
    /// Used to load a page and its components, removing any unused components that were previously loaded
    /// </summary>
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

    /// <summary>
    /// Used to load HTML, CSS, and Javascript directly onto the page by either appending to or replacing a DOM element
    /// </summary>
    public class Inject
    {
        public string element = "";
        public string html = "";
        public string js = "";
        public string css = "";
        public string cssId = "";
        public string remove = "";
        public string node = "";
        public string newId = "";
        public enumInjectTypes inject = 0;
    }

    /// <summary>
    /// Used to load a raw HTML web page as a service (typically not via AJAX)
    /// </summary>
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
        protected void GetPage(bool pageInfo = true)
        {
            if(page == null)
            {
                page = new Page(S);
                if (pageInfo) { page.getPageInfo(pageId); }
            }
        }

        protected Component GetComponent(string id)
        {
            var panels = page.GetAllPanels();
            var components = page.GetAllComponents();

        }

        protected string RenderJs()
        {
            return S.javascriptFiles.renderJavascriptFiles(false, S.javascript.renderJavascript(false));
        }

        protected string RenderCss()
        {
            return S.css.renderCss(false);
        }
    }
}
