import json
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = BASE_DIR / "class_5_cbse_all_subjects.json"

SYLLABUS = {
    "EVS": [
        ("Super Senses", ["Animal senses", "Sense of smell", "Sense of sight", "Animal sounds and warnings"]),
        ("A Snake Charmer's Story", ["Snake charmers", "Snakes and safety", "Animal protection", "Traditional livelihoods"]),
        ("From Tasting to Digesting", ["Taste and tongue", "Digestion basics", "Food habits", "Healthy eating"]),
        ("Mangoes Round the Year", ["Food spoilage", "Preserving food", "Mango products", "Safe food storage"]),
        ("Seeds and Seeds", ["Types of seeds", "Seed dispersal", "Germination", "Growing plants"]),
        ("Every Drop Counts", ["Sources of water", "Water scarcity", "Saving water", "Traditional water systems"]),
        ("Experiments with Water", ["Floating and sinking", "Soluble and insoluble", "Evaporation", "Water experiments"]),
        ("A Treat for Mosquitoes", ["Mosquito breeding", "Malaria", "Prevention of diseases", "Clean surroundings"]),
        ("Up You Go!", ["Mountain climbing", "Teamwork", "Adventure safety", "Life in camps"]),
        ("Walls Tell Stories", ["Historical monuments", "Old buildings", "Paintings and stories", "Protecting heritage"]),
        ("Sunita in Space", ["Life in space", "Gravity", "Earth from space", "Astronauts"]),
        ("What If It Finishes...?", ["Fuels", "Petrol and diesel", "Saving fuel", "Public transport"]),
        ("A Shelter So High!", ["Houses in mountains", "Climate and shelter", "Life in high places", "Different homes"]),
        ("When the Earth Shook!", ["Earthquakes", "Disaster safety", "Helping people", "Rebuilding homes"]),
        ("Blow Hot, Blow Cold", ["Breathing", "Hot and cold air", "Air in daily life", "Simple air experiments"]),
        ("Who Will Do This Work?", ["Cleanliness work", "Dignity of labour", "Equal respect", "Community helpers"]),
        ("Across the Wall", ["Games and gender", "Team games", "Practice and confidence", "Equal opportunities"]),
        ("No Place for Us?", ["Migration", "Changing homes", "City life", "Helping communities"]),
        ("A Seed Tells a Farmer's Story", ["Farming changes", "Seeds and crops", "Irrigation", "Farmers' lives"]),
        ("Whose Forests?", ["Forest life", "Tribal communities", "Forest resources", "Protecting forests"]),
        ("Like Father, Like Daughter", ["Family traits", "Heredity basics", "Similarities and differences", "Family health"]),
        ("On the Move Again", ["Seasonal migration", "Farm work", "School and migration", "Life of workers"]),
    ],
    "Maths": [
        ("The Fish Tale", ["Large numbers", "Estimation", "Speed and distance", "Money calculations"]),
        ("Shapes and Angles", ["Types of angles", "Measuring angles", "Shapes around us", "Angle activities"]),
        ("How Many Squares?", ["Counting squares", "Area basics", "Grid patterns", "Shape puzzles"]),
        ("Parts and Wholes", ["Fractions", "Equal parts", "Fraction of a collection", "Comparing fractions"]),
        ("Does it Look the Same?", ["Symmetry", "Mirror images", "Rotating shapes", "Patterns"]),
        ("Be My Multiple, I'll be Your Factor", ["Multiples", "Factors", "Common factors", "Divisibility"]),
        ("Can You See the Pattern?", ["Number patterns", "Shape patterns", "Growing patterns", "Pattern rules"]),
        ("Mapping Your Way", ["Reading maps", "Directions", "Scale", "Routes"]),
        ("Boxes and Sketches", ["3D shapes", "Nets of boxes", "Top and side views", "Sketching solids"]),
        ("Tenths and Hundredths", ["Decimals", "Tenths", "Hundredths", "Money and decimals"]),
        ("Area and its Boundary", ["Area", "Perimeter", "Comparing boundaries", "Measuring shapes"]),
        ("Smart Charts", ["Tables", "Bar charts", "Reading data", "Making charts"]),
        ("Ways to Multiply and Divide", ["Multiplication methods", "Division methods", "Word problems", "Checking answers"]),
        ("How Big? How Heavy?", ["Volume", "Weight", "Capacity", "Measuring and comparing"]),
    ],
    "English": [
        ("Ice-cream Man and Wonderful Waste!", ["Ice-cream Man poem", "Wonderful Waste story", "New words", "Reading and questions"]),
        ("Teamwork and Flying Together", ["Teamwork poem", "Flying Together story", "Cooperation", "Reading and questions"]),
        ("My Shadow and Robinson Crusoe", ["My Shadow poem", "Robinson Crusoe story", "Observation", "Reading and questions"]),
        ("Crying and My Elder Brother", ["Crying poem", "My Elder Brother story", "Feelings", "Reading and questions"]),
        ("The Lazy Frog and Rip Van Winkle", ["The Lazy Frog poem", "Rip Van Winkle story", "Character traits", "Reading and questions"]),
        ("Class Discussion and The Talkative Barber", ["Class Discussion poem", "The Talkative Barber story", "Speaking and listening", "Reading and questions"]),
        ("Topsy-turvy Land and Gulliver's Travels", ["Topsy-turvy Land poem", "Gulliver's Travels story", "Imagination", "Reading and questions"]),
        ("Nobody's Friend and The Little Bully", ["Nobody's Friend poem", "The Little Bully story", "Friendship", "Reading and questions"]),
        ("Sing a Song of People and Around the World", ["Sing a Song of People poem", "Around the World story", "People and places", "Reading and questions"]),
        ("Malu Bhalu and Who Will be Ningthou?", ["Malu Bhalu poem", "Who Will be Ningthou story", "Courage and kindness", "Reading and questions"]),
    ],
    "Hindi": [
        ("Rakh ki Rassi", ["Lok katha", "Mukhya vichar", "Naye shabd", "Prashn uttar"]),
        ("Fasalon ke Tyohar", ["Tyohar aur fasal", "Bharat ke parv", "Naye shabd", "Prashn uttar"]),
        ("Khilonewala", ["Kavita path", "Bhavarth", "Tukbandi", "Prashn uttar"]),
        ("Nanha Fankar", ["Kahani path", "Kala aur abhyas", "Naye shabd", "Prashn uttar"]),
        ("Jahan Chah Wahan Rah", ["Prerna", "Mehnat aur safalta", "Naye shabd", "Prashn uttar"]),
        ("Chitthi ka Safar", ["Patra vyavahar", "Dak pranali", "Naye shabd", "Prashn uttar"]),
        ("Dakiye ki Kahani, Kanwarsingh ki Jubani", ["Bhentvarta", "Dakiya ka kaam", "Naye shabd", "Prashn uttar"]),
        ("Ve Din Bhi Kya Din The", ["Vigyan katha", "Kalpana", "Naye shabd", "Prashn uttar"]),
        ("Ek Maa ki Bebasi", ["Kavita path", "Samvedna", "Bhavarth", "Prashn uttar"]),
        ("Ek Din ki Badshahat", ["Kahani path", "Parivar", "Naye shabd", "Prashn uttar"]),
        ("Chawal ki Rotiyan", ["Natak path", "Patra aur samvad", "Naye shabd", "Prashn uttar"]),
        ("Guru aur Chela", ["Kavita path", "Hasya", "Bhavarth", "Prashn uttar"]),
        ("Swami ki Dadi", ["Kahani path", "Patra parichay", "Naye shabd", "Prashn uttar"]),
        ("Bagh Aaya Us Raat", ["Kavita path", "Van jeevan", "Bhavarth", "Prashn uttar"]),
        ("Bishan ki Dileri", ["Kahani path", "Sahas", "Naye shabd", "Prashn uttar"]),
        ("Pani Re Pani", ["Pani ka mahatva", "Jal sanrakshan", "Naye shabd", "Prashn uttar"]),
        ("Chhoti-si Hamari Nadi", ["Kavita path", "Nadi aur prakriti", "Bhavarth", "Prashn uttar"]),
        ("Chunauti Himalaya ki", ["Yatra varnan", "Himalaya", "Naye shabd", "Prashn uttar"]),
    ],
}

