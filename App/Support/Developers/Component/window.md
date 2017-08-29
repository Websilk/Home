# Window
#### Part of the [Page Editor](../editor)

The window has a multitude of functionality that can transform a simple window into a drop down menu, dialog box, & side bar.

The window is part of the Page Editor's fixed toolbar, so windows will be fixed to the browser window when the user scrolls down the web page.

A window can contain a title bar, tab menu, and content areas. The tab menu determines which content area to display.

## Developing a custom Window


#### Creating a Tab Menu

When developing a custom window, make sure your content areas are separated in `<div>` tags with the classes `tab-content` and `index-#` replacing the `#` with an incrimental number starting at `1`. This is only required if you want to use the Tab Menu.

For example:

```
<div class="tab-content index-1">...</div>
<div class="tab-content index-2">...</div>
<div class="tab-content index-3">...</div>
```

In the backend, within your `Properties.cs` file, add menu items. For example:

```
public override void Load() {
    //create tab menu
    AddMenuItem("Items");
    AddMenuItem("Design");
    AddMenuItem("Settings");
}
```

Each menu item you add will increment the index, starting at 1. 

If at some point, you decide to rearrange the menu items, you must also rearrange the index # for the HTML content (`<div class="tab-content index-#">`).