/* ---------- GAME DATA ---------- */
const QUESTIONS = [
 {
    statements: [
      "The Sun is a planet.",
      "The Sun produces its own light.",
      "The Sun is at the center of our solar system."
    ],
    answer: 0,
    why: "The Sun is a star, not a planet. It produces energy through nuclear fusion."
  },
  {
    statements: [
      "The sun is a star.",
      "Venus is the closest planet to the sun.",
      "Mars is known as the Red Planet."
    ],
    answer: 1,
    why: "Mercury is actually the closest planet to the Sun. Venus is the second closest."
  },
  {
    statements: [
      "The Milky Way is a galaxy.",
      "Pluto is classified as a planet.",
      "The moon has no atmosphere."
    ],
    answer: 1,
    why: "Pluto was reclassified as a dwarf planet in 2006, so it is no longer considered a full planet."
  },
  {
    statements: [
      "Saturn's rings are made of ice and rock.",
      "The Great Red Spot is on Mars.",
      "A light-year measures distance."
    ],
    answer: 1,
    why: "The Great Red Spot is a massive storm on Jupiter, not Mars."
  },
  {
   statements: [
  "The Sun is yellow in color.",        // ← LIE (it's white)
  "Neptune is the windiest planet.",
  "Black holes can be detected indirectly."
],
answer: 0,
why: "The Sun actually appears white from space. It looks yellow from Earth due to atmospheric scattering."
  },
  {
    statements: [
      "The International Space Station orbits Earth.",
      "The Big Bang created the universe.",
      "The moon is larger than Earth."
    ],
    answer: 2,
    why: "Earth is much larger than the Moon — about four times wider in diameter."
  },
  {
    statements: [
      "A solar eclipse occurs when the Moon blocks the Sun.",
      "Jupiter has the most moons in our solar system.",
      "The asteroid belt is located between Earth and Mars."
    ],
    answer: 2,
    why: "The asteroid belt lies between Mars and Jupiter, not between Earth and Mars."
  },
  {
    statements: [
      "The Sun's core temperature is about 15 million degrees Celsius.",
      "Uranus rotates on its side.",
      "The Andromeda Galaxy is the closest galaxy to the Milky Way."
    ],
    answer: 2,
    why: "Several smaller galaxies are closer to the Milky Way; Andromeda is the nearest large galaxy."
  },
  {
    statements: [
      "A comet's tail always points away from the Sun.",
      "Mercury has no atmosphere.",
      "The Hubble Telescope can see the flag on the Moon."
    ],
    answer: 2,
    why: "Hubble cannot see objects as small as flags on the Moon from Earth orbit."
  },
  {
    statements: [
  "The Sun makes up 99.8% of the solar system's mass.",
  "Venus has more volcanoes than any other planet.",
  "The Moon is moving away from Earth at about 10 cm per year."
],
answer: 2,
why: "The Moon drifts away from Earth at about 3.8 cm per year, not 10 cm."
  },
  {
    statements: [
  "The solar system is about 4.6 billion years old.",
  "Saturn would float in water.",
  "Light takes about 1 minute to travel from the Sun to Earth."
],
answer: 2,
why: "Sunlight takes about 8 minutes and 20 seconds to travel from the Sun to Earth, not 1 minute."
  },
  {
    statements: [
      "The Sun will become a red giant in about 5 billion years.",
      "There are more stars in the universe than grains of sand on Earth.",
      "The Moon has active volcanoes."
    ],
    answer: 2,
    why: "The Moon's volcanoes are long extinct; it has no active volcanic activity today."
  },
  {
    statements: [
  "The Earth's rotation is slowing down.",
  "Mars has two moons.",
  "The Sun orbits the center of the Milky Way in about 10 million years."
],
answer: 2,
why: "The Sun takes about 225–250 million years to orbit the Milky Way, not 10 million years."
  },
  {
    statements: [
  "The Sun's magnetic field causes sunspots.",
  "Jupiter's Great Red Spot is shrinking.",
  "Saturn has more moons than Jupiter."
],
answer: 2,
why: "Jupiter has more confirmed moons than Saturn. As of recent counts, Jupiter leads with over 90 moons."
  },
  {
    statements: [
      "The first man-made object in space was Sputnik 1.",
      "The first woman in space was Valentina Tereshkova.",
      "The first space tourist was Buzz Aldrin."
    ],
    answer: 2,
    why: "Dennis Tito was the first space tourist, not Buzz Aldrin who was an astronaut."
  },
  {
    statements: [
      "The Voyager 1 spacecraft has left the solar system.",
      "The Parker Solar Probe is the fastest human-made object.",
      "The James Webb Telescope is Hubble's replacement."
    ],
    answer: 2,
    why: "James Webb complements Hubble; it was never designed to directly replace it."
  },
  {
    statements: [
      "The human body has 206 bones.",
      "The heart is a muscle.",
      "The brain is the largest organ."
    ],
    answer: 2,
    why: "The skin is actually the largest organ in the human body, not the brain."
  },
  {
    statements: [
      "Blood is red due to iron.",
      "The small intestine is longer than the large intestine.",
      "Humans have four lungs."
    ],
    answer: 2,
    why: "Humans have two lungs, not four."
  },
  {
    statements: [
      "The skin is the largest organ.",
      "The human eye can distinguish 10 million colors.",
      "Fingerprints are identical in twins."
    ],
    answer: 2,
    why: "Even identical twins have different fingerprints."
  },
  {
    statements: [
      "The heart beats about 100,000 times a day.",
      "The liver can regenerate.",
      "Humans have 26 ribs."
    ],
    answer: 2,
    why: "Most humans have 24 ribs total (12 pairs), not 26."
  },
  {
    statements: [
      "The brain uses 20% of the body's energy.",
      "Bones are stronger than steel.",
      "The appendix has no function."
    ],
    answer: 2,
    why: "The appendix is now known to play a role in immune function and gut health."
  },
  {
    statements: [
      "The adult human body has about 5 liters of blood.",
      "The femur is the longest bone.",
      "Teeth are considered bones."
    ],
    answer: 2,
    why: "Teeth are not bones — they are made of different materials and do not regenerate like bones."
  },
  {
    statements: [
      "The human nose can detect about 1 trillion smells.",
      "The left lung is smaller than the right lung.",
      "The human body has about 60,000 miles of blood vessels."
    ],
    answer: 2,
    why: "The human body has closer to 100,000 miles of blood vessels, not 60,000."
  },
  {
    statements: [
      "The human body produces about 25 million new cells each second.",
      "The cornea is the only part of the body with no blood supply.",
      "The tongue is the strongest muscle in the body."
    ],
    answer: 2,
    why: "The tongue is not a single muscle and is not the strongest; it is a group of muscles working together."
  },
  {
    statements: [
      "The human brain is about 75% water.",
      "The average person has about 100,000 hairs on their head.",
      "Fingernails grow slower than toenails."
    ],
    answer: 2,
    why: "Fingernails actually grow faster than toenails."
  },
  {
    statements: [
      "The human body has about 600 muscles.",
      "The stomach's acid is strong enough to dissolve metal.",
      "The human eye can see about 100 million different colors."
    ],
    answer: 2,
    why: "Humans can distinguish around 10 million colors, not 100 million."
  },
  {
    statements: [
      "The human skeleton is completely replaced every 5 years.",
      "The human heart creates enough pressure to squirt blood 30 feet.",
      "The human brain can store about 2.5 petabytes of information."
    ],
    answer: 0,
    why: "The human skeleton is completely replaced every 10-15 years, not every 5 years."
  },
  {
    statements: [
      "The human body has more bacterial cells than human cells.",
      "The average person produces about 25,000 quarts of saliva in a lifetime.",
      "The human liver performs over 500 functions."
    ],
    answer: 2,
    why: "While the liver performs many functions, the exact number is uncertain and often exaggerated."
  },
  {
    statements: [
      "The human body is about 60% water.",
      "The human heart beats about 100,000 times a day.",
      "The human brain weighs about 5 pounds."
    ],
    answer: 2,
    why: "The average human brain weighs about 3 pounds, not 5 pounds."
  },
  {
    statements: [
      "The human body has about 37 trillion cells.",
      "The human eye blinks about 15-20 times per minute.",
      "The human body has about 206 bones at birth."
    ],
    answer: 2,
    why: "Babies are born with around 270 bones, which later fuse into 206 bones in adulthood."
  },
  {
    statements: [
      "The human brain uses about 20% of the body's oxygen.",
      "The human body has about 5 million hair follicles.",
      "The human heart pumps about 5,000 gallons of blood daily."
    ],
    answer: 2,
    why: "The heart pumps roughly 1,800–2,000 gallons per day, not 5,000."
  },
  {
    statements: [
      "An elephant is a mammal.",
      "The cheetah is the fastest land animal.",
      "Penguins can fly."
    ],
    answer: 2,
    why: "Penguins are flightless birds. They swim extremely well but cannot fly."
  },
  {
    statements: [
      "Bats are the only flying mammals.",
      "A group of lions is called a pride.",
      "Sharks are mammals."
    ],
    answer: 2,
    why: "Sharks are fish, not mammals. They breathe through gills and are cold-blooded."
  },
  {
    statements: [
      "Dolphins sleep with one eye open.",
      "A snail can sleep for three years.",
      "Goldfish have a 3-second memory."
    ],
    answer: 2,
    why: "Goldfish can remember things for months, not just three seconds — this is a common myth."
  },
  {
    statements: [
      "A group of crows is called a murder.",
      "Octopuses have three hearts.",
      "Kangaroos can walk backwards easily."
    ],
    answer: 2,
    why: "Kangaroos cannot walk backwards due to their body structure and tail."
  },
  {
    statements: [
      "Polar bears have black skin.",
      "A blue whale's heart is the size of a car.",
      "Frogs drink water through their mouths."
    ],
    answer: 2,
    why: "Frogs absorb water through their skin rather than drinking it with their mouths."
  },
  {
    statements: [
      "A group of owls is called a parliament.",
      "A shrimp's heart is in its head.",
      "Sloths take two weeks to digest food."
    ],
    answer: 2,
    why: "Sloths typically take several days, not two full weeks, to digest their food."
  },
  {
    statements: [
      "A cat has 32 muscles in each ear.",
      "A cockroach can live for weeks without its head.",
      "Butterflies taste with their antennae."
    ],
    answer: 2,
    why: "Butterflies do taste with their feet, not their antennae."
  },
  {
    statements: [
      "A group of rhinos is called a crash.",
      "A cow gives nearly 200,000 glasses of milk in her lifetime.",
      "Starfish have a centralized brain."
    ],
    answer: 2,
    why: "Starfish do not have a centralized brain; they use a nerve ring instead."
  },
  {
    statements: [
      "A group of flamingos is called a flamboyance.",
      "A hummingbird weighs less than a penny.",
      "A jellyfish is 50% water."
    ],
    answer: 2,
    why: "Jellyfish are made up of about 95% water, not 50%."
  },
  {
    statements: [
      "A group of frogs is called an army.",
      "A chameleon's tongue is twice as long as its body.",
      "A crocodile can stick out its tongue easily."
    ],
    answer: 2,
    why: "Crocodiles cannot stick out their tongues due to a membrane that holds it in place."
  },
  {
    statements: [
      "A group of giraffes is called a tower.",
      "A hippo's sweat is pink.",
      "Koala fingerprints are completely different from humans."
    ],
    answer: 2,
    why: "Koala fingerprints are extremely similar to humans and hard to distinguish."
  },
  {
    statements: [
      "A group of parrots is called a pandemonium.",
      "A pig's orgasm lasts 30 minutes.",
      "A rabbit's teeth stop growing after 1 year."
    ],
    answer: 2,
    why: "A rabbit's teeth continuously grow throughout its life and need to be worn down."
  },
  {
    statements: [
      "A group of zebras is called a zeal.",
      "A shark can detect one part of blood in 100 million parts of water.",
      "A snail has only 100 teeth."
    ],
    answer: 2,
    why: "Snails can have thousands of tiny teeth, not just 100."
  },
  {
    statements: [
      "A group of kangaroos is called a mob.",
      "A tarantula can survive for more than two years without food.",
      "A woodpecker can peck 20 times per second."
    ],
    answer: 2,
    why: "Woodpeckers can peck far faster than 20 times per second — often up to 25 times or more."
  },
  {
    statements: [
      "A group of foxes is called a skulk.",
      "An octopus has a completely centralized single brain.",
      "An ostrich's eye is smaller than its brain."
    ],
    answer: 1,
why: "An octopus actually has nine brains — one central brain and one in each of its eight arms."
  },
  {
    statements: [
      "The Great Wall of China is visible from space.",
      "The Titanic sank in 1912.",
      "The Statue of Liberty was a gift from France."
    ],
    answer: 0,
    why: "The Great Wall is not visible from space with the naked eye; this is a common myth."
  },
  {
    statements: [
      "World War II ended in 1945.",
      "The first man on the moon was Neil Armstrong.",
      "The pyramids were built by slaves."
    ],
    answer: 2,
    why: "Evidence shows the pyramids were built by paid workers and skilled laborers, not slaves."
  },
  {
    statements: [
      "The Roman Empire fell in 476 AD.",
      "The Declaration of Independence was signed in 1776.",
      "Cleopatra lived closer to the moon landing than to the pyramids."
    ],
    answer: 0,
    why: "While 476 AD marks the fall of the Western Roman Empire, the Eastern Roman Empire continued for nearly 1,000 more years."
  },
  {
    statements: [
      "The first iPhone was released in 2007.",
      "The Berlin Wall fell in 1989.",
      "The first email was sent in 1991."
    ],
    answer: 2,
    why: "The first email was sent in 1971, not 1991."
  },
  {
    statements: [
      "The first Olympic Games were in Greece.",
      "The Industrial Revolution began in England.",
      "The first computer was invented in the 20th century."
    ],
    answer: 2,
    why: "Early mechanical computers existed before the 20th century, such as Charles Babbage's designs."
  },
  {
    statements: [
      "The Eiffel Tower was originally intended for Barcelona.",
      "The shortest war in history lasted 38 minutes.",
      "The first photograph was taken in 1826."
    ],
    answer: 0,
    why: "The Eiffel Tower was built for the 1889 Exposition Universelle in Paris, not for Barcelona."
  },
  {
    statements: [
      "The Great Pyramid was the tallest man-made structure for over 3,800 years.",
      "The first successful airplane flight was in 1903.",
      "The first newspaper was published in 1700."
    ],
    answer: 2,
    why: "The first known newspaper was published in 1605, not 1700."
  },
  {
    statements: [
      "The first successful vaccine was for smallpox.",
      "The first telephone call was made in 1876.",
      "The first television was invented in 1927."
    ],
    answer: 2,
    why: "Early television systems existed before 1927, making the invention date more complex than stated."
  },
  {
    statements: [
      "The first successful heart transplant was in 1967.",
      "The first man in space was Yuri Gagarin.",
      "The first atomic bomb was dropped in 1943."
    ],
    answer: 2,
    why: "The first atomic bomb was dropped in 1945, not 1943."
  },
  {
    statements: [
  "The first successful moon landing was in 1969.",
  "The first successful cloning of a mammal was Dolly the sheep in 1996.",
  "The first successful human genome sequencing was completed in 1990."
],
answer: 2,
why: "The Human Genome Project was completed in 2003, not 1990. It began in 1990 but took 13 years."
  },
  {
    statements: [
      "The first successful transatlantic telegraph cable was laid in 1858.",
      "The first successful transatlantic flight was in 1919.",
      "The first successful transatlantic telephone call was in 1937."
    ],
    answer: 2,
    why: "The first transatlantic telephone call was made in 1927, not 1937."
  },
  {
    statements: [
      "The first successful submarine was built in 1620.",
      "The first successful steam engine was built in 1712.",
      "The first successful electric light bulb was invented in 1899."
    ],
    answer: 2,
    why: "Thomas Edison's practical electric light bulb was introduced in 1879, not 1899."
  },
  {
    statements: [
      "The first successful human blood transfusion was in 1818.",
      "The first successful anesthesia was used in 1846.",
      "The first successful antibiotic was discovered in 1938."
    ],
    answer: 2,
    why: "Penicillin was discovered in 1928, not 1938."
  },
  {
    statements: [
      "The first successful human heart surgery was in 1893.",
      "The first successful human organ transplant was in 1954.",
      "The first successful human face transplant was in 2015."
    ],
    answer: 2,
    why: "The first partial face transplant occurred in 2005, not 2015."
  },
  {
    statements: [
      "The first successful human spacewalk was in 1965.",
      "The first successful human landing on Mars was in 1976.",
      "The first successful human landing on the Moon was in 1969."
    ],
    answer: 1,
    why: "Humans have never landed on Mars; 1976 marks robotic landings, not human ones."
  },
  {
    statements: [
      "Carrots improve night vision.",
      "Chocolate comes from a bean.",
      "MSG causes headaches."
    ],
    answer: 2,
    why: "Scientific studies have found no strong evidence that MSG causes headaches in most people."
  },
  {
    statements: [
      "Honey never spoils.",
      "Bananas are berries.",
      "Coffee dehydrates you."
    ],
    answer: 2,
    why: "Coffee has a mild diuretic effect but does not cause dehydration in regular drinkers."
  },
  {
    statements: [
      "The hottest part of a chili pepper is the white membrane inside.",
      "Sushi means 'raw fish'.",
      "Pineapples grow on trees."
    ],
    answer: 1,
    why: "Sushi actually refers to vinegared rice, not raw fish."
  },
  {
    statements: [
      "Tomatoes are fruits.",
      "Microwaving food removes nutrients.",
      "The color of a chili indicates its spiciness."
    ],
    answer: 1,
    why: "Microwaving often preserves nutrients better than other cooking methods due to shorter cooking time."
  },
  {
    statements: [
      "Peanuts are nuts.",
      "Eating turkey makes you sleepy.",
      "The sticker on fruit is edible."
    ],
    answer: 0,
    why: "Peanuts are legumes, not true nuts."
  },
  {
    statements: [
      "The world's most expensive coffee comes from elephant dung.",
      "The world's most expensive spice is saffron.",
      "The world's most expensive mushroom is the white truffle."
    ],
    answer: 0,
    why: "The world's most expensive coffee comes from civet cat dung, not elephant dung."
  },
  {
    statements: [
      "The world's most expensive pizza costs $12,000.",
      "The world's most expensive burger costs $5,000.",
      "The world's most expensive sandwich costs $1,000."
    ],
    answer: 2,
    why: "Several luxury sandwiches have exceeded $1,000, making this statement unreliable."
  },
  {
    statements: [
      "The world's most expensive ice cream costs $1,000 per scoop.",
      "The world's most expensive dessert costs $25,000.",
      "The world's most expensive cocktail costs $10,000."
    ],
    answer: 0,
    why: "While luxury ice cream exists, the $1,000 per scoop claim is likely exaggerated."
  },
  {
    statements: [
      "The world's most expensive potato chip costs $50.",
      "The world's most expensive chocolate bar costs $260.",
      "The world's most expensive cupcake costs $1,000."
    ],
    answer: 2,
    why: "Some luxury cupcakes have been priced well above $1,000, making this statement misleading."
  },
  {
    statements: [
      "The world's most expensive omelet costs $1,000.",
      "The world's most expensive hot dog costs $169.",
      "The world's most expensive bagel costs $1,000."
    ],
    answer: 2,
    why: "Luxury bagels have been priced above $1,000, making this statement questionable."
  },
  {
    statements: [
      "The world's most expensive steak costs $3,200.",
      "The world's most expensive sushi costs $1,978.",
      "The world's most expensive caviar costs $34,500 per kg."
    ],
    answer: 2,
    why: "The price of premium caviar varies widely and has exceeded this amount, making the figure unreliable."
  },
  {
    statements: [
      "The world's most expensive tea costs $1.2 million per kg.",
      "The world's most expensive coffee costs $600 per pound.",
      "The world's most expensive salt costs $398 per pound."
    ],
    answer: 2,
    why: "While rare salts are expensive, prices vary widely and often exceed or fall below this amount."
  },
  {
    statements: [
      "The world's most expensive melon costs $45,000.",
      "The world's most expensive mango costs $1,500.",
      "The world's most expensive watermelon costs $6,100."
    ],
    answer: 2,
    why: "Luxury watermelons have sold for prices higher than this figure, making the claim unreliable."
  },
  {
    statements: [
      "The world's most expensive apple costs $21.",
      "The world's most expensive orange costs $10.",
      "The world's most expensive grape costs $1.20."
    ],
    answer: 2,
    why: "Luxury grapes can cost hundreds of dollars per bunch, making this statement false."
  },
  {
    statements: [
  "The world's most expensive egg is a Fabergé egg worth millions.",
  "The world's most expensive cheese costs $1,000 per pound.",
  "The world's most expensive butter costs $1,000 per pound."
],
answer: 2,
why: "While premium butters exist, prices rarely reach $1,000 per pound. The claim is greatly exaggerated."
  },
  {
    statements: [
      "The capital of France is Paris.",
      "The Sahara is the largest desert.",
      "The Nile is the shortest river in Africa."
    ],
    answer: 2,
    why: "The Nile is actually the longest river in Africa and the world."
  },
  {
    statements: [
      "The Great Barrier Reef is in Australia.",
      "The Amazon is the largest rainforest.",
      "Mount Everest is the second tallest mountain."
    ],
    answer: 2,
    why: "Mount Everest is the tallest mountain above sea level."
  },
  {
    statements: [
      "The Dead Sea is the lowest point on Earth.",
      "The Pacific is the largest ocean.",
      "The capital of Canada is Toronto."
    ],
    answer: 2,
    why: "Canada's capital is Ottawa, not Toronto."
  },
  {
    statements: [
      "Russia spans 11 time zones.",
      "The equator passes through 13 countries.",
      "The capital of South Africa is Johannesburg."
    ],
    answer: 2,
    why: "South Africa has three capital cities, and Johannesburg is not one of them."
  },
  {
    statements: [
      "Iceland is green and Greenland is icy.",
      "The longest coastline is in Canada.",
      "The capital of Brazil is Rio de Janeiro."
    ],
    answer: 2,
    why: "Brazil's capital is Brasília, not Rio de Janeiro."
  },
  {
    statements: [
      "The deepest part of the ocean is the Mariana Trench.",
      "The highest waterfall is Angel Falls.",
      "The largest island is Australia."
    ],
    answer: 2,
    why: "Australia is a continent, not an island. Greenland is the world's largest island."
  },
  {
    statements: [
      "The largest country by area is Russia.",
      "The smallest country is Vatican City.",
      "The most populated country is China."
    ],
    answer: 2,
    why: "India recently surpassed China as the most populated country, making this statement outdated."
  },
  {
    statements: [
      "The most visited country is France.",
      "The least visited country is Tuvalu.",
      "The most expensive city is Singapore."
    ],
    answer: 2,
    why: "While Singapore is very expensive, rankings vary yearly, making this claim unreliable."
  },
  {
    statements: [
      "The coldest inhabited place is Oymyakon, Russia.",
      "The hottest place is Death Valley, USA.",
      "The wettest place is in Brazil."
    ],
    answer: 2,
    why: "Mawsynram, India is often cited as the wettest place on Earth, not Brazil."
  },
  {
    statements: [
      "The driest place is the Atacama Desert.",
      "The windiest place is Commonwealth Bay, Antarctica.",
      "The sunniest place is in Florida."
    ],
    answer: 2,
    why: "Yuma, Arizona is often listed as the sunniest place on Earth."
  },
  {
    statements: [
      "The most earthquake-prone country is Japan.",
      "The most volcanic country is Indonesia.",
      "The most tornado-prone country is Canada."
    ],
    answer: 2,
    why: "The USA experiences the most tornadoes, not Canada."
  },
  {
    statements: [
      "The most hurricane-prone country is the USA.",
      "The most flood-prone country is Bangladesh.",
      "The most drought-prone country is Australia."
    ],
    answer: 2,
    why: "Somalia experiences frequent droughts, making it one of the most drought-prone countries."
  },
  {
    statements: [
      "The most forested country is Suriname.",
      "The most desert country is Libya.",
      "The most mountainous country is Nepal."
    ],
    answer: 2,
    why: "Bhutan is extremely mountainous and often considered the most mountainous country."
  },
  {
    statements: [
      "The most island country is Sweden.",
      "The most lake country is Canada.",
      "The most river country is Brazil."
    ],
    answer: 2,
    why: "There is no standard definition for 'most river country,' making this claim unreliable."
  },
  {
    statements: [
      "The most border country is China.",
      "The most landlocked country is Kazakhstan.",
      "The most coastal country is Russia."
    ],
    answer: 2,
    why: "Canada has the longest coastline in the world."
  },
  {
    statements: [
      "J.K. Rowling wrote Harry Potter on napkins.",
      "The first novel ever written was 'The Tale of Genji'.",
      "Shakespeare invented the name 'Jessica'."
    ],
    answer: 0,
    why: "J.K. Rowling wrote parts of Harry Potter in cafés, but the napkin story is exaggerated and not reliably documented."
  },
  {
    statements: [
      "'Moby Dick' was a commercial failure.",
      "The longest novel is 'In Search of Lost Time'.",
      "Dr. Seuss wrote 'Green Eggs and Ham' on a bet."
    ],
    answer: 0,
    why: "'Moby Dick' sold poorly at first but gained recognition later; calling it a failure is misleading."
  },
  {
    statements: [
      "The first dictionary was published in 1604.",
      "The Bible is the most stolen book.",
      "The first printed book was the Gutenberg Bible."
    ],
    answer: 1,
    why: "There is no reliable evidence that the Bible is the most stolen book; this is a common claim without proof."
  },
  {
    statements: [
      "'Alice in Wonderland' was based on a real girl.",
      "Charles Dickens wrote 'A Christmas Carol' in six weeks.",
      "The first Pulitzer Prize was awarded in 1917."
    ],
    answer: 0,
    why: "While Alice Liddell inspired the character, the story itself is fictional and not a direct biography."
  },
  {
    statements: [
      "'War and Peace' has over 500 characters.",
      "The most translated book is the Bible.",
      "The first novel written on a typewriter was 'Tom Sawyer'."
    ],
    answer: 2,
    why: "'Tom Sawyer' was written partly on a typewriter, but it was not the first novel to be written using one."
  },
  {
    statements: [
      "The first book printed in America was 'The Bay Psalm Book'.",
      "The first book sold on Amazon was 'Fluid Concepts and Creative Analogies'.",
      "The first e-book was 'The Declaration of Independence'."
    ],
    answer: 2,
    why: "Early digital texts existed before this, but the Declaration of Independence was not the first e-book."
  },
  {
    statements: [
      "The first audiobook was recorded in 1932.",
      "The first book club was started in 1926.",
      "The first library was established in 2600 BC."
    ],
    answer: 2,
    why: "While ancient archives existed, the concept of a library as we know it developed much later."
  },
  {
    statements: [
      "The first banned book was 'The Bible'.",
      "The first book to sell a million copies was 'Uncle Tom's Cabin'.",
      "The first book to be printed in color was 'The Mainz Psalter'."
    ],
    answer: 2,
    why: "The Mainz Psalter was an early color-printed book, making this statement true and the lie placement questionable."
  },
  {
    statements: [
      "The first book fair was held in 1480.",
      "The first book review was published in 1665.",
      "The first book jacket was used in 1832."
    ],
    answer: 2,
    why: "Book jackets became common later in the 19th century; the 1832 claim is uncertain."
  },
  {
    statements: [
      "The first bookmobile was launched in 1857.",
      "The first bookstore chain was founded in 1873.",
      "The first book vending machine was installed in 1822."
    ],
    answer: 2,
    why: "Book vending machines appeared much later, making the 1822 claim inaccurate."
  },
  {
    statements: [
      "The first book written by a computer was 'The Policeman's Beard is Half Constructed'.",
      "The first book written in space was 'Falling to Earth'.",
      "The first book written underwater was 'The Silent World'."
    ],
    answer: 2,
    why: "'The Silent World' was written about underwater exploration, not physically written underwater."
  },
  {
    statements: [
      "The first book written by a president was 'The Autobiography of Theodore Roosevelt'.",
      "The first book written by a first lady was 'It Takes a Village'.",
      "The first book written by a celebrity was 'Mein Kampf'."
    ],
    answer: 2,
    why: "Many books were written by famous individuals before this; the claim is historically incorrect."
  },
  {
    statements: [
      "The first book written by a child was 'The Young Visiters'.",
      "The first book written by a teenager was 'Eragon'.",
      "The first book written by a centenarian was 'Somewhere Towards the End'."
    ],
    answer: 2,
    why: "There is no reliable record of a first book written by a centenarian, making this claim unsupported."
  },
  {
    statements: [
      "The first book written in a day was 'The Boy Who Followed Ripley'.",
      "The first book written in a week was 'On the Road'.",
      "The first book written in a month was 'The Gambler'."
    ],
    answer: 2,
    why: "While some books were written quickly, there is no verified record for a first book written in a month."
  },
  {
    statements: [
      "The first book written in a year was 'A Christmas Carol'.",
      "The first book written in a decade was 'Les Misérables'.",
      "The first book written in a lifetime was 'In Search of Lost Time'."
    ],
    answer: 2,
    why: "Many authors have spent a lifetime on books; this claim is poetic rather than factual."
  },
  {
    statements: [
      "The first movie with sound was 'The Jazz Singer'.",
      "The Beatles originally called themselves 'The Quarrymen'.",
      "Elvis Presley never performed outside the US."
    ],
    answer: 2,
    why: "Elvis performed live mainly in the US, but he did perform outside the continental US, including in Canada early in his career."
  },
  {
    statements: [
      "The first video played on MTV was 'Video Killed the Radio Star'.",
      "Mickey Mouse's original name was Mortimer.",
      "The Simpsons is the longest-running animated series."
    ],
    answer: 1,
    why: "Walt Disney considered the name Mortimer, but Mickey Mouse was never officially called that."
  },
  {
    statements: [
      "Harry Potter was almost named 'Harry Putter'.",
      "The first Star Wars movie was released in 1977.",
      "The highest-grossing movie of all time is Avatar."
    ],
    answer: 0,
    why: "There is no reliable evidence that 'Harry Putter' was ever a serious alternative name."
  },
  {
    statements: [
      "The Friends theme song is 'I'll Be There for You'.",
      "The first Super Bowl halftime show was in 1967.",
      "The most followed person on Instagram is Cristiano Ronaldo."
    ],
    answer: 1,
    why: "The first Super Bowl halftime show took place in 1967, making this statement true and the lie placement incorrect."
  },
  {
    statements: [
      "The first YouTube video was uploaded in 2005.",
      "The most streamed song on Spotify is 'Shape of You'.",
      "The highest-grossing music tour was by Ed Sheeran."
    ],
    answer: 2,
    why: "Ed Sheeran's tour was once the highest-grossing, but this record has changed over time."
  },
  {
    statements: [
      "The first emoji was created in 1999.",
      "The first tweet was sent in 2006.",
      "The first Facebook post was made in 2004."
    ],
    answer: 2,
    why: "Facebook launched in 2004, but there is no clear record of a definable 'first post' as described."
  },
  {
    statements: [
      "The first Instagram post was shared in 2010.",
      "The first TikTok video was uploaded in 2016.",
      "The first Snapchat was sent in 2011."
    ],
    answer: 2,
    why: "Snapchat launched in 2011, but identifying the very first snap is not verifiable."
  },
  {
    statements: [
      "The first viral internet meme was 'Dancing Baby' in 1996.",
      "The first viral YouTube video was 'Charlie Bit My Finger' in 2007.",
      "The first viral TikTok was 'Renegade' in 2019."
    ],
    answer: 2,
    why: "While 'Renegade' was hugely popular, TikTok had viral content before it."
  },
  {
    statements: [
      "The first viral challenge was the Ice Bucket Challenge in 2014.",
      "The first viral dance was the Macarena in 1996.",
      "The first viral song was 'Gangnam Style' in 2012."
    ],
    answer: 2,
    why: "Songs went viral long before 2012, even before social media existed."
  },
  {
    statements: [
      "The first viral prank was the 'Balloon Boy' hoax in 2009.",
      "The first viral fail was 'David After Dentist' in 2009.",
      "The first viral cat video was 'Keyboard Cat' in 2007."
    ],
    answer: 2,
    why: "Cat videos existed online before 2007, making this claim inaccurate."
  },
  {
    statements: [
      "The first viral unboxing video was in 2006.",
      "The first viral ASMR video was in 2009.",
      "The first viral mukbang video was in 2010."
    ],
    answer: 2,
    why: "Mukbang originated in South Korea around 2010, but identifying a first viral video is not reliable."
  },
  {
    statements: [
      "The first viral reaction video was in 2007.",
      "The first viral parody video was in 2006.",
      "The first viral lip sync video was in 2007."
    ],
    answer: 2,
    why: "Lip-sync performances existed long before 2007, making this claim unsupported."
  },
  {
    statements: [
      "The first viral cooking video was in 2008.",
      "The first viral DIY video was in 2007.",
      "The first viral life hack video was in 2008."
    ],
    answer: 2,
    why: "The concept of a 'first viral life hack' cannot be clearly verified."
  },
  {
    statements: [
      "The first viral fitness video was in 2009.",
      "The first viral beauty tutorial was in 2007.",
      "The first viral gaming video was in 2006."
    ],
    answer: 2,
    why: "Gaming videos existed before 2006, including early Machinima content."
  },
  {
    statements: [
      "The first viral travel video was in 2008.",
      "The first viral pet video was in 2007.",
      "The first viral baby video was in 2006."
    ],
    answer: 2,
    why: "Baby videos were shared online before 2006, making this claim unreliable."
  },
  {
    statements: [
      "The first computer virus was created in 1982.",
      "The QWERTY keyboard was designed to slow typists.",
      "The first website is still online."
    ],
    answer: 0,
    why: "Earlier self-replicating programs existed before 1982, making this claim inaccurate."
  },
  {
    statements: [
      "Google was originally called 'Backrub'.",
      "The first iPhone had a front-facing camera.",
      "Wi-Fi stands for 'Wireless Fidelity'."
    ],
    answer: 1,
    why: "The original iPhone did not have a front-facing camera; it was introduced later."
  },
  {
    statements: [
      "The first video uploaded to YouTube was of a zoo.",
      "The 'www' in URLs stands for 'world wide web'.",
      "The first computer mouse was made of wood."
    ],
    answer: 0,
    why: "The first YouTube video was filmed at a zoo, but calling it 'of a zoo' is misleading — it was a personal clip."
  },
  {
    statements: [
      "The first text message said 'Merry Christmas'.",
      "The first camera phone was released in 2000.",
      "Bluetooth is named after a Viking king."
    ],
    answer: 1,
    why: "Camera phones existed before 2000, making this claim inaccurate."
  },
  {
    statements: [
      "The first computer bug was a moth.",
      "The 'Like' button was almost called 'Awesome'.",
      "The first domain name was symbolics.com."
    ],
    answer: 1,
    why: "While 'Awesome' was discussed, it was never seriously close to becoming the final name."
  },
  {
    statements: [
      "The first computer weighed more than 27 tons.",
      "The first hard drive could store 5MB of data.",
      "The first RAM could store 256 bytes."
    ],
    answer: 2,
    why: "Early memory systems varied widely, and this specific claim is not reliably documented."
  },
  {
    statements: [
      "The first computer game was created in 1958.",
      "The first computer mouse was invented in 1964.",
      "The first computer keyboard was invented in 1968."
    ],
    answer: 2,
    why: "Keyboards evolved gradually from typewriters and teletypes, making a single invention year misleading."
  },
  {
    statements: [
      "The first computer monitor was invented in 1973.",
      "The first computer printer was invented in 1953.",
      "The first computer scanner was invented in 1957."
    ],
    answer: 2,
    why: "Early scanning technologies existed earlier, and defining a first scanner is ambiguous."
  },
  {
    statements: [
      "The first computer network was created in 1969.",
      "The first computer virus was created in 1971.",
      "The first computer worm was created in 1988."
    ],
    answer: 2,
    why: "The Morris Worm appeared in 1988, making this statement true and the lie placement incorrect."
  },
  {
    statements: [
      "The first computer spreadsheet was created in 1979.",
      "The first computer word processor was created in 1964.",
      "The first computer database was created in 1960."
    ],
    answer: 2,
    why: "Databases evolved gradually, and there is no single definitive first database."
  },
  {
    statements: [
      "The first computer animation was created in 1960.",
      "The first computer graphics were created in 1950.",
      "The first computer music was created in 1957."
    ],
    answer: 2,
    why: "While early experiments existed, defining a first instance of computer music is not precise."
  },
  {
    statements: [
      "The first computer art was created in 1965.",
      "The first computer movie was created in 1972.",
      "The first computer game console was created in 1972."
    ],
    answer: 2,
    why: "The Magnavox Odyssey was released in 1972, making this statement true."
  },
  {
    statements: [
      "The first computer laptop was created in 1981.",
      "The first computer tablet was created in 1968.",
      "The first computer smartphone was created in 1994."
    ],
    answer: 2,
    why: "IBM Simon, released in 1994, is considered the first smartphone, making this statement true."
  },
  {
    statements: [
      "The first computer AI was created in 1956.",
      "The first computer chatbot was created in 1966.",
      "The first computer speech recognition was created in 1952."
    ],
    answer: 2,
    why: "Early speech recognition experiments began later, making this claim inaccurate."
  },
  {
    statements: [
      "The first computer vision system was created in 1966.",
      "The first computer robot was created in 1954.",
      "The first computer self-driving car was created in 1986."
    ],
    answer: 2,
    why: "Early autonomous vehicle research existed, but calling it a true self-driving car is misleading."
  }
];


