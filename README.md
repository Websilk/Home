# Websilk
#### An advanced web development platform
Built upon the new ASP.NET Core framework, Websilk is a high-end, enterprise-level web development platform with drag & drop design capabilities for web publishers along with a set of powerful C# class libraries for back-end developers.

### Installation
1. Fork or clone from Github, then open `Websilk.sln` in Visual Studio
2. In Visual Studio's Package Manager Console, do the following:
    * install submodules: `git submodule update --init --recursive`
    * install node.js dependencies: `npm install`
    * run initial gulp task: `gulp default`
2. Install the database by publishing the Sql project to Sql Server 2016. The default database name is `WebsilkDev`
3. Press the play button in Visual Studio!


### Features
* **Manage websites from a centralized dashboard**
  * Create a hierarchy of web pages
  * Upload & manage photos & files to use within your website
  * Manage user accounts *(coming soon!)*
* **Edit your web pages from a browser-based editor**
  * Drag & drop components into blocks within web pages to create content, including text, photos, videos, menus, buttons, forms, maps, and much more!
  * Reuse blocks of content across multiple web pages
  * Resize the viewport to see what your web page will look like on a mobile or tablet device, laptop, desktop PC, or in UHD (4K)


### How does Websilk work (under the hood)?
Websilk uses a custom-built C# MVC framework that loads HTML files with scaffolding (mustache) variables & sections. The goal behind this approach was to make Websilk fast & nimble, allowing HTML to be cached and easily rendered within a super light-weight MVC framework (instead of using Microsoft's MVC 5 + Razor).

### How does the MVC framework handle requests?

#### Initial Page Request
Websilk runs on the Kestrel web server, which starts an asyncronous task within `Startup.cs`, listening for incoming page requests. When a user first loads a web page from their web browser, the async task creates a new instance of the `Websilk.Pipeline.PageRequest` class, which in turn initializes a new instance of `Websilk.Page`. This class is used to load & render the contents of a page, whether the page is *dynamic* or *namespace-driven*.

#### Web API calls for Page Requests
We all know that when a user clicks an anchor link on a typical web page, their browser redirects them to the next web page and then loads Javascript, CSS, & image resources. Websilk overrides the anchor link functionality and instead, executes a Web API call via AJAX, masks the URL in the user's address bar using the Javascript History API, and replaces part of the web page with new content. The AJAX request sends a POST to the url */api/App/Url*, which accesses a new instance of the class `Websilk.Pipeline.WebService`, which in turn initializes a new instance of `Websilk.Page`. This class is used to load & render the contents of a *dynamic page*.

For example, clicking an anchor link for */About/Team* will attempt to load a web page called *Team* located within the page hierarchy for the *About* web page.

#### Web API calls for everything else
Making an AJAX call via the Javascript function `S.ajax.post` will access a new instance of the `Websilk.Pipeline.WebService` C# class and execute a `Websilk.Service` class method based on the AJAX url. For example, calling `S.ajax.post('/Dashboard/Pages/PageSettings', {id:105});` will execute the C# method `PageSettings(int id)` within the class `Websilk.Service.Dashboard.Pages` and return a raw HTML form back to Javascript, the form being populated with all the settings for Page ID *105*. 

NOTE: The argument `pageId` is a reserved argument for `S.ajax.post`, so the example above uses `id` instead.

#### Dynamic Page requests
 A dynamic page is one that is created visually through Websilk's drag & drop interface. When loading a dynamic page, a new instance of `Websilk.Page` loads a file called `page.json` which contains a list of blocks & components that belong to the page. Then, each block in the list loads components onto the page from `block.json` files. Finally, Websilk renders the contents of the page as HTML and then the web browser loads the page along with `/js/platform.js` and a few CSS files.

#### Namespace-Driven Page requests
This custom page request loads a web page from the database, but instead of loading blocks & components onto the page from a `page.json` file, Websilk renders the output of a method within a `Websilk.StaticPage` class located in the `Websilk.Pages` namespace. For example, the page `http://localhost:7770/dashboard` exists in the database with the columns `path = 'Dashboard'`, `pageType = 1`, and `service = 'Dashboard'`. Websilk finds the database record by matching the url with the path column. Then, the `Websilk.Page` class will use the service column to create an instance of the `Websilk.Pages.Dashboard` class and render its output as HTML.