SUBJECT_LABELS = {
    "EVS": "NCERT Looking Around-style",
    "Maths": "NCERT Math-Magic-style",
    "English": "NCERT Marigold-style",
    "Hindi": "NCERT Rimjhim-style",
}

KEYWORDS = {
    "EVS": [("Observation", "Looking carefully to understand the world."), ("Environment", "The natural and social world around us."), ("Community", "People living or working together.")],
    "Maths": [("Number", "A value used for counting or measuring."), ("Method", "A step-by-step way to solve a problem."), ("Pattern", "Something that repeats or follows a rule.")],
    "English": [("Text", "A poem, story, or passage we read."), ("Meaning", "The idea a word or sentence gives."), ("Expression", "A way of sharing thoughts and feelings.")],
    "Hindi": [("Path", "Kavita ya kahani ko dhyan se padhna."), ("Arth", "Shabd ya vaakya ka matlab."), ("Abhyas", "Seekhne ke liye baar-baar prayas karna.")],
}

A_SNAKE_CHARMERS_STORY_OVERRIDES = {
    "Snake charmers": {
        "studyContent": {
            "title": "Snake charmers",
            "intro": "Snake charmers are people who traditionally caught snakes, handled them, and played a wind instrument called a been during shows. In the NCERT chapter, Aryanath tells us about the Kalbeliya community, where this skill was passed from elders to children.",
            "ncertBasedExplanation": "The chapter explains that some families, like the Kalbeliyas, knew a lot about snakes. Aryanath's grandfather could identify and catch poisonous snakes. Earlier, snake charmers were called when snakes entered houses or fields. They also performed with snakes, but today keeping or using wild animals for entertainment is not allowed because animals must be protected.",
            "aiSimplifiedExplanation": "A snake charmer was not just a performer. He was also someone who knew where snakes live, how they move, which snakes are dangerous, and how to handle them carefully. But snakes are wild animals, so they should not be kept in baskets or made to perform for people.",
            "stepByStep": [
                "A snake charmer usually belonged to a community that learned snake-handling from older family members.",
                "The been is a musical instrument used by snake charmers, but the snake does not dance because it enjoys music.",
                "A snake follows the movement of the been and the person because snakes sense movement and vibrations.",
                "Snake charmers had knowledge about poisonous and non-poisonous snakes.",
                "Today, wild animals should not be captured or used for entertainment.",
                "The useful knowledge of snake charmers can be respected, but snakes must be allowed to live safely in nature."
            ],
            "keywords": [
                {"term": "Snake charmer", "meaning": "A person who traditionally handled snakes and played the been during shows."},
                {"term": "Kalbeliya", "meaning": "A community known for traditional knowledge of snakes and snake charming."},
                {"term": "Been", "meaning": "A wind instrument played by snake charmers."},
                {"term": "Tradition", "meaning": "A skill, custom, or practice passed from older people to younger people."}
            ],
            "realLifeExample": "If a snake enters a village house, people should not try to catch it themselves. A trained rescue person can safely take the snake away and release it in a suitable natural place.",
            "diagram": {
                "type": "text",
                "title": "Traditional Knowledge and Modern Care",
                "content": "Old skill of snake charmers -> Knowledge about snakes -> Respect the community -> Do not harm or capture snakes -> Call trained rescuers"
            },
            "summary": [
                "Snake charmers traditionally knew how to identify and handle snakes.",
                "The been is linked with snake charming, but snakes react mainly to movement and vibrations.",
                "The Kalbeliya community is connected with this traditional skill.",
                "Today, snakes should not be used for entertainment.",
                "We should respect traditional knowledge and protect wild animals."
            ]
        },
        "revisionContent": {
            "quickMeaning": "Snake charmers were traditional snake handlers who played the been and knew a lot about snakes.",
            "keyPoints": [
                "Aryanath belongs to the Kalbeliya community.",
                "The been is played during snake charming.",
                "Snakes do not dance to music; they react to movement and vibrations.",
                "Using wild animals for entertainment is not right today.",
                "Traditional knowledge should be respected, but animals must be protected."
            ],
            "importantTerms": [
                {"term": "Kalbeliya", "meaning": "A community traditionally linked with snake charming."},
                {"term": "Been", "meaning": "Instrument played by snake charmers."},
                {"term": "Wild animal", "meaning": "An animal that naturally lives in forests, fields, rivers, or other natural habitats."}
            ],
            "mustRemember": [
                "Snake charmers had practical knowledge about snakes.",
                "Snakes should not be kept in baskets for shows.",
                "Call trained rescuers if a snake is found near people."
            ],
            "quickFlowchart": "Kalbeliya tradition -> Snake knowledge -> Been performance -> Modern rule: protect snakes -> Safe rescue",
            "examPoints": [
                "Who are Kalbeliyas?",
                "What is a been?",
                "Why should snakes not be used for entertainment?",
                "How can traditional knowledge be useful today?"
            ]
        }
    },
    "Snakes and safety": {
        "studyContent": {
            "title": "Snakes and safety",
            "intro": "Snakes are reptiles that live in fields, forests, holes, farms, gardens, and sometimes near houses. Some snakes are poisonous, but many snakes are not poisonous. The most important thing is to stay calm, keep distance, and call an adult or trained rescuer.",
            "ncertBasedExplanation": "The NCERT chapter helps students think about fear of snakes, poisonous snakes, and how snake charmers handled snakes. It also reminds us that snakes do not have visible outer ears like humans. They sense movement and vibrations. This means safety is not about teasing or fighting a snake, but about understanding its behaviour and keeping a safe distance.",
            "aiSimplifiedExplanation": "A snake usually bites only when it feels scared, trapped, stepped on, or attacked. If we see a snake, we should not touch it, throw stones, or try to catch it. We should move away slowly and inform an adult. Snakes are part of nature and help control rats and other small animals.",
            "stepByStep": [
                "If you see a snake, stop and do not go close to it.",
                "Do not touch, tease, chase, or throw stones at the snake.",
                "Move away slowly without sudden movements.",
                "Tell an adult immediately.",
                "Ask adults to call a trained snake rescuer or forest/wildlife helper.",
                "If someone is bitten, keep the person calm and take them to a hospital quickly.",
                "Do not cut the wound, suck the poison, tie a tight cloth, or use home remedies."
            ],
            "keywords": [
                {"term": "Poisonous snake", "meaning": "A snake whose bite can inject venom and make a person seriously ill."},
                {"term": "Venom", "meaning": "Poison made by some animals, including some snakes."},
                {"term": "Vibration", "meaning": "A small movement or shaking that snakes can sense."},
                {"term": "Snake rescuer", "meaning": "A trained person who safely removes and releases snakes."}
            ],
            "realLifeExample": "Imagine you are playing near a garden and see a snake near a wall. The safe action is to stop playing there, move away slowly, tell an adult, and keep others away. Nobody should try to catch it with a stick.",
            "diagram": {
                "type": "text",
                "title": "What to do if you see a snake",
                "content": "See snake -> Stay calm -> Keep distance -> Tell adult -> Call trained rescuer -> Snake released safely"
            },
            "summary": [
                "Not all snakes are poisonous, but all snakes should be treated carefully.",
                "Snakes usually bite when they feel danger.",
                "Never touch, tease, or try to catch a snake.",
                "Snake bite needs quick medical help.",
                "Snakes are useful because they help control rats and keep balance in nature."
            ]
        },
        "revisionContent": {
            "quickMeaning": "Snake safety means knowing how to behave if we see a snake so people and the snake both stay safe.",
            "keyPoints": [
                "Do not go near a snake.",
                "Do not tease or throw stones at it.",
                "Move away slowly and inform an adult.",
                "Call a trained rescuer.",
                "Take snake bite cases to hospital quickly."
            ],
            "importantTerms": [
                {"term": "Venom", "meaning": "Poison injected by some snake bites."},
                {"term": "Vibration", "meaning": "Movement or shaking sensed by snakes."},
                {"term": "Rescuer", "meaning": "A trained person who safely handles snakes."}
            ],
            "mustRemember": [
                "All snakes are not poisonous.",
                "Never try to catch a snake yourself.",
                "Do not use home remedies for snake bite.",
                "Snakes are important for nature."
            ],
            "quickFlowchart": "See snake -> Keep distance -> Inform adult -> Call rescuer -> Hospital if bitten",
            "examPoints": [
                "What should you do if you see a snake?",
                "Why should we not tease snakes?",
                "Are all snakes poisonous?",
                "Why are snakes useful in nature?"
            ]
        }
    },
    "Animal protection": {
        "studyContent": {
            "title": "Animal protection",
            "intro": "Animal protection means keeping animals safe from cruelty, unnecessary capture, injury, and misuse. The chapter uses snakes and snake charmers to help us understand that animals should not be used only for human entertainment.",
            "ncertBasedExplanation": "In the chapter, students discuss animals used in shows, circuses, parks, and roadside performances. This leads to an important EVS idea: animals are living beings. They feel fear, pain, hunger, and stress. Wild animals such as snakes belong in their natural habitats, not in baskets, cages, or shows.",
            "aiSimplifiedExplanation": "Animals are not toys. A snake in a basket may look like part of a show, but it is a living animal that needs space, food, safety, and freedom. Protecting animals means letting them live naturally and helping them when they are in danger.",
            "stepByStep": [
                "Understand that animals have needs just like humans need food, water, and safety.",
                "Do not tease, hurt, or force animals to perform.",
                "Do not keep wild animals as pets.",
                "If an animal is injured or trapped, inform adults or animal rescue workers.",
                "Keep surroundings clean so animals do not get hurt by plastic, glass, or waste.",
                "Learn to observe animals from a safe distance without disturbing them."
            ],
            "keywords": [
                {"term": "Animal protection", "meaning": "Keeping animals safe from harm and cruelty."},
                {"term": "Wildlife", "meaning": "Animals and plants that live naturally in the wild."},
                {"term": "Cruelty", "meaning": "Hurting or treating a living being badly."},
                {"term": "Habitat", "meaning": "The natural home of an animal or plant."}
            ],
            "realLifeExample": "If children see someone teasing a street dog or throwing stones at birds, they should not join. They should tell an adult and learn to treat animals kindly.",
            "diagram": {
                "type": "text",
                "title": "How to protect animals",
                "content": "Kindness -> Safe distance -> No teasing -> No capture -> Call rescue when needed -> Protect habitats"
            },
            "summary": [
                "Animals are living beings and should be treated with kindness.",
                "Wild animals should live in their natural habitats.",
                "Using animals for entertainment can harm them.",
                "We can protect animals by not teasing them and by calling rescuers when needed.",
                "Protecting animals also protects nature."
            ]
        },
        "revisionContent": {
            "quickMeaning": "Animal protection means keeping animals safe, free from cruelty, and close to their natural way of living.",
            "keyPoints": [
                "Animals feel pain, fear, and hunger.",
                "Wild animals should not be kept for shows.",
                "Do not tease or hurt animals.",
                "Call rescue workers for trapped or injured animals.",
                "Protecting animals helps nature."
            ],
            "importantTerms": [
                {"term": "Habitat", "meaning": "Natural home of an animal."},
                {"term": "Cruelty", "meaning": "Bad or harmful treatment."},
                {"term": "Wildlife", "meaning": "Animals living naturally in the wild."}
            ],
            "mustRemember": [
                "Animals are not objects for entertainment.",
                "Kindness towards animals is part of responsible citizenship.",
                "Wild animals should not be captured."
            ],
            "quickFlowchart": "Animal has needs -> Avoid cruelty -> Protect habitat -> Call rescue -> Nature stays balanced",
            "examPoints": [
                "What is animal protection?",
                "Why should wild animals not be used for entertainment?",
                "How can children help protect animals?",
                "What is a habitat?"
            ]
        }
    },
    "Traditional livelihoods": {
        "studyContent": {
            "title": "Traditional livelihoods",
            "intro": "Traditional livelihoods are ways of earning a living that are passed from one generation to the next. In this chapter, the Kalbeliya community's work with snakes is shown as a traditional livelihood connected with skill, music, knowledge, and culture.",
            "ncertBasedExplanation": "Aryanath learns the been from his family. His grandfather knew how to catch poisonous snakes and told stories about this work. The chapter shows that some communities have special skills learned through family tradition. But when laws and society change to protect animals, people may need new ways to use their skills and earn a living.",
            "aiSimplifiedExplanation": "A livelihood means work that helps a family earn money. A traditional livelihood is family work learned from elders, like pottery, weaving, farming, folk music, or snake charming. We should respect people's skills, but we should also make sure animals are not harmed.",
            "stepByStep": [
                "A community develops a skill over many years.",
                "Elders teach children through practice and stories.",
                "The skill becomes part of the community's identity and culture.",
                "Sometimes the old work becomes difficult because laws, cities, or people's needs change.",
                "The community can use its knowledge in safer and newer ways.",
                "For example, snake knowledge can help in awareness, rescue support, music, dance, or cultural education without harming snakes."
            ],
            "keywords": [
                {"term": "Livelihood", "meaning": "Work done to earn money or meet family needs."},
                {"term": "Traditional livelihood", "meaning": "Work passed from elders to younger people in a family or community."},
                {"term": "Community", "meaning": "A group of people with shared life, work, or culture."},
                {"term": "Culture", "meaning": "The customs, art, music, food, dress, and practices of a group."}
            ],
            "realLifeExample": "A potter's child may learn to make clay pots from parents. In the same way, Aryanath learned the been from his family. Both are examples of skills passed through generations.",
            "diagram": {
                "type": "text",
                "title": "Traditional livelihood flow",
                "content": "Elders' skill -> Children learn -> Family work -> Culture continues -> New safe ways of earning"
            },
            "summary": [
                "Traditional livelihoods are family or community occupations passed through generations.",
                "The Kalbeliya community is shown as having traditional knowledge of snakes and music.",
                "A livelihood can be linked with culture and identity.",
                "When animal protection rules change, people need safer alternatives.",
                "We should respect communities while also protecting animals."
            ]
        },
        "revisionContent": {
            "quickMeaning": "Traditional livelihood is work learned from elders and followed by a family or community for many years.",
            "keyPoints": [
                "Aryanath learned the been from his family.",
                "Kalbeliyas are linked with snake knowledge and music.",
                "Traditional work can be part of culture.",
                "Animal protection may change old occupations.",
                "Skills can be used in new and safer ways."
            ],
            "importantTerms": [
                {"term": "Livelihood", "meaning": "Work done to earn a living."},
                {"term": "Tradition", "meaning": "A practice passed from one generation to another."},
                {"term": "Culture", "meaning": "Shared customs and practices of a group."}
            ],
            "mustRemember": [
                "Respect traditional skills.",
                "Do not support work that harms animals.",
                "Old knowledge can be used in modern, safe ways."
            ],
            "quickFlowchart": "Family skill -> Practice -> Livelihood -> Social change -> New safe work",
            "examPoints": [
                "What is a traditional livelihood?",
                "How did Aryanath learn to play the been?",
                "Why may traditional work change over time?",
                "Give one example of a traditional livelihood."
            ]
        }
    }
}


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")


