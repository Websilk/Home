var test = false;

S.editor.components = {
    hovered: null, selected: null, 

    // update editor-related properties for a component //////////////////////////////////////////////////////////
    update: function (id, resizeWidth, resizeHeight) {
        var c = S.components.items.find(function (a) { return a.id == id; });
        if (c != null) {
            c.canResizeWidth = resizeWidth;
            c.canResizeHeight = resizeHeight;
        }
    },

    // the list of components loaded within the component window /////////////////////////////////////////////////
    list: { 
        init: function(){
            //set up drag event for components window icons
            $('#winComponents .component-icon').each(function (e) {
                var a = S.editor.components.list.drag;
                S.drag.add(e, e, a.start, a.go, a.end, { useElemPos: true, callee: S.editor.components.list, speed: 1000 / 24 });
            });
        },

        drag: {
            start: function(item){
                //drag new component onto the page from the components window
                //clone component icon from window
                var clone = item.elem.cloneNode(true);
                $('.editor > .clone').append(clone);
                S.editor.components.select.hide();
                S.editor.components.hover.hide();
                S.editor.components.hover.isdragging = true;

                //override drag element object with clone
                item.dragElem = clone;

                //update body tag
                $('body').addClass('show-empty-cells');

                //start component tracking
                S.editor.components.track.drag.start.call(S.editor.components.track);
            },

            go: function (item) {
                S.editor.components.track.drag.go.call(S.editor.components.track, { left: item.cursor.x, top: item.cursor.y, right: item.cursor.x + 1, bottom: item.cursor.y + 1 });
            },

            end: function (item) {
                S.editor.components.track.drag.end();
                S.editor.components.hover.isdragging = false;

                //update body tag
                $('body').removeClass('show-empty-cells');

                //send an AJAX request to create the new component on the page
                var cid = '';
                var track = S.editor.components.track;
                if (track.component) { cid = track.component.id; }
                if (cid.length > 0) { cid = cid.substring(1);}
                var data = {
                    name: item.elem.getAttribute('data-id'),
                    layerId: S.page.id,
                    panelId: $(track.cell).parent('.is-panel').get(0).id.replace('panel_', ''),
                    cellId: track.cell.id.replace('cell_', ''),
                    componentId: cid,
                    append: track.drop === 'after' ? 1 : 0
                };
                S.ajax.post('Editor/Components/Create', data, function (d) {
                    S.ajax.callback.inject(d);
                    S.editor.components.hover.reinit(); //reinitialize component events
                    S.editor.save.add(d.newId, 'new', {});
                });
            }
        },
    },

    // the select box used for resizing components & modifying component properties //////////////////////////////
    select: { 
        elem:{
            compSel: $('.editor > .component-select'),
            compShield: $('.editor > .component-shield'),
            resize: {
                top: $('.editor > .component-select > .r-top'),
                topRight: $('.editor > .component-select > .r-top-right'),
                rightTop: $('.editor > .component-select > .r-right-top'),
                right: $('.editor > .component-select > .r-right'),
                rightBottom: $('.editor > .component-select > .r-right-bottom'),
                bottomRight: $('.editor > .component-select > .r-bottom-right'),
                bottom: $('.editor > .component-select > .r-bottom'),
                bottomLeft: $('.editor > .component-select > .r-bottom-left'),
                leftBottom: $('.editor > .component-select > .r-left-bottom'),
                left: $('.editor > .component-select > .r-left'),
                leftTop: $('.editor > .component-select > .r-left-top'),
                topLeft: $('.editor > .component-select > .r-top-left'),
            },
            menu: $('.component-select .menu')
        },
        visible: false, corners: 10, pad: 13, bar: 4, menu: { width: 40 }, locked: false, nomoreJitter: false, jitterbugs: null,

        init: function () {
            //set up static sizes for some resize bars
            this.elem.resize.leftTop.css({ height: this.corners });
            this.elem.resize.topLeft.css({ width: this.corners });

            //setup events for resize bars
            for (elem in this.elem.resize) {
                this.elem.resize[elem].on('mousedown', function (e) {
                    S.editor.components.select.resize.start.call(S.editor.components.select.resize, e);
                });
            }

            //setup menu
            this.menu.add($('#template_select_menu_props').html(), 'props', ['all', 'props'], null, null, S.editor.components.select.properties.show);
            this.menu.add($('#template_select_menu_alignment').html(), 'alignment', ['all', 'alignment'], null, S.editor.components.select.menu.alignment.hide, S.editor.components.select.menu.alignment.show);
            this.menu.alignment.init();
            $('#template_select_menu_props').remove();
            $('#template_select_menu_options').remove();
        },

        show: function (e) {
            if (S.editor.components.selected != null) { this.hide(); }
            $('.component-select .menu-window').hide();
            S.editor.components.selected = e;
            e.css({ zIndex: 1001 });
            var c = S.components.items.find(function (a) { return a.id == e[0].id.substr(1); });
            this.refresh();
            this.elem.compSel.show();
            this.elem.compShield.show();
            this.menu.show(e, c.menus);
            this.visible = true;

            //add event to window scroll event listener
            S.events.doc.scroll.callback.add('component-select',
                function () {
                    S.editor.components.select.redraw.start.call(S.editor.components.select);
                },
                function () {
                    S.editor.components.select.redraw.calculate.call(S.editor.components.select);
                },
                function () {
                    S.editor.components.select.redraw.paint.call(S.editor.components.select);
                },
                function () {
                    S.editor.components.select.refresh.call(S.editor.components.select);
                }
            );
        },

        hide: function () {
            if (this.locked == true) { return;}
            var e = S.editor.components.selected;
            if (e != null) {
                e[0].style.zIndex = '';
                $('.component-select .menu-window').hide();
                this.elem.compSel.hide();
                this.elem.compShield.hide();
                this.visible = false;
                this.menu.hide(e);
                S.editor.components.selected = null;
                S.events.doc.scroll.callback.remove('component-select');
            }
        },

        resize: {
            timer: null, bar: null, type: 0, cursorstart: null, cursor: null, box: null, component: null, pos: null,

            start: function (e) {
                //disable text selection
                e.stopPropagation();
                e.cancelBubble = true;
                e.preventDefault();

                //get resize bar
                var bar = $(e.target),
                    c = S.editor.components.selected;
                if (!bar.hasClass('resize')) {
                    bar = bar.parents('.resize');
                    if (bar.length == 0) { return; }
                }
                this.bar = bar;
                this.cursorstart = {
                    x: e.clientX + document.body.scrollLeft,
                    y: e.clientY + document.body.scrollTop
                };
                this.box = {
                    width: c.width(),
                    height: c.height(),
                }

                //get component information
                this.component = S.components.items.find(function (a) { return a.id == c[0].id.substr(1); });
                var pos = this.component.pos[S.viewport.indexFromLevelOrder(this.component.pos)];
                if (pos.widthType > 1 && pos.heightType == 1) { return; }
                
                //get bar type (4 sides, 4 corners)
                if (bar.hasClass('r-top')) {
                    if (pos.heightType == 1) { return;}
                    this.type = 1;
                } else if (bar.hasClass('r-top-right') || bar.hasClass('r-right-top')) {
                    if (pos.heightType == 1) {
                        this.type = 3;
                    } else if (pos.widthType > 1) {
                        this.type = 1;
                    } else {
                        this.type = 2;
                    }
                } else if (bar.hasClass('r-right')) {
                    if (pos.widthType > 1) { return; }
                    this.type = 3;
                } else if (bar.hasClass('r-right-bottom') || bar.hasClass('r-bottom-right')) {
                    if (pos.heightType == 1) {
                        this.type = 3;
                    } else if (pos.widthType > 1) {
                        this.type = 5;
                    } else {
                        this.type = 4;
                    }
                } else if (bar.hasClass('r-bottom')) {
                    if (pos.heightType == 1) { return; }
                    this.type = 5;
                } else if (bar.hasClass('r-bottom-left') || bar.hasClass('r-left-bottom')) {
                    if (pos.heightType == 1) {
                        this.type = 7;
                    } else if (pos.widthType > 1) {
                        this.type = 5;
                    } else {
                        this.type = 6;
                    }
                } else if (bar.hasClass('r-left')) {
                    if (pos.widthType > 1) { return; }
                    this.type = 7;
                } else if (bar.hasClass('r-left-top') || bar.hasClass('r-top-left')) {
                    if (pos.heightType == 1) {
                        this.type = 7;
                    } else if (pos.widthType > 1) {
                        this.type = 1;
                    } else {
                        this.type = 8;
                    }
                }
                this.pos = pos;

                //hide menu
                $('.component-select .menu-window').hide();

                //initialize mouse move & mouse up events for document
                var r = S.editor.components.select.resize;
                $(document).on('mousemove', r.mousemove);
                $(document).on('mouseup', r.mouseup);

                //start intervals
                if (this.timer != null) { clearInterval(this.timer); }
                this.timer = setInterval(function () {
                    r.go.call(r);
                });
                
            },

            mousemove: function (e) {
                //track mouse movements
                S.editor.components.select.resize.cursor = {
                    x: e.clientX + document.body.scrollLeft,
                    y: e.clientY + document.body.scrollTop
                };
            },

            go: function () {
                //resize component based on resize bar drag position
                if (this.cursor == null) { return; }
                var x = this.cursor.x - this.cursorstart.x,
                    y = this.cursor.y - this.cursorstart.y,
                    c = S.editor.components.selected,
                    w = this.box.width, h = this.box.height;

                switch (this.type) {
                    case 1: //top
                        h = this.box.height + y;
                        break;
                    case 2: //top-right
                        w = this.box.width + (x * 2);
                        h = this.box.height + y;
                        break;
                    case 3: //right
                        w = this.box.width + (x * 2);
                        break;
                    case 4: //bottom-right
                        w = this.box.width + (x * 2);
                        h = this.box.height + y;
                        break;
                    case 5: //bottom
                        h = this.box.height + y;
                        break;
                    case 6: //bottom-left
                        w = this.box.width + (x * 2);
                        h = this.box.height + y;
                        break;
                    case 7: //left
                        w = this.box.width - (x * 2);
                        break;
                    case 8: //top-left
                        w = this.box.width + (x * 2);
                        h = this.box.height + y;
                        break;
                }

                var win = S.window.pos();
                if (w > win.w - 30) { w = win.w - 30; }
                if (h > win.h - 30) { h = win.h - 30; }

                if (this.pos.widthType == 0 && this.pos.heightType == 0) {
                    c.css({ maxWidth: w, maxHeight: h });
                } else if (this.pos.widthType == 0) {
                    c.css({ maxWidth: w });
                } else if (pos.heightType == 0) {
                    c.css({ maxHeight: h });
                }
                
                S.editor.components.select.refresh();
            },

            mouseup: function (e) {
                //stop resizing
                var self = S.editor.components.select.resize,
                    c = S.editor.components.selected;
                var i = S.components.items.findIndex(function (a) { return a.id == c[0].id.substr(1); });
                var component = S.components.items[i];
                var posIndex = S.viewport.indexFromLevelOrder(component.pos);
                var pos = $.extend(true, {}, component.pos[posIndex]);

                //stop events & reset vars
                if (self.timer != null) { clearInterval(self.timer); }
                $(document).off('mousemove', self.mousemove);
                $(document).off('mouseup', self.mouseup);
                self.bar = null;
                self.type = null;
                self.timer = null;
                S.editor.components.hover.hide();

                //update component CSS
                if (pos != null) {
                    pos.width = c.width();
                    if (pos.heightType == 0) { pos.height = c.height() };
                    S.components.items[i].pos[S.viewport.level] = pos;
                    S.editor.components.css.update(c[0]);
                    c[0].style = "";

                    //save component position
                    data = {};
                    if (self.pos.widthType <= 1 && self.pos.heightType == 0) {
                        data = { maxWidth: pos.width, maxHeight: pos.height };
                    } else if (self.pos.widthType <= 1) {
                        data = { maxWidth: pos.width };
                    } else if (self.pos.heightType == 0) {
                        data = { maxHeight: pos.height };
                    }
                    S.editor.save.add(self.component.id, 'resize:' + S.viewport.level, data);
                }
            },
        },

        redraw: {
            box: null, menutop: null, win: null,

            start: function () {
                //update any references while starting a redraw
                this.elem.menuwin = $('.component-select .menu .menu-window');
            },

            calculate: function () {
                //makes calculations to change the position of the resize bars
                if (S.editor.components.selected == null) { return; }
                var c = S.editor.components.selected;
                var pos = c.offset();
                var w = c.width();
                var h = c.height();
                var maxw = w + (this.pad * 2);
                var maxh = h + (this.pad * 2);
                var win = S.window.pos();
                var rightspace = (win.w + win.scrollx) - (pos.left - this.pad + maxw);
                var bottomspace = (win.h + win.scrolly) - (pos.top - this.pad + maxh);
                var topspace = pos.top - this.pad;
                var toolh = S.editor.toolbar.height;
                var scrollbarv = S.window.verticalScrollbarWidth();

                //set up select box dimensions (with window-bound constraints)
                var box = {
                    x: pos.left - this.pad < 0 ? 0 : pos.left - this.pad,
                    y: topspace < toolh ? toolh : topspace,
                    w: rightspace < 0 ? maxw + rightspace : maxw,
                    h: (bottomspace < 0 ? maxh + bottomspace : maxh) + (topspace < toolh ? topspace - toolh : 0)
                };

                if (box.x < 0) { box.x = 5; }
                if (box.y - win.scrolly - toolh < 0) { box.y = win.scrolly + toolh; }
                if (box.w > win.w - scrollbarv) { box.w = win.w - scrollbarv - (box.x * 2); }
                if (box.h > win.h - toolh) { box.h = win.h - toolh; }

                this.redraw.box = box;
                this.redraw.win = win;
                this.redraw.menutop = win.scrolly > box.y ? win.scrolly - box.y : 0;
            },

            paint: function () {
                //repositions the resize bars based on calculations
                if (S.editor.components.selected == null) { return; }
                var r = this.elem.resize;
                var m = this.elem.menu;
                var box = this.redraw.box;
                var win = this.redraw.win;
                var menutop = this.redraw.menutop;

                //set component shield before resizing box within boundaries
                this.elem.compShield.css({ top: box.y, left: box.x, width: box.w, height: box.h });

                //reposition component select box container
                this.elem.compSel.css({ top: box.y, left: box.x });

                //reposition all resize bars
                r.top.css({ left: this.corners, width: box.w - (this.corners * 2) });
                r.topRight.css({ left: box.w - this.corners, width: this.corners });
                r.rightTop.css({ left: box.w - this.bar, height: this.corners });
                r.right.css({ top: this.corners, left: box.w - this.bar, height: box.h - (this.corners * 2) });
                r.rightBottom.css({ top: box.h - this.corners, left: box.w - this.bar, height: this.corners });
                r.bottomRight.css({ top: box.h - this.bar, left: box.w - this.corners, width: this.corners });
                r.bottom.css({ top: box.h - this.bar, left: this.corners, width: box.w - (this.corners * 2) });
                r.bottomLeft.css({ top: box.h - this.bar, width: this.corners });
                r.leftBottom.css({ top: box.h - this.corners, height: this.corners });
                r.left.css({ top: this.corners, height: box.h - (this.corners * 2) });

                //reposition menu system
                if (win.w - (box.x + box.w) < 50) {
                    //inner menu
                    m.addClass('inner').css({ left: box.w - 36, top: menutop + 4 });
                } else {
                    //outer menu
                    m.removeClass('inner').css({ left: box.w, top: menutop });
                }
                if (win.w - (box.x + box.w) < 250) {
                    //inner menu window
                    m.find('.menu-window').addClass('inner');
                } else {
                    //outer menu window
                    m.find('.menu-window').removeClass('inner');
                }

                //execute all registered events
                this.events.refresh.execute();
            }
        },

        refresh: function () {
            //reposition all resize bars & menu system for the component select box
            this.redraw.start.call(this);
            this.redraw.calculate.call(this);
            this.redraw.paint.call(this);
        },

        events: {
            refresh: {
                items: [],
                add: function (elem, onRefresh) {
                    this.items.push({ elem: elem, onRefresh: onRefresh });
                },

                remove: function (elem) {
                    for (var x = 0; x < this.items.length; x++) {
                        if (this.items[x].elem == elem) {
                            this.items.splice(x, 1);
                            break;
                        }
                    }
                },

                execute: function () {
                    for (var x = 0; x < this.items.length; x++) {
                        this.items[x].onRefresh();
                    }
                }
            }
        },

        menu: {
            items: [], usedMenus: [],

            add: function (html, id, types, onShow, onHide, onClick) {
                //html = icon & optional menu
                //types = array of component types this menu should be displayed for (all, text, photo, etc.)
                //onShow = function to call when the menu is shown
                //onClick = function to call when the menu item is clicked
                var self = S.editor.components.select.menu;
                if (self.items.find(function (a) { return a.id == id; }) == undefined) {
                    if (html != "") {
                        var div = document.createElement('div');
                        var classname = 'item menu-' + id;
                        if (types == null) { classname += ' for-all'; }
                        for (var t in types) {
                            classname += ' for-' + types[t];
                        }
                        div.setAttribute('data-id', id);
                        div.className = classname;
                        $(div).html(html);
                        $(div).find('.menu-window').hide();
                        $('.component-select .menu').append(div);
                        $('.component-select .menu-' + id + ' > .icon a').on('click', function () {
                            var menu = $('.component-select .menu-' + id + ' > .menu-window');
                            if (menu.length > 0) {
                                if (menu[0].style.display == 'none') {
                                    menu.show();
                                } else {
                                    menu.hide();
                                    return;
                                }
                            }
                            var item = self.items.find(function (a) { return a.id == id; });
                            if (typeof item.onClick == 'function') { item.onClick(); }
                        });
                    }
                }
                self.items.push({
                    id: id, types: types, onShow: onShow, onHide: onHide, onClick: onClick
                });
            },

            show: function (e, types) {
                var self = S.editor.components.select.menu;
                $('.component-select .menu .item').hide();
                if (types[0] == '') { types[0] = 'all';}
                //show menu items
                var menus = [];
                for (var t in types) {
                    var type = types[t];
                    var hide = type.substr(0, 1) == '!';
                    if (hide) { type = type.substr(1); }
                    var b = $('.component-select .menu .item.for-' + type);
                    
                    var items = self.items.filter(function (a) {
                        return a.types.indexOf(type) >= 0;
                    });
                    for (var i = 0; i < items.length; i++) {
                        var x = -1;
                        if (menus.length > 0) {
                            x = menus.findIndex(function (a) {
                                return a.id == items[i].id;
                            });
                        }
                        if (!hide && x < 0) {
                            //add menu to list
                            menus.push(items[i]);
                        } else if (x >= 0) {
                            //remove menu from list
                            menus.splice(x, 1);
                        }
                    }
                    if (!hide) {
                            b.show();
                    } else {
                        b.hide();
                    }
                }
                //finally, execute events for menus in list
                S.editor.components.select.menu.usedMenus = menus;
                for (var x = 0; x < menus.length; x++) {
                    if (typeof menus[x].onShow == 'function') { menus[x].onShow(e); }
                }
                S.editor.components.hover.hide();
            },

            hide: function (e) {
                var self = S.editor.components.select.menu;
                for (var x = 0; x < self.usedMenus.length; x++) {
                    var item = self.usedMenus[x];
                    if (typeof item.onHide == 'function') { item.onHide(e); }
                }
            },

            alignment: {
                init: function () {
                    $('.menu-alignment select, .menu-alignment input').on('change', this.update);
                },

                show: function () {
                    var self = S.editor.components.select.menu.alignment;
                    self.load();
                    S.viewport.events.levelChange.add('menu-alignment', self.load);
                },

                load: function () {
                    var c = S.editor.components.selected;
                    var i = S.components.items.findIndex(function (a) { return a.id == c[0].id.substr(1); });
                    var component = S.components.items[i];
                    var posIndex = S.viewport.indexFromLevelOrder(component.pos);
                    var pos = component.pos[posIndex];

                    //update form fields
                    $('#component_align').val(pos.align);
                    $('#component_width_type').val(pos.widthType);
                    $('#component_height_type').val(pos.heightType);
                    $('#component_pad_top').val(pos.padding.top);
                    $('#component_pad_right').val(pos.padding.right);
                    $('#component_pad_bottom').val(pos.padding.bottom);
                    $('#component_pad_left').val(pos.padding.left);
                    $('#component_newline')[0].checked = pos.forceNewLine;
                },

                hide: function () {
                    S.viewport.events.levelChange.remove('menu-alignment');
                },

                update: function () {
                    //update alignment settings for selected component
                    var c = S.editor.components.selected;
                    var i = S.components.items.findIndex(function (a) {return a.id == c[0].id.substr(1);});
                    var component = S.components.items[i];
                    var posIndex = S.viewport.indexFromLevelOrder(component.pos);
                    var pos = component.pos[posIndex];
                    var data = {
                        align: parseInt($('#component_align').val()),
                        fixedAlign: pos.fixedAlign,
                        position: pos.position,
                        top: pos.top,
                        width: pos.width,
                        height: pos.height,
                        widthType: parseInt($('#component_width_type').val()),
                        heightType: parseInt($('#component_height_type').val()),
                        padding: {
                            top: parseInt($('#component_pad_top').val() || 0),
                            right: parseInt($('#component_pad_right').val() || 0),
                            bottom: parseInt($('#component_pad_bottom').val() || 0),
                            left: parseInt($('#component_pad_left').val() || 0)
                        },
                        forceNewLine: $('#component_newline')[0].checked
                    };

                    //update component
                    S.components.items[i].pos[S.viewport.level] = data;
                    S.editor.components.css.update(c[0]);
                    S.editor.components.select.refresh();

                    //save changes to page
                    S.editor.save.add(c[0].id.substr(1), 'alignment:' + S.viewport.level, data);
                }
            }
        },

        properties: {
            component: null,

            show: function () {
                //load component properties window
                var self = S.editor.components.select.properties;
                var c = S.editor.components.selected;
                if (self.component != c[0]) {
                    self.component = c;
                    console.log(S.editor.components.select.properties);
                } else {

                }
            }
        }
    },

    // the hover box displayed on top of the currently hovered component /////////////////////////////////////////
    hover: { // the hover box that is displayed when a component is hovered over /////////////////////////////////
        elem:{
            compHover: $('.editor > .component-hover')
        },
        pad: 13, timer: { date: new Date(), timeout: 250 }, isdragging: false, trigdrag: false, disabled: false,

        init: function(){
            var e = this.elem.compHover.get();
            if (!S.drag.has(e)) {
                this.elem.compHover.off().on('mouseleave', function (e) { S.editor.components.hover.mouseout.call(S.editor.components.hover, e.target); });
                S.drag.add(e, e, this.drag.start, this.drag.go, this.drag.end, { callee: this, speed: 1000 / 30 });
            }
            this.reinit();
        },

        reinit: function () {
            //reinitialize component hover events (in case of new components loaded onto the page)
            $('.webpage .component').off().on('hover', function (e) { S.editor.components.hover.mouseover.call(S.editor.components.hover, e.target); });
        },

        hovered: function (elem) {
            //wait a few milliseconds so that other hover events fire and fail
            setTimeout(function () { S.editor.components.hover.hovering.call(S.editor.components.hover, elem); }, 20);
        },

        hovering: function (e) {
            //finally, set the hovered component
            S.editor.components.hovered = e;
            this.refresh();
            this.elem.compHover.show();
        },

        mouseover: function(e){
            //make sure target is the next element in the hierarchy to be hovered
            if (S.editor.visible == false) { return; }
            if (this.isdragging == true) { return; }
            if (this.disabled == true) { return; }
            var el = $(e);
            if (!el.hasClass('component')) {
                el = el.parents('.component').first();
            }
            var sel = S.editor.components.selected;
            if (sel != null) {
                if (sel.get() == el.get()) { return; }
            }

            //check for root-level component
            if (el.parents('.component').length == 0) {
                //select bottom-most element
                this.hovered(el);
                return;
            }
            //check for hovered component as child of selected component
                
            var parents = el.parents('.component');
            if (parents.length > 0) {
                if (parents.get() == sel) {
                    this.hovered(el);
                    return;
                } else {
                    for (var x = 0; x < parents.length; x++) {
                        if (parents.get(x) == sel) {
                            return;
                        }
                    }
                    this.hovered(el);
                }
            } else {
                this.hovered(el);
            }
        },

        mouseout: function(e){
            if (this.isdragging == true) { return; }
            this.hide();
        },

        hide: function(){
            this.elem.compHover.hide();
            S.editor.components.hovered = null;
        },

        disable: function () {
            this.hide();
            this.disabled = true;
        },

        enable: function(){
            this.disabled = false;
        },

        drag:{
            start: function (item) {
                this.isdragging = true;
                this.timer.date = new Date();
                this.trigdrag = false;
                this.elem.compHover.hide();
                item.dragElem = S.editor.components.hovered.get();

            },

            go: function (item) {
                if (this.trigdrag == false) {
                    var cx = item.start.x - item.cursor.x;
                    var cy = item.start.y - item.cursor.y;
                    if (cx < 0) { cx = cx * -1; }
                    if (cy < 0) { cy = cy * -1; }
                    if (new Date() - this.timer.date > this.timer.timeout || cx + cy > 8) {
                        //trigger drag instead of click
                        var pos = S.editor.components.hovered.position();
                        S.editor.components.hovered.css({ 'position': 'absolute', left: pos.left, top: pos.top });
                        S.editor.components.select.hide();
                        this.trigdrag = true;
                        $('body').addClass('show-empty-cells');
                        //start component tracking
                        S.editor.components.track.drag.start.call(S.editor.components.track);
                    }
                    return false;
                }
                S.editor.components.track.drag.go.call(S.editor.components.track, { left: item.cursor.x, top: item.cursor.y, right: item.cursor.x + 1, bottom: item.cursor.y + 1 });
            },

            end: function (item) {
                if (this.isdragging == false) { return false;}
                this.isdragging = false;
                if (this.trigdrag == false) {
                    //register click event instead of drag event
                    S.editor.components.select.show(S.editor.components.hovered); return;
                } else {
                    //finish dragging component
                    S.editor.components.track.drag.end();

                    //update body tag
                    $('body').removeClass('show-empty-cells');

                    //move component
                    var e = S.editor.components.hovered;
                    var elem = e.get();
                    var track = S.editor.components.track;
                    if (track.component) {
                        if (track.drop == 'after') {
                            $(track.component).after(elem);
                        } else {
                            $(track.component).before(elem);
                        }
                    } else {
                        $(track.cell).append(elem);
                    }
                    e.css({ 'position': '', top: '', left: '' });

                    //save changes to server
                    var data = {
                        componentId: elem.id.substring(1),
                        blockName: $(track.cell).parents('.is-block').attr('data-block'),
                        panelId: $(track.cell).parents('.is-panel').attr('id').replace('panel_', ''),
                        cellId: track.cell.id.replace('cell_', ''),
                        targetId: track.component ? track.component.id.substring(1) : '',
                        append: track.drop === 'after' ? 1 : 0
                    };

                    S.ajax.post('Editor/Components/Move', data, function (d) {
                        S.editor.save.add(elem.id.substring(1), 'move', {});
                    });

                    //reinitialize component events
                    S.editor.components.hover.reinit();
                    S.editor.components.hovered = null;
                }
            }
        },

        refresh: function () {
            //recalculate dimenions for the component select box
            if (S.editor.components.hovered === null) { return false; }
            var hovered = S.editor.components.hovered;
            var pos = hovered.offset();
            var w = hovered.width();
            var h = hovered.height();
            var win = S.window.pos();
            var a = pos.top + h + (this.pad * 2);
            var b = win.scrolly + win.h;
            //fit to window bounds
            if (a > b) { h = h - (a - b) + (this.pad / 2); }
            a = pos.left + w + (this.pad * 2);
            b = win.scrollx + win.w;
            if (a > b) { w = w - (a - b) + (this.pad / 2); }
            //resize hover box
            this.elem.compHover.css({ top: pos.top - this.pad, left: pos.left - this.pad, width: w + (this.pad * 2), height: h + (this.pad * 2) });
        }
    },

    // executed when the user clicks anywhere on the web page ////////////////////////////////////////////////////
    click: function (target, type) {
        if (type != 'component-select' && type != 'component-hover' && type != 'window' && type != 'toolbar') {
            //check for parents that have specific class 'for-component-select'
            if ($(target).parents('.for-component-select').length == 0) {
                //deselect component
                var c = $(target);
                if (!c.hasClass('component')) { c = c.parents('.component'); }
                if (c.length > 0) {
                    if (S.editor.components.selected != null) {
                        if (c.get() == S.editor.components.selected.get()) { return; }
                    }
                }
                S.editor.components.select.hide();
            }
        }
    },

    // utility for component tracking while dragging /////////////////////////////////////////////////////////////
    track: {
        cells: [], hoverIndex: 0, hoverStart: true, timer: { timout: 500, date: null} ,
        cell: null, component: null, drop: 'after', hoverComp: 1,

        drag:{
            start: function(){
                this.hoverComp = 1;
                this.hoverIndex = 0;
                this.hoverStart = true;
                this.cells = [];
                $('.is-cell').each(function (e) {
                    S.editor.components.track.cells.push(S.editor.components.track.getCell($(e)));
                });
                this.timer.date = new Date();
            },

            go: function (cursor) {
                if (new Date() - this.timer.date < this.timer.timeout) { return; }
                var cell = this.cells[this.hoverIndex];
                var comp;
                var found = false;
                this.timer.date = new Date();

                if (!S.math.intersect(cell.rect, cursor) || this.hoverStart === true) {
                    //intersecting a different cell
                    for (var i = 0; i < this.cells.length; i++) {
                        cell = this.cells[i];
                        if (S.math.intersect(cell.rect, cursor)) {
                            this.hoverIndex = i;
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        // generate box around currently hovered panel cell
                        var div = document.createElement('div');
                        div.className = "cellbox";
                        div.style.left = cell.rect.left + 'px';
                        div.style.top = cell.rect.top + 'px';
                        div.style.width = cell.width + 'px';
                        div.style.height = cell.height + 'px';
                        $('.editor > .temp > .cellbox').remove();
                        $('.editor > .temp > .displayComponentLine').remove();
                        $('.editor > .temp').append(div);
                        this.hoverComp = 1;
                        this.drop = '';
                    } else {
                        cell = this.cells[0];
                        this.hoverIndex = 0;
                    }
                    if (this.hoverStart === true) { this.hoverStart = false; }
                    this.cell = cell.elem;
                }
                this.getComponentHoveredOver(cursor, cell, cell.comps, found);
            },

            end: function () {
                $('.editor > .clone *, ' +
                 '.editor > .temp > .cellbox, ' +
                 '.editor > .temp > .compline').remove();
            }
        },

        getCell: function(e){
            var pof = e.offset();
            var pdim = { width: e.width(), height: e.height() };

            //get list of components within panel cell
            var comps = this.getComponentsInCell(e);

            //add panel cell to list
            return {
                elem: e.get(),
                rect: {
                    left: pof.left, right: pof.left + pdim.width, top: pof.top, bottom: pof.top + pdim.height
                },
                width: pdim.width,
                height: pdim.height,
                comps: comps
            };
        },

        getComponentsInCell: function (cell) {
            var comps = [];
            cell.find('.component').each(function (c) {
                if (c.style.position != "absolute") {
                    var ce = $(c);
                    var of = ce.offset();
                    var dim = { width: ce.width(), height: ce.height() };
                    comps.push({
                        elem: c,
                        rect: {
                            left: of.left, right: of.left + dim.width, top: of.top, bottom: of.top + dim.height
                        },
                        width: dim.width,
                        height: dim.height
                    });
                }
                
            });
            //sort components based on top left position
            comps.sort(function (a, b) {
                var c = a.rect.top - b.rect.top;
                if (c == 0) {
                    return a.rect.left - b.rect.left;
                } else { return c; }
            });

            return comps;
        },

        getComponentHoveredOver: function (cursor, cell, comps, newcell) {
            var curr = null;
            if (comps) {
                var cy = cursor.top;
                var cx = cursor.left;
                var rectx = 0;
                var drop = 'after';
                for (var x = 0; x < comps.length; x++) {
                    comp = comps[x].rect;
                    if (cy >= comp.top) {
                        if (cy <= comp.bottom) {
                            if (cx >= comp.left + ((comp.right - comp.left) / 2.5)) {
                                curr = comps[x];
                                rectx = curr.rect.right;
                                drop = 'after';
                            } else if (curr == null) {
                                curr = comps[x];
                                rectx = curr.rect.left;
                                drop = 'before';
                            } else {
                                break;
                            }
                        }
                    } else { break; }
                }

                if (curr !== null) {
                    if (curr.elem !== this.hoverComp || this.drop != drop) {
                        this.displayComponentLine(curr.elem, drop, rectx, curr.rect.top, curr.height);
                        this.hoverComp = curr.elem;
                        return;
                    } else if (curr.elem == this.hoverComp) { return; }
                }
            }
            if (curr === null && this.hoverComp !== 1) {
                //load component line before first component
                this.hoverComp = 1;
                if (comps.length > 0) {
                    comp = comps[comps.length - 1];
                    if (cursor.top > comp.rect.bottom) {
                        //after last component in cell
                        this.displayComponentLine(comp.elem, 'after', comp.rect.right, comp.rect.top, comp.height);
                    } else {
                        //before first component in cell
                        comp = comps[0];
                        this.displayComponentLine(comp.elem, 'before', comp.rect.left, comp.rect.top, comp.height);
                    }
                } else {
                    this.displayComponentLine(null, 'before', cell.rect.left + ((cell.rect.right - cell.rect.left) / 2), cell.rect.top, cell.height);
                }
            } else if (newcell === true) {
                //cursor moved from one cell to another
                if (comps.length > 0) {
                    if (cursor.top > cell.rect.top + ((cell.rect.bottom - cell.rect.top) / 2)) {
                        //after last component in cell
                        comp = comps[comps.length - 1];
                        this.displayComponentLine(comp.elem, 'after', comp.rect.right, comp.rect.top, comp.height);
                    } else {
                        //before first component in cell
                        comp = comps[0];
                        this.displayComponentLine(comp.elem, 'before', comp.rect.left, comp.rect.top, comp.height);
                    }

                } else {
                    //before first component in cell
                    this.displayComponentLine(null, 'before', cell.rect.left + ((cell.rect.right - cell.rect.left) / 2), cell.rect.top, cell.height);
                }
            }
        },

        displayComponentLine: function (elem, drop, left, top, height) {
            //display a dotted line to show where the new component 
            //will be dropped (between two components on the page)
            if ($('.editor > .temp > .compline').length == 0) {
                var div = document.createElement('div');
                div.className = "compline";
                div.style.left = left + 'px';
                div.style.top = top + 'px';
                div.style.width = '1px';
                div.style.height = height + 'px';
                $('.editor > .temp > .compline').remove();
                $('.editor > .temp').append(div);
            } else {
                var div = $('.editor > .temp > .compline');
                div.css({ top: top, left: left, height: height });
            }
            this.component = elem;
            this.drop = drop;
        }
    },

    // updating CSS properties for a specific component //////////////////////////////////////////////////////////
    css: {
        update: function (c) {
            //update CSS for component position & alignment settings
            var component = S.components.items.find(function (a) { return a.id == c.id.substr(1); });
            if (component != null) {
                var id = c.id.substr(1);
                var pos = component.pos;
                var css = '';
                var style = '';

                //check for redundant settings
                var noFloat = true;
                var noDisplay = true;
                var noPosition = true;
                var noLeft = true;
                var noTop = true;
                var noWidth = true;
                var noHeight = true;
                var noPadding = true;
                var noMargin = true;
                for (var x = 4; x >= 0; x--) {
                    p = pos[x];
                    if (p == null) { continue; }
                    if (p.align != 1) { noFloat = false; }
                    if (p.align == 1 && p.forceNewLine == false) { noDisplay = false; }
                    if (p.pition == 1) { noDisplay = false; }
                    if (p.left > 0) { noLeft = false; }
                    if (p.top > 0) { noTop = false; }
                    if (p.width > 0) { noWidth = false; }
                    if (p.height > 0 && p.height != null) { noHeight = false; }
                    if (p.forceNewLine == false) { noMargin = false; }
                    if (p.padding.top > 0 || p.padding.right > 0 || p.padding.bottom > 0 || p.padding.left > 0) { noPadding = false; }
                }

                for (var x = 4; x >= 0; x--) {
                    var p = pos[x];
                    if (p == null) { continue; }
                    style = '';

                    //alignment
                    switch (p.align) {
                        case 0: //left
                            style += 'float:left;' + (noDisplay ? '' : 'display:block;');
                            break;
                        case 1: //center
                            if (p.forceNewLine == true) {
                                style += (noFloat ? '' : 'float:none;') + (noDisplay ? '' : 'display:block;');
                            } else {
                                style += (noFloat ? '' : 'float:none;') + 'display:inline-block;';
                            }
                            break;
                        case 2: //right
                            style += 'float:right;' + (noDisplay ? '' : 'display:block;');
                            break;
                    }

                    //position
                    switch (p.position) {
                        case 1://fixed
                            style += 'position:fixed;';
                            switch (p.fixedAlign) {
                                case 0://top
                                    style += 'top:auto;bottom:auto;';
                                    break;
                                case 1://middle
                                    style += 'top:50%;bottom:50%;';
                                    break;
                                case 2://bottom
                                    style += 'top:auto;bottom:0;';
                            }
                            break;
                        default:
                            if (!noPosition) { style += 'position:relative;'; }
                    }

                    //x & y offset position
                    style += (noLeft ? '' : 'left:' + pos.left + 'px;') + (noTop ? '' : 'top:' + pos.top + 'px;');

                    //width
                    switch (p.widthType) {
                        case 0://pixels
                            if (p.width > 0) { style += 'max-width:' + p.width + 'px;'; }
                            break;
                        case 1://percent
                            if (p.width > 0) { style += 'max-width:' + p.width + '%;'; }
                            break;
                        case 2://window
                            if (!noWidth) { style += 'max-width:100%;'; }
                            break;
                    }

                    //height
                    switch (p.heightType) {
                        case 0://pixels
                            if (p.height > 0) { style += 'height:' + p.height + 'px;'; }
                            break;
                        case 1://auto
                        case 2://window
                            if (!noHeight) { style += 'height:auto;'; }
                            break;
                    }

                    //padding
                    if (!noPadding) {
                        style += 'padding:' +
                            p.padding.top + "px " +
                            p.padding.right + "px " +
                            p.padding.bottom + "px " +
                            p.padding.left + "px;";
                    }
                    
                    //force new line
                    if (p.forceNewLine == true && !noMargin) {
                        style += 'margin:0 auto;';
                    }

                    //compile style with CSS selector
                    if (style != '') {
                        switch (x) {
                            case 0: //cell
                                css += ".s-cell #c" + id + "{" + style + "}\n"
                                break;
                            case 1: //mobile
                                css += ".s-mobile #c" + id + "{" + style + "}\n"
                                break;
                            case 2: //tablet
                                css += ".s-tablet #c" + id + "{" + style + "}\n"
                                break;
                            case 3: //desktop
                                css += ".s-desktop #c" + id + "{" + style + "}\n"
                                break;
                            case 4: //HD
                                css += ".s-hd #c" + id + "{" + style + "}\n"
                                break;
                        }
                    }
                }

                style = document.createElement('style');
                style.id = 'css_component_' + c.id;
                style.innerHTML = css;
                $('#' + style.id).remove();
                $('head').append(style);
                S.editor.components.hover.hide();
            }
        }
    }
};