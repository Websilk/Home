S.scaffold = function(html, vars, tagStart, tagEnd){
    this.html = html;
    this.vars = vars;
    if (tagStart) {
        this.tagStart = tagStart;
    } else { this.tagStart = "#"; }
    if (tagEnd) {
        this.tagEnd = tagEnd;
    } else { this.tagEnd = "#"; }
}

S.scaffold.prototype.render = function () {
    var a = 0, b = 0, c = 0, d = 0;
    var htm = this.html;
    var ischanged = true;
    for (var key in this.vars) {
        ischanged = true;
        while (ischanged == true) {
            ischanged = false;
            //check for scaffold closing first
            a = htm.indexOf(this.tagStart + '/' + key);
            if (a >= 0) {
                //found a group of html to show or hide based on scaffold element boolean value
                b = htm.indexOf(this.tagEnd, a);
                if (b > 0) {
                    //find beginning of tag
                    c = htm.indexOf(this.tagStart + key);
                    d = htm.indexOf(this.tagEnd, c);
                    if (c >= 0 && d > c) {
                        if (this.vars[key] === false) {
                            //hide group of html
                            htm = htm.substr(0, c) + htm.substr(b + 2);
                            ischanged = true;
                        } else if (elements[x][1] === true) {
                            //show group of html
                            htm = htm.substr(0, c) + htm.substr(d + 2, a - (d + 2)) + htm.substr(b + 2);
                            ischanged = true;
                        }
                        continue;
                    }
                }
            }
            //check for scaffold element to replace with a value
            if (ischanged == false) {
                if (htm.indexOf('{{' + key + '}}') >= 0) {
                    htm = htm.replace('{{' + key + '}}', this.vars[key]);
                    ischanged = true;
                }
            }
        }
    }
    return htm;
}