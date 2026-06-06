import json
import re
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
OUTPUT_PATH = BASE_DIR / "class_6_cbse_all_subjects.json"

SYLLABUS = {
    "Maths": [
        ("Patterns in Mathematics", ["Number patterns", "Shape patterns", "Growing patterns", "Pattern rules"]),
        ("Lines and Angles", ["Points and lines", "Types of angles", "Measuring angles", "Parallel and intersecting lines"]),
        ("Number Play", ["Large numbers", "Number games", "Estimation", "Place value patterns"]),
        ("Data Handling and Presentation", ["Collecting data", "Tables", "Pictographs", "Bar graphs"]),
        ("Prime Time", ["Factors and multiples", "Prime numbers", "Composite numbers", "Common factors"]),
        ("Perimeter and Area", ["Perimeter", "Area of rectangles", "Area of squares", "Real-life measurement"]),
        ("Fractions", ["Meaning of fractions", "Equivalent fractions", "Comparing fractions", "Fractions in daily life"]),
        ("Playing with Constructions", ["Using ruler and compass", "Drawing circles", "Constructing angles", "Geometric designs"]),
        ("Symmetry", ["Line symmetry", "Symmetric shapes", "Reflection", "Symmetry in nature"]),
        ("The Other Side of Zero", ["Negative numbers", "Number line", "Comparing integers", "Integers in real life"]),
    ],
    "Science": [
        ("The Wonderful World of Science", ["Science around us", "Observation", "Asking questions", "Scientific thinking"]),
        ("Diversity in the Living World", ["Living things", "Plant diversity", "Animal diversity", "Grouping organisms"]),
        ("Mindful Eating: A Path to a Healthy Body", ["Balanced diet", "Nutrients", "Food choices", "Healthy habits"]),
        ("Exploring Magnets", ["Magnetic materials", "Poles of a magnet", "Attraction and repulsion", "Uses of magnets"]),
        ("Measurement of Length and Motion", ["Measuring length", "Standard units", "Types of motion", "Distance and movement"]),
        ("Materials Around Us", ["Properties of materials", "Grouping materials", "Soluble and insoluble", "Uses of materials"]),
        ("Temperature and its Measurement", ["Hot and cold", "Thermometers", "Reading temperature", "Safety while measuring"]),
        ("A Journey through States of Water", ["States of water", "Evaporation", "Condensation", "Water cycle"]),
        ("Methods of Separation in Everyday Life", ["Handpicking", "Sieving", "Filtration", "Evaporation in separation"]),
        ("Living Creatures: Exploring their Characteristics", ["Characteristics of living things", "Growth", "Movement", "Response to surroundings"]),
        ("Nature's Treasures", ["Natural resources", "Air and water", "Soil and minerals", "Conservation"]),
        ("Beyond Earth", ["Sun and planets", "Moon", "Stars", "Space exploration"]),
    ],
    "Social Science": [
        ("Locating Places on the Earth", ["Maps and globes", "Latitudes", "Longitudes", "Finding locations"]),
        ("Oceans and Continents", ["Continents", "Oceans", "India and the world", "Earth's surface"]),
        ("Landforms and Life", ["Mountains", "Plateaus", "Plains", "Life and landforms"]),
        ("Timeline and Sources of History", ["Timelines", "Historical sources", "Archaeology", "Understanding the past"]),
        ("India, That Is Bharat", ["Names of India", "Bharat in texts", "Unity of India", "Cultural identity"]),
        ("The Beginnings of Indian Civilisation", ["Early settlements", "Sindhu-Sarasvati civilisation", "Cities and crafts", "Trade and life"]),
        ("India's Cultural Roots", ["Knowledge traditions", "Values", "Literature and learning", "Cultural continuity"]),
        ("Unity in Diversity, or 'Many in the One'", ["Diversity", "Festivals and languages", "Shared traditions", "National unity"]),
        ("Family and Community", ["Family roles", "Community life", "Cooperation", "Responsibilities"]),
        ("Grassroots Democracy Part 1: Governance", ["Meaning of governance", "Rules and decisions", "Public services", "Democracy basics"]),
        ("Grassroots Democracy Part 2: Local Government in Rural Areas", ["Gram Sabha", "Panchayat", "Village development", "Local participation"]),
        ("Grassroots Democracy Part 3: Local Government in Urban Areas", ["Municipality", "City services", "Urban problems", "Citizen role"]),
        ("The Value of Work", ["Types of work", "Dignity of labour", "Paid and unpaid work", "Helping society"]),
        ("Economic Activities Around Us", ["Needs and wants", "Production", "Services", "Markets"]),
    ],
    "English": [
        ("Fables and Folk Tales", ["A Bottle of Dew", "The Raven and the Fox", "Rama to the Rescue", "Moral and message"]),
        ("Friendship", ["The Unlikely Best Friends", "A Friend's Prayer", "The Chair", "Qualities of friendship"]),
        ("Nurturing Nature", ["Neem Baba", "What a Bird Thought", "Spices that Heal Us", "Nature and health"]),
        ("Sports and Wellness", ["Change of Heart", "The Winner", "Yoga - A Way of Life", "Health and sportsmanship"]),
        ("Culture and Tradition", ["Hamara Bharat - Incredible India", "The Kites", "Ila Sachani", "National War Memorial"]),
    ],
    "Hindi": [
        ("Matrbhumi", ["Kavita ka bhav", "Desh prem", "Pushp ki Abhilasha", "Shabdarth"]),
        ("Gol", ["Sansmaran", "Khel aur anubhav", "Ek daud aisi bhi", "Prashn uttar"]),
        ("Pahali Boond", ["Kavita path", "Prakriti varnan", "Varsha ka mahatva", "Bhavarth"]),
        ("Haar Ki Jeet", ["Kahani path", "Patra aur ghatna", "Naitik sandesh", "Prashn uttar"]),
        ("Rahim Ke Dohe", ["Doha path", "Arth", "Jeevan moolya", "Udaharan"]),
        ("Meri Maan", ["Atmakatha", "Maa ka prem", "Yaadein", "Prashn uttar"]),
        ("Jalate Chalo", ["Kavita ka sandesh", "Prerna", "Deepak ka pratik", "Bhavarth"]),
        ("Sattriya Aur Bihu Nritya", ["Nritya parampara", "Assam ki sanskriti", "Kala aur abhyas", "Prashn uttar"]),
        ("Maiya Main Nahin Makhan Khayo", ["Pad path", "Krishna leela", "Bhakti bhav", "Shabdarth"]),
        ("Pariksha", ["Kahani path", "Imaandari", "Mehnat", "Prashn uttar"]),
        ("Chetak Ki Veerta", ["Kavita path", "Chetak ka sahas", "Maharana Pratap", "Bhavarth"]),
        ("Hind Mahasagar Mein Chhota-sa Hindustan", ["Yatra vrittant", "Pravasi Bharatiya", "Hind Mahasagar", "Prashn uttar"]),
        ("Ped Ki Baat", ["Prakriti sandesh", "Vriksh ka mahatva", "Paryavaran", "Prashn uttar"]),
    ],
}

SUBJECT_LABELS = {
    "Maths": "NCERT Ganita Prakash",
    "Science": "NCERT Curiosity",
    "Social Science": "NCERT Exploring Society: India and Beyond",
    "English": "NCERT Poorvi",
    "Hindi": "NCERT Malhar",
}

KEYWORDS = {
    "Maths": [("Rule", "A statement that explains how a mathematical idea works."), ("Example", "A simple case used to understand a concept."), ("Reasoning", "Thinking step by step to reach a correct answer.")],
    "Science": [("Observation", "Looking carefully and noticing details."), ("Evidence", "Information that supports an answer."), ("Experiment", "A planned activity to test an idea.")],
    "Social Science": [("Landform", "A natural feature on Earth's surface, such as a mountain, plateau, or plain."), ("Settlement", "A place where people live."), ("Livelihood", "The work people do to earn a living.")],
    "English": [("Theme", "The main idea of a text."), ("Character", "A person, animal, or figure in a story."), ("Expression", "How thoughts and feelings are shown through words.")],
    "Hindi": [("Path", "Kavita, kahani, nibandh ya dohe ko dhyan se padhna."), ("Bhav", "Rachna ka mukhya anubhav ya sandesh."), ("Shabdarth", "Mushkil shabdon ka saral arth.")],
}