def content_id(subject: str, chapter: str, topic: str) -> str:
    return slug(f"class_5_CBSE_{subject}_{chapter}_{topic}")


def term_list(subject: str, topic: str):
    return [
        {"term": topic, "meaning": topic_meaning(subject, topic)},
        {"term": KEYWORDS[subject][0][0], "meaning": KEYWORDS[subject][0][1]},
        {"term": KEYWORDS[subject][1][0], "meaning": KEYWORDS[subject][1][1]},
    ]


def topic_meaning(subject: str, topic: str) -> str:
    if subject == "EVS":
        return f"An EVS idea about how {topic.lower()} affects people, nature, health, safety, or daily life."
    if subject == "Maths":
        return f"A maths idea used to understand and solve problems about {topic.lower()}."
    if subject == "English":
        return f"A reading or language idea from the lesson that helps students understand {topic.lower()}."
    return f"Hindi path ka ek mahatvapurn bhaag jo {topic.lower()} ko saral bhasha mein samjhata hai."


def chapter_context(subject: str, chapter: str) -> str:
    if subject == "EVS":
        return {
            "Super Senses": "This chapter teaches how animals use smell, sight, hearing, and body signals to find food, protect themselves, and live safely.",
            "From Tasting to Digesting": "This chapter connects taste, food, saliva, stomach, digestion, hunger, and healthy eating.",
            "Mangoes Round the Year": "This chapter explains how food spoils, why we preserve food, and how mangoes can be stored or used in many forms.",
            "Seeds and Seeds": "This chapter explains seeds, germination, seed travel, farming, and how new plants grow.",
            "Every Drop Counts": "This chapter explains water sources, water shortage, traditional water systems, and why saving water matters.",
            "Experiments with Water": "This chapter uses small experiments to explain floating, sinking, dissolving, evaporation, and properties of water.",
            "A Treat for Mosquitoes": "This chapter connects mosquitoes, stagnant water, malaria, blood testing, and disease prevention.",
            "Up You Go!": "This chapter teaches teamwork, courage, planning, safety, and mountain-climbing experiences.",
            "Walls Tell Stories": "This chapter explains how old buildings, walls, paintings, and monuments tell us about history and heritage.",
            "Sunita in Space": "This chapter explains space, gravity, Earth, astronauts, and how life changes outside Earth.",
            "What If It Finishes...?": "This chapter explains fuels, petrol, diesel, vehicles, pollution, and saving limited resources.",
            "A Shelter So High!": "This chapter explains how houses change with climate, height, land, materials, and people's needs.",
            "When the Earth Shook!": "This chapter explains earthquakes, disaster safety, relief work, rebuilding, and helping affected people.",
            "Blow Hot, Blow Cold": "This chapter explains breathing, air, blowing, temperature, and simple air observations.",
            "Who Will Do This Work?": "This chapter discusses cleanliness work, dignity of labour, caste discrimination, and respect for all workers.",
            "Across the Wall": "This chapter discusses games, teamwork, gender equality, practice, and confidence.",
            "No Place for Us?": "This chapter explains migration, homes, cities, displacement, and how families adjust to new places.",
            "A Seed Tells a Farmer's Story": "This chapter explains farming, crops, seeds, irrigation, changing methods, and farmers' lives.",
            "Whose Forests?": "This chapter discusses forests, tribal communities, forest resources, rights, and conservation.",
            "Like Father, Like Daughter": "This chapter introduces family traits, heredity, similarities, differences, and health.",
            "On the Move Again": "This chapter explains seasonal migration, farm labour, school challenges, and workers' lives.",
        }.get(chapter, "This chapter connects classroom learning with real people, nature, places, and daily-life situations.")
    if subject == "Maths":
        return {
            "The Fish Tale": "This chapter uses fish, boats, distance, money, and large numbers to build number sense.",
            "Shapes and Angles": "This chapter explains angles, turns, corners, and shapes seen around us.",
            "How Many Squares?": "This chapter uses grids and squares to build the idea of area.",
            "Parts and Wholes": "This chapter explains fractions as equal parts of a whole or a group.",
            "Does it Look the Same?": "This chapter explains symmetry, mirror images, and rotation.",
            "Be My Multiple, I'll be Your Factor": "This chapter explains factors, multiples, divisibility, and number relationships.",
            "Can You See the Pattern?": "This chapter trains students to find rules in number and shape patterns.",
            "Mapping Your Way": "This chapter explains maps, directions, routes, and scale.",
            "Boxes and Sketches": "This chapter connects 3D objects with nets, views, and sketches.",
            "Tenths and Hundredths": "This chapter introduces decimals through money, measurement, tenths, and hundredths.",
            "Area and its Boundary": "This chapter compares area and boundary/perimeter of shapes.",
            "Smart Charts": "This chapter teaches how to collect, read, and show data in charts.",
            "Ways to Multiply and Divide": "This chapter teaches different methods for multiplication and division.",
            "How Big? How Heavy?": "This chapter compares volume, weight, capacity, and measurement.",
        }.get(chapter, "This chapter builds a maths idea through examples, activities, and practice.")
    if subject == "English":
        return "This unit builds reading, vocabulary, speaking, imagination, and clear answers through a poem and a story."
    return "Yeh path padhne, shabdarth, bhavarth, prashn-uttar, aur sochne-samajhne ki kshamata ko badhata hai."


