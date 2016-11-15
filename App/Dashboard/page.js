S.dashboard = {
    sections: {
        show: function (name) {
            $('.dash-body .dash-section').hide();
            $('.dash-body .section-' + name).show();
        }
    }
}

//add events for menu items
$('.dash-side ul.menu li').on('click', S.menu.click);