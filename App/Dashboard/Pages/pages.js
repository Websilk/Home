S.dashboard.pages = {
    current_page: 0,

    cleanSlideshow: function(e){
        var slide = $(e).parents('.page-details').get(0);
        var found = false;
        $('.pages-info > .slideshow > .slides > div').each(function (e) {
            if (found == true) { $(e).remove(); return; }
            if (e == slide) { found = true; }
        });
    },

    goback: function(count){
        S.dashboard.pages.current_page += count * -1;
        $('.pages-info > .slideshow > .slides').get(0).style.left = (S.dashboard.pages.current_page * 100 * -1) + "%";
    },

    gonext: function(){
        S.dashboard.pages.current_page++;
        $('.pages-info > .slideshow > .slides').css({ left: (S.dashboard.pages.current_page * 100 * -1) + '%', width: (100 * (S.dashboard.pages.current_page + 1)) + '%' });
    },

    details: function (e) {
        //show page details after clicking on a page in the page list
        var isfolder = e.getAttribute('data-folder') == "true" ? true : false;
        var pageid = e.getAttribute('data-pageid');
        var title = e.getAttribute('data-title');
        var link = e.getAttribute('data-link');
        var createdate = e.getAttribute('data-created');
        var summary = e.getAttribute('data-summary');
        var subtitle = 'created on ' + createdate;
        var url = S.website.protocol + S.website.host + link.substr(1);
        var urlname = S.website.host + link.substr(1);
        var details = document.getElementById('page_details').innerHTML;
        details = details.replace(/\#title\#/g, title);
        details = details.replace(/\#url\#/g, url);
        details = details.replace(/\#url\-name\#/g, urlname);
        details = details.replace(/\#sub-title\#/g, subtitle);
        details = details.replace(/\#link\#/g, link);
        details = details.replace(/\#pageid\#/g, pageid);
        details = details.replace(/\#summary\#/g, summary);
        details = details.replace(/\#link\-create\#/g, 'S.dashboard.pages.create(this, ' + pageid + ')');

        //remove all siblings to the right 
        S.dashboard.pages.cleanSlideshow(e);

        //add new slide to slideshow
        $('.pages-info > .slideshow > .slides').append(details);

        //load sub pages list
        if (isfolder == true) {
            var list = $('.pages-info > .slideshow > .slides .pages-list').last();
            S.ajax.post("/Dashboard/Pages/View", { parentId: pageid, start: 1, length: 1000, orderby: 4, viewType: 0, search: '' },
                function (d) {
                    console.log(d);
                }
            );
        }
        S.dashboard.pages.gonext();
    },

    create: function(e, pageid){
        var details = document.getElementById('page_create').innerHTML;
        var container = $(e).parents('.page-details').find('.page-create');
        if (container.find('.page-title').length == 0) {
            container.append(details);
        }
        container.addClass('seven laptop-one-total');

    },

    subpage: {
        //sub page functions /////////////////////////////////////
        goto: function (slides, index) {
            slides.style.left = (index * 100 * -1) + "%";
        },

        create: {
            cancel: function (e) {
                var container = $(e).parents('.page-create');
                console.log(container);
                container.removeClass('seven laptop-one-total');
                setTimeout(function () { container.html(''); }, 500);
            },

            submit: function (e) {

            }
        }
    },

    resize: function () {
        $('.pages-info .pages-list ul.columns-list').each(function (e) {
            var y = S.elem.top(e);
            e.style.maxHeight = (window.innerHeight - y - 40) + 'px';
        });
    }
}

S.events.doc.resize.callback.add('dash-pages', null,
    S.dashboard.pages.resize,
    S.dashboard.pages.resize,
    S.dashboard.pages.resize
);
S.dashboard.pages.resize();