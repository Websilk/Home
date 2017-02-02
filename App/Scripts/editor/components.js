S.editor.components = {
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

                if (!S.math.intersect(cell.rect, cursor) || this.hoverStart === true) {
                    //intersecting a different cell
                    var found = false;
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
                    for (var x = 0; x < cell.comps.length; x++) {
                        comp = cell.comps[x].rect;
                        if (cy >= comp.top + (comp.bottom - comp.top) / 5) {
                            if (cy <= comp.bottom + 30) {
                                if (cx >= comp.left + (comp.right - comp.left) / 2.5) {
                                    curr = cell.comps[x];
                                }
                            } else {
                                curr = cell.comps[x];
                            }
                        } else {
                            break;
                        }
                    }
                    if (curr !== null) {
                        if (curr.elem !== this.hoverComp && this.drag.drop !== 'after') {
                            this.compline(curr.elem, 'after', comp.right, comp.top, curr.height);
                            this.hoverComp = curr.elem;
                        }
                    }
                }
                if (curr === null && this.hoverComp !== 1) {
                    //load component line before first component
                    this.hoverComp = 1;
                    if (cell.comps.length > 0) {
                        comp = cell.comps[0];
                        this.compline(comp.elem, 'before', comp.rect.left, comp.rect.top, comp.height);
                        console.log('2');
                    } else {
                        this.compline(null, 'before', cell.rect.left + ((cell.rect.right - cell.rect.left) / 2), cell.rect.top, cell.height);
                        console.log('3'); 
                    }
                } else if (found === true) {
                    if (cell.comps.length > 0) {
                        var lf = 0;
                        var drop;
                        if (cursor.top > cell.rect.top + ((cell.rect.bottom - cell.rect.top) / 2)) {
                            comp = cell.comps[cell.comps.length - 1];
                            lf = comp.rect.right;
                            drop = 'after';
                        } else {
                            comp = cell.comps[0];
                            lf = comp.rect.left;
                            drop = 'before';
                        }
                        this.compline(comp.elem, drop, lf, comp.rect.top, comp.height);
                        console.log('4');
                    } else {
                        this.compline(null, 'before', cell.rect.left + ((cell.rect.right - cell.rect.left) / 2), cell.rect.top, cell.height);
                        console.log('5');
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
                console.log(data);
                S.ajax.post('Editor/Components/Create', data, function (d) {
                    S.ajax.callback.inject(d);
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

    events: {
        init: function () {
            //set up events for all components on the page
            $('.webpage .component').off().on('mouseover', S.editor.components.events.mouseover);
            $('.webpage .component').off().on('mouseout', S.editor.components.events.mouseout);
        },

        mouseover: function (e) {

        },

        mouseout: function (e) {

        },

        drag: {

        }
    }
};