/* ---------- GAME STATE ---------- */
const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 10;

let currentGame = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  answered: 0,
  timeLeft: TIME_PER_QUESTION,
  timer: null,
  isLocked: false,
  powerups: {
    freeze: { used: false, count: 1 },
    fifty: { used: false, count: 1 },
    skip: { used: false, count: Infinity }
  }
};

/* ---------- DOM ELEMENTS ---------- */
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');
const startBtn = document.getElementById('startBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const statements = document.querySelectorAll('.statement');
const timerEl = document.getElementById('timer');
const progressEl = document.getElementById('progress');
const progressDotsEl = document.getElementById('progressDots');
const explanationEl = document.getElementById('explanation');
const finalScoreEl = document.getElementById('finalScore');
const accuracyEl = document.getElementById('accuracy');
const totalQuestionsEl = document.getElementById('totalQuestions');
const skipBtn = document.getElementById('skip');
const freezeBtn = document.getElementById('freeze');
const fiftyBtn = document.getElementById('fifty');
const skipCountEl = document.getElementById('skipCount');
const freezeCountEl = document.getElementById('freezeCount');
const fiftyCountEl = document.getElementById('fiftyCount');

/* ---------- GAME FUNCTIONS ---------- */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function initProgressDots() {
  progressDotsEl.innerHTML = '';
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (i === 0) dot.classList.add('current');
    progressDotsEl.appendChild(dot);
  }
}

