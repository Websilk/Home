
namespace Websilk.Components
{
    public class Textbox: Component
    {
        public string text = "";

        public Textbox() { }

        public override string Name
        {
            get
            {
                return "Textbox";
            }
        }

        public override string Path
        {
            get
            {
                return "/App/Components/Textbox/";
            }
        }

        public override int defaultWidth
        {
            get
            {
                return 300;
            }
        }

        public override void Load()
        {
            scaffold = new Scaffold(S, "/App/Components/Textbox/component.html");

            //Lorem Ipsum taken from https://baconipsum.com/?paras=1&type=all-meat&start-with-lorem=1 (random generator)
            scaffold.Data["text"] = text != "" ? text : "Bacon ipsum dolor amet bresaola meatloaf tail kevin shank tongue boudin doner sausage brisket pork belly shoulder beef ribs. Jowl turducken frankfurter pig capicola alcatra pork short loin chuck meatball. Porchetta pork chop strip steak, alcatra cupim salami rump turkey pork loin brisket sirloin. Cow salami kielbasa pork spare ribs prosciutto t-bone short loin chicken.";
        }
    }
}
