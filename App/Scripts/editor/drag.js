S.drag = {
    items: [], timer: null, 
    
    item:{
        index: null,
        elem: null,
        pos: { x: 0, y: 0 },
        start:{ x: 0, y: 0 },
        cursor:{ x: 0, y: 0 }
    },

    add: function (elem, dragElem, onStart, onDrag, onStop) {
        this.items.push({ elem: elem, dragElem: dragElem, onStart: onStart, onDrag: onDrag, onStop: onStop });
        var x = this.items.length - 1;
        $(elem).on('mousedown', function (e) { S.drag.events.start.call(S.drag, x, e) });
        $(elem).on('mouseup', function () { S.drag.events.stop.call(S.drag, x) });
    },

    events: {
        start: function (index, e) {
            var item = this.items[index];
            var elem = $(item.dragElem);
            var pos = elem.pos();

            this.item.index = index;
            this.item.elem = item.dragElem;
            this.item.start.x = e.clientX;
            this.item.start.y = e.clientY;
            this.item.pos.x = pos.left;
            this.item.pos.y = pos.top;

            //set up drag timer
            $(document).on('mousemove', function (e) { S.drag.events.mouse.call(S.drag, e); });
            clearTimeout(this.timer);
            this.timer = setTimeout(function () { S.drag.events.drag.call(S.drag); }, 1000 / 30);

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

        mouse: function(e){
            this.item.cursor.x = e.clientX;
            this.item.cursor.y = e.clientY;
        },

        drag: function () {
            var item = this.item;
            item.elem.style.left = (item.pos.x + (item.cursor.x - item.start.x)) + 'px';
            item.elem.style.top = (item.pos.y + (item.cursor.y - item.start.y)) + 'px';
        },

        stop: function (index) {
            item = this.items[index];
            if (typeof item.onStop == 'function') {
                item.onStop();
            }
        }
    }
}