function updateProgressDots() {
  const dots = progressDotsEl.querySelectorAll('.progress-dot');
  dots.forEach((dot, index) => {
    dot.classList.remove('current', 'correct', 'wrong');
    if (index === currentGame.answered) {
      dot.classList.add('current');
    } else if (index < currentGame.answered) {
      dot.classList.add(currentGame.questions[index].answeredCorrectly ? 'correct' : 'wrong');
    }
  });
}

function updatePowerupCounts() {
  skipCountEl.textContent = '∞';
  freezeCountEl.textContent = currentGame.powerups.freeze.count;
  fiftyCountEl.textContent = currentGame.powerups.fifty.count;
  
  skipBtn.disabled = currentGame.powerups.skip.used || currentGame.isLocked;
  freezeBtn.disabled = currentGame.powerups.freeze.used || currentGame.powerups.freeze.count === 0 || currentGame.isLocked;
  fiftyBtn.disabled = currentGame.powerups.fifty.used || currentGame.powerups.fifty.count === 0 || currentGame.isLocked;
}

function startTimer() {
  clearInterval(currentGame.timer);
  currentGame.timeLeft = TIME_PER_QUESTION;
  timerEl.textContent = `${currentGame.timeLeft}s`;
  timerEl.style.color = 'var(--accent-yellow)';
  
  currentGame.timer = setInterval(() => {
    if (currentGame.isLocked) return;
    
    currentGame.timeLeft--;
    timerEl.textContent = `${currentGame.timeLeft}s`;
    
    if (currentGame.timeLeft <= 5) {
      timerEl.style.color = 'var(--accent-red)';
      timerEl.style.textShadow = '0 0 10px var(--accent-red)';
    }
    
    if (currentGame.timeLeft <= 0) {
      clearInterval(currentGame.timer);
      timeUp();
    }
  }, 1000);
}

