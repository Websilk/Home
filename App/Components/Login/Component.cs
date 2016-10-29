
namespace Websilk.Components
{
    public class Login: Component
    {
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
            var txtEmail = (Element.Textbox)Page.Elements.Load(ElementType.Textbox, "");
            var txtPass = (Element.Textbox)Page.Elements.Load(ElementType.Textbox, "password");
            scaffold.Data["field-email"] = txtEmail.Render("email", "", "email address", "");
            scaffold.Data["field-pass"] = txtPass.Render("password", "","pa$$word","", Element.Textbox.enumTextType.password);
        }
    }
}
