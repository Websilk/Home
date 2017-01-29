S.editor.components = {
    list:{
        init: function(){
            //set up drag event for components window icons
            $('#winComponents .component-icon').each(function (e) {
                var a = S.editor.components.list.drag;
                S.drag.add(e, e, a.start, a.go, a.end, { useElemPos: true });
            });
        },

        drag: {
            start: function(item){
                //drag new component onto the page from the components window
                //clone component icon from window
                var clone = item.elem.cloneNode(true);
                $('.editor > .clone').append(clone);

                //override drag element object with clone
                item.dragElem = clone;

                //update body tag
                $('body').addClass('drag-component');
            },

            go: function (item) {
                //detect currently hovered panel

                //detect the space between components
            },

            end: function (item) {
                $('.editor > .clone *').remove();

                //update body tag
                $('body').removeClass('drag-component');
            }
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