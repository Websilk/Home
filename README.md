# Websilk
#### An advanced web development platform
Built upon the new ASP.NET Core framework, Websilk is a high-end, enterprise level web development platform with drag & drop design capabilities for web publishers along with a set of powerful class libraries for back-end developers.

### Installation
In Visual Studio's Package Manager Console, do the following:
* install dependencies `npm install gulp --save-dev`
* install submodules `git submodule update --init --recursive`
* run initial gulp task `gulp default`

Then, install the database by opening the `Sql/Sql.sln` Visual Studio solution file and publishing the project to Sql Server 2014 (or higher)

Finally, run `dotnet run` and open the following web page: http://localhost:7770/api/PageTest/GeneratePage?name=init ,which will generate the initial web pages for your default web site.

To access your website dashboard, navigate to http://localhost:7770/login