TOPIC_EXAMPLES = {
    "Maths": {
        "Prime numbers": "2, 3, 5, 7, and 11 are prime numbers because each has only two factors: 1 and itself. 4 is not prime because 1, 2, and 4 divide it.",
        "Composite numbers": "6 is composite because it has factors 1, 2, 3, and 6. So it has more than two factors.",
        "Factors and multiples": "Factors of 12 include 1, 2, 3, 4, 6, and 12. Multiples of 4 include 4, 8, 12, 16, and 20.",
        "Common factors": "Common factors of 12 and 18 are 1, 2, 3, and 6.",
        "Negative numbers": "If the temperature is 3 degrees below zero, it is written as -3 degrees Celsius.",
        "Number line": "On a number line, -2 is left of 0, and 3 is right of 0.",
        "Comparing integers": "-1 is greater than -5 because -1 is closer to zero and lies to the right on the number line.",
        "Meaning of fractions": "If a roti is divided into 4 equal parts and you eat 1 part, you ate 1/4 of the roti.",
        "Equivalent fractions": "1/2, 2/4, and 3/6 are equivalent because they show the same amount.",
        "Comparing fractions": "3/4 is greater than 1/2 because three-fourths covers more of the same whole.",
        "Perimeter": "A rectangle with sides 6 cm and 4 cm has perimeter 6 + 4 + 6 + 4 = 20 cm.",
        "Area of rectangles": "A rectangle of length 5 cm and breadth 3 cm has area 5 x 3 = 15 square cm.",
        "Area of squares": "A square with side 4 cm has area 4 x 4 = 16 square cm.",
        "Bar graphs": "A bar graph can show how many students like cricket, football, badminton, and chess.",
        "Pictographs": "If one picture of a book means 5 books, then 4 pictures mean 20 books.",
        "Tables": "A table can show days of the week in one column and rainfall in another column.",
        "Collecting data": "A class can collect data by counting how many students come by bus, bicycle, walking, or car.",
        "Measuring angles": "A right angle measures 90 degrees, while a straight angle measures 180 degrees.",
        "Types of angles": "An angle smaller than 90 degrees is acute, and an angle greater than 90 degrees but less than 180 degrees is obtuse.",
        "Parallel and intersecting lines": "Railway tracks are an example of parallel lines; two roads crossing each other are intersecting lines.",
        "Drawing circles": "To draw a circle of radius 3 cm, set the compass to 3 cm and rotate it around the centre point.",
        "Line symmetry": "A rectangle has two lines of symmetry, while a circle has many lines of symmetry.",
        "Reflection": "The image seen in a mirror is a reflection.",
    },
    "Science": {
        "Plant diversity": "In a garden, coriander is a herb, rose is a shrub, mango is a tree, grapevine is a climber, and pumpkin is a creeper. These different plants show plant diversity.",
        "Poles of a magnet": "If a bar magnet is dipped in iron filings, most filings stick near the two ends because magnetic force is strongest at the poles.",
        "Attraction and repulsion": "The north pole of one magnet attracts the south pole of another, but two north poles repel each other.",
        "Magnetic materials": "An iron nail is attracted by a magnet, but a wooden pencil is not.",
        "Balanced diet": "A balanced meal may include rice or roti for energy, dal for protein, vegetables for vitamins and minerals, and water.",
        "Nutrients": "Carbohydrates give energy, proteins help growth and repair, and vitamins help protect the body.",
        "Evaporation": "Wet clothes dry because water slowly changes into water vapour.",
        "Condensation": "Water droplets form on the outside of a cold glass because water vapour in air condenses.",
        "Water cycle": "Water evaporates from rivers and seas, forms clouds, falls as rain, and returns to rivers and oceans.",
        "Filtration": "Tea leaves can be separated from tea using a strainer.",
        "Sieving": "A sieve can separate fine flour from larger impurities.",
        "Handpicking": "Stones can be removed from rice or pulses by handpicking.",
        "Thermometers": "A thermometer can show body temperature during fever.",
        "Soluble and insoluble": "Salt dissolves in water, but sand does not.",
        "States of water": "Ice is solid water, drinking water is liquid, and steam is water vapour.",
    },
    "Social Science": {
        "Latitudes": "The Equator is at 0 degrees latitude and divides Earth into the Northern and Southern Hemispheres.",
        "Longitudes": "The Prime Meridian is at 0 degrees longitude and helps measure east-west location.",
        "Continents": "Asia is the largest continent, and India is located in Asia.",
        "Oceans": "The Indian Ocean lies south of India and connects India with many countries through sea routes.",
        "Gram Sabha": "In a Gram Sabha, adult village members can discuss local needs such as roads, water, and school facilities.",
        "Panchayat": "A panchayat may help repair village roads, arrange drinking water, or improve sanitation.",
        "Municipality": "A municipality manages city services such as garbage collection, street lights, and public parks.",
        "Markets": "A vegetable market connects farmers, sellers, buyers, transport workers, and money exchange.",
    },
}

