S.editor.resize = {
    start: function () {
        S.editor.resize.run();
        S.editor.components.hover.hide();
    },

    go: function () {
        S.editor.resize.run();
    },

    end: function () {
        S.editor.resize.run();
    },

    run: function () {
        S.editor.components.select.refresh();
        S.editor.window.repositionAll();
    }
};