def subject_intro(subject: str, topic: str, chapter: str) -> str:
    if subject == "EVS":
        return f"{topic} is a Class 5 EVS topic from {chapter}. It teaches the idea through real-life situations so students can understand the world around them, not just memorize facts."
    if subject == "Maths":
        return f"{topic} is a Class 5 Maths topic from {chapter}. It helps students understand the concept, use the correct method, and solve questions with confidence."
    if subject == "English":
        return f"{topic} is part of the Class 5 English unit {chapter}. It helps students understand the poem or story, learn words, and express answers clearly."
    return f"{topic} Class 5 Hindi ke path {chapter} ka hissa hai. Isse bachche path ka arth, naye shabd, bhavarth, aur prashn-uttar samajh sakte hain."


def ncert_explanation(subject: str, topic: str, chapter: str) -> str:
    context = chapter_context(subject, chapter)
    if subject == "EVS":
        return (
            f"{context} The topic {topic} should be understood through observation, discussion, and examples from real life. "
            f"{topic} is not just a heading to remember; it is an idea that can be seen in daily life. "
            "A student should know what the idea means, why it matters, how it is seen around us, and what responsible action we should take. "
            "For a good Class 5 answer, explain the meaning first, add one real example, then write two or three important points in simple words."
        )
    if subject == "Maths":
        return (
            f"{context} The topic {topic} is taught by connecting the idea with simple situations. "
            f"{topic} should be learned by understanding the concept, not by memorising only one question. "
            "A student should understand the meaning, follow the method step by step, solve examples, and check the answer. "
            "A strong answer shows the given values, the method, the calculation or drawing, and a final checked answer."
        )
    if subject == "English":
        return (
            f"{context} The topic {topic} helps students understand the text more deeply. "
            "A student should notice the main idea, characters or speaker, important words, feelings, and the message of the poem or story. "
            "A good answer should not copy blindly; it should explain the idea in the student's own simple words with one detail from the text."
        )
    return (
        f"{context} {topic} ko samajhne ke liye path ka mukhya vichar, naye shabd, bhavarth, aur udaharan dhyan se samjhe jaate hain. "
        "Bachche ko sirf ratna nahi, balki arth samajhna chahiye. "
        "Achha uttar wahi hota hai jisme saral bhasha, path se juda ek udaharan, aur spasht prashn-uttar ho."
    )


