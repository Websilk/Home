S.viewport = {
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
};