S.popup = {
    elem: null, options: null,

    show: function (title, html, options) {
        if (options == null) { options = {}; }
        var opts = {
            width: options.width != null ? options.width : 300,
            padding: options.padding != null ? options.padding : 0,
            offsetHeight: options.offsetHeight != null ? options.offsetHeight : 0,
            offsetTop: options.offsetTop != null ? options.offsetTop : 0,
            position: options.position != null ? options.position : 'center'
        };
        this.options = opts;

        var div = document.createElement('div');
        var forpopup = $('body > .for-popup');
        var popup = $(div);
        div.className = 'popup box';

        popup.css({ width: opts.width });
        popup.addClass(opts.position);
        console.log(opts.offsetTop);
        if (opts.offsetHeight > 0) {
            popup.css({ Marginbottom: opts.offsetHeight });
        }
        if (opts.offsetTop.toString().indexOf('%') > 0) {
            popup.css({ top: opts.offsetTop });
        } else if (Number(opts.offsetTop) == opts.offsetTop) {
            if (opts.offsetTop > 0) {
                popup.css({ top: opts.offsetTop });
            }
        }
        if (opts.padding > 0) {
            forpopup.css({ padding: opts.padding });
        }

        popup.html(html);
        this.elem = popup;

        $('body > .for-popup .popup').remove();
        forpopup.append(div).removeClass('hide');

        //set up events
        S.events.doc.resize.callback.add('popup', S.popup.resize, S.popup.resize, S.popup.resize);

        S.popup.resize();
    },

    hide: function(){
        //remove events
        $('body > .for-popup').addClass('hide');
        S.events.doc.resize.callback.remove('popup');
    },

    resize: function () {
        var win = S.window.pos();
        var pos = S.popup.elem.position();
        pos.height = S.popup.elem.height();
        console.log(pos);
        console.log(win);
        S.popup.elem.css({ maxHeight: win.height - (S.popup.options.padding * 2), top: S.popup.options.offsetTop.toString().indexOf('%') > 0 ? S.popup.options.offsetTop : (win.h / 2) - (pos.height / 2) + S.popup.options.offsetTop });
    }
}