// Websilk Selector Framework (replaces jQuery)
// https://github.com/Websilk/Home/blob/master/App/Scripts/core/selector.js

//private selector object
(function () {

    //global variables
    var pxStyles = ['top', 'right', 'bottom', 'left', 'width', 'height'];
    var pxStylesPrefix = ['border', 'padding', 'margin'];
    var pxStylesSuffix = ['Top', 'Right', 'Bottom', 'Left'];
    var listeners = []; //used for capturing event listeners from $('').on 
    //listeners = [{ elem: null, events: [{ name: '', list: [] }] }];

    function select(sel) {
        //main function, instantiated via $(sel)
        var self = this;
        if (sel) { this.elements = query(document, sel); } else { this.elements = []; }
        this.length = this.elements.length;
        return this;
    }

    function query(elem, sel) {
        //gets a list of elements from a CSS selector
        if (elem == null) { return [];}
        var elems = [];
        if (sel != null && typeof sel != 'object' && sel != '') {
            //only use vanilla Javascript to select DOM elements based on a CSS selector (Chrome 1, IE 9, Safari 3.2, Firefox 3.5, Opera 10)
            var sels = sel.split(',').map(Function.prototype.call, String.prototype.trim);
            var el;
            var optimize = true;
            for (var x = 0; x < sels.length; x++) {
            //check if we can optimize our query selector
                var s = sels[x];
                if (s.indexOf('#') == 0 && s.indexOf(' ') < 0 && elem == document && s.indexOf(':') < 0) {
                } else if (s.indexOf('#') < 0 && s.indexOf('.') < 0 && s.indexOf(' ') < 0 && s.indexOf(':') < 0) {
                } else if (s.indexOf('.') == 0 && s.indexOf('.', 1) < 0 && s.indexOf(' ') < 0 && s.indexOf(':') < 0) {
                }else if(s == '*'){
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
                        if (elem == document) {
                            el = document.getElementsByTagName(s);
                        } else {
                            el = elem.querySelectorAll(s);
                        }
                        if (el) {
                            if (el.length > 0) {
                                for (var x = 0; x < el.length; x++) {
                                    //convert node list into array
                                    elems.push(el[x]);
                                }
                            }
                        }
                    } else if (s.split('.').length == 2 && s.indexOf(' ') < 0 && s.indexOf(':') < 0) {
                        //get elements by class name(s)
                        el = elem.getElementsByClassName(s.replace('.', ''));
                        if (el) {
                            if (el.length > 0) {
                                for (var x = 0; x < el.length; x++) {
                                    //convert node list into array
                                    elems.push(el[x]);
                                }
                            }
                        }
                    }
                });
            } else {
                //query is not optimized, last resort is to use querySelectorAll
                el = elem.querySelectorAll(sel);
                for (var x = 0; x < el.length; x++) {
                    //convert node list into array
                    elems.push(el[x]);
                }
            }
        } else if (typeof sel == 'object') {
            //elements are already defined instead of using a selector /////////////////////////////////////
            if (sel.length > 0 && sel.elements && !sel.nodeType) {
                elems = sel.elements;
            } else {
                if (Array.isArray(sel)) {
                    elems = sel;
                } else {
                    elems = [sel];
                }
            }
        } else {
            elems.length = 0;
        }
        return elems;
    }

    function isDescendant(parent, child) {
        //checks if element is child of another element
        var node = child.parentNode;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
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

    function styleShorthand(str) {
        //gets the shorthand style name from proper string
        var reg = new RegExp('[A-Z]');
        if (str.match(reg)) {
            //has capital letter
            var name = '';
            var chr = '';
            for (var x = 0; x < str.length; x++) {
                chr = str[x];
                if (chr.match(reg)) {
                    name += '-' + chr.toLowerCase();
                } else {
                    name += chr;
                }
            }
            return name;
        }
    }

    function getStyle(e, name) {
        return getComputedStyle(e).getPropertyValue(name);
    }

    function setStyle(e, name, val) {
        //properly set a style for an element
        if (e.nodeName == '#text') { return;}
        var v = val;

        //check for empty value
        if (v == '' || v == null) { e.style[name] = v == '' ? null : v; return; }

        //check for numbers that should be using 'px';
        if (Number(v) == v) {
            if (pxStyles.indexOf(name) >= 0) {
                v = val + 'px';
            } else if (pxStylesPrefix.some(function (a) { return name.indexOf(a) == 0 })) {
                if (pxStylesSuffix.some(function (a) { return name.indexOf(a) > 0 })) {
                    v = val + 'px';
                }
            }
        }

        //last resort, set style to string value
        e.style[name] = v;
    }

    function getObj(obj) {
        //get a string from object (either string, number, or function)
        if (typeof obj == 'function') {
            //handle object as function (get value from object function execution)
            return obj();
        }
        return obj;
    }

    function isArray(obj, arrayFunc) {
        //
        if (Array.isArray(obj)) {
            //handle content as array
            for (var x = 0; x < obj.length; x++) {
                arrayFunc(obj[x]);
            }
            return true;
        }
        return false;
    }

    function diffArray(arr, remove) {
        return arr.filter(function (el) {
            return !remove.includes(el);
        });
    }

    function insertContent(obj, elements, stringFunc, objFunc) {
        //checks type of object and execute callback functions depending on object type
        if (typeof obj == 'string') {
            elements.forEach(function (e) {
                stringFunc(e);
            });
        } else if (typeof obj == 'object') {
            elements.forEach(function (e) {
                objFunc(e);
            });
        }
        return this;
    }

    function clone(elems) {
        var s = new select();
        s.elements = elems;
        s.length = elems.length;
        return s;
    }

    function hover(elem, onEnter, onLeave) {
        var el = $(elem);
        var entered = false;
        el.on('mouseenter', function (e) {
            if (entered == false) {
                if (onEnter) { onEnter(e); }
                entered = true;
            }
        });
        el.on('mouseleave', function (e) {
            var p = e, f = false;
            while (p != null) { if (p == elem) { f = true; break; } p = p.parentNode; }
            if (!f) {
                entered = false;
                if (onLeave) { onLeave(e); }
            }
        });
        el = null;
    }

    //prototype functions that are accessable by return object //////////////////////////////////////////////////////////////////////////////////////
    select.prototype.add = function (elems) {
        //Add new (unique) elements to the existing elements array
        var obj = getObj(elems);
        if (!obj) { return this; }
        if (obj.elements) { obj = obj.elements;}
        if (obj.length > 0) {
            for(var x = 0; x < obj.length; x++){
                //check for duplicates
                if (this.elements.indexOf(obj[x]) < 0) {
                    //element is unique
                    this.elements.push(obj[x]);
                }
            }
        }
        return this;
    }

    select.prototype.addClass = function(classes) {
        //Add class name to each of the elements in the collection. 
        //Multiple class names can be given in a space-separated string.
        if (this.elements.length > 0) {
            var classList = classes.split(' ');
            this.elements.forEach(function (e) {
                //alter classname for each element in selector
                if (e.className) {
                    var className = e.className;
                    var list = className.split(' ');
                    classList.forEach(function (c){
                        if(list.indexOf(c) < 0){
                            //class doesn't exist in element classname list
                            className += ' ' + c;
                        }
                    });
                    //finally, change element classname if it was altered
                    if (e.className != className) { e.className = className; }
                } else {
                    e.className = classes;
                }
            });
        }
        return this;
    }

    select.prototype.after = function(content) {
        //Add content to the DOM after each elements in the collection. 
        //The content can be an HTML string, a DOM node or an array of nodes.
        var obj = getObj(content);
        if (isArray(obj, this.after) || obj == null) { return this; }

        insertContent(obj, this.elements, 
            function (e) { e.insertAdjacentHTML('afterend', obj); },
            function (e) { e.parentNode.insertBefore(obj, e.nextSibling); }
        );
        return this;
    }

    select.prototype.animate = function (props, options) {
        Velocity(this.elements, props, options);
        return this;
    }

    select.prototype.append = function (content) {
        //Append content to the DOM inside each individual element in the collection. 
        //The content can be an HTML string, a DOM node or an array of nodes.
        var obj = getObj(content);
        if (isArray(obj, this.append) || obj == null) { return this; }


        insertContent(obj, this.elements,
            function (e) { e.insertAdjacentHTML('beforeend', obj); },
            function (e) { e.appendChild(obj); }
        );
        return this;
    }

    select.prototype.appendTo = function(target) {
        //Append elements from the current collection to the target element. 
        //This is like append, but with reversed operands.
        return this;
    }

    select.prototype.attr = function(name, val) {
        //Read or set DOM attributes. When no value is given, reads 
        //specified attribute from the first element in the collection. 
        //When value is given, sets the attribute to that value on each element 
        //in the collection. When value is null, the attribute is removed  = function(like with removeAttr). 
        //Multiple attributes can be set by passing an object with name-value pairs.
        var n = getObj(name);
        var v = getObj(val);
        if (Array.isArray(n)) {
            //get array of attribute values from first element
            if (this.elements.length > 0) {
                var e = this.elements[0];
                var attrs = {};
                n.forEach(function (p) {
                    attrs[p] = e.getAttribute(p);
                });
                return attrs;
            }
        } else {
            if (v != null) {
                //set single attribute value to all elements in list
                this.elements.forEach(function (e) {
                    e.setAttribute(n, v);
                });
            } else {
                //get single attribute value from first element in list
                if (this.elements.length > 0) {
                    return this.elements[0].getAttribute(n);
                }
                return '';
            }
        }
        return this;
    }

    select.prototype.before = function(content) {
        //Add content to the DOM before each element in the collection. 
        //The content can be an HTML string, a DOM node or an array of nodes.
        var obj = getObj(content);
        if(isArray(obj, this.before) || obj == null){return this;}

        insertContent(obj, this.elements,
            function (e) { e.insertAdjacentHTML('beforebegin', obj); },
            function (e) { e.parentNode.insertBefore(obj, e); }
        );
        return this;
    }

    select.prototype.children = function(selector) {
        //Get immediate children of each element in the current collection. 
        //If selector is given, filter the results to only include ones matching the CSS select.
        var elems = [];
        this.elements.forEach(function (e) {
            for (var x = 0; x < e.children.length; x++) {
                elems.push(e.children[x]);
            }
        });
        return clone(elems);
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
            var arg = arguments[1];
            if (typeof arg == 'string') {
                //set a single style property if two string arguments are supplied (key, value);
                this.elements.forEach(function (e) {
                    setStyle(e, name, arg);
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
        var elems = [];
        if (eq > this.elements.length - 1) {
            //out of bounds
            elems = [];
        } else if (eq < 0) {
            //negetive index
            if (eq * -1 >= this.elements.length) {
                elems = [];
            } else {
                elems = [this.elements[(this.elements.length - 1) + eq]];
            }
        } else {
            elems = [this.elements[index]];
        }
        return clone(elems);
    }

    select.prototype.filter = function(selector) {
        //Filter the collection to contain only items that match the CSS select. 
        //If a select.prototype.is given, return only elements for which the select.prototype.returns a truthy value. 
        var elems = [];
        if (typeof selector == 'function') {
            //filter a boolean function
            this.elements.forEach(function (e) {
                if (selector.call(e, e) == true) { elems.push(e);}
            });
        } else {
            //filter selector string
            var found = query(document, selector);
            if (found.length > 0) {
                this.elements.forEach(function (e) {
                    if (found.indexOf(e) >= 0) {
                        //make sure no duplicates are being added to the array
                        if (elems.indexOf(e) < 0) { elems.push(e); }
                    }
                });
            }
        }
        return clone(elems);
    }

    select.prototype.find = function(selector) {
        //Find elements that match CSS selector executed in scope of nodes in the current collection.
        var elems = [];
        if (this.elements.length > 0) {
            this.elements.forEach(function (e) {
                var found = query(e, selector);
                if (found.length > 0) {
                    found.forEach(function (a) {
                        //make sure no duplicates are being added to the array
                        if (elems.indexOf(a) < 0) { elems.push(a); }
                    });
                }
            });
        }
        return clone(elems);
    }

    select.prototype.first = function () {
        //the first element found in the selector
        var elems = [];
        if (this.elements.length > 0) {
            elems = [this.elements[0]];
        }
        return clone(elems);
    }

    select.prototype.get = function(index) {
        //Get all elements or a single element from the current collection. 
        //When no index is given, returns all elements in an ordinary array. 
        //When index is specified, return only the element at that position. 
        return this.elements[index || 0];
    }

    select.prototype.has = function(selector) {
        //Filter the current collection to include only elements that have 
        //any number of descendants that match a selector, or that contain a specific DOM node.
        var elems = [];
        if (this.elements.length > 0) {
            this.elements.forEach(function (e) {
                if (query(e, slector).length > 0) {
                    if (elems.indexOf(e) < 0) { elems.push(e);}
                }
            });
        }
        return clone(elems);
    }

    select.prototype.hasClass = function(classes) {
        //Check if any elements in the collection have the specified class.
        var classList;
        if(Array.isArray(classes)){
            classList = classes;
        }else if(typeof classes == 'string'){
            classList = classes.split(' ');
        }
        for (var x = 0; x < this.elements.length; x++) {
            var n = this.elements[x].className || '';
            if (typeof n == 'string') {
                var classNames = n.split(' ');
                if (classNames.length > 0) {
                    if (classList.every(function (a) { return classNames.some(function (b) { return a == b; }); })) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    select.prototype.height = function(val) {
        //Get the height of the first element in the collection; 
        //or set the height of all elements in the collection.
        //this function differs from jQuery as it doesn't care
        //about box-sizing & border when returning the height
        //of an element (when val is not specified). 
        //It simply returns vanilla js offsetHeight (as it should);
        var obj = getObj(val);
        if (typeof obj == "string") {
            var n = parseFloat(obj);
            if (n != NaN) { obj = n; } else {
                //height is string
                this.elements.forEach(function (e) {
                    if (e != window && e != document) {
                        e.style.height = obj;
                    }
                });
                return this;
            }
        }else if(obj == null){
            if (this.elements.length > 0) {
                //get height from first element
                var elem = this.elements[0];
                if (elem == window) {
                    return window.innerHeight;
                } else if (elem == document) {
                    var body = document.body;
                    var html = document.documentElement;
                    return Math.max(
                      body.offsetHeight,
                      body.scrollHeight,
                      html.clientHeight,
                      html.offsetHeight,
                      html.scrollHeight
                    );
                } else {
                    return elem.clientHeight;
                }
                return 0;
            }
        } else {
            //height is a number
            if (obj == 0) {
                this.elements.forEach(function (e) {
                    e.style.height = 0;
                });
            } else {
                this.elements.forEach(function (e) {
                    e.style.height = obj + 'px';
                });
            }
        }
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
        var obj = getObj(content);
        if (obj == null) {
            if (this.elements.length > 0) {
                return this.elements[0].innerHTML;
            }
        } else {
            this.elements.forEach(function (e) {
                e.innerHTML = obj;
            });
        }
        return this;
    }

    select.prototype.index = function() {
        //Get the position of an element. When no element is given, 
        //returns position of the current element among its siblings. 
        //When an element is given, returns its position in the current collection. 
        //Returns -1 if not found.
        var i = -1;
        if (this.elements.length > 0) {
            elem = this.elements[0];
            while ((elem = elem.previousSibling) != null) { i++;}
            return i;
        }
        return i;
    }

    select.prototype.innerHeight = function (height) {
        //Get the current computed inner height (including padding but not border) for the 
        //first element in the set of matched elements or set the inner height of every matched element
        var obj = getObj(val);
        if (obj == null) {
            //get inner height of first element (minus padding)
            if (this.elements.length > 0) {
                var e = this.elements[0];
                var style = getComputedStyle(e);
                var padtop = parseFloat(style.paddingTop);
                var padbot = parseFloat(style.paddingBottom);
                if (padtop == NaN) { padtop = 0; }
                if (padbot == NaN) { padbot = 0; }
                return e.clientHeight - (padtop + padbot);
            }
        } else {
            //set height of elements
            return this.height(height);
        }
    }

    select.prototype.innerWidth = function (width) {
        //Get the current computed inner width (including padding but not border) for the 
        //first element in the set of matched elements or set the inner width of every matched element
        var obj = getObj(val);
        if (obj == null) {
            //get inner width of first element (minus padding)
            if (this.elements.length > 0) {
                var e = this.elements[0];
                var style = getComputedStyle(e);
                var padright = parseFloat(style.paddingRight);
                var padleft = parseFloat(style.paddingLeft);
                if (padright == NaN) { padright = 0; }
                if (padleft == NaN) { padleft = 0; }
                return e.clientWidth - (padright + padleft);
            }
        } else {
            //set width of elements
            return this.width(width);
        }
    }

    select.prototype.is = function(selector) {
        //Check if the first element of the current collection matches the CSS select.
        if (this.elements.length > 0) {
            var sel = this;
            var obj = getObj(selector);
            var q = query(document, obj);
            if (q.some(function (a) { return a == sel.elements[0] }));
        }
        return false;
    }

    select.prototype.last = function() {
        //Get the last element of the current collection.
        var elems = [];
        if (this.elements.length > 0) {
            elems = [this.elements[this.elements.length - 1]];
        }
        return clone(elems);
    }

    select.prototype.map = function (func) { //func(index, element)        
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
        var elems = [];
        if(selector != null){
            //use selector
            this.elements.forEach(function (e) {
                var q = query(e, selector);
                var n = e.nextSibling; if (n) { while (n.nodeName == '#text') { n = n.nextSibling; if (!n) { break; } } }
                if (n != null) {
                    if (q.some(function (s) { s == n })) {elems.push(n);}
                } else { elems.push(e); }
            });
        } else {
            //no selector
            this.elements.forEach(function (e) {
                var n = e.nextSibling; if (n) { while (n.nodeName == '#text') { n = n.nextSibling; if (!n) { break; } } }
                if (n != null) { elems.push(n); } else { elems.push(e); }
            });
        }
        return clone(elems);
    }

    select.prototype.not = function(selector) {
        //Filter the current collection to get a new collection of elements that don’t match the CSS select. 
        //If another collection is given instead of selector, return only elements not present in it. 
        //If a select.prototype.is given, return only elements for which the select.prototype.returns a falsy value. 
        //Inside the function, the this keyword refers to the current element.
        var sel = getObj(selector);
        var elems = this.elements;
        //check if selector is an array (of selectors)
        if (isArray(sel)) {
            sel.forEach(function (s) {
                var q = query(document, s);
                elems = diffArray(elems, q);
            });
            this.elements = elems;
            return this;
        }
        var q = query(document, sel);
        return clone(diffArray(elems, q));
    }

    select.prototype.off = function (event, func) {
        //remove an event handler
        this.elements.forEach(function (e) {
            for (var x = 0; x < listeners.length; x++) {
                if (listeners[x].elem == e) {
                    //found element in listeners array, now find specific function (func)
                    var item = listeners[x];
                    if (func == null) {
                        //if no function specified, remove all listeners for a specific event
                        if (event == null) {
                            //remove all events and functions for element from listener
                            for (var y = 0; y < item.events.length; y++) {
                                var ev = item.events[y];
                                for (var z = 0; z < ev.list.length; z++) {
                                    e.removeEventListener(ev.name, ev.list[z]);
                                }
                            }
                            listeners.splice(x, 1);
                        } else {
                            //remove all functions (for event) from element in listener
                            for (var y = 0; y < item.events.length; y++) {
                                if (item.events[y].name == event) {
                                    var ev = item.events[y];
                                    for (var z = 0; z < ev.list.length; z++) {
                                        e.removeEventListener(event, ev.list[z]);
                                    }
                                    listeners[x].events.splice(y, 1);
                                    if (listeners[x].events.length == 0) {
                                        //remove element from listeners array since no more events exist for the element
                                        listeners.splice(x, 1);
                                    }
                                    break;
                                }
                            }
                        }
                    } else {
                        //remove specific listener based on event & function
                        for (var y = 0; y < item.events.length; y++) {
                            if (item.events[y].name == event) {
                                //remove specific event from element in listeners array
                                var ev = item.events[y];
                                for (var z = 0; z < ev.list.length; z++) {
                                    if (ev.list[z] == func) {
                                        e.removeEventListener(event, func);
                                        listeners[x].events[y].list.splice(z, 1);
                                        break;
                                    }
                                }
                                
                                if (listeners[x].events[y].list.length == 0) {
                                    //remove event from element list array since no more functions exist for the event
                                    listeners[x].events.splice(y, 1);
                                    if (listeners[x].events.length == 0) {
                                        //remove element from listeners array since no more events exist for the element
                                        listeners.splice(x, 1);
                                    }
                                }
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        });
        return this;
    }

    select.prototype.offset = function(coordinates) {
        //Get position of the element in the document. 
        //Returns an object with properties: top, left, width and height.

        //When given an object with properties left and top, use those values to 
        //position each element in the collection relative to the document.
        if (this.elements.length > 0) {
            var box = this.elements[0].getBoundingClientRect();
            return {
                top: box.top + document.body.scrollTop,
                left: box.left + document.body.scrollLeft
            };
        }
        return { top: 0, left: 0 };
    }

    select.prototype.offsetParent = function() {
        //Find the first ancestor element that is positioned, 
        //meaning its CSS position value is “relative”, “absolute” or “fixed”.
        if (this.elements.length > 0) {
            return this.elements[0].offsetParent;
        }
        return null;
    }

    select.prototype.on = function (event, func, func2) {
        //Attach an event handler function for one or more events to the selected elements.
        this.elements.forEach(function (e) {
            if (event == "hover") {
                hover(e, func, func2);
            } else {
                e.addEventListener(event, func, true);
                var listen = false;
                for (var x = 0; x < listeners.length; x++) {
                    if (listeners[x].elem == e) {
                        //found element, now find specific event
                        var events = listeners[x].events;
                        var f = false;
                        for (var y = 0; y < events.length; y++) {
                            if (events[y].name == event) {
                                //found existing event in list
                                listeners[x].events[y].list.push(func);
                                f = true;
                                break;
                            }
                        }
                        if (f == false) {
                            //event doesn't exist yet
                            var ev = { name: event, list: [func] };
                            listeners[x].events.push(ev);
                        }
                        listen = true;
                        break;
                    }
                }
                if (listen == false) { listeners.push({ elem: e, events: [{ name: event, list: [func] }] }); }
            }
        });
        return this;
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
        var elems = [];
        this.elements.forEach(function (e) {
            var el = e.parentNode;
            if (selector == null || selector == '') {
                if (elems.indexOf(el) < 0) {
                    elems.push(el);
                }
            } else if (el.matches(selector)) {
                if (elems.indexOf(el) < 0) {
                    elems.push(el);
                }
            }
            
        });
        return clone(elems);
    }

    select.prototype.parents = function(selector) {
        //Get all ancestors of each element in the selector. 
        //If CSS selector is given, filter results to include only ones matching the select.
        var elems = [];
        this.elements.forEach(function (e) {
            var el = e.parentNode;
            while (el) {
                if (selector == null || selector == '') {
                    if (elems.indexOf(el) < 0) {
                        elems.push(el);
                    }
                } else {
                    if (el.matches) {
                        if (el.matches(selector)) {
                            if (elems.indexOf(el) < 0) {
                                elems.push(el);
                            }
                        }
                    } else if (el.matchesSelector) {
                        if (el.matchesSelector(selector)) {
                            if (elems.indexOf(el) < 0) {
                                elems.push(el);
                            }
                        }
                    }
                }
                el = el.parentNode;
            }
        });
        return clone(elems);
    }

    select.prototype.position = function() {
        //Get the position of the first element in the collection, relative to the offsetParent. 
        //This information is useful when absolutely positioning an element to appear aligned with another.
        if (this.elements.length > 0) {
            return { left: this.elements[0].offsetLeft, top: this.elements[0].offsetTop };
        }
        return { left: 0, top: 0 };
    }

    select.prototype.prepend = function(content) {
        //Prepend content to the DOM inside each element in the collection. 
        //The content can be an HTML string, a DOM node or an array of nodes.
        var obj = getObj(content);
        if (isArray(obj, this.append) || obj == null) { return this; }


        insertContent(obj, this.elements,
            function (e) { e.insertAdjacentHTML('afterbegin', obj); },
            function (e) { e.insertBefore(obj, e.firstChild); }
        );
        return this;
    }

    select.prototype.prependTo = function(target) {
        //Prepend elements of the current collection inside each of the target elements. 
        //This is like prepend, only with reversed operands.
        return this;
    }

    select.prototype.prev = function(selector) {
        //Get the previous sibling–optionally filtered by selector–of each element in the collection.
        var elems = [];
        if (selector) {
            //use selector
            this.elements.forEach(function (e) {
                var q = query(e, selector);
                if (q.some(function (s) { s == e.previousSibling })) {
                    if (e.previousSibling) { elems.push[e.previousSibling]; } else { elems.push[e]; }
                }
            });
        } else {
            //no selector
            this.elements.forEach(function (e) {
                if (e.previousSibling) { elems.push[e.previousSibling]; } else { elems.push[e]; }
            });
        }
        return clone(elems);
    }

    select.prototype.prop = function(name, val) {
        //Read or set properties of DOM elements. This should be preferred over attr in case of 
        //reading values of properties that change with user interaction over time, such as checked and selected.
        var n = getObj(name);
        var v = getObj(val);
        if (Array.isArray(n)) {
            //get multiple properties from the first element
            var props = {};
            n.forEach(function (p) {
                props[p] = this.prop(p);
            });
            return props;
        }

        var execAttr = function (a, b) {
            //get / set / remove DOM attribute
            if (v != null) {
                if (v == '--') {
                    //remove
                    this.elements.forEach(function (e) {
                        e.removeAttribute(a);
                    });
                } else {
                    //set
                    if (v == false) {
                        this.elements.forEach(function (e) {
                            e.removeAttribute(a);
                        });
                    } else {
                        this.attr(a, b);
                    }
                }
            } else {
                //get
                if (this.elements.length > 0) {
                    return this.elements[0].getAttribute(a) || '';
                }
            }
        };

        var execStyle = function (a, b) {
            //get / set / remove DOM style property
            if (v != null) {
                if (v == '--') {
                    //remove
                    this.elements.forEach(function (e) {
                        e.style[a] = '';
                    });
                } else {
                    //set
                    this.elements.forEach(function (e) {
                        setStyle(e, a, b);
                    });
                }
            } else {
                //get
                if (this.elements.length > 0) {
                    return getStyle(e, a);
                }
            }
        };

        //get, set, or remove (if val == '--') a specific property from element(s)
        var nn = '';
        switch (n) {
            case "defaultChecked":
                nn = 'checked';
            case "checked":
                if (!v) { if (this.elements.length > 0) { return this.elements[0].checked; } }
            case "defaultSelected":
                nn = 'selected';
            case "selected":
            case "defaultDisabled":
                nn = 'disabled';
            case "disabled":
                //get/set/remove boolean property that belongs to the DOM element object or is an attribute (default)
                

                var execProp = function (a) {
                    if (v != null) {
                        if (v == '--') {
                            //remove
                            this.elements.forEach(function (e) {
                                if (e[a]) { delete e[a]; }
                            });
                        } else {
                            //set
                            v = v == false ? false : true;
                            this.elements.forEach(function (e) {
                                e[a] = v;
                            });
                        }
                    
                    } else {
                        //get
                        if (this.elements.length > 0) {
                            var e = this.elements[0];
                            var b = e[a];
                            if (b == null) {
                                b = e.getAttribute(a) != null ? true : false;
                                e[a] = b;
                            }
                            return b;
                        } 
                    }
                };

                if (nn != '') {
                    //get/set/remove default property
                    var a = execAttr.call(this, nn, nn);
                    if (a != null) { return a;}
                } else {
                    //get/set/remove property
                    var a = execProp.call(this, n);
                    if (a != null) { return a;}
                }
                break;

            case "selectedIndex":
                if (v != null) {
                    if (v === parseInt(v, 10)) {
                        this.elements.forEach(function (e) {
                            if (e.nodeType == 'SELECT') {
                                e.selectedIndex = v;
                            }
                        });
                    }
                }
                break;

            case "nodeName":
                if (val != null) {
                    //set node name
                    //TODO: replace DOM element with new element of new node name, cloning all attributes & appending all children elements
                } else {
                    //get node name
                    if (this.elements.length > 0) {
                        return this.elements[0].nodeName;
                    } else {
                        return '';
                    }
                }
                break;
            case "tagName":
                if (val != null) {
                    //set node name
                    //TODO: replace DOM element with new element of new tag name, cloning all attributes & appending all children elements
                } else {
                    //get tag name
                    if (this.elements.length > 0) {
                        return this.elements[0].tagName;
                    } else {
                        return '';
                    }
                }
                break;

            default:
                // last resort to get/set/remove property value from style or attribute
                //first, try getting a style
                var a = execProp.call(this, n, v);
                if (a != null) {
                    return a;
                } else {
                    //next, try getting a attribute
                    a = execAttr.call(this, n, v);
                    if (a != null) {
                        return a;
                    }
                }

        }
        return this;
    }

    select.prototype.ready = function (callback) {
        if (this.elements.length == 1) {
            if (this.elements[0] == document) {
                if (document.readyState != 'loading') {
                    callback();
                } else {
                    document.addEventListener('DOMContentLoaded', callback);
                }
            }
        }
    }

    select.prototype.remove = function (selector) {
        //Remove the set of matched elements from the DOM
        this.elements.forEach(function (e) {
            e.parentNode.removeChild(e);
        });
        this.elements = [];
        return this;
    }

    select.prototype.removeAttr = function (attr) {
        //Remove an attribute from each element in the set of matched elements
        var obj = getObj(attr);
        if (Array.isArray(obj)) {
            obj.forEach(function (a) {
                this.elements.forEach(function (e) {
                    e.removeAttribute(a);
                });
            });
        } else if(typeof obj == 'string') {
            this.elements.forEach(function (e) {
                e.removeAttribute(obj);
            });
        }
        
        return this;
    }

    select.prototype.removeClass = function (className) {
        //Remove a single class, multiple classes, or all classes from each element in the set of matched elements
        var obj = getObj(className);
        if (typeof obj == 'string') {
            //check for class name array
            obj = obj.replace(/\,/g, ' ').replace(/\s\s/g, ' ');
            if (obj.indexOf(' ') > 0) {
                obj = obj.split(' ');
            }
        }
        if (Array.isArray(obj)) {
            this.elements.forEach(function (e) {
                obj.forEach(function (a) {
                    if (e.className) {
                        e.className = e.className.split(' ').filter(function (b) { return b != '' && b != a; }).join(' ');
                    }
                });
            });
        } else if (typeof obj == 'string') {
            this.elements.forEach(function (e) {
                if (e.className) {
                    e.className = e.className.split(' ').filter(function (b) { return b != '' && b != obj; }).join(' ');
                }
            });
        }
        return this;
    }

    select.prototype.removeProp = function (name) {
        //Remove a property for the set of matched elements
        this.prop(name, '--');
        return this;
    }

    select.prototype.serialize = function () {
        if (this.elements.length == 0) { return ''; }
        var form = this.elements[0];
        if (!form || form.nodeName !== "FORM") {
            return '';
        }
        var i, j, q = [];
        for (i = form.elements.length - 1; i >= 0; i = i - 1) {
            if (form.elements[i].name === "") {
                continue;
            }
            switch (form.elements[i].nodeName) {
                case 'INPUT':
                    switch (form.elements[i].type) {
                        case 'text':
                        case 'hidden':
                        case 'password':
                        case 'button':
                        case 'reset':
                        case 'submit':
                            q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                            break;
                        case 'checkbox':
                        case 'radio':
                            if (form.elements[i].checked) {
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                            }
                            break;
                    }
                    break;
                case 'file':
                    break;
                case 'TEXTAREA':
                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                    break;
                case 'SELECT':
                    switch (form.elements[i].type) {
                        case 'select-one':
                            q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                            break;
                        case 'select-multiple':
                            for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                if (form.elements[i].options[j].selected) {
                                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                                }
                            }
                            break;
                    }
                    break;
                case 'BUTTON':
                    switch (form.elements[i].type) {
                        case 'reset':
                        case 'submit':
                        case 'button':
                            q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                            break;
                    }
                    break;
            }
        }
        return q.join("&");
    }

    select.prototype.show = function () {
        //Display the matched elements
        this.removeClass('hide');
        this.elements.forEach(function (e) {
            e.style.display = 'block';
        });
        return this;
    }

    select.prototype.siblings = function (selector) {
        //Get the siblings of each element in the set of matched elements, optionally filtered by a selector
        var elems = [];
        var sibs = [];
        var q = [];
        var sel = getObj(selector);
        var add = function (e) {
            if (!elems.some(function (a) { return a == e })) { elems.push(e); }
        }
        var find = function (e, s) {
            //find siblings
            if (s != null) {
                q = query(e.parentNode, s);
            }
            sibs = e.parentNode.children;
            for (var x = 0; x < sibs.length; x++) {
                var sib = sibs[x];
                if (sib != e) {
                    if (s != null) {
                        if (q.some(function (a) { return a == sib; })) {
                            add(sib);
                        }
                    } else {
                        add(sib);
                    }
                }
            }
        };
        
        if (sel != null) {
            if (Array.isArray(sel)) {
                this.elements.forEach(function (e) {
                    sel.forEach(function (s) {
                        find(e, s);
                    });
                });
            } else {
                this.elements.forEach(function (e) {
                    find(e, sel);
                });
            }
        } else {
            this.elements.forEach(function (e) {
                find(e);
            });
        }
        return clone(elems);
    }

    select.prototype.slice = function (start, end) {
        //Reduce the set of matched elements to a subset specified by a range of indices
        return clone(elems);
    }

    select.prototype.text = function () {
        //Get the combined text contents of each element in the set of matched elements, including their descendants, or set the text contents of the matched elements
        return '';
    }

    select.prototype.toggle = function () {
        //Display or hide the matched elements
        this.elements.forEach(function (e) {
            if (e.style.display == 'none') {
                e.style.display = '';
            } else { e.style.display = 'none'; }
        });
        return this;
    }

    select.prototype.toggleClass = function (className) {
        //Add or remove one or more classes from each element in the set of matched elements, depending on either the class’s presence or the value of the state argument
        var obj = getObj(className);
        if (typeof obj == 'string') {
            obj = obj.split(' ');
        }
        if (Array.isArray(obj)) {
            this.elements.forEach(function (e) {
                var c = e.className;
                var b = -1;
                if (c != null && c != '') {
                    c = c.split(' ');
                    //array of class names
                    obj.forEach(function (a){
                        b = c.indexOf(a);
                        if (b >= 0) {
                            //remove class
                            c.splice(b, 1);
                        } else {
                            //add class
                            c.push(a);
                        }
                    });
                    //update element className attr
                    e.className = c.join(' ');
                } else {
                    e.className = className;
                }
            });
        }
    }

    select.prototype.val = function (value) {
        //Get the current value of the first element in the set of matched elements or set the value of every matched element
        if (value != null) {
            this.elements.forEach(function (a) {
                a.value = value;
            });
        } else {
            if (this.elements.length > 0) {
                return this.elements[0].value;
            }
            return '';
        }
        return this;
    }

    select.prototype.width = function (val) {
        //Get the current computed width for the first element in the set of matched elements or set the width of every matched element
        var obj = getObj(val);
        if (typeof obj == "string") {
            var n = parseFloat(obj);
            if (n != NaN) { obj = n; } else {
                //width is string
                this.elements.forEach(function (e) {
                    if (e != window && e != document) {
                        e.style.width = obj;
                    }
                });
                return this;
            }
        } else if (obj == null) {
            if (this.elements.length > 0) {
                //get width from first element
                var elem = this.elements[0];
                if (elem == window) {
                    return window.innerWidth;
                } else if (elem == document) {
                    var body = document.body;
                    var html = document.documentElement;
                    return Math.max(
                      body.offsetWidth,
                      body.scrollWidth,
                      html.clientWidth,
                      html.offsetWidth,
                      html.scrollWidth
                    );
                } else {
                    return elem.clientWidth;
                }
                return 0;
            }
        } else {
            //width is a number
            if (obj == 0) {
                this.elements.forEach(function (e) {
                    e.style.width = 0;
                });
            } else {
                this.elements.forEach(function (e) {
                    e.style.width = obj + 'px';
                });
            }
        }
        return this;
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
    $.ajax = function(options){
        var opt = getObj(options);
        if(typeof opt == 'string'){
            if (arguments[1]) {
                //options is a separate argument from url
                var url = opt.toString();
                opt = arguments[1];
                opt.url = url;
            } else {
                //no 2nd argument
                opt = { url: opt.toString() };
            }
        }
        //set up default options
        if (!opt.async) { opt.async = true; }
        if (!opt.cache) { opt.cache = false; }
        if (!opt.contentType) { opt.contentType = 'application/x-www-form-urlencoded; charset=UTF-8'; }
        if (!opt.data) { opt.data = ''; }
        if (!opt.dataType) { opt.dataType = ''; }
        if (!opt.method) { opt.method = "GET"; }
        if (opt.type) { opt.method = opt.type; }
        if (!opt.url) { opt.url = ''; }

        //set up AJAX request
        var req = new XMLHttpRequest();

        //set up callbacks
        req.onload = function () {
            if (req.status >= 200 && req.status < 400) {
                //request success
                var resp = req.responseText;
                if (opt.dataType.toLowerCase() == "json") {
                    resp = JSON.parse(resp);
                }
                if (opt.success) {
                    opt.success(resp, req.statusText, req);
                }
            } else {
                //connected to server, but returned an error
                if (opt.error) {
                    opt.error(req, req.statusText);
                }
            }
        };

        req.onerror = function () {
            //an error occurred before connecting to server
            if (opt.error) {
                opt.error(req, req.statusText);
            }
        };

        if (opt.beforeSend) {
            if (opt.beforeSend(req, opt) == false) { return false; }
        }

        //finally, send AJAX request
        req.open(opt.method, opt.url, opt.async, opt.username, opt.password);
        req.setRequestHeader('Content-Type', opt.contentType);
        req.send(opt.data);
    }

    $.serializePost = function (elems) {
        //converts an object to send as data for an AJAX POST
        var r = '';
        for (var e in elems) {
            if (r != '') { r += '&'; }
            r += e + '=' + elems[e];
        }
        return r;
    }

})();