def easy_explanation(subject: str, topic: str, chapter: str) -> str:
    if subject == "EVS":
        return (
            f"Simple way to understand {topic}: think of one real situation from your life, then ask what is happening, why it happens, "
            "who is affected, and what safe or responsible action should be taken. "
            "This makes EVS useful because it connects the textbook with things students actually see around them."
        )
    if subject == "Maths":
        return (
            f"Simple way to understand {topic}: first understand what the numbers or shapes mean, then solve slowly in small steps. "
            "Do not jump to the answer; write the method clearly. "
            "If the answer looks too big, too small, or impossible, check the calculation again."
        )
    if subject == "English":
        return (
            f"Simple way to understand {topic}: read the lines, find difficult words, understand what is happening, and then write the answer in your own words. "
            "Think about who is speaking, what they feel, and what the lesson wants us to learn."
        )
    return (
        f"{topic} ko asaan tarike se samajhne ke liye pehle path ka arth samjho, phir naye shabd dekho, aur ant mein apne shabdon mein uttar banao. "
        "Agar prashn kathin lage to pehle mukhya vichar likho, phir chhota udaharan jodo."
    )


def why_it_matters(subject: str, topic: str, chapter: str) -> str:
    if subject == "EVS":
        return (
            f"{topic} matters because EVS teaches students to understand life around them. "
            "It helps children observe carefully, ask questions, care for people and nature, and make safer choices."
        )
    if subject == "Maths":
        return (
            f"{topic} matters because it builds problem-solving power. "
            "Students use this idea in measurements, money, shapes, data, maps, or daily calculations."
        )
    if subject == "English":
        return (
            f"{topic} matters because it improves reading and expression. "
            "It helps students understand the text and answer questions in clear English."
        )
    return (
        f"{topic} isliye mahatvapurn hai kyunki yeh path ko samajhne, naye shabd seekhne, aur apne vichar saaf likhne mein madad karta hai."
    )


