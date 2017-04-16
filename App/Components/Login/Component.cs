
namespace Websilk.Components
{
    public class Login: Component
    {
        public string label = "Log In";

        public Login() { }

        public override string Name
        {
            get
            {
                return "Login";
            }
        }

        public override string Path
        {
            get
            {
                return "/Components/Login/";
            }
        }

        public override void Load()
        {
            if(S.Server.resetPass == true)
            {
                //load new password form (for admin only)
                scaffold = new Scaffold(S, "/Components/Login/new-pass.html");
                var txtPass = (Element.Textbox)Page.Elements.Load(ElementType.Textbox);
                var txtPass2 = (Element.Textbox)Page.Elements.Load(ElementType.Textbox);
                var btnLogin = (Element.Button)Page.Elements.Load(ElementType.Button, "button-apply");
                scaffold.Data["title"] = "Create an administrator password";
                scaffold.Data["field-pass"] = txtPass.Render("password", "password", "", "password", "", Element.Textbox.enumTextType.password);
                scaffold.Data["field-pass2"] = txtPass2.Render("password2", "password", "", "retype password", "", Element.Textbox.enumTextType.password);
                scaffold.Data["button-save"] = btnLogin.Render("btnsavepass", "javascript:", "Save");
                AddJavascriptFile("new-pass", "/js/components/login/new-pass.js");
            }
            else
            {
                //load login form (default)
                var txtEmail = (Element.Textbox)Page.Elements.Load(ElementType.Textbox);
                var txtPass = (Element.Textbox)Page.Elements.Load(ElementType.Textbox);
                var btnLogin = (Element.Button)Page.Elements.Load(ElementType.Button, "button-apply");
                scaffold.Data["field-email"] = txtEmail.Render("email", "email", "", "email address");
                scaffold.Data["field-pass"] = txtPass.Render("password", "password", "", "password", "", Element.Textbox.enumTextType.password);
                scaffold.Data["button-login"] = btnLogin.Render("btnlogin", "javascript:", label);
                AddJavascriptFile("component", "/js/components/login/component.js");
            }
            
        }
    }
}
