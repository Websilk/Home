S.editor.init = function () {
    //initialize the editor
    S.editor.enabled = true;
    if (this.visible == true) {
        S.editor.show();
    } else {
        S.editor.hide();
    }

    //set up button click events
    $('.toolbar .menu .icon.plus').on('click', function () {
        //show Components modal window
        S.editor.window.load('Components', {
            left: 0, top: 0, width: 142, height: 100, title: 'Components',
            onLoad: function () {
                //load initial components list from server
            }
        });
    });
}

S.editor.show = function () {
    $('.tooltab').hide();
    $('.editor').show();
}

S.editor.hide = function () {
    $('.editor').hide();
    $('.tooltab').show();
}

S.editor.toolbar = {
    height:50
}