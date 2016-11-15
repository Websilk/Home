# Websilk
A powerful web development platform built with ASP.net Core

### The App/Core Folder
This folder is reserved for all the core features Websilk requires to maintain a user's session, cache objects on the server, access an SQL database, and render the various components & applications on a web page.

#### App.cs
A `Websilk.Service` class used to execute Web API calls from a web page, such as `api/App/Url`.

#### Component.cs
This is the base class used for all content on a web page, such as text, photos, panels, lists, videos, and menus.

#### Core.cs
Nearly every class within Websilk has access to an instance of `Websilk.Core` as a global variable named `S`, where the following classes are accessable: `S.Server`, `S.Session`, `S.Sql`, `S.User`, `S.Util`, `S.Context`, `S.Request`, and `S.Response`

#### Elements.cs
Some components utilize elements such as buttons, text boxes, lists, and panels, which are basically blocks of HTML. 

Instead of hand-writing an HTML button like `<div class="button">Submit</div>` or `<input type="button" text="Submit">` every where the component uses a button for example, developers should let Websilk manage these complex elements within a **theme**, such as */App/Content/themes/default/elements/button.html*. Then, the component is able to load a button element via `Websilk.Elements.Load(ElementType.Button, 'outline')` for example, which will load an HTML button styled with a CSS *outline*. The `button.html` file may contain many styles of buttons, and in this example, one of them is named *outline*. 

Finally, when the user alters the properties for a component (when editing their web page in the web browser), they'll be able to select a button style from a list of styles defined within the *button.html* theme file. This allows the user to truly customize the components on their page without having to write custom CSS to change the style of the various elements on the page. 

#### Page.cs
Every page request uses this class to load information about a web page from the database, load the contents of the page, and render the layers of components & panels as HTML.

#### Panel.cs 
Every component on a web page is loaded into a panel, which is basically a `<div>` element. Web pages load a *layout* from the website's theme, such as */App/Content/themes/default/theme.html*, and the user is able to drag & drop components into panels defined by the theme layout.

#### Scaffold.cs
A string parsing class that essentially replaces mustache variables, such as `{{content}}` with data. It can also show or hide blocks of content, such as `{{has-button}}<div>My Button</div>{{/has-button}}`. It is mainly used to load & parse HTML template files. 

#### Server.cs
This class is initialized when the Kestrel web server first loads and `Startup.cs` begins listening to the asynchronous `Run()` task. Every page request & Web API call will have access to the exact same instance of the Server class, where many different objects & files will be cached to speed up page load time. Also, the Server class can tell you where on your local hard drive your web application is running from by calling `S.Server.MapPath('/my/path')`

#### Service.cs
A base class used to handle various types of Web API calls. 

The `PageRequest` class sends a JSON array of components to render onto a web page that is already loaded in the web browser. 

The `Inject` class will load raw HTML into a specified DOM element onto a web page that is already loaded in the web browser.

The `WebRequest` class will simply return raw text in a specified content type, such as 'text/html'.

NOTE: The Form property is a Dictionary of key/value pairs that were sent with the request POST. Also, the Files property is a collection of files (if any) that were uploaded with the `multipart/form-data` request POST.

#### Sql.cs
One database class to rule them all. This class is used to connect to an Sql database, execute Sql queries and provide a simple an flexible way to access the rows of data returned from Sql queries.

#### User.cs
All the functionality for managing the current user, such as logging in & out of their account and accessing their security clearance for various websites & dashboard features.