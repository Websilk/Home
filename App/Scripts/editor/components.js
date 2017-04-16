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