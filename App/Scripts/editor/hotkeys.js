S.hotkeys = {
    keyhold: '',
    keydown: function (e) {
        if ($("input, textarea").is(":focus") == false && $('.component[contentEditable]').length == 0) {
            var k = e.keyCode, itemId = '', isPanel = false, c = null;
            if (S.editor.components.hovered != null) {
                c = S.editor.components.hovered;
                itemId = c.get().id.substr(1);
                if (c.hasClass('type-panel') == true) { isPanel = true; }
            }

            if (e.shiftKey == true) {//shift pressed
                S.hotkeys.keyhold = 'shift';
                S.hotkeys.callback.execute('onKeyDown', k, 'shift');
                switch (k) { //execute code for single key + shift press
                    case 38: //up
                        S.editor.components.nudge('up', 10);
                        break;
                    case 39: //right
                        S.editor.components.nudge('right', 10);
                        break;
                    case 40: //down
                        S.editor.components.nudge('down', 10);
                        break;
                    case 37: //left
                        S.editor.components.nudge('left', 10);
                        break;
                    case 49: //1
                        S.viewport.speed = 0;
                        break;
                    case 50: //2
                        S.viewport.speed = 1;
                        break;
                    case 51: //3
                        S.viewport.speed = 3;
                        break;
                    case 52: //4
                        S.viewport.speed = 9;
                        break;
                    case 53: //5
                        S.viewport.speed = 12;
                        break;
                    case 54: //6
                        S.viewport.speed = 18;
                        break;
                    case 55: //7
                        S.viewport.speed = 25;
                        break;
                    case 56: //8
                        S.viewport.speed = 35;
                        break;
                    case 57: //9
                        S.viewport.speed = 50;
                        break;
                    case 48: //0
                        S.viewport.speed = 100;
                        break;
                }

            } else if (e.ctrlKey == true) {
                S.hotkeys.keyhold = 'ctrl';
                S.hotkeys.callback.execute('onKeyDown', k, 'ctrl');
                switch (k) {
                    case 67: //c (copy)
                        return false;
                    case 86: //v (paste)
                        return false;
                    case 88: //x (cut)
                        break;
                    case 89: //y (redo)
                        break;
                    case 90: //z (undo);
                        break;

                }

            } else { //no shift, ctrl, or alt pressed
                S.hotkeys.keyhold = '';
                S.hotkeys.callback.execute('onKeyDown', k, '');
                switch (k) {
                    case 27: //escape
                        if (!S.editor.visible) {
                            S.editor.show();
                        } else {
                            //hide different UI elements in order
                            if (!$('body > .for-popup').hasClass('hide')) {
                                //hide popup
                                S.popup.hide();
                            } else if ($('.editor .toolbar .dialog')[0].style.display != 'none') {
                                //hide layout dialog
                                S.editor.layout.hide();
                            } else {
                                //hide editor
                                S.editor.hide();
                            }
                        }
                        break;
                    case 38: //up
                        S.editor.components.nudge('up', 1);
                        break;
                    case 39: //right
                        S.editor.components.nudge('right', 1);
                        break;
                    case 40: //down
                        S.editor.components.nudge('down', 1);
                        break;
                    case 37: //left
                        S.editor.components.nudge('left', 1);
                        break;
                    case 46: //backspace
                        S.editor.components.remove();
                        break;
                    case 49: //1
                        S.viewport.view(0);
                        break;
                    case 50: //2
                        S.viewport.view(1);
                        break;
                    case 51: //3
                        S.viewport.view(2);
                        break;
                    case 52: //4
                        S.viewport.view(3);
                        break;
                    case 53: //5
                        S.viewport.view(4);
                        break;
                }
            }

            if (k >= 37 && k <= 40) { //arrow keys
                if ($('.type-textbox .textedit.editing').length == 0) {
                    return false;
                }

            }

        }
    },

    keyup: function (e) {
        var k = e.keyCode;
        S.hotkeys.keyhold = '';
        if (e.shiftKey == true) {//shift pressed
            S.hotkeys.callback.execute('onKeyUp', k, 'shift');

        } else if (e.ctrlKey == true) {
            S.hotkeys.callback.execute('onKeyUp', k, 'ctrl');

        } else {
            S.hotkeys.callback.execute('onKeyUp', k, '');
        }
    },

    callback: {
        //register & execute callbacks when the window resizes
        items: [],

        add: function (elem, onKeyDown, onKeyUp) {
            this.items.push({ elem: elem, onKeyDown: onKeyDown, onKeyUp: onKeyUp });
        },

        remove: function (elem) {
            for (var x = 0; x < this.items.length; x++) {
                if (this.items[x].elem == elem) { this.items.splice(x, 1); x--; }
            }
        },

        execute: function (type, key, keyHeld) {
            if (this.items.length > 0) {
                switch (type) {
                    case '': case null: case 'onKeyDown':
                        for (var x = 0; x < this.items.length; x++) {
                            if (typeof this.items[x].onKeyDown == 'function') {
                                this.items[x].onKeyDown(key, keyHeld);
                            }
                        } break;

                    case 'onKeyUp':
                        for (var x = 0; x < this.items.length; x++) {
                            if (typeof this.items[x].onKeyUp == 'function') {
                                this.items[x].onKeyUp(key, keyHeld);
                            }
                        } break;
                }
            }
        }
    }
};