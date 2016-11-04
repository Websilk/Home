﻿S.components = {
    items: [],
    types: [],

    add: function (id, name, refs) {
        //add a component reference to the page
        //refs = array of DOM element id references that belong to the component instance
        if (!this.items.some(function (a) { a.id == id })) {
            //component is unique
            this.items.push({ id: id, name: name, refs: refs });
        } else {
            console.log('component is already loaded onto the page');
        }
    },

    addReferences(name, refs) { 
        //add DOM element id references to a component type
        var index = -1;
        if (this.types.length > 0) {
            index = this.types.map(function (a) { return a.name }).indexOf(name);
        }
        if (index >= 0) {
            //add references to existing object
            this.types[index].refs = this.types[index].refs.concat(refs);
        } else {
            //add references to new object
            this.types.push({ name: name, refs: refs });
        }
    },

    remove: function (id) {
        //removes a component from the page, along with any references to the component
        if (this.items.length > 0) {
            var index = this.items.map(function (a) { return a.id }).indexOf(id);
            var item = this.items[index];

            //check to see if there are any other components on the page of the same type
            if (this.items.find(function (a) { return a.name == item.name && a.id != item.id; }).length == 0) {
                //no more components of the same type exist
            }

            //remove DOM elements on the page that are referenced in this component references
            for (var ref in item.refs) {
                $('#' + ref).remove();
            }

            //finally, remove the component DOM element from the page & remove the item from the array
            $('#c' + item.id).remove();
            this.items.splice(index, 1);
        }
    }
}