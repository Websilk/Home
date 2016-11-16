S.dashboard.pages = {
    container: null,
    resize: function () {
        var el;
        if (S.dashboard.pages.container == null) {
            el = $('.pages-list ul.columns-list').get(0);
            S.dashboard.pages.container = el;
        } else { el = S.dashboard.pages.container; }
        var y = S.elem.top(el);
        el.style.maxHeight = (window.innerHeight - y - 10) + 'px';
    }
}

S.events.doc.resize.callback.add('dash-pages', null,
    S.dashboard.pages.resize,
    S.dashboard.pages.resize,
    S.dashboard.pages.resize
);
S.dashboard.pages.resize();