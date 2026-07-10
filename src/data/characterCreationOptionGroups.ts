import type { OptionGroup, Option } from "../types/characterCreationTypes";

const defaultImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%233a3a46'/%3E%3Ccircle cx='150' cy='115' r='48' fill='%2370707d'/%3E%3Cpath d='M65 260c12-60 55-92 85-92s73 32 85 92' fill='%2370707d'/%3E%3C/svg%3E";

//Export individual options so we can reference them in our visibility
export const genderFemaleOption: Option = {
  id: "gender_female",
  displayText: "Female",
  imageUrl: "options/gender_female.png",
};

export const genderMaleOption: Option = {
  id: "gender_male",
  displayText: "Male",
  imageUrl: "options/gender_male.png",
};

export const genderFutanariOption: Option = {
  id: "gender_futanari",
  displayText: "Futanari",
  imageUrl: "options/gender_futanari.png",
};

export const genderAndrogynousOption: Option = {
  id: "gender_androgynous",
  displayText: "Androgynous",
  imageUrl: "options/gender_androgynous.png",
};

export const genderOptionGroup = {
  id: "gender",
  title: "Gender",
  minSelectable: 1,
  maxSelectable: 1,
  options: [
    genderFemaleOption,
    genderMaleOption,
    genderFutanariOption,
    genderAndrogynousOption,
  ],
};

export const artstyleOptionGroup: OptionGroup = {
  id: "artstyle",
  title: "Artstyle",
  minSelectable: 1,
  maxSelectable: 1,
  allowCustomOptions: false,
  options: [
    {
      id: "artstyle_realistic",
      displayText: "Realistic",
      imageUrl: "/options/artstyle_realistic.png",
      altText: "artstyle",
    },
    {
      id: "artstyle_anime",
      displayText: "Anime",
      imageUrl: "/options/artstyle_anime.png",
      altText: "artstyle",
    },
  ],
};

export const raceOptionGroup: OptionGroup = {
  id: "race",
  title: "Race",
  minSelectable: 1,
  maxSelectable: 1,
  allowCustomOptions: true,
  options: [
    {
      id: "race_white",
      displayText: "White",
      imageUrl: defaultImage,
      altText: "race",
    },
    {
      id: "race_black",
      displayText: "Black",
      imageUrl: defaultImage,
      altText: "race",
    },
    {
      id: "race_asian",
      displayText: "Asian",
      imageUrl: defaultImage,
      altText: "race",
    },
    {
      id: "race_latina",
      displayText: "Latina",
      imageUrl: defaultImage,
      altText: "race",
    },
    {
      id: "race_indian",
      displayText: "Indian",
      imageUrl: defaultImage,
      altText: "race",
    },
    {
      id: "race_middleEastern",
      displayText: "Middle Eastern",
      imageUrl: defaultImage,
      altText: "race",
    },
    {
      id: "race_demon",
      displayText: "Demon",
      imageUrl: defaultImage,
      altText: "race",
    },
    {
      id: "race_elf",
      displayText: "Elf",
      imageUrl: defaultImage,
      altText: "race",
    },
    {
      id: "race_catgirl",
      displayText: "Cat Girl",
      imageUrl: defaultImage,
      altText: "race",
    },
  ],
};

export const eyesOptionGroup: OptionGroup = {
  id: "eyes",
  title: "Eye Color",
  minSelectable: 1,
  maxSelectable: 1,
  allowCustomOptions: true,
  options: [
    {
      id: "eyes_blue",
      displayText: "Blue",
      imageUrl: defaultImage,
      altText: "Blue eyes",
    },
    {
      id: "eyes_brown",
      displayText: "Brown",
      imageUrl: defaultImage,
      altText: "Brown eyes",
    },
    {
      id: "eyes_green",
      displayText: "Green",
      imageUrl: defaultImage,
      altText: "Green eyes",
    },
    {
      id: "eyes_hazel",
      displayText: "Hazel",
      imageUrl: defaultImage,
      altText: "Hazel eyes",
    },
    {
      id: "eyes_gray",
      displayText: "Gray",
      imageUrl: defaultImage,
      altText: "Gray eyes",
    },
    {
      id: "eyes_amber",
      displayText: "Amber",
      imageUrl: defaultImage,
      altText: "Amber eyes",
    },
    {
      id: "eyes_violet",
      displayText: "Violet",
      imageUrl: defaultImage,
      altText: "Violet eyes",
    },
    {
      id: "eyes_red",
      displayText: "Red",
      imageUrl: defaultImage,
      altText: "Red eyes",
    },
    {
      id: "eyes_heterochromia",
      displayText: "Heterochromia",
      imageUrl: defaultImage,
      altText: "Heterochromia eyes",
    },
  ],
};

