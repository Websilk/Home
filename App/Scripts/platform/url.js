S.url = {
    nopush: false, last: '',

    load: function (url) {
        if (!history) {
            //browser doesn't support history API
            location.href = url;
            return;
        }
        //post page request via Ajax
        if (S.page.type == 1 && url.indexOf(S.page.path) == 0 && S.page.path != '') {
            //load subpage content for static page
            S.ajax.post('App/StaticUrl', { url: url }, S.ajax.callback.inject);
        } else {
            S.ajax.post('App/Url', { url: url }, S.ajax.callback.pageRequest);
        }
        

        return false;
    },

    goBack: function () {
        window.history.back();
    },

    push: function (title, url) {
        if (!history) {
            //browser doesn't support history API
            return;
        }
        if (S.url.nopush == true) { return; }
        if (S.url.last == url) {
            history.replaceState(url, title, '/' + url);
            return;
        }
        history.pushState(url, title, '/' + url);
        S.url.last = url;
    },

    fromAnchor: function (e) {
        S.url.load(e.getAttribute("href").substr(1));
        return false;
    },

    checkAnchors: function () {
        if (!history) {
            //browser doesn't support history API
            return;
        }
        var anchors = $('a').filter(function () {
            if (this.getAttribute('href').indexOf('/') == 0) {
                if (!this.getAttribute('target')) {
                    return true;
                }
            }
            return false;
        }).each(function (e) {
            e.setAttribute('onclick', 'S.url.fromAnchor(this);return false;');
        });
    },

    domain: function () {
        return location.href.split('://')[0] + '://' + location.href.replace('http://', '').replace('https://', '').split('/')[0] + '/';
    }
};