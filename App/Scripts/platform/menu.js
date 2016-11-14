S.menu = {
    click: function (e) {
        var sub = this.querySelector('ul.menu');
        if (sub) {
            if (sub.length > 0) {
                sub.toggleClass('expanded');
            }
        }
        e.preventDefault();
        return false;
    }
} 