export const hairstyleOptionGroup: OptionGroup = {
  id: "hairstyle",
  title: "Hairstyle",
  minSelectable: 1,
  maxSelectable: 1,
  allowCustomOptions: true,
  options: [
    {
      id: "hairstyle_short",
      displayText: "Short",
      imageUrl: defaultImage,
      altText: "Short hairstyle",
    },
    {
      id: "hairstyle_medium",
      displayText: "Medium",
      imageUrl: defaultImage,
      altText: "Medium hairstyle",
    },
    {
      id: "hairstyle_long",
      displayText: "Long",
      imageUrl: defaultImage,
      altText: "Long hairstyle",
    },
    {
      id: "hairstyle_pixie",
      displayText: "Pixie Cut",
      imageUrl: defaultImage,
      altText: "Pixie cut hairstyle",
    },
    {
      id: "hairstyle_bob",
      displayText: "Bob Cut",
      imageUrl: defaultImage,
      altText: "Bob cut hairstyle",
    },
    {
      id: "hairstyle_ponytail",
      displayText: "Ponytail",
      imageUrl: defaultImage,
      altText: "Ponytail hairstyle",
    },
    {
      id: "hairstyle_twin_tails",
      displayText: "Twin Tails",
      imageUrl: defaultImage,
      altText: "Twin tails hairstyle",
    },
    {
      id: "hairstyle_braids",
      displayText: "Braids",
      imageUrl: defaultImage,
      altText: "Braided hairstyle",
    },
    {
      id: "hairstyle_bun",
      displayText: "Bun",
      imageUrl: defaultImage,
      altText: "Bun hairstyle",
    },
    {
      id: "hairstyle_wavy",
      displayText: "Wavy",
      imageUrl: defaultImage,
      altText: "Wavy hairstyle",
    },
    {
      id: "hairstyle_curly",
      displayText: "Curly",
      imageUrl: defaultImage,
      altText: "Curly hairstyle",
    },
    {
      id: "hairstyle_afro",
      displayText: "Afro",
      imageUrl: defaultImage,
      altText: "Afro hairstyle",
    },
    {
      id: "hairstyle_buzzcut",
      displayText: "Buzzcut",
      imageUrl: defaultImage,
      altText: "Buzzcut hairstyle",
    },
    {
      id: "hairstyle_bald",
      displayText: "Bald",
      imageUrl: defaultImage,
      altText: "Bald hairstyle",
    },
  ],
};

