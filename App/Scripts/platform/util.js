S.util = {
    js: {
        load: function (file, id, callback) {
            //add javascript file to DOM
            if (document.getElementById(id)) { if(callback){callback();}return false;}
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = file;
            script.id = id;
            script.onload = callback;
            head.appendChild(script);
        }
    },
    css: {
        load: function (file, id) {
            //download CSS file and load onto the page
            if (document.getElementById(id)) { return false; }
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.src = file;
            link.id = id;
            head.appendChild(link);
        },

        add: function (css, id) {
            //add raw CSS to the page inside a style tag
            $('#' + id).remove();
            $('head').append('<style id="' + id + '" type="text/css">' + css + "</style>");
        },
    }
}

S.math = {
    intersect: function (a, b) {
        //checks to see if rect (a) intersects with rect (b)
        if (b.left < a.right && a.left < b.right && b.top < a.bottom){
            return a.top < b.bottom;
        }else{
            return false;
        }
    }
}