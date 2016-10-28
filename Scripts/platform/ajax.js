S.ajax = {
    //class used to make simple web service posts to the server
    expire: new Date(), queue: [], timerKeep: null, keeping: true,

    post: function (url, data, callback) {
        this.expire = new Date();
        S.events.ajax.start();
        data.pageId = S.page.id;
        var options = {
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            url: url,
            contentType: "text/plain; charset=utf-8",
            success: function (d) { S.ajax.runQueue(); S.events.ajax.complete(d); callback(d); },
            error: function (xhr, status, err) { S.events.ajax.error(status, err); S.ajax.runQueue(); }
        }
        S.ajax.queue.push(options);
        if (S.ajax.queue.length == 1) {
            $.ajax(options);
        }
    },

    runQueue: function () {
        S.ajax.queue.shift();
        if (S.ajax.queue.length > 0) {
            $.ajax(S.ajax.queue[0]);
        }
    },

    callback: {
            inject: function (data) {
                if (data.type == 'Websilk.Inject') {
                    //load new content from web service
                    if (data.d.element != '') {
                        var elem = $(data.d.element);
                        if (elem.length > 0 && data.d.html != '') {
                            switch (data.d.inject) {
                                case 0: //replace
                                    elem.html(data.d.html);
                                    break;
                                case 1: //append
                                    elem.append(data.d.html);
                                    break;
                                case 2: //before
                                    elem.before(data.d.html);
                                    break;
                                case 3: //after
                                    elem.after(data.d.html);
                                    break;
                            }
                        }
                    }
                    //add any CSS to the page
                    if (data.d.css != null && data.d.css != '') {
                        S.css.add(data.d.cssid, data.d.css);
                    }

                    //finally, execute callback javascript
                    if (data.d.js != '' && data.d.js != null) {
                        var js = new Function(data.d.js);
                        js();
                    }
                }

                //S.events.render.trigger();
                S.events.doc.resize.trigger();
            },

            pageRequest: function (data) {
                if (data.d == null) { return; }
                if (data.type == 'Websilk.PageRequest') {
                    if (data.d.already == true && data.d.components.length == 0) {
                        //create new state in browser history
                        S.url.push(data.d.pageTitle, data.d.url);
                        if (S.editor.enabled == true) {
                            S.editor.dashboard.hide();
                        }
                        return;
                    }
                    //load new page from web service
                    var p, comp, div;

                    //first, remove unwanted components
                    for (x = 0; x < data.d.remove.length; x++) {
                        $('#c' + data.d.remove[x]).remove();
                    }
                    S.components.cleanup();

                    //remove any duplicate components
                    for (x = 0; x < data.d.components.length; x++) {
                        comp = data.d.components[x];
                        if ($('#c' + comp.itemId).length > 0) {
                            $('#c' + comp.itemId).remove();
                        }
                    }

                    //next, add new components
                    for (x = 0; x < data.d.components.length; x++) {
                        comp = data.d.components[x];
                        p = $('.panel' + comp.panelClassId + ' .inner-panel')[0];
                        if (typeof p == 'object') {
                            div = document.createElement('div');
                            div.innerHTML = comp.html;
                            p.appendChild(div.firstChild);
                        }
                    }
                    $('#divPageLoad').hide();
                    $('.component').show();

                    //add editor if exists (only on login)
                    if (data.d.editor != '') {
                        $('.body').before(data.d.editor);
                    }

                    //update id & title
                    S.page.id = data.d.pageId;
                    if (data.d.pageTitle != '') {  document.title = data.d.pageTitle; }

                    //create new state in browser history
                    S.url.push(data.d.pageTitle, data.d.url);

                    //finally, execute callback javascript
                    if (data.d.js != '' && data.d.js != null) {
                        var js = new Function(data.d.js);
                        js();
                    }

                    //reset the rendering engine
                    S.events.doc.resize.trigger();

                    //add CSS to page
                    if (data.d.css != null && data.d.css != '') {
                        S.css.add('pageRequest' + S.page.id, data.d.css);
                    }

                    //run registered callbacks
                    S.events.url.callback.execute();
                }
            }
    },

    keepAlive: function () {
        //return;
        if (typeof isNotKeepAlive != "undefined") { return; }
        clearTimeout(this.timerKeep);
        var options = { save: '' };
        if (S.editor) {
            if (S.editor.save) {
                if (S.editor.save.cache.length > 0) {
                    options.save = JSON.stringify(S.editor.save.cache);
                    S.editor.save.cache = [];
                    $('.editor .toolbar .savepage').addClass('saving');
                }
            }

        }

        if (((new Date() - this.expire) / 1000) >= 180 || options.save.length > 0) {
            this.expire = new Date();
            this.post("/api/App/KeepAlive", options, function (data) {
                if (S.editor) {
                    $('.editor .toolbar .savepage').removeClass('saving').addClass('nosave');
                }
                if (data.d == "lost") {
                    S.lostSession();
                }
            });
        }
        this.timerKeep = setTimeout(function () { S.ajax.keepAlive(); }, 180000);
    }
};