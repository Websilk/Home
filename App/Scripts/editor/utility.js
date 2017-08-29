
//window utilities /////////////////////////////////////////////////////////////////
S.window.scrollbar = 0;
S.window.scrollbarWidth = function () {
    if (S.window.scrollbar > 0) { return S.window.scrollbar; }
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    S.window.scrollbar = widthNoScroll - widthWithScroll;
    return S.window.scrollbar;
};

S.window.verticalScrollbarWidth = function () {
    var win = S.window.pos();
    var body = $('body');
    if (win.h + win.scrolly < body.height()) {
        return S.window.scrollbarWidth();
    }
    return 0;
};


//text selection ///////////////////////////////////////////
S.util.selection = {
    clear: function () {
        if (document.selection) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }
};