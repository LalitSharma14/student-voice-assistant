import json
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def slug(value: str) -> str:
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", value.lower())).strip("_")


def make_topic(prefix: str, number: int, title: str, chapter: str, overview: str, subject: str) -> dict:
    meaning = f"{title} is a key idea in {chapter}. It focuses on {overview[0].lower() + overview[1:]}"
    if subject == "English":
        explanation = (
            f"In {chapter}, {title.lower()} helps the reader understand the lesson beyond its surface events. "
            f"{overview} The text develops this idea through its characters, images, choices, and language. "
            "A careful reader should connect what happens in the lesson with the reason it happens, how the people or speaker respond, "
            "and what the experience teaches. This also supports comprehension answers because it links evidence from the text with a clear interpretation."
        )
        easy = f"This part of {chapter} is about {title.lower()}. {overview} Look at what happens, why it matters, and what we learn from it."
        example = f"A useful answer about {title.lower()} can mention one event or image from {chapter} and explain what it shows."
    elif subject == "Science":
        explanation = (
            f"In Class 8 Science, {title} is developed in {chapter}. {overview} "
            "The concept is understood by connecting observation with a scientific model or explanation. "
            "Students should identify the variables or parts involved, describe the process in the correct order, and use evidence from an activity or daily-life situation. "
            "This makes the idea useful for prediction, problem solving, and explaining why a result occurs."
        )
        easy = f"{title} becomes simple when we follow what happens step by step. {overview} Observe the parts, notice the change, and connect the cause with the result."
        example = f"A daily-life observation or classroom activity from {chapter} can be used to demonstrate {title.lower()}."
    else:
        explanation = (
            f"In Class 9 Social Science, {title} is studied through {chapter}. {overview} "
            "The idea becomes clearer when causes, important features, and consequences are connected instead of memorised separately. "
            "It also helps students interpret maps, timelines, institutions, economic choices, or evidence from society, depending on the chapter. "
            "A strong answer defines the concept, explains how it works, and supports it with a relevant example or consequence."
        )
        easy = f"{title} means understanding this idea in a simple cause-and-effect way: {overview} Connect the reason, the main event or process, and its result."
        example = f"For example, use a real event, place, institution, or everyday economic situation from {chapter} to explain {title.lower()}."

    return {
        "topicId": f"{prefix}_t{number}",
        "topic": title,
        "meaning": meaning,
        "ncertBasedExplanation": explanation,
        "easyExplanation": easy,
        "stepByStepExplanation": [
            {"step": 1, "title": "Identify the central idea", "explanation": f"State clearly what {title.lower()} means."},
            {"step": 2, "title": "Use the chapter context", "explanation": overview},
            {"step": 3, "title": "Connect evidence", "explanation": f"Choose a relevant event, detail, example, or fact from {chapter}."},
            {"step": 4, "title": "Explain significance", "explanation": "Show why the idea matters and what consequence or lesson follows."},
        ],
        "examples": [example, f"Write one clear point about {title.lower()} and support it with chapter evidence."],
        "importantKeywords": [
            {"keyword": title, "definition": overview, "simpleExample": example},
            {"keyword": "Evidence", "definition": "A fact, event, quotation idea, map detail, or example that supports an answer.", "simpleExample": f"A detail from {chapter} supports the explanation."},
            {"keyword": "Significance", "definition": "Why an idea or event is important.", "simpleExample": f"Explain what {title.lower()} changes or teaches."},
        ],
        "quickSummary": f"{title}: {overview}",
        "revisionNotes": [overview, f"Connect {title.lower()} with evidence from {chapter}.", "Explain both the idea and why it matters."],
    }


