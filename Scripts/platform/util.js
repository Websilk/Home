S.util = {
    js: {
        load: function (file) {
            //add javascript file to DOM
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = file;
            head.appendChild(script);
        }
    }
};