export const hairColorOptionGroup: OptionGroup = {
  id: "hair_color",
  title: "Hair Color",
  minSelectable: 1,
  maxSelectable: 1,
  allowCustomOptions: true,
  options: [
    {
      id: "haircolor_black",
      displayText: "Black",
      imageUrl: defaultImage,
      altText: "Black hair",
    },
    {
      id: "haircolor_brown",
      displayText: "Brown",
      imageUrl: defaultImage,
      altText: "Brown hair",
    },
    {
      id: "haircolor_blonde",
      displayText: "Blonde",
      imageUrl: defaultImage,
      altText: "Blonde hair",
    },
    {
      id: "haircolor_red",
      displayText: "Red",
      imageUrl: defaultImage,
      altText: "Red hair",
    },
    {
      id: "haircolor_auburn",
      displayText: "Auburn",
      imageUrl: defaultImage,
      altText: "Auburn hair",
    },
    {
      id: "haircolor_white",
      displayText: "White",
      imageUrl: defaultImage,
      altText: "White hair",
    },
    {
      id: "haircolor_gray",
      displayText: "Gray",
      imageUrl: defaultImage,
      altText: "Gray hair",
    },
    {
      id: "haircolor_pink",
      displayText: "Pink",
      imageUrl: defaultImage,
      altText: "Pink hair",
    },
    {
      id: "haircolor_blue",
      displayText: "Blue",
      imageUrl: defaultImage,
      altText: "Blue hair",
    },
    {
      id: "haircolor_purple",
      displayText: "Purple",
      imageUrl: defaultImage,
      altText: "Purple hair",
    },
    {
      id: "haircolor_green",
      displayText: "Green",
      imageUrl: defaultImage,
      altText: "Green hair",
    },
    {
      id: "haircolor_multicolor",
      displayText: "Multicolor",
      imageUrl: defaultImage,
      altText: "Multicolor hair",
    },
  ],
};

export const bodyTypeOptionGroup: OptionGroup = {
  id: "body_type",
  title: "Body Type",
  minSelectable: 1,
  maxSelectable: 1,
  allowCustomOptions: true,
  options: [
    {
      id: "bodytype_slim",
      displayText: "Slim",
      imageUrl: defaultImage,
      altText: "Slim body type",
    },
    {
      id: "bodytype_athletic",
      displayText: "Athletic",
      imageUrl: defaultImage,
      altText: "Athletic body type",
    },
    {
      id: "bodytype_average",
      displayText: "Average",
      imageUrl: defaultImage,
      altText: "Average body type",
    },
    {
      id: "bodytype_curvy",
      displayText: "Curvy",
      imageUrl: defaultImage,
      altText: "Curvy body type",
    },
    {
      id: "bodytype_muscular",
      displayText: "Muscular",
      imageUrl: defaultImage,
      altText: "Muscular body type",
    },
    {
      id: "bodytype_soft",
      displayText: "Soft",
      imageUrl: defaultImage,
      altText: "Soft body type",
    },
    {
      id: "bodytype_tall",
      displayText: "Tall",
      imageUrl: defaultImage,
      altText: "Tall body type",
    },
    {
      id: "bodytype_petite",
      displayText: "Petite",
      imageUrl: defaultImage,
      altText: "Petite body type",
    },
  ],
};

export const breastSizeNoneOption: Option = {
  id: "breast_size_none",
  displayText: "No Breasts",
  imageUrl: defaultImage,
};

export const breastSizeOptionGroup: OptionGroup = {
  id: "breast_size",
  title: "Breast Size",
  minSelectable: 1,
  maxSelectable: 1,

  conditionalOverrides: [
    {
      when: {
        group: genderOptionGroup,
        options: [genderMaleOption],
      },
      visible: false,
    },
    {
      when: {
        group: genderOptionGroup,
        options: [genderAndrogynousOption],
      },
      visible: true,
      addOptions: [breastSizeNoneOption],
    },
  ],

  allowCustomOptions: true,
  options: [
    {
      id: "breast_size_flat",
      displayText: "Flat",
      imageUrl: defaultImage,
      altText: "Flat chest option",
    },
    {
      id: "breast_size_small",
      displayText: "Small",
      imageUrl: defaultImage,
      altText: "Small breast size option",
    },
    {
      id: "breast_size_medium",
      displayText: "Medium",
      imageUrl: defaultImage,
      altText: "Medium breast size option",
    },
    {
      id: "breast_size_large",
      displayText: "Large",
      imageUrl: defaultImage,
      altText: "Large breast size option",
    },
    {
      id: "breast_size_humongous",
      displayText: "Humongous",
      imageUrl: defaultImage,
      altText: "Humongous breast size option",
    },
  ],
};

export const cockSizeNoneOption: Option = {
  id: "cock_size_none",
  displayText: "No Cock",
  imageUrl: defaultImage,
};

