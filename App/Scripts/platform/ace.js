S.ace = {
    editors: [],

    add: function (id, mode, theme) {
        if (S.ace.editors[id]) { return; }
        if (mode == null) { mode = 'javascript';}
        if (theme == null) { theme = 'chaos';}
        if (!window.ace) {
            //load ace editor dependency
            S.util.js.load('/js/utility/ace/src-min/ace.js', 'acejs', function () {
                //add custom CSS
                S.util.css.add('acemod', '.ace_print-margin-layer{display:none;}');
                createAce();
                
            });
        } else { createAce();}

        function createAce() {
            //convert textarea DOM element into ace editor
            var a = ace.edit(id);
            a.setTheme("ace/theme/" + theme);
            a.getSession().setMode("ace/mode/" + mode);
            a.resize();
            S.ace.editors[id] = a;
        }
    }
}