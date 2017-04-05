S.editor.support = {
    search: function (keywords) {
        S.editor.support.load('Search', { page: 'search', keywords: keywords });
    },

    glossary: function () {
        S.editor.support.load('Get', { page: 'glossary' });
    },

    page: function (name) {
        S.editor.support.load('Get', { page: name });
    },

    load(action, data) {
        S.editor.window.load('Documentation', { left: 0, top: 0, width: 640, maxHeight: 800, title: '', url: 'Editor/Support/' + action, data:data, alignTo: 'top-right'});
    }
};