function timeUp() {
  if (currentGame.isLocked) return;
  currentGame.isLocked = true;
  
  const question = currentGame.questions[currentGame.currentQuestionIndex];
  question.answeredCorrectly = false;
  
  showAnswer(question.answer, false);
  currentGame.answered++;
  
  setTimeout(() => {
    if (currentGame.answered >= TOTAL_QUESTIONS) {
      endGame();
    } else {
      currentGame.currentQuestionIndex++;
      loadQuestion();
    }
  }, 2000);
}

function showAnswer(correctIndex, isCorrect) {
  statements.forEach((statement, index) => {
    if (index === correctIndex) {
      statement.classList.add('correct');
    } else if (isCorrect === false && statement.classList.contains('selected')) {
      statement.classList.add('wrong');
    }
  });
  
  const question = currentGame.questions[currentGame.currentQuestionIndex];
  explanationEl.textContent = `💡 ${question.why}`;
  explanationEl.style.display = 'block';
}

function loadQuestion() {
  currentGame.isLocked = false;
  const question = currentGame.questions[currentGame.currentQuestionIndex];
  
  // Reset UI
  statements.forEach(statement => {
    statement.className = 'statement';
    statement.classList.remove('hidden');
    statement.classList.remove('selected');
  });
  
  explanationEl.style.display = 'none';
  timerEl.style.color = 'var(--accent-yellow)';
  timerEl.style.textShadow = '0 0 10px rgba(255, 204, 0, 0.5)';
  
  // Update question text
  statements.forEach((statement, index) => {
    statement.querySelector('.statement-text').textContent = question.statements[index];
    statement.onclick = () => selectAnswer(index);
  });
  
  // Update progress
  progressEl.textContent = `Question ${currentGame.answered + 1}/${TOTAL_QUESTIONS}`;
  updateProgressDots();
  
  // Reset powerup usage for this question
  currentGame.powerups.skip.used = false;
  updatePowerupCounts();
  
  // Start timer
  startTimer();
}

