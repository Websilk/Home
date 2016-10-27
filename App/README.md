# Websilk
A powerful web development platform built with ASP.net Core

### The App Folder
All of the core C# namespaces for Websilk can be found here within the App folder. Learn how Websilk handles page requests & Web API calls, what components & applications are, and how the dashboard is rendered.

#### Initial Page Request
Websilk runs on the Kestrel web server, which starts an asyncronous task within `/Startup.cs`, listening for incoming page requests. When a user first loads a web page from their web browser, the async task creates a new instance of the `Websilk.Pipeline.PageRequest` class, which in turn initializes a new instance of `Websilk.Page` that loads the requested page from the database and renders the contents of the page as HTML. The web browser finally (20 ms later) loads the web page along with `/js/platform.js` and a few CSS files.

#### Web API calls for Page Requests
When a user clicks on an anchor link on a web page, the default behavior redirects them to the next web page and the web browser reloads Javascript, CSS, & image resources. Websilk overrides the anchor link functionality and executes a Web API call via AJAX instead, masks the URL in the user's address bar using the Javascript History API, and replaces part of the web page with new content. The AJAX request sends a POST to the url */App/Url*, which accesses a new instance of the `Websilk.Pipeline.WebService` C# class, and the page request tries to match the POST parameter labeled *url* to a page path in the database.

For example, clicking an anchor link for */About/Team* will attempt to load a web page called *Team* located within the page hierarchy for the *About* web page.

#### Web API calls for everything else
Making an AJAX call via the Javascript function `S.ajax.post` will access a new instance of the `Websilk.Pipeline.WebService` C# class and execute a `Websilk.Service` class method based on the AJAX url. For example, calling `S.ajax.post('/Dashboard/Pages/PageSettings', {pageId:105})` will execute the C# method `PageSettings(int pageId)` within the class `Websilk.Service.Dashboard.Pages` and return a raw HTML form back to Javascript, the form being populated with all the settings for Page ID *105*. 

#### Custom Page requests
A rare type of page request will load a web page similar to how a Web API call is handled, but works like the initial page request. Once `Websilk.Page` accesses the page from the database, it loads the custom page by executing a `Websilk.Service` class. In the database, the *pagetype* column field value must be **2** and the *service* column field value must point to a valid `Websilk.Service` classes, such as `Dashboard.Pages.PageList`, which will execute the method `PageList()` within the class `Websilk.Service.Dashboard.Pages`. Finally, the *args* column field value should contain the values of any arguments you want to pass to the service method, such as `1, 20, false`.