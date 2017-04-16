﻿using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace Websilk.Services
{
    public class Init: Service
    {
        public Init(Core WebsilkCore) : base(WebsilkCore){}

        public WebRequest Website()
        {
            //access this test from http://localhost:7770/api/Init/Website?name=home
            var response = new WebRequest();
            if (S.Server.environment != Server.enumEnvironment.development)
            {
                //exit function if not in development environment
                return response;
            }
            //generate all pages for the default website
            var pages = new string[]
            {
                "home", "login", "access-denied"
            };
            foreach(var page in pages)
            {
                GeneratePage(page);
            }

            //generate documentation as well
            var docs = Documentation();
            
            response.contentType = "text/html";
            response.html = "Generated generic content for all web pages at " + DateTime.Now.ToString("h:mm:ss") + ".";
            return response;
        }

        private void GeneratePage(string name)
        {
            var P = new Page(S);

            //get page info
            P.Url = P.parseUrl("/" + name);
            P.getPageInfoFromUrl();

            var tuple = P.loadPageAndLayout(P.pageId);

            var page = tuple.Item3;
            var panels = tuple.Item4;
            var panelHead = panels[0];
            var panelBody = panels[1];
            var panelFoot = panels[2];

            if (name == "home")
            {
                //generate a home page
                

            }else if (name == "login")
            {
                //generate login page
                P.Url = P.parseUrl("/login");
                P.getPageInfoFromUrl();
                var cLogin = P.loadComponent(new Websilk.Components.Login(), panelBody, panelBody.cells[0], true);
                var posLogin = cLogin.position[4];
                posLogin.padding.top = 50;
                posLogin.width = 400;
                cLogin.position[4] = posLogin;

            }else if (name == "access-denied")
            {
                //generate login page
                P.Url = P.parseUrl("/access-denied");
                P.getPageInfoFromUrl();
                var cLogin = P.loadComponent(new Websilk.Components.Login(), panelBody, panelBody.cells[0], true);
                var posLogin = cLogin.position[4];
                posLogin.padding.top = 50;
                posLogin.width = 400;
                cLogin.position[4] = posLogin;
            }

            //save components from header area
            var area = page.areas[0];
            var block = area.blocks[0];
            block.components = new List<Component>();
            foreach(var cell in panelHead.cells)
            {
                foreach(var comp in cell.components)
                {
                    block.components.Add(comp);
                }
            }
            area.blocks[0] = block;
            page.areas[0] = area;

            //save components from body area
            area = page.areas[1];
            block = area.blocks[0];
            block.components = new List<Component>();
            foreach (var cell in panelBody.cells)
            {
                foreach (var comp in cell.components)
                {
                    block.components.Add(comp);
                }
            }
            area.blocks[0] = block;
            page.areas[1] = area;

            //save components from footer area
            area = page.areas[2];
            block = area.blocks[0];
            block.components = new List<Component>();
            foreach (var cell in panelFoot.cells)
            {
                foreach (var comp in cell.components)
                {
                    block.components.Add(comp);
                }
            }
            area.blocks[0] = block;
            page.areas[2] = area;
            
            page.pageId = P.pageId;

            //save page to file
            S.Util.Serializer.SaveToFile(page, S.Server.MapPath("/Content/websites/" + P.websiteId + "/pages/" + P.pageId + "/page.json"), Newtonsoft.Json.Formatting.None);
        }

        public WebRequest Documentation()
        {
            var response = new WebRequest();
            if (S.Server.environment != Server.enumEnvironment.development)
            {
                //exit function if not in development environment
                return response;
            }

            var common_words = new List<string>();
            common_words.AddRange(new string[]
            {
                "a", "aber", "able", "about", "above", "according", "accordingly", "across", "actually", "after", "afterwards", "again",
                "against", "al", "all", "allow", "allows", "almost", "alone", "along", "alors", "already", "als", "also", "although",
                "always", "am", "am", "among", "amongst", "an", "an", "and", "another", "any", "anybody", "anyhow", "anyone", "anything",
                "anyway", "anyways", "anywhere", "apart", "appear", "appreciate", "appropriate", "ar", "are", "around", "arrayvar", "as",
                "aside", "ask", "asking", "associated", "at", "au", "auch", "aucuns", "auf", "aus", "aussi", "autre", "aux", "available",
                "avant", "avec", "avoir", "away", "awfully", "b", "be", "became", "because", "become", "becomes", "becoming", "been",
                "before", "beforehand", "behind", "bei", "being", "believe", "below", "beside", "besides", "best", "better", "between",
                "beyond", "bin", "bis", "bist", "bon", "both", "brief", "but", "by", "c", "came", "can", "cannot", "cant", "car", "cause",
                "causes", "ce", "cela", "certain", "certainly", "ces", "ceux", "changes", "chaque", "ci", "clearly", "co", "com", "come",
                "comes", "comme", "comment", "con", "concerning", "consequently", "consider", "considering", "contain", "containing",
                "contains", "coogle", "corresponding", "could", "course", "currently", "d", "da", "dadurch", "daher", "dans", "darum",
                "das", "dass", "daß", "de", "dedans", "definitely", "dehors", "dein", "deine", "dem", "den", "depuis", "der", "des",
                "des", "described", "deshalb", "despite", "dessen", "deux", "devrait", "did", "die", "dies", "dieser", "dieses",
                "different", "digitize", "digitized", "do", "doch", "does", "doing", "doit", "donc", "done", "dort", "dos", "down",
                "downloaded", "downwards", "droite", "du", "du", "durch", "during", "début", "e", "each", "edu", "eg", "eight", "ein",
                "eine", "einem", "einen", "einer", "eines", "either", "elle", "elles", "else", "elsewhere", "en", "encore", "enough",
                "entirely", "er", "es", "especially", "essai", "est", "et", "et", "etc", "eu", "euer", "eure", "even", "ever", "every",
                "everybody", "everyone", "everything", "everywhere", "ex", "exactly", "example", "except", "f", "fait", "faites", "far",
                "few", "fifth", "first", "five", "fois", "followed", "following", "follows", "font", "for", "force", "former", "formerly",
                "forth", "four", "fr", "from", "further", "furthermore", "für", "g", "get", "gets", "getting", "given", "gives", "go",
                "goes", "going", "gone", "google", "got", "gotten", "greetings", "h", "had", "happens", "hardly", "has", "hatte", "hatten",
                "hattest", "hattet", "haut", "have", "having", "he", "heinonline", "hello", "help", "hence", "her", "here", "hereafter",
                "hereby", "herein", "hereupon", "hers", "herself", "hi", "hier", "him", "himself", "hinter", "his", "hither", "hopefully",
                "hors", "how", "howbeit", "however", "httpwww", "i", "ich", "ici", "ie", "if", "ignored", "ih", "ihe", "ihr", "ihre", "ii",
                "iii", "il", "ill", "ils", "im", "immediate", "in", "inasmuch", "inc", "indeed", "indicate", "indicated", "indicates",
                "ing", "inner", "insofar", "instead", "into", "inward", "is", "ist", "it", "its", "itself", "j", "ja", "je", "jede",
                "jedem", "jeden", "jeder", "jedes", "jener", "jenes", "jetzt", "jstor", "just", "juste", "k", "kann", "kannst", "keep",
                "keeps", "kept", "know", "known", "knows", "können", "könnt", "l", "la", "last", "lately", "later", "latter", "latterly",
                "ld", "le", "least", "les", "less", "lest", "let", "leur", "leurs", "li", "like", "liked", "likely", "little", "ll", "lo",
                "look", "looking", "looks", "ltd", "lui", "là", "m", "ma", "machen", "mainly", "maintenant", "mais", "many", "may", "maybe",
                "me", "mean", "meanwhile", "mein", "meine", "merely", "mes", "might", "mine", "mit", "moins", "mon", "more", "moreover",
                "most", "mostly", "mot", "much", "musst", "must", "muß", "mußt", "my", "myself", "même", "müssen", "müßt", "n", "nach",
                "nachdem", "name", "namely", "nd", "ne", "near", "nearly", "necessary", "need", "needs", "nein", "neither", "never",
                "nevertheless", "new", "next", "ni", "nicht", "nine", "no", "nobody", "nommés", "non", "none", "noone", "nor", "normally",
                "not", "nothing", "notre", "nous", "nouveaux", "novel", "now", "nowhere", "nt", "nun", "o", "obviously", "oder", "of",
                "off", "often", "oh", "ok", "okay", "old", "on", "once", "one", "ones", "only", "onto", "or", "ot", "other", "others",
                "otherwise", "ou", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "own", "où", "p", "par",
                "parce", "parole", "particular", "particularly", "pas", "per", "perhaps", "personnes", "peu", "peut", "pièce", "placed",
                "please", "plupart", "plus", "possible", "pour", "pourquoi", "pp", "pr", "press", "presumably", "probably", "provides",
                "q", "qu", "quand", "que", "que", "quel", "quelle", "quelles", "quels", "qui", "quite", "qv", "r", "rather", "rd", "re",
                "really", "reasonably", "regarding", "regardless", "regards", "relatively", "respectively", "ri", "right", "s", "sa",
                "said", "same", "sans", "saw", "say", "saying", "says", "se", "second", "secondly", "see", "seeing", "seem", "seemed",
                "seeming", "seems", "seen", "seid", "sein", "seine", "self", "selves", "sensible", "sent", "serious", "seriously", "ses",
                "seulement", "seven", "several", "shall", "she", "should", "shtml", "si", "sich", "sie", "sien", "since", "sind", "six",
                "so", "soll", "sollen", "sollst", "sollt", "some", "somebody", "somehow", "someone", "something", "sometime", "sometimes",
                "somewhat", "somewhere", "son", "sonst", "sont", "soon", "sorry", "sous", "soweit", "sowie", "soyez", "specified", "specify",
                "specifying", "still", "sub", "such", "sujet", "sup", "sur", "sure", "t", "ta", "take", "taken", "tandis", "tbe", "tell",
                "tellement", "tels", "tends", "tes", "th", "than", "thank", "thanks", "thanx", "that", "thats", "thc", "the", "their",
                "theirs", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "theres",
                "thereupon", "these", "they", "think", "third", "this", "tho", "thorough", "thoroughly", "those", "though", "three",
                "through", "throughout", "thru", "thus", "ti", "til", "tile", "tion", "tl", "to", "together", "ton", "too", "took",
                "tous", "tout", "toward", "towards", "tried", "tries", "trop", "truly", "try", "trying", "très", "tt", "tu", "twice",
                "two", "u", "un", "und", "under", "une", "unfortunately", "university", "unless", "unlikely", "unser", "unsere", "unter",
                "until", "unto", "up", "upon", "url", "us", "use", "used", "useful", "uses", "using", "usually", "uucp", "v", "valeur",
                "value", "var", "various", "very", "via", "viz", "voie", "voient", "vol", "vom", "von", "vont", "vor", "votre", "vous",
                "vs", "vu", "w", "wann", "want", "wants", "warum", "was", "was", "way", "we", "weiter", "weitere", "welcome", "well",
                "wenn", "went", "wer", "werde", "werden", "werdet", "were", "weshalb", "what", "whatever", "when", "whence", "whenever",
                "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither",
                "who", "whoever", "whole", "whom", "whose", "why", "wie", "wieder", "wieso", "will", "willing", "wir", "wird", "wirst",
                "wish", "with", "within", "without", "wo", "woher", "wohin", "wonder", "would", "would", "x", "y", "yes", "yet", "you",
                "your", "yours", "yourself", "yourselves", "z", "zero", "zu", "zum", "zur", "ça", "étaient", "état", "étions", "été",
                "être", "über"
            });
            var path = "";
            var file = "";
            var totalwords = 0;
            var totalfiles = 0;
            var page_words = new List<string>();
            var parms = new List<SqlParameter>();
            var reader = new SqlReader(S, "EXEC GetDocumentation");
            while (reader.Read())
            {
                path = S.Server.MapPath("/Support/" + reader.Get("path") + ".html");
                if (File.Exists(path))
                {
                    file = File.ReadAllText(path);

                    if(file != "")
                    {
                        //remove all common words from file
                        file = Regex.Replace(Regex.Replace(file, "<.*?>", String.Empty).Replace("\n","").Replace("\r",""), @"\s+", " ").ToLower().Trim();
                        page_words = new List<string>();
                        page_words.AddRange(file.Split(' '));
                        file = string.Join(" ", page_words.Except(common_words).Distinct().ToArray());

                        //save keywords to database
                        parms = new List<SqlParameter>()
                        {
                            new SqlParameter("@path", reader.Get("path")),
                            new SqlParameter("@keywords", file)
                        };
                        S.Sql.ExecuteNonQuery("EXEC UpdateDocumentation @path=@path, @keywords=@keywords", parms);
                        totalwords += page_words.Count();
                        totalfiles++;
                    }
                }

            }
            response.html = "Indexed " + totalwords.ToString() + " words in " + totalfiles.ToString() + " html files located in /Support/";
            return response;
        }
    }
}