export const cockSizeOptionGroup: OptionGroup = {
  id: "cock_size",
  title: "Cock Size",
  minSelectable: 1,
  maxSelectable: 1,

  conditionalOverrides: [
    {
      when: {
        group: genderOptionGroup,
        options: [genderFemaleOption],
      },
      visible: false,
    },
    {
      when: {
        group: genderOptionGroup,
        options: [genderAndrogynousOption],
      },
      visible: true,
      addOptions: [cockSizeNoneOption],
    },
  ],
  allowCustomOptions: true,
  options: [
    {
      id: "cock_size_micropenis",
      displayText: "Micropenis",
      imageUrl: defaultImage,
      altText: "Micropenis option",
    },
    {
      id: "cock_size_small",
      displayText: "Small",
      imageUrl: defaultImage,
      altText: "Small cock size option",
    },
    {
      id: "cock_size_medium",
      displayText: "Medium",
      imageUrl: defaultImage,
      altText: "Medium cock size option",
    },
    {
      id: "cock_size_large",
      displayText: "Large",
      imageUrl: defaultImage,
      altText: "Large cock size option",
    },
    {
      id: "cock_size_humongous",
      displayText: "Humongous",
      imageUrl: defaultImage,
      altText: "Humongous cock size option",
    },
  ],
};

export const buttSizeOptionGroup: OptionGroup = {
  id: "butt_size",
  title: "Butt Size",
  minSelectable: 1,
  maxSelectable: 1,
  allowCustomOptions: true,
  options: [
    {
      id: "buttsize_flat",
      displayText: "Flat",
      imageUrl: defaultImage,
      altText: "Flat butt size option",
    },
    {
      id: "buttsize_small",
      displayText: "Small",
      imageUrl: defaultImage,
      altText: "Small butt size option",
    },
    {
      id: "buttsize_medium",
      displayText: "Medium",
      imageUrl: defaultImage,
      altText: "Medium butt size option",
    },
    {
      id: "buttsize_large",
      displayText: "Large",
      imageUrl: defaultImage,
      altText: "Large butt size option",
    },
    {
      id: "buttsize_humongous",
      displayText: "Humongous",
      imageUrl: defaultImage,
      altText: "Humongous butt size option",
    },
  ],
};

export const personalityOptionGroup: OptionGroup = {
  id: "personality",
  title: "Personality",
  minSelectable: 1,
  maxSelectable: 3,
  allowCustomOptions: true,
  options: [
    { id: "personality_kind", displayText: "Kind" },
    { id: "personality_shy", displayText: "Shy" },
    { id: "personality_confident", displayText: "Confident" },
    { id: "personality_sarcastic", displayText: "Sarcastic" },
    { id: "personality_playful", displayText: "Playful" },
    { id: "personality_serious", displayText: "Serious" },
    { id: "personality_curious", displayText: "Curious" },
    { id: "personality_stoic", displayText: "Stoic" },
    { id: "personality_flirty", displayText: "Flirty" },
    { id: "personality_mysterious", displayText: "Mysterious" },
    { id: "personality_chaotic", displayText: "Chaotic" },
    { id: "personality_protective", displayText: "Protective" },
  ],
};

export const relationshipOptionGroup: OptionGroup = {
  id: "relationship",
  title: "Relationship to User",
  minSelectable: 1,
  maxSelectable: 2,
  allowCustomOptions: true,
  options: [
    { id: "relationship_stranger", displayText: "Stranger" },
    { id: "relationship_friend", displayText: "Friend" },
    { id: "relationship_best_friend", displayText: "Best Friend" },
    { id: "relationship_roommate", displayText: "Roommate" },
    { id: "relationship_coworker", displayText: "Coworker" },
    { id: "relationship_rival", displayText: "Rival" },
    { id: "relationship_mentor", displayText: "Mentor" },
    { id: "relationship_companion", displayText: "Companion" },
    { id: "relationship_partner", displayText: "Partner" },
    { id: "relationship_spouse", displayText: "Spouse" },
  ],
};

