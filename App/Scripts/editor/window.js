S.editor.window = {
    items: {},

    load: function (id, options) {
        //either create a new modal window or open an existing modal window within the editor
        var box = this.items[id];

        if (!options.urlData) { options.urlData = "";}

        if (!box || options.reload == true) {
            //set up window properties & events
            if (box) { $('#win' + id).remove(); }
            box = {
                //properties
                id: options.id ? options.id : id,
                elem: null, //internal property
                classes: options.classes ? option.classes : '',
                title: options.title ? options.title : '',
                icon: options.icon ? options.icon : '',
                width: options.width ? options.width : 500,
                height: options.height ? options.height : 0,
                maxHeight: options.maxHeight ? options.maxHeight : 0,
                left: options.left ? options.left : 0,
                right: options.right ? options.right : null,
                top: options.top ? options.top : 0,
                visible: options.visible === false ? options.visible : true,
                zIndex: options.zIndex ? options.zIndex : 1,

                //aligment logic (middle, top-center, top-left, top-right, bottom-center, bottom-left, bottom-right)
                alignTo: options.alignTo ? options.alignTo : 'top-left',   // (to target side)
                alignAt: options.alignAt ? options.alignAt : 'top-left', // (at window side)
                alignTarget: options.alignTarget ? options.alignTarget : 'window', //element ID, window
                alignPadding: options.alignPadding ? options.alignPadding : 0,

                //options
                hasArrow: options.hasArrow ? options.hasArrow : false,
                hasTitleBar: options.hasTitleBar === false ? options.hasTitleBar : true,
                canMaximize: options.canMaximize ? options.canMaximize : false,
                canClose: options.canClose === false ? options.canClose : true,
                canDrag: options.canDrag === false ? options.canDrag : true,
                snapToEdge: options.snapToEdge === false ? options.snapToEdge : true,
                isDialog: options.isDialog ? options.isDialog : false,
                isMenu: options.isMenu ? options.isMenu : false,
                autoHide: options.autoHide ? options.autoHide : false,
                reload: options.reload ? options.reload : false,

                //events
                onLoad: options.onLoad ? options.onLoad : null,
                onOpen: options.onOpen ? options.onOpen : null,
                onClose: options.onClose ? options.onClose : null,
                onMaximize: options.onMaximize ? options.onMaximize : null,
                onMinimize: options.onMinimize ? options.onMinimize : null,
                onUrlLoad: options.onUrlLoad ? options.onUrlLoad : null,

                //content
                html: options.html ? options.html : '',
                //url: options.url ? options.url : '',
                urlData: options.urlData ? options.urlData : (options.data ? options.data : ''),
            }
            
            //normalize options
            if (box.top < S.editor.toolbar.height) { box.top = S.editor.toolbar.height; }

            //create window element
            var div = document.createElement('div');
            div.id = 'win' + id;
            div.className = 'window' + (box.classes != '' ? ' ' + box.classes : '');

            //z-index
            if (box.zIndex > 0) {
                div.style.zIndex = 4500 + box.zIndex;
            }

            //visible
            if (box.visible == false) { div.style.display = 'none'; }

            //load window scaffolding
            var scaffold = new S.scaffold($('#template_window').html(), {
                'title': box.title,
                'arrow': box.hasArrow,
                'titlebar': box.hasTitleBar,
                'can-maximize': box.canMaximize,
                'can-close': box.canClose,
                'html': box.html
            });
            div.innerHTML = scaffold.render();
            box.elem = div;
            box.html = ''; //dump html string from memory

            //align arrow
            if (box.hasArrow) {
                var arrow = $(div).find('.arrow');
                switch (box.alignAt) {
                    case 'top-left': case 'top-center': case 'top-right':
                        arrow.addClass('top');
                        break;
                    case 'bottom-left': case 'bottom-center': case 'bottom-right':
                        arrow.addClass('bottom');
                        break;
                }
            }

            //append to windows list
            $('.editor .windows').append(div);

            //set global object
            S.editor.window.items[id] = box;
            
            if (options.url) {
                this.loadUrl(id, options.url, options.urlData, resizeContents);
            }

            function resizeContents() {
                //resize window contents
                var content = $('#win' + id + ' .box > .content').get();
                if (box.height.toString().indexOf('%') < 0) {
                    content.style.minHeight = box.height + 'px';
                } else {
                    content.style.minHeight = (((S.window.h - box.top) / 100) * parseInt(box.height.replace('%', ''))) + 'px';
                }
                if (box.width.toString().indexOf('%') < 0) {
                    content.style.width = box.width + 'px';
                } else if (box.width == '' || box.width == null) {
                    content.style.width = '';
                } else {
                    content.style.width = (((S.window.width - (box.right || box.left)) / 100) * parseInt(box.width.replace('%', ''))) + 'px';
                }
                if (box.maxHeight > 0) { content.style.maxHeight = box.maxHeight + 'px' }

                //align window
                switch (box.alignAt) {
                    case 'center':
                        var elem = $(div);
                        var pos = elem.offset();
                        pos.height = elem.height();
                        pos.width = elem.width();
                        box.top = (S.window.h - pos.height) / 2;
                        box.left = (S.window.w - pos.width) / 2;
                        box.right = S.window.w - (box.left + pos.width);
                        if (box.left + pos.width >= (S.window.w - (S.window.w * 0.2))) { box.left = null; } else { box.right = null; }
                        div.style.left = box.left + 'px';
                        break;
                }
                div.style.top = box.top + 'px';

                //reposition window
                S.editor.window.reposition.call(S.editor.window, id);
            }

            resizeContents();

            //setup window button events
            $('#win' + id + ' .icon.close').on('click', function () { S.editor.window.close.call(S.editor.window, id); });
            $('#win' + id + ' .icon.maximize').on('click', function () { S.editor.window.maximize.call(S.editor.window, id); });

            //setup titlebar drag event
            if (box.hasTitleBar && box.canDrag) {
                S.drag.add(
                    $('#win' + id + ' .titlebar').get(),
                    $('#win' + id).get(),
                    null, null,
                    function () { S.editor.window.drag.end.call(S.editor.window, id); },
                    {
                        boundTop: S.editor.toolbar.height,
                        boundLeft: 0,
                        boundRight: 0,
                        boundBottom: 0
                    }
                );
            }

            //execute loaded callback
            if (box.onLoad) { box.onLoad(); }
        } else {
            //show existing window
            var window = $('#win' + id);
            if (options.url) {
                this.loadUrl(id, options.url, options.urlData);
            }
            if (window.get().style.display == 'none') {
                window.show();
                this.reposition(id);
                box.visible = true;
            } else {
                window.hide();
                box.visible = false;
            }
            if (box.onOpen && box.visible == true) { box.onOpen(); }
        }

    },

    loadUrl: function (id, url, data, callback) {
        var box = S.editor.window.items[id]; if (box == null) { return;}
        if (box.url != url && url != null) {
            S.ajax.post(url, data,
                function (d) {
                    if (d.type == 'Websilk.Services.Inject') {
                        S.ajax.callback.inject(d);
                    }else{
                        $('#win' + id + ' .content').html(d.d); //(d.d); cat waving hello
                        if (callback) { callback(); }
                        if (box.onUrlLoad) {
                            box.onUrlLoad();
                        }
                    }
                }
            );
        }
    },

    close: function (id) {
        var box = this.items[id];
        $('#win' + id).hide();
        this.items[id].visible = false;

        if (box.isDialog == true) {
            //hide dialog modal background
        }
    },

    repositionAll: function () {
        for (var id in this.items) {
            S.editor.window.reposition(id);
        }
    },

    reposition: function (id) {
        var box = this.items[id];
        var win = S.window.pos();
        if (box.alignTarget == 'window') {
            //align to document body
            var div = box.elem;
            var elem = $(div);
            var pos = elem.offset();
            pos.width = elem.width();
            if (box.xperc == null) {
                this.items[id].xperc = 100 - ((100 / win.w) * (win.w - (pos.left + (pos.width / 2))));
            }
            if (box.right != null) {
                if (pos.left < 0) { this.items[id].right = win.w - pos.width;}
                div.style.right = box.right + 'px';
                div.style.left = '';
            } else {
                if (pos.left > 0 || box.xperc > 10) {
                    box.left = (win.w * (box.xperc * 0.01)) - (pos.width / 2);
                }
                
                if (box.left + pos.width > win.w) { this.items[id].left = win.w - pos.width; }
                if (box.left < 0) { box.left = 0; }
                div.style.left = box.left + 'px';
            }
        } else {
            //align to target element
            var target = { x: 0, y: 0 };
            var boxpos = { x: 0, y: 0 };
            var elem = $(box.alignTarget);
            var pos = elem.offset();
            var arrowPad = box.hasArrow ? 25 : 0;
            var arrow = { elem: $(box.elem).find('.box > .arrow'), x: 0, w: 50 };
            pos.width = elem.width();
            pos.height = elem.height();
            target.pos = pos;

            //get alignment for target
            if (elem.length == 1) {
                switch (box.alignTo) {
                    case 'top-center':
                        target.x = pos.width / 2;
                        break;
                    case 'top-right':
                        target.x = pos.width;
                        break;
                    case 'bottom-left':
                        target.y = pos.height;
                        break;
                    case 'bottom-center':
                        target.y = pos.height;
                        target.x = pos.width / 2;
                        break;
                }

                //get alignment for window
                elem = $(box.elem);
                pos = elem.offset();
                pos.width = elem.width();
                pos.height = elem.height();
                box.pos = pos;

                switch (box.alignAt) {
                    case 'top-left':
                        boxpos.y -= box.alignPadding + arrowPad;
                        break;
                    case 'top-center':
                        boxpos.y -= box.alignPadding + arrowPad;
                        boxpos.x = pos.width / 2;
                        break;
                    case 'top-right':
                        boxpos.y -= box.alignPadding + arrowPad;
                        boxpos.x = pos.width;
                        break;
                    case 'bottom-left':
                        boxpos.y = pos.height + box.alignPadding + arrowPad;
                        break;
                    case 'bottom-center':
                        boxpos.y = pos.height + box.alignPadding + arrowPad;
                        boxpos.x = pos.width / 2;
                        break;
                    case 'bottom-right':
                        boxpos.y = pos.height + box.alignPadding + arrowPad;
                        boxpos.x = pos.width;
                        break;
                }

                //realign arrow
                if (box.hasArrow) {
                    switch (box.alignAt) {
                        case 'bottom-left': case 'bottom-center': case 'bottom-right':
                            arrow.elem.css({ top: pos.height });
                            break;
                    }
                    switch (box.alignAt) {
                        case 'top-left': case 'bottom-left':
                            arrow.x = 0;
                            break;
                        case 'top-center': case 'bottom-center':
                            arrow.x = boxpos.x - (arrow.w / 2);
                            break;
                        case 'top-right': case 'bottom-right':
                            arrow.x = pos.width - arrow.w;
                            break;
                    }
                    arrow.elem.css({ left: arrow.x });
                }

                //align window to target
                elem.css({
                    left: target.pos.left + target.x - boxpos.x,
                    top: target.pos.top + target.y - boxpos.y - win.scrolly
                });
            } else {

            }
        }
    },

    maximize: function (id) {
        var box = this.items[id];
    },

    click: function (target, type) {
        if ($(target).parents('.menu').parents('.toolbar').length > 0) { return; }
        if (type != 'window') {
            for (var id in this.items) {
                if (this.items[id].isDialog) {
                    this.hideDialog(id);
                } else if (this.items[id].isMenu) {
                    this.hideMenu(id);
                }
            }
        }
    },

    drag: {
        end: function (id) {
            var elem = $('#win' + id);
            var dragIndex = S.drag.indexOf($('#win' + id + ' .titlebar').get());
            var pos = elem.offset();
            var win = S.window.pos();
            var box = this.items[id];
            pos.width = elem.width();
            if (pos.left + pos.width < (win.w - (win.w * 0.1)) || pos.left <= (win.w * 0.1)) {
                //lock to left side
                S.drag.items[dragIndex].options.useRight = false;
                this.items[id].left = pos.left;
                this.items[id].right = null;
                elem[0].style.right = '';
                elem[0].style.left = pos.left + 'px';
            } else {
                //lock to right side
                S.drag.items[dragIndex].options.useRight = true;
                this.items[id].right = win.w - (pos.left + pos.width);
                this.items[id].left = null;
                elem[0].style.left = '';
                elem[0].style.right = (win.w - (pos.left + pos.width)) + 'px';
            }
            this.items[id].xperc = 100 - ((100 / win.w) * (win.w - (pos.left + (pos.width / 2))));
        }
    },

    tabMenu: {
        select: function (id, index) {
            var window = $('#win' + id);
            var tabs = window.find('.top-menu ul.tabs');
            var selected = window.find('.content .tab-content').filter(function (a) { return a.className.indexOf('hide') == -1; });
            var section = window.find('.content .tab-content.index-' + index);
            tabs.find('.row.selected').removeClass('selected');
            $(tabs.find('li')[index - 1]).find('.row.hover').addClass('selected');
            selected.addClass('hide');
            section.removeClass('hide');
        }
    },

    hideDialog: function (id) {
        var box = this.items[id];
        if (box.isDialog) { $(box.elem).hide(); }
    },

    hideMenu: function (id) {
        var box = this.items[id];
        if (box.isMenu) { $(box.elem).hide(); }
    },

    hideMenus: function () {
        for (var id in this.items) {
            var box = this.items[id];
            if (box.isMenu) { $(box.elem).hide(); }
        }
    },

    hideDialogs: function () {
        for (var id in this.items) {
            var box = this.items[id];
            if (box.isDialog) { $(box.elem).hide(); }
        }
    }
};