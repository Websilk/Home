(function () {

    S.editor.textEditor = {
        toolbar: $('.text-toolbar'),
        revert: '',

        init: function () {
            //add editor menu button to component select menu
            S.editor.components.select.menu.add($('#template_select_menu_texteditor').html(), 'texteditor', ['texteditor'], S.editor.textEditor.show, S.editor.textEditor.hide);
            //configure rangy
            rangy.config.preferTextRange = true;
            rangy.createMissingNativeApi();
        },

        show: function (e) {
            var self = S.editor.textEditor;
            self.align();
            self.toolbar.show();

            e[0].contentEditable = 'true';
            S.editor.textEditor.revert = e.html();

            //add event for detecting select refresh & window resize
            S.editor.components.select.events.refresh.add('texteditor', self.align);

            //add event for text editor keyup
            $(document).on('keyup', S.editor.textEditor.keyup);

            //add event for detecting save button press
            S.editor.save.events.save.add('texteditor', self.save);
        },

        hide: function (e) {
            var self = S.editor.textEditor;
            self.save();
            S.editor.components.select.events.refresh.remove('texteditor');
            S.editor.save.events.save.remove('texteditor', self.save);
            self.toolbar.hide();
            e[0].removeAttribute('contentEditable');
            $(document).off('keyup', S.editor.textEditor.keyup);
        },

        save: function () {
            var self = S.editor.textEditor;
            var e = S.editor.components.selected;
            var html = e.html();
            if (html != self.revert) {
                S.editor.save.add(e[0].id.substr(1), 'text', e.html());
            }
        },

        align: function () {
            var self = S.editor.textEditor;
            var e = S.editor.components.selected;
            var pos = e.offset();
            var win = S.window.pos();
            if (pos.left < 13) {
                pos.left = 13;
            }
            if (pos.top + win.scrolly < 50) {
                //show toolbar below component
                self.toolbar.css({ left: pos.left - 13, top: pos.top - 43 });
            } else {
                if (win.scrolly > pos.top - 100) {
                    //show toolbar at top of window
                    self.toolbar.css({ left: pos.left + 5, top: win.scrolly + 65 });
                } else {
                    //show toolbar at top of component
                    self.toolbar.css({ left: pos.left - 13, top: pos.top - 43 });
                }
            }
        },

        keyup: function (e) {
            var k = e.keyCode;
            S.editor.textEditor.align();
            S.editor.components.select.refresh();
        }
    };

    S.editor.textEditor.init();
})();