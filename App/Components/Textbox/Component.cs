using System;

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
                return "/Components/Textbox/";
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
            scaffold = new Scaffold(S, "/Components/Textbox/component.html");

            if (text == "")
            {
                //Lorem Ipsum taken from "the most beautiful book quotes" google search
                var rnd = new Random();
                var lorem = new string[]
                {
                    "In our village, folks say God crumbles up the old moon into stars.", //Alexander Solzhenitsyn, One Day in the Life of Ivan Denisovich
                    "She wasn’t doing a thing that I could see, except standing there leaning on the balcony railing, holding the universe together.", //J. D. Salinger, “A Girl I Knew”
                    "Beauty is an enormous, unmerited gift given randomly, stupidly.", //Khaled Hosseini, And the Mountains Echoed
                    "Sometimes I can feel my bones straining under the weight of all the lives I’m not living.", //Jonathan Safran Foer, Extremely Loud and Incredibly Close
                    "A dream, all a dream, that ends in nothing, and leaves the sleeper where he lay down, but I wish you to know that you inspired it.", //Charles Dickens, A Tale of Two Cities
                    "If equal affection cannot be, let the more loving one be me.",//W. H. Auden, “The More Loving One”
                    "And now that you don’t have to be perfect, you can be good.",//John Steinbeck, East of Eden
                    "It might be that to surrender to happiness was to accept defeat, but it was a defeat better than many victories.",//W. Somerset Maugham, Of Human Bondage
                    "Once upon a time there was a boy who loved a girl, and her laughter was a question he wanted to spend his whole life answering.",//Nicole Krauss, The History of Love
                    "In spite of everything, I still believe people are really good at heart.",//Anne Frank, The Diary of Anne Frank
                    "The pieces I am, she gather them and gave them back to me in all the right order.",//Toni Morrison, Beloved
                    "She was becoming herself and daily casting aside that fictitious self which we assume like a garment with which to appear before the world.",//Kate Chopin, “The Awakening”
                    "We cross our bridges as we come to them and burn them behind us, with nothing to show for our progress except a memory of the smell of smoke, and the presumption that once our eyes watered.",//Tom Stoppard, Rosencratz and Guildenstern Are Dead
                    "There are darknesses in life and there are lights, and you are one of the lights, the light of all lights.", //Bram Stroker, Dracula
                    "I have spread my dreams under your feet; / Tread softly because you tread on my dreams", //W. B. Yeats, “Aedh Wishes for the Cloths of Heaven”
                    "It frightened him to think what must have gone to the making of her eyes.", //Edith Wharton, The Age of Innocence
                    "I wondered if that was how forgiveness budded; not with the fanfare of epiphany, but with pain gathering its things, packing up, and slipping away unannounced in the middle of the night.", //Khaled Hosseini, The Kite Runner
                    "So we beat on, boats against the current, borne back ceaselessly into the past.", //F. Scott Fitzgerald, The Great Gatsby
                    "It does not do well to dwell on dreams and forget to live, remember that.", //J.K. Rowling, Harry Potter and the Sorcerer’s Stone
                    "One must be careful of books, and what is inside them, for words have the power to change us.", //Cassandra Clare, The Infernal Devices
                    "Maybe ever’body in the whole damn world is scared of each other.", //John Steinbeck, Of Mice And Men
                    "Life is to be lived, not controlled; and humanity is won by continuing to play in face of certain defeat.", //Ralph Ellison, Invisible Man
                    "The only people for me are the mad ones, the ones who are mad to live, mad to talk, mad to be saved, desirous of everything at the same time, the ones who never yawn or say a commonplace thing, but burn, burn, burn like fabulous yellow roman candles exploding like spiders across the stars.", //Jack Kerouac, On The Road
                    "It was a bright cold day in April, and the clocks were striking thirteen.", //George Orwell, 1984
                    "We were the people who were not in the papers. We lived in the blank white spaces at the edges of print. It gave us more freedom. We lived in the gaps between the stories.", //Margaret Atwood, The Handmaid's Tale
                    "It sounds plausible enough tonight, but wait until tomorrow. Wait for the common sense of the morning.", //H.G. Wells, The Time Machine
                    "It's much better to do good in a way that no one knows anything about it.", //Leo Tolstoy, Anna Karenina
                    "Life appears to me too short to be spent in nursing animosity or registering wrongs.", //Charlotte Brontë, Jane Eyre
                    "You forget what you want to remember, and you remember what you want to forget.", //Cormac McCarthy, The Road
                    "There is an idea of a Patrick Bateman, some kind of abstraction, but there is no real me, only an entity, something illusory, and though I can hide my cold gaze and you can shake my hand and feel flesh gripping yours and maybe you can even sense our lifestyles are probably comparable: I simply am not there.", //Bret Easton Ellis, American Psycho
                    "Finally, from so little sleeping and so much reading, his brain dried up and he went completely out of his mind.", //Miguel de Cervantes Saavedra, Don Quixote
                    "We cast a shadow on something wherever we stand, and it is no good moving from place to place to save things; because the shadow always follows. Choose a place where you won't do harm - yes, choose a place where you won't do very much harm, and stand in it for all you are worth, facing the sunshine.", //E.M. Forster, A Room With A View
                    "History, Stephen said, is a nightmare from which I am trying to awake.", //James Joyce, Ulysses
                    "It is a great misfortune to be alone, my friends; and it must be believed that solitude can quickly destroy reason.", //Jules Verne, The Mysterious Island
                    "And meanwhile time goes about its immemorial work of making everyone look and feel like shit.", //Martin Amis, London Fields
                    "No man, for any considerable period, can wear one face to himself and another to the multitude, without finally getting bewildered as to which may be the true.", //Nathaniel Hawthorne, The Scarlet Letter
                    "Nowadays people know the price of everything and the value of nothing.", //Oscar Wilde, The Picture Of Dorian Gray
                    "We can experience nothing but the present moment, live in no other second of time, and to understand this is as close as we can get to eternal life.", //P.D. James, The Children Of Men
                    "No one forgets the truth; they just get better at lying.", //Richard Yates, Revolutionary Road
                    "She had waited all her life for something, and it had killed her when it found her.", //Zora Neale Hurston, Their Eyes Were Watching God
                    "Nothing is so painful to the human mind as a great and sudden change.", //Mary Shelley, Frankenstein
                    "It is sometimes an appropriate response to reality to go insane.", //Philip K. Dick, Valis
                    "I know. I was there. I saw the great void in your soul, and you saw mine.", //Sebastian Faulks, Birdsong
                    "She says nothing at all, but simply stares upward into the dark sky and watches, with sad eyes, the slow dance of the infinite stars.", //Neil Gaiman, Stardust
                    "Why can't people have what they want? The things were all there to content everybody; yet everybody has the wrong thing.", //Ford Madox Ford, The Good Soldier
                    "We mortals, men and women, devour many a disappointment between breakfast and dinner-time; keep back the tears and look a little pale about the lips, and in answer to inquiries say, \"Oh, nothing!\" Pride helps; and pride is not a bad thing when it only urges us to hide our hurts— not to hurt others.", //George Eliot, MIddlemarch
                    "Anyone who ever gave you confidence, you owe them a lot.", //Truman Capote, breakfast at tiffany's
                    "Clocks slay time... time is dead as long as it is being clicked off by little wheels; only when the clock stops does time come to life.", //William Faulkner, The Sound And The Fury
                    "None of those other things makes a difference. Love is the strongest thing in the world, you know. Nothing can touch it. Nothing comes close. If we love each other we're safe from it all. Love is the biggest thing there is.", //David Guterson, Snow Falling on Cedars
                    "The only lies for which we are truly punished are those we tell ourselves." //V.S. Naipaul, In a Free State


                };
                var i = rnd.Next(0, lorem.Length - 1);
                text = lorem[i];
            }
            
            scaffold.Data["text"] = text;

            if (Page.isEditable)
            {
                menuTypes = new string[] { "all", "!props", "texteditor" };
                AddHtmlToEditor("texteditor", S.Server.LoadFileFromCache("/components/textbox/texteditor.html"), new Func<Component, bool>(
                    (c) => {
                        //text component already exists on the page, so don't add Html
                        return false;
                    }
                ));
                AddJavascriptFile("texteditor", "js/components/textbox/texteditor.js");
            }
        }

        public override void Save(string key, object data)
        {
            switch (key)
            {
                case "text":
                    text = (string)data;
                    break;
            }
        }
    }
}
