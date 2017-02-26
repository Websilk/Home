S.editor.layout = {
    show: function () {
        //view layout editor
        var vars = {

        };
        var scaffold = new S.scaffold($('#template_layout_dialog').html(), vars);

        //show toolbar dialog
        S.editor.toolbar.dialog.show(scaffold.render());

        //set up button events
        $('#layout_list').on('change', function () { S.editor.layout.change(); });
        $('.editor .toolbar .dialog .button-done a').on('click', function () { S.editor.layout.hide(); });

        //set up window resize event
        S.events.doc.resize.callback.add('layout', S.editor.layout.outlines.resize, S.editor.layout.outlines.resize, S.editor.layout.outlines.resize);

        //display layout area outlines
        this.outlines.create();
    },

    hide: function () {
        //hide layout editor
        S.editor.toolbar.dialog.hide();
        //hide layout area outlines
        S.editor.layout.outlines.remove();
        //remove window resize event
        S.events.doc.resize.callback.remove('layout');
    },

    outlines: {
        areas:null,
        create: function () {
            //display outline around all layout panels 
            this.areas = $('.is-panel.is-block');
            var tmp = $('.editor .temp');
            var pos = {};
            var area = null;
            var div = null;
            var htm = $('#template_layout_options').html();
            var scaff = null;
            var opts = {};
            var id = '';
            //update body tag
            $('body').addClass('show-empty-cells');

            //generate panel outlines
            for (var x = 0; x < this.areas.length; x++) {
                area = $(this.areas.get(x));
                pos = area.position();
                pos.width = area.width();
                pos.height = area.height();
                div = document.createElement('div');
                id = 'area_' + area.get().id;
                div.id = id;
                div.className = 'layout-area';
                opts = {
                    name: area.get().getAttribute('data-area') + ' Area, ' +
                          area.get().getAttribute('data-block') + ' Block'
                }
                scaff = new S.scaffold(htm, opts);
                div.innerHTML = scaff.render();

                $(div).css({ left: pos.left, top: pos.top, width: pos.width, height: pos.height });
                tmp.append(div);

                //setup button events for area options
                $('#' + id + ' .btn-change').on('click', S.editor.layout.change.dialog);
            }
        },

        resize: function () {
            //resize area outlines when window resizes
            var areas = S.editor.layout.outlines.areas;
            for (var x = 0; x < areas.length; x++) {
                area = $(areas.get(x));
                pos = area.position();
                pos.width = area.width();
                pos.height = area.height();
                div = $('#area_' + area.get().id);
                div.css({ left: pos.left, top: pos.top, width: pos.width, height: pos.height });
            }
        },

        remove: function () {
            $('.editor .temp .layout-area').remove();
            $('body').removeClass('show-empty-cells');
        }

    },

    block: {
        list: function(){
            //get a list of existing blocks
        }
    },

    add: {
        dialog: function () {
            //show a dialog so the user can add a block to the page 
            //by creating a new block or loading an existing block
        },

        save: function () {
            //save the new block name & load the block onto the page
        }
    },

    change: {
        dialog: function(){
            //show a list of blocks the user can select from 
            //with the option to create a new block
        },

        save: function () {
            var data = {
                layout: $('#layout_list').val()
            }
        }

    }

}