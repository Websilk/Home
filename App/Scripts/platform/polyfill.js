//Element.matches polyfill
this.Element && function (e) { e.matchesSelector = e.matchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector || e.webkitMatchesSelector || function (e) { var t = this, n = (t.parentNode || t.document).querySelectorAll(e), r = -1; while (n[++r] && n[r] != t); return !!n[r] } }(Element.prototype)