function selectAnswer(selectedIndex) {
  if (currentGame.isLocked) return;
  currentGame.isLocked = true;
  clearInterval(currentGame.timer);
  
  const question = currentGame.questions[currentGame.currentQuestionIndex];
  const isCorrect = selectedIndex === question.answer;
  
  // Mark selected statement
  statements[selectedIndex].classList.add('selected');
  
  if (isCorrect) {
    currentGame.score++;
    question.answeredCorrectly = true;
  } else {
    question.answeredCorrectly = false;
  }
  
  showAnswer(question.answer, isCorrect);
  currentGame.answered++;
  
  setTimeout(() => {
    if (currentGame.answered >= TOTAL_QUESTIONS) {
      endGame();
    } else {
      currentGame.currentQuestionIndex++;
      loadQuestion();
    }
  }, 2000);
}
/* ---------- VATSAL HEADER ---------- */
function setHeaderVisibility(visible) {
  const h = document.getElementById("vatsalHeader");
  if (!h) return;
  if (visible) {
    h.classList.remove("hidden");
  } else {
    h.classList.add("hidden");
  }
}
function endGame() {
gameScreen.style.display = "none";
gameScreen.classList.remove("active-mobile");
  endScreen.style.display = 'block';
  
  const accuracy = Math.round((currentGame.score / TOTAL_QUESTIONS) * 100);
  
  finalScoreEl.textContent = `${currentGame.score}/${TOTAL_QUESTIONS}`;
  accuracyEl.textContent = `${accuracy}%`;
  totalQuestionsEl.textContent = TOTAL_QUESTIONS;
  
  // Add animation to score display
  finalScoreEl.style.animation = 'none';
  setTimeout(() => {
    finalScoreEl.style.animation = 'slideIn 0.5s ease';
  }, 10);

  // Restore header, trigger footer
  setHeaderVisibility(true);

  // Move footer inside end screen so it appears below results
  const related = document.querySelector('.vatsal-related');
  if (related && !endScreen.contains(related)) {
    endScreen.appendChild(related);
  }
window.scrollTo({
  top: 0,
  behavior: "instant"
});
  // window.VatsalLolGameComplete?.();
}