ENGLISH_CHAPTERS = [
    ("Wit and Wisdom", "The Wit that Won Hearts", "Tenali Rama uses tact and intelligence to settle a disagreement in the royal household and restore harmony.", ["Setting and Main Conflict", "Tenali Rama's Plan", "Wit and Presence of Mind", "King Krishnadeva Raya", "Queen Thirumalambal", "Humour and Resolution", "Message of Patience and Understanding", "Vocabulary and Comprehension"]),
    ("Wit and Wisdom", "A Concrete Example", "The poem notices a tiny garden growing among stones and celebrates patient observation, resilience, and beauty in ordinary places.", ["The Garden among Stones", "Power of Observation", "Imagery of Small Plants", "Contrast between Concrete and Life", "Resilience in Nature", "Poetic Voice and Mood", "Theme of Hidden Beauty", "Poetic Devices and Vocabulary"]),
    ("Wit and Wisdom", "Wisdom Paves the Way", "Four young travellers solve a mystery through observation and reasoning, showing that careful thought can be more valuable than wealth or status.", ["The Merchant's Mystery", "Clues and Observation", "Reasoning of the Four Young Men", "Wisdom versus Guesswork", "The King's Judgement", "Teamwork in Problem Solving", "Message of the Story", "Sequence and Comprehension"]),
    ("Values and Dispositions", "A Tale of Valour: Major Somnath Sharma and the Battle of Badgam", "The account presents Major Somnath Sharma's courage, leadership, and sacrifice while defending Srinagar during the Battle of Badgam.", ["Historical Setting of Badgam", "Major Somnath Sharma's Leadership", "Courage under Pressure", "Duty and Sacrifice", "The Battle's Importance", "Qualities of a Soldier", "Patriotism without Boasting", "Biography and Factual Comprehension"]),
    ("Values and Dispositions", "Somebody's Mother", "A compassionate boy helps an elderly woman cross a busy street, showing that a small act of kindness can protect another person's dignity.", ["The Elderly Woman's Difficulty", "The Boy's Act of Kindness", "Empathy and Compassion", "Dignity of Every Person", "The Mother's Perspective", "Narrative Poem Structure", "Central Message", "Rhyme Imagery and Vocabulary"]),
    ("Values and Dispositions", "Verghese Kurien - I Too Had a Dream", "Verghese Kurien explains how cooperation, professional skill, and faith in farmers helped build India's dairy movement.", ["Verghese Kurien's Early Journey", "The Anand Dairy Cooperative", "Farmers at the Centre", "Operation Flood and the White Revolution", "Leadership and Institution Building", "Technology Serving Society", "Dream of an Independent India", "Memoir and Comprehension"]),
    ("Mystery and Magic", "The Case of the Fifth Word", "A puzzling clue is solved by examining language carefully, demonstrating how attention to words and patterns can uncover hidden meaning.", ["The Central Mystery", "Meaning of the Fifth Word", "Clues Hidden in Language", "Logical Elimination", "Role of Observation", "Suspense and Revelation", "Message about Careful Reading", "Wordplay and Comprehension"]),
    ("Mystery and Magic", "The Magic Brush of Dreams", "A magical brush turns imagination into consequences, encouraging the reader to think about creativity, responsibility, and the purpose of art.", ["Discovery of the Magic Brush", "Dreams Becoming Real", "Creative Imagination", "Choices and Consequences", "Responsibility in Using Power", "Fantasy Elements", "Message about Art and Desire", "Descriptive Language and Comprehension"]),
    ("Mystery and Magic", "Spectacular Wonders", "The text explores extraordinary sights and experiences while showing how curiosity and informed observation deepen our sense of wonder.", ["Meaning of a Wonder", "Remarkable Natural Features", "Human Achievement and Design", "Curiosity and Exploration", "Fact versus Exaggeration", "Descriptive Details", "Protecting Heritage and Nature", "Information Text Skills"]),
    ("Environment", "The Cherry Tree", "A child nurtures a cherry seed through setbacks until it becomes a tree, revealing patience, growth, and the quiet bond between people and nature.", ["Planting the Cherry Seed", "Obstacles to Growth", "Patience and Care", "Stages of the Tree's Growth", "Human Bond with Nature", "Time and Change", "Theme of Hope and Perseverance", "Narrative Detail and Vocabulary"]),
    ("Environment", "Harvest Hymn", "The poem expresses gratitude for crops, soil, rain, sunlight, and labour, presenting harvest as both a natural cycle and a shared human celebration.", ["Celebration of Harvest", "Role of Soil Rain and Sun", "Farmers and Human Labour", "Gratitude to Nature", "Community and Sharing", "Rhythm of a Hymn", "Environmental Interdependence", "Poetic Devices and Vocabulary"]),
    ("Environment", "Waiting for the Rain", "People, plants, and animals wait for rain, revealing how deeply life depends on seasonal water and how hope grows during scarcity.", ["Landscape before Rain", "Dependence on the Monsoon", "Water Scarcity", "Hope and Anticipation", "Responses of People and Nature", "Sensory Imagery", "Water Conservation Message", "Mood and Comprehension"]),
    ("Science and Curiosity", "Feathered Friend", "Close observation of a bird becomes a doorway to understanding behaviour, adaptation, trust, and responsible care for living creatures.", ["Meeting the Feathered Friend", "Bird Behaviour", "Feathers Beak and Adaptation", "Observation as a Scientific Skill", "Trust between Humans and Birds", "Responsible Care for Wildlife", "Curiosity and Learning", "Description and Comprehension"]),
    ("Science and Curiosity", "Magnifying Glass", "The lesson uses magnification to reveal details invisible to the unaided eye and shows how instruments extend human observation.", ["How a Magnifying Glass Works", "Convex Lens and Enlarged Image", "Observing Small Details", "Uses in Science and Daily Life", "Careful Scientific Observation", "Limits and Safe Use", "Curiosity through Instruments", "Process Vocabulary and Comprehension"]),
    ("Science and Curiosity", "Bibha Chowdhuri: The Beam of Light that Lit the Path for Women in Indian Science", "The biography traces physicist Bibha Chowdhuri's research and perseverance, highlighting scientific curiosity and the barriers faced by women in science.", ["Bibha Chowdhuri's Early Life", "Interest in Physics", "Research on Cosmic Rays", "Scientific Work and Evidence", "Challenges Faced by Women Scientists", "Perseverance and Recognition", "Legacy for Young Learners", "Biography and Factual Comprehension"]),
]