TOPIC_POINTS = {
    "Science": {
        "Plant diversity": [
            "Plants are different in size, shape, stem, leaves, flowers, fruits, seeds, and the places where they grow.",
            "Herbs are small plants with soft green stems, such as mint, coriander, grass, and wheat.",
            "Shrubs are bushy plants with many branches near the ground, such as rose, hibiscus, and cotton.",
            "Trees are tall plants with a thick woody trunk, such as mango, neem, banyan, and coconut.",
            "Climbers have weak stems and need support to grow upward, such as grapevine, money plant, and pea plant.",
            "Creepers have weak stems and spread on the ground, such as pumpkin, watermelon, and bottle gourd.",
            "Plants also grow in different habitats like deserts, ponds, mountains, forests, farms, and gardens.",
            "Plant diversity is useful because plants give food, oxygen, shade, wood, fibres, medicines, and shelter to many living beings.",
        ],
        "Animal diversity": [
            "Animals are different in size, body covering, food habits, movement, habitat, and body parts.",
            "Some animals live on land, such as cows, dogs, elephants, and ants.",
            "Some animals live in water, such as fish, prawns, whales, and crabs.",
            "Some animals fly, such as birds, butterflies, and bats.",
            "Animals move in different ways: fish swim, snakes crawl, birds fly, frogs jump, and humans walk.",
            "Animals eat different food: cows eat plants, lions eat animals, and bears can eat both plant and animal food.",
            "This diversity helps animals survive in different places and keep balance in nature.",
        ],
        "Living things": [
            "Living things need food, water, air, and a suitable place to live.",
            "They grow with time, like a seed becoming a plant or a baby becoming an adult.",
            "They respire, which means they use air to get energy from food.",
            "They respond to surroundings, such as a plant bending towards light or a person pulling away from heat.",
            "They reproduce, which means they produce young ones of their own kind.",
            "Plants, animals, humans, fungi, and tiny organisms are all living things.",
        ],
        "Grouping organisms": [
            "Grouping organisms means putting living things into groups based on similar features.",
            "Plants can be grouped as herbs, shrubs, trees, climbers, and creepers.",
            "Animals can be grouped by habitat, movement, food habits, body covering, or number of legs.",
            "Grouping makes it easier to study the huge variety of living things.",
            "For example, fish, whales, and prawns all live in water, but they are still different types of animals.",
        ],
        "Balanced diet": [
            "A balanced diet gives the body all nutrients in the right amount.",
            "Carbohydrates give energy for running, studying, and playing.",
            "Proteins help the body grow and repair muscles.",
            "Fats give stored energy but should not be eaten in excess.",
            "Vitamins and minerals protect the body and keep organs working well.",
            "Roughage helps digestion, and water helps transport substances inside the body.",
            "A balanced meal may include roti or rice, dal, vegetables, fruit, curd, and water.",
        ],
        "Nutrients": [
            "Nutrients are useful substances present in food.",
            "Carbohydrates and fats mainly give energy.",
            "Proteins help in growth and body repair.",
            "Vitamins and minerals protect us from diseases and keep body systems healthy.",
            "Roughage helps remove waste from the body.",
            "Water helps in digestion, temperature control, and movement of substances inside the body.",
        ],
        "Food choices": [
            "Food choices decide whether our body gets enough nutrients or not.",
            "Eating only chips, sweets, and cold drinks gives poor nutrition.",
            "Eating different foods like grains, pulses, milk, fruits, vegetables, nuts, and water gives better nutrition.",
            "Local and seasonal foods are often healthy and affordable.",
            "Good food choices help us grow, stay active, and avoid weakness or illness.",
        ],
        "Healthy habits": [
            "Healthy habits keep the body strong and protect us from disease.",
            "Wash hands before eating and after using the toilet.",
            "Eat a balanced diet and avoid too much junk food.",
            "Drink clean water and keep food covered.",
            "Exercise, play, sleep well, and keep the surroundings clean.",
        ],
        "Magnetic materials": [
            "Materials that are attracted by a magnet are called magnetic materials.",
            "Iron, nickel, and cobalt are common magnetic materials.",
            "Wood, plastic, rubber, paper, and glass are usually non-magnetic.",
            "A magnet can pull an iron nail but not a wooden pencil.",
            "This property helps us separate iron objects from a mixture.",
        ],
        "Poles of a magnet": [
            "Every magnet has two poles: north pole and south pole.",
            "The magnetic force is strongest near the poles.",
            "If iron filings are sprinkled near a bar magnet, more filings collect near the two ends.",
            "A freely suspended magnet points roughly in the north-south direction.",
            "Even if a magnet is broken, each piece gets its own north and south pole.",
        ],
        "Attraction and repulsion": [
            "Attraction means two objects pull towards each other.",
            "Repulsion means two objects push away from each other.",
            "Opposite magnetic poles attract: north attracts south.",
            "Same magnetic poles repel: north repels north and south repels south.",
            "This is why magnets can move each other without touching.",
        ],
        "Uses of magnets": [
            "Magnets are used in compass needles to find direction.",
            "They are used in fridge doors to keep them closed.",
            "They are used in speakers, headphones, toys, and electric bells.",
            "Strong magnets are used in cranes to lift iron scrap.",
            "Magnets are also used to separate magnetic materials from waste.",
        ],
        "States of water": [
            "Water has three states: solid, liquid, and gas.",
            "Ice is the solid state of water.",
            "The water we drink is the liquid state.",
            "Water vapour or steam is the gaseous state.",
            "Heating and cooling can change water from one state to another.",
        ],
        "Evaporation": [
            "Evaporation is the change of liquid water into water vapour.",
            "It happens from the surface of water.",
            "Wet clothes dry because water evaporates from them.",
            "Evaporation is faster in heat, wind, and larger exposed surface area.",
            "Evaporation helps in the water cycle and also cools surfaces.",
        ],
        "Condensation": [
            "Condensation is the change of water vapour into liquid water.",
            "It happens when water vapour cools down.",
            "Water drops on a cold glass are formed by condensation.",
            "Clouds form when water vapour in the air condenses into tiny droplets.",
            "Condensation is an important part of the water cycle.",
        ],
        "Water cycle": [
            "The water cycle is the continuous movement of water on Earth.",
            "Sunlight heats water in rivers, lakes, and seas, causing evaporation.",
            "Water vapour rises and cools to form clouds by condensation.",
            "Water falls back as rain, snow, or hail.",
            "Rainwater collects in rivers, lakes, oceans, and underground, and the cycle continues.",
        ],
        "Handpicking": [
            "Handpicking is used when unwanted materials are large and visible.",
            "Stones can be removed from rice, wheat, or pulses by hand.",
            "It is simple but useful only when the impurities are few and easy to see.",
            "It is commonly used at home before cooking grains or pulses.",
        ],
        "Sieving": [
            "Sieving separates particles of different sizes.",
            "A sieve has tiny holes that allow smaller particles to pass through.",
            "Flour can be separated from larger bran or impurities by sieving.",
            "At construction sites, sand is sieved to remove stones.",
        ],
        "Filtration": [
            "Filtration separates insoluble solids from liquids.",
            "The liquid passes through the filter, but solid particles stay behind.",
            "Tea leaves can be separated from tea using a strainer.",
            "Muddy water can be filtered to remove mud particles, though it may still need purification before drinking.",
        ],
        "Evaporation in separation": [
            "Evaporation can separate a dissolved solid from a liquid.",
            "When salt water is heated, water evaporates and salt is left behind.",
            "This method is used to obtain salt from seawater.",
            "It works when the solid does not evaporate easily with the liquid.",
        ],
        "Hot and cold": [
            "Hot and cold tell us about the temperature of an object or place.",
            "A hot object has a higher temperature than a cold object.",
            "Touch is not always safe or accurate for judging temperature.",
            "A thermometer gives a more reliable measurement.",
        ],
        "Thermometers": [
            "A thermometer is an instrument used to measure temperature.",
            "Clinical thermometers are used to measure body temperature.",
            "Laboratory thermometers are used in science activities.",
            "Temperature is commonly measured in degree Celsius.",
            "Thermometers should be handled carefully to avoid breakage or wrong readings.",
        ],
        "Reading temperature": [
            "To read temperature, look at the scale and the level shown by the thermometer.",
            "The unit is usually degree Celsius.",
            "The thermometer should be kept correctly in contact with the object or body part.",
            "The reading should be taken at eye level to avoid mistakes.",
        ],
        "Safety while measuring": [
            "Do not touch very hot objects directly while measuring temperature.",
            "Handle glass thermometers carefully so they do not break.",
            "Do not use a laboratory thermometer for checking body temperature.",
            "Ask an adult or teacher before measuring hot liquids or flames.",
        ],
        "Measuring length": [
            "Length tells how long or short something is.",
            "It is measured using a ruler, measuring tape, metre scale, or other tools.",
            "Common units are millimetre, centimetre, metre, and kilometre.",
            "The scale should be placed straight along the object.",
            "The reading should start from zero or be adjusted if zero is damaged.",
        ],
        "Standard units": [
            "Standard units are fixed units used by everyone.",
            "They avoid confusion in measurement.",
            "For length, standard units include centimetre, metre, and kilometre.",
            "For example, if everyone uses metres, the measurement is understood clearly everywhere.",
        ],
        "Types of motion": [
            "Motion means a change in position with time.",
            "Straight-line motion is seen when a car moves on a straight road.",
            "Circular motion is seen when a fan blade or wheel rotates.",
            "Periodic motion repeats after equal time intervals, like a swing moving back and forth.",
            "Many objects show more than one type of motion.",
        ],
        "Distance and movement": [
            "Distance tells how far an object has moved.",
            "Movement means changing position from one place to another.",
            "A student walking from home to school covers a distance.",
            "Distance can be measured in metre or kilometre.",
        ],
        "Properties of materials": [
            "Materials have different properties such as hardness, shine, transparency, solubility, and magnetism.",
            "A material may be hard like stone or soft like cotton.",
            "Some materials are transparent like glass, while others are opaque like wood.",
            "Properties help us choose the right material for a job.",
        ],
        "Grouping materials": [
            "Materials can be grouped based on common properties.",
            "Objects can be grouped as hard or soft, soluble or insoluble, transparent or opaque, magnetic or non-magnetic.",
            "Grouping helps us compare materials and understand their uses.",
            "For example, glass is used for windows because it is transparent.",
        ],
        "Soluble and insoluble": [
            "A soluble substance dissolves in water.",
            "Salt and sugar are soluble in water.",
            "An insoluble substance does not dissolve in water.",
            "Sand and oil are insoluble in water.",
            "This property helps in separating and using materials.",
        ],
        "Uses of materials": [
            "Materials are selected according to their properties.",
            "Wood is used for furniture because it is strong and workable.",
            "Glass is used for windows because it is transparent.",
            "Plastic is used in many containers because it is light and waterproof.",
            "Iron is used in tools and machines because it is strong.",
        ],
        "Natural resources": [
            "Natural resources are useful things we get from nature.",
            "Air, water, soil, forests, minerals, sunlight, and wildlife are natural resources.",
            "Humans use them for food, shelter, energy, farming, transport, and industries.",
            "If resources are wasted, future generations may face shortages.",
        ],
        "Air and water": [
            "Air is needed for breathing and burning.",
            "Water is needed for drinking, cooking, farming, cleaning, and many industries.",
            "Plants and animals cannot survive without air and water.",
            "Pollution makes air and water unsafe, so they must be protected.",
        ],
        "Soil and minerals": [
            "Soil helps plants grow and supports farming.",
            "Soil contains minerals, humus, air, and water.",
            "Minerals are useful substances found in rocks and the ground.",
            "Minerals are used to make tools, machines, buildings, and many products.",
        ],
        "Conservation": [
            "Conservation means using resources carefully and avoiding waste.",
            "We can save water by closing taps and reusing water when possible.",
            "We can protect soil by planting trees and avoiding careless cutting of forests.",
            "Conservation keeps resources available for humans, animals, plants, and future generations.",
        ],
        "Sun and planets": [
            "The Sun is a star and the main source of light and heat for Earth.",
            "Planets are large bodies that revolve around the Sun.",
            "Earth is the planet on which we live.",
            "The Sun and planets are part of the solar system.",
        ],
        "Moon": [
            "The Moon is Earth's natural satellite.",
            "It does not produce its own light; it reflects sunlight.",
            "The Moon appears to change shape because we see different portions of its lit side.",
            "The Moon affects tides and has been visited by space missions.",
        ],
        "Stars": [
            "Stars are huge balls of hot gases.",
            "They give out their own light and heat.",
            "The Sun is the nearest star to Earth.",
            "Stars look small because they are very far away.",
        ],
        "Space exploration": [
            "Space exploration means studying space using rockets, satellites, probes, telescopes, and astronauts.",
            "Satellites help in weather reports, communication, maps, and disaster warning.",
            "Space missions help us learn about the Moon, planets, stars, and Earth.",
            "India has sent important missions such as Chandrayaan and Mangalyaan.",
        ],
        "Science around us": [
            "Science is present in everyday life, not only in laboratories.",
            "Cooking, growing plants, using electricity, magnets, transport, medicines, and weather all involve science.",
            "Science helps us ask questions and find reasons.",
            "It helps us solve problems and make useful tools.",
        ],
        "Observation": [
            "Observation means noticing details carefully using senses or tools.",
            "We can observe colour, shape, size, smell, sound, movement, and changes.",
            "A hand lens, ruler, thermometer, or magnet can improve observation.",
            "Good observation helps us ask better questions and make correct conclusions.",
        ],
        "Asking questions": [
            "Questions help us begin scientific investigation.",
            "A good question asks what, why, how, when, or where something happens.",
            "For example: Why do wet clothes dry faster in sunlight?",
            "Questions lead to observations, activities, experiments, and explanations.",
        ],
        "Scientific thinking": [
            "Scientific thinking means using observation, evidence, and reasoning.",
            "It avoids guessing without proof.",
            "A scientific thinker asks questions, tests ideas, compares results, and changes conclusions if evidence changes.",
            "This habit helps us understand the world more correctly.",
        ],
        "Characteristics of living things": [
            "Living things need food, water, and air.",
            "They grow, respire, respond to surroundings, and reproduce.",
            "Animals usually show quick movement, while plants show slow movements.",
            "Living things have life processes that non-living things do not have.",
        ],
        "Growth": [
            "Growth means increase in size or body parts over time.",
            "A baby grows into an adult, and a seed grows into a plant.",
            "Living things grow because their bodies make new cells.",
            "Proper food, water, air, and care help growth.",
        ],
        "Movement": [
            "Movement means change in position or posture.",
            "Animals can move from one place to another for food, shelter, and safety.",
            "Plants also show movement, such as a shoot bending towards light.",
            "Different animals move differently: fish swim, birds fly, snakes crawl, and humans walk.",
        ],
        "Response to surroundings": [
            "Living things react to changes around them.",
            "A plant may bend towards light.",
            "We pull our hand away from a hot object.",
            "Animals may run away when they sense danger.",
            "This response helps living things survive.",
        ],
    },
}

