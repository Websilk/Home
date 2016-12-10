S.dashboard.pages = {
    current_page: 0, slides: new S.slides('.pages-info > .slideshow'),

    cleanSlideshow: function(e){
        var slide = $(e).parents('.page-details').get(0);
        var found = false;
        $('.pages-info > .slideshow > .slides > div').each(function (e) {
            if (found == true) { $(e).remove(); return; }
            if (e == slide) { found = true; }
        });
    },

    goback: function(count){
        S.dashboard.pages.slides.previous(count);
    },

    details: function (e) {
        //show page details after clicking on a page in the page list
        var isfolder = e.getAttribute('data-folder') == "true" ? true : false;
        var pageid = e.getAttribute('data-pageid');
        var link = e.getAttribute('data-link');
        var data = {
            'title': e.getAttribute('data-title'),
            'link': link,
            'date-created': e.getAttribute('data-created'),
            'summary': e.getAttribute('data-summary'),
            'sub-title': 'created on ' + e.getAttribute('data-created'),
            'url': S.website.protocol + S.website.host + link.substr(1),
            'url-name': S.website.host + link.substr(1),
            'link-create': 'S.dashboard.pages.create(this, ' + pageid + ')'
        }
        var slides = S.dashboard.pages.slides;

        //remove all siblings to the right 
        slides.cleanAfter(e);

        //add new slide to slideshow
        slides.add(document.getElementById('page_details').innerHTML, data);

        //load sub pages list
        if (isfolder == true) {
            var list = $('.pages-info > .slideshow > .slides .pages-list').last();
            S.ajax.post("/Dashboard/Pages/View", { parentId: pageid, start: 1, length: 1000, orderby: 4, viewType: 0, search: '' },
                function (d) {
                    console.log(d);
                }
            );
        }
        slides.next();
    },

    create: function (e, pageid) {
        //display the "create page" form
        var details = document.getElementById('page_create').innerHTML;
        var container = $(e).parents('.page-details').find('.page-create');
        if (container.find('.page-title').length == 0) {
            container.append(details);
        }
        //add event listeners for page create form
        container.find('form').on('submit', function (e) {
            S.dashboard.pages.subpage.create.submit(container.find('form').get(0));
            e.preventDefault();
            return false;
        });
        container.find('.btn-page-settings a').on('click', function (e) { S.dashboard.pages.subpage.create.submit(this); });
        container.find('.btn-page-cancel a').on('click', S.dashboard.pages.subpage.create.cancel);
        $('#txtcreatedesc').on('keyup', S.dashboard.pages.subpage.countChars);
        container.addClass('view');
    },

    subpage: {
        //sub page functions /////////////////////////////////////
        goto: function (slides, index) {
            slides.style.left = (index * 100 * -1) + "%";
        },

        countChars: function (e) {
            console.log(arguments);
            var container = $(e.target).parents('.page-create');
            var field = container.find('#txtcreatedesc');
            var desc = field.val();
            if (desc.length > 160) { desc = desc.substr(0, 160); field.val(desc);}
            container.find('.desc-chars').html((160 - desc.length) + ' characters left');
        },

        create: {
            cancel: function (e) {
                var container = $(e).parents('.page-create');
                container.removeClass('view');
                setTimeout(function () { container.html(''); }, 500);
            },

            submit: function (e) {
                var container = $(e).parents('.page-create');
                var title = container.find('#txtcreatetitle').val();
                var desc = container.find('#txtcreatedesc').val();
                var secure = container.find('.chk-secure').prop('checked');
                console.log(secure);
                var msg = container.find('.message');
                msg.hide();

                //validate form
                if (title == '' || title == null) {
                    S.message.show(msg, 'error', 'Page title cannot be empty');
                    return false;
                }
                if (!S.validate.alphaNumeric(title, [' '])) {
                    S.message.show(msg, 'error', 'Page title only accepts letters, numbers, and spaces');
                    return false;
                }
                if (desc == '' || desc == null) {
                    S.message.show(msg, 'error', 'Page description cannot be empty');
                    return false;
                }
                if (!S.validate.text(desc, ['{', '}', '[', ']', '/', '\\'])) {
                    S.message.show(msg, 'error', 'Page description cannot contain special characters');
                    return false;
                }
                if (desc.length > 160) {
                    S.message.show(msg, 'error', 'Page description cannot be more than 160 characters long');
                    return false;
                }

                //submit "create page" form
                S.ajax.post("/Dashboard/Pages/Create", { parentId: S.dashboard.pages.current_page, title:title, description:desc, secure:secure },
                function (d) {
                    console.log(d);
                }
            );
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