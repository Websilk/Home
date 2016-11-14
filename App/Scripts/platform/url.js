S.url = {
    nopush: false, last: '',

    load: function (url) {
        if (!history) {
            //browser doesn't support history API
            location.href = url;
            return;
        }
        //first, check for a special url
        var u = url.split('+')[0];;
        var urls = u.split('/');
        var words = S.url.special.words;
        if (words.length > 0) {
            for (var x in words) {
                if (urls[0].toLowerCase() == words[x].word.toLowerCase()) {
                    //found special url, skip ajax post
                    if (arguments.length == 2) {
                        S.url.last = url;
                    }
                    S.url.push(u, url);
                    S.url.nopush = true;
                    words[x].callback(u);
                    setTimeout(function () { S.url.nopush = false; }, 1000);
                    return false;
                }
            }
        }
        //post page request via Ajax
        S.ajax.post('App/Url', { url: url }, S.ajax.callback.pageRequest);

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

    special: {
        words: [],

        add: function (word, callback) {
            var words = S.url.special.words;
            for (x = 0; x < words.length; x++) { if (words[x].word == word) { return false; } }
            S.url.special.words.push({ word: word, callback: callback });
        }
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