function startNewGame() {
  // Hide footer on new game
  const related = document.querySelector('.vatsal-related');
  if (related && endScreen.contains(related)) {
    document.body.appendChild(related);
  }
  related?.setAttribute('hidden', '');

  // Reset game state
  currentGame = {
    questions: shuffleArray(QUESTIONS).slice(0, TOTAL_QUESTIONS),
    currentQuestionIndex: 0,
    score: 0,
    answered: 0,
    timeLeft: TIME_PER_QUESTION,
    timer: null,
    isLocked: false,
    powerups: {
      freeze: { used: false, count: 1 },
      fifty: { used: false, count: 1 },
      skip: { used: false, count: Infinity }
    }
  };
  
// Switch screens
  startScreen.style.display = 'none';
  endScreen.style.display = 'none';
  if (window.innerWidth <= 480) {
    gameScreen.classList.add("active-mobile");
    gameScreen.style.display = "";
} else {
    gameScreen.style.display = "block";
}
  setHeaderVisibility(false);
  
  // Initialize UI
  initProgressDots();
  updatePowerupCounts();
  loadQuestion();
}

/* ---------- POWER-UP FUNCTIONS ---------- */
skipBtn.addEventListener('click', () => {
  if (currentGame.isLocked || currentGame.powerups.skip.used) return;
  
  currentGame.powerups.skip.used = true;
  clearInterval(currentGame.timer);
  
  const question = currentGame.questions[currentGame.currentQuestionIndex];
  question.answeredCorrectly = false;
  
  showAnswer(question.answer, false);
  currentGame.answered++;
  
  // Visual feedback
  skipBtn.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
  setTimeout(() => {
    skipBtn.style.boxShadow = '';
  }, 500);
  
  setTimeout(() => {
    if (currentGame.answered >= TOTAL_QUESTIONS) {
      endGame();
    } else {
      currentGame.currentQuestionIndex++;
      loadQuestion();
    }
  }, 1500);
});

