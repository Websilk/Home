S.editor.toolbar = {
    height: 50,

    dialog: {
        show: function (html) {
            //hide Editor UI elements
            $('.editor .toolbar .container nav.menu').hide();
            S.editor.window.hideMenus();
            S.editor.components.select.hide();
            S.editor.components.hover.hide();

            //show toolbar dialog
            $('.editor .toolbar .container .dialog').html(html).show();
        },

        hide: function () {
            $('.editor .toolbar .container .dialog').html('').hide();
            $('.editor .toolbar .container nav.menu').show();
        }
    }
}