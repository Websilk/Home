S.login = {
    submit: function () {
        var email = $('#email').val();
        var pass = $('#password').val(); 

        S.ajax.post('Components/Login/Authenticate', { email: email, pass: pass}, function (data) {
            if (data.d) {
                var msg = $('.login .message');
                if (data.d == 'err') {
                    S.message.show(msg, 'error', 'Your credentials are incorrect');
                    return false;
                } else if (data.d == 'success') {
                    S.message.show(msg, '', 'Login success! Redirecting to dashboard...');
                    window.location.href = '/dashboard';
                }
            }
        });
    }
}
$('#btnlogin').on('click', S.login.submit); 
$('.login form').on('submit', function (e) { S.login.submit(); e.preventDefault(); return false; }); 