export const occupationOptionGroup: OptionGroup = {
  id: "occupation",
  title: "Occupation",
  minSelectable: 1,
  maxSelectable: 3,
  allowCustomOptions: true,
  options: [
    { id: "occupation_unemployed", displayText: "Unemployed" },
    { id: "occupation_student", displayText: "Student" },
    { id: "occupation_artist", displayText: "Artist" },
    { id: "occupation_musician", displayText: "Musician" },
    { id: "occupation_writer", displayText: "Writer" },
    { id: "occupation_scientist", displayText: "Scientist" },
    { id: "occupation_doctor", displayText: "Doctor" },
    { id: "occupation_engineer", displayText: "Engineer" },
    { id: "occupation_detective", displayText: "Detective" },
    { id: "occupation_soldier", displayText: "Soldier" },
    { id: "occupation_royalty", displayText: "Royalty" },
    { id: "occupation_mage", displayText: "Mage" },
    { id: "occupation_adventurer", displayText: "Adventurer" },
    { id: "occupation_shopkeeper", displayText: "Shopkeeper" },
    { id: "occupation_criminal", displayText: "Criminal" },
  ],
};

export const hobbiesOptionGroup: OptionGroup = {
  id: "hobbies",
  title: "Hobbies",
  minSelectable: 0,
  maxSelectable: null,
  allowCustomOptions: true,
  options: [
    { id: "hobbies_reading", displayText: "Reading" },
    { id: "hobbies_cooking", displayText: "Cooking" },
    { id: "hobbies_gaming", displayText: "Gaming" },
    { id: "hobbies_music", displayText: "Music" },
    { id: "hobbies_dancing", displayText: "Dancing" },
    { id: "hobbies_fitness", displayText: "Fitness" },
    { id: "hobbies_hiking", displayText: "Hiking" },
    { id: "hobbies_travel", displayText: "Travel" },
    { id: "hobbies_painting", displayText: "Painting" },
    { id: "hobbies_photography", displayText: "Photography" },
    { id: "hobbies_gardening", displayText: "Gardening" },
    { id: "hobbies_collecting", displayText: "Collecting" },
  ],
};

export const kinksOptionGroup: OptionGroup = {
  id: "kinks",
  title: "Kinks",
  minSelectable: 0,
  maxSelectable: null,
  allowCustomOptions: true,
  options: [
    {
      id: "kinks_breeding",
      displayText: "Breeding",
      descriptionText:
        "Impregnation, creampies, and getting/filling someone pregnant.",
    },
    {
      id: "kinks_exhibitionism",
      displayText: "Exhibitionism",
      descriptionText: "Public sex, being watched, or showing off lewd acts.",
    },
    {
      id: "kinks_cumflation",
      displayText: "Cumflation",
      descriptionText:
        "Extreme cum inflation and belly bulging from large loads.",
    },
    {
      id: "kinks_incest",
      displayText: "Incest",
      descriptionText:
        "Taboo family relations and forbidden familial dynamics.",
    },
    {
      id: "kinks_bondage",
      displayText: "Bondage",
      descriptionText: "Restraints, ropes, cuffs, and immobilization play.",
    },
    {
      id: "kinks_bdsm",
      displayText: "BDSM",
      descriptionText: "Dominance, submission, pain, and power exchange.",
    },
    {
      id: "kinks_anal",
      displayText: "Anal",
      descriptionText: "Anal sex, training, and ass-focused play.",
    },
    {
      id: "kinks_creampie",
      displayText: "Creampie",
      descriptionText: "Internal cumshots and messy leaking after filling.",
    },
    {
      id: "kinks_gangbang",
      displayText: "Gangbang",
      descriptionText: "Multiple partners at once, being overwhelmed.",
    },
    {
      id: "kinks_cnc",
      displayText: "CNC",
      descriptionText: "Consensual Non-Consent and ravishment fantasies.",
    },
    {
      id: "kinks_petplay",
      displayText: "Petplay",
      descriptionText: "Animal roleplay, collars, and owner/pet dynamics.",
    },
    {
      id: "kinks_mindbreak",
      displayText: "Mind Break",
      descriptionText: "Overstimulation leading to total submissive breakdown.",
    },
    {
      id: "kinks_possessive",
      displayText: "Possessive",
      descriptionText: "Marking, claiming, and intense ownership.",
    },
    {
      id: "kinks_roleplay",
      displayText: "Roleplay",
      descriptionText: "Acting out specific characters or scenarios.",
    },
  ],
};

