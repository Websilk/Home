S.editor.components = {
    list: {
        panels:[], hoverIndex:0, hoverStart:true, hoverComp:1,

        init: function(){
            //set up drag event for components window icons
            $('#winComponents .component-icon').each(function (e) {
                var a = S.editor.components.list.drag;
                S.drag.add(e, e, a.start, a.go, a.end, { useElemPos: true, callee: S.editor.components.list, speed: 1000 / 30 });
            });
        },

        drag: {
            panel: null, component: null, drop: 'after',

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
                this.panels = [];
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
                    S.editor.components.list.panels.push({ 
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
                var panel = this.panels[this.hoverIndex];
                var cursor = { left: item.cursor.x, top: item.cursor.y, right: item.cursor.x + 1, bottom: item.cursor.y + 1 };
                var curr = null;
                var comp;

                if (!S.math.intersect(panel.rect, cursor) || this.hoverStart == true) {
                    //intersecting a different cell
                    var found = false;
                    for (var x = 0; x < this.panels.length; x++) {
                        panel = this.panels[x];
                        if (S.math.intersect(panel.rect, cursor)) {
                            this.hoverIndex = x;
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        // generate box around currently hovered panel cell
                        var div = document.createElement('div');
                        div.className = "cellbox";
                        div.style.left = panel.rect.left + 'px';
                        div.style.top = panel.rect.top + 'px';
                        div.style.width = panel.width + 'px';
                        div.style.height = panel.height + 'px';
                        $('.editor > .temp > .cellbox').remove();
                        $('.editor > .temp > .compline').remove();
                        $('.editor > .temp').append(div);
                        this.hoverComp = 1;
                        this.drag.drop = '';
                    } else {
                        panel = this.panels[0];
                        this.hoverIndex = 0;
                    }
                    
                    
                    if (this.hoverStart == true) { this.hoverStart = false; }
                }

                //detect which two components the cursor is between
                this.drag.panel = panel.elem;
                if (panel.comps) {
                    var cy = cursor.top;
                    var cx = cursor.left;
                    for (var x = 0; x < panel.comps.length; x++) {
                        comp = panel.comps[x].rect;
                        if (cy >= (comp.top + (comp.bottom - comp.top) / 5)) {
                            if (cy <= comp.bottom + 30) {
                                if (cx >= (comp.left + (comp.right - comp.left) / 2.5)) {
                                    curr = panel.comps[x];
                                }
                            } else {
                                curr = panel.comps[x];
                            }
                        } else {
                            break;
                        }
                    }
                    if (curr != null) {
                        if (curr.elem != this.hoverComp && this.drag.drop != 'after') {
                            this.compline(curr.elem, 'after', comp.right, comp.top, curr.height);
                            this.hoverComp = curr.elem;
                        }
                    }
                }
                if (curr == null && this.hoverComp != 1) {
                    //load component line before first component
                    this.hoverComp = 1;
                    if (panel.comps.length > 0) {
                        comp = panel.comps[0];
                        this.compline(comp.elem, 'before', comp.rect.left, comp.rect.top, comp.height);
                        console.log('2');
                    } else {
                        this.compline(null, 'before', panel.rect.left + ((panel.rect.right - panel.rect.left) / 2), panel.rect.top, panel.height);
                        console.log('3'); 
                    }
                } else if (found == true) {
                    if (panel.comps.length > 0) {
                        var lf = 0;
                        var drop;
                        if (cursor.top > panel.rect.top + ((panel.rect.bottom - panel.rect.top) / 2)) {
                            comp = panel.comps[panel.comps.length - 1];
                            lf = comp.rect.right;
                            drop = 'after';
                        } else {
                            comp = panel.comps[0];
                            lf = comp.rect.left;
                            drop = 'before';
                        }
                        this.compline(comp.elem, drop, lf, comp.rect.top, comp.height);
                        console.log('4');
                    } else {
                        this.compline(null, 'before', panel.rect.left + ((panel.rect.right - panel.rect.left) / 2), panel.rect.top, panel.height);
                        console.log('5');
                    }
                }
            },

            end: function (item) {
                $('.editor > .clone *, .editor > .temp > .cellbox, .editor > .temp > .compline').remove();
                $('body').removeClass('drag-component');

                //send an AJAX request to create the new component on the page
                var data = {
                    name: '',
                    panelId: '',
                    cellId: '',
                    componentIndex: 0
                };
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