TOPIC_OVERRIDES = {
    ("Social Science", "Mountains"): {
        "intro": "Mountains are very high landforms that rise steeply above the surrounding land. They usually have slopes, peaks, valleys, forests, rivers, and colder climate at higher places.",
        "ncert": "In Landforms and Life, mountains are explained as landforms that strongly affect how people live. Mountain regions often have thin soil, steep slopes, snowfall or heavy rain, and difficult transport. At the same time, they are important because many rivers begin in mountains, forests grow there, and people depend on farming, herding, tourism, and forest products.",
        "easy": "A mountain is like a huge raised part of land. Life in mountains is different from plains because roads are winding, farms are often made on steps called terraces, houses may have sloping roofs, and people adjust their food, clothes, work, and travel to the climate and slope.",
        "steps": [
            "Mountains rise much higher than nearby land and often have peaks.",
            "The slope of a mountain makes farming and road building difficult.",
            "Many people use terrace farming so rainwater does not wash away soil quickly.",
            "Mountain climate is usually cooler than nearby lowlands.",
            "Forests, herbs, fruits, tourism, wool, and river water are important resources in mountain areas.",
            "Because movement is difficult, mountain communities often develop special houses, food habits, clothing, and occupations."
        ],
        "keywords": [
            ("Mountain", "A high landform with steep slopes and a peak."),
            ("Peak", "The top or highest point of a mountain."),
            ("Valley", "Low land between mountains or hills."),
            ("Terrace farming", "Farming on step-like fields cut into mountain slopes."),
            ("Slope", "Land that rises or falls at an angle.")
        ],
        "example": "In the Himalayan region, people often build houses with sloping roofs so snow or rain can slide down. Farmers may grow crops on terraces, and many people earn through fruit growing, wool, tourism, or guiding travellers.",
        "diagram": "High peak -> Steep slope -> Valley -> River begins -> Forests and terrace farms -> Mountain settlements",
        "summary": [
            "Mountains are high landforms with steep slopes and peaks.",
            "They affect climate, farming, transport, houses, and occupations.",
            "Many rivers begin in mountains because snow and rainwater flow down as streams.",
            "Terrace farming helps people grow crops on slopes.",
            "Mountain life is difficult in some ways, but mountains provide water, forests, tourism, and natural beauty."
        ],
    },
    ("Social Science", "Plateaus"): {
        "intro": "Plateaus are highlands with broad, flat tops. They are higher than nearby land but usually flatter on top than mountains.",
        "ncert": "In Landforms and Life, plateaus are studied as landforms where height, rocks, minerals, soil, and rainfall shape human life. Many plateaus have mineral resources, forests, waterfalls, and farming areas.",
        "easy": "A plateau is like a tableland: it is raised land, but the top is mostly flat. People may live, farm, mine, and build towns on plateaus depending on water and soil.",
        "steps": [
            "A plateau is raised land with a mostly flat top.",
            "Some plateaus are formed by lava, earth movements, or erosion.",
            "Plateau regions may have minerals such as iron, coal, or manganese.",
            "Waterfalls often form where rivers drop from plateau edges.",
            "Farming depends on soil, rainfall, and availability of water.",
            "People may work in farming, mining, forestry, industries, and services."
        ],
        "keywords": [("Plateau", "A raised area of land with a broad flat top."), ("Mineral", "A useful natural substance found in rocks."), ("Waterfall", "A place where river water falls from a height."), ("Tableland", "Another name for a plateau because its top is flat like a table.")],
        "example": "The Deccan Plateau in India has black soil in many places, mineral resources, farms, towns, and industries. Rivers flowing across plateau edges can form waterfalls.",
        "diagram": "Raised flat top -> Plateau edge -> River drop -> Waterfall -> Farms/mines/settlements",
        "summary": ["Plateaus are raised flat-topped landforms.", "They may contain minerals and forests.", "Rivers can form waterfalls at plateau edges.", "Human life on plateaus depends on water, soil, rocks, and transport.", "Plateaus can support farming, mining, and industries."],
    },
    ("Social Science", "Plains"): {
        "intro": "Plains are broad, low, and mostly flat areas of land. They are often found near rivers and are usually good for farming and settlement.",
        "ncert": "In Landforms and Life, plains are connected with agriculture, transport, cities, trade, and dense population. River plains are fertile because rivers deposit fine soil called alluvium.",
        "easy": "A plain is flat land where it is easier to build houses, roads, railways, farms, and markets. This is why many villages, towns, and big cities grow on plains.",
        "steps": [
            "Plains are flat or gently rolling landforms.",
            "River plains become fertile when rivers deposit alluvial soil.",
            "Flat land makes farming easier than steep mountain slopes.",
            "Roads, railways, canals, and buildings are easier to construct on plains.",
            "Many plains have dense population because farming, transport, and jobs are easier.",
            "Floods can also occur in river plains, so people need protection and planning."
        ],
        "keywords": [("Plain", "A broad and mostly flat landform."), ("Alluvium", "Fine soil deposited by rivers."), ("Fertile", "Good for growing crops."), ("Floodplain", "Flat land near a river that may get flooded.")],
        "example": "The Northern Plains of India are fertile because rivers such as the Ganga and its tributaries deposit alluvial soil. Many farms, towns, and transport routes are found there.",
        "diagram": "River -> Alluvial soil -> Fertile plain -> Farms -> Villages/towns -> Roads and markets",
        "summary": ["Plains are broad and mostly flat lands.", "River plains are often fertile.", "Flat land supports farming, transport, buildings, and markets.", "Many people live on plains because work and travel are easier.", "Flooding is a common challenge in some plains."],
    },
}