def common_mistake(subject: str, topic: str) -> str:
    if subject == "EVS":
        return (
            f"Common mistake: Students sometimes remember only the word '{topic}' but do not explain the real-life reason or example. "
            "Always add what happens, why it happens, and what we should do."
        )
    if subject == "Maths":
        return (
            "Common mistake: Students often write the answer directly without showing steps. "
            "In Maths, steps are important because they show how the answer was found."
        )
    if subject == "English":
        return (
            "Common mistake: Students copy a line without explaining its meaning. "
            "A better answer uses simple words and includes the main idea."
        )
    return (
        "Common mistake: Bachche kabhi-kabhi poora vaakya copy kar dete hain par arth nahi samjhate. "
        "Behtar uttar mein saral arth aur ek chhota udaharan hota hai."
    )


def exam_guidance(subject: str, topic: str) -> str:
    if subject == "EVS":
        return (
            f"Exam tip: If asked about {topic}, write the meaning, two important points, and one real-life example. "
            "Use short bullets so the answer is easy to read."
        )
    if subject == "Maths":
        return (
            f"Exam tip: For {topic}, write the method and solve step by step. "
            "Mention units such as rupees, metres, litres, or square units if the question uses them."
        )
    if subject == "English":
        return (
            f"Exam tip: For {topic}, write in complete sentences. "
            "Use one word meaning, character detail, event, or message from the lesson when needed."
        )
    return (
        f"Exam tip: {topic} ke prashn mein saral bhasha, mukhya vichar, shabdarth, aur ek chhota udaharan likho."
    )


