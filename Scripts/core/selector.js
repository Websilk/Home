//Websilk Selector Framework (replaces jQuery)

//private selector object
(function(){
    var pxStyles = ['top', 'right', 'bottom', 'left'];
    var pxStylesSuffix = ['Top', 'Right', 'Bottom', 'Left'];
    var pxStylesPrefix = ['border', 'padding', 'margin'];

    function select(sel) {
        //main function
        var self = this;
        this.elements = query(document, sel);
        return this;
    }

    function query(elem, sel) {
        //gets a list of elements from a CSS selector
        var elems = [];
        if (sel != null && typeof sel != 'object') {
            //only use vanilla Javascript to select DOM elements based on a CSS selector (Chrome 1, IE 9, Safari 3.2, Firefox 3.5, Opera 10)
            var sels = sel.split(',').map(Function.prototype.call, String.prototype.trim);
            var el;
            var optimize = true;
            for(var s of sels) {
                //check if we can optimize our query selector
                if (s.indexOf('#') == 0 && s.indexOf(' ') < 0 && elem == document && s.indexOf(':') < 0) {
                } else if (s.indexOf('.') < 0 && s.indexOf(' ') < 0 && s.indexOf(':') < 0) {
                } else if (s.indexOf('.') == 0 && s.indexOf(' ') < 0 && s.indexOf(':') < 0) {
                }else{optimize = false; break;}
            }
            if (optimize == true) {
                //query is optimized, so don't use getQuerySelectorAll
                sels.forEach(function (s) {
                    if (s.indexOf('#') == 0) {
                        if (s.indexOf(' ') < 0 && elem == document && s.indexOf(':') < 0) {
                            //get specific element by ID
                            el = document.getElementById(s.replace('#', ''));
                            if (el) { elems.push(el); }
                        }
                    } else if (s.indexOf('.') < 0 && s.indexOf(' ') < 0 && s.indexOf(':') < 0) {
                        //get elements by tag name
                        el = elem.getElementsByTagName(s);
                        if (el) {
                            if (el.length > 0) {
                                for(var e of el) {
                                    //convert node list into array
                                    elems.push(e);
                                }
                            }
                        }
                    } else if (s.indexOf('.') == 0 && s.indexOf(' ') < 0 && s.indexOf(':') < 0) {
                        //get elements by class name(s)
                        el = elem.getElementsByClassName(s.replace(/\./g, ' ').trim());
                        if (el) {
                            if (el.length > 0) {
                                for(var e of el) {
                                    //convert node list into array
                                    elems.push(e);
                                }
                            }
                        }
                    }
                });
            } else {
                //query is not optimized, last resort is to use querySelectorAll
                var q = elem.querySelectorAll(sel);
                for(var e of q) {
                    //convert node list into array
                    elems.push(e);
                }
            }
        } else if (typeof sel == 'object') {
            //elements are already defined instead of using a selector /////////////////////////////////////
            if (sel.length > 1) {
                elems = sel;
            } else {
                elems = [sel];
            }
        } else {
            elems.length = 0;
        }
        return elems;
    }

    function styleName(str) {
        //gets the proper style name from shorthand string
        //for example: border-width translates to borderWidth;
        if (str.indexOf('-') < 0) {
            return str
        }else{
            var name = '';
            var chr = '';
            var cap = false;
            for (var x = 0; x < str.length; x++) {
                chr = str[x];
                if (chr == '-') {
                    cap = true;
                } else {
                    if (cap == true) {
                        cap = false;
                        name += chr.toUpperCase();
                    } else {
                        name += chr;
                    }
                }
            }
            return name;
        }
    }

    function setStyle(e, name, val) {
        //properly set a style for an element
        var v = val;
        if (Number.isInteger(val)) {
            //check for numbers that should be using 'px';
            if (Number(val) != 0) {
                if (pxStyles.indexOf(name) >= 0) {

                } else if (pxStylesPrefix.some(function (a) { name.indexOf(a) == 0 })) {
                    if (pxStylesSuffix.some(function (a) { name.indexOf(a) > 0 })) {
                        v = val + 'px';
                    }
                }
            }
        }
        e.style[name] = v;
    }

    //functions that are accessable by return object ////////
    select.prototype.add = function (elems) {
        //Add new (unique) elements to the existing elements array
        elems.forEach(function (e) {
            //check for duplicates
            if (this.elements.indexOf(e) < 0) {
                //element is unique
                this.elements.push(e);
            }
        })
        return this;
    }

    select.prototype.addClass = function(classes) {
        //Add class name to each of the elements in the collection. 
        //Multiple class names can be given in a space-separated string.
        if (this.elements.length > 0) {
            var classList = classes.split(' ');
            this.elements.forEach(function (e) {
                //alter classname for each element in selector
                var className = e.className;
                var list = className.split(' ');
                classList.forEach(function (c){
                    if(!list.indexOf(c)){
                        //class doesn't exist in element classname list
                        className += ' ' + c;
                    }
                });
                //finally, change element classname if it was altered
                if (e.className != className) { e.className = className;}
            });
        }
        
        return this;
    }

    select.prototype.after = function(content) {
        //Add content to the DOM after each elements in the collection. 
        //The content can be an HTML string, a DOM node or an array of nodes.
        var obj;
        if (typeof content == 'function') {
            //handle content as function (get value from content function execution)
            obj = content();
        } else { obj = content; }

        if (Array.isArray(obj)) {
            //handle content as array
            for(var o of obj) {
                this.after(o);
            }
            return this;
        }
        if (obj == null) { return this; }
        if (typeof obj== 'string') {
            this.elements.forEach(function (e) {
                e.insertAdjacentHTML('afterend', content);
            });
        } else if (typeof obj == 'object') {
            this.elements.forEach(function (e) {
                var parent = e.parentNode;
                parent.insertBefore(content, e.nextSibling);
            });
        }
        return this;
    }

    select.prototype.append = function (content) {
        //Append content to the DOM inside each individual element in the collection. 
        //The content can be an HTML string, a DOM node or an array of nodes.
        return this;
    }

    select.prototype.appendTo = function(target) {
        //Append elements from the current collection to the target element. 
        //This is like append, but with reversed operands.
        return this;
    }

    select.prototype.attr = function(name) {
        //Read or set DOM attributes. When no value is given, reads 
        //specified attribute from the first element in the collection. 
        //When value is given, sets the attribute to that value on each element 
        //in the collection. When value is null, the attribute is removed  = function(like with removeAttr). 
        //Multiple attributes can be set by passing an object with name-value pairs.
        return this;
    }

    select.prototype.before = function(content) {
        //Add content to the DOM before each element in the collection. 
        //The content can be an HTML string, a DOM node or an array of nodes.
        var obj;
        if (typeof content == 'function') {
            //handle content as function (get value from content function execution)
            obj = content();
        } else { obj = content; }

        if (Array.isArray(obj)) {
            //handle content as array
            for(var o of obj) {
                this.after(o);
            }
            return this;
        }
        if (obj == null) { return this; }
        if (typeof obj == 'string') {
            this.elements.forEach(function (e) {
                e.insertAdjacentHTML('beforebegin', content);
            });
        } else if (typeof obj == 'object') {
            this.elements.forEach(function (e) {
                var parent = e.parentNode;
                parent.insertBefore(content, e);
            });
        }
        return this;
    }

    select.prototype.children = function(selector) {
        //Get immediate children of each element in the current collection. 
        //If selector is given, filter the results to only include ones matching the CSS select.
        var elems = [];
        this.elements.forEach(function (e) {
            for(var child of e.children) {
                elems.push(child);
            }
        });
        return elems;
    }

    select.prototype.closest = function(selector) {
        //Traverse upwards from the current element to find the first element that matches the select. 
        return this;
    }

    select.prototype.css = function(params) {
        //Read or set CSS properties on DOM elements. When no value is given, 
        //returns the CSS property from the first element in the collection. 
        //When a value is given, sets the property to that value on each element of the collection.

        //Multiple properties can be retrieved at once by passing an array of property names. 
        //Multiple properties can be set by passing an object to the method.

        //When a value for a property is blank  = function(empty string, null, or undefined), that property is removed. 
        //When a unitless number value is given, “px” is appended to it for properties that require units.
        if (typeof params == "object") {
            var hasKeys = false;
            for (var prop in params) {
                //if params is an object with key/value pairs, apply styling to elements
                if (!hasKeys) { hasKeys = true; }
                var name = styleName(prop);
                this.elements.forEach(function (e) {
                    setStyle(e, name, params[prop]);
                });
            }
            if (hasKeys) { return this; }
            if (!hasKeys && Array.isArray(params)) {
                //if params is an array of style names, return an array of style values
                var vals = [];
                this.elements.forEach(function (e) {
                    var props = new Object();
                    params.forEach(function (param) {
                        var prop = e.style[styleName(param)];
                        if (prop) { props[param] = prop; }
                    });
                    vals.push(props);
                });
                return vals;
            }

        } else if (typeof params == 'string') {
            var name = styleName(params);
            if (typeof arguments[1] == 'string') {
                //set a single style property if two string arguments are supplied (key, value);
                this.elements.forEach(function (e) {
                    setStyle(e, name, arguments[1]);
                });
            } else {
                //if params is a string, return a single style property
                if (this.elements.length > 0) {
                    
                    if (this.elements.length == 1) {
                        //return a string value for one element
                        return this.elements[0].style[name];
                    } else {
                        //return an array of strings for multiple elements
                        var vals = [];
                        this.elements.forEach(function (e) {
                            var val = e.style[name];
                            if (val == null) { val = ''; }
                            vals.push(val);
                        });
                        return vals;
                    }
                }
            }
            
        }
        return this;
    }

    select.prototype.each = function(func) {
        //Iterate through every element of the collection. Inside the iterator function, 
        //this keyword refers to the current item  = function(also passed as the second argument to the function). 
        //If the iterator select.prototype.returns false, iteration stops.
        this.elements.forEach(func);
        return this;
    }

    select.prototype.empty = function(func) {
        //Clear DOM contents of each element in the collection.
        this.elements.forEach(function (e) {
            e.innerHTML = '';
        });
        return this;
    }

    select.prototype.eq = function (index) {
        //Reduce the set of matched elements to the one at the specified index
        if (eq > this.elements.length - 1) {
            //out of bounds
            this.elements = [];
        } else if (eq < 0) {
            //negetive index
            if (eq * -1 >= this.elements.length) {
                this.elements = [];
            } else {
                this.elements = [this.elements[(this.elements.length - 1) + eq]];
            }
        } else {
            this.elements = [this.elements[index]];
        }
        return this;
    }

    select.prototype.filter = function(selector) {
        //Filter the collection to contain only items that match the CSS select. 
        //If a select.prototype.is given, return only elements for which the select.prototype.returns a truthy value. 
        var found = query(document, selector);
        var collect = [];
        if (found.length > 0) {
            this.elements.forEach(function (e) {
                if(found.indexOf(e) >= 0){
                    //make sure no duplicates are being added to the array
                    if (collect.indexOf(e) < 0) { collect.push(e); }
                }
            });
        }
        this.elements = collect;
        return this;
    }

    select.prototype.find = function(selector) {
        //Find elements that match CSS selector executed in scope of nodes in the current collection.
        if (this.elements.length > 0) {
            var collect = [];
            this.elements.forEach(function (e) {
                var found = query(e, selector);
                if (found.length > 0) {
                    found.forEach(function (a) {
                        //make sure no duplicates are being added to the array
                        if (collect.indexOf(a) < 0) { collect.push(a); }
                    });
                }
            });
            this.elements = collect;
        }
        return this;
    }

    select.prototype.first = function () {
        if (this.elements.length > 0) {
            this.elements = [this.elements[0]];
        }
        return this;
    }

    select.prototype.get = function(index) {
        //Get all elements or a single element from the current collection. 
        //When no index is given, returns all elements in an ordinary array. 
        //When index is specified, return only the element at that position. 
        return this.elements[index];
    }

    select.prototype.has = function(selector) {
        //Filter the current collection to include only elements that have 
        //any number of descendants that match a selector, or that contain a specific DOM node.
        if (this.elements.length > 0) {
            var collect = [];
            this.elements.forEach(function (e) {
                if (query(e, slector).length > 0) {
                    if (collect.indexOf(e) < 0) { collect.push(e);}
                }
            });
            this.elements = collect;
        }
        return this;
    }

    select.prototype.hasClass = function(classes) {
        //Check if any elements in the collection have the specified class.
        return this;
    }

    select.prototype.height = function(val) {
        //Get the height of the first element in the collection; 
        //or set the height of all elements in the collection.
        return this;
    }

    select.prototype.hide = function() {
        //Hide elements in this collection by setting their display CSS property to none.
        this.elements.forEach(function (e) {
            e.style.display = 'none';
        });
        return this;
    }

    select.prototype.html = function(content) {
        //Get or set HTML contents of elements in the collection. 
        //When no content given, returns innerHTML of the first element. 
        //When content is given, use it to replace contents of each element. 
        if (content == null) {
            if (this.elements.length > 0) {
                return this.elements[0].innerHTML;
            }
        } else {
            this.elements.forEach(function (e) {
                e.innerHTML = content;
            });
        }
        return this;
    }

    select.prototype.index = function() {
        //Get the position of an element. When no element is given, 
        //returns position of the current element among its siblings. 
        //When an element is given, returns its position in the current collection. 
        //Returns -1 if not found.
        return this;
    }

    select.prototype.innerHeight = function (height) {
        //Get the current computed inner height (including padding but not border) for the 
        //first element in the set of matched elements or set the inner height of every matched element
    }

    select.prototype.innerWidth = function (width) {
        //Get the current computed inner width (including padding but not border) for the 
        //first element in the set of matched elements or set the inner width of every matched element
    }

    select.prototype.insertAfter = function(target) {
        //Insert elements from the current collection after the target element in the DOM. 
        //This is like after, but with reversed operands.
        return this;
    }

    select.prototype.insertBefore = function(target) {
        //Insert elements from the current collection before each of the target elements in the DOM. 
        //This is like before, but with reversed operands.
        return this;
    }

    select.prototype.is = function(selector) {
        //Check if the first element of the current collection matches the CSS select.
        return this;
    }

    select.prototype.last = function() {
        //Get the last element of the current collection.
        if (this.elements.length > 0) {
            this.elements = [this.elements[this.elements.length - 1]];
        }
        return this;
    }

    select.prototype.length = function () {
        return this.elements.length;
    }

    select.prototype.map = function(func) {
        //Iterate through every element of the collection. Inside the iterator function, 
        //this keyword refers to the current item  = function(also passed as the second argument to the function). 
        //If the iterator select.prototype.returns false, iteration stops.
        for (var x = 0; x < this.elements.length; x++) {
            if (func(x, this.elements[x]) == false) {
                break;
            }
        }
        return this;
    }

    select.prototype.next = function(selector) {
        //Get the next sibling–optionally filtered by selector–of each element in the collection.
        return this;
    }

    select.prototype.not = function(selector) {
        //Filter the current collection to get a new collection of elements that don’t match the CSS select. 
        //If another collection is given instead of selector, return only elements not present in it. 
        //If a select.prototype.is given, return only elements for which the select.prototype.returns a falsy value. 
        //Inside the function, the this keyword refers to the current element.
        return this;
    }

    select.prototype.off = function (event, func) {
        //remove an event handler
    }

    select.prototype.offset = function(coordinates) {
        //Get position of the element in the document. 
        //Returns an object with properties: top, left, width and height.

        //When given an object with properties left and top, use those values to 
        //position each element in the collection relative to the document.
        return this;
    }

    select.prototype.offsetParent = function() {
        //Find the first ancestor element that is positioned, 
        //meaning its CSS position value is “relative”, “absolute” or “fixed”.
        return this;
    }

    select.prototype.on = function (event, func) {
        //Attach an event handler function for one or more events to the selected elements.
    }

    select.prototype.one = function (event, func) {
        //Attach a handler to an event for the elements. The handler is executed at most once per element per event type
    }

    select.prototype.outerHeight = function () {

    }

    select.prototype.outerWidth = function () {

    }

    select.prototype.parent = function(selector) {
        //Get immediate parents of each element in the collection. 
        //If CSS selector is given, filter results to include only ones matching the select.
        return this;
    }

    select.prototype.parents = function(selector) {
        //Get all ancestors of each element in the collection. 
        //If CSS selector is given, filter results to include only ones matching the select.
        return this;
    }

    select.prototype.position = function() {
        //Get the position of the first element in the collection, relative to the offsetParent. 
        //This information is useful when absolutely positioning an element to appear aligned with another.
        return this;
    }

    select.prototype.prepend = function(content) {
        //Prepend content to the DOM inside each element in the collection. 
        //The content can be an HTML string, a DOM node or an array of nodes.
        return this;
    }

    select.prototype.prependTo = function(target) {
        //Prepend elements of the current collection inside each of the target elements. 
        //This is like prepend, only with reversed operands.
        return this;
    }

    select.prototype.prev = function(selector) {
        //Get the previous sibling–optionally filtered by selector–of each element in the collection.
        return this;
    }

    select.prototype.prop = function(name, val) {
        //Read or set properties of DOM elements. This should be preferred over attr in case of 
        //reading values of properties that change with user interaction over time, such as checked and selected.
        return this;
    }

    select.prototype.remove = function (selector) {
        //Remove the set of matched elements from the DOM
        return this;
    }

    select.prototype.removeAttr = function (attr) {
        //Remove an attribute from each element in the set of matched elements
        return this;
    }

    select.prototype.removeClass = function (className) {
        //Remove a single class, multiple classes, or all classes from each element in the set of matched elements
        return this;
    }

    select.prototype.removeProp = function (prop) {
        //Remove a property for the set of matched elements
        return this;
    }

    select.prototype.show = function () {
        //Display the matched elements
        this.elements.forEach(function (e) {
            e.style.display = '';
        });
        return this;
    }

    select.prototype.siblings = function (selector) {
        //Get the siblings of each element in the set of matched elements, optionally filtered by a selector
        return this;
    }

    select.prototype.slice = function (elems) {
        //Reduce the set of matched elements to a subset specified by a range of indices
        return this;
    }

    select.prototype.text = function () {
        //Get the combined text contents of each element in the set of matched elements, including their descendants, or set the text contents of the matched elements
        return '';
    }

    select.prototype.toggle = function () {
        //Display or hide the matched elements
        return this;
    }

    select.prototype.toggleClass = function (className) {
        //Add or remove one or more classes from each element in the set of matched elements, depending on either the class’s presence or the value of the state argument
        return this;
    }

    select.prototype.val = function (value) {
        //Get the current value of the first element in the set of matched elements or set the value of every matched element
        return '';
    }

    select.prototype.width = function () {
        //Get the current computed width for the first element in the set of matched elements or set the width of every matched element
        return 0;
    }

    select.prototype.wrap = function (elem) {
        //Wrap an HTML structure around each element in the set of matched elements
        return this;
    }

    select.prototype.wrapAll = function (elem) {
        //Wrap an HTML structure around all elements in the set of matched elements
        return this;
    }

    select.prototype.wrapInner = function (elem) {
        //Wrap an HTML structure around the content of each element in the set of matched elements
        return this;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // create public selector object //////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    window.$ = function(selector) {
        if (selector == null) { return;}
        return new select(selector);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // add functionality to the $ object //////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $.ajax = function(url, settings){

    }

})();