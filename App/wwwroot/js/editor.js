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


S.editor.components = {
    hovered: null, selected: null, 
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
            }
        },
        visible: false, corners: 20, pad: 13, bar: 4, menu: { width: 40 },

        init: function () {
            //set up static sizes for some resize bars
            this.elem.resize.leftTop.css({ height: this.corners });
            this.elem.resize.topLeft.css({ width: this.corners });

            //setup events for resize bars
            for (elem in this.elem.resize) {
                this.elem.resize[elem].on('mousedown', function (e) {
                    S.editor.components.select.resize.start.call(S.editor.components.select.resize, e);
                });
                this.elem.resize[elem].on('mouseup', function (e) {
                    S.editor.components.select.resize.end.call(S.editor.components.select.resize, e);
                });
            }
        },

        show: function (e) {
            S.editor.components.selected = e;
            this.refresh();
            this.elem.compSel.show();
            this.visible = true;
        },

        hide: function () {
            S.editor.components.selected = null;
            this.elem.compSel.hide();
            this.visible = false;
        },

        resize: {
            timer: null, bar: null, type: 0, start: null, cursor: null, box: null,
            start: function (e) {
                //get resize bar
                var bar = $(e.target);
                if (!bar.hasClass('resize')) {
                    bar = bar.parents('.resize');
                    if (bar.length == 0) { return; }
                }
                this.bar = bar;
                this.start = {
                    x: e.clientX + document.body.scrollLeft,
                    y: e.clientY + document.body.scrollTop
                };
                this.box = {
                    width: bar.width(),
                    height: bar.height()
                }

                //get bar type (4 sides, 4 corners)
                if (bar.hasClass('r-top')) {
                    this.type = 1;
                } else if (bar.hasClass('r-top-right') || bar.hasClass('r-right-top')) {
                    this.type = 2;
                } else if (bar.hasClass('r-right')) {
                    this.type = 3;
                } else if (bar.hasClass('r-right-bottom') || bar.hasClass('r-bottom-right')) {
                    this.type = 4;
                } else if (bar.hasClass('r-bottom')) {
                    this.type = 5;
                } else if (bar.hasClass('r-bottom-left') || bar.hasClass('r-left-bottom')) {
                    this.type = 6;
                } else if (bar.hasClass('r-left')) {
                    this.type = 7;
                } else if (bar.hasClass('r-left-top') || bar.hasClass('r-top-left')) {
                    this.type = 8;
                }

                //initialize mouse move event
                var r = S.editor.components.select.resize;
                bar.on('mousemove', function (e) {
                    r.move.call(r, e);
                });

                //start intervals
                if (this.timer != null) { clearInterval(this.timer); }
                this.timer = setInterval(function () {
                    r.go.call(r);
                });
                
            },

            move: function(e){
                this.cursor = {
                    x: e.clientX + document.body.scrollLeft,
                    y: e.clientY + document.body.scrollTop
                };
            },

            go: function(){
                //resize component based on resize bar drag position
                switch (this.type) {
                    case 1: //top

                        break;
                    case 2: //top-right

                        break;
                    case 3: //right

                        break;
                    case 4: //bottom-right

                        break;
                    case 5: //bottom

                        break;
                    case 6: //bottom-left

                        break;
                    case 7: //left

                        break;
                    case 8: //top-left

                        break;
                }
            },

            end: function () {
                //stop resizing
                if (this.timer != null) { clearInterval(this.timer); }
                this.bar.off('mousemove');
                this.bar = null;
                this.type = null;
                this.timer = null;
            }
        },

        refresh: function () {
            //reposition all resize bars & menu system for the component select box
            if (S.editor.components.selected == null) { return;}
            var c = S.editor.components.selected;
            var pos = c.offset();
            var w = c.width();
            var h = c.height();
            var r = this.elem.resize;
            var maxw = w + (this.pad * 2);
            var maxh = h + (this.pad * 2);
            var win = S.window.pos();
            var rightspace = (win.w + win.scrollx) - (pos.left - this.pad + maxw);
            var bottomspace = (win.h + win.scrolly) - (pos.top - this.pad + maxh);
            var topspace = pos.top - this.pad;
            var toolh = S.editor.toolbar.height;

            //set up select box dimensions (with window-bound constraints)
            var box = {
                x: pos.left - this.pad < 0 ? 0 : pos.left - this.pad, 
                y: topspace < toolh ? toolh : topspace,
                w: rightspace < 0 ? maxw + rightspace : maxw, 
                h: (bottomspace < 0 ? maxh + bottomspace : maxh) + (topspace < toolh ? topspace - toolh : 0)
            };

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
            //deselect component
            var c = $(target);
            if (!c.hasClass('component')) { c = c.parents('.component'); }
            if(c.length > 0){
                if (S.editor.components.selected != null) {
                    if (c.get() == S.editor.components.selected.get()) { return; }
                }
            }
            S.editor.components.select.hide();
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

        getCell(e){
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
            var div = $('.editor > .temp > .compline');
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
                div.css({ top: top, left: left, height: height });
            }
            this.component = elem;
            this.drop = drop;
        }
    }
};
S.editor.dashboard = {
    init: function () {
        //set up dashboard menu buttons
        $('#winDashboard a.icon-layout').on('click', function () { S.editor.layout.show();});
    }
};
S.drag = {
    items: [], timer: null, 
    
    item:{
        index: null,
        elem: null,
        win: { w: 0, h: 0, scrollx: 0, scrolly: 0 },
        pos: { x: 0, y: 0, w:0, h:0 },
        start:{ x: 0, y: 0 },
        cursor: { x: 0, y: 0 },
        options: null,
        hasOnDrag: false
    },

    add: function (elem, dragElem, onStart, onDrag, onStop, options) {
        //options = { boundTop:0 , boundRight:0 , boundLeft:0 , boundRight:0, useElemPos:false }
        this.items.push({ elem: elem, dragElem: dragElem, onStart: onStart, onDrag: onDrag, onStop: onStop, options: options });
        var x = this.items.length - 1;
        $(elem).on('mousedown', function (e) { S.drag.events.start.call(S.drag, x, e) });
    },

    has: function (elem){
        this.items.forEach(function (item) {
            if (item.elem == elem) { return true;}
        });
        return false;
    },

    events: {
        start: function (index, e) {
            var item = this.items[index];

            if (typeof item.onStart == 'function') {
                item.onStart.call(item.options ? (item.options.callee ? item.options.callee : this) : this, item);
            }
            var el = $(item.elem);
            var elem = $(item.dragElem);
            var elpos = el.offset();
            var pos = elem.position();
            var win = $(window);
            var speed = 1000 / 30;
            if (item.options) {
                if (item.options.useElemPos == true) {
                    pos = { left: elpos.left - pos.left, top: elpos.top - pos.top };
                }
                if (item.options.speed != null) {
                    speed = item.options.speed;
                }
            }

            this.item = {
                index:index,
                elem: item.dragElem,
                win:{
                    w: win.width(),
                    h: win.height()
                },
                start:{
                    x: e.clientX + document.body.scrollLeft,
                    y: e.clientY + document.body.scrollTop
                },
                cursor:{
                    x: e.clientX + document.body.scrollLeft,
                    y: e.clientY + document.body.scrollTop
                },
                pos:{
                    x: pos.left,
                    y: pos.top,
                    w: elem.width(),
                    h: elem.height()
                },
                options: item.options,
                hasOnDrag: typeof item.onDrag == 'function'
            }


            //set up document-level drag events
            $(document).on('mousemove', S.drag.events.doc.move);
            $(document).on('mouseup', S.drag.events.doc.up);
            S.drag.events.drag.call(S.drag);
            clearInterval(this.timer);
            this.timer = setInterval(function () { S.drag.events.drag.call(S.drag); }, speed);

            //don't let drag event select text on the page
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
            e.cancelBubble = true;
            e.returnValue = false;
            return false;
        },

        doc:{
            move: function (e) { S.drag.events.mouse.call(S.drag, e); },
            up: function (e) { S.drag.events.stop.call(S.drag) }
        },

        mouse: function(e){
            this.item.cursor.x = e.clientX + document.body.scrollLeft;
            this.item.cursor.y = e.clientY + document.body.scrollTop;
        },

        drag: function () {
            var item = this.item;
            if (item.hasOnDrag == true) { if (this.items[item.index].onDrag.call(item.options ? (item.options.callee ? item.options.callee : this) : this, item) == false) { return; } }
            var x = (item.pos.x + (item.cursor.x - item.start.x));
            var y = (item.pos.y + (item.cursor.y - item.start.y));
            if (item.options) {
                if (item.options.boundTop != null) {
                    if (item.options.boundTop > y) { y = item.options.boundTop; }
                }
                if (item.options.boundRight != null) {
                    if (item.win.w - item.options.boundRight < x + item.pos.w) { x = item.win.w - item.options.boundRight - item.pos.w; }
                }
                if (item.options.boundBottom != null) {
                    if (item.win.h - item.options.boundBottom < y + item.pos.h) { y = item.win.h - item.options.boundBottom - item.pos.h; }
                }
                if (item.options.boundLeft != null) {
                    if (item.options.boundLeft > x) { x = item.options.boundLeft; }
                }
            }
            item.elem.style.left = x + 'px';
            item.elem.style.top = y + 'px';
        },

        stop: function (index) {
            clearInterval(this.timer);
            $(document).off('mousemove', S.drag.events.doc.move);
            $(document).off('mouseup', S.drag.events.doc.up);
            item = S.drag.items[S.drag.item.index];
            if (typeof item.onStop == 'function') {
                item.onStop.call(item.options ? (item.options.callee ? item.options.callee : this) : this, item);
            }
        }
    }
}
S.hotkeys = {
    keyhold: '',
    keydown: function (e) {
        if ($("input, textarea").is(":focus") == false && $('.textedit.editing').length == 0) {
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
                        break;
                    case 86: //v (paste)
                        return false;
                        break;
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
                            S.editor.hide();
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
                pos = area.offset();
                pos.width = area.width();
                pos.height = area.height();
                div = document.createElement('div');
                id = area.get().id;
                index = area.index();
                total = area.parent().children().length;
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
                if (ispagelvl) {
                    opts.history = 'View page history for \'' + S.page.title + '\'';
                } else {
                    opts.history = 'View block history for \'' + area.attr('data-block') + '\'';
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
                pos = area.offset();
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
S.editor.resize = {
    start: function () {
        S.editor.resize.run();
        S.editor.components.hover.hide();
    },

    go: function () {
        S.editor.resize.run();
    },

    end: function () {
        S.editor.resize.run();
    }, 
    
    run: function () {
        S.editor.components.select.refresh();
        S.editor.window.repositionAll();
    }
}
S.editor.save = { 
    cache: [], _changes: false,

    hasChanges: function(has){
        if (has === true) {
            this._changes = true;
            this.enable();
        } else {
            return this._changes;
        }
    },

    add: function (id, type, obj) {
        var i = -1;
        for (x = 0; x < this.cache.length; x++) {
            if (this.cache[x].id == id && this.cache[x].type == type) {
                i = x; break;
            }
        }
        if (i == -1) {
            i = this.cache.length;
        }
        this.cache[i] = { id: id, type: type, data: obj };
        $('.editor .toolbar .save-page').removeClass('nosave');
    },

    enable: function () {
        $('.editor .toolbar .save-page').removeClass('nosave');
    },

    disable: function () {
        $('.editor .toolbar .save-page').addClass('nosave');
    },

    click: function () {
        if ($('.editor .toolbar .save-page').hasClass('saving nosave saved') == false) {
            var options = {};
            options.save = JSON.stringify(this.cache);
            this.cache = [];
            $('.editor .toolbar .save-page').addClass('saving');
            S.ajax.post("Editor/Page/SaveChanges", options, function () {
                $('.editor .toolbar .save-page').removeClass('saving').addClass('saved');
                setTimeout(function () {
                    $('.editor .toolbar .save-page').removeClass('saved').addClass('nosave')
                }, 2000);
            });
        }
    }
}
S.editor.support = {

    search: function (keywords) {
        S.editor.support.load('Search', { page: 'search', keywords: keywords });
    },

    searchKeyUp: function (e) {
        if(e.keyCode == 13){
            //user pressed enter key
            S.editor.support.search($('#support_search').val());
        }
    },

    glossary: function () {
        S.editor.support.load('Get', { page: 'glossary' });
    },

    page: function (name) {
        S.editor.support.load('Get', { page: name });
    },

    load(action, data) {
        if ($('#winDocumentation').length == 0) {
            S.editor.window.load('Documentation', {
                left: 0,
                top: 0,
                width: 400,
                maxHeight: 800,
                title: '',
                alignTo: 'top-right',
                onLoad: function () {
                    request();
                }
            });
        } else {
            $('#winDocumentation').show();
            request();
        }

        function request() {
            S.ajax.post('Editor/Support/' + action, data, function (data) {
                $('#winDocumentation .content').html(data.d);
                S.editor.window.reposition('Documentation');
                $('.support-search a.search').on('click', function () { S.editor.support.search($('#support_search').val()); });
                $('#support_search').on('keyup', S.editor.support.searchKeyUp);
            });
        }
    }
};
S.editor.toolbar = {
    height: 50,

    dialog: {
        show: function (html) {
            //hide Editor UI elements
            $('.editor .toolbar .container nav.menu').hide();
            $('.editor .toolbar .right-side').hide();
            S.editor.window.hideMenus();
            S.editor.components.select.hide();
            S.editor.components.hover.hide();

            //show toolbar dialog
            $('.editor .toolbar .container .dialog').html(html).show();
        },

        hide: function () {
            $('.editor .toolbar .container .dialog').html('').hide();
            $('.editor .toolbar .container nav.menu').show();
            $('.editor .toolbar .right-side').show();
        }
    }
}
S.viewport.resize = function (width) {
    var webpage = $('.webpage');
    if (webpage.css('maxWidth') == '' || webpage.css('maxWidth') == 'none') {
        webpage.css({ 'maxWidth': webpage.width() });
    }
    webpage.stop().animate({ maxWidth: width }, {
        duration: this.speed * 1000,
        progress: function () {
            if (S.viewport.getLevel() == true) {
                S.viewport.levelChanged(S.viewport.level);
            }
            S.events.doc.resize.trigger();
        },
        complete: function () {
            S.events.doc.resize.trigger();
            S.viewport.getLevel();
            if (S.viewport.isChanging == true) {
                S.viewport.isChanging = false;
                if (S.editor.enabled == true) {
                    S.editor.components.hover.enable();
                }
                S.viewport.levelChanged(S.viewport.level);
            } else {
                if (S.editor.enabled == true) {
                    S.editor.components.select.refresh();
                }
            }
        }
    });
}

S.viewport.view = function (level) {
    //hide selected components
    S.editor.components.hover.disable();
    switch (level) {
        case 4: //HD
            S.viewport.resize(1920); break;

        default: //all other screen sizes
            S.viewport.resize(S.viewport.levels[level]); break;
    }
    S.viewport.isChanging = false;
    S.viewport.levelChanged(level)
    S.viewport.isChanging = true;
}

S.viewport.levelChanged = function (level) {
    if (S.viewport.isChanging == true) { return; }
    S.viewport.sizeIndex = level;
    var screen = 'HD', ext = 'hd';
    switch (level) {
        case 4: //HD
            screen = 'HD'; ext = 'hd'; break;

        case 3: //Desktop
            screen = 'Desktop'; ext = 'desktop'; break;

        case 2: //Tablet
            screen = 'Tablet'; ext = 'tablet'; break;

        case 1: //Mobile Device
            screen = 'Mobile Device'; ext = 'mobile'; break;

        case 0: //Cell Phone
            screen = 'Cell Phone'; ext = 'cell'; break;

    }
    $('.toolbar .menu .screens use').attr('xlink:href', '#icon-screen' + ext)
}

S.viewport.next = function () {
    if (S.editor.enabled == false) { return; }
    var sizeIndex = S.viewport.sizeIndex;
    if (sizeIndex == -1) {
        sizeIndex = S.viewport.level;
    }
    var next = sizeIndex > 0 ? sizeIndex - 1 : 4;
    S.viewport.view(next);
}

S.viewport.previous = function () {
    if (S.editor.enabled == false) { return; }
    var sizeIndex = S.viewport.sizeIndex;
    if (sizeIndex == -1) {
        sizeIndex = S.viewport.level;
    }
    var prev = sizeIndex < 4 ? sizeIndex + 1 : 0;
    S.viewport.view(prev);
}

S.viewport.getLevelOrder = function () {
    this.getLevel();
    var lvl = this.level;
    switch (lvl) {
        case 0:
            return [0, 1, 2, 3, 4];
        case 1:
            return [1, 2, 0, 3, 4];
        case 2:
            return [2, 3, 4, 1, 0];
        case 3:
            return [3, 4, 2, 1, 0];
        case 4:
            return [4, 3, 2, 1, 0];
    }
}
S.editor.window = {
    items: {},

    load: function (id, options) {
        //either create a new modal window or open an existing modal window within the editor
        var win = this.items[id];
        if (!win) {
            //set up window properties & events
            win = {
                //properties
                id: id,
                elem: null,
                classes: options.classes ? option.classes : '',
                title: options.title ? options.title : '',
                icon: options.icon ? options.icon : '',
                width: options.width ? options.width : 500,
                height: options.height ? options.height : 0,
                maxHeight: options.maxHeight ? options.maxHeight : 0,
                left: options.left ? options.left : 0,
                right: options.right ? options.right : null,
                top: options.top ? options.top : 0,
                visible: options.visible === false ? options.visible : true,
                zIndex: options.zIndex ? options.zIndex : 1,

                //aligment logic (middle, top-center, top-left, top-right, bottom-center, bottom-left, bottom-right)
                alignTo: options.alignTo ? options.alignTo : 'top-left',   // (to target side)
                alignAt: options.alignAt ? options.alignAt : 'top-left', // (at window side)
                alignTarget: options.alignTarget ? options.alignTarget : 'window', //element ID, window
                alignPadding: options.alignPadding ? options.alignPadding : 0,

                //options
                hasArrow: options.hasArrow ? options.hasArrow : false,
                hasTitleBar: options.hasTitleBar === false ? options.hasTitleBar : true,
                canMaximize: options.canMaximize ? options.canMaximize : false,
                canClose: options.canClose === false ? options.canClose : true,
                canDrag: options.canDrag === false ? options.canDrag : true,
                snapToEdge: options.snapToEdge === false ? options.snapToEdge : true,
                isDialog: options.isDialog ? options.isDialog : false,
                isMenu: options.isMenu ? options.isMenu : false,
                autoHide: options.autoHide ? options.autoHide : false,

                //events
                onLoad: options.onLoad ? options.onLoad : null,
                onOpen: options.onOpen ? options.onOpen : null,
                onClose: options.onClose ? options.onClose : null,
                onMaximize: options.onMaximize ? options.onMaximize : null,
                onMinimize: options.onMinimize ? options.onMinimize : null,
                onUrlLoad: options.onUrlLoad ? options.onUrlLoad : null,

                //content
                html: options.html ? options.html : '',
                url: options.url ? options.url : '',
                urlData: options.urlData ? options.urlData : (options.data ? options.data : ''),
            }
            //normalize options
            if (win.top < S.editor.toolbar.height) { win.top = S.editor.toolbar.height; }

            //create window element
            var div = document.createElement('div');
            div.id = 'win' + id;
            div.className = 'window' + (win.classes != '' ? ' ' + win.classes : '');

            //align window
            div.style.top = win.top + 'px';

            //z-index
            if (win.zIndex > 0) {
                div.style.zIndex = 4500 + win.zIndex;
            }

            //visible
            if (win.visible == false) { div.style.display = 'none'; }

            //load window scaffolding
            var scaffold = new S.scaffold($('#template_window').html(), {
                'title': win.title,
                'arrow': win.hasArrow,
                'titlebar': win.hasTitleBar,
                'can-maximize': win.canMaximize,
                'can-close': win.canClose,
                'html':win.html
            });
            div.innerHTML = scaffold.render();
            win.elem = div;

            //align arrow
            if (win.hasArrow) {
                var arrow = $(div).find('.arrow');
                switch (win.alignAt) {
                    case 'top-left': case 'top-center': case 'top-right':
                        arrow.addClass('top');
                        break;
                    case 'bottom-left': case 'bottom-center': case 'bottom-right':
                        arrow.addClass('bottom');
                        break;
                }
            }

            //append to windows list
            this.items[id] = win;
            $('.editor .windows').append(div);

            //resize window contents
            var content = $('#win' + id + ' .box > .content').get();
            if (win.height.toString().indexOf('%') < 0) {
                content.style.minHeight = win.height + 'px';
            } else {
                content.style.minHeight = (((S.window.height - win.top) / 100) * parseInt(win.height.replace('%', ''))) + 'px';
            }
            if (win.width.toString().indexOf('%') < 0) {
                content.style.width = win.width + 'px';
            } else {
                content.style.width = (((S.window.width - (win.right || win.left)) / 100) * parseInt(win.width.replace('%', ''))) + 'px';
            }
            if (win.maxHeight > 0) { content.style.maxHeight = win.maxHeight + 'px' }

            //reposition window
            S.editor.window.reposition(id);

            //load initial content from server
            if (win.url != '') {
                S.ajax.post(win.url, win.urlData,
                    function (data) {
                        $('#win' + id + ' .content').html(data.d);
                        S.editor.window.reposition(id);
                        if (win.onUrlLoad) {
                            win.onUrlLoad();
                        }
                    }
                );
            }

            //setup window button events
            $('#win' + id + ' .icon.close').on('click', function () { S.editor.window.close.call(S.editor.window, id) });
            $('#win' + id + ' .icon.maximize').on('click', function () { S.editor.window.maximize.call(S.editor.window, id) });

            //setup titlebar drag event
            if (win.hasTitleBar && win.canDrag) {
                S.drag.add(
                    $('#win' + id + ' .titlebar').get(),
                    $('#win' + id).get(),
                    null, null, null,
                    {
                        boundTop: S.editor.toolbar.height,
                        boundLeft: 0,
                        boundRight: 0,
                        boundBottom: 0
                    }
                );
            }

            //execute loaded callback
            if (win.onLoad) { win.onLoad(); }
        } else {
            //show existing window
            var window = $('#win' + id);
            if (window.get().style.display == 'none') {
                window.show();
                this.reposition(id);
                win.visible = true;
            } else {
                window.hide();
                win.visible = false;
            }
        }
        if (win.onOpen && win.visible == true) { win.onOpen(); }
    },

    close: function (id) {
        var win = this.items[id];
        $('#win' + id).hide();
        this.items[id].visible = false;

        if (win.isDialog == true) {
            //hide dialog modal background
        }
    },

    repositionAll: function () {
        for (var id in this.items) {
            S.editor.window.reposition(id);
        }
    },

    reposition: function (id){
        var win = this.items[id];

        if (win.alignTarget == 'window') {
            //align to document body
            var div = win.elem;
            if (win.right != null) {
                div.style.right = win.right + 'px';
            } else {
                div.style.left = win.left + 'px';
            }
        } else {
            //align to target element
            var target = { x: 0, y: 0 };
            var box = { x: 0, y: 0 };
            var elem = $(win.alignTarget);
            var pos = elem.offset();
            var arrowPad = win.hasArrow ? 25 : 0;
            var arrow = { elem: $(win.elem).find('.box > .arrow'), x: 0, w: 50 };
            pos.width = elem.width();
            pos.height = elem.height();
            target.pos = pos;

            //get alignment for target
            if(elem.length == 1){
                switch (win.alignTo) {
                    case 'top-center':
                        target.x = pos.width / 2;
                        break;
                    case 'top-right':
                        target.x = pos.width;
                        break;
                    case 'bottom-left':
                        target.y = pos.height;
                        break;
                    case 'bottom-center':
                        target.y = pos.height;
                        target.x = pos.width / 2;
                        break;
                    case 'bottom-right':
                        target.y = pos.height;
                        target.x = pos.width;
                        break;
                }

                //get alignment for window
                elem = $(win.elem);
                pos = elem.offset();
                pos.width = elem.width();
                pos.height = elem.height();
                box.pos = pos;

                switch (win.alignAt) {
                    case 'top-left':
                        box.y -= win.alignPadding + arrowPad;
                        break;
                    case 'top-center':
                        box.y -= win.alignPadding + arrowPad;
                        box.x = pos.width / 2;
                        break;
                    case 'top-right':
                        box.y -= win.alignPadding + arrowPad;
                        box.x = pos.width;
                        break;
                    case 'bottom-left':
                        box.y = pos.height + win.alignPadding + arrowPad;
                        break;
                    case 'bottom-center':
                        box.y = pos.height + win.alignPadding + arrowPad;
                        box.x = pos.width / 2;
                        break;
                    case 'bottom-right':
                        box.y = pos.height + win.alignPadding + arrowPad;
                        box.x = pos.width;
                        break;
                }

                //realign arrow
                if(win.hasArrow){
                    switch (win.alignAt) {
                        case 'bottom-left': case 'bottom-center': case 'bottom-right':
                            arrow.elem.css({ top: pos.height });
                            break;
                    }
                    switch (win.alignAt) {
                        case 'top-left': case 'bottom-left':
                            arrow.x = 0;
                            break;
                        case 'top-center': case 'bottom-center':
                            arrow.x = box.x - (arrow.w / 2);
                            break;
                        case 'top-right': case 'bottom-right':
                            arrow.x = pos.width - arrow.w;
                            break;
                    }
                    arrow.elem.css({ left: arrow.x });
                }

                //align window to target
                elem.css({
                    left: target.pos.left + target.x - box.x,
                    top: target.pos.top + target.y - box.y
                });
            }
        }
    },

    maximize: function (id) {
        var win = this.items[id];
    },

    click: function (target, type) {
        if ($(target).parents('.menu').parents('.toolbar').length > 0) { return;}
        if (type != 'window') {
            for (var id in this.items) {
                if (this.items[id].isDialog) {
                    this.hideDialog(id);
                } else if (this.items[id].isMenu) {
                    this.hideMenu(id);
                }
            }
        }
    },

    hideDialog: function (id) {
        var win = this.items[id];
        if (win.isDialog) { $(win.elem).hide(); }
    },

    hideMenu: function (id) {
        var win = this.items[id];
        if (win.isMenu) { $(win.elem).hide(); }
    },

    hideMenus: function () {
        for (var id in this.items) {
            var win = this.items[id];
            if (win.isMenu) { $(win.elem).hide(); }
        }
    },

    hideDialogs: function () {
        for (var id in this.items) {
            var win = this.items[id];
            if (win.isDialog) { $(win.elem).hide(); }
        }
    }


}
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