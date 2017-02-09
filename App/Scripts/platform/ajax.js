S.ajax = {
    //class used to make simple web service posts to the server
    expire: new Date(), queue: [],

    post: function (url, data, callback) {
        this.expire = new Date();
        S.events.ajax.start();
        var d = data;
        d.pageId = S.page.id;

        var options = {
            method: "POST",
            data: JSON.stringify(d),
            dataType: "json",
            url: '/api/' + url,
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
            if (data.type == 'Websilk.Services.Inject') {
                //load new content from web service
                if (data.d.element != '') {
                    var elem = $(data.d.element);
                    var node = null;
                    if (data.d.node != '') { node = $(data.d.node);}
                    if (elem.length > 0 && data.d.html != '') {
                        if (data.d.remove != '') {
                            $(data.d.remove).remove();
                        }
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
                            case 4: //beforeNode
                                node.before(data.d.html);
                                break;
                            case 5: //afterNode
                                node.after(data.d.html);
                                break;
                        }
                    }
                }
                //add any CSS to the page
                if (data.d.css != null && data.d.css != '') {
                    S.util.css.add(data.d.css, data.d.cssId);
                }
                //
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
            if (data.type == 'Websilk.Services.PageRequest') {
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
    }
};