S.editor.support = {

    search: function (keywords) {
        S.editor.support.load('Search', { page: 'search', keywords: keywords });
    },

    searchKeyUp: function (e) {
        if(e.keyCode == 13){
            //user pressed enter key
            S.editor.support.search($('#support_search').val());
        }
    },

    glossary: function () {
        S.editor.support.load('Get', { page: 'glossary' });
    },

    page: function (name) {
        S.editor.support.load('Get', { page: name });
    },

    load: function(action, data) {
        if ($('#winDocumentation').length == 0) {
            S.editor.window.load('Documentation', {
                left: 0,
                top: 0,
                width: 400,
                maxHeight: 800,
                title: '',
                alignTo: 'top-right',
                onLoad: function () {
                    request();
                }
            });
        } else {
            $('#winDocumentation').show();
            request();
        }

        function request() {
            S.ajax.post('Editor/Support/' + action, data, function (data) {
                $('#winDocumentation .content').html(data.d);
                S.editor.window.reposition('Documentation');
                $('.support-search a.search').on('click', function () { S.editor.support.search($('#support_search').val()); });
                $('#support_search').on('keyup', S.editor.support.searchKeyUp);
            });
        }
    }
};