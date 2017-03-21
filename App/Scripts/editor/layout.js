S.editor.layout = {
    show: function () {
        //view layout editor
        var scaffold = new S.scaffold($('#template_layout_dialog').html(), {});

        //show toolbar dialog
        S.editor.toolbar.dialog.show(scaffold.render());

        //set up button events
        $('#layout_list').on('change', function () { S.editor.layout.change(); });
        $('.editor .toolbar .dialog .button-done a').on('click', function () { S.editor.layout.hide(); });

        //set up window resize event
        S.events.doc.resize.callback.add('layout', S.editor.layout.outlines.resize, S.editor.layout.outlines.resize, S.editor.layout.outlines.resize);

        //display layout area outlines
        this.outlines.create();
        
        //setup button events for area options
        $('.layout-area .btn-change').on('click', S.editor.layout.change.dialog);
        $('.layout-area .btn-add').on('click', S.editor.layout.add.dialog);

    },

    hide: function () {
        //hide layout editor
        S.editor.toolbar.dialog.hide();
        //hide layout area outlines
        if (S.editor.layout.outlines){
            S.editor.layout.outlines.remove();
        }
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
            $('body').addClass('show-blocks');

            //generate panel outlines
            for (var x = 0; x < this.areas.length; x++) {
                area = $(this.areas.get(x));
                pos = area.position();
                pos.width = area.width();
                pos.height = area.height();
                div = document.createElement('div');
                id = area.get().id.replace('panel_page_','');
                div.id = 'area_' + id;
                div.className = 'layout-area';
                opts = {
                    name: area.attr('data-area') + ' Area, ' +
                          area.attr('data-block') + ' Block',
                    id: id,
                    area: area.attr('data-area')
                }
                scaff = new S.scaffold(htm, opts);
                div.innerHTML = scaff.render();
                console.log({ left: pos.left, top: pos.top, width: pos.width, height: pos.height });
                $(div).css({ left: pos.left, top: pos.top, width: pos.width, height: pos.height });
                tmp.append(div);
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
                div = $('#area_' + area.get().id.replace('panel_page_', ''));
                div.css({ left: pos.left, top: pos.top, width: pos.width, height: pos.height });
            }
        },

        remove: function () {
            $('.editor .temp .layout-area').remove();
            $('body').removeClass('show-blocks');
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
            var opt = $(this).parent('.options');
            var id = opt.attr('data-id');
            var area = opt.attr('data-area');
            var html = $('#template_layout_addblock').html().replace('#id#', id).replace('#area#', area);
            var options = {
                offsetTop: '25%',
                width:300
            };
            S.popup.show('Add Block', html, options);

            //get list of blocks for this area
            S.ajax.post('Editor/Page/GetBlocksList', { area: id },
                function (data) {
                    $('#block_list').html(data.d);
                    S.editor.layout.add.blockList.change();
                }
            );
            $('#block_list').on('change', S.editor.layout.add.blockList.change);
            $('.popup .btn-done a').on('click', S.editor.layout.add.save);
        },

        blockList:{
            change: function () {
                if ($('#block_list').val() == '0') {
                    //show New Block fields
                    $('.add-new-block').removeClass('hide');
                } else {
                    //hide New Block fields
                    $('.add-new-block').addClass('hide');
                }
            }
        },

        save: function () {
            //load a new or existing block onto the page
            var id = $(this).parents('.add-block').attr('data-id');
            var data = {
                blockId: $('#block_list').val(),
                name: $('#block_name').val(),
                area:id
            }

            //validate
            if (data.blockId == '0' && data.name == '') {
                //name required

                return false;
            }

            //load block onto page via AJAX
            S.ajax.post('Editor/Page/AddBlock', data,
                function (data) {
                    $('#block_list').html(data.d);
                    S.editor.layout.add.blockList.change();
                }
            );
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