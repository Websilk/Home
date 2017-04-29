S.editor.save = {
    cache: [], _changes: false,

    hasChanges: function (has) {
        if (has === true) {
            this._changes = true;
            this.enable();
        } else {
            return this._changes;
        }
    },

    add: function (id, type, obj) {
        var i = -1;
        for (x = 0; x < this.cache.length; x++) {
            if (this.cache[x].id == id && this.cache[x].type == type) {
                i = x; break;
            }
        }
        if (i == -1) {
            i = this.cache.length;
        }
        this.cache[i] = { id: id, type: type, data: obj };
        $('.editor .toolbar .save-page').removeClass('nosave');
    },

    enable: function () {
        $('.editor .toolbar .save-page').removeClass('nosave');
    },

    disable: function () {
        $('.editor .toolbar .save-page').addClass('nosave');
    },

    click: function () {
        if ($('.editor .toolbar .save-page').hasClass('saving nosave saved') == false) {
            var options = {};
            options.changes = JSON.stringify(this.cache);
            this.cache = [];
            $('.editor .toolbar .save-page').addClass('saving');
            S.ajax.post("Editor/Page/SaveChanges", options, function () {
                $('.editor .toolbar .save-page').removeClass('saving').addClass('saved');
                setTimeout(function () {
                    $('.editor .toolbar .save-page').removeClass('saved').addClass('nosave')
                }, 2000);
            });
        }
    }
};