SCIENCE_CHAPTERS = [
    ("Exploring the Investigative World of Science", "Science begins with careful questions, fair investigations, evidence, and explanations that can be checked and improved.", ["Observation and Scientific Questions", "Forming a Testable Hypothesis", "Planning a Fair Investigation", "Variables and Controls", "Measurement and Recording Data", "Patterns Evidence and Conclusions", "Communicating Scientific Findings", "Safety Ethics and Revising Ideas"]),
    ("The Invisible Living World: Beyond Our Naked Eye", "Microscopes reveal microorganisms and cells whose structures, activities, and interactions affect health, food, soil, and ecosystems.", ["Microscopes and Magnification", "Cells as Units of Life", "Bacteria", "Fungi and Yeast", "Protozoa and Microscopic Algae", "Useful Microorganisms", "Disease-Causing Microorganisms", "Hygiene Food Preservation and Prevention"]),
    ("Health: The Ultimate Treasure", "Health depends on balanced nutrition, physical activity, mental well-being, hygiene, disease prevention, and supportive social conditions.", ["Meaning and Dimensions of Health", "Balanced Diet and Nutrients", "Digestion and Nutrient Use", "Physical Activity Rest and Sleep", "Communicable Diseases", "Non-Communicable and Lifestyle Diseases", "Immunity Vaccination and Prevention", "Mental and Social Well-Being"]),
    ("Electricity: Magnetic and Heating Effects", "Electric current can produce heat and magnetism, allowing circuits to power appliances, safety devices, electromagnets, and motors.", ["Electric Current and Closed Circuits", "Conductors Insulators and Circuit Symbols", "Heating Effect of Electric Current", "Resistance and Heating Elements", "Electric Fuse and Safety", "Magnetic Effect of Current", "Electromagnets", "Applications in Bells Relays and Motors"]),
    ("Exploring Forces", "A force is a push or pull that can change motion or shape, and its effect depends on magnitude, direction, and the combination of forces.", ["Force as Push or Pull", "Contact and Non-Contact Forces", "Magnitude and Direction of Force", "Balanced and Unbalanced Forces", "Force and Change in Motion", "Force and Change in Shape", "Gravitational Magnetic and Electrostatic Forces", "Representing and Measuring Force"]),
    ("Pressure, Winds, Storms, and Cyclones", "Pressure is force acting over an area; differences in air pressure drive winds and can grow into storms and cyclones under suitable conditions.", ["Meaning of Pressure", "Pressure in Liquids", "Atmospheric Pressure", "Heating of Air and Wind Formation", "High and Low Pressure Systems", "Thunderstorms", "Formation and Structure of Cyclones", "Cyclone Forecasting Preparedness and Safety"]),
    ("Particulate Nature of Matter", "Matter is made of tiny moving particles whose arrangement, spacing, and attraction explain solids, liquids, gases, diffusion, and changes of state.", ["Evidence that Matter is Particulate", "Particle Arrangement in Solids", "Particles in Liquids", "Particles in Gases", "Particle Motion and Diffusion", "Forces of Attraction between Particles", "Changes of State", "Effect of Temperature and Pressure"]),
    ("Nature of Matter: Elements, Compounds, and Mixtures", "Materials can be classified as elements, compounds, or mixtures according to their particles, composition, properties, and methods of separation.", ["Pure Substances and Materials", "Elements and Chemical Symbols", "Metals Non-Metals and Metalloids", "Compounds and Fixed Composition", "Mixtures and Variable Composition", "Homogeneous and Heterogeneous Mixtures", "Physical and Chemical Properties", "Separating Mixtures"]),
    ("The Amazing World of Solutes, Solvents, and Solutions", "A solution forms when a solute dissolves uniformly in a solvent, with solubility affected by substance, temperature, mixing, and particle size.", ["Solute Solvent and Solution", "Dissolving at the Particle Level", "Soluble and Insoluble Substances", "Concentrated and Dilute Solutions", "Saturated and Unsaturated Solutions", "Factors Affecting Rate of Dissolving", "Temperature and Solubility", "Solutions in Daily Life"]),
    ("Light: Mirrors and Lenses", "Reflection and refraction explain how mirrors and lenses redirect light and form images with different positions, sizes, and orientations.", ["Light Rays and Straight-Line Travel", "Laws of Reflection", "Plane Mirrors and Image Properties", "Multiple Reflection", "Refraction of Light", "Convex and Concave Lenses", "Image Formation by Lenses", "Optical Devices and Safe Use of Light"]),
    ("Keeping Time with the Skies", "Regular motions of Earth, Moon, Sun, and stars create observable cycles that people use to measure days, months, seasons, and years.", ["Rotation of Earth and the Day", "Revolution of Earth and the Year", "Earth's Tilt and Seasons", "Phases of the Moon", "Lunar Month and Calendars", "Apparent Motion of Stars", "Sundials and Shadow Time", "Accuracy of Modern Timekeeping"]),
    ("How Nature Works in Harmony", "Ecosystems function through relationships among organisms and their physical environment, with energy flow, nutrient cycles, and biodiversity supporting stability.", ["Components of an Ecosystem", "Producers Consumers and Decomposers", "Food Chains and Food Webs", "Flow of Energy", "Cycling of Matter", "Interactions and Interdependence", "Biodiversity and Ecosystem Stability", "Human Impact and Ecological Restoration"]),
    ("Our Home: Earth, a Unique Life Sustaining Planet", "Earth supports life because liquid water, a suitable temperature range, atmosphere, soil, magnetic protection, and living systems interact within a narrow habitable range.", ["Earth in the Habitable Zone", "Liquid Water and Life", "Atmosphere and Greenhouse Effect", "Ozone Layer and Solar Radiation", "Earth's Magnetic Field", "Soil and Biogeochemical Cycles", "Biosphere and Continuity of Life", "Climate Change Pollution and Planetary Care"]),
]


