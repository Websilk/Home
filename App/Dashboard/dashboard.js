S.dashboard = {
    website: {
        id: 0,
        title: '',
        host:''
    },

    sections: {
        show: function (name) {
            $('.dash-body .dash-section').hide();
            $('.dash-body .section-' + name).show();
        }
    }
}

//add event to listen for click & page url change
S.menu.addListener('dash-menu', '.dash-menu ul.menu');