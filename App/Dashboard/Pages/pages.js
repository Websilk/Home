S.dashboard.pages = {
    container: null, current_page:0,

    details: function (e) {
        //show page details after clicking on a page in the page list
        var isfolder = e.getAttribute('data-folder') == "true" ? true : false;
        var pageid = e.getAttribute('data-pageid');
        var title = e.getAttribute('data-title');
        var link = e.getAttribute('data-link');
        var createdate = e.getAttribute('data-created');
        var summary = e.getAttribute('data-summary');
        var subtitle = 'created on ' + createdate;
        var details = document.getElementById('page_details').innerHTML;
        details = details.replace(/\#title\#/g, title);
        details = details.replace(/\#sub-title\#/g, subtitle);
        details = details.replace(/\#link\#/g, link);
        details = details.replace(/\#pageid\#/g, pageid);
        details = details.replace(/\#summary\#/g, summary);
        $('.pages-info > .slider').append(details);
        S.dashboard.pages.current_page++;
        $('.pages-info > .slider').get(0).style.left = (S.dashboard.pages.current_page * 100 * -1) + "%";

    },

    resize: function () {
        var el;
        if (S.dashboard.pages.container == null) {
            el = $('.pages-list ul.columns-list').get(0);
            S.dashboard.pages.container = el;
        } else { el = S.dashboard.pages.container; }
        var y = S.elem.top(el);
        el.style.maxHeight = (window.innerHeight - y - 40) + 'px';
    }
}

S.events.doc.resize.callback.add('dash-pages', null,
    S.dashboard.pages.resize,
    S.dashboard.pages.resize,
    S.dashboard.pages.resize
);
S.dashboard.pages.resize();