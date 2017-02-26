S.editor.window = {
    items: {},

    load: function (id, options) {
        //either create a new modal window or open an existing modal window within the editor
        var win = this.items[id];
        if (!win) {
            //set up window properties & events
            win = {
                //properties
                id: id,
                elem: null,
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

                //events
                onLoad: options.onLoad ? options.onLoad : null,
                onOpen: options.onOpen ? options.onOpen : null,
                onClose: options.onClose ? options.onClose : null,
                onMaximize: options.onMaximize ? options.onMaximize : null,
                onMinimize: options.onMinimize ? options.onMinimize : null,
                onUrlLoad: options.onUrlLoad ? options.onUrlLoad : null,

                //content
                html: options.html ? options.html : '',
                url: options.url ? options.url : '',
                urlData: options.urlData ? options.urlData : ''
            }
            //normalize options
            if (win.top < S.editor.toolbar.height) { win.top = S.editor.toolbar.height; }

            //create window element
            var div = document.createElement('div');
            div.id = 'win' + id;
            div.className = 'window' + (win.classes != '' ? ' ' + win.classes : '');

            //align window
            div.style.top = win.top + 'px';

            //z-index
            if (win.zIndex > 0) {
                div.style.zIndex = 4500 + win.zIndex;
            }

            //visible
            if (win.visible == false) { div.style.display = 'none'; }

            //load window scaffolding
            var scaffold = new S.scaffold($('#template_window').html(), {
                'title': win.title,
                'arrow': win.hasArrow,
                'titlebar': win.hasTitleBar,
                'can-maximize': win.canMaximize,
                'can-close': win.canClose,
                'html':win.html
            });
            div.innerHTML = scaffold.render();
            win.elem = div;

            //align arrow
            if (win.hasArrow) {
                var arrow = $(div).find('.arrow');
                switch (win.alignAt) {
                    case 'top-left': case 'top-center': case 'top-right':
                        arrow.addClass('top');
                        break;
                    case 'bottom-left': case 'bottom-center': case 'bottom-right':
                        arrow.addClass('bottom');
                        break;
                }
            }

            //append to windows list
            this.items[id] = win;
            $('.editor .windows').append(div);

            //resize window contents
            var content = $('#win' + id + ' .box > .content').get();
            if (win.height.toString().indexOf('%') < 0) {
                content.style.minHeight = win.height + 'px';
            } else {
                content.style.minHeight = (((S.window.height - win.top) / 100) * parseInt(win.height.replace('%', ''))) + 'px';
            }
            if (win.width.toString().indexOf('%') < 0) {
                content.style.width = win.width + 'px';
            } else {
                content.style.width = (((S.window.width - (win.right || win.left)) / 100) * parseInt(win.width.replace('%', ''))) + 'px';
            }
            if (win.maxHeight > 0) { content.style.maxHeight = win.maxHeight + 'px' }

            //reposition window
            S.editor.window.reposition(id);

            //load initial content from server
            if (win.url != '') {
                S.ajax.post(win.url, win.urlData,
                    function (data) {
                        $('#win' + id + ' .content').html(data.d);
                        S.editor.window.reposition(id);
                        if (win.onUrlLoad) {
                            win.onUrlLoad();
                        }
                    }
                );
            }

            //setup window button events
            $('#win' + id + ' .icon.close').on('click', function () { S.editor.window.close.call(S.editor.window, id) });
            $('#win' + id + ' .icon.maximize').on('click', function () { S.editor.window.maximize.call(S.editor.window, id) });

            //setup titlebar drag event
            if (win.hasTitleBar && win.canDrag) {
                S.drag.add(
                    $('#win' + id + ' .titlebar').get(),
                    $('#win' + id).get(),
                    null, null, null,
                    {
                        boundTop: S.editor.toolbar.height,
                        boundLeft: 0,
                        boundRight: 0,
                        boundBottom: 0
                    }
                );
            }

            //execute loaded callback
            if (win.onLoad) { win.onLoad(); }
        } else {
            //show existing window
            var window = $('#win' + id);
            if (window.get().style.display == 'none') {
                window.show();
                this.reposition(id);
                win.visible = true;
            } else {
                window.hide();
                win.visible = false;
            }
        }
        if (win.onOpen && win.visible == true) { win.onOpen(); }
    },

    close: function (id) {
        var win = this.items[id];
        $('#win' + id).hide();
        this.items[id].visible = false;

        if (win.isDialog == true) {
            //hide dialog modal background
        }
    },

    repositionAll: function () {
        for (var id in this.items) {
            S.editor.window.reposition(id);
        }
    },

    reposition: function (id){
        var win = this.items[id];

        if (win.alignTarget == 'window') {
            //align to document body
            var div = win.elem;
            if (win.right != null) {
                div.style.right = win.right + 'px';
            } else {
                div.style.left = win.left + 'px';
            }
        } else {
            //align to target element
            var target = { x: 0, y: 0 };
            var box = { x: 0, y: 0 };
            var elem = $(win.alignTarget);
            var pos = elem.offset();
            var arrowPad = win.hasArrow ? 25 : 0;
            var arrow = { elem: $(win.elem).find('.box > .arrow'), x: 0, w: 50 };
            pos.width = elem.width();
            pos.height = elem.height();
            target.pos = pos;

            //get alignment for target
            if(elem.length == 1){
                switch (win.alignTo) {
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
                    case 'bottom-right':
                        target.y = pos.height;
                        target.x = pos.width;
                        break;
                }

                //get alignment for window
                elem = $(win.elem);
                pos = elem.offset();
                pos.width = elem.width();
                pos.height = elem.height();
                box.pos = pos;

                switch (win.alignAt) {
                    case 'top-left':
                        box.y -= win.alignPadding + arrowPad;
                        break;
                    case 'top-center':
                        box.y -= win.alignPadding + arrowPad;
                        box.x = pos.width / 2;
                        break;
                    case 'top-right':
                        box.y -= win.alignPadding + arrowPad;
                        box.x = pos.width;
                        break;
                    case 'bottom-left':
                        box.y = pos.height + win.alignPadding + arrowPad;
                        break;
                    case 'bottom-center':
                        box.y = pos.height + win.alignPadding + arrowPad;
                        box.x = pos.width / 2;
                        break;
                    case 'bottom-right':
                        box.y = pos.height + win.alignPadding + arrowPad;
                        box.x = pos.width;
                        break;
                }

                //realign arrow
                if(win.hasArrow){
                    switch (win.alignAt) {
                        case 'bottom-left': case 'bottom-center': case 'bottom-right':
                            arrow.elem.css({ top: pos.height });
                            break;
                    }
                    switch (win.alignAt) {
                        case 'top-left': case 'bottom-left':
                            arrow.x = 0;
                            break;
                        case 'top-center': case 'bottom-center':
                            arrow.x = box.x - (arrow.w / 2);
                            break;
                        case 'top-right': case 'bottom-right':
                            arrow.x = pos.width - arrow.w;
                            break;
                    }
                    arrow.elem.css({ left: arrow.x });
                }

                //align window to target
                elem.css({
                    left: target.pos.left + target.x - box.x,
                    top: target.pos.top + target.y - box.y
                });
            }
        }
    },

    maximize: function (id) {
        var win = this.items[id];
    },

    click: function (target, type) {
        if ($(target).parents('.menu').parents('.toolbar').length > 0) { return;}
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

    hideDialog: function (id) {
        var win = this.items[id];
        if (win.isDialog) { $(win.elem).hide(); }
    },

    hideMenu: function (id) {
        var win = this.items[id];
        if (win.isMenu) { $(win.elem).hide(); }
    },

    hideMenus: function () {
        for (var id in this.items) {
            var win = this.items[id];
            if (win.isMenu) { $(win.elem).hide(); }
        }
    },

    hideDialogs: function () {
        for (var id in this.items) {
            var win = this.items[id];
            if (win.isDialog) { $(win.elem).hide(); }
        }
    }


}