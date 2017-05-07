S.viewport.resize = function (width) {
    var webpage = $('.webpage');
    if (webpage.css('maxWidth') == '' || webpage.css('maxWidth') == 'none') {
        webpage.css({ 'maxWidth': webpage.width() });
    }
    webpage.stop().animate({ maxWidth: width }, {
        duration: this.speed * 1000,
        progress: function () {
            if (S.viewport.getLevel() == true) {
                S.viewport.levelChanged(S.viewport.level);
            }
            S.events.doc.resize.trigger();
        },
        complete: function () {
            S.events.doc.resize.trigger();
            S.viewport.getLevel();
            if (S.viewport.isChanging == true) {
                S.viewport.isChanging = false;
                if (S.editor.enabled == true) {
                    S.editor.components.hover.enable();
                }
                S.viewport.levelChanged(S.viewport.level);
            } else {
                if (S.editor.enabled == true) {
                    S.editor.components.select.refresh();
                }
            }
        }
    });
};

S.viewport.view = function (level) {
    //hide selected components
    S.editor.components.hover.disable();
    switch (level) {
        case 4: //HD
            S.viewport.resize('100%'); break;

        default: //all other screen sizes
            S.viewport.resize(S.viewport.levels[level]); break;
    }
    S.viewport.isChanging = false;
    S.viewport.levelChanged(level)
    S.viewport.isChanging = true;
};

S.viewport.levelChanged = function (level) {
    if (S.viewport.isChanging == true) { return; }
    S.viewport.sizeIndex = level;
    var screen = 'HD', ext = 'hd';
    switch (level) {
        case 4: //HD
            screen = 'HD'; ext = 'hd'; break;

        case 3: //Desktop
            screen = 'Desktop'; ext = 'desktop'; break;

        case 2: //Tablet
            screen = 'Tablet'; ext = 'tablet'; break;

        case 1: //Mobile Device
            screen = 'Mobile Device'; ext = 'mobile'; break;

        case 0: //Cell Phone
            screen = 'Cell Phone'; ext = 'cell'; break;

    }
    $('.toolbar .menu .screens use').attr('xlink:href', '#icon-screen' + ext)

    //rename screen size labels
    $('span.lbl-screen-size').html(screen);
};

S.viewport.next = function () {
    if (S.editor.enabled == false) { return; }
    var sizeIndex = S.viewport.sizeIndex;
    if (sizeIndex == -1) {
        sizeIndex = S.viewport.level;
    }
    var next = sizeIndex > 0 ? sizeIndex - 1 : 4;
    S.viewport.view(next);
};

S.viewport.previous = function () {
    if (S.editor.enabled == false) { return; }
    var sizeIndex = S.viewport.sizeIndex;
    if (sizeIndex == -1) {
        sizeIndex = S.viewport.level;
    }
    var prev = sizeIndex < 4 ? sizeIndex + 1 : 0;
    S.viewport.view(prev);
};

S.viewport.getLevelOrder = function () {
    this.getLevel();
    var lvl = this.level;
    switch (lvl) {
        case 0:
            return [0, 1, 2, 3, 4];
        case 1:
            return [1, 2, 0, 3, 4];
        case 2:
            return [2, 3, 4, 1, 0];
        case 3:
            return [3, 4, 2, 1, 0];
        case 4:
            return [4, 3, 2, 1, 0];
    }
};

S.viewport.indexFromLevelOrder = function(arr){
    //get index of a given array that
    //corresponds with the current level order
    var lvls = S.viewport.getLevelOrder();
    for (var x = 0; x < lvls.length; x++) {
        if (arr[lvls[x]] != null) { return lvls[x];}
    }
    return -1;
};