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
            toolbar.find('.icon-numbers a').on('click', this.commands.numbersList);
            toolbar.find('.icon-indent a').on('click', this.commands.indent);
            toolbar.find('.icon-textleft a').on('click', this.commands.alignLeft);
            toolbar.find('.icon-textcenter a').on('click', this.commands.alignCenter);
            toolbar.find('.icon-textright a').on('click', this.commands.alignRight);
            toolbar.find('.icon-more a').on('click', this.showMore);
            toolbar.find('.icon-less a').on('click', this.showLess);

            //configure DOMpurify
            DOMPurify.addHook('uponSanitizeElement', function (node, data) {
                //remove tags with empty content
                var content = node.textContent;
                if (content == '&nbsp;' || content.trim() == '') {
                    node.parentNode.insertBefore(document.createTextNode(' '), node);
                    return node.parentNode.removeChild(node);
                }
            });
        },

        show: function (e) {
            var self = S.editor.textEditor;
            self.align();
            self.toolbar.show();

            e[0].contentEditable = 'true';
            S.editor.textEditor.revert = e.html();

            //add event for detecting select refresh & window resize
            S.editor.components.select.events.refresh.add('texteditor', self.align);

            //add event for text editor keyup
            $(document).on('keyup', S.editor.textEditor.keyup);

            //add event for detecting save button press
            S.editor.save.events.save.add('texteditor', self.save);
        },

        hide: function (e) {
            var self = S.editor.textEditor;
            self.save();
            S.editor.components.select.events.refresh.remove('texteditor');
            S.editor.save.events.save.remove('texteditor', self.save);
            self.toolbar.hide();
            e[0].removeAttribute('contentEditable');
            $(document).off('keyup', S.editor.textEditor.keyup);
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
            if (pos.top + win.scrolly < 50) {
                //show toolbar below component
                self.toolbar.css({ left: pos.left - 13, top: pos.top - 53 });
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

        keyup: function (e) {
            var k = e.keyCode;
            S.editor.textEditor.align();
            S.editor.components.select.refresh();
        },

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
        },

        commands: {
            bold: function () {
                S.editor.textEditor.alterRange('bold', 'span', {});
            },

            italic: function () {
                S.editor.textEditor.alterRange('italic', 'span', {});
            },

            strikethru: function () {
                S.editor.textEditor.alterRange('linethru', 'span', {});
            },

            underline: function () {
                S.editor.textEditor.alterRange('underline', 'span', {});
            },

            bulletList: function () {
                //S.editor.textEditor.instance.invokeElement('ul', { style: 'list-style-type:disc' }).invokeElement('li', {});
            },

            numberList: function () {
                //S.editor.textEditor.instance.invokeElement('ul', { style: 'list-style-type:decimal' }).invokeElement('li', {});
            },

            outdent: function () {
            },

            indent: function () {
                S.editor.textEditor.alterRange('indent', 'span', {}, {}, true);
            },

            alignLeft: function () {
                S.editor.textEditor.alterRange('alignleft', 'span', {}, ['aligncenter', 'alignright'], true);
            },

            alignCenter: function () {
                S.editor.textEditor.alterRange('aligncenter', 'span', {}, ['alignleft', 'alignright'], true);
            },

            alignRight: function () {
                S.editor.textEditor.alterRange('alignright', 'span', {}, ['aligncenter', 'alignleft'], true);
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

        showMore: function () {
            $('.text-toolbar .edit-basic').hide();
            $('.text-toolbar .edit-advanced').show();
        },

        showLess: function () {
            $('.text-toolbar .edit-basic').show();
            $('.text-toolbar .edit-advanced').hide();
        },

        clean: function (e) {
            //clean up dirty html tags created by rangy after user deselects component
            e.html(
                DOMPurify.sanitize(
                    e.html().replace(/&nbsp;/gi, ' '),
                    {
                        FORBID_TAGS: [
                            //XSS vulnerable tags
                            'style', 'script', 'embed', 'link', 'iframe',
                            //depreicated tags
                            'font', 'b', 'i'
                        ]
                    }
                )
            );
        }
    };

    S.editor.textEditor.init();
})();