TOPIC_FACTS = {
    "Maths": {
        "Number patterns": "Number patterns are sequences of numbers that follow a rule, such as adding the same number, multiplying, or alternating values.",
        "Shape patterns": "Shape patterns repeat or grow using shapes, colours, directions, or positions according to a rule.",
        "Growing patterns": "Growing patterns increase step by step, so each new figure or number is made by adding a fixed or changing part.",
        "Pattern rules": "A pattern rule explains how to get the next term or figure in a pattern.",
        "Points and lines": "A point shows an exact position, while a line is a straight path that extends in both directions.",
        "Types of angles": "Angles are formed when two rays meet; they can be acute, right, obtuse, straight, or reflex.",
        "Measuring angles": "Angles are measured in degrees using a protractor.",
        "Parallel and intersecting lines": "Parallel lines never meet, while intersecting lines meet at a point.",
        "Large numbers": "Large numbers are read and written using place value, periods, and commas.",
        "Number games": "Number games use operations, patterns, factors, and logical thinking to understand numbers better.",
        "Estimation": "Estimation means finding an approximate answer that is close to the actual value.",
        "Place value patterns": "Place value patterns show that each place is ten times the value of the place to its right.",
        "Collecting data": "Collecting data means gathering information by counting, observing, measuring, or asking questions.",
        "Tables": "Tables arrange data in rows and columns so it becomes easy to read and compare.",
        "Pictographs": "Pictographs use pictures or symbols to represent data.",
        "Bar graphs": "Bar graphs use bars of different lengths to compare quantities.",
        "Factors and multiples": "Factors divide a number exactly, while multiples are products of a number with counting numbers.",
        "Prime numbers": "Prime numbers have exactly two factors: 1 and the number itself.",
        "Composite numbers": "Composite numbers have more than two factors.",
        "Common factors": "Common factors are factors shared by two or more numbers.",
        "Perimeter": "Perimeter is the total distance around the boundary of a shape.",
        "Area of rectangles": "The area of a rectangle is found by multiplying its length and breadth.",
        "Area of squares": "The area of a square is found by multiplying side by side.",
        "Real-life measurement": "Real-life measurement is used to measure length, area, time, mass, capacity, and distance in daily life.",
        "Meaning of fractions": "A fraction shows a part of a whole or a part of a collection.",
        "Equivalent fractions": "Equivalent fractions have the same value even if their numerators and denominators are different.",
        "Comparing fractions": "Fractions can be compared by using the same denominator, number line, or visual models.",
        "Fractions in daily life": "Fractions are used while sharing food, measuring ingredients, reading time, and dividing things equally.",
        "Using ruler and compass": "A ruler helps draw straight lines, while a compass helps draw circles and arcs.",
        "Drawing circles": "A circle is drawn by fixing the compass point at the centre and rotating the pencil around it.",
        "Constructing angles": "Angles can be constructed using a protractor, ruler, and compass methods.",
        "Geometric designs": "Geometric designs are made by repeating lines, angles, circles, and shapes in a planned way.",
        "Line symmetry": "Line symmetry means one half of a figure is the mirror image of the other half.",
        "Symmetric shapes": "Symmetric shapes can be folded along a line so both halves match.",
        "Reflection": "Reflection shows a mirror image of a shape or object.",
        "Symmetry in nature": "Symmetry is seen in leaves, flowers, butterflies, shells, and many living things.",
        "Negative numbers": "Negative numbers are numbers less than zero and are written with a minus sign.",
        "Number line": "A number line shows numbers in order, with positive numbers to the right and negative numbers to the left of zero.",
        "Comparing integers": "Integers are compared by their position on the number line; numbers to the right are greater.",
        "Integers in real life": "Integers are used for temperature below zero, debts, floors below ground, and gains or losses.",
    },
    "Science": {
        "Science around us": "Science is present in daily activities such as cooking, moving, breathing, growing plants, using magnets, and observing the sky.",
        "Observation": "Observation means using senses and tools to notice details carefully.",
        "Asking questions": "Asking questions is the beginning of scientific thinking because it helps us investigate why and how things happen.",
        "Scientific thinking": "Scientific thinking uses observation, evidence, testing, and reasoning before accepting an answer.",
        "Living things": "Living things grow, need food, respire, respond to surroundings, reproduce, and show movement.",
        "Plant diversity": "Plant diversity means the variety of plants around us, including herbs, shrubs, trees, climbers, and creepers.",
        "Animal diversity": "Animal diversity means the variety of animals with different body parts, habitats, food habits, and movements.",
        "Grouping organisms": "Grouping organisms means classifying living things using common features.",
        "Balanced diet": "A balanced diet contains carbohydrates, proteins, fats, vitamins, minerals, roughage, and water in proper amounts.",
        "Nutrients": "Nutrients are useful substances in food that give energy, help growth, repair the body, and protect from disease.",
        "Food choices": "Food choices affect health because different foods provide different nutrients.",
        "Healthy habits": "Healthy habits include eating balanced food, drinking clean water, washing hands, exercising, and resting properly.",
        "Magnetic materials": "Magnetic materials such as iron, nickel, and cobalt are attracted by magnets.",
        "Poles of a magnet": "Every magnet has two poles, north and south, where magnetic force is strongest.",
        "Attraction and repulsion": "Unlike poles attract each other, while like poles repel each other.",
        "Uses of magnets": "Magnets are used in compasses, fridge doors, speakers, cranes, toys, and many machines.",
        "Measuring length": "Length is measured using standard units such as millimetre, centimetre, metre, and kilometre.",
        "Standard units": "Standard units make measurement uniform so everyone understands the same quantity.",
        "Types of motion": "Motion can be straight, circular, rotational, periodic, or a combination of different motions.",
        "Distance and movement": "Distance tells how far an object has moved from one place to another.",
        "Properties of materials": "Materials have properties such as hardness, transparency, texture, solubility, floatation, and magnetism.",
        "Grouping materials": "Materials are grouped by similarities and differences in their properties.",
        "Soluble and insoluble": "Soluble substances dissolve in water, while insoluble substances do not dissolve.",
        "Uses of materials": "Materials are chosen for uses based on their properties, such as strength, flexibility, transparency, or waterproof nature.",
        "Hot and cold": "Hot and cold describe temperature, which tells how warm or cool something is.",
        "Thermometers": "Thermometers are instruments used to measure temperature.",
        "Reading temperature": "Temperature is read from the scale of a thermometer, usually in degree Celsius.",
        "Safety while measuring": "Safety while measuring temperature means handling thermometers carefully and avoiding very hot or cold objects.",
        "States of water": "Water exists as solid ice, liquid water, and water vapour.",
        "Evaporation": "Evaporation is the change of liquid water into water vapour.",
        "Condensation": "Condensation is the change of water vapour into liquid water droplets.",
        "Water cycle": "The water cycle is the continuous movement of water through evaporation, condensation, clouds, rainfall, and collection.",
        "Handpicking": "Handpicking separates large visible impurities or useful parts by hand.",
        "Sieving": "Sieving separates particles of different sizes using a sieve.",
        "Filtration": "Filtration separates insoluble solid particles from a liquid using a filter.",
        "Evaporation in separation": "Evaporation separates a dissolved solid from a liquid by changing the liquid into vapour.",
        "Characteristics of living things": "Living things show life processes such as growth, nutrition, respiration, movement, response, and reproduction.",
        "Growth": "Growth is the increase in size, mass, or number of cells in living things.",
        "Movement": "Movement is a change in position or posture; animals move from place to place, while plants show slower movements.",
        "Response to surroundings": "Living things respond to light, touch, temperature, water, sound, and other changes around them.",
        "Natural resources": "Natural resources are things from nature that humans use, such as air, water, soil, forests, minerals, and sunlight.",
        "Air and water": "Air and water are essential natural resources needed for life.",
        "Soil and minerals": "Soil supports plants and farming, while minerals are useful substances found in rocks.",
        "Conservation": "Conservation means using natural resources carefully so they remain available in the future.",
        "Sun and planets": "The Sun is a star at the centre of our solar system, and planets revolve around it.",
        "Moon": "The Moon is Earth's natural satellite and reflects sunlight.",
        "Stars": "Stars are huge balls of hot gases that give out light and heat.",
        "Space exploration": "Space exploration uses rockets, satellites, probes, and astronauts to study space beyond Earth.",
    },
    "Social Science": {
        "Maps and globes": "Maps are flat drawings of places, while globes are spherical models of Earth.",
        "Latitudes": "Latitudes are imaginary lines running east-west that help locate places north or south of the Equator.",
        "Longitudes": "Longitudes are imaginary lines running north-south that help locate places east or west of the Prime Meridian.",
        "Finding locations": "Locations are found by using directions, symbols, latitude, longitude, and map scale.",
        "Continents": "Continents are large landmasses on Earth, such as Asia, Africa, Europe, and others.",
        "Oceans": "Oceans are huge bodies of salt water covering most of Earth.",
        "India and the world": "India is part of Asia and is connected with the world through land, oceans, trade, culture, and history.",
        "Earth's surface": "Earth's surface is made of landforms, water bodies, forests, deserts, settlements, and many natural features.",
        "Life and landforms": "Landforms influence climate, farming, transport, houses, occupations, and settlement patterns.",
        "Timelines": "Timelines arrange events in the order in which they happened.",
        "Historical sources": "Historical sources are objects, writings, buildings, coins, inscriptions, and oral accounts that tell us about the past.",
        "Archaeology": "Archaeology studies past human life through remains such as tools, pottery, buildings, and bones.",
        "Understanding the past": "The past is understood by studying sources, asking questions, comparing evidence, and arranging events in time.",
        "Names of India": "India has been known by names such as Bharat and India in different texts and contexts.",
        "Bharat in texts": "The name Bharat appears in ancient texts, traditions, and cultural memory.",
        "Unity of India": "Unity of India means people with different languages, regions, foods, and customs still share a common national identity.",
        "Cultural identity": "Cultural identity includes language, customs, festivals, art, beliefs, food, and shared memories.",
        "Early settlements": "Early settlements grew where people found water, fertile land, resources, and safety.",
        "Sindhu-Sarasvati civilisation": "The Sindhu-Sarasvati civilisation had planned cities, drainage, crafts, trade, and agriculture.",
        "Cities and crafts": "Ancient cities had skilled craftspeople who made pottery, beads, tools, seals, and other goods.",
        "Trade and life": "Trade connected people and places through exchange of goods, ideas, and skills.",
        "Knowledge traditions": "India's knowledge traditions include learning in language, mathematics, astronomy, medicine, philosophy, and arts.",
        "Values": "Values are principles such as respect, truthfulness, cooperation, care, and responsibility.",
        "Literature and learning": "Literature and learning preserve stories, ideas, knowledge, language, and cultural memory.",
        "Cultural continuity": "Cultural continuity means traditions and ideas continuing across generations with changes over time.",
        "Diversity": "Diversity means differences in language, food, dress, festivals, beliefs, and lifestyles.",
        "Festivals and languages": "Festivals and languages show the variety of Indian culture and regional life.",
        "Shared traditions": "Shared traditions are customs, stories, values, and practices that many communities recognise.",
        "National unity": "National unity means people remain connected as one nation despite many differences.",
        "Family roles": "Family roles include care, support, work sharing, learning values, and helping one another.",
        "Community life": "Community life means people living and working together in neighbourhoods, villages, towns, or groups.",
        "Cooperation": "Cooperation means working together to solve problems or complete tasks.",
        "Responsibilities": "Responsibilities are duties people perform for family, school, community, and society.",
        "Meaning of governance": "Governance means making rules, taking decisions, and managing public services for people.",
        "Rules and decisions": "Rules and decisions help organise society and solve common problems.",
        "Public services": "Public services include water, roads, schools, health centres, sanitation, and transport.",
        "Democracy basics": "Democracy means people participate in decision-making directly or through elected representatives.",
        "Gram Sabha": "Gram Sabha is a meeting of adult village members where local issues are discussed.",
        "Panchayat": "Panchayat is an elected local body that works for village development.",
        "Village development": "Village development includes roads, water, sanitation, education, health, and livelihood improvements.",
        "Local participation": "Local participation means people taking part in decisions and work related to their area.",
        "Municipality": "Municipality is an urban local body that manages services in towns and cities.",
        "City services": "City services include water supply, waste management, roads, street lights, parks, and health facilities.",
        "Urban problems": "Urban problems include traffic, pollution, waste, water shortage, housing issues, and crowding.",
        "Citizen role": "Citizens help cities by following rules, voting, paying taxes, keeping surroundings clean, and reporting problems.",
        "Types of work": "Types of work include farming, services, manufacturing, household work, care work, and professional work.",
        "Dignity of labour": "Dignity of labour means every honest form of work deserves respect.",
        "Paid and unpaid work": "Paid work earns money, while unpaid work such as care and household work also has value.",
        "Helping society": "Work helps society by producing goods, giving services, caring for people, and solving needs.",
        "Needs and wants": "Needs are essential things like food, water, shelter, and clothing; wants are things people desire beyond basic needs.",
        "Production": "Production means making goods or providing services using resources, labour, tools, and knowledge.",
        "Services": "Services are useful activities done for others, such as teaching, transport, healthcare, and repair.",
        "Markets": "Markets are places or systems where buyers and sellers exchange goods and services.",
    },
    "English": {
        "A Bottle of Dew": "A Bottle of Dew is a story that teaches clever thinking, hard work, and learning through experience rather than blind belief.",
        "The Raven and the Fox": "The Raven and the Fox is a fable about flattery, pride, and how foolishness can make someone lose what they have.",
        "Rama to the Rescue": "Rama to the Rescue is a folk-style story where alertness, courage, and quick action help solve a problem.",
        "Moral and message": "The moral and message of a text is the lesson or value the reader understands from the story or poem.",
        "The Unlikely Best Friends": "The Unlikely Best Friends shows that friendship can grow between very different people or animals through trust and kindness.",
        "A Friend's Prayer": "A Friend's Prayer expresses the wish to be a true, caring, and helpful friend.",
        "The Chair": "The Chair shows that real friendship is proved through support, loyalty, and action, not only words.",
        "Qualities of friendship": "Qualities of friendship include trust, care, loyalty, sharing, honesty, and standing by each other.",
        "Neem Baba": "Neem Baba presents the neem tree as useful and valuable because its parts are connected with health, shade, and daily life.",
        "What a Bird Thought": "What a Bird Thought is a poem about how a bird slowly understands the world outside its nest and shell.",
        "Spices that Heal Us": "Spices that Heal Us explains how common Indian spices can have health benefits and traditional uses.",
        "Nature and health": "Nature and health are connected because plants, trees, herbs, clean air, and balanced living support well-being.",
        "Change of Heart": "Change of Heart shows how a person's attitude can change through experience, reflection, or sportsmanship.",
        "The Winner": "The Winner highlights play, effort, joy, and the spirit of taking part in games.",
        "Yoga - A Way of Life": "Yoga is presented as a way to keep the body and mind healthy through posture, breathing, discipline, and balance.",
        "Health and sportsmanship": "Health and sportsmanship include fitness, fair play, respect for others, teamwork, and accepting wins or losses gracefully.",
        "Hamara Bharat - Incredible India": "Hamara Bharat - Incredible India celebrates India's diversity in geography, culture, languages, festivals, and traditions.",
        "The Kites": "The Kites presents the joy, movement, colour, and imagination connected with flying kites.",
        "Ila Sachani": "Ila Sachani's story highlights courage, skill, determination, and overcoming difficulty through art and effort.",
        "National War Memorial": "The National War Memorial honours soldiers who sacrificed their lives for the nation.",
    },
    "Hindi": {
        "Kavita ka bhav": "Kavita ka bhav kavita mein chhipe mukhya anubhav, kalpana, aur sandesh ko batata hai.",
        "Desh prem": "Desh prem ka matlab apne desh ke prati samman, lagav, kartavya aur garv ki bhavana hai.",
        "Pushp ki Abhilasha": "Pushp ki Abhilasha mein phool apne jeevan ko desh seva aur balidan ke liye samarpit karna chahta hai.",
        "Shabdarth": "Shabdarth mushkil ya mahatvapurn shabdon ke saral arth ko samjhata hai.",
        "Sansmaran": "Sansmaran kisi vyakti ke apne anubhav, yaadon ya ghatnaon ka likhit varnan hota hai.",
        "Khel aur anubhav": "Khel aur anubhav batate hain ki khel se seekh, anushasan, utsah aur jeevan ke sabak milte hain.",
        "Ek daud aisi bhi": "Ek daud aisi bhi mehnat, himmat, prerna aur jeet-haar se judi seekh ko dikhati hai.",
        "Prashn uttar": "Prashn uttar path ko samajhkar apne shabdon mein spasht jawab dene ka abhyas hai.",
        "Kavita path": "Kavita path mein lay, bhav, uchcharan aur kavita ke sandesh ko samajhna hota hai.",
        "Prakriti varnan": "Prakriti varnan mein ped, paani, badal, varsha, pawan, parvat, nadi aur prakriti ke saundarya ka varnan hota hai.",
        "Varsha ka mahatva": "Varsha paani deti hai, kheti mein madad karti hai, prakriti ko hara-bhara banati hai aur jeevan ke liye zaruri hai.",
        "Bhavarth": "Bhavarth ka matlab kavita ya path ki panktiyon ka saral bhav samjhana hai.",
        "Kahani path": "Kahani path mein patra, ghatna, sthal, samasya, samadhan aur sandesh ko samjha jata hai.",
        "Patra aur ghatna": "Patra kahani ke log hote hain aur ghatna kahani mein hone wali mahatvapurn baat hoti hai.",
        "Naitik sandesh": "Naitik sandesh kahani se milne wali achchi seekh ya moolya hota hai.",
        "Doha path": "Doha path mein chhoti do-panktiyon se gahra jeevan sandesh samjha jata hai.",
        "Arth": "Arth kisi shabd, vaakya, pankti ya vichar ka matlab hota hai.",
        "Jeevan moolya": "Jeevan moolya sachchai, vinamrata, daya, mehnat, samman aur sahyog jaise achche gun hain.",
        "Udaharan": "Udaharan kisi baat ko samjhane ke liye diya gaya saral example hota hai.",
        "Atmakatha": "Atmakatha mein vyakti apne jeevan, anubhav aur yaadon ko khud batata hai.",
        "Maa ka prem": "Maa ka prem nishwarth dekhbhal, suraksha, mamta aur sahara dene ki bhavana hai.",
        "Yaadein": "Yaadein purane anubhavon aur ghatnaon ko man mein dobara jagati hain.",
        "Kavita ka sandesh": "Kavita ka sandesh wahi mukhya baat hai jo kavi pathak tak pahunchana chahta hai.",
        "Prerna": "Prerna kisi achche kaam, mehnat, himmat ya badlav ke liye utsahit karti hai.",
        "Deepak ka pratik": "Deepak prakash, gyaan, aasha, margdarshan aur andhkaar door karne ka pratik hai.",
        "Nritya parampara": "Nritya parampara kisi kshetra ki kala, sangeet, veshbhusha aur sanskritik pehchan se judi hoti hai.",
        "Assam ki sanskriti": "Assam ki sanskriti mein Bihu, Sattriya nritya, lok kala, sangeet, vastra aur paramparaen shamil hain.",
        "Kala aur abhyas": "Kala aur abhyas dikhate hain ki lagatar mehnat se kaushal nikharte hain.",
        "Pad path": "Pad path mein bhakti, bhav, lay aur kavya ki panktiyon ka arth samjha jata hai.",
        "Krishna leela": "Krishna leela Bhagwan Krishna ke bachpan, natkhatpan, prem aur bhakti se judi kathaon ko batati hai.",
        "Bhakti bhav": "Bhakti bhav mein prem, shraddha, samarpan aur ishwar ke prati lagav hota hai.",
        "Imaandari": "Imaandari sach bolne, sahi kaam karne aur dhokha na dene ka gun hai.",
        "Mehnat": "Mehnat lagatar prayas aur parishram hai jo safalta ka mahatvapurn aadhaar hai.",
        "Chetak ka sahas": "Chetak ka sahas wafadari, veerta aur apne swami ke prati samarpan ko dikhata hai.",
        "Maharana Pratap": "Maharana Pratap apni veerta, swabhiman aur Mewar ki raksha ke liye jane jate hain.",
        "Yatra vrittant": "Yatra vrittant kisi yatra ke anubhav, sthanon, logon aur drishyon ka varnan hota hai.",
        "Pravasi Bharatiya": "Pravasi Bharatiya ve log hain jo Bharat se bahar rehte hue bhi Bharatiya sanskriti se jude rehte hain.",
        "Hind Mahasagar": "Hind Mahasagar Bharat ke dakshin mein sthit vishal mahasagar hai jo vyapar, yatra aur sanskritik sampark se juda hai.",
        "Prakriti sandesh": "Prakriti sandesh hume ped-paudhon, jal, hawa, praniyon aur paryavaran ki raksha karna sikhata hai.",
        "Vriksh ka mahatva": "Vriksh oxygen, chhaya, phal, lakdi, mitti ki raksha aur jeev-jantuon ko aashray dete hain.",
        "Paryavaran": "Paryavaran humare charon or ka prakritik aur samajik vatavaran hai.",
    },
}


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")


