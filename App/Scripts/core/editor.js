S.editor.show = function () {
    $('.tooltab').hide();
    $('.editor > .fixed').show();
    $('.webpage').css({ 'padding-top': S.editor.toolbar.height });
    $('body').addClass('is-editing');
    S.editor.visible = true;

    //set up window resize event
    S.events.doc.resize.callback.add('editor', S.editor.resize.start, S.editor.resize.go, S.editor.resize.end);
    S.editor.resize.run();
}

S.editor.hide = function () {
    $('.editor > .fixed, .component-select, .component-hover').hide();
    $('.tooltab').show();
    $('.webpage').css({ 'padding-top': 0 });
    $('body').removeClass('is-editing');
    S.editor.visible = false;
    S.editor.components.hovered = null;
    S.editor.layout.hide();
    S.popup.hide();
    //remove window resize event
    S.events.doc.resize.callback.remove('editor');
}

