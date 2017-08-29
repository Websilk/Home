S.slides = function(selector){
    //<div class="slideshow">
    //    <div class="slides">
    //        <div>(insert slide #2 content here)</div>
    //        <div>(insert slide #3 content here)</div>
    //    </div>
    //</div>

    this.elem = $(selector);
    this.items = this.elem.find('.slides').first();
    this.current_slide = 0;
    return this;
}

S.slides.prototype.add = function (html, vars) {
    //insert scaffold html with vars into the slides list
    var scaffold = new S.scaffold(html, vars);
    this.items.append(scaffold.render());
    this.items.css({ width: (100 * (this.items.children().length)) + '%' });
};

S.slides.prototype.next = function (count) {
    //show next slide (from +count offset)
    var slides = this.items.children();
    this.current_slide += (count > 0 ? count : 1);
    var index = this.current_slide;
    $(slides[this.current_slide]).removeClass('hiding');
    this.items.css({ left: (this.current_slide * 100 * -1) + '%' });
    setTimeout(function () {
        $(slides[index - 1]).addClass('hiding');
    }, 200);
};

S.slides.prototype.previous = function (count) {
    //show previous slide (from -count offset)
    var slides = this.items.children();
    this.current_slide -= (count > 0 ? count : 1);
    var index = this.current_slide;
    $(slides[this.current_slide]).removeClass('hiding');
    this.items.css({ left: (this.current_slide * 100 * -1) + "%" });
    setTimeout(function () {
        $(slides[index + 1]).addClass('hiding');
    }, 200);
};

S.slides.prototype.cleanAfter = function () {
    //remove all slides after the selected element
    var slides = this.items.children();
    var slide = slides.get(this.current_slide);
    var found = false;
    slides.each(function (e) {
        if (found == true) { $(e).remove(); return; }
        if (e == slide) { found = true; }
    });
};