def content_id(subject: str, chapter: str, topic: str) -> str:
    return slug(f"class_6_CBSE_{subject}_{chapter}_{topic}")


def override(subject: str, topic: str) -> dict | None:
    return TOPIC_OVERRIDES.get((subject, topic))


def topic_fact(subject: str, topic: str) -> str:
    custom = override(subject, topic)
    if custom:
        return custom["intro"]
    return TOPIC_FACTS.get(subject, {}).get(topic, f"{topic} is an important concept from this chapter.")


def subject_intro(subject: str, chapter: str, topic: str) -> str:
    custom = override(subject, topic)
    if custom:
        return custom["intro"]
    fact = topic_fact(subject, topic)
    if subject == "Maths":
        return fact
    if subject == "Science":
        return fact
    if subject == "Social Science":
        return fact
    if subject == "English":
        return fact
    return fact


def ncert_explanation(subject: str, chapter: str, topic: str) -> str:
    custom = override(subject, topic)
    if custom:
        return custom["ncert"]
    label = SUBJECT_LABELS[subject]
    fact = topic_fact(subject, topic)
    if subject == "Maths":
        return f"In {label}, {topic} is taught through patterns, activities, examples, and problems from {chapter}. Main idea: {fact} The chapter helps students move from seeing the idea to using it in questions."
    if subject == "Science":
        return f"In {label}, {topic} is explained through observation, activities, and daily-life examples in {chapter}. Main idea: {fact} The lesson connects this concept with things students can see, test, classify, measure, or reason about."
    if subject == "Social Science":
        return f"In {label}, {topic} is explained as a real-world idea from {chapter}. Main idea: {fact} The chapter connects this idea with places, people, resources, maps, history, governance, culture, or economic life."
    if subject == "English":
        return f"In {label}, {topic} is connected with the unit {chapter}. Main idea: {fact} The lesson focuses on understanding the text, important words, feelings, characters or ideas, and the message."
    return f"{label} mein {topic}, {chapter} se juda hai. Mukhya baat: {fact} Isme bhav, sandesh, shabdarth, aur path ki mahatvapurn baaton ko saral roop se samjha jata hai."


