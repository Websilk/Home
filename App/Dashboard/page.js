S.dashboard = {
    sections: {
        show: function (name) {
            $('.dash-body .dash-section').hide();
            $('.dash-body .section-' + name).show();
        }
    }
} 

//add event for clicking a menu item
$('.dash-side ul.menu li').on('click', S.menu.click);

//add event to listen for a page url change
S.events.url.callback.add('dash-menu', null, function () {
    $('.dash-menu ul.menu li > .row.hover.selected').removeClass('selected');
    //find the correct menu item to select
    var items = $('.dash-menu ul.menu li > .row.hover');
    for (var x = 0; x < items.elements.length; x++) {
        var e = items.get(x);
        var a = $(e).find('a');
        if (a.length > 0) {
            if (window.location.href.indexOf(a.get(0).href) >= 0) {
                $(e).addClass('selected');
                break;
            }
        }
    }
});