﻿
namespace Websilk.Components
{
    public class Login: Component
    {
        public string label = "Log In";

        public Login() { }

        public override string Path
        {
            get
            {
                return "/App/Components/Login/";
            }
        }

        public override void Load()
        {
            var txtEmail = (Element.Textbox)Page.Elements.Load(ElementType.Textbox);
            var txtPass = (Element.Textbox)Page.Elements.Load(ElementType.Textbox);
            var btnLogin = (Element.Button)Page.Elements.Load(ElementType.Button, "button-apply");
            scaffold.Data["field-email"] = txtEmail.Render("email", "email", "", "email address");
            scaffold.Data["field-pass"] = txtPass.Render("password", "password", "", "password", "", Element.Textbox.enumTextType.password);
            scaffold.Data["button-login"] = btnLogin.Render("btnlogin", "javascript:S.login.submit()", label);
        }
    }
}
