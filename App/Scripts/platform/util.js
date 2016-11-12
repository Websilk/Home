S.util = {
    js: {
        load: function (file, id) {
            //add javascript file to DOM
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = file;
            script.id = id;
            head.appendChild(script);
        }
    },
    css: {
        load: function (file, id) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.src = file;
            link.id = id;
            head.appendChild(link);
        }
    }
};