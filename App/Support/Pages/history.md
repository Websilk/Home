# Page History

When editing your page & then saving your changes, the new changes applied to the page are saved into history. Within the dashboard, you can view a log of page edits & select one to view.

When viewing a historical page, all content on the page, including [custom blocks](editor/blocks) will be loaded from the specified time in history. All database-driven content, such as a list of new blog posts or user comments will not be historical because the content is dynamically loaded into the [components](editor/components) from an outside source. Any changes to external resources, such as `.css` or `.js` files will not be historical either since they are not maintained by the Websilk platform. 

## Future releases
Hopefully, the following ideas will make it to a future release of Websilk

* When the user loads a historical page, Websilk should load historical external resources for that page. This can be done by monitoring file changes (such as `.css` & `.js` files) within various [Content](developers/content-folder) sub-folders, then copying the files into a historical folder when they change.