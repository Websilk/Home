/// Websilk Platform : platform.js ///
var S = {
    init: function (ajax, pageid, title, tabTitle, websiteId, websiteTitle) {
        S.page.useAjax = ajax;
        S.page.update(id, title, tabTitle);
        S.website.id = websiteId;
        S.website.title = websiteTitle;
        S.viewport.getLevel();
    },

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

    elem: {
        pos: function (elem) {
            var x = 0, y = 0, w = 0, h = 0;
            if (typeof elem != 'undefined' && elem != null) {
                var e = elem;
                while (e.offsetParent) {
                    x += e.offsetLeft + (e.clientLeft || 0);
                    y += e.offsetTop + (e.clientTop || 0);
                    e = e.offsetParent;
                }
                w = elem.offsetWidth ? elem.offsetWidth : elem.clientWidth;
                h = elem.offsetHeight ? elem.offsetHeight : elem.clientHeight;
                if (h == 0) { h = $(elem).height(); }
            }
            return { x: x, y: y, w: w, h: h };
        },

        offset: function (elem) {
            return {
                y: elem.offsetTop ? elem.offsetTop : elem.clientTop,
                x: elem.offsetLeft ? elem.offsetLeft : elem.clientLeft,
                w: elem.offsetWidth ? elem.offsetWidth : elem.clientWidth,
                h: elem.offsetHeight ? elem.offsetHeight : elem.clientHeight
            }
        },

        top: function (elem) {
            return elem.offsetTop ? elem.offsetTop : elem.clientTop;
        },

        width: function (elem) {
            return elem.offsetWidth ? elem.offsetWidth : elem.clientWidth;
        },

        height: function (elem) {
            return elem.offsetHeight ? elem.offsetHeight : elem.clientHeight;
        }
    },

    css: {
        add: function (id, css) {
            $('#css' + id).remove();
            $('head').append('<style id="css' + id + '" type="text/css">' + css + "</style>");
        },

        remove: function (id) {
            $('head').remove('#css' + id);
        }
    },

    website: {
        id: 0, title: ''
    },

    page: {
        id: 0, title: '', useAjax: false,

        update: function (id, title, tabTitle) {
            S.page.id = id;
            S.page.title = title;
            window.document.title = tabTitle;
        }
    },

    layers: {
        cache: [],

        add: function (id, type, title) {
            for (x = 0; x < this.cache.length; x++) {
                if (this.cache[x].id == id) {
                    this.cache[x] = { id:id, type:type, title:title };
                    return;
                }
            }
            this.cache.push({ pageId: pageId, title: title, pageType: pageType });
        }
    },

    editor: {
        selectedLayerId: '', editMode: false, enabled: false
    },

    lostSession: function () {
        alert('Your session has been lost. The page will now reload');
        location.reload();
    }
}