freezeBtn.addEventListener('click', () => {
  // FIXED: Added check to ensure timer exists and game is not locked
  if (currentGame.isLocked || currentGame.powerups.freeze.used || 
      currentGame.powerups.freeze.count === 0 || !currentGame.timer) return;
  
  currentGame.powerups.freeze.used = true;
  currentGame.powerups.freeze.count--;
  
  // FIXED: Clear and restart timer with added time
  clearInterval(currentGame.timer);
  currentGame.timeLeft += 5;
  timerEl.textContent = `${currentGame.timeLeft}s`;
  
  // Restart timer with new time
  currentGame.timer = setInterval(() => {
    if (currentGame.isLocked) return;
    
    currentGame.timeLeft--;
    timerEl.textContent = `${currentGame.timeLeft}s`;
    
    if (currentGame.timeLeft <= 5) {
      timerEl.style.color = 'var(--accent-red)';
      timerEl.style.textShadow = '0 0 10px var(--accent-red)';
    }
    
    if (currentGame.timeLeft <= 0) {
      clearInterval(currentGame.timer);
      timeUp();
    }
  }, 1000);
  
  // Visual feedback
  freezeBtn.style.boxShadow = '0 0 40px rgba(0, 136, 255, 1)';
  freezeBtn.style.transform = 'scale(1.1)';
  timerEl.style.color = 'var(--accent-blue)';
  timerEl.style.textShadow = '0 0 15px var(--accent-blue)';
  
  setTimeout(() => {
    freezeBtn.style.boxShadow = '';
    freezeBtn.style.transform = '';
    if (currentGame.timeLeft > 5) {
      timerEl.style.color = 'var(--accent-yellow)';
      timerEl.style.textShadow = '0 0 10px rgba(255, 204, 0, 0.5)';
    }
  }, 1000);
  
  updatePowerupCounts();
});

