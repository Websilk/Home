/// Websilk Platform : platform.js ///
var S = {
    website: {
        id: 0, title: '', protocol:'', host:''
    },

    editor: {
        visible: false, enabled: false
    },

    lostSession: function () {
        alert('Your session has been lost. The page will now reload');
        location.reload();
    }
}
