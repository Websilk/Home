S.login = {
    savepass: function () {
        //send new admin password to server
        var pass = $('#password').val();
        var pass2 = $('#password2').val();
        S.ajax.post('Components/Login/SavePass', { pass: pass, pass2: pass2 }, function (data) {
            //callback, replace form with message
            var err = false;
            if (data.d){
                if (data.d == 'err') { err = true;}
            } else { err = true; }

            if (err == false) {
                //show success message

            } else {
                //show error message

            }
        });
    }
}