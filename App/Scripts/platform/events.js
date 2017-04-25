﻿S.events = {

    doc: {
        load: function () {
            S.url.checkAnchors();
        },

        ready: function () {
            S.events.doc.resize.trigger();
        },

        mousedown: {
            trigger: function (target) {
                var type = 'bg';
                if (!target) { return type; }
                var t = $(target);
                if (t.length == 0) { return type; }
                if (t.parents('.component').length > 0 || t.hasClass('component') == true) {
                    type = 'component';
                } else if (t.parents('.window').length > 0 || t.hasClass('window') == true) {
                    type = 'window';
                } else if (t.parents('.toolbar').length > 0 || t.hasClass('toolbar') == true) {
                    type = 'toolbar';
                } else if (t.parents('.component-select').length > 0 || t.hasClass('component-select') == true) {
                    type = 'component-select';
                } else if (t.parents('.component-hover').length > 0 || t.hasClass('component-hover') == true) {
                    type = 'component-hover';
                }
                S.events.doc.click.type = type;
            }
        },

        click: {
            type: '',

            trigger: function (target) {
                this.callback.execute(target, this.type);
                return this.type;
            },

            callback: {
                //register & execute callbacks when the user clicks anywhere on the document
                items: [],

                add: function (elem, onClick) {
                    this.items.push({ elem: elem, onClick: onClick });
                },

                remove: function (elem) {
                    for (var x = 0; x < this.items.length; x++) {
                        if (this.items[x].elem == elem) { this.items.splice(x, 1); x--; }
                    }
                },

                execute: function (target, type) {
                    if (this.items.length > 0) {
                        for (var x = 0; x < this.items.length; x++) {
                            if (typeof this.items[x].onClick == 'function') {
                                this.items[x].onClick(target, type);
                            }
                        }
                    }
                }
            }
        },

        scroll: {
            timer: { started: false, fps: 60, timeout: 250, date: new Date(), callback: null },
            last: { scrollx: 0, scrolly: 0 },

            trigger: function () {
                this.timer.date = new Date();
                if (this.timer.started == false) { this.start(); }
            },

            start: function () {
                if (this.timer.started == true) { return; }
                this.timer.started = true;
                this.timer.date = new Date();
                this.callback.execute('onStart');
                this.go();
            },

            go: function () {
                if (this.timer.started == false) { return; }
                this.last.scrollx = window.scrollX;
                this.last.scrolly = window.scrollY;
                S.window.scrollx = this.last.scrollx;
                S.window.scrolly = this.last.scrolly;
                this.callback.execute('onGo');

                if (new Date() - this.timer.date > this.timer.timeout) {
                    this.stop();
                } else {
                    this.timer.callback = setTimeout(function () { S.events.doc.scroll.go(); }, 1000 / this.timer.fps)
                }
            },

            stop: function () {
                if (this.timer.started == false) { return; }
                this.timer.started = false;
                this.last.scrollx = window.scrollX;
                this.last.scrolly = window.scrollY;
                S.window.scrollx = this.last.scrollx;
                S.window.scrolly = this.last.scrolly;
                this.callback.execute('onStop');
            },

            callback: {
                //register & execute callbacks when the window resizes
                items: [],

                add: function (elem, onStart, onGo, onStop) {
                    this.items.push({ elem: elem, onStart: onStart, onGo: onGo, onStop: onStop });
                },

                remove: function (elem) {
                    for (var x = 0; x < this.items.length; x++) {
                        if (this.items[x].elem == elem) { this.items.splice(x, 1); x--; }
                    }
                },

                execute: function (type) {
                    if (this.items.length > 0) {
                        switch (type) {
                            case '': case null: case 'onStart':
                                for (var x = 0; x < this.items.length; x++) {
                                    if (typeof this.items[x].onStart == 'function') {
                                        this.items[x].onStart();
                                    }
                                } break;

                            case 'onGo':
                                for (var x = 0; x < this.items.length; x++) {
                                    if (typeof this.items[x].onGo == 'function') {
                                        this.items[x].onGo();
                                    }
                                } break;

                            case 'onStop':
                                for (var x = 0; x < this.items.length; x++) {
                                    if (typeof this.items[x].onStop == 'function') {
                                        this.items[x].onStop();
                                    }
                                } break;

                        }
                    }
                }
            }


        },

        resize: {
            timer: { started: false, fps: 60, timeout: 250, date: new Date(), callback: null },

            trigger: function () {
                this.timer.date = new Date();
                if (this.timer.started == false) { this.start(); S.window.changed = true; S.window.pos(); }
            },

            start: function () {
                if (this.timer.started == true) { return; }
                clearInterval(this.timer.callback);
                this.timer.date = new Date();
                this.timer.started = true;
                this.callback.execute('onStart');
                this.timer.callback = setInterval(function () { S.events.doc.resize.go(); }, 1000 / this.timer.fps);
                this.go();
            },

            go: function () {
                if (this.timer.started == false) { return; }
                S.window.changed = true; S.window.pos();
                this.callback.execute('onGo');
                if (new Date() - this.timer.date > this.timer.timeout) {
                    this.stop();
                    return;
                }
                if (S.viewport.getLevel() == true) {
                    this.callback.execute('onLevelChange');
                }
            },

            stop: function () {
                if (this.timer.started == false) { return; }
                clearInterval(this.timer.callback);
                this.timer.started = false;
                if (S.viewport.getLevel() == true) {
                    this.callback.execute('onLevelChange');
                }
                this.callback.execute('onStop');
            },

            callback: {
                //register & execute callbacks when the window resizes
                items: [],

                add: function (elem, onStart, onGo, onStop, onLevelChange) {
                    this.items.push({ elem: elem, onStart: onStart, onGo: onGo, onStop: onStop, onLevelChange: onLevelChange });
                },

                remove: function (elem) {
                    for (var x = 0; x < this.items.length; x++) {
                        if (this.items[x].elem == elem) { this.items.splice(x, 1); x--; }
                    }
                },

                execute: function (type, lvl) {
                    if (this.items.length > 0) {
                        switch (type) {
                            case 'onStart':
                                for (var x = 0; x < this.items.length; x++) {
                                    if (this.items[x].onStart) {this.items[x].onStart();}
                                } break;

                            case 'onGo':
                                for (var x = 0; x < this.items.length; x++) {
                                    if (this.items[x].onGo) {this.items[x].onGo();}
                                } break;

                            case 'onStop':
                                for (var x = 0; x < this.items.length; x++) {
                                    if (this.items[x].onStop) {this.items[x].onStop();}
                                } break;

                            case 'onLevelChange':

                                for (var x = 0; x < this.items.length; x++) {
                                    if (this.items[x].onLevelChange) {this.items[x].onLevelChange(lvl);}
                                } break;
                        }
                    }
                }
            }
        }
    },

    iframe: {
        loaded: function () {

        }
    },

    ajax: {
        //register & execute callbacks when ajax makes a post
        loaded: true,

        start: function () {
            this.loaded = false;
            $(document.body).addClass('wait');

        },

        complete: function () {
            S.events.ajax.loaded = true;
            $(document.body).removeClass('wait');
            S.window.changed = true;
            S.events.images.load();

            //replace all relative URLs with ajax posts
            setTimeout(function () { S.url.checkAnchors(); }, 500);
        },

        error: function (status, err) {
            S.events.ajax.loaded = true;
            $(document.body).removeClass('wait');
        },

        callback: {
            items: [],

            add: function (elem, onStart, onComplete, onError) {
                this.items.push({ elem: elem, onStart: onStart, onComplete: onComplete, onError: onError });
            },

            remove: function (elem) {
                for (var x = 0; x < this.items.length; x++) {
                    if (this.items[x].elem == elem) { this.items.splice(x, 1); x--; }
                }
            },

            execute: function (type) {
                if (this.items.length > 0) {
                    switch (type) {
                        case '': case null: case 'onStart':
                            for (var x = 0; x < this.items.length; x++) {
                                if (typeof this.items[x].onStart == 'function') {
                                    this.items[x].onStart();
                                }
                            } break;

                        case 'onComplete':
                            for (var x = 0; x < this.items.length; x++) {
                                if (typeof this.items[x].onComplete == 'function') {
                                    this.items[x].onComplete();
                                }
                            } break;

                        case 'onError':
                            for (var x = 0; x < this.items.length; x++) {
                                if (typeof this.items[x].onError == 'function') {
                                    this.items[x].onError();
                                }
                            } break;

                    }
                }
            }
        }
    },

    url: {
        change: function (e) {
            if (typeof e.state == 'string') {
                if (S.events.url.callback.execute(e) == false) { return false; }
                S.url.load(e.state, 1);
            }
        },

        //register & execute callbacks when the url changes
        callback: {
            items: [],

            add: function (elem, onCallback) {
                this.items.push({ elem: elem, onCallback: onCallback });
            },

            remove: function (elem) {
                for (var x = 0; x < this.items.length; x++) {
                    if (this.items[x].elem == elem) { this.items.splice(x, 1); x--; }
                }
            },

            execute: function (e) {
                if (this.items.length > 0) {
                    for (var x = 0; x < this.items.length; x++) {
                        if (typeof this.items[x].onCallback == 'function') {
                            if (this.items[x].onCallback(e) == false) { return false; }
                        }
                    }
                }
                return true;
            }
        }
    },

    images: {
        load: function () {
            imgs = $('img:not([src=""])');
            if (!imgs.length) { S.events.images.complete(); return; }
            var df = [];
            imgs.each(function () {
                var dfnew = $.Deferred();
                df.push(dfnew);
                var img = new Image();
                img.onload = function () { dfnew.resolve(); }
                img.src = this.src;
            });
            //$.when.apply($, df).done(S.events.images.complete);
        },

        complete: function () {
            S.events.doc.resize.trigger();
        }
    }
};