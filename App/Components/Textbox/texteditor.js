(function () {

    S.editor.textEditor = {
        toolbar: $('.text-toolbar'),
        revert: '',

        init: function () {
            //add editor menu button to component select menu
            S.editor.components.select.menu.add($('#template_select_menu_texteditor').html(), 'texteditor', ['texteditor'], S.editor.textEditor.show, S.editor.textEditor.hide);

            //configure rangy
            rangy.config.preferTextRange = true;
            rangy.createMissingNativeApi();

            //add events to text editor toolbar
            var toolbar = $('.editor .text-toolbar');
            toolbar.find('.icon-bold a').on('click', this.commands.bold);
            toolbar.find('.icon-italic a').on('click', this.commands.italic);
            toolbar.find('.icon-strikethru a').on('click', this.commands.strikethru);
            toolbar.find('.icon-underline a').on('click', this.commands.underline);
            toolbar.find('.icon-bullet a').on('click', this.commands.bulletList);
            toolbar.find('.icon-numbers a').on('click', this.commands.numberList);
            toolbar.find('.icon-indent a').on('click', this.commands.indent);
            toolbar.find('.icon-outdent a').on('click', this.commands.outdent);
            toolbar.find('.icon-textleft a').on('click', this.commands.alignLeft);
            toolbar.find('.icon-textcenter a').on('click', this.commands.alignCenter);
            toolbar.find('.icon-textright a').on('click', this.commands.alignRight);
            toolbar.find('.icon-more a').on('click', this.showMore);
            toolbar.find('.icon-less a').on('click', this.showLess);
            toolbar.on('mousedown', this.cancelBlur);

            //configure DOMpurify
            //DOMPurify.addHook('uponSanitizeElement', this.purify);
        },

        // toolbar //////////////////////////////////////////////////////////////////

        show: function (e) {
            var self = S.editor.textEditor;
            var e = S.editor.components.selected;
            self.align();
            self.toolbar.show();

            e[0].contentEditable = 'true';
            S.editor.textEditor.revert = e.html();

            //add event for detecting select refresh & window resize
            S.editor.components.select.events.refresh.add('texteditor', self.align);

            //add event for text editor key events
            $(document).on('keypress', S.editor.textEditor.keypress);
            $(document).on('keyup', S.editor.textEditor.keyup);

            //add event for detecting text selection to disable deselecting component on accident
            e.on('mousedown', self.mousedown);
            $(document).on('mouseup', S.editor.textEditor.mouseup);

            //add event for detecting save button press
            S.editor.save.events.save.add('texteditor', self.save);
        },

        hide: function (e) {
            var self = S.editor.textEditor;

            //save contents of text editor
            self.save();

            //remove events
            S.editor.components.select.events.refresh.remove('texteditor');
            $(document).off('keyup', S.editor.textEditor.keyup);
            e.off('mousedown', self.mousedown);
            $(document).off('mouseup', S.editor.textEditor.mouseup);
            S.editor.save.events.save.remove('texteditor', self.save);

            //hide text editor toolbar
            self.toolbar.hide();

            //disable editing
            e[0].removeAttribute('contentEditable');

        },

        save: function () {
            var self = S.editor.textEditor;
            var e = S.editor.components.selected;
            var html = e.html();
            if (html != self.revert) {
                self.clean(e);
                S.editor.save.add(e[0].id.substr(1), 'text', e.html());
            }
        },

        align: function () {
            var self = S.editor.textEditor;
            var e = S.editor.components.selected;
            var pos = e.offset();
            var win = S.window.pos();
            if (pos.left < 13) {
                pos.left = 13;
            }
            pos.height = e.height();
            if (pos.top + win.scrolly <= 50) {
                //show toolbar below component
                self.toolbar.css({ left: pos.left - 13, top: pos.top + pos.height + 13 });
            } else {
                if (win.scrolly > pos.top - 100) {
                    //show toolbar at top of window
                    self.toolbar.css({ left: pos.left + 5, top: win.scrolly + 65 });
                } else {
                    //show toolbar at top of component
                    self.toolbar.css({ left: pos.left - 13, top: pos.top - 53 });
                }
            }
        },

        showMore: function () {
            $('.text-toolbar .edit-basic').hide();
            $('.text-toolbar .edit-advanced').show();
        },

        showLess: function () {
            $('.text-toolbar .edit-basic').show();
            $('.text-toolbar .edit-advanced').hide();
        },

        cancelBlur: function (e) {
            //prevents user from allowing contentEditable area to lose focus when clicking on the toolbar
            if (!$(e.target).is('select')) {
                e.preventDefault();
            }
        },

        // Events ////////////////////////////////////////////////////////////////

        keypress: function (e) {
            var k = e.keyCode;
            var self = S.editor.textEditor;
            switch (k) {
                case 9: //tab press
                    self.insertText('    ', document.createElement("pre"));
                    e.cancelBubble = true;
                    e.preventDefault();
                    return false;

                case 8: //backspace
                    //check for "pre" tag
                    var sel = rangy.getSelection();
                    var range = sel.getRangeAt(0);
                    var anchor = sel.anchorNode;
                    if (anchor.tagName) {
                        console.log(anchor.tagName);
                        if (anchor.tagName.toLowerCase() == 'pre') {
                            anchor.remove();
                            e.cancelBubble = true;
                            e.preventDefault();
                            return false;
                        }
                    }

                case 13: //line break
                    var docFragment = document.createDocumentFragment();

                    //add a new line
                    var newEle = document.createTextNode('\n');
                    docFragment.appendChild(newEle);

                    //add the br, or p, or something else
                    newEle = document.createElement('br');
                    docFragment.appendChild(newEle);

                    //make the br replace selection
                    var range = window.getSelection().getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(docFragment);

                    //create a new range
                    range = document.createRange();
                    range.setStartAfter(newEle);
                    range.collapse(true);

                    //make the cursor there
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);

                    return false;
            }

            //if caret is inside pre tag, move outside of pre tag
            self.moveCaretOutside(['pre']);
        },

        keyup: function (e) {
            var k = e.keyCode;
            var self = S.editor.textEditor;
            S.editor.textEditor.align();
            S.editor.components.select.refresh();
        },

        mousedown: function () {
            S.editor.components.select.locked = true;
        },

        mouseup: function (e) {
            var self = S.editor.textEditor;
            if (S.editor.components.select.locked == true) {
                setTimeout(function () {
                    S.editor.components.select.locked = false;
                }, 10);
            }
            //if caret is inside pre tag, move outside of pre tag
            self.moveCaretOutside(['pre']);
        },

        // Rangy DOM manipulation ////////////////////////////////////////////////

        alterRange: function (name, tag, attributes, remove, outerOnly) {
            var sel = rangy.getSelection(), range, el, f, container,
                hasremove = false, hasclass = false;

            //select children if there is no selection made
            if (sel.isCollapsed == true) {
                sel.selectAllChildren(sel.anchorNode);
            }
             
            if (outerOnly == true) {
                //create outer node
                sel.refresh();
                range = sel.getRangeAt(0).cloneRange();
                container = range.commonAncestorContainer;
                var contents = range.extractContents();
                f = document.createDocumentFragment();
                el = document.createElement(tag);
                if (attributes != null) { $(el).attr(attributes); }
                el.appendChild(contents);
                var e = $(el).find('.' + name);
                if (e.length == 0 && remove != null) {
                    for (x = 0; x < remove.length; x++) {
                        e = $(el).find('.' + remove[x]);
                        if (e.length > 0) { hasremove = true; break; }
                    }
                }
                if (e.length > 0) {
                    el = el.firstChild;
                    if (hasremove == false) {
                        //remove outer node (toggle)
                        hasclass = true;
                        $(f).append(el.childNodes);
                        range.insertNode(f);
                    }
                }
                if (hasclass == false) {
                    f.appendChild(el);
                    range.insertNode(f);
                }
                range.normalizeBoundaries();
                sel.refresh();
                sel.setSingleRange(range);
            }


            //apply attributes & class (name) to all elements within the select
            var applier = rangy.createClassApplier(name, {
                elementTagName: tag,
                elementAttributes: attributes
            }, tag);
            applier.toggleSelection();

            //remove any classes from the selection that don't belong
            if (remove != null) {
                if (remove.length > 0) {
                    //remove classes from range
                    for (x = 0; x < remove.length; x++) {
                        applier = rangy.createClassApplier(remove[x], {
                            elementTagName: tag,
                            elementAttributes: attributes
                        }, tag);
                        applier.undoToSelection();
                    }
                }
            }

            //get all nodes within the selection
            sel.refresh();
            var nodes = [];
            for (x = 0; x < sel.rangeCount; x++) {
                nodes = nodes.concat(sel.getRangeAt(x).getNodes());
            }
            //find each text node and replace trailing spaces with &nbsp;
            for (x = 0; x < nodes.length; x++) {
                if (nodes[x].nodeType == 3) {
                    nodes[x].nodeValue = nodes[x].nodeValue.replace(/\s+$/g, '\u00a0');
                }
            }

            if (outerOnly == true) {
                //remove class (name) from all child nodes
                if (hasclass == false) {
                    el.className = name;
                }
                var c = $(el).find('.' + name).removeClass(name);
                sel.refresh();
                if (hasclass == false) {
                    range.selectNode(el);
                } else {
                    range.selectNodeContents(container);
                }
                sel.setSingleRange(range);
            }

            return this;
        },

        wrapRange: function (parent, child) {
            //appends selection within the child element & replaces selection with the parent element
            var sel = rangy.getSelection();
            sel.refresh();
            if (!child) { child = parent; }
            var range = sel.getRangeAt(0).cloneRange();
            container = range.commonAncestorContainer;
            var contents = range.extractContents();
            child.appendChild(contents);
            range.insertNode(parent);
            range.normalizeBoundaries();
            sel.refresh();
            sel.setSingleRange(range);
        },

        insertText: function (content, container, selectContent) {
            var sel, range;
            if (window.getSelection) {
                // IE9 and non-IE
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();

                    // Range.createContextualFragment() would be useful here but is
                    // only relatively recently standardized and is not supported in
                    // some browsers (IE9, for one)
                    var el = document.createElement("div");
                    if (typeof (content) == "string") {
                        el.innerHTML = content;
                    } else if (typeof (content) == "object") {
                        el.innerHTML = '';
                        el.appendChild(content);
                    }
                    var frag, node, lastNode;
                    if (container == null) {
                        frag = document.createDocumentFragment();
                    } else {
                        frag = container;
                    }
                    while ((node = el.firstChild)) {
                        lastNode = frag.appendChild(node);
                    }
                    var firstNode = frag.firstChild;
                    range.insertNode(frag);

                    // Preserve the selection
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        if (selectContent) {
                            range.setStartBefore(firstNode);
                        } else {
                            range.collapse(true);
                        }
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            } else if ((sel = document.selection) && sel.type != "Control") {
                // IE < 9
                var originalRange = sel.createRange();
                originalRange.collapse(true);
                sel.createRange().pasteHTML(html);
                if (selectContent) {
                    range = sel.createRange();
                    range.setEndPoint("StartToStart", originalRange);
                    range.select();
                }
            }
        },

        moveCaretOutside: function (tags) {
            //move the caret outside of a specific tag
            var self = S.editor.textEditor;
            var sel = rangy.getSelection();
            sel.refresh();
            var range = sel.getRangeAt(0);
            container = range.commonAncestorContainer;
            var node = container;
            while (node != null) {
                if (node.className) {
                    if (node.className.indexOf('c-textbox') >= 0) { break;}
                }
                if (node.tagName) {
                    if (tags.indexOf(node.tagName.toLowerCase()) >= 0) {
                        //move caret outside tag
                        range = range.cloneRange();
                        range.setStartAfter(node);
                        range.collapse(false);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        sel.refresh();
                        break;
                    }
                }
                node = node.parentNode;
            }
        },

        getCaretOffset: function(element) {
            var caretOffset = 0;
            var doc = element.ownerDocument || element.document;
            var win = doc.defaultView || doc.parentWindow;
            var sel;
            if (typeof win.getSelection != "undefined") {
                sel = win.getSelection();
                if (sel.rangeCount > 0) {
                    var range = win.getSelection().getRangeAt(0);
                    var preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(element);
                    preCaretRange.setEnd(range.endContainer, range.endOffset);
                    caretOffset = preCaretRange.toString().length;
                }
            } else if ((sel = doc.selection) && sel.type != "Control") {
                var textRange = sel.createRange();
                var preCaretTextRange = doc.body.createTextRange();
                preCaretTextRange.moveToElementText(element);
                preCaretTextRange.setEndPoint("EndToEnd", textRange);
                caretOffset = preCaretTextRange.text.length;
            }
            return caretOffset;
        },

        expandSelection: function (start, end) {
            //moves caret start & end positions relative to the parent node
            var self = S.editor.textEditor;
            var sel = rangy.getSelection();
            var range = sel.getRangeAt(0);
            var focusNode = sel.focusNode;
            var focusOffset = sel.focusOffset;
            var anchorNode = sel.anchorNode;
            var anchorOffset = sel.anchorOffset;
            var newRange = range.cloneRange();
            if ((focusOffset > anchorOffset) && anchorOffset > 0) { //selection is forwards
                newRange.setEnd(anchorNode, anchorOffset + end);
                newRange.setStart(anchorNode, anchorOffset - start);
            } else if ((focusOffset < anchorOffset) && focusOffset > 0) { //selection is backwards
                newRange.setEnd(focusNode, focusOffset + end);
                newRange.setStart(focusNode, focusOffset - start);
            } else {
                //TODO: no selection
                //newRange.setEnd(anchorNode, anchorOffset + end);
                //newRange.setStart(anchorNode, anchorOffset - start);
            }
            return newRange;
        },

        expandRangeWithPartialNodes: function (range) {
            while (range.startContainer.nodeType == 3 || range.startContainer.childNodes.length == 1) {
                range.setStartBefore(range.startContainer);
            }
                
            while (range.endContainer.nodeType == 3 || range.endContainer.childNodes.length == 1) {
                range.setEndAfter(range.endContainer);
            }
            return range;
        },

        getNextNode: function (node, endNode, skipChildren) {
            //if there are child nodes and we didn't come from a child node
            if (endNode == node) {
                return null;
            }
            if (node.firstChild && !skipChildren) {
                return node.firstChild;
            }
            if (!node.parentNode) {
                return null;
            }
            return node.nextSibling
                || getNextNode(node.parentNode, endNode, true);
        },

        wrapSelectedContents(tagname, className) {
            if (tagname) {
                var elem = document.createElement(tagname);
                if (className) {
                    elem.className = className;
                }
                var self = S.editor.textEditor;
                var sel = rangy.getSelection();
                var range = sel.getRangeAt(0).cloneRange();
                var contents = range.extractContents();
                elem.appendChild(contents);
                range.insertNode(elem);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        },

        // contentEditable commands ////////////////////////////////////////////////

        commands: {
            bold: function () {
                S.editor.textEditor.alterRange('bold', 'span', {});
            },

            italic: function () {
                S.editor.textEditor.alterRange('italic', 'span', {});
            },

            strikethru: function () {
                S.editor.textEditor.alterRange('linethru', 'span', {}, ['underline']);
            },

            underline: function () {
                S.editor.textEditor.alterRange('underline', 'span', {}, ['linethru']);
            },

            bulletList: function () {
                var ul = document.createElement("ul");
                var li = document.createElement("li");
                ul.className = "bullet-list";
                ul.appendChild(li);

                S.editor.textEditor.wrapRange(ul, li);
            },

            numberList: function () {
                var ul = document.createElement("ul");
                var li = document.createElement("li");
                ul.className = "number-list";
                ul.appendChild(li);

                S.editor.textEditor.wrapRange(ul, li);
            },

            outdent: function () {
                S.editor.textEditor.wrapSelectedContents("p", "outdent");
            },

            indent: function () {
                S.editor.textEditor.wrapSelectedContents("p", "indent");
            },

            alignLeft: function () {
                S.editor.textEditor.alterRange('align-left', 'span', {}, ['align-center', 'align-right'], true);
            },

            alignCenter: function () {
                S.editor.textEditor.alterRange('align-center', 'span', {}, ['align-left', 'align-right'], true);
            },

            alignRight: function () {
                S.editor.textEditor.alterRange('align-right', 'span', {}, ['align-center', 'align-left'], true);
            },

            photo: {
                show: function () {

                },

                add: function (file) {

                }
            },

            table: {
                show: function () {

                },

                add: function (rows, columns) {

                }
            },

            link: {
                show: function () {

                },

                add: function () {

                }
            },

            colors: {
                type: 'color',

                show: function (type) {

                },

                add: function (color) {

                }
            },

            source: {
                show: function () {

                },

                hide: function () {

                }
            }
        },

        // output from Text Editor ///////////////////////////////////////////////////

        clean: function (e) {
            //clean up dirty html tags created by rangy after user deselects component
            console.log(e);
            console.log(e.html());
            //var children = [];
            //e.each(function (a) { children.push(a); });
            //e.html('');
            //e.append(h.replace(/&nbsp;/g, ' '))
            //DOMPurify.sanitize(
            //    e.html().replace(/&nbsp;/gi, ' '),
            //    {
            //        FORBID_TAGS: [
            //            //XSS vulnerable tags
            //            'style', 'script', 'embed', 'link', 'iframe',
            //            //depreicated tags
            //            'font', 'b', 'i'
            //        ],
            //        SAFE_FOR_TEMPLATES:true
            //    }
            //)
        },

        purify: function(node, data){
            //remove tags with empty content
            //var content = node.textContent;
            //if (content == '&nbsp;' || content.trim() == '') {
            //    node.parentNode.insertBefore(document.createTextNode(' '), node);
            //    return node.parentNode.removeChild(node);
            //}
        }
    };

    S.editor.textEditor.init();
})();