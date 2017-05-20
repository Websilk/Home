using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Websilk
{

    public class WebResources
    {
        //used to collect javascript code & files, as well as CSS styles
        private Core S;
        private Dictionary<string, string> _resources;
        public WebResources(Core WebsilkCore)
        {
            S = WebsilkCore;
        }

        public void Add(string name, string resource, bool joinDuplicates = true, bool haveDuplicates = false)
        {
            if (_resources == null) { _resources = new Dictionary<string, string>(); }
            if (!_resources.ContainsKey(name)) { _resources.Add(name, resource); }
            else {
                if (joinDuplicates == false)
                {
                    if (haveDuplicates)
                    {
                        var i = 1;
                        while (i < 100)
                        {
                            if (!_resources.ContainsKey(name + i)) { _resources.Add(name + i, resource); break; }
                            i++;
                        }
                    }
                }
                else {
                    _resources[name] += "\n\n" + resource;
                }
            }
        }

        public Dictionary<string, string> Resources
        {
            get { return _resources; }
        }

        public string renderJavascript(bool withTags = true)
        {
            if (_resources == null) { return ""; }
            var js = new StringBuilder();
            if (withTags == true)
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

        /// <summary>
        /// render javascript files along with any asynchronous javascript after all files are finished loading
        /// </summary>
        /// <param name="withTags"></param>
        /// <param name="syncJs">the raw Javascript (with or without tags) to execute after all JS files are loaded</param>
        /// <returns></returns>
        public string renderJavascriptFiles(bool withTags = true, string syncJs = "")
        {
            if (_resources == null) { return syncJs; }
            var js = new StringBuilder();
            if (withTags == true)
            {
                foreach (var item in _resources)
                {
                    js.Append("<script type=\"text/javascript\" id=\"jsf_" + item.Key.Replace(" ", "_") + "\" src=\"" + item.Value + "?v=" + S.Server.Version + "\"></script>\n");
                }
                if (syncJs != "") { js.Append(syncJs); }
            }
            else
            {
                foreach (var item in _resources)
                {
                    js.Append("S.util.js.load('" + item.Value + "', 'jsf_" + item.Key.Replace(" ", "_") + "',function(){");
                }
                js.Append(syncJs);
                for (var x = 0; x < _resources.Count; x++)
                {
                    js.Append("});");
                }
            }
            return js.ToString();
        }

        public string renderCss(bool withTags = true)
        {
            if (_resources == null) { return ""; }
            var css = new StringBuilder();
            if (withTags == true)
            {
                foreach (var item in _resources)
                {
                    css.Append("<style type=\"text/css\" id=\"css_" + item.Key.Replace(" ", "_") + "\">\n" + item.Value + "\n</style>\n");
                }
            }
            else
            {
                foreach (var item in _resources)
                {
                    css.Append(item.Value + "\n");
                }
            }

            return css.ToString();
        }

        public string renderCssFiles(bool withTags = true)
        {
            if (_resources == null) { return ""; }
            var css = new StringBuilder();
            if (withTags == true)
            {
                foreach (var item in _resources)
                {
                    css.Append("<link rel=\"stylesheet\" type=\"text/css\" id=\"css_" + item.Key.Replace(" ", "_") + "\" href=\"" + item.Value + "\">\n");
                }
            }
            else
            {
                foreach (var item in _resources)
                {
                    css.Append("S.util.css.load('" + item.Value + "', 'css_" + item.Key.Replace(" ", "_") + "');\n");
                }
            }

            return css.ToString();
        }

        public string renderHtml()
        {
            if (_resources == null) { return ""; }
            var html = new StringBuilder();
            foreach (var item in _resources)
            {
                html.Append(item.Value + "\n");
            }

            return html.ToString();
        }
    }
}