def simplified_explanation(subject: str, topic: str) -> str:
    custom = override(subject, topic)
    if custom:
        return custom["easy"]
    points = TOPIC_POINTS.get(subject, {}).get(topic, [])
    example = TOPIC_EXAMPLES.get(subject, {}).get(topic)
    first_point = points[0] if points else None
    if subject == "Maths":
        if example:
            return f"Use one small example to see the idea clearly. {example} After that, the same rule can be used in similar questions."
        return f"Think of {topic} as a small rule you can test with easy numbers or a simple drawing first. After one example is clear, bigger questions become easier."
    if subject == "Science":
        if first_point:
            return f"Imagine looking at this topic in your home, garden, classroom, or playground. {first_point} This makes the idea easy because you can see it in real life, not only in the textbook."
        if example:
            return f"Think about a simple observation from daily life. {example} That observation helps explain the science idea."
        return f"Think about {topic} as something you can observe in daily life. Look for what changes, what stays the same, and why it happens."
    if subject == "Social Science":
        if example:
            return f"Connect it with a real place or public life example. {example} This makes the chapter easier because Social Science is about real people, places, and work."
        return f"Think of {topic} as something connected with maps, villages, cities, families, markets, government, work, or culture. It helps explain how real people and places are organised."
    if subject == "English":
        return f"Think of {topic} as the part of the unit that gives a feeling, situation, or life lesson. Instead of only remembering the text, connect it with a real value like kindness, courage, friendship, honesty, health, nature care, or love for the country."
    return f"{topic} ko jeevan se judi ek saral baat ki tarah samjho. Isme kavi ya lekhak kisi bhavna, sandesh, anubhav, prakriti, desh prem, imandari, sahas, ya parivarik moolya ko dikhata hai."