def subject_steps(subject: str, topic: str):
    if subject == "EVS":
        return [
            f"Meaning: Understand what {topic} means in the chapter.",
            "Cause or reason: Learn why this situation, event, or behaviour happens.",
            "Real-life connection: Connect it with home, school, nature, health, safety, or society.",
            "Responsible action: Learn what a student, family, or community should do.",
            "Important terms: Remember the key words and their simple meanings.",
            "Example: Use one daily-life example to explain the idea.",
            "Exam answer: Write the answer in short, clear points.",
        ]
    if subject == "Maths":
        return [
            f"Concept: Understand what {topic} means.",
            "Given information: Write the numbers, shapes, units, or data neatly.",
            "Method: Choose the correct rule, operation, or drawing.",
            "Step work: Solve one step at a time without skipping.",
            "Check: Estimate or use the reverse operation to check the answer.",
            "Practice: Try one similar question to make the method strong.",
        ]
    if subject == "English":
        return [
            f"Meaning: Understand what {topic} tells us in the unit.",
            "Words: Learn the difficult words and their meanings.",
            "Main idea: Find what the poem or story is mainly about.",
            "Details: Notice characters, actions, feelings, and events.",
            "Answer writing: Use complete sentences and examples from the text.",
            "Message: Remember the lesson or feeling the writer wants to share.",
        ]
    return [
        f"Arth: {topic} ka saral matlab samjho.",
        "Shabd: Kathin shabdon ke arth yaad karo.",
        "Mukhya vichar: Path ka sabse zaruri sandesh pakdo.",
        "Udaharan: Path se ek chhota udaharan jodo.",
        "Uttar: Prashn ka uttar saaf aur saral vaakyon mein likho.",
        "Dohrav: Bhavarth aur naye shabd dobara padh kar yaad karo.",
    ]