SOCIAL_CHAPTERS = [
    ("History", "India and the Contemporary World-I", "The French Revolution", "French society faced deep inequality and financial crisis, leading to revolution, the end of absolute monarchy, and new ideas of citizenship.", ["French Society under the Old Regime", "The Financial Crisis and Estates-General", "The National Assembly and Bastille", "Declaration of the Rights of Man", "France Becomes a Republic", "Reign of Terror and Its Aftermath", "Women and the Revolution", "Legacy of the French Revolution"]),
    ("History", "India and the Contemporary World-I", "Socialism in Europe and the Russian Revolution", "Industrial inequality and socialist ideas shaped opposition to Tsarism and led to the revolutions of 1917 and the creation of a socialist state.", ["Social Change and Socialist Ideas", "Russia under the Tsars", "The Revolution of 1905", "First World War and the Russian Crisis", "February Revolution of 1917", "October Revolution and the Bolsheviks", "Civil War and Formation of the USSR", "Consequences of the Russian Revolution"]),
    ("History", "India and the Contemporary World-I", "Nazism and the Rise of Hitler", "Germany's post-war crisis enabled Hitler and the Nazi Party to destroy democracy, build a racial state, and carry out war and genocide.", ["Weimar Republic and the Treaty of Versailles", "Economic Crisis and Hitler's Rise", "Destruction of Democracy", "Nazi Worldview and Racial State", "Youth and Education under Nazism", "Persecution of Jews and the Holocaust", "Propaganda and Control", "War Defeat and Historical Responsibility"]),
    ("History", "India and the Contemporary World-I", "Forest Society and Colonialism", "Colonial governments treated forests as commercial resources, transforming customary access, livelihoods, and ecological relationships.", ["Why Colonial States Wanted Forests", "Scientific Forestry", "Forest Laws and Restricted Access", "Shifting Cultivation and Pastoral Life", "Forest Communities and Resistance", "Plantations and Timber Extraction", "Bastar Rebellion", "Comparing Colonial Forestry in India and Java"]),
    ("History", "India and the Contemporary World-I", "Pastoralists in the Modern World", "Pastoral communities adapt their seasonal movement to climate and grazing needs, but modern borders, laws, and markets changed their livelihoods.", ["Meaning of Pastoralism", "Seasonal Movement and Grazing Cycles", "Pastoral Communities in India", "Colonial Laws and Grazing Restrictions", "Criminal Tribes Act and Surveillance", "Pastoralism in Africa", "Adaptation to Markets and Boundaries", "Importance of Mobile Livelihoods"]),
    ("Geography", "Contemporary India-I", "India - Size and Location", "India's latitude, longitude, extent, neighbours, and position in the Indian Ocean influence time, climate, trade, and global connections.", ["Latitudinal and Longitudinal Extent", "Tropic of Cancer and Standard Meridian", "Indian Standard Time", "India's Size and Area", "India and the Indian Ocean", "Neighbouring Countries", "Administrative Divisions", "Strategic Importance of Location"]),
    ("Geography", "Contemporary India-I", "Physical Features of India", "India's mountains, plains, plateau, desert, coasts, and islands formed through geological processes and support different environments and livelihoods.", ["Geological Formation of India", "The Himalayan Mountains", "The Northern Plains", "The Peninsular Plateau", "The Indian Desert", "Coastal Plains", "Island Groups", "Importance of Physiographic Diversity"]),
    ("Geography", "Contemporary India-I", "Drainage", "India's rivers form drainage systems shaped by relief, rainfall, and geology, supporting ecosystems and human life while also creating management challenges.", ["Drainage Basins and Water Divides", "Himalayan River Systems", "Indus River System", "Ganga and Brahmaputra Systems", "Peninsular River Systems", "Lakes and Their Importance", "Role of Rivers in the Economy", "River Pollution and Conservation"]),
    ("Geography", "Contemporary India-I", "Climate", "India's monsoon climate is shaped by latitude, altitude, pressure, winds, distance from the sea, and relief, producing strong seasonal and regional variation.", ["Weather Climate and Climatic Controls", "Mechanism of the Monsoon", "Cold Weather Season", "Hot Weather Season", "Advancing Monsoon", "Retreating Monsoon", "Distribution of Rainfall", "Monsoon as a Unifying Bond"]),
    ("Geography", "Contemporary India-I", "Natural Vegetation and Wildlife", "Climate, soil, and relief shape India's vegetation types and habitats, while conservation is needed to protect biodiversity.", ["Factors Affecting Natural Vegetation", "Tropical Evergreen Forests", "Tropical Deciduous Forests", "Thorn Forests and Scrubs", "Montane Forests", "Mangrove Forests", "Wildlife Diversity", "Conservation of Flora and Fauna"]),
    ("Geography", "Contemporary India-I", "Population", "Population distribution, density, growth, age structure, sex ratio, literacy, and occupation reveal how people are spread and how society changes.", ["Population Size and Distribution", "Population Density", "Population Growth and Change", "Age Composition", "Sex Ratio", "Literacy Rate", "Occupational Structure", "National Population Policy"]),
    ("Political Science", "Democratic Politics-I", "What is Democracy? Why Democracy?", "Democracy is government by elected representatives under rules that protect participation, accountability, equality, and citizens' rights.", ["Meaning and Features of Democracy", "Major Decisions by Elected Leaders", "Free and Fair Electoral Competition", "One Person One Vote One Value", "Rule of Law and Rights", "Arguments for Democracy", "Limitations and Challenges", "Democracy as Accountable Government"]),
    ("Political Science", "Democratic Politics-I", "Constitutional Design", "A constitution creates the basic rules of government, protects rights, distributes power, and expresses a society's shared political values.", ["South Africa and Apartheid", "Democratic Constitution in South Africa", "Why a Constitution is Needed", "Making of the Indian Constitution", "Constituent Assembly", "Guiding Values of the Constitution", "The Preamble", "Institutional Design and Constitutional Change"]),
    ("Political Science", "Democratic Politics-I", "Electoral Politics", "Elections allow citizens to choose representatives and change rulers, but meaningful elections require genuine choice, fair competition, and independent administration.", ["Why Elections are Necessary", "Constituencies and Representation", "Voters' List and Universal Franchise", "Nomination and Election Campaign", "Polling and Counting", "Reserved Constituencies", "Election Commission", "Challenges to Free and Fair Elections"]),
    ("Political Science", "Democratic Politics-I", "Working of Institutions", "Democratic decisions emerge through Parliament, political executives, civil servants, and courts, with each institution exercising defined powers and checks.", ["Need for Political Institutions", "Parliament and Law Making", "Political Executive and Permanent Executive", "Prime Minister and Council of Ministers", "President of India", "The Judiciary", "Checks and Balances", "Decision Making through Institutions"]),
    ("Political Science", "Democratic Politics-I", "Democratic Rights", "Rights protect human dignity and freedom, limit state power, and give citizens remedies when constitutional guarantees are violated.", ["Meaning and Need for Rights", "Life without Democratic Rights", "Fundamental Rights", "Right to Equality", "Right to Freedom", "Freedom of Religion and Cultural Rights", "Right to Constitutional Remedies", "Expanding Scope of Rights"]),
    ("Economics", "Economics", "The Story of Village Palampur", "A fictional village illustrates production using land, labour, physical capital, and human capital, along with farm and non-farm activities.", ["Organisation of Production", "Land as a Fixed Resource", "Labour and Human Effort", "Physical and Human Capital", "Multiple Cropping and Modern Farming", "Distribution of Land and Farm Labour", "Non-Farm Activities", "Sustainable Use of Resources"]),
    ("Economics", "Economics", "People as Resource", "Education, health, and skills turn population into human capital, improving productivity while unemployment wastes human potential.", ["Population as an Asset", "Human Capital Formation", "Role of Education", "Role of Health", "Economic Activities by Men and Women", "Market and Non-Market Activities", "Unemployment", "Quality of Population"]),
    ("Economics", "Economics", "Poverty as a Challenge", "Poverty includes inadequate income and deprivation in food, health, education, shelter, security, and opportunity.", ["Meaning and Dimensions of Poverty", "Poverty Line", "Poverty Trends in India", "Vulnerable Groups", "Inter-State Disparities", "Causes of Poverty", "Anti-Poverty Measures", "Future Challenges and Human Development"]),
    ("Economics", "Economics", "Food Security in India", "Food security means that all people have reliable physical and economic access to sufficient, safe, and nutritious food at all times.", ["Meaning and Dimensions of Food Security", "Who is Food Insecure", "Hunger and Famine", "Green Revolution", "Buffer Stock", "Public Distribution System", "Cooperatives and Food Security", "Challenges in Ensuring Nutrition"]),
]


