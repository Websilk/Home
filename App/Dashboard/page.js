S.dashboard = {
    sections: {
        show: function (name) {
            $('.dash-body .dash-section').hide();
            $('.dash-body .section-' + name).show();
        }
    }
}

//add event to listen for click & page url change
S.menu.addListener('dash-menu', '.dash-menu ul.menu');