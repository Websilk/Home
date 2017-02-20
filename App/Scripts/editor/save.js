S.editor.save = { 
    cache: [],

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

    click: function () {
        if ($('.editor .toolbar .save-page').hasClass('saving') == false && $('.editor .toolbar .save-page').hasClass('nosave') == false) {
            var options = {};
            options.save = JSON.stringify(this.cache);
            this.cache = [];
            $('.editor .toolbar .save-page').addClass('saving');
            S.ajax.post("/api/Edit/SaveChanges", options, function () {
                $('.editor .toolbar .save-page').removeClass('saving').addClass('nosave');
                S.ajax.expire = new Date();
                S.ajax.keepAlive();
            });
        }
    }
}