def step_by_step(subject: str, chapter: str, topic: str) -> list[str]:
    custom = override(subject, topic)
    if custom:
        return custom["steps"]
    if topic in TOPIC_POINTS.get(subject, {}):
        return TOPIC_POINTS[subject][topic]
    fact = topic_fact(subject, topic)
    if subject == "Maths":
        return [
            fact,
            f"In {chapter}, this topic is shown through examples and activities.",
            "The main rule or relation is used to solve similar questions.",
            "Diagrams, tables, number lines, or figures may be used when helpful.",
            "The answer should match the given numbers, units, or shape.",
            "This idea is useful in measurement, data, design, sharing, comparison, or daily calculations.",
        ]
    if subject == "Science":
        return [
            fact,
            f"In {chapter}, the concept is linked with observation or an activity.",
            "The topic explains a property, process, object, living thing, resource, or event.",
            "A real-life example helps show where it is seen.",
            "Important terms name the parts, steps, or features.",
            "The topic helps explain why something happens in nature or daily life.",
        ]
    if subject == "Social Science":
        return [
            fact,
            f"In {chapter}, this topic connects with real people, places, maps, time, rules, resources, or work.",
            "It affects how people live, travel, settle, govern, trade, remember the past, or share culture.",
            "It can be understood through examples from India and the world.",
            "The topic may have benefits, challenges, and responsibilities.",
            "It helps explain how society and geography are connected.",
        ]
    if subject == "English":
        return [
            fact,
            f"In the unit {chapter}, this topic builds the central idea or message.",
            "Important words, events, characters, or images help explain the meaning.",
            "The text may teach a value such as friendship, courage, wisdom, nature care, health, or patriotism.",
            "Students should notice the feeling and message, not only the storyline.",
            "A good answer explains the idea in simple words with one text-based point.",
        ]
    return [
        fact,
        f"{chapter} mein yah baat path ke mukhya bhav se judi hai.",
        "Isme bhav, sandesh, patra, ghatna, ya prakriti/samaj/jeevan moolya ka varnan hota hai.",
        "Mushkil shabdon ke arth se path aur spasht hota hai.",
        "Udaharan se baat ko apni zindagi se joda ja sakta hai.",
        "Achcha uttar saral bhasha mein mukhya baat aur sandesh dono batata hai.",
    ]


def real_life_example(subject: str, topic: str) -> str:
    custom = override(subject, topic)
    if custom:
        return custom["example"]
    if topic in TOPIC_EXAMPLES.get(subject, {}):
        return TOPIC_EXAMPLES[subject][topic]
    fact = topic_fact(subject, topic)
    if subject == "Maths":
        return f"Example: {fact} Start with a small number, shape, table, graph, or diagram from the chapter to see exactly how the idea works."
    if subject == "Science":
        return f"Example: {fact} This can usually be observed through a simple classroom activity or a daily-life situation."
    if subject == "Social Science":
        return f"Example: {fact} This can be connected with a map, a local place, a community activity, a historical source, or a public service."
    if subject == "English":
        return f"Example: {fact} A student can connect this with a real feeling, friendship, nature, health, courage, or national pride seen in daily life."
    return f"Udaharan: {fact} Is vichar ko parivar, school, prakriti, desh, tyohar, ya apne anubhav se joda ja sakta hai."


def make_doc(subject: str, chapter: str, topic: str) -> dict:
    custom = override(subject, topic)
    keyword_source = custom["keywords"] if custom and "keywords" in custom else KEYWORDS[subject]
    fact = topic_fact(subject, topic)
    keywords = [{"term": topic, "meaning": fact}]
    keywords.extend({"term": term, "meaning": meaning} for term, meaning in keyword_source)
    summary = custom["summary"] if custom and "summary" in custom else [
        fact,
        f"It is connected with the Class 6 chapter {chapter}.",
        "It has real features, examples, uses, or effects that students should understand.",
        "Important terms make the answer clearer and more accurate.",
        "The topic connects the textbook with daily life, examples, and school questions.",
    ]
    diagram = custom["diagram"] if custom and "diagram" in custom else f"{topic} -> What it means -> Main features -> Example -> Why it matters"
    return {
        "id": content_id(subject, chapter, topic),
        "classLevel": "6",
        "board": "CBSE",
        "subject": subject,
        "chapterTitle": chapter,
        "topicTitle": topic,
        "status": "published",
        "sourceLabel": f"Based on {SUBJECT_LABELS[subject]} + AI-generated explanation",
        "studyContent": {
            "title": topic,
            "intro": subject_intro(subject, chapter, topic),
            "ncertBasedExplanation": ncert_explanation(subject, chapter, topic),
            "aiSimplifiedExplanation": simplified_explanation(subject, topic),
            "stepByStep": step_by_step(subject, chapter, topic),
            "keywords": keywords,
            "realLifeExample": real_life_example(subject, topic),
            "diagram": {
                "type": "text",
                "title": f"{topic} Flow",
                "content": diagram,
            },
            "summary": summary,
        },
        "revisionContent": {
            "quickMeaning": subject_intro(subject, chapter, topic),
            "keyPoints": summary,
            "importantTerms": keywords,
            "mustRemember": [
                f"{topic} is connected with {chapter}.",
                "The topic has real examples, not only definitions.",
                "Keywords and examples make the answer stronger.",
            ],
            "quickFlowchart": diagram,
            "examPoints": [
                f"Define or explain {topic}.",
                "Write the main features.",
                "Give one textbook-style or real-life example.",
                "Explain how it affects people, nature, a text, a process, or a problem.",
            ],
        },
    }


def build_seed() -> list[dict]:
    docs = []
    seen = set()
    for subject, chapters in SYLLABUS.items():
        for chapter, topics in chapters:
            for topic in topics:
                doc = make_doc(subject, chapter, topic)
                if doc["id"] in seen:
                    raise ValueError(f"Duplicate content id: {doc['id']}")
                seen.add(doc["id"])
                docs.append(doc)
    return docs


def main():
    docs = build_seed()
    OUTPUT_PATH.write_text(json.dumps(docs, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(docs)} content documents to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
