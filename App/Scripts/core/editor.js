S.editor.init = function () {
    //initialize the editor
    S.editor.enabled = true;
    if (this.visible == true) {
        S.editor.show();
    } else {
        S.editor.hide();
    }

    //set up button click events
    $('.editor .toolbar .menu .icon.plus').on('click', function () {
        //show Components modal window
        S.editor.window.load('Components', {
            left: 0, top: 0, width: 124, height: 100, title: '', url: 'Editor/Components/Load',
            onUrlLoad: function () {
                S.editor.components.list.init();
            }
        });
    });

    //set up key press & key up events
    document.onkeydown = S.hotkeys.keydown;
    document.onkeyup = S.hotkeys.keyup;
}

S.editor.show = function () {
    $('.tooltab').hide();
    $('.editor').show();
    $('.webpage').css({ 'padding-top': S.editor.toolbar.height });
    $('body').addClass('is-editing');
    S.editor.visible = true;
}

S.editor.hide = function () {
    $('.editor').hide();
    $('.tooltab').show();
    $('.webpage').css({ 'padding-top': 0 });
    $('body').removeClass('is-editing');
    S.editor.visible = false;
}

S.editor.toolbar = {
    height:50
}