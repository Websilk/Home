S.dashboard.pages = {
    current_page: 0, current_path: [], page_info: null, slides: null,

    init: function(){
        this.slides = new S.slides('.pages-info > .slideshow');
        this.current_page = 0;
        this.current_path = [];
        this.page_info = null;
        S.events.doc.resize.callback.remove('dash-pages');
        S.events.doc.resize.callback.add('dash-pages', null,
            S.dashboard.pages.resize,
            S.dashboard.pages.resize,
            S.dashboard.pages.resize
        );
        S.dashboard.pages.resize();
    },

    cleanSlideshow: function(e){
        var slide = $(e).parents('.page-details').get(0);
        var found = false;
        $('.pages-info > .slideshow > .slides > div').each(function (e) {
            if (found == true) { $(e).remove(); return; }
            if (e == slide) { found = true; }
        });
    },

    goback: function (e, count) {
        var container = $(e).parents('.page-details').find('.page-create');
        if (container.hasClass('view')) {
            //first, hide "create page" form, then go back
            container.removeClass('view');
            setTimeout(function () {
                container.html('');
                S.dashboard.pages.slides.previous(count);
            }, 250);
        } else {
            S.dashboard.pages.slides.previous(count);
        }
        for (var x = 1; x <= count; x++) {
            S.dashboard.pages.current_path.pop(count)
        }
        S.dashboard.pages.current_page = S.dashboard.pages.current_path[S.dashboard.pages.current_path.length - 1];
    },

    details: function (e) {
        //show page details after clicking on a page in the page list
        var isfolder = e.getAttribute('data-folder') == "true" ? true : false;
        var pageid = e.getAttribute('data-pageid');
        var link = e.getAttribute('data-link');
        var data = {
            'title': e.getAttribute('data-title'),
            'path': e.getAttribute('data-path'),
            'link': link,
            'date-created': e.getAttribute('data-created'),
            'summary': e.getAttribute('data-summary'),
            'sub-title': 'created on ' + e.getAttribute('data-created'),
            'url': S.website.protocol + S.website.host + link.substr(1),
            'url-name': S.website.host + link.substr(1),
            'link-create': 'S.dashboard.pages.create(this, ' + pageid + ')'
        }
        S.dashboard.pages.current_page = pageid;
        S.dashboard.pages.current_path.push(pageid);
        S.dashboard.pages.page_info = data;
        var slides = S.dashboard.pages.slides;

        //remove all siblings to the right
        slides.cleanAfter();

        //add new slide to slideshow
        slides.add(document.getElementById('page_details').innerHTML, data);

        //load sub pages list
        if (isfolder == true) {
            var list = $('.pages-info > .slideshow > .slides .pages-list').last();
            S.ajax.post("Dashboard/Pages/View", { websiteId: S.dashboard.website.id, parentId: pageid, start: 1, length: 1000, orderby: 4, viewType: 0, search: '' },
                function (data) {
                    if (data.d != 'err') {
                        list.html(data.d);
                    }
                }
            );
        }
        slides.next();
    },

    create: function (e, pageid) {
        //display the "create page" form
        var info = S.dashboard.pages.page_info;
        var htm = document.getElementById('page_create').innerHTML;
        var data = {
            'parent-title': info.path.replace(/\//g, ' > '),
            'page-url':info['url-name'] + '/'
        }
        var scaffold = new S.scaffold(htm, data);
        var container = $(e).parents('.page-details').find('.page-create');
        if (container.find('.page-title').length == 0) {
            container.append(scaffold.render());
        }
        //add event listeners for page create form
        container.find('form').on('submit', function (e) {
            S.dashboard.pages.subpage.create.submit(container.find('form').get(0));
            e.preventDefault();
            return false;
        });
        container.find('.btn-page-settings a').on('click', function (e) { S.dashboard.pages.subpage.create.submit(this); });
        container.find('.btn-page-cancel a').on('click', S.dashboard.pages.subpage.create.cancel);
        $('#txtcreatedesc').on('keyup', S.dashboard.pages.subpage.create.countChars);
        $('#txtcreatetitle').on('keyup', S.dashboard.pages.subpage.create.updateTitle);
        container.addClass('view');
    },

    subpage: {
        //sub page functions /////////////////////////////////////
        goto: function (slides, index) {
            slides.style.left = (index * 100 * -1) + "%";
        },

        create: {
            updateTitle: function (e) {
                //updates new page url when typing new page title
                var container = $(e.target).parents('.page-create');
                var title = container.find('#txtcreatetitle').val();
                if (!S.validate.alphaNumeric(title, [' '])) {
                    //show error color in url
                    container.find('.page-url').addClass('font-error');
                } else {
                    container.find('.page-url').removeClass('font-error');
                }
                container.find('.new-url').html(title.replace(/\s/g, '-'));
            },

            countChars: function (e) {
                var container = $(e.target).parents('.page-create');
                var field = container.find('#txtcreatedesc');
                var desc = field.val();
                if (desc.length > 160) { desc = desc.substr(0, 160); field.val(desc); }
                container.find('.desc-chars').html((160 - desc.length) + ' characters left');
            },

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
                S.ajax.post("Dashboard/Pages/Create", { websiteId:S.dashboard.website.id, parentId: S.dashboard.pages.current_page, title:title, description:desc, secure:secure },
                function (data) {
                    if (data.d == 'err') {
                        S.message.show(msg, 'error', 'An error occurred while trying to create your new web page');
                        return false;
                    } else {
                        var slide = container.parents('.page-details').find('.pages-list');
                        if (slide.length > 0) {
                            //load sub-page list
                            slide.html(data.d);

                            //show success message
                            S.message.show(msg, '', 'Your page, "' + title + '" has been created successfully');

                            //reset form
                            container.find('#txtcreatetitle').val('');
                            container.find('#txtcreatedesc').val('');
                            container.find('.chk-secure').prop('checked', false);
                            container.find('.new-url').html('');

                            //update parent page list (if data-folder attribute doesn't exist)

                        }
                    }
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

