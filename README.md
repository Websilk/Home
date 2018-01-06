# Websilk
#### A powerful web development platform built with ASP.net Core
Websilk is a ***headless*** Content Management System (CMS), which consists of a dashboard interface and a secure, RESTful web API.  This allows developers to design websites & mobile applications naturally, using their platform & programming languages of choice, while allowing non-technical writers & editors to manage content for the website via the dashboard interface.

### Installation
1. Fork or clone from Github, then open `Websilk.sln` in Visual Studio
2. In Visual Studio's Package Manager Console, do the following:
    * install submodules: `git submodule update --init --recursive`
    * install node.js dependencies: `npm install`
    * run initial gulp task: `gulp default`
2. Install the database by publishing the `Sql` project in Visual Studio to `Sql Server 2016` or greater. The default database name is `Websilk`
3. Press the play button in Visual Studio!


### Features
* **Manage websites from a centralized dashboard**
  * Create a hierarchy of web pages
  * Build custom forms and then fill them with content to use on individual web pages
  * Reuse custom forms across multiple web pages to create similar types of content with
  * Upload photos & various web-safe files to use on your web pages
  * Manage user accounts *(coming soon!)*
  * Develop & use custom form fields (such as a custom music player for an mp3 upload field)

### How does Websilk work (under the hood)?
Websilk uses a custom-built C# MVC framework called [Datasilk Core](http://github.com/Datasilk/Core) along with the Javascript framework [Datasilk Core JS](http://github.com/Datasilk/Core). A modern CSS framework called [Tapestry](http://github.com/Websilk/Tapestry) is used for the responsive dashboard UI, and [selector.js](http://github.com/Websilk/Selector) is used as an ultra light-weight alternative to jQuery. These technologies allow Websilk to run very efficiently. 

If you're interested in starting a project using these technologies, you can begin by cloning [Datasilk Core Template](http://github.com/Datasilk/CoreTemplate).