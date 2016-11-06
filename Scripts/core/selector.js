﻿//Websilk Selector Framework (replaces jQuery)

//private selector object
(function(){
    var pxStyles = ['top', 'right', 'bottom', 'left'];
    var pxStylesPrefix = ['border', 'padding', 'margin'];
    var pxStylesSuffix = ['Top', 'Right', 'Bottom', 'Left'];

    function select(sel) {
        //main function
        var self = this;
        this.elements = query(document, sel);
        return this;
    }

    function query(elem, sel) {
        //gets a list of elements from a CSS selector
        var elems = [];
        console.log(sel);
        if (sel != null && typeof sel != 'object' && sel != '') {
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
        if (Number.isInteger(val)) {
            //check for numbers that should be using 'px';
            if (Number(val) != 0) {
                if (pxStyles.indexOf(name) >= 0) {
                    v = val + 'px';
                } else if (pxStylesPrefix.some(function (a) { name.indexOf(a) == 0 })) {
                    if (pxStylesSuffix.some(function (a) { name.indexOf(a) > 0 })) {
                        v = val + 'px';
                    }
                }
            }
        }
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
            for(var o of obj) {
                arrayFunc(o);
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
        var obj = getObj(content);
        if (isArray(obj, this.after) || obj == null) { return this; }

        insertContent(obj, this.elements,
            function (e) { e.insertAdjacentHTML('afterend', content); },
            function (e) { e.parentNode.insertBefore(content, e.nextSibling); }
        );
        return this;
    }

    select.prototype.append = function (content) {
        //Append content to the DOM inside each individual element in the collection. 
        //The content can be an HTML string, a DOM node or an array of nodes.
        var obj = getObj(content);
        if (isArray(obj, this.append) || obj == null) { return this; }

        insertContent(obj, this.elements,
            function (e) { e.insertAdjacentHTML('beforeend', content); },
            function (e) { e.insertAfter(content); }
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
            function (e) { e.insertAdjacentHTML('beforebegin', content); },
            function (e) { e.parentNode.insertBefore(content, e); }
        );
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
            var arg = arguments[1];
            if (typeof arg == 'string') {
                //set a single style property if two string arguments are supplied (key, value);
                this.elements.forEach(function (e) {
                    console.log(name + ', ' + arg);
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
        var collect = [];
        if (typeof selector == 'function') {
            //filter a boolean function
            this.elements.forEach(function (e) {
                if (selector.call(e, e) == true) { collect.push(e);}
            });
        } else {
            //filter selector string
            var found = query(document, selector);
            if (found.length > 0) {
                this.elements.forEach(function (e) {
                    if (found.indexOf(e) >= 0) {
                        //make sure no duplicates are being added to the array
                        if (collect.indexOf(e) < 0) { collect.push(e); }
                    }
                });
            }
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
        //the first element found in the selector
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
        var classList;
        if(Array.isArray(classes)){
            classList = classes;
        }else if(typeof classes == 'string'){
            classList = classes.split(' ');
        }
        for(e of this.elements) {
            var classNames = e.className.split(' ');
            if (classNames.length > 0) {
                if (classList.every(function (a) { return classNames.some(function (b) { return a == b; }); })) {
                    return true;
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
                    e.style.height = obj;
                });
                return this;
            }
        }else if(obj == null){
            if (this.elements.length > 0) {
                //get height from first element
                var elem = this.elements[0];
                return elem.offsetHeight ? elem.offsetHeight : elem.clientHeight;
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
            //get inner height of first element (minus padding)
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
            //set height of elements
            return this.width(width);
        }
    }

    select.prototype.is = function(selector) {
        //Check if the first element of the current collection matches the CSS select.
        if (this.elements.length > 0) {
            var obj = getObj(selector);
            var q = query(document, obj);
            if (q.some(function (a) { return a == this.elements[0] }));
        }
        return false;
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
        this.elements = elems;
        return this;
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
        this.elements = diffArray(elems, q);
        return this;
    }

    select.prototype.off = function (event, func) {
        //remove an event handler
        this.elements.forEach(function (e) {
            e.removeEventListener(event, func);
        });
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
        this.elements.forEach(function (e) {
            e.addEventListener(event, func);
        });
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
        this.elements = elems;
        return this;
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
                    if (Number.isInteger(v)) {
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
            e.parentNode.remove(e);
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
        if (Array.isArray(obj)) {
            obj.forEach(function (a) {
                this.elements.forEach(function (e) {
                    e.className = e.className.split(' ').filter(function (b) { return b != '' && b != a; }).join(' ');
                });
            });
        } else if (typeof obj == 'string') {
            this.elements.forEach(function (e) {
                e.className = e.className.split(' ').filter(function (b) { return b != '' && b != obj; }).join(' ');
            });
        }
        return this;
    }

    select.prototype.removeProp = function (name) {
        //Remove a property for the set of matched elements
        this.prop(name, '--');
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
            for (sib of sibs) {
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
        this.elements = elems;
        return this;
    }

    select.prototype.slice = function (start, end) {
        //Reduce the set of matched elements to a subset specified by a range of indices
        this.elements = this.elements.slice(start, end);
        return this;
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
        return this;
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
                            c = c.splice(b, b + 1);
                        } else {
                            //add class
                            c.push(a);
                        }
                    });
                    //update element className attr
                    e.className = c.join(' ');
                }
            });
        }
    }

    select.prototype.val = function (value) {
        //Get the current value of the first element in the set of matched elements or set the value of every matched element
        if (this.elements.length > 0) {
            return this.elements[0].value;
        }
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
        if (!opt.method) { opt.method = "GET"; }
        if (opt.type) { opt.method = opt.type; }
        if (!opt.url) { opt.url = ''; }

        //set up AJAX request
        var req = new XMLHttpRequest();
        req.open(opt.method, opt.url, opt.async, opt.username, opt.password);
        req.setRequestHeader('Content-Type', opt.contentType);

        //set up callbacks
        req.onload = function () {
            if (req.status >= 200 && req.status < 400) {
                //request success
                var resp = req.responseText;
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
        req.send(opt.data);
    }

})();