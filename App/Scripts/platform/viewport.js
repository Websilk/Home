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
                    wp.removeClass('s-cell s-mobile s-tablet s-desktop s-hd');
                    for (var y = 4; y >= x; y--) {
                        var size = S.viewport.levelNames[y];
                        wp.addClass('s-' + size);
                    }
                }
                return changed;
            }
        }
    }
};