# Page Layout
Each page uses a structured layout that separates content into [areas](editor/areas), such as the header, body, & footer areas. When editing a web page, you can drag & drop [components](editor/components) into [blocks](editor/blocks) that are stacked within the various page layout areas.

## Blocks
All content within a web page is loaded within blocks. Each [area](editor/areas) within the page layout will consist of at least one [block](editor/blocks). Some blocks are page-specific, and other blocks can be loaded across several pages. For example, the website logo & menu would exist within a custom block that is loaded into the head area of every web page.

## For Developers
The default page layout for your website can be found at `/Content/themes/default/layouts/default.html`. The file contains 3 `areas` consisting of a header, body, & footer.

    {{head}}
    {{body}}
    {{foot}}

In HTML, those three elements are useless text nodes, but when loaded into Websilk, they are replaced with rendered HTML content ([blocks](editor/blocks) & [components](editor/components)) that the user added to their web pages via the [Page Editor](editor).

A more complex example would consist of a three column body with a row above & below.

    <div class="row">
        {{body name="row 1"}}
    </div>
    <div class="row">
        <div class="col four">
			{{body name="column 1"}}
        </div>
        <div class="col four">
			{{body name="column 2"}}
        </div>
        <div class="col four">
			{{body name="column 3"}}
        </div>
    </div>
    <div class="row">
        {{body name="row 2"}}
    </div>

Any unused areas will be removed from the rendered HTML, which could potentially disrupt the flow of the page. If any areas were contained within a styled `<div>` tag, the styling could appear on the page without any content to style. If the tag had no styling (such as `padding` or `border`), the empty tag would not render any pixels on the page