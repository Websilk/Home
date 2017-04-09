S.page = {
    id: 0, type: 0, path: '', title: '', useAjax: false,

    update: function (id, type, path, title, tabTitle) {
        this.id = id;
        this.type = type;
        this.path = path;
        this.title = title;
        window.document.title = tabTitle;
    }
};