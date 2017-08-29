S.page = {
    id: 0, type: 0, path: '', title: '', useAjax: false, theme: '',

    update: function (id, type, path, title, tabTitle, theme) {
        this.id = id;
        this.type = type;
        this.path = path;
        this.title = title;
        this.theme = theme;
        window.document.title = tabTitle;
    }
};