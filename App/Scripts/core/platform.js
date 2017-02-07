/// Websilk Platform : platform.js ///
var S = {
    window: {
        w: 0, h: 0, scrollx: 0, scrolly: 0, z: 0, changed: true,

        pos: function (scrollOnly) {
            if (this.changed == false && !scrollOnly) { return this; }
            this.changed = false;
            var w = window;
            var e = document.documentElement;
            var b = document.body;

            //get window scroll x & y positions
            this.scrollx = w.scrollX;
            this.scrolly = w.scrollY;
            if (typeof this.scrollx == 'undefined') {
                this.scrollx = b.scrollLeft;
                this.scrolly = b.scrollTop;
                if (typeof this.scrollx == 'undefined') {
                    this.scrollx = w.pageXOffset;
                    this.scrolly = w.pageYOffset;
                    if (typeof this.scrollx == 'undefined') {
                        this.z = GetZoomFactor();
                        this.scrollx = Math.round(e.scrollLeft / this.z);
                        this.scrolly = Math.round(e.scrollTop / this.z);
                    }
                }
            }
            if (scrollOnly) { return this; } //no need to update width & height

            //get windows width & height
            this.w = w.innerWidth || e.clientWidth || b.clientWidth;
            this.h = w.innerHeight || e.clientHeight || b.clientHeight;
            return this;
        }

    },

    viewport: {
        speed: 0, isChanging: false,
        levels: [350, 700, 1024, 1440, 9999], level: -1, sizeIndex: -1,
        levelNames: ['cell', 'mobile', 'tablet', 'desktop', 'hd'],

        getLevel: function () {
            var w = $('.webpage').width();
            for (x = 0; x < S.viewport.levels.length; x++) {
                if (w <= S.viewport.levels[x]) {
                    var changed = false;
                    if (S.viewport.level != x) { changed = true; }
                    S.viewport.level = x;
                    if (changed == true) {
                        var wp = $(document.body);
                        var size = S.viewport.levelNames[x];
                        if (wp.hasClass(size) == false) { wp.removeClass('s-cell s-mobile s-tablet s-desktop s-hd').addClass('s-' + size); }
                    }
                    return changed;
                }
            }
        }
    },

    website: {
        id: 0, title: '', protocol:'', host:''
    },

    page: {
        id: 0, type:0, path:'', title: '', useAjax: false,

        update: function (id, type, path, title, tabTitle) {
            S.page.id = id;
            S.page.type = type;
            S.page.path = path;
            S.page.title = title;
            window.document.title = tabTitle;
        }
    },

    editor: {
        visible: false, enabled: false
    },

    lostSession: function () {
        alert('Your session has been lost. The page will now reload');
        location.reload();
    }
}
