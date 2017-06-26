﻿S.dashboard.pages = {
    current_page: 0, current_elem:null, current_path: [], page_info: null, slides: null, shadow_templates: [],

    init: function () {
        this.slides = new S.slides('.tab-body-pages > .slideshow');
        this.current_page = 0;
        this.current_elem = S.dashboard.pages.getCurrentPage(this.slides.current_slide + 1); 
        this.current_path = [];

        //reset selected page info
        this.reset_info();

        //add window resize events
        S.events.doc.resize.callback.remove('dash-pages');
        S.events.doc.resize.callback.add('dash-pages', this.resize, this.resize, this.resize);
        S.events.doc.scroll.callback.remove('dash-pages');
        S.events.doc.scroll.callback.add('dash-pages', this.resize, this.resize, this.resize);
        this.resize();

        //set up button events for menu
        $('.section-pages li.tab-pages').on('click', function () { S.dashboard.pages.tabs.show('pages'); });
        $('.section-pages li.tab-history').on('click', function () { S.dashboard.pages.tabs.show('history'); });
        $('.section-pages li.tab-shadow-templates').on('click', function () { S.dashboard.pages.tabs.show('shadow-templates'); });
        $('.section-pages li.tab-trash').on('click', function () { S.dashboard.pages.tabs.show('trash'); });

        //show the pages section
        S.dashboard.sections.show('pages');
    },

    reset_info: function(){
        this.page_info = {
            'title': '',
            'path': '',
            'link': '',
            'date-created': '',
            'summary': '',
            'created': '',
            'url': '',
            'url-name': S.website.host.substr(0, S.website.host.length - 1),
            'link-create': ''
        };
        $('.section-pages .url-path').html('http://' + S.website.host + '/');
    },

    goback: function (e, count) {
        var container = $(e).parents('.page-details').find('.page-create');
        if (container.hasClass('view')) {
            //first, hide "create page" form, then go back
            container.removeClass('view');
            setTimeout(function () {
                container.html('');
                this.slides.previous(count);
                setTimeout(function () {
                    container.parents('.page-details').children().remove();
                }, 300);
            }, 250);
        } else {
            this.slides.previous(count);
            setTimeout(function () {
                container.parents('.page-details').children().remove();
            }, 300);
        }
        for (var x = 1; x <= count; x++) {
            this.current_path.pop(count)
        }
        if (this.current_path.length > 0) {
            this.current_page = this.current_path[this.current_path.length - 1];
        }else{
            this.current_page = 0;
            this.reset_info();
        }
        this.current_elem = this.getCurrentPage(this.slides.current_slide + 1); 
        this.resize();
    },

    getCurrentPage(i) {
        return $('.tab-body-pages > .slideshow > .slides > .row:nth-child(' + i + ')');
    },

    details: function (e) {
        //show page details after clicking on a page in the page list
        var isfolder = e.getAttribute('data-folder') == "true" ? true : false;
        var pageid = e.getAttribute('data-pageid');
        var link = e.getAttribute('data-link');
        var links = link.substr(1).split('/');
        var data = {
            'id': pageid,
            'title': e.getAttribute('data-title'),
            'title-head': e.getAttribute('data-titlehead') != '' ? e.getAttribute('data-titlehead') : "",
            'has-title-head': e.getAttribute('data-titlehead') != '' ? true : false,
            'path': e.getAttribute('data-path'),
            'link': link,
            'date-created': e.getAttribute('data-created'),
            'summary': e.getAttribute('data-summary'),
            'created': 'created on ' + e.getAttribute('data-created'),
            'url': S.website.protocol + S.website.host + link.substr(1),
            'url-name': link.substr(1),
            'link-create': 'S.dashboard.pages.create.view(this, ' + pageid + ')',
            'link-settings': 'S.dashboard.pages.settings.view(this, ' + pageid + ')',
            'shadow-template-name': e.getAttribute('data-template-name') || '',
            'shadow-template-url': e.getAttribute('data-template-url') || '',
            'shadow-template-hide': (e.getAttribute('data-use-template') != '1' ? 'style="display:none;"' : '')
        }

        //create slideshow navigation anchor links for each page in the hierarchy
        var alinks = [links.length];
        for (var x = 0; x < links.length; x++) {
            if (x == links.length - 1) {
                alinks[x] = links[x].replace(' ', '-');
            } else {
                alinks[x] = '<a class="no-link" href="javascript:" onclick="S.dashboard.pages.goback(this,' + (links.length - 1 - x) + ')">' + links[x].replace(' ', '-') + '</a>/';
            }
            
        }

        var slides = this.slides;

        //remove all siblings to the right
        slides.cleanAfter();

        //add new slide to slideshow
        slides.add($('#page_details').html(), data);

        //update title
        data.title = e.getAttribute('data-title');

        //set global properties for selected page
        this.current_page = pageid;
        this.current_path.push(pageid);
        this.page_info = data;

        //hide all settings & create windows
        var wins = $('.page-create').each(function (e) {
            S.dashboard.pages.settings.cancel(e.firstChild);
            S.dashboard.pages.create.cancel(e.firstChild);
        });


        //load sub pages list
        if (isfolder == true) {
            var list = $('.tab-body-pages > .slideshow > .slides .pages-list').last();
            S.ajax.post("Dashboard/Pages/View", { websiteId: S.dashboard.website.id, parentId: pageid, start: 1, length: 1000, orderby: 4, viewType: 0, search: '' },
                function (data) {
                    if (data.d != 'err') {
                        list.html(data.d);
                        list.find('.columns-list').addClass('small');
                        $('.slide-for-' + pageid).find('.url-path').html('<a class="no-link" href="javascript:" onclick="S.dashboard.pages.goback(this,' + (links.length) + ')">' + S.website.host.replace('/', '') + '</a>/' + alinks.join(''));
                    }
                }
            );
        } else {
            $('.slide-for-' + pageid).find('.url-path').html('<a class="no-link" href="javascript:" onclick="S.dashboard.pages.goback(this,' + (links.length) + ')">' + S.website.host.replace('/', '') + '</a>/' + alinks.join(''));
        }
        slides.next();
        this.current_elem = S.dashboard.pages.getCurrentPage(this.slides.current_slide + 1);
    },

    create: {
        view: function (e, pageid) {
            //display the "create page" form
            var info = S.dashboard.pages.page_info;
            var htm = document.getElementById('page_create').innerHTML;
            var data = {
                'parent-title': info.path != '' ? 'For page "' + info.path.replace(/\//g, ' > ') + '"' : '',
                'page-url': info['url-name'] + '/',
                'create-title': pageid == 0 ? 'Page' : 'Sub Page',
                'shadow-list': ''
            }
            var scaffold = new S.scaffold(htm, data);
            var container = $(e).parents('.page-details').find('.page-create');
            var slideshow = container.parent().addClass('view-create-page').find('.slideshow').first();
            slideshow.removeClass('eight').addClass('four');

            if (container.find('.page-title').length == 0) {
                container.append(scaffold.render());
            }
            //add event listeners for page create form
            container.find('form').on('submit', function (e) {
                S.dashboard.pages.create.submit(container.find('form').get());
                e.preventDefault();
                return false;
            });
            container.find('.btn-page-create-new a').on('click', function (e) { S.dashboard.pages.create.submit(this); });
            container.find('.btn-page-cancel a').on('click', S.dashboard.pages.create.cancel);
            $('#txtcreatedesc').on('keyup', S.dashboard.pages.create.countChars);
            $('#txtcreatetitle').on('keyup', S.dashboard.pages.create.updateTitle);
            container.find('.chk-use-shadow').on('change', function (e) {
                if (e.target.checked) {
                    $('.shadow-list').show();
                } else {
                    $('.shadow-list').hide();
                }
            });
            container.find('.chk-use-child-shadow').on('change', function (e) {
                if (e.target.checked) {
                    $('.shadow-child-list').show();
                } else {
                    $('.shadow-child-list').hide();
                }
            });

            //load shadow template list into drop down lists
            S.dashboard.pages.shadow.loadList();

            //set up new shadow template button
            $('.btn-shadow-create').on('click', S.dashboard.pages.shadow.create.view);

            if (pageid > 0) {
                //var subpages = $(e).parents('.page-details').find('.slideshow');
                //subpages.addClass('hide');
            } else {
                //hide root page list
                //var pagelist = $(e).parents('.page-details').find('.root-list');
                //pagelist.hide();
            }
            container.addClass('view');
        },

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
            var details = $(e).parents('.page-details')
            var container = $(e).parents('.page-create');
            var slideshow = container.parent().addClass('view-create-page').find('.slideshow').first();
            container.parent().removeClass('view-create-page');
            container.removeClass('view');
            slideshow.removeClass('four').addClass('eight');
            setTimeout(function () {
                container.html('');
                if (S.dashboard.pages.current_page > 0) {
                    //var subpages = details.find('.slideshow');
                    //subpages.removeClass('hide');
                } else {
                    //show root page list
                    var pagelist = details.find('.root-list');
                    pagelist.show();
                }
            }, 100);
            S.dashboard.pages.resize();
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

            data = {
                websiteId: S.dashboard.website.id,
                parentId: S.dashboard.pages.current_page,
                type:0,
                title: title,
                description: desc,
                shadowId: container.find('#shadowId').val(),
                shadowChildId: container.find('#shadowChildId').val(),
                secure: secure
            };

            if (data.shadowId == '' || !container.find('.chk-use-shadow')[0].checked) { data.shadowId = 0; }
            if (data.shadowChildId == '' || !container.find('.chk-use-child-shadow')[0].checked) { data.shadowChildId = 0; }

            //submit "create page" form
            S.ajax.post("Dashboard/Pages/Create", data,
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
                            $('.page-item-for-' + S.dashboard.pages.current_page).attr('data-folder', 'true');
                            $('.page-item-for-' + S.dashboard.pages.current_page + ' .icon').html('<svg viewBox="0 0 15 15"><use xlink:href="#icon-folder" x="0" y="0" width="15" height="15" /></svg>')
                        }
                    }
                }
            );
        }
    },

    settings: {
        //page settings functions ///////////////////////////////
        id: null, 
        view: function (e, id) {
            var data = { id: id };
            S.ajax.post('Dashboard/Pages/ViewSettings', data, function (d) {
                var container = $(e).parents('.page-details').find('.page-create');
                container.html('');
                container.append(d.d);

                //update slideshow classes
                var slideshow = container.parent().addClass('view-create-page').find('.slideshow').first();
                slideshow.removeClass('eight').addClass('four');

                //add event listeners for page create form
                container.find('form').on('submit', function (e) {
                    S.dashboard.pages.settings.submit(container.find('form').get());
                    e.preventDefault();
                    return false;
                });

                container.find('.btn-page-settings-update a').on('click', function (e) { S.dashboard.pages.settings.submit(this); });
                container.find('.btn-page-cancel a').on('click', S.dashboard.pages.settings.cancel);
                container.find('#description').on('keyup', S.dashboard.pages.settings.countChars);

                //add events for shadow templates
                container.find('.chk-use-shadow').on('change', function (e) {
                    if (e.target.checked) {
                        $('.shadow-list').show();
                    } else {
                        $('.shadow-list').hide();
                    }
                });
                container.find('.chk-use-child-shadow').on('change', function (e) {
                    if (e.target.checked) {
                        $('.shadow-child-list').show();
                    } else {
                        $('.shadow-child-list').hide();
                    }
                });

                //check shadow checkboxes
                if (container.find('.chk-use-shadow')[0].checked) {
                    $('.shadow-list').show();
                } else {
                    $('.shadow-list').hide();
                }
                if (container.find('.chk-use-child-shadow')[0].checked) {
                    $('.shadow-child-list').show();
                } else {
                    $('.shadow-child-list').hide();
                }

                //load shadow template list into drop down lists
                S.dashboard.pages.shadow.loadList();

                //select shadow template from list
                container.find('#shadowId option').removeAttr('selected');
                container.find('#shadowId option[value="' + container.find('#shadowId').attr('data-id') + '"]').attr('selected', 'selected');
                container.find('#shadowChildId option').removeAttr('selected');
                container.find('#shadowChildId option[value="' + container.find('#shadowChildId').attr('data-id') + '"]').attr('selected', 'selected');

                //set up new shadow template button
                container.find('.btn-shadow-create').on('click', S.dashboard.pages.shadow.create.view);

                //set up delete button
                container.find('.btn-page-delete a').on('click', S.dashboard.pages.settings.delete);

                //show settings section
                //var subpages = $(e).parents('.page-details').find('.slideshow');
                //subpages.addClass('hide');
                container.addClass('view');

                S.dashboard.pages.settings.id = id;
            });
        },

        countChars: function (e) {
            var container = $(e.target).parents('.page-create');
            var field = container.find('#description');
            var desc = field.val();
            if (desc.length > 160) { desc = desc.substr(0, 160); field.val(desc); }
            container.find('.desc-chars').html((160 - desc.length) + ' characters left');
        },

        cancel: function (e) {
            var details = $(e).parents('.page-details')
            var container = $(e).parents('.page-create');
            var slideshow = container.parent().addClass('view-create-page').find('.slideshow').first();
            container.parent().removeClass('view-create-page');
            container.removeClass('view');
            slideshow.removeClass('four').addClass('eight');
            setTimeout(function () {
                container.html('');
                if (S.dashboard.pages.current_page > 0) {
                    //var subpages = details.find('.slideshow');
                    //subpages.removeClass('hide');
                } else {
                    //show root page list
                    var pagelist = details.find('.root-list');
                    pagelist.show();
                }
            }, 100);
            setTimeout(function () { S.dashboard.pages.resize(); }, 500);
        },

        submit: function (e) {
            var container = $(e).parents('.page-create');
            var titlehead = container.find('#titlehead').val();
            var desc = container.find('#description').val();
            var secure = container.find('.chk-secure').prop('checked');
            var active = container.find('.chk-active').prop('checked');
            var msg = container.find('.message');
            msg.hide();

            //validate form
            if (titlehead == '' || titlehead == null) {
                S.message.show(msg, 'error', 'Page title cannot be empty');
                return false;
            }
            if (['/'].find(function (a) { return titlehead.indexOf(a) >= 0; }) >= 0) {
                S.message.show(msg, 'error', 'Page title cannot use certain special characters');
                return false;
            }
            if (desc == '' || desc == null) {
                S.message.show(msg, 'error', 'Page description cannot be empty');
                return false;
            }
            if (!S.validate.text(desc, ['{', '}', '[', ']', '/', '\\'])) {
                S.message.show(msg, 'error', 'Page description cannot use certain special characters');
                return false;
            }
            if (desc.length > 160) {
                S.message.show(msg, 'error', 'Page description cannot be more than 160 characters long');
                return false;
            }

            var data = {
                websiteId: S.dashboard.website.id,
                id: S.dashboard.pages.settings.id,
                title: titlehead,
                description: desc,
                type: 0,
                shadowId: $('#shadowId').val(),
                shadowChildId: $('#shadowChildId').val(),
                secure: secure,
                active: active
            };

            if (!$('.chk-use-shadow')[0].checked) { data.shadowId = 0; }
            if (!$('.chk-use-child-shadow')[0].checked) { data.shadowChildId = 0; }

            //submit "page settings" form
            S.ajax.post("Dashboard/Pages/UpdateSettings", data,
                function (data) {
                    if (data.d == 'err') {
                        S.message.show(msg, 'error', 'An error occurred while trying to create your new web page');
                        return false;
                    } else {
                        //show success message
                        S.message.show(msg, '', 'Your page, "' + titlehead + '" has been updated successfully');
                        //update existing UI
                        $('.page-title-for-' + S.dashboard.pages.settings.id + ' h4').html(titlehead);
                        $('.page-summary-for-' + S.dashboard.pages.settings.id + ' .summary-details').html(desc);

                        var opt = $('#shadowId option[value="' + $('#shadowId').val() + '"]');

                        $('.page-item-for-' + S.dashboard.pages.settings.id)
                            .attr('data-title', titlehead)
                            .attr('data-use-template', $('.chk-use-shadow')[0].checked ? '1' : '')
                            .attr('data-template-name', opt.html().trim())
                            .attr('data-template-url', opt.attr('data-url'));

                        //show or hide shadow template
                        var template = $('.shadow-template-for-' + S.dashboard.pages.settings.id);
                        if ($('.chk-use-shadow')[0].checked) {
                            template.show();
                        } else {
                            template.hide();
                        }
                        template.find('.shadow-name').html(opt.html().trim());
                        template.find('.shadow-url')[0].href = opt.attr('data-url');
                    }
                }
            );
        },

        delete: function (e) {
            if (confirm("Do you really want to delete this page? If so, all child pages will be moved to the trash bin along with this page. Afterwards, you can permenantly delete your pages from within the trash bin.")) {
                data = {
                    websiteId: S.website.id,
                    id: S.dashboard.pages.settings.id
                };
                //submit page for deletion
                S.ajax.post("Dashboard/Pages/Delete", data,
                    function (data) {
                        if (data.d == 'err') {
                            S.message.show(msg, 'error', 'An error occurred while trying to delete your web page');
                            return false;
                        } else {
                            //remove page from list & go back to previous slide
                            $('.page-item-for-' + S.dashboard.pages.settings.id).remove();
                            S.dashboard.pages.goback(e);
                        }
                    }
                );
            }
        }
    },

    shadow: { //shadow templates
        loadList: function () {
            var shadowId = $('#shadowId').val();
            var shadowChildId = $('#shadowChildId').val();
            var list = '';
            var templates = S.dashboard.pages.shadow_templates;
            for (var x = 0; x < templates.length; x++) {
                list += '<option value="' + templates[x].id + '" data-url="' + templates[x].url + '">' + templates[x].title + '</option>';
            }
            $('#shadowId, #shadowChildId').html(list);
            $('#shadowId').val(shadowId);
            $('#shadowChildId').val(shadowChildId);
        },

        create: {
            view: function () {
                //view popup to create new shadow template
                S.popup.show('New Shadow Template', $('#shadow_template_create').html());
                $('.btn-shadow-save').on('click', S.dashboard.pages.shadow.create.save);
            },

            save: function () {
                //save new shadow template
                var msg = $('.popup .message');
                msg.hide();
                var data = {
                    websiteId: S.website.id,
                    name: $('#shadow_name').val()
                }
                if (!S.validate.alphaNumeric(data.name, [' '])) {
                    S.message.show(msg, 'error', 'No special characters are allowed');
                    return;
                }

                //submit "new shadow template" form
                S.ajax.post("Dashboard/Pages/CreateShadowTemplate", data,
                    function (d) {

                        if (d.d == 'exists') {
                            S.message.show(msg, 'error', 'A shadow template with the name "' + data.name + '" already exists');
                            return false;
                        } else if (d.d == 'err') {
                            S.message.show(msg, 'error', 'An error occurred while trying to create a new shadow template');
                            return false;
                        } else {
                            //show success message
                            S.message.show(msg, '', 'Your shadow template, "' + data.name + '" has been created successfully');
                            $('#shadow_name').val('');
                            eval(d.d);

                            //load shadow template list into drop down lists
                            S.dashboard.pages.shadow.loadList();
                        }
                    }
                );
            }
        }
    },

    history: {
        view: function (id, callback) {
            if ($('.tab-body-history.for-page-' + id).length > 0) { callback(); return; }
            var data = { id: id, startDate: new Date().toISOString(), length: 20 };
            S.ajax.post('Dashboard/Pages/ViewHistory', data, function (d) {
                //remove reference to previously-selected page id & add new reference
                var sect = $('.tab-body-history');
                var classes = sect[0].getAttribute('class').split(' ');
                for (var x = 0; x < classes.length; x++) {
                    if (classes[x].indexOf('for-page-') == 0) {
                        sect.removeClass(classes[x]);
                    }
                }
                sect.addClass('for-page-' + id);
                sect.html(d.d);

                //execute callback
                callback();
            });
        }
    },

    tabs: {
        show: function (name) {
            if ($('.pages-body > .tab-body-' + name + '.is-selected').length > 0) { return;}
            var speed = 200;
            $('.section-pages ul.tabs > li').removeClass('selected');
            $('.section-pages ul.tabs > li.tab-' + name).addClass('selected');
            var section = $('.pages-body > .section.is-selected').removeClass('is-selected');
            var height = section.height();
            section.animate({ top: height * -1 }, {
                duration: speed, easing: 'easeOutCubic', complete: function () {
                    function show_section() {
                        section.hide();
                        var newsect = $('.pages-body > .tab-body-' + name);
                        newsect.css({ 'opacity': 0, top: 0 }).addClass('is-selected').show();
                        var newh = newsect.height();
                        newsect.css({ top: newh * -1, 'opacity': 1 });
                        newsect.animate({ top: 0 }, {
                            duration: speed, easing: 'easeInCubic',
                            complete: S.dashboard.pages.resize
                        });
                    }

                    switch (name) {
                        case 'history':
                            S.dashboard.pages.history.view(0, show_section);
                            break;

                        default: show_section(); break;
                    }
                }
            });
        }
    },

    subpage: {
        //sub page functions /////////////////////////////////////
        goto: function (slides, index) {
            slides.style.left = (index * 100 * -1) + "%";
        }
    },

    resize: function () {
        var win = S.window.pos();
        var i = S.dashboard.pages.current_page + 1;
        var pad = 80;
        var section = S.dashboard.pages.current_elem;
        var details = section.find('.page-details-side');
        var bottom = details.find('.absolute.bottom');
        var slideshow = section.find('.slideshow').first();
        var pos_details = details.offset();
        var pos_slideshow = slideshow.offset();
        pos_details.height = details.height();
        pos_slideshow.width = slideshow.width();

        if (section.find('.view-create-page').length > 0) {
            if (pos_details.top + pos_details.height > win.h + win.scrolly || pos_details.top < win.scrolly) { pad = 0; }
            if (!(pos_details.top + pos_details.height > win.h + win.scrolly) && pos_details.top < win.scrolly) { pad = (win.scrolly + win.h) - (pos_details.top + pos_details.height); }
        }
        

        $('.section-pages .pages-list ul.columns-list').filter(
            function (a) {
                return a.style.display != 'none';
            }
        ).each(function (e) {
            var y = $(e).offset().top;
            e.style.maxHeight = (win.scrolly + win.h - y - pad) + 'px';
            //e.style.maxHeight = (win.scrolly + win.h - (
            //    (win.scrolly + win.h) - (pos_slideshow.top + pos_details.height)
            //) - y - pad) + 'px';
        });

        if (bottom.length > 0) {

            pad = 10;

            //bottom buttons
            if ((pos_details.top + pos_details.height + pad) > (win.h + win.scrolly)) {
                var b = ((pos_details.top + pos_details.height + pad) - (win.h + win.scrolly));
                if (b > 0) {
                    bottom.css({ bottom: b });
                }
            } else if(bottom[0].style.bottom != '0') {
                bottom[0].style.bottom = '0';
            }
            //details panel
            if (pos_details.top <= win.scrolly) {
                details.find('.details-top').css({ top: win.scrolly - pos_details.top })
            } else {
                details.find('.details-top').css({ top: 0 })
            }

            //slideshow panel
            pad = 0;
            if (pos_details.top + pad <= win.scrolly) {
                pos_slideshow.top = win.scrolly;
                slideshow.css({ top: win.scrolly - (pos_details.top + pad) });
            } else {
                slideshow.css({ top: 0 });
            }
            //var bspace = (pos_details.top + pos_details.height) - (win.h + win.scrolly);
            //bspace = bspace < 0 ? 0 : bspace;
            //var h = (pos_details.top + pos_details.height) - (bspace) - pos_slideshow.top;
            //slideshow.css({ height: h })
        }
    }
}