def build_english() -> dict:
    chapters = []
    for chapter_number, (unit, chapter, overview, topics) in enumerate(ENGLISH_CHAPTERS, 1):
        prefix = f"eng8_ch{chapter_number}"
        chapters.append({
            "chapterNumber": chapter_number,
            "unit": unit,
            "chapter": chapter,
            "topics": [make_topic(prefix, i, title, chapter, overview, "English") for i, title in enumerate(topics, 1)],
        })
    return {"class": 8, "board": "CBSE", "source": "NCERT", "subject": "English", "bookName": "Poorvi", "chapters": chapters}


def build_social_science() -> dict:
    chapters = []
    for chapter_number, (discipline, book, chapter, overview, topics) in enumerate(SOCIAL_CHAPTERS, 1):
        prefix = f"sst9_ch{chapter_number}"
        chapters.append({
            "chapterNumber": chapter_number,
            "discipline": discipline,
            "bookName": book,
            "chapter": chapter,
            "topics": [make_topic(prefix, i, title, chapter, overview, "Social Science") for i, title in enumerate(topics, 1)],
        })
    return {"class": 9, "board": "CBSE", "source": "NCERT", "subject": "Social Science", "chapters": chapters}


def build_science() -> dict:
    chapters = []
    for chapter_number, (chapter, overview, topics) in enumerate(SCIENCE_CHAPTERS, 1):
        prefix = f"sci8_ch{chapter_number}"
        chapters.append({
            "chapterNumber": chapter_number,
            "chapter": chapter,
            "topics": [make_topic(prefix, i, title, chapter, overview, "Science") for i, title in enumerate(topics, 1)],
        })
    return {"class": 8, "board": "CBSE", "source": "NCERT", "subject": "Science", "bookName": "Curiosity", "chapters": chapters}


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    topic_count = sum(len(chapter["topics"]) for chapter in data["chapters"])
    print(f"Wrote {len(data['chapters'])} chapters and {topic_count} topics to {path}")


def main() -> None:
    write_json(BASE_DIR / "class8_ncert_json_notes" / "class8_english.json", build_english())
    write_json(BASE_DIR / "class8_ncert_json_notes" / "class8_science.json", build_science())
    write_json(BASE_DIR / "class9_ncert_json_notes" / "class9_social_science.json", build_social_science())


if __name__ == "__main__":
    main()
