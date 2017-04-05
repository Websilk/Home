S.editor.support = {
    search: function (keywords) {
        S.editor.support.load('search', { page: 'search', keywords: keywords });
    },

    glossary: function () {
        S.editor.support.load('get', { page: 'glossary' });
    },

    page: function (name) {
        S.editor.support.load('get', { page: name });
    },

    load(action, data) {
        S.editor.window.load('Documentation', { left: 0, top: 0, width: 640, height: 800, title: '', url: 'Editor/Support/' + action, alignTo: 'top-right'});
    }
};