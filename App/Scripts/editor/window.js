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
                classes: options.classes ? option.classes : '',
                title: options.title ? options.title : '',
                icon: options.icon ? options.icon : '',
                html: options.html ? options.html : '',
                width: options.width ? options.width : 500,
                height: options.height ? options.height : 0,
                maxHeight: options.maxHeight ? options.maxHeight : 0,
                left: options.left ? options.left : 0,
                right: options.right ? options.right : null,
                top: options.top ? options.top : 0,
                visible: options.visible ? options.visible : true,
                zIndex: options.zIndex ? options.zIndex : 1,

                //aligment logic
                align: options.align ? options.align : 'center', //middle, top-center, top-left, top-right, bottom-center, bottom-left, bottom-right
                alignAt: options.alignAt ? options.alignAt : 'middle', //middle, top-center, top-left, top-right, bottom-center, bottom-left, bottom-right
                alignTarget: options.alignTarget ? options.alignTarget : 'window', //element ID, window
                alignPadding: options.alignPadding ? options.alignPadding : 0,

                //options
                hasArrow: options.arrow ? options.arrow : false,
                hasTitleBar: options.hasTitleBar ? options.hasTitleBar : true,
                canMaximize: options.canMaximize ? options.canMaximize : false,
                canClose: options.canClose ? options.canClose : true,
                canDrag: options.canDrag ? options.canDrag : true,
                snapToEdge: options.snapToEdge ? options.snapToEdge : true,
                isDialog: options.isDialog ? options.isDialog : false,
                isMenu: options.isMenu ? options.isMenu : false,
                autoHide: options.autoHide ? options.autoHide : false,

                //events
                onLoad: options.onLoad ? options.onLoad : null,
                onOpen: options.onOpen ? options.onOpen : null,
                onClose: options.onClose ? options.onClose : null,
                onMaximize: options.onMaximize ? options.onMaximize : null,
                onMinimize: options.onMinimize ? options.onMinimize : null
            }

            //create window element
            var div = document.createElement('div');
            div.id = 'win' + id;
            div.className = 'window' + (win.classes != '' ? ' ' + win.classes : '');

            //align window
            if (win.top < S.editor.toolbar.height) { win.top = S.editor.toolbar.height; }
            if (win.right != null) {
                div.style.right = win.right + 'px';
            } else {
                div.style.left = win.left + 'px';
            }
            div.style.top = (win.top + win.alignPadding) + 'px';

            //resize window
            if (win.height.toString().indexOf('%') < 0) {
                div.style.minHeight = win.height + 'px';
            } else {
                div.style.minHeight = (((S.window.height - win.top) / 100) * parseInt(win.height.replace('%', ''))) + 'px';
            }
            if (win.width.toString().indexOf('%') < 0) {
                div.style.width = win.width + 'px';
            } else {
                div.style.width = (((S.window.width - (win.right || win.left)) / 100) * parseInt(win.width.replace('%', ''))) + 'px';
            }
            if (win.maxHeight > 0) { div.style.maxHeight = win.maxHeight + 'px' }

            //z-index
            if (win.zIndex > 0) {
                div.style.zIndex = 4500 + win.zIndex;
            }

            //visible
            if (win.visible == false) { div.style.display = 'none'; }

            //load window scaffolding
            var scaffold = new S.scaffold($('#window_scaffold').html(), {
                'title': win.title,
                'titlebar': win.hasTitleBar,
                'can-maximize': win.canMaximize,
                'can-close': win.canClose,
                'html':win.html
            });
            div.innerHTML = scaffold.render();

            //append to windows list
            this.items[id] = win;
            $('.editor .windows').append(div);

            //setup window button events
            $('#win' + id + ' .icon.close').on('click', function () { S.editor.window.close.call(S.editor.window, id) });
            $('#win' + id + ' .icon.maximize').on('click', function () { S.editor.window.maximize.call(S.editor.window, id) });

            //execute loaded callback
            if (win.onLoad) { win.onLoad(); }
        } else {
            //show existing window
            $('#win' + id).show();
            win.visible = true;
        }
        if (win.onOpen && win.visible == true) { win.onOpen(); }
    },

    close: function (id) {
        var win = this.items[id];
        console.log(win);
        $('#win' + id).hide();
        this.items[id].visible = false;

        if (win.isDialog == true) {
            //hide dialog modal background
        }
    },

    maximize: function (id) {

    }


}