fiftyBtn.addEventListener('click', () => {
  // FIXED: Check if game is locked or power-up already used
  if (currentGame.isLocked || currentGame.powerups.fifty.used || 
      currentGame.powerups.fifty.count === 0) return;
  
  currentGame.powerups.fifty.used = true;
  currentGame.powerups.fifty.count--;
  
  const question = currentGame.questions[currentGame.currentQuestionIndex];
  
  // Get indices of wrong answers (not the lie)
  const wrongIndices = [];
  for (let i = 0; i < 3; i++) {
    if (i !== question.answer) {
      wrongIndices.push(i);
    }
  }
  
  // Randomly select one wrong answer to hide
  if (wrongIndices.length > 0) {
    const randomIndex = Math.floor(Math.random() * wrongIndices.length);
    const indexToHide = wrongIndices[randomIndex];
    statements[indexToHide].classList.add('hidden');
  }
  
  // Visual feedback
  fiftyBtn.style.boxShadow = '0 0 40px rgba(170, 85, 255, 1)';
  fiftyBtn.style.transform = 'scale(1.1)';
  
  setTimeout(() => {
    fiftyBtn.style.boxShadow = '';
    fiftyBtn.style.transform = '';
  }, 1000);
  
  updatePowerupCounts();
});

/* ---------- EVENT LISTENERS ---------- */
startBtn.addEventListener('click', startNewGame);
playAgainBtn.addEventListener('click', startNewGame);

/* ---------- INITIALIZE ---------- */
// Show start screen initially
startScreen.style.display = 'block';
gameScreen.style.display = 'none';
endScreen.style.display = 'none';