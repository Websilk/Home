S.login = {
    watchPass: function (e) {
        
    },

    savePass: function () {
        //save new password for user
        var pass = $('#password').val();
        var pass2 = $('#password2').val();
        var msg = $('.login .message').removeClass('error');
        var msglbl = $('.login .message > span');
        //validate password
        if (pass == '' || pass2 == '') {
            msg.addClass('error').show();
            msglbl.html('You must type in your password twice');
            return;
        }
        if (pass != pass2) {
            msg.addClass('error').show();
            msglbl.html('You must type in your password twice');
            msg.addClass('error').html('Your passwords do not match').show();
            return;
        }
        if (pass.length < 8) {
            msg.addClass('error').show();
            msglbl.html('Your password must be at least 8 characters long');
            return;
        }

        //disable button
        $('#btnsavepass').prop("disabled", "disabled");

        //send new password to server
        S.ajax.post('Components/Login/SavePass', { pass: pass }, function (data) {
            //callback, replace form with message
            var err = false;
            if (data.d){
                if (data.d == 'err') { err = true;}
            } else { err = true; }
             
            if (err == false) {
                //show success message
                msg.addClass('error').show();
                msglbl.html('Your password has been updated. Go ahead and <a href="javascript:window.location.reload()">Log In</a> with your new password');
            } else {
                //show error message
                msg.addClass('error').show();
                msglbl.html('An error occurred while trying to update your password');
            }
        });
    },

    validatePass: function (pass, pass2) {
        
    }
}

//add event listeners
$('#password, #password2').on('input', S.login.watchPass);
$('#btnsavepass').on('click', S.login.savePass);
$('.login form').on('submit', function (e) { S.login.savePass(); e.preventDefault(); return false; });