export const outfitOptionGroup: OptionGroup = {
  id: "outfit",
  title: "Typical Outfit",
  minSelectable: 0,
  maxSelectable: 1,
  allowCustomOptions: true,
  options: [
    {
      id: "outfit_casual",
      displayText: "Casual",
      imageUrl: defaultImage,
      altText: "Casual outfit",
    },
    {
      id: "outfit_formal",
      displayText: "Formal",
      imageUrl: defaultImage,
      altText: "Formal outfit",
    },
    {
      id: "outfit_business",
      displayText: "Business",
      imageUrl: defaultImage,
      altText: "Business outfit",
    },
    {
      id: "outfit_streetwear",
      displayText: "Streetwear",
      imageUrl: defaultImage,
      altText: "Streetwear outfit",
    },
    {
      id: "outfit_goth",
      displayText: "Goth",
      imageUrl: defaultImage,
      altText: "Goth outfit",
    },
    {
      id: "outfit_punk",
      displayText: "Punk",
      imageUrl: defaultImage,
      altText: "Punk outfit",
    },
    {
      id: "outfit_sporty",
      displayText: "Sporty",
      imageUrl: defaultImage,
      altText: "Sporty outfit",
    },
    {
      id: "outfit_cozy",
      displayText: "Cozy",
      imageUrl: defaultImage,
      altText: "Cozy outfit",
    },
    {
      id: "outfit_uniform",
      displayText: "Uniform",
      imageUrl: defaultImage,
      altText: "Uniform outfit",
    },
    {
      id: "outfit_fantasy",
      displayText: "Fantasy",
      imageUrl: defaultImage,
      altText: "Fantasy outfit",
    },
    {
      id: "outfit_sci_fi",
      displayText: "Sci-Fi",
      imageUrl: defaultImage,
      altText: "Sci-fi outfit",
    },
    {
      id: "outfit_lingerie",
      displayText: "Lingerie",
      imageUrl: defaultImage,
      altText: "Lingerie outfit",
    },
  ],
};

export const featuresOptionGroup: OptionGroup = {
  id: "features",
  title: "Additional Features",
  minSelectable: 0,
  maxSelectable: null,
  allowCustomOptions: true,
  options: [
    { id: "features_tattoos", displayText: "Tattoos" },
    { id: "features_piercings", displayText: "Piercings" },
    { id: "features_scars", displayText: "Scars" },
    { id: "features_freckles", displayText: "Freckles" },
    { id: "features_moles", displayText: "Moles" },
    { id: "features_glasses", displayText: "Glasses" },
    { id: "features_jewelry", displayText: "Jewelry" },
    { id: "features_horns", displayText: "Horns" },
    { id: "features_tail", displayText: "Tail" },
    { id: "features_wings", displayText: "Wings" },
  ],
};

export const allOptionGroups = {
  genderOptionGroup,
  artstyleOptionGroup,
  raceOptionGroup,
  eyesOptionGroup,
  hairstyleOptionGroup,
  hairColorOptionGroup,
  bodyTypeOptionGroup,
  breastSizeOptionGroup,
  cockSizeOptionGroup,
  buttSizeOptionGroup,
  personalityOptionGroup,
  relationshipOptionGroup,
  occupationOptionGroup,
  hobbiesOptionGroup,
  kinksOptionGroup,
  outfitOptionGroup,
  featuresOptionGroup,
};

export const visualOptionGroups = {
  genderOptionGroup,
  artstyleOptionGroup,
  raceOptionGroup,
  eyesOptionGroup,
  hairstyleOptionGroup,
  hairColorOptionGroup,
  bodyTypeOptionGroup,
  breastSizeOptionGroup,
  cockSizeOptionGroup,
  buttSizeOptionGroup,
  outfitOptionGroup,
  featuresOptionGroup,
};
