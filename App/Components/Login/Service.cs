namespace Websilk.Services.Components
{
    public class Login : Service
    {
        public Login(Core WebsilkCore) : base(WebsilkCore) { }

        public Inject Submit(string email, string pass)
        {
            var response = new Inject();
            if (S.isSessionLost()) { return lostInject(); }

            if (S.User.LogIn(email, pass))
            {
                //logged in
            }else
            {
                //error logging in
            }
            return response;
        }

        public Inject ForgotPassword()
        {
            //this feature is very vulnerable to attack and should
            //require 2-way authentication (via cell phone)
            var response = new Inject();
            if (S.isSessionLost()) { return lostInject(); }

            return response;
        }

        public string SavePass(string pass)
        {
            //save a new password for an existing user that does not have a password set
            if (S.isSessionLost()) { return "err"; }

            //validate password
            if(pass == "") { return "err"; }
            if(pass.Length < 8) { return "err"; }

            if (S.Server.resetPass == true)
            {
                //update password for administrator
                S.User.UpdatePassword(1, pass);
            }
            return "saved";
        }
    }
}
