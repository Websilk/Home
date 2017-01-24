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
        this.items.push({ elem: elem, dragElem: dragElem, onStart: onStart, onDrag: onDrag, onStop: onStop, options: options });
        var x = this.items.length - 1;
        $(elem).on('mousedown', function (e) { S.drag.events.start.call(S.drag, x, e) });
    },

    events: {
        start: function (index, e) {
            var item = this.items[index];
            var elem = $(item.dragElem);
            var pos = elem.position();
            var win = $(window);

            this.item = {
                index:index,
                elem: item.dragElem,
                win:{
                    w: win.width(),
                    h: win.height()
                },
                start:{
                    x: e.clientX,
                    y: e.clientY
                },
                cursor:{
                    x: e.clientX,
                    y: e.clientY
                },
                pos:{
                    x: pos.left,
                    y: pos.top,
                    w: elem.width(),
                    h: elem.height()
                },
                options: item.options,
                hasOnDrag: typeof item.onStop == 'function'
            }


            //set up document-level drag events
            $(document).on('mousemove', S.drag.events.doc.move);
            $(document).on('mouseup', S.drag.events.doc.up);
            clearInterval(this.timer);
            this.timer = setInterval(function () { S.drag.events.drag.call(S.drag); }, 1000 / 30);

            if (typeof item.onStart == 'function') {
                item.onStart();
            }

            //don't let drag event select text on the page
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
            e.cancelBubble = true;
            e.returnValue = false;
            return false;
        },

        doc:{
            move: function (e) { S.drag.events.mouse.call(S.drag, e); },
            up: function () { S.drag.events.stop.call(S.drag) }
        },

        mouse: function(e){
            this.item.cursor.x = e.clientX;
            this.item.cursor.y = e.clientY;
        },

        drag: function () {
            var item = this.item;
            var x = (item.pos.x + (item.cursor.x - item.start.x));
            var y = (item.pos.y + (item.cursor.y - item.start.y));
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
            item.elem.style.left = x + 'px';
            item.elem.style.top = y + 'px';
            if (item.hasOnDrag == true) { this.items[item.index].onDrag();}
        },

        stop: function (index) {
            clearInterval(this.timer);
            $(document).off('mousemove', S.drag.events.doc.move);
            $(document).off('mouseup', S.drag.events.doc.up);
            item = S.drag.items[S.drag.item.index];
            if (typeof item.onStop == 'function') {
                item.onStop();
            }
        }
    }
}