S.editor.components = {
    hovered: null, selected: null,
    // the list of components loaded within the component window /////////////////////////////////////////////////
    list: { 
        cells:[], hoverIndex:0, hoverStart:true, hoverComp:1,

        init: function(){
            //set up drag event for components window icons
            $('#winComponents .component-icon').each(function (e) {
                var a = S.editor.components.list.drag;
                S.drag.add(e, e, a.start, a.go, a.end, { useElemPos: true, callee: S.editor.components.list, speed: 1000 / 30 });
            });
        },

        drag: {
            cell: null, component: null, drop: 'after',

            start: function(item){
                //drag new component onto the page from the components window
                //clone component icon from window
                var clone = item.elem.cloneNode(true);
                $('.editor > .clone').append(clone);
                this.hoverIndex = 0;
                this.hoverStart = true;
                S.editor.components.select.hide();
                S.editor.components.hover.hide();

                //override drag element object with clone
                item.dragElem = clone;

                //update body tag
                $('body').addClass('drag-component');

                //get list of panel cells on page
                this.cells = [];
                $('.is-cell').each(function(e){
                    var el = $(e);
                    var pof = el.offset();
                    var pdim = { width: el.width(), height: el.height() };

                    //get list of components within panel cell
                    var comps = [];
                    el.find('.component').each(function(c){
                        var ce = $(c);
                        var of = ce.offset();
                        var dim = { width:ce.width(), height:ce.height() };
                        comps.push({ 
                            elem: c, 
                            rect: { 
                                left: of.left, right: of.left + dim.width, top: of.top, bottom: of.top + dim.height 
                            }, 
                            width: dim.width, 
                            height: dim.height 
                        });
                    });
                    //sort components based on top left position
                    comps.sort(function (a, b) {
                        var c = a.rect.top - b.rect.top;
                        if (c == 0) {
                            return a.rect.left - b.rect.left;
                        } else { return c;}
                    });

                    //add panel cell to list
                    S.editor.components.list.cells.push({ 
                        elem: e, 
                        rect: { 
                            left: pof.left, right: pof.left + pdim.width, top: pof.top, bottom: pof.top + pdim.height 
                        }, 
                        width: pdim.width, 
                        height: pdim.height,
                        comps: comps
                    });
                });
            },

            go: function (item) {
                //detect currently hovered panel
                var cell = this.cells[this.hoverIndex];
                var cursor = { left: item.cursor.x, top: item.cursor.y, right: item.cursor.x + 1, bottom: item.cursor.y + 1 };
                var curr = null;
                var comp;
                var found = false;

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
                        $('.editor > .temp > .compline').remove();
                        $('.editor > .temp').append(div);
                        this.hoverComp = 1;
                        this.drag.drop = '';
                    } else {
                        cell = this.cells[0];
                        this.hoverIndex = 0;
                    }
                    
                    
                    if (this.hoverStart === true) { this.hoverStart = false; }
                }

                //detect which two components the cursor is between
                this.drag.cell = cell.elem;
                if (cell.comps) {
                    var cy = cursor.top;
                    var cx = cursor.left;
                    var rectx = 0;
                    var drop = 'after';
                    for (var x = 0; x < cell.comps.length; x++) {
                        comp = cell.comps[x].rect;
                        if (cy >= comp.top) {
                            if (cy <= comp.bottom) {
                                if (cx >= comp.left + ((comp.right - comp.left) / 2.5)) {
                                    curr = cell.comps[x];
                                    rectx = curr.rect.right;
                                    drop = 'after';
                                } else if(curr == null) {
                                    curr = cell.comps[x];
                                    rectx = curr.rect.left;
                                    drop = 'before';
                                }
                            }
                        } else { break; }
                    }
                    
                    if (curr !== null) {
                        if (curr.elem !== this.hoverComp || this.drag.drop != drop) {
                            this.compline(curr.elem, drop, rectx, curr.rect.top, curr.height);
                            this.hoverComp = curr.elem;
                            return;
                        } else if (curr.elem == this.hoverComp) { return;}
                    }
                }
                if (curr === null && this.hoverComp !== 1) {
                    //load component line before first component
                    this.hoverComp = 1;
                    if (cell.comps.length > 0) {
                        comp = cell.comps[cell.comps.length - 1];
                        if (cursor.top > comp.rect.bottom) {
                            //after last component in cell
                            this.compline(comp.elem, 'after', comp.rect.right, comp.rect.top, comp.height);
                        } else {
                            //before first component in cell
                            comp = cell.comps[0];
                            this.compline(comp.elem, 'before', comp.rect.left, comp.rect.top, comp.height);
                        }
                    } else {
                        this.compline(null, 'before', cell.rect.left + ((cell.rect.right - cell.rect.left) / 2), cell.rect.top, cell.height);
                    }
                } else if (found === true) {
                    //cursor moved from one cell to another
                    if (cell.comps.length > 0) {
                        if (cursor.top > cell.rect.top + ((cell.rect.bottom - cell.rect.top) / 2)) {
                            //after last component in cell
                            comp = cell.comps[cell.comps.length - 1];
                            this.compline(comp.elem, 'after', comp.rect.right, comp.rect.top, comp.height);
                        } else {
                            //before first component in cell
                            comp = cell.comps[0];
                            this.compline(comp.elem, 'before', comp.rect.left, comp.rect.top, comp.height);
                        }
                        
                    } else {
                        //before first component in cell
                        this.compline(null, 'before', cell.rect.left + ((cell.rect.right - cell.rect.left) / 2), cell.rect.top, cell.height);
                    }
                }
            },

            end: function (item) {
                $('.editor > .clone *, ' +
                  '.editor > .temp > .cellbox, ' +
                  '.editor > .temp > .compline').remove();
                $('body').removeClass('drag-component');

                //send an AJAX request to create the new component on the page
                var cid = '';
                if (this.drag.component) { cid = this.drag.component.id; }
                if (cid.length > 0) { cid = cid.substring(1);}
                var data = {
                    name: item.elem.getAttribute('data-id'),
                    layerId: S.page.id,
                    panelId: $(this.drag.cell).parent('.is-panel').get(0).id.replace('panel_',''),
                    cellId: this.drag.cell.id.replace('cell_', ''),
                    componentId: cid,
                    append: this.drag.drop === 'after' ? 1 : 0
                };
                S.ajax.post('Editor/Components/Create', data, function (d) {
                    S.ajax.callback.inject(d);
                    S.editor.components.select.init(); //reinitialize component events
                });
            }
        },

        compline: function (elem, drop, left, top, height) {
            //display a dotted line to show where the new component 
            //will be dropped (between two components on the page)
            var div = document.createElement('div');
            div.className = "compline";
            div.style.left = left + 'px';
            div.style.top = top + 'px';
            div.style.width = '1px';
            div.style.height = height + 'px';
            $('.editor > .temp > .compline').remove();
            $('.editor > .temp').append(div);
            this.drag.component = elem;
            this.drag.drop = drop;
        }
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
        },

        show: function (e) {
            S.editor.components.selected = e;
            this.refresh();
            this.elem.compSel.show();
            this.visible = true;
        },

        hide: function(){
            this.elem.compSel.hide();
            this.visible = false;
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
            var rightspace = win.w - (pos.left - this.pad + maxw);
            var bottomspace = win.h - (pos.top - this.pad + maxh);

            //set up select box dimensions (with window-bound constraints)
            var box = {
                x: pos.left - this.pad < 0 ? 0 : pos.left - this.pad, 
                y: pos.top - this.pad < S.editor.toolbar.height ? S.editor.toolbar.height : pos.top - this.pad,
                w: rightspace < 0 ? maxw + rightspace : maxw, 
                h: bottomspace < 0 ? maxh + bottomspace : maxh };

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
        pad:13, timer:{ date: new Date(), timeout: 250}, isdragging: false, trigdrag: false,

        init: function(){
            $('.webpage .component').off().on('hover', function (e) { S.editor.components.hover.mouseover.call(S.editor.components.hover, e.target); });
            this.elem.compHover.off().on('mouseleave', function (e) { S.editor.components.hover.mouseout.call(S.editor.components.hover, e.target); });

            var e = $('.editor > .component-hover').get();
            S.drag.add(e, e, this.dragStart, this.drag, this.dragEnd, { callee: this, speed: 1000 / 30 });
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
            if (this.isdragging == true) { return;}
            var el = $(e);
            var sel = null;
            if (S.editor.components.selected !== null) {
                sel = S.editor.components.selected.get();
            }
            if (e == sel) { return; }

            //check for root-level component
            if (el.parents('.component').length == 0) {
                //select bottom-most element
                this.hovered(el);
                return;
            }
            //check for hovered component as child of selected component
                
            var parents = el.parents('.component');
            if (parents.length > 0) {
                if (parents[0].get() == sel) {
                    this.hovered(el);
                    return;
                } else {
                    for (var x = 0; x < parents.length; x++) {
                        if (parents[x].get() == sel) {
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

        dragStart: function (item) {
            this.isdragging = true;
            this.timer.date = new Date();
            this.trigdrag = false;
            this.elem.compHover.hide();
            item.dragElem = S.editor.components.hovered.get();
        },

        drag: function (item) {
            if (this.trigdrag == false) {
                var cx = item.start.x - item.cursor.x;
                var cy = item.start.y - item.cursor.y;
                if (cx < 0) { cx = cx * -1; }
                if (cy < 0) { cy = cy * -1; }
                if (new Date() - this.timer.date > this.timer.timeout || cx + cy > 8) {
                    var pos = S.editor.components.hovered.position();
                    S.editor.components.hovered.css({ 'position': 'absolute', left: pos.left, top: pos.top });
                    S.editor.components.select.hide();
                    this.trigdrag = true;
                }
                return false;
            }
            
        },

        dragEnd: function (item) {
            this.isdragging = false;
            if (this.trigdrag == false) {
                //register click event instead of drag event
                S.editor.components.select.show(S.editor.components.hovered); return;
            } else {
                //finish dragging component
                S.editor.components.hovered.css({ 'position': '', top:'', left:'' });
                S.editor.components.hovered = null;
            }
        },

        refresh: function () {
            //recalculate dimenions for the component select box
            if (S.editor.components.hovered === null) { return false; }
            var hovered = S.editor.components.hovered;
            var pos = hovered.offset();
            var w = hovered.width();
            var h = hovered.height();
            //resize hover box
            this.elem.compHover.css({ top: pos.top - this.pad, left: pos.left - this.pad, width: w + (this.pad * 2), height: h + (this.pad * 2) });
        }
    }
};