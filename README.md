# Websilk
#### An advanced web development platform
Built upon the new ASP.NET Core framework, Websilk is a high-end, enterprise level web development platform with drag & drop design capabilities for web publishers along with a set of powerful class libraries for back-end developers.

### Installation
1. In Visual Studio's Package Manager Console, do the following:
* install node.js dependencies `npm install gulp --save-dev`
* install submodules `git submodule update --init --recursive`
* run initial gulp task `gulp default`
2. Then, install the database by opening the `Sql/Sql.sln` Visual Studio solution file and publishing the project to Sql Server 2014 (or higher)
3. Run `dotnet run` and navigate to http://localhost:7770 , which will generate a `config.json` file. You may need to alter the database connection settings within the `config.json` file in order to access the database correctly.
4. Open the following web page: http://localhost:7770/api/Init/Website
, which will generate the initial web pages for your default web site, including the home page, login, & dashboard page.
5. Navigate to http://localhost:7770/login to set your administrator password, then log into your website dashboard.