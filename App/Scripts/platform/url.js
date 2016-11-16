S.url = {
    nopush: false, last: '',

    load: function (url) {
        //loads the url either by an AJAX call or by redirecting the user (if History API isn't supported)
        if (!history) {
            //browser doesn't support history API
            location.href = url;
            return;
        }
        //post page request via Ajax
        if (S.page.type == 1 && url.indexOf(S.page.path) == 0 && S.page.path != '') {
            //load subpage content for static page
            S.ajax.post('App/StaticUrl', { url: url }, function (d) {
                S.ajax.callback.inject(d);
                S.events.url.callback.execute();
            });
        } else {
            S.ajax.post('App/Url', { url: url }, S.ajax.callback.pageRequest);
        }
        

        return false;
    },

    goBack: function () {
        window.history.back();
    },

    push: function (title, url) {
        //push a url into the browser's history (without redirecting the user)
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
        S.events.url.callback.execute();
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