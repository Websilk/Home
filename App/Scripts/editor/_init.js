S.editor.init = function () {
    //initialize the editor
    S.editor.enabled = true;
    S.editor.save.disable();

    if (this.visible == true) {
        S.editor.show();
    } else {
        S.editor.hide();
    }

    //set up button click events
    $('.tooltab a').on('click', S.editor.show);

    $('.editor .toolbar .menu .icon.plus').on('click', function () {
        //show Components modal window
        S.editor.window.load('Components', {
            left: 0, top: 0, width: 124, height: 100, title: '', url: 'Editor/Components/Load', alignTo: 'top-left',
            onUrlLoad: function () {
                S.editor.components.list.init();
            }
        });
    });

    $('.editor .toolbar .menu .icon.grid').on('click', function () {
        //show Dashboard modal window
        S.editor.window.load('Dashboard', {
            left: 0, top: 0, width: 300, height: 100, title: '', html: $('#template_dashboard').html(),
            alignTarget: this, alignTo: 'bottom-center', alignAt: 'top-center', alignPadding: 15, hasArrow: true,
            hasTitleBar: false, canDrag: false, isMenu: true, autoHide: true, 
            onLoad: function () {
                //set up dashboard model window button events
                S.editor.dashboard.init();
            }
        });
    });
    $('.editor .toolbar .menu .icon.screens').on('contextmenu', function (e) {
        e.preventDefault();
    });
    $('.editor .toolbar .menu .icon.screens').on('mouseup', function (e) {
        switch (e.which) {
            case 1:
                S.viewport.next();
                break;
            case 3:
                S.viewport.previous();
                break;
        }
        return false;
    });

    $('.editor .toolbar .menu .icon.search').on('click', function () {
        //show Documentation modal window
        S.editor.support.glossary();
    });

    $('.editor .save-page a').on('click', function () { S.editor.save.click.call(S.editor.save); });

    //set up component events
    S.editor.components.select.init();
    S.editor.components.hover.init();

    //set up key press & key up events
    document.onkeydown = S.hotkeys.keydown;
    document.onkeyup = S.hotkeys.keyup;

    //set up document events
    $(document.body).on('mousedown', function (e) { S.events.doc.mousedown.trigger(e.target); });
    $(document.body).on('click', function (e) { S.events.doc.click.trigger(e.target); });
    S.events.doc.click.callback.add($('.editor .component-select').get(), function (target, type) { S.editor.components.click(target, type); });
    S.events.doc.click.callback.add($('.editor .windows').get(), function (target, type) { S.editor.window.click(target, type); });
}

S.editor.init();