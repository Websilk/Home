/*/////////////////////////////////////
Initialize Websilk Platform
/////////////////////////////////////*/
S.init = function (website) {
    S.website = website;
    S.events.url.callback.execute();
}

// Window Events ////////////////////////////////////////////////////////////////////////////////////
$(document).on('ready', function () { S.events.doc.ready(); });
//$(document.body).on('click', function (e) { S.events.doc.click.trigger(e.target); });
$(window).on('resize', function () { S.events.doc.resize.trigger(); });
$(window).on('scroll', function () { S.events.doc.scroll.trigger(); });
$(window).on('popstate', S.events.url.change);
$('iframe').on('load', function () { S.events.iframe.loaded(); });

//record initial page load in history API
if (history) { history.replaceState(document.location.href.replace(S.url.domain(), ''), document.title, document.location.href); }

//raise event after document is loaded
S.events.doc.load();