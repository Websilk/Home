S.editor.debugger = {
    show: function (msg) {
        if ($('.editor .debugger').length > 0) {
            $('.editor .debugger').html(msg);
        } else {
            $('.editor > .fixed').append('<div class="debugger">' + msg + '</div>');
        }
    },

    hide: function () {
        $('.editor .debugger').hide();
    }
};