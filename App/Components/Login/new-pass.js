S.login = {
    pass: $('#password').get(0),
    pass2: $('#password2').get(0),

    watchPass: function (e) {
        console.log(e);
        console.log(this);
    },

    savePass: function () {
        //send new admin password to server
        var pass = $('#password').val();
        var pass2 = $('#password2').val();

        //validate password


        S.ajax.post('Components/Login/SavePass', { pass: pass }, function (data) {
            //callback, replace form with message
            var err = false;
            if (data.d){
                if (data.d == 'err') { err = true;}
            } else { err = true; }

            var msg = $('.login .message');
            if (err == false) {
                //show success message
                msg.removeClass('error').html('Your password has been updated. Go ahead and <a href="javascript:window.location.reload()">Log In</a> with your new password.');

            } else {
                //show error message
                msg.addClass('error').html('An error occurred while trying to update your password.');
            }
        });
    },

    validatePass: function (pass, pass2) {
        
    }
}

//add event listeners
$('#password, #password2').on('input', S.login.watchPass);
$('.login .btnsave').on('click', S.login.savePass);