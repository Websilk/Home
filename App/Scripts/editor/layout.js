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
        $('.layout-area .btn-change a').on('click', S.editor.layout.change.dialog);
        $('.layout-area .btn-add a').on('click', S.editor.layout.add.dialog);
        $('.layout-area .btn-remove a').on('click', S.editor.layout.remove);
        $('.layout-area .btn-sort-up').not('.disabled').on('click', S.editor.layout.sort.up);
        $('.layout-area .btn-sort-down').not('.disabled').on('click', S.editor.layout.sort.down);
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
            var index = 0;
            var ispagelvl = false;
            //update body tag
            $('body').addClass('show-blocks');

            //generate panel outlines
            for (var x = 0; x < this.areas.length; x++) {
                area = $(this.areas.get(x));
                pos = area.position();
                pos.width = area.width();
                pos.height = area.height();
                div = document.createElement('div');
                id = area.get().id;
                index = area.index();
                total = area.parent().children().length;
                console.log(total);
                ispagelvl = area.attr('data-page-level') === 'true';
                div.id = 'area_' + id.replace('panel_','');
                div.className = 'layout-area';
                opts = {
                    'area-name': '<b>' + area.attr('data-area') + '</b> Area',
                    'block-name': '<b>' + area.attr('data-block') + '</b> Block',
                    id: id,
                    area: area.attr('data-area'),
                    block: area.attr('data-block-id'),
                    'color': ispagelvl ? 'green' : 'blue'
                }
                scaff = new S.scaffold(htm, opts);
                div.innerHTML = scaff.render();
                var d = $(div);
                if (ispagelvl) {
                    //block is a page-level block and cannot be removed
                    d.find('.btn-change, .btn-remove, .sort-btns').hide();
                }
                if (index == 0) { d.find('.btn-sort-up').css({ opacity: 0.3, cursor:'default' }).addClass('disabled'); }
                if (index == total - 1) { d.find('.btn-sort-down').css({ opacity: 0.3, cursor: 'default' }).addClass('disabled'); }
                d.css({ left: pos.left, top: pos.top, width: pos.width, height: pos.height });
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
                div = $('#area_' + area.get().id.replace('panel_', ''));
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

        dialog: function (changeOnly) {
            //show a dialog so the user can add a block to the page 
            //by creating a new block or loading an existing block
            var opt = $(this).parents('.options');
            var id = opt.attr('data-id');
            var area = opt.attr('data-area');
            var index = $('#' + id).index()+1;
            var scaffold = new S.scaffold($('#template_layout_addblock').html(), {
                id: id, area: area, index: index
            });
            var options = {
                offsetTop: '25%',
                width:300
            };
            S.popup.show(changeOnly === true ? 'Change Existing Block' : 'Add Block', scaffold.render(), options);

            if (changeOnly === true) {
                $('.popup .add-block').attr('data-change-only', 'true');
            }

            //get list of blocks for this area
            S.ajax.post('Editor/Page/GetBlocksList', { area: area.toLowerCase() },
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
            var opt = $('.popup .add-block');
            var id = opt.attr('data-id');
            var area = opt.attr('data-area');
            var index = opt.attr('data-index');
            var changeOnly = opt.attr('data-change-only') === 'true';
            var data = {
                blockId: $('#block_list').val(),
                name: $('#block_name').val(),
                insertAt: index,
                area:area
            }

            //validate
            if (data.blockId == '0' && data.name == '') {
                //name required
                return false;
            }

            //load block onto page via AJAX
            S.ajax.post(changeOnly === true ? 'Editor/Page/ChangeBlock' : 'Editor/Page/AddBlock', data,
                function (data) {
                    if (data.d == 'error') {
                        alert('an error has occurred');
                        return;
                    }
                    if (data.d == 'duplicate') {
                        alert('This block is already loaded onto the page');
                        return;
                    }
                    //load new block onto the page
                    $('#' + id).addClass('has-siblings').after(data.d);

                    if (changeOnly === true) {
                        $('#' + id).remove();
                    }
                    S.popup.hide();
                    S.editor.layout.hide();
                    S.editor.layout.show();
                }
            );
        }
    },

    remove: function () {
        //load a new or existing block onto the page
        if (!confirm('Do you really want to remove this block from the page?')) { return false; }

        var opt = $(this).parents('.options');
        var blockid = opt.attr('data-block-id');
        var id = opt.attr('data-id');
        var area = opt.attr('data-area');
        var data = {
            blockId: blockid,
            area: area
        }

        //load block onto page via AJAX
        S.ajax.post('Editor/Page/RemoveBlock', data,
            function (data) {
                if (data.d == 'error') {
                    alert('an error has occurred');
                    return;
                }
                //remove existing block from the page
                var parent = $('#' + id).parent();
                $('#' + id).remove();
                if (parent.children().length == 1) {
                    parent.children().removeClass('has-siblings');
                }
                S.editor.layout.hide();
                S.editor.layout.show();
            }
        );
    },

    sort: {
        up: function(){
            S.editor.layout.sort.direction.call(this, 'up');
        },

        down: function(){
            S.editor.layout.sort.direction.call(this, 'down');
        },

        direction: function(dir){
            var opt = $(this).parents('.options');
            var blockid = opt.attr('data-block-id');
            var id = opt.attr('data-id');
            var elem = $('#' + id);
            var area = opt.attr('data-area');
            var index = elem.index();
            var data = {
                blockId: blockid,
                area: area,
                index: index,
                direction: dir //up or down
            }

            //load block onto page via AJAX
            S.ajax.post('Editor/Page/MoveBlock', data,
                function (d) {
                    if (d.d == 'error') {
                        alert('an error has occurred');
                        return;
                    }

                    //move block up or down
                    var parent = $('#' + id).parent();
                    var len = parent.children().length - 1;
                    if (index == 0 && dir == 'down') {
                        parent.children(1).after(elem.get());
                    } else if (index < len - 1 && dir == 'down') {
                        parent.children(index + 1).after(elem.get());
                    } else if (index == len - 1 && dir == 'down') {
                        parent.append(elem.get());
                    } else if (index == len - 1 && dir == 'up') {
                        parent.children(index - 1).before(elem.get());
                    } else if (index > 1 && dir == 'up') {
                        parent.children(index - 1).before(elem.get());
                    } else if (index == 1 && dir == 'up') {
                        parent.prepend(elem.get());
                    }

                    //display a glowing border to show the user where the item moved to
                    var pos = elem.position();
                    pos.width = elem.width();
                    pos.height = elem.height();
                    var tmp = $('.editor .temp');
                    var div = document.createElement('div');
                    div.className = 'block-moved-border';
                    tmp.append(div);
                    $(div).animate({ opacity: 0, duration: 2000 });
                    //$(div).animate()

                    S.editor.layout.hide();
                    S.editor.layout.show();
                }
            );
        }
    },

    change: {
        dialog: function(){
            //show a list of blocks the user can select from 
            //with the option to create a new block
            S.editor.layout.add.dialog.call(this, true);
        },

        save: function () {
            var data = {
                layout: $('#layout_list').val()
            }
        }

    }

}