def subject_example(subject: str, topic: str, chapter: str) -> str:
    if subject == "EVS":
        return f"For example, if the topic is {topic}, a student can observe a similar situation at home, in school, in a market, on a farm, near water, or in the neighbourhood and explain what should be done responsibly."
    if subject == "Maths":
        return f"For example, when a question uses {topic}, write the values carefully, solve in steps, and check whether the answer is reasonable for the situation."
    if subject == "English":
        return f"For example, while reading {chapter}, use {topic} to understand what the speaker or character feels, what happens, and what the writer wants us to learn."
    return f"Udaharan ke liye, {chapter} mein {topic} ko samajhkar bachcha path ka arth apne shabdon mein bata sakta hai aur prashn ka saaf uttar likh sakta hai."


def diagram(subject: str, topic: str):
    if subject == "EVS":
        content = f"Meaning of {topic} -> Why it matters -> Real-life example -> Safe/responsible action -> Exam points"
    elif subject == "Maths":
        content = f"Meaning of {topic} -> Given values -> Method -> Step-by-step solution -> Check answer"
    elif subject == "English":
        content = f"Text detail -> Word meaning -> Main idea -> Example from lesson -> Complete answer"
    else:
        content = f"Arth -> Shabdarth -> Mukhya vichar -> Udaharan -> Prashn uttar"
    return {"type": "text", "title": f"{topic} Flow", "content": content}


def make_topic(subject: str, chapter: str, topic: str):
    intro = subject_intro(subject, topic, chapter)
    document = {
        "id": content_id(subject, chapter, topic),
        "classLevel": "5",
        "board": "CBSE",
        "subject": subject,
        "chapterTitle": chapter,
        "topicTitle": topic,
        "status": "published",
        "version": 1,
        "sourceLabel": "Based on NCERT + AI explanation",
        "studyContent": {
            "title": topic,
            "intro": intro,
            "ncertBasedExplanation": ncert_explanation(subject, topic, chapter),
            "aiSimplifiedExplanation": easy_explanation(subject, topic, chapter),
            "stepByStep": subject_steps(subject, topic),
            "keywords": term_list(subject, topic),
            "realLifeExample": subject_example(subject, topic, chapter),
            "diagram": diagram(subject, topic),
            "summary": [
                f"{topic} is connected with the chapter {chapter}.",
                "The topic should be understood through meaning, examples, and key points.",
                why_it_matters(subject, topic, chapter),
                common_mistake(subject, topic),
                exam_guidance(subject, topic),
                "A good answer should explain the idea directly, not only name the chapter.",
                "Students should use simple language, one example, and clear steps.",
                "Revision should include important terms and likely exam points.",
            ],
        },
        "revisionContent": {
            "quickMeaning": intro,
            "keyPoints": [
                f"{topic} is part of {chapter}.",
                "Know the meaning in simple words.",
                "Remember the reason, method, event, or message behind it.",
                "Use one real or textbook-style example.",
                "Write answers in short points with clear language.",
            ],
            "importantTerms": term_list(subject, topic),
            "mustRemember": [
                "Do not memorize only the heading; understand the idea.",
                "Always include one example when possible.",
                "Use the flowchart to revise the answer quickly.",
                "For tests, write neat points instead of one long paragraph.",
                common_mistake(subject, topic),
            ],
            "quickFlowchart": diagram(subject, topic)["content"],
            "examPoints": [
                f"Explain {topic} in simple words.",
                f"How is {topic} connected with {chapter}?",
                "Write two important points.",
                "Give one example.",
                "Draw or write a simple flowchart if useful.",
                exam_guidance(subject, topic),
            ],
        },
        "sourceRefs": [
            {
                "source": SUBJECT_LABELS[subject],
                "note": "Simplified with AI for Class 5 CBSE students.",
            }
        ],
    }

    if subject == "EVS" and chapter == "A Snake Charmer's Story" and topic in A_SNAKE_CHARMERS_STORY_OVERRIDES:
        document.update(A_SNAKE_CHARMERS_STORY_OVERRIDES[topic])

    return document


def main():
    generated = []
    for subject, chapters in SYLLABUS.items():
        for chapter, topics in chapters:
            for topic in topics:
                generated.append(make_topic(subject, chapter, topic))

    with OUTPUT_PATH.open("w", encoding="utf-8") as file:
        json.dump(generated, file, indent=2, ensure_ascii=True)
        file.write("\n")

    print(f"Wrote {len(generated)} content documents to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
