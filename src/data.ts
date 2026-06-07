import { User, Report, Cluster, District, Session, CaseReferral, SasaMonthlyReport } from './types';

export const ROLE_CFG = {
  admin: { label: "National Admin", color: "#991b1b", bg: "#fee2e2", icon: "🛡️" },
  tot: { label: "Trainer of Trainers", color: "#c44d00", bg: "#fff4ec", icon: "🎓" },
  data_entry: { label: "Data Entry Officer", color: "#c44d00", bg: "#fff4ec", icon: "📝" },
  district_coordinator: { label: "District Coordinator", color: "#065f46", bg: "#d1fae5", icon: "🏛️" },
  viewer: { label: "Viewer", color: "#1e40af", bg: "#dbeafe", icon: "👁️" },
  sasa_officer: { label: "SASA Officer", color: "#6d28d9", bg: "#ede9fe", icon: "🛡️" },
  program_manager: { label: "Program Manager", color: "#0e7490", bg: "#cffafe", icon: "📊" },
  field_officer: { label: "Field Officer", color: "#92400e", bg: "#fef3c7", icon: "🌍" },
  program_staff: { label: "Program Staff", color: "#3730a3", bg: "#e0e7ff", icon: "📚" },
  cartographer: { label: "Cartographer", color: "#166534", bg: "#dcfce7", icon: "🗺️" },
};

export const CAN = {
  submitReport: ["admin", "tot", "data_entry", "district_coordinator"],
  approveReport: ["admin", "district_coordinator"],
  manageUsers: ["admin"],
  exportData: ["admin", "district_coordinator"],
};

export const can = (role: string, act: keyof typeof CAN) => {
  const allowed = CAN[act] || [];
  return allowed.includes(role);
};

export const USERS_INIT: User[] = [
  { id: "1", email: "admin@ujamaa.mw", password: "admin123", role: "admin", name: "Administrator", district: null, avatar: "GK", status: "active" },
  { id: "2", email: "tot@ujamaa.mw", password: "tot123", role: "tot", name: "Trainer of Trainers", district: "Lilongwe", avatar: "TD", status: "active", clusterId: 0 },
  { id: "3", email: "entry@ujamaa.mw", password: "entry123", role: "data_entry", name: "Data Officer", district: "Lilongwe", avatar: "JB", status: "active" },
  { id: "4", email: "coord@ujamaa.mw", password: "coord123", role: "district_coordinator", name: "District Coordinator", district: "Blantyre", avatar: "MC", status: "active" },
  { id: "5", email: "viewer@ujamaa.mw", password: "view123", role: "viewer", name: "User 01", district: null, avatar: "TN", status: "active" },
  { id: "6", email: "sasa@ujamaa.mw", password: "sasa123", role: "sasa_officer", name: "SASA Officer", district: "Lilongwe", avatar: "SO", status: "active" },
  { id: "7", email: "manager@ujamaa.mw", password: "manager123", role: "program_manager", name: "Program Manager", district: null, avatar: "PM", status: "active" },
  { id: "8", email: "officer@ujamaa.mw", password: "officer123", role: "field_officer", name: "Field Officer", district: "Blantyre", avatar: "FO", status: "active" },
  { id: "9", email: "staff@ujamaa.mw", password: "staff123", role: "program_staff", name: "Program Staff", district: "Zomba", avatar: "PS", status: "active" },
  { id: "10", email: "gis@ujamaa.mw", password: "gis123", role: "cartographer", name: "GIS Cartographer", district: null, avatar: "GC", status: "active" },
];

export const REPORTS_INIT: Report[] = [
  { id: 1, school: "Kawale Primary", district: "Lilongwe", zone: "Kawale Zone", boys: 34, girls: 38, curriculum: "HIM", session: "Topic 1: Getting to Know You", status: "approved", submitted_by: "John Banda", submitted_at: "2026-05-01", challenges: "Low attendance on day 1", success: "Boys loved the Adjective Game" },
  { id: 2, school: "Mbayani Primary", district: "Blantyre", zone: "Mbayani Zone", boys: 28, girls: 32, curriculum: "GESD", session: "Session 2: Intro to GESD", status: "pending", submitted_by: "Mary Chirwa", submitted_at: "2026-05-03", challenges: "None", success: "Girls loved the Private Parts song" },
  { id: 3, school: "Zomba LEA School", district: "Zomba", zone: "Zomba Zone", boys: 0, girls: 41, curriculum: "GESD", session: "Session 3: Awareness", status: "approved", submitted_by: "John Banda", submitted_at: "2026-05-04", challenges: "Venue too small", success: "Great Gazelle Story participation" },
  { id: 4, school: "Mzimba Primary", district: "Mzimba", zone: "Mzimba Zone", boys: 45, girls: 0, curriculum: "HIM", session: "Topic 2: My Value System", status: "rejected", submitted_by: "Mary Chirwa", submitted_at: "2026-05-05", challenges: "Some boys absent", success: "Values discussion very lively" },
  { id: 5, school: "Karonga Primary", district: "Karonga", zone: "Karonga Zone", boys: 29, girls: 31, curriculum: "Combined", session: "Topic 6 / Session 6 Combined", status: "pending", submitted_by: "John Banda", submitted_at: "2026-05-06", challenges: "Rain disrupted session", success: "Boys and girls worked well together" },
  { id: 6, school: "Dedza Primary", district: "Dedza", zone: "Dedza Zone", boys: 38, girls: 35, curriculum: "HIM", session: "Topic 3: Intro to H.I.M", status: "approved", submitted_by: "John Banda", submitted_at: "2026-05-07", challenges: "None", success: "Strong verbal techniques uptake" },
  { id: 7, school: "Dowa LEA School", district: "Dowa", zone: "Dowa Zone", boys: 0, girls: 44, curriculum: "GESD", session: "Session 4: Verbal Techniques", status: "pending", submitted_by: "Mary Chirwa", submitted_at: "2026-05-08", challenges: "Short on time", success: "Girls very confident saying NO!" },
];

export const CLUSTERS: Cluster[] = [
  { id: 0, name: "Lilongwe Central Cluster", district: "Lilongwe", lead: "TOT Demo", schools: 4, students: 1240, progress: 78, trained: 3 },
  { id: 1, name: "Lilongwe North Cluster", district: "Lilongwe", lead: "Agnes Phiri", schools: 3, students: 980, progress: 65, trained: 2 },
  { id: 2, name: "Blantyre South Cluster", district: "Blantyre", lead: "John Mwale", schools: 3, students: 890, progress: 85, trained: 3 },
  { id: 3, name: "Blantyre Girls Cluster", district: "Blantyre", lead: "Mary Chirwa", schools: 3, students: 760, progress: 72, trained: 2 },
  { id: 4, name: "Zomba Urban Cluster", district: "Zomba", lead: "Alinafe Banda", schools: 4, students: 1380, progress: 72, trained: 3 },
  { id: 5, name: "Mzimba Heritage Cluster", district: "Mzimba", lead: "Tawina Nyirenda", schools: 4, students: 1050, progress: 62, trained: 3 },
  { id: 6, name: "Karonga Lakeshore Cluster", district: "Karonga", lead: "Chisomo Phiri", schools: 3, students: 720, progress: 90, trained: 2 },
  { id: 7, name: "Dedza Highland Cluster", district: "Dedza", lead: "Patrick Kachingwe", schools: 3, students: 560, progress: 45, trained: 2 },
  { id: 8, name: "Dowa Central Cluster", district: "Dowa", lead: "Loveness Chirambo", schools: 4, students: 1100, progress: 68, trained: 3 },
  { id: 9, name: "Mangochi Stars Cluster", district: "Mangochi", lead: "Fatima Yusuf", schools: 3, students: 680, progress: 55, trained: 2 },
];

export const DISTRICTS: District[] = [
  { name: "Lilongwe",    r: "Central",  s: "Active",  tots: 105, schools: 120, cov: 35, population: "1,647,000", zones: 12, teachersTrained: 312 },
  { name: "Blantyre",    r: "Southern", s: "Active",  tots: 84,  schools: 105, cov: 28, population: "1,068,000", zones: 9,  teachersTrained: 248 },
  { name: "Zomba",       r: "Southern", s: "Active",  tots: 54,  schools: 72,  cov: 18, population: "628,000",   zones: 7,  teachersTrained: 164 },
  { name: "Mzimba",      r: "Northern", s: "Active",  tots: 72,  schools: 95,  cov: 24, population: "838,000",   zones: 8,  teachersTrained: 216 },
  { name: "Karonga",     r: "Northern", s: "Planned", tots: 0,   schools: 62,  cov: 0,  population: "363,000",   zones: 5,  teachersTrained: 0   },
  { name: "Mangochi",    r: "Southern", s: "Active",  tots: 66,  schools: 90,  cov: 22, population: "847,000",   zones: 8,  teachersTrained: 196 },
  { name: "Kasungu",     r: "Central",  s: "Active",  tots: 60,  schools: 85,  cov: 20, population: "779,000",   zones: 7,  teachersTrained: 178 },
  { name: "Dedza",       r: "Central",  s: "Active",  tots: 42,  schools: 68,  cov: 14, population: "624,000",   zones: 6,  teachersTrained: 124 },
  { name: "Dowa",        r: "Central",  s: "Active",  tots: 45,  schools: 72,  cov: 15, population: "580,000",   zones: 6,  teachersTrained: 134 },
  { name: "Thyolo",      r: "Southern", s: "Planned", tots: 0,   schools: 68,  cov: 0,  population: "621,000",   zones: 6,  teachersTrained: 0   },
  { name: "Mulanje",     r: "Southern", s: "Planned", tots: 0,   schools: 65,  cov: 0,  population: "535,000",   zones: 6,  teachersTrained: 0   },
  { name: "Rumphi",      r: "Northern", s: "Planned", tots: 0,   schools: 48,  cov: 0,  population: "258,000",   zones: 4,  teachersTrained: 0   },
  { name: "Chitipa",     r: "Northern", s: "Planned", tots: 0,   schools: 45,  cov: 0,  population: "228,000",   zones: 4,  teachersTrained: 0   },
  { name: "Ntcheu",      r: "Central",  s: "Active",  tots: 36,  schools: 56,  cov: 12, population: "476,000",   zones: 5,  teachersTrained: 108 },
  { name: "Machinga",    r: "Southern", s: "Active",  tots: 36,  schools: 65,  cov: 12, population: "472,000",   zones: 5,  teachersTrained: 108 },
  { name: "Nkhotakota",  r: "Central",  s: "Active",  tots: 24,  schools: 58,  cov: 8,  population: "342,000",   zones: 4,  teachersTrained: 72  },
  { name: "Nkhata Bay",  r: "Northern", s: "Planned", tots: 0,   schools: 52,  cov: 0,  population: "226,000",   zones: 4,  teachersTrained: 0   },
  { name: "Balaka",      r: "Southern", s: "Active",  tots: 36,  schools: 48,  cov: 12, population: "349,000",   zones: 4,  teachersTrained: 108 },
  { name: "Chiradzulu",  r: "Southern", s: "Planned", tots: 0,   schools: 38,  cov: 0,  population: "288,000",   zones: 3,  teachersTrained: 0   },
  { name: "Mwanza",      r: "Southern", s: "Planned", tots: 18,  schools: 22,  cov: 6,  population: "138,000",   zones: 2,  teachersTrained: 54  },
  { name: "Likoma",      r: "Northern", s: "Planned", tots: 0,   schools: 8,   cov: 0,  population: "12,000",    zones: 1,  teachersTrained: 0   },
  { name: "Mchinji",     r: "Central",  s: "Planned", tots: 0,   schools: 55,  cov: 0,  population: "456,000",   zones: 5,  teachersTrained: 0   },
  { name: "Salima",      r: "Central",  s: "Planned", tots: 0,   schools: 50,  cov: 0,  population: "362,000",   zones: 4,  teachersTrained: 0   },
  { name: "Ntchisi",     r: "Central",  s: "Planned", tots: 0,   schools: 42,  cov: 0,  population: "228,000",   zones: 3,  teachersTrained: 0   },
  { name: "Phalombe",    r: "Southern", s: "Planned", tots: 0,   schools: 40,  cov: 0,  population: "318,000",   zones: 3,  teachersTrained: 0   },
  { name: "Chikwawa",    r: "Southern", s: "Planned", tots: 0,   schools: 55,  cov: 0,  population: "498,000",   zones: 5,  teachersTrained: 0   },
  { name: "Nsanje",      r: "Southern", s: "Planned", tots: 0,   schools: 35,  cov: 0,  population: "238,000",   zones: 3,  teachersTrained: 0   },
  { name: "Neno",        r: "Southern", s: "Planned", tots: 0,   schools: 25,  cov: 0,  population: "108,005",   zones: 2,  teachersTrained: 0   }
];

export const DISTRICT_INFO: Record<string, { lat: number; lng: number }> = {
  "Chitipa": { lat: -9.70, lng: 33.27 }, "Karonga": { lat: -9.93, lng: 33.93 }, "Rumphi": { lat: -11.01, lng: 33.86 },
  "Nkhata Bay": { lat: -11.62, lng: 34.30 }, "Likoma": { lat: -12.06, lng: 34.73 }, "Mzimba": { lat: -11.90, lng: 33.60 },
  "Nkhotakota": { lat: -12.92, lng: 34.30 }, "Ntchisi": { lat: -13.37, lng: 33.87 }, "Dowa": { lat: -13.66, lng: 33.94 },
  "Kasungu": { lat: -13.01, lng: 33.47 }, "Mchinji": { lat: -13.80, lng: 32.88 }, "Lilongwe": { lat: -13.97, lng: 33.79 },
  "Dedza": { lat: -14.37, lng: 34.33 }, "Ntcheu": { lat: -14.83, lng: 34.64 }, "Salima": { lat: -13.78, lng: 34.44 },
  "Mangochi": { lat: -14.48, lng: 35.27 }, "Machinga": { lat: -15.18, lng: 35.52 }, "Zomba": { lat: -15.39, lng: 35.32 },
  "Chiradzulu": { lat: -15.68, lng: 35.15 }, "Blantyre": { lat: -15.79, lng: 35.00 }, "Mwanza": { lat: -15.61, lng: 34.52 },
  "Thyolo": { lat: -16.07, lng: 35.14 }, "Mulanje": { lat: -15.93, lng: 35.52 }, "Phalombe": { lat: -15.81, lng: 35.65 },
  "Chikwawa": { lat: -16.03, lng: 34.80 }, "Nsanje": { lat: -16.92, lng: 35.27 }, "Balaka": { lat: -14.98, lng: 34.96 }, "Neno": { lat: -15.40, lng: 34.65 }
};

export const HIM_SESSIONS: Session[] = [
  {
    "num": "HIM1",
    "title": "My Value System",
    "dur": "1 hr",
    "desc": "My Value System",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Objective:** To help students develop the skills of Self-Awareness regarding Personal and Social Values."
      },
      {
        "type": "paragraph",
        "content": "**Values definition:** These are principles or standards of behavior that reflect what individuals consider important, valuable, or useful/meaningful."
      },
      {
        "type": "paragraph",
        "content": "Process"
      },
      {
        "type": "paragraph",
        "items": [
          "The trainer asks the students to brainstorm on the word 'Values'.",
          "Note the reaction of the students on the board or paper or flip chart. All responses may be noted without belittling any participant.",
          "The Trainer then talks about the kinds of values."
        ]
      },
      {
        "type": "paragraph",
        "content": "**Personal Values:** are those which guide a human being for personal growth and survival. E.g. honesty, responsibility, humanity, and respect."
      },
      {
        "type": "paragraph",
        "content": "**Social Values:** are a set of moral principles defined by society dynamics, institutions, traditions and cultural beliefs. They enable individuals to improve their social life, enhance the understanding of the social set up and build on one's capability."
      },
      {
        "type": "values_grid",
        "columns": [
          {
            "title": "PERSONAL VALUES",
            "items": [
              "Cleanliness",
              "Loyalty",
              "Love",
              "Tolerance",
              "Gratitude",
              "Forgiveness",
              "Respect",
              "Honesty",
              "Patience",
              "Courtesy",
              "Patriotism",
              "Control over sense"
            ]
          },
          {
            "title": "SOCIAL VALUES",
            "items": [
              "Discipline",
              "Co-operation",
              "Justice",
              "Non-violence",
              "Brotherhood",
              "Kindness",
              "Charity",
              "Dignity of individual",
              "Sharing",
              "Caring"
            ]
          }
        ]
      }
    ]
  },
  {
    "num": "HIM2",
    "title": "Life Skills: Puberty and Peer Pressure",
    "dur": "1 hr",
    "desc": "Life Skills: Puberty and Peer Pressure",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "Session Objectives"
      },
      {
        "type": "paragraph",
        "items": [
          "Recognize the physical, emotional, and psychological changes that occur during puberty.",
          "Identify challenges that boys and girls face during puberty.",
          "Develop skills — especially for boys — on how to resist negative peer pressure."
        ]
      },
      {
        "type": "trainer_says",
        "content": "The keyword when it comes to puberty is CHANGE. Your body is changing, your feelings are changing, and your relationships with those around you are changing. You are growing up and becoming an adult. This important phase is called puberty, a natural transition from childhood to adulthood."
      },
      {
        "type": "paragraph",
        "content": "1. Understanding Puberty"
      },
      {
        "type": "paragraph",
        "content": "Puberty is a developmental stage during which a child's body matures into an adult body that is capable of reproduction. It typically occurs between: **Boys: 9–14 years** and **Girls: 8–13 years**. The exact age may vary based on genetics, nutrition, and environmental factors. There are two types of changes: Physical and Emotional/Psychological."
      },
      {
        "type": "paragraph",
        "content": "Physical Changes In Males"
      },
      {
        "type": "paragraph",
        "items": [
          "Growth of facial and body hair",
          "Deepening of the voice",
          "Enlargement of testes and penis",
          "Increase in muscle mass",
          "Growth spurts"
        ]
      },
      {
        "type": "paragraph",
        "content": "Physical Changes In Females"
      },
      {
        "type": "paragraph",
        "items": [
          "Breast development",
          "Onset of menstruation (periods)",
          "Widening of hips",
          "Growth of body hair",
          "Growth spurts"
        ]
      },
      {
        "type": "tip",
        "content": "Activity Option: Use diagrams or illustrations to point out the changes visually. Allow learners to ask questions and clarify doubts respectfully."
      },
      {
        "type": "paragraph",
        "content": "Psychological and Emotional Changes"
      },
      {
        "type": "paragraph",
        "items": [
          "Increased sensitivity and mood swings",
          "Feelings of embarrassment or self-consciousness",
          "Desire for more independence",
          "Development of sexual identity and attraction",
          "Confusion or curiosity about bodily and emotional changes"
        ]
      },
      {
        "type": "paragraph",
        "content": "**Discussion Prompt:** \"What emotions or feelings have you or your friends experienced during puberty?\" Let students share experiences (if comfortable). Assure them that these changes are normal and happen to everyone."
      },
      {
        "type": "paragraph",
        "content": "3. Challenges Faced During Puberty"
      },
      {
        "type": "trainer_says",
        "content": "\"What are some of the challenges that boys and girls face during puberty?\""
      },
      {
        "type": "paragraph",
        "items": [
          "Feeling shy or embarrassed about body changes",
          "Menstrual discomfort for girls",
          "Pressure to appear mature or act tough",
          "Peer teasing or bullying",
          "Not knowing who to talk to about new feelings",
          "Body shaming"
        ]
      },
      {
        "type": "tip",
        "content": "Facilitator Tips: Normalize their concerns. Emphasize that these changes happen at different times for everyone."
      },
      {
        "type": "paragraph",
        "content": "Taking Care of Your Body"
      },
      {
        "type": "paragraph",
        "content": "**Hair:** Just like your skin, your hair might be oilier than it used to be. Washing it more often will keep it clean."
      },
      {
        "type": "paragraph",
        "content": "**Dental:** Brush your teeth and floss at least twice each day: once in the morning and once at night. For extra fresh breath, be sure to brush your tongue. Generally, maintain cleanliness."
      },
      {
        "type": "paragraph",
        "content": "4. Introduction to Peer Pressure"
      },
      {
        "type": "trainer_says",
        "content": "As you go through puberty, you may also feel pressure from your friends or peers to act or behave in certain ways. This is called peer pressure."
      },
      {
        "type": "paragraph",
        "content": "**Examples of Negative Peer Pressure:**"
      },
      {
        "type": "paragraph",
        "items": [
          "Skipping school",
          "Starting fights",
          "Using drugs or alcohol",
          "Engaging in early sexual activity"
        ]
      },
      {
        "type": "trainer_says",
        "content": "Trainer Emphasizes: Not all peer pressure is bad, but negative peer pressure can lead to unsafe and harmful behaviors."
      },
      {
        "type": "paragraph",
        "content": "How Does Peer Pressure Affect Us?"
      },
      {
        "type": "paragraph",
        "items": [
          "Fashion choices.",
          "Alcohol and drug use.",
          "Decision to have a boyfriend or girlfriend.",
          "Choice of who your friends are.",
          "Attitude towards school and academic performance."
        ]
      },
      {
        "type": "paragraph",
        "content": "6. Resisting Peer Pressure – Skills for Boys"
      },
      {
        "type": "trainer_says",
        "content": "Boys often feel pressure to prove they are strong, brave, or 'manly'. But real strength comes from making good choices and respecting yourself and others."
      },
      {
        "type": "paragraph",
        "items": [
          "Hanging out with people who like doing similar stuff as you.",
          "Saying NO when you don't want to be part of something.",
          "Try not to judge others. Respecting their choices increases the chance that they will respect yours.",
          "Take action. Standing up for yourself and others can be a way to gain that comfort.",
          "Have Self-confidence.",
          "Choose your friends wisely.",
          "Talk to a trusted adult.",
          "Do not make excuses – say exactly how you feel."
        ]
      },
      {
        "type": "activity",
        "title": "ROLE PLAY ACTIVITY",
        "content": "Introduce students to the Three C's model: the Challenge, the Choices, and the Consequences. Divide the group into four teams and assign a role-play scenario to each team. Each group will use the Three C's model to write out the challenges, choices, and consequences for each decision.",
        "items": [
          "Scenario: Scenario 1: You do not want to smoke. Your friend is trying to persuade you to have a cigarette. Use all your arguments to support your decision not to smoke.",
          "Scenario: Scenario 2: You have seen how your father's life has been damaged from drinking too much alcohol and have decided never to drink. Your new friend comes with a bottle of alcohol and wants to try it after school. He is trying to convince you to join him. Use all your arguments to support your decision not to drink.",
          "Scenario: Scenario 3: You have just finished an exam and even though you studied, you are sure you did not do well. Some of your classmates have offered you some marijuana (bhang) to smoke and tell you it will make you feel better. You do not want to try drugs. Use all your arguments to support your decision to not use drugs."
        ]
      },
      {
        "type": "paragraph",
        "content": "Teach Positive Responses"
      },
      {
        "type": "paragraph",
        "items": [
          "\"No thanks, that's not for me.\"",
          "\"I don't want to get in trouble.\"",
          "\"I respect myself too much to do that.\""
        ]
      },
      {
        "type": "paragraph",
        "content": "7. Wrapping Up – Key Points"
      },
      {
        "type": "paragraph",
        "items": [
          "Puberty brings many physical and emotional changes — this is normal.",
          "Everyone goes through these changes at different times.",
          "You can take care of yourself by practicing good hygiene, talking to trusted adults, and avoiding negative peer influences.",
          "Saying \"no\" to negative peer pressure is a sign of strength and maturity."
        ]
      },
      {
        "type": "tip",
        "content": "Trainer Reminders: Use respectful, age-appropriate language. Create a safe, non-judgmental space for questions. Be sensitive to learners who may be shy or have limited knowledge of these topics. Encourage learners to talk to parents, guardians, or counselors if they have personal concerns."
      }
    ]
  },
  {
    "num": "HIM3",
    "title": "Life Skills – Self-Esteem",
    "dur": "1 hr",
    "desc": "Life Skills – Self-Esteem",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "Self-esteem describes how people feel about themselves. How people feel about themselves influences their actions towards others and what they can accomplish in life. People with high self-esteem know that they are worthy of love and respect. They respect themselves. When people feel worthy of love and respect, they expect the same from others."
      },
      {
        "type": "paragraph",
        "content": "Having self-esteem does not mean that you never get upset or angry with yourself. Everyone gets frustrated at times. Someone with high self-esteem can accept his or her mistakes and move on. If another person tries to convince or persuade him or her to do something they really do not want to do, people who feel good about themselves will be less likely to fall under another person's pressure. They will feel more confident that their own decision is the right one and will make their own choices based on their own desires, and not the desires and values of others."
      },
      {
        "type": "paragraph",
        "content": "The opposite is also true. People with low self-esteem may be more likely to fall under the influence of others, not trusting their own values or decisions. Self-esteem is important because how people feel about themselves influences what they accomplish in life. When people believe in themselves and in their own ability, they are more likely to work hard, reach their goals and accomplish what they set out to do."
      },
      {
        "type": "paragraph",
        "content": "High Self-Esteem Allows Us To"
      },
      {
        "type": "paragraph",
        "items": [
          "Accept new challenges and try new activities.",
          "Be more comfortable with others, and develop closer and healthier relationships.",
          "Believe we can succeed.",
          "Gain self-confidence.",
          "Be the person we want to be.",
          "Be assertive and refuse to be pressured into what we do not believe in."
        ]
      },
      {
        "type": "paragraph",
        "content": "Factors that Lower Self-Esteem – Examples include:"
      },
      {
        "type": "paragraph",
        "items": [
          "\"That's a silly idea.\"",
          "\"I suppose that's the best you can do.\"",
          "\"What idiot would do that?\"",
          "\"That's typical of you.\""
        ]
      },
      {
        "type": "paragraph",
        "content": "Some ways we might put ourselves down include:"
      },
      {
        "type": "paragraph",
        "items": [
          "Not accepting compliments. \"Oh, I'm not really that good, I was just lucky.\"",
          "Giving credit to others when it rightfully belongs to us. \"You did all the work; I just helped a little.\" \"I couldn't do anything without him.\"",
          "Giving others' opinions before our own. \"Our teacher always says…\" \"My friend thinks…\" \"I really do not know but my mother says…\"",
          "By responding when someone says, \"Hey, stupid!\" by accepting nicknames like shorty, fatty or thick-head."
        ]
      },
      {
        "type": "paragraph",
        "content": "Emphasize that people who are used to being put down:"
      },
      {
        "type": "paragraph",
        "items": [
          "Find it difficult to interact with others or meet new people because they are afraid of rejection.",
          "Are easily influenced or do things they do not want to do to be accepted.",
          "Cannot stand up for their rights.",
          "Are shy.",
          "Lack of confidence.",
          "Find it difficult to make decisions."
        ]
      },
      {
        "type": "paragraph",
        "content": "Promoting Self-Esteem"
      },
      {
        "type": "paragraph",
        "items": [
          "Practice saying no",
          "Talk to someone you trust",
          "Try to avoid comparing yourself to others"
        ]
      },
      {
        "type": "paragraph",
        "content": "Lessons to Learn from Having a High Self-Esteem"
      },
      {
        "type": "paragraph",
        "content": "**Know Ourselves:** It is important for us to know who we are; our values, goals, dreams, and priorities."
      },
      {
        "type": "paragraph",
        "content": "**Respect Ourselves:** Some people can do certain things better than others. Our friends may play football better, work better, or learn faster. They are not better, just different. Never compare yourself to others."
      },
      {
        "type": "paragraph",
        "content": "**Love Ourselves:** We must love ourselves before we can love others. When we have a good relationship with ourselves, our relationship with others will improve."
      },
      {
        "type": "paragraph",
        "content": "**Affirm Ourselves:** Instead of hating ourselves for what we are not or have not done, we should give ourselves credit for what we are and what we have done."
      },
      {
        "type": "paragraph",
        "content": "**Trust Ourselves:** Trusting ourselves means knowing that we can be our own teacher, our own guide, and our own decision maker for matters relating to us."
      },
      {
        "type": "paragraph",
        "content": "**Accept Ourselves:** Accept ourselves as we are. We are doing the best we can, now. Tomorrow we will do better. Treat ourselves lovingly and gently."
      },
      {
        "type": "paragraph",
        "content": "**Show Ourselves:** Let people know who we really are. A healthy personality is based on being honest about who we are."
      },
      {
        "type": "tip",
        "content": "Trainer Story: This trainer story should focus on how gender roles have affected a teacher personally, as well as how these roles continue to impact the people he cares about — it could be the wife, mother, daughter, and sister. It should explore how someone's self-esteem can be shaped or limited by societal expectations based on gender, and how these experiences influence the way they view themselves and others."
      },
      {
        "type": "paragraph",
        "content": "Wrap-Up Circle"
      },
      {
        "type": "paragraph",
        "content": "Gather the group in a sitting circle. Review the goal behind the Wrap-Up Circle: To review what we learned in this session. To reflect on how we can apply what we have learned when facing challenges in the real world. To receive advice and support from our peers about real situations we are experiencing in our lives."
      },
      {
        "type": "paragraph",
        "content": "Lead a discussion: What was the most important thing you learned today? How can the knowledge and skills you learned today help you with situations in your life right now? Does anyone need any help with the current situation they are facing? What kind of challenging situations could you face in the coming days? Who is one person not in this session that you want to tell and teach what you learned here?"
      },
      {
        "type": "pledge",
        "content": "My values — My behaviors — My growthMy personality — I am loyal — I can love — I can tolerateI need respect — You need respect — She needs respectHonesty — That is my strength — That is our strengthMy body — My sexuality — My responsibility — A time to change!"
      }
    ]
  },
  {
    "num": "HIM1",
    "title": "Introduction to HIM and Awareness",
    "dur": "1 hr",
    "desc": "Introduction to HIM and Awareness",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Overview:** This session introduces the concept of \"Hero in Me\" and prepares learners with the knowledge and skills needed for boys to confidently and effectively step up to end violence. Students will also learn the skills of awareness and how to distinguish between positives and negatives in potential assault and violent situations. They will also discuss ways in which they can De-escalate or Negotiate in a conflict situation."
      },
      {
        "type": "activity",
        "title": "ACTIVITY #1 — INTRODUCTION AND WELCOME",
        "content": "",
        "items": [
          "- Welcome participants to the training and introduce yourself. This should be kept very brief since you will also participate in icebreakers and other exercises.",
          "- Ask students to introduce themselves by simply adding an adjective before their name that begins with the same letter."
        ]
      },
      {
        "type": "activity",
        "title": "ACTIVITY #2 — TAKE THE LEAD: TWO TRUTHS AND A LIE",
        "content": "Option 1:\nOption 2 (Anonymous):\nDiscussion Questions: How was the activity? What did you learn about each other? Was it easy to figure out the truth or the lie?",
        "items": [
          "- Ask each student in the session to think of two true facts about themselves, and one lie.",
          "- Each student in the session takes a turn telling the class their three items.",
          "- The class then must agree on which fact they think is a lie.",
          "- Once the class announces their decision, the student tells the class the correct answer.",
          "- The class then can talk about any of the interesting things they just learned about the new person.",
          "- Each student writes down their 2 truths and a lie on a piece of paper.",
          "- They then hand it in anonymously to the trainers.",
          "- Read each card randomly one at a time.",
          "- The class must decide who the person on the card is, as well as the lie."
        ]
      },
      {
        "type": "paragraph",
        "content": "Who is a Hero?"
      },
      {
        "type": "paragraph",
        "content": "To get the participants to understand more about the Hero concept, ask questions that trigger the participants to open and share their thoughts and experiences:"
      },
      {
        "type": "paragraph",
        "items": [
          "According to you, who is a hero?",
          "Do you have any hero in your life?",
          "What makes him a hero?",
          "Who is your role model?"
        ]
      },
      {
        "type": "paragraph",
        "content": "Trainer Content: Negative-turns-Positive Concept"
      },
      {
        "type": "trainer_says",
        "content": "In many parts of a story, a hero faces a situation where a negative moment in their life turns into a positive event or opportunity. Just as challenges arise when the hero lands in a terrible situation that seem impossible to get out of, the \"Negative turns Positive\" moment occurs when an individual gets into an upsetting or difficult situation that ultimately leads to something wonderful, usually giving him the courage to save the situation, win a girl's heart (or even meet the girl), or reach their destiny."
      },
      {
        "type": "trainer_says",
        "content": "These moments usually come out when we least expect it. When this event impacts, it also contains confession moments, where a hero would apologize for getting aggressively angry with a person they have cared about, or apologize for their wrong decisions they have made."
      },
      {
        "type": "definition",
        "title": "HERO IN ME",
        "content": "Turn from Negative to Positive"
      },
      {
        "type": "paragraph",
        "content": "**Examples:**"
      },
      {
        "type": "paragraph",
        "items": [
          "An argument can turn into a resolution.",
          "The hero discovers something amazing (for example, a friend to guide him or her).",
          "The hero rescues someone who was about to be harassed by some other boys.",
          "The hero learns to have fun in difficult circumstances.",
          "The hero gets lost with his friends but finds a way towards their destination.",
          "Hero makes a mistake and learns from it.",
          "The hero makes new friends after a bad experience."
        ]
      },
      {
        "type": "paragraph",
        "content": "Awareness"
      },
      {
        "type": "paragraph",
        "content": "The simplest acts in our lives are often missed because we are simply too busy to pay attention to anything going around us, especially if it seems like it does not directly affect us. Awareness means paying attention/being observant or having Consciousness. Awareness makes you stay in control of situations."
      },
      {
        "type": "definition",
        "title": "AWARENESS",
        "content": "To Pay Attention"
      },
      {
        "type": "activity",
        "title": "THE GAZELLE STORY",
        "content": "The gazelle is eating grass on a sunny plain. The sun is shining. The gazelle is having his meal. Suddenly, he senses something, he jerks his head up, ears up — completely alert — smelling, listening, looking. His whole body is a live antenna, receiving information. And then he sprints away!\nAsk: What kinds of signals could the gazelle have gotten to make him run away? (Answers could include: smell, sound, gut feeling, seeing, memory, intuition, fear.)\nAsk: What would happen to the gazelle if he started to get these signals but made excuses instead about what he was receiving? (What would happen if he thought, \"Oh that was probably nothing. I have been here before. I do not want to leave. It is fine here…\"?) Answers: He will probably die. If he thinks there is danger, he is probably right. Better to be safe than sorry.\nAsk: When the gazelle is aware and paying attention, what does he look like? (Body straight up, ears and eyes alert, body ready for action and reaction, etc.)"
      },
      {
        "type": "paragraph",
        "content": "How to Become Aware"
      },
      {
        "type": "paragraph",
        "items": [
          "Slow Down: This helps you notice any small problem.",
          "Look around you before you act: While slowing down is essential, the next step is your ability to engage your eyes during that time between the observation and the action.",
          "Look, do not listen: Do not allow loud distractions to stop you from keeping your eyes on your surroundings, rather than one direction.",
          "Look for the new: Pay attention to things you have not seen before rather than allowing your eyes to focus on the familiar."
        ]
      }
    ]
  },
  {
    "num": "HIM2",
    "title": "Being Assertive",
    "dur": "1 hr",
    "desc": "Being Assertive",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "Learning Objectives"
      },
      {
        "type": "paragraph",
        "items": [
          "Distinguish between assertiveness and aggression",
          "Demonstrate effective assertiveness skills"
        ]
      },
      {
        "type": "paragraph",
        "content": "Assertiveness is an important skill for getting along with others. Being assertive means: Being direct and standing up for yourself or being straightforward and honest with yourself and others about what you need and want."
      },
      {
        "type": "paragraph",
        "content": "Being assertive can help you protect yourself from dangerous situations and can help you resist peer pressure to do things that you are uncomfortable doing. People who are not assertive are often submissive. Even if they are being treated poorly, they do not stand up for themselves. People who are not assertive often lack the confidence and self-esteem to stand up for their own needs and to protect their feelings or body from being hurt."
      },
      {
        "type": "paragraph",
        "content": "How to Be Assertive"
      },
      {
        "type": "paragraph",
        "content": "**Decide what you feel or want and say it.** Do not be afraid to be honest about your feelings. Being confident about your own feelings will encourage others to respect them as well. Someone who truly loves you will not want to do things that make you feel unhappy."
      },
      {
        "type": "paragraph",
        "content": "**Look people in the eye.** Eye contact is an important part of being assertive. It tells the other person that you are serious about what you are saying and that you are paying close attention to whether they are listening to you."
      },
      {
        "type": "paragraph",
        "content": "**Do not make excuses.** Your feelings are the best reasons. For example, if you do not feel ready for sex, but your girlfriend or boyfriend is pressuring you, avoid using other people as excuses. Say what you really feel."
      },
      {
        "type": "paragraph",
        "content": "**Do not seek approval from others.** If you do not want to do something, say so clearly, and do not ask if it is all right. Show other people that you know your own mind and are not looking for their approval."
      },
      {
        "type": "paragraph",
        "content": "**Do not get confused by the other person's argument.** Keep repeating what you want or do not want. Stand your ground and do not give in."
      },
      {
        "type": "paragraph",
        "content": "**You have a right to change your mind.** Perhaps you and your girlfriend talked about sex a few days ago and you told her that you would have sex with her. But you thought about it and now you feel sure that the time is not right — that you are not ready and that the relationship is not ready. She says: \"But you agreed that we could have sex.\" Tell her: \"I have changed my mind. I have decided I do not feel ready.\" If she truly loves you, she will respect your right to change your mind, and she will wait until you feel ready."
      },
      {
        "type": "paragraph",
        "content": "Assertiveness, Passiveness and Aggression"
      },
      {
        "type": "paragraph",
        "items": [
          "Assertiveness: expressing thoughts, feelings, and beliefs in a direct, honest, and appropriate way.",
          "Aggression: a feeling of hostility that may lead to attacks or an unprovoked violent action."
        ]
      },
      {
        "type": "trainer_says",
        "content": "Being assertive is standing up for what you believe in and what you want. To be direct and sure. Young people are often tempted to give in to someone else's desires, whether because of peer pressure or something idealized in the media. However, if we say what we want or feel and explain why we have chosen a certain decision or action, then we can do what we really want without hurting another person."
      },
      {
        "type": "trainer_says",
        "content": "Assertiveness is part of effective communication. When you are assertive you can say No without feeling guilty, can ask for help when it is needed, avoid arguing, disagree without becoming angry, and feel better about yourself."
      },
      {
        "type": "trainer_says",
        "content": "Being aggressive involves putting other people down, blaming, or criticizing them."
      },
      {
        "type": "paragraph",
        "content": "Four Assertive Steps"
      },
      {
        "type": "paragraph",
        "items": [
          "Say what you see",
          "Say how you feel",
          "Say what you want",
          "Walk away — keep yourself safe"
        ]
      },
      {
        "type": "activity",
        "title": "ACTIVITY — ASSERTIVENESS ROLE-PLAYS",
        "content": "Discussion questions: What happened? Does this happen here in our community (school, home)? What problems does it cause? What can we do when this happens? What can we do to avoid these problems or this situation? What else could she/he have said to give more information?",
        "items": [
          "Scenario: You are in a debate session and every time you start to say something, an older boy interrupts you. Role-play the dialogue at the meeting.",
          "Scenario: You are in a school building and someone throws a chewing gum down. Chewing is not allowed in the school and the gum is making you sick. Role-play your conversation with the person and the defense of his actions.",
          "Scenario: Your parents tell you that you cannot have a girlfriend. Role-play the conversation.",
          "Scenario: You are watching TV. A sibling walks in and changes the channel without asking. Role-play the conversation.",
          "Scenario: Your parents still treat you like a child. You do not like this, but you also do not want to hurt their feelings. Role-play the conversation."
        ]
      },
      {
        "type": "paragraph",
        "content": "The 3 C's of Decision-Making"
      },
      {
        "type": "paragraph",
        "content": "**Challenge:** Clearly identify the situation or the problem to be solved or decided upon."
      },
      {
        "type": "paragraph",
        "content": "**Consider:** Think about the possible alternatives and what would happen for each. Think about the positive and negative consequences for each alternative. Get additional information if you need it."
      },
      {
        "type": "paragraph",
        "content": "**Choose:** Choose the best choice!"
      },
      {
        "type": "paragraph",
        "content": "Summary of Assertive Words — Saying \"NO\" Assertively"
      },
      {
        "type": "paragraph",
        "content": "Saying \"NO\" assertively is not terribly hard. But very few people are good at it. The idea is to not give in, and still not lose your friends."
      },
      {
        "type": "paragraph",
        "content": "**1. Say something caring:** \"That's flattering, but…\" / \"It's nice of you to offer, but…\" / \"Thanks for asking, but…\" / \"I'm glad you trust me to ask, but…\" / \"I love you, but…\" / \"I like you, but…\" / \"I care about you, but…\" / \"I'm sure you have a good reason for asking, but…\""
      },
      {
        "type": "paragraph",
        "content": "**2. Refuse:** \"No.\" / \"No, sorry.\" / \"No, thanks.\" / \"No, I'm OK.\" / \"No, that's alright.\""
      },
      {
        "type": "paragraph",
        "content": "**3. State your decision:** \"I'd rather…\" / \"I prefer…\" / \"I'm going to…\" / \"I'm not going to…\" / \"I don't believe in…\" / \"I've decided not to…\" / \"I've decided to…\""
      },
      {
        "type": "paragraph",
        "content": "**4. Or suggest an alternative:** \"Would you like to…?\" / \"How about…?\" / \"Why not instead?\""
      },
      {
        "type": "paragraph",
        "content": "You do not have to give a reason for your refusal. If you trust the person not to argue with your decision, it is OK to state your reason. But you never have to give a reason; it only gives the person something to argue about."
      },
      {
        "type": "tip",
        "content": "Trainer Story: One teacher tells a story about his personal experience (no more than 5 minutes). This story should focus on: (a) Describe the situation. (b) Describe the skill you had to use. (c) Describe the feelings you had when you were thinking about facing this situation. Talk about the skills you wished you had. What would you do differently if you could do it again?"
      },
      {
        "type": "pledge",
        "content": "As a leader — I will take charge as a leader — I will take leadI am a HERO — I will stay positiveYou are a HERO — You should stay positiveWe are HEROES — We will stay positiveWe can negotiate — We can De-Escalate Together"
      }
    ]
  },
  {
    "num": "HIM6",
    "title": "Topic 1: Needs Assessment",
    "dur": "1 hr",
    "desc": "Topic 1: Needs Assessment",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Session 1: Getting to Know You** — Introduction; Getting to know you questions"
      },
      {
        "type": "paragraph",
        "content": "**Session 2: Child Rights** — Definition; Who is a Child?; What are child rights?; Examples of child rights; Types of child rights; Child rights and responsibilities; Pledge"
      }
    ]
  },
  {
    "num": "HIM7",
    "title": "Topic 2: My Value System",
    "dur": "1 hr",
    "desc": "Topic 2: My Value System",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Session 1:** Personal values and social values — Definition of value; Types of values; Personal value definition and examples; Social value definition and examples; Trainer story; Wrapping up"
      },
      {
        "type": "paragraph",
        "content": "**Session 2:** Life-skills and personal awareness — Definition of Puberty; Changes during puberty in boys and girls; How puberty affects boys and girls; Hygiene (taking care of your body)"
      },
      {
        "type": "paragraph",
        "content": "**Session 3:** Peer pressure — Definition; Examples of peer pressure; How peer pressure affects us (boys); Resisting peer pressure; Challenge Choice Consequences (3Cs) role plays; Wrapping up"
      },
      {
        "type": "paragraph",
        "content": "**Session 4:** Self-esteem — Definition; Types of self-esteem; Factors that lower self-esteem; Promoting high self-esteem; Trainer story; Pledge"
      }
    ]
  },
  {
    "num": "HIM8",
    "title": "Topic 3: Intro to H.I.M and Verbal Techniques",
    "dur": "1 hr",
    "desc": "Topic 3: Intro to H.I.M and Verbal Techniques",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Session 1:** Introduction to Hero in Me — Introduction and welcome activity (Take a lead, choose one option); Who is a Hero?; Do you have any hero in your life?; What makes him a hero?; Who is your role model?; Hero in Me definition; Example of Hero"
      },
      {
        "type": "paragraph",
        "content": "**Session 2:** Awareness — Definition; Gazelle story; How to become aware; Wrapping up"
      },
      {
        "type": "paragraph",
        "content": "**Session 3:** Assertiveness — Definition; Differentiate Assertive, Passive and Aggressive; How to be Assertive; Assertive steps; Assertiveness role plays; Closing Pledge"
      }
    ]
  },
  {
    "num": "HIM9",
    "title": "Topic 4: Hero in Me – Step-Up Definition and Strategies",
    "dur": "1 hr",
    "desc": "Topic 4: Hero in Me – Step-Up Definition and Strategies",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Session 1:** Step-up definition and strategies — Definition; Goal of Step-up; **NOTE: The most important thing to consider is SAFETY FIRST;** Step-up techniques; De-escalation and negotiation; Factors to consider when doing step-up; Role plays (Dismissive / Verbal / Active); Pledge"
      }
    ]
  },
  {
    "num": "HIM10",
    "title": "Topic 5: Breaking the Silence and Referrals",
    "dur": "1 hr",
    "desc": "Topic 5: Breaking the Silence and Referrals",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Session 1:** Forms of Violence; Impact of Violence; Importance of breaking the silence; Trainer story; Wrapping up"
      },
      {
        "type": "paragraph",
        "content": "**Session 2:** Referral Pathways — Definition; Examples"
      },
      {
        "type": "helpline",
        "title": "HELPLINES",
        "content": "116 — Tithandizane Child Help Line5600 / 6600 — GBV Crisis"
      },
      {
        "type": "paragraph",
        "content": "**Session 3:** Hero in Me Review — Ask questions from Topics 1 to 4; Give responses to the questions asked depending on learner's answers; Summarize"
      }
    ]
  },
  {
    "num": "HIM11",
    "title": "Topic 6: Boys and Girls Combined",
    "dur": "1 hr",
    "desc": "Topic 6: Boys and Girls Combined",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "Taking Vs Asking; Consent — Definition, What consent is all about; Gender and sex; Gender stereotypes — Feminine and Masculine qualities."
      }
    ]
  },
  {
    "num": "HIM12",
    "title": "Roles and Responsibilities of Teacher Champions",
    "dur": "1 hr",
    "desc": "Roles and Responsibilities of Teacher Champions",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "Why are you a Teacher Champion? To stop the cycle of violence and to transform our schools, community, society and the world."
      },
      {
        "type": "paragraph",
        "content": "The reason why? It is to be the change we want to see in the world or in your school. NO ONE else in the teaching fraternity is teaching these skills but you and other teachers in Malawi who just do these training/classes. There are very few actions that create consequences for these perpetrators hence they set out to harm a child. If you want to make sure what happened to you or someone you know does not happen to others, then you must stand up and reach out with these skills to men and women and children. There is no one else coming! There are no laws or police or courts standing where the attacks take place. It's just us and these skills. God put you in this room, learn these skills well. Pay attention and act as lives depend on you because they do."
      },
      {
        "type": "paragraph",
        "content": "Take what you have learned here out into your schools and teach it everywhere — for your whole life. Whenever you go you have lifesaving skills and it's your job to be at the top of this class and you can teach them well."
      },
      {
        "type": "paragraph",
        "content": "**Teacher Champions must:**"
      },
      {
        "type": "paragraph",
        "items": [
          "Map all available referral services in their community.",
          "Establish relationships with local service providers.",
          "Keep updated contact details of key stakeholders.",
          "Coordinate closely with Ujamaa and other partners."
        ]
      },
      {
        "type": "paragraph",
        "content": "Documentation and Follow-Up — Teacher Champions should record:"
      },
      {
        "type": "paragraph",
        "items": [
          "Nature of the incident",
          "Actions taken",
          "Who the case was referred to",
          "Outcome or follow-up steps"
        ]
      },
      {
        "type": "paragraph",
        "content": "Ways to Report Anonymously"
      },
      {
        "type": "paragraph",
        "items": [
          "Through Ujamaa staff",
          "Anonymous tip lines",
          "Through intermediaries like Police and CPWs"
        ]
      },
      {
        "type": "paragraph",
        "content": "Creating Safe Space"
      },
      {
        "type": "paragraph",
        "content": "**Definition:** A safe space is an environment where people feel respected and supported to share their views and ideas."
      },
      {
        "type": "paragraph",
        "content": "HIM classes can bring up all kinds of issues for your learners. Role plays can trigger traumatic memories. Rape, sodomy, abuse and attacks are all extremely sensitive topics. They can be a great deal of secrecy, fear and shame around these issues and feelings are bound to rise to the surface in our classes."
      },
      {
        "type": "paragraph",
        "content": "Confidentiality is a cornerstone of Ujamaa Pamodzi classes; one way we communicate that priority to our learners is by bringing it up in classes as a rule. Learners rely on us to lay down rules of privacy, respect and compassionate interaction."
      },
      {
        "type": "paragraph",
        "items": [
          "Keep things confidential. Everything said in this room should stay in this room.",
          "Respect each other's opinion. There is no right or wrong answer, everyone has a right to express himself.",
          "Be thankful when someone shares their story. It takes courage to share something personal and we want to celebrate courage!"
        ]
      }
    ]
  },
  {
    "num": "HIM13",
    "title": "Understanding Positive Discipline",
    "dur": "1 hr",
    "desc": "Understanding Positive Discipline",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Punishment:** Is a short term strategy that stops the behaviour right away but doesn't stop it from happening in the future. It involves associating pain with behaviour rather than an understanding of what is wrong."
      },
      {
        "type": "paragraph",
        "content": "**Discipline:** doesn't mean replacing the cane with other humiliating punishments. Positive discipline is about creating good relationships with children and helping them learn right from wrong."
      },
      {
        "type": "paragraph",
        "content": "Goals of Disciplining a Child"
      },
      {
        "type": "paragraph",
        "items": [
          "To help children learn from their behavior",
          "To help them make better choices",
          "To make them stop a certain behaviour",
          "To understand there are consequences for their behaviour."
        ]
      },
      {
        "type": "paragraph",
        "content": "**What is positive discipline?** It is a non-violent, solution focused, respectful approach, based on child development principles."
      },
      {
        "type": "paragraph",
        "content": "Types of Positive Discipline"
      },
      {
        "type": "paragraph",
        "content": "**1. Reflection** — Children learn from their mistakes when they understand what they did was wrong and when they are given an opportunity to think about the consequences of their behaviour. Types: Verbal warning (talk to the child and tell him/her what they did wrong); Imposing timeout (ask a child to leave a class for 10 minutes or sit in a quiet place); Letter writing (ask the student to write a letter or essay on why they behaved in a certain way and what they will do to avoid repeating the mistake, including an apology); Oral apology (this involves apologizing to the wronged person and asking for forgiveness); Discipline box (write the name of a child on a piece of paper and place it in a box in the classroom, checked on a weekly basis)."
      },
      {
        "type": "paragraph",
        "content": "**2. Penalty** — For offences that are persistent and detrimental for all concerned, children may need to experience a penalty to understand that there are consequences to their actions. Types: Withdrawal of privileges (taking away an activity that he/she enjoys); Light work that improves the school environment (slashing an appropriate sized area of grass, cleaning small part of school); Detention (the student must remain for extra time after school to reflect on what they did wrong); Signing of discipline or behavior contract (one page contract between the student and the teacher); Disciplinary talk with the learner; Demerit (marking the file or disciplinary book to record the child's offence)."
      },
      {
        "type": "paragraph",
        "content": "**3. Reparation** — These are offences that cause damage to a third party. Types: Public apology (possibly during assembly); Replace or repair (e.g. replacing or repairing the damage); Financial restitution (if the offence was intentional, the learner must pay for the materials); Official reprimand (written notice to their disciplinary record, must sign a letter committing to reform); Involving parents (parents get involved to contribute towards replacing, repairing or apologizing)."
      },
      {
        "type": "paragraph",
        "content": "**4. Last Resort** — For persistent and serious offences. Types: Parent meetings (summoning and discussing with the parents as a warning); Referral (referring the student to a professional who can assist); Suspension (a time limited suspension e.g. one week with a written warning and referral to a counselor)."
      }
    ]
  },
  {
    "num": "HIM14",
    "title": "Child Rights, VAEN and Life Skills",
    "dur": "1 hr",
    "desc": "Child Rights, VAEN and Life Skills",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "Children's rights are the human rights of children with particular attention to the rights of special protection and care afforded to minors. The 1989 Convention on the Rights of the Child (CRC) defines a child as \"any human being below the age of eighteen years, unless under the law applicable to the child, majority is attained earlier.\""
      },
      {
        "type": "paragraph",
        "content": "All children have the right to be protected from violence, exploitation and abuse. Yet, millions of children worldwide from all socio-economic backgrounds, across all ages, religions and cultures suffer violence, exploitation and abuse every day."
      },
      {
        "type": "paragraph",
        "content": "**Child exploitation:** Child exploitation is the act of using a minor child for profit, labor, sexual gratification, or some other personal or financial advantage. Child exploitation often results in cruel or harmful treatment of the child, as the activities he or she may be forced to take part in can cause emotional, physical, and social problems."
      }
    ]
  },
  {
    "num": "HIM15",
    "title": "Developing Rules and Regulations with Learner Participation",
    "dur": "1 hr",
    "desc": "Developing Rules and Regulations with Learner Participation",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "Appropriate behaviour fosters a positive classroom environment. Engaging students on the first day of school in creating a set of rules helps ensure their investment. Students are more likely to buy into the rules if they have a hand in creating them."
      },
      {
        "type": "paragraph",
        "items": [
          "Treat others as you would like to be treated.",
          "Respect other people and their property (e.g., no hitting, no stealing).",
          "Laugh with anyone, but laugh at no one.",
          "Be responsible for your own learning.",
          "Come to class and hand in assignments on time.",
          "Do not disturb people who are working."
        ]
      },
      {
        "type": "paragraph",
        "content": "**Three types of logical consequences:**"
      },
      {
        "type": "paragraph",
        "items": [
          "\"You break it, you fix it\" — can be used to mend emotional messes as well as physical messes. A student can repair hurt feelings with an apology of action.",
          "Temporary loss of privilege — a simple way to help a student remember to use that privilege (art materials, recess, and group time) responsibly.",
          "Time-out or \"take a break\" — a strategy to help students learn self-control. A student who is disrupting the work of the group is asked to leave for a few minutes."
        ]
      }
    ]
  },
  {
    "num": "HIM16",
    "title": "Mentorship and Role Modelling",
    "dur": "1 hr",
    "desc": "Mentorship and Role Modelling",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Mentorship** is a relationship in which a more experienced or more knowledgeable person helps to guide a less experienced or less knowledgeable person."
      },
      {
        "type": "paragraph",
        "content": "**Role modelling** is a process that allows students to learn new behaviors without the trial and error of doing things for themselves (Bandura, 1977). It is a form of learning from experience that uses humanist and social learning theories (Rogers, 1983). A key feature is the experience learners bring to a situation. Individuals want to learn and do so best when they feel free to express and choose their own direction. Mentors fulfill a dual role of teacher and facilitator — helping their students to identify what direction learning should take and facilitating the best conditions for this to occur."
      }
    ]
  },
  {
    "num": "HIM17",
    "title": "Guidance and Counselling",
    "dur": "1 hr",
    "desc": "Guidance and Counselling",
    "pledge": null,
    "objectives": [],
    "content": [
      {
        "type": "paragraph",
        "content": "**Meaning of Guidance:** Guidance is all round assistance to an individual in all aspects of his or her development. It makes use of the science of psychology to determine the attitude, interest, intelligence, personality and the discipline of the education for providing right and suitable assistance."
      },
      {
        "type": "paragraph",
        "items": [
          "It is a process of helping or assisting an individual to solve their problems. It helps them to identify where to go, what to do and how to post accomplishments of their goals.",
          "It is a continuous process which starts right from childhood, adolescence and continues over into old age.",
          "It is assistance to the individual in the process of development rather than direction of that development.",
          "It is a service meant for all: its regular service which is required for every student, not only for abnormal students.",
          "Guidance is an organized service not an incidental activity of the school.",
          "Guidance is more an art than science.",
          "Guidance is centered on the needs and aspirations of students."
        ]
      },
      {
        "type": "paragraph",
        "content": "**Counseling:** It is giving professional help and advice to someone to resolve personal or psychological problems."
      },
      {
        "type": "paragraph",
        "content": "**Qualities of a Good Counsellor:** The core qualities include genuineness, empathy, warmth and unconditional positive regard. In addition, a good counsellor needs to be creative, have a sense of humour, be a risk taker, tolerant, gracious and democratic."
      },
      {
        "type": "paragraph",
        "content": "**Necessary Skills of a Good Counsellor:**"
      },
      {
        "type": "paragraph",
        "items": [
          "Listening and communication skills",
          "Problem solving and decision making skills",
          "Ability to deal with conflict",
          "Be oneself",
          "Have interest",
          "Having acknowledgement"
        ]
      },
      {
        "type": "paragraph",
        "content": "Difference between Guidance and Counseling"
      },
      {
        "type": "paragraph",
        "items": [
          "Guidance is mainly preventive and developmental whereas counseling is remedial as well as preventive and developmental.",
          "Intellectual attitudes are the raw material of guidance but emotional rather than pure intellectual attitudes are the raw materials of the counseling process.",
          "In guidance, decision making is operable at intellectual level, whereas in counseling it operates at emotional level.",
          "In educational context, counseling service is one among various services offered by guidance programmes."
        ]
      }
    ]
  }
];

export const GESD_SESSIONS: Session[] = [];

export const SESSION_LISTS: Record<string, string[]> = {
  HIM: ["Topic 1: Getting to Know You", "Topic 2: My Value System", "Topic 3: Intro to H.I.M & Verbal Techniques", "Topic 4: Hero in Me: Step-Up Strategies", "Topic 5: Referrals & Break the Silence", "Topic 6: Boys & Girls Combined Session"],
  GESD: ["Session 1: Getting to Know You", "Session 2: Intro to GESD", "Session 3: Awareness", "Session 4: Verbal Techniques", "Session 5: Physical Techniques", "Session 6: Combined Class — Boys & Girls"],
  Combined: ["Topic 6 / Session 6: Boys & Girls Combined"],
};

export const HIM_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "him-q1",
    lessonNum: "All",
    question: "What are the four pillars of the Hero In Me (HIM) framework?",
    options: [
      "Courage, Honesty, Respect, Service",
      "Care, Safety, Growth, Confidence",
      "Strength, Intelligence, Wisdom, Courage",
      "Family, School, Community, Nation"
    ],
    correctAnswer: 1,
    explanation: "The HIM framework is built on Care (showing respect and empathy), Safety (creating safe spaces), Growth (personal development), and Confidence (believing in yourself)."
  },
  {
    id: "him-q2",
    lessonNum: "All",
    question: "What is the Adjective Game used for in Topic 1?",
    options: [
      "To teach grammar and vocabulary",
      "To build confidence and group trust",
      "To identify strong and weak students",
      "To practice public speaking skills"
    ],
    correctAnswer: 1,
    explanation: "The Adjective Game in Topic 1 helps boys build confidence and group trust by having each participant choose an adjective starting with their name's first letter."
  },
  {
    id: "him-q3",
    lessonNum: "All",
    question: "What is the main difference between personal values and social values?",
    options: [
      "Personal values are more important than social values",
      "Personal values are what you believe; social values are what your community believes",
      "Social values only apply to wealthy people",
      "Personal values change daily while social values never change"
    ],
    correctAnswer: 1,
    explanation: "Personal values are your own beliefs about what's important (honesty, respect), while social values are community and cultural values that shape behavior."
  },
  {
    id: "him-q4",
    lessonNum: "All",
    question: "What are the 3 Ds of Step-Up?",
    options: [
      "Defend, Debate, Deny",
      "Direct, Distract, Delegate",
      "Decide, Discuss, Distribute",
      "Declare, Demonstrate, Deliver"
    ],
    correctAnswer: 1,
    explanation: "The 3 Ds are: Direct (address the situation directly and safely), Distract (create a distraction to defuse), and Delegate (get help from a trusted adult)."
  },
  {
    id: "him-q5",
    lessonNum: "All",
    question: "When should you use the DIRECT approach in Step-Up?",
    options: [
      "Always, in every situation",
      "When it's safe and you know the person",
      "Only when there are many people watching",
      "Never, it's too dangerous"
    ],
    correctAnswer: 1,
    explanation: "DIRECT is used when it's safe and you know the person. It involves addressing the situation directly with the person involved."
  },
  {
    id: "him-q6",
    lessonNum: "All",
    question: "What is the first step in breaking the silence about abuse?",
    options: [
      "Tell all your friends",
      "Post about it on social media",
      "Tell a trusted adult",
      "Handle it by yourself"
    ],
    correctAnswer: 2,
    explanation: "Breaking the silence starts by telling a trusted adult—a teacher, counselor, parent, or community leader who will believe you and take action."
  },
  {
    id: "him-q7",
    lessonNum: "All",
    question: "What is an 'I' statement and why is it important?",
    options: [
      "A statement that only talks about yourself and ignores others",
      "A statement like 'I feel... when... I need...' that expresses your feelings without blame",
      "A statement that must always start with the word 'I'",
      "A statement used only in formal writing"
    ],
    correctAnswer: 1,
    explanation: "'I' statements like 'I feel upset when you speak to me like that. I need respect' express your feelings without blaming others, making communication more effective."
  },
  {
    id: "him-q8",
    lessonNum: "All",
    question: "What does it mean to be a 'Hero' in the HIM program?",
    options: [
      "To have superpowers or be perfect",
      "To always be strong and never show emotions",
      "To care for others, ensure safety, grow personally, and be confident",
      "To fight anyone who disagrees with you"
    ],
    correctAnswer: 2,
    explanation: "Being a Hero in HIM means caring for others, ensuring safety, growing as a person, and being confident. It's about being a positive role model and standing up for what's right."
  },
  {
    id: "him-q9",
    lessonNum: "All",
    question: "Which of these is a trusted adult you can talk to about abuse?",
    options: [
      "Only your parents",
      "Only your closest friends",
      "A teacher, counselor, parent, community leader, or health worker",
      "Only the police"
    ],
    correctAnswer: 2,
    explanation: "Trusted adults include teachers, school counselors, parents, community leaders, health workers, and other adults who listen and take action to help."
  },
  {
    id: "him-q10",
    lessonNum: "All",
    question: "What is the main message of the HIM pledge?",
    options: [
      "Boys are better than girls",
      "Boys should never cry or show emotions",
      "I am a young man with feelings, who cares and is real",
      "Boys must always be strong and never ask for help"
    ],
    correctAnswer: 2,
    explanation: "The HIM pledge says: 'I am a young man / I live my life / I have feelings / I care / I can cry / I am real / I am the new African Man!' affirming that men can have emotions and care for others."
  },
];

export const GESD_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "gesd-q1",
    lessonNum: "All",
    question: "What are the three pillars of the GESD framework?",
    options: [
      "Fear, Strength, Action",
      "Self-Efficacy, Self-Empowerment, Self-Defence",
      "Confidence, Intelligence, Courage",
      "Education, Safety, Community"
    ],
    correctAnswer: 1,
    explanation: "GESD's three pillars are: Self-Efficacy (believing you can succeed), Self-Empowerment (taking control of decisions), and Self-Defence (having skills to protect yourself)."
  },
  {
    id: "gesd-q2",
    lessonNum: "All",
    question: "What is the Attack Progression Scale?",
    options: [
      "A ranking of different types of girls by physical strength",
      "The pattern that attacks typically follow: Verbal → Intimidation → Physical",
      "A grading system for students",
      "A scale measuring how brave a girl is"
    ],
    correctAnswer: 1,
    explanation: "The Attack Progression Scale shows how attacks typically progress: Verbal (name-calling, threats), Intimidation (intimidating looks, blocking paths), and Physical (touching, pushing, hitting)."
  },
  {
    id: "gesd-q3",
    lessonNum: "All",
    question: "What is the Perpetrator Progression Pattern (PPP)?",
    options: [
      "How girls develop from childhood to adulthood",
      "How predators identify, select, and attack victims",
      "How girls should behave in public",
      "A pattern of good behavior in school"
    ],
    correctAnswer: 1,
    explanation: "The PPP describes how predators work: Identification (finding victims), Selection (choosing a specific victim who appears vulnerable), and Attack (taking action)."
  },
  {
    id: "gesd-q4",
    lessonNum: "All",
    question: "What are the 4 visible signs of awareness?",
    options: [
      "Alertness, Confidence, Trust Your Gut, Be Present",
      "Strength, Speed, Intelligence, Beauty",
      "Loudness, Aggression, Resistance, Fighting",
      "Sadness, Anger, Fear, Confusion"
    ],
    correctAnswer: 0,
    explanation: "The 4 signs of awareness are: Alertness (look around, know what's happening), Confidence (move with purpose, stand tall), Trust Your Gut (listen to your intuition), and Be Present (pay attention to surroundings)."
  },
  {
    id: "gesd-q5",
    lessonNum: "All",
    question: "What does SMEVB stand for?",
    options: [
      "Self, Management, Education, Voice, Body",
      "Spirit, Mind, Eyes, Voice, Body",
      "Strength, Memory, Energy, Vision, Bravery",
      "Safety, Mental, Emotional, Vision, Body"
    ],
    correctAnswer: 1,
    explanation: "SMEVB are your 5 Personal Weapons: Spirit (inner strength), Mind (intelligence), Eyes (awareness), Voice (communication), and Body (physical strength)."
  },
  {
    id: "gesd-q6",
    lessonNum: "All",
    question: "What is the most important of the 5 Personal Weapons (SMEVB)?",
    options: [
      "Body - physical strength",
      "Eyes - being able to see",
      "Spirit - your inner strength and will to survive",
      "Voice - being able to speak"
    ],
    correctAnswer: 2,
    explanation: "SPIRIT is the most important weapon. With spirit and determination, you can overcome almost anything, even if other weapons are limited."
  },
  {
    id: "gesd-q7",
    lessonNum: "All",
    question: "What are the Five Fingers of Emergency (FED)?",
    options: [
      "Five different fighting techniques",
      "Five body parts you should protect",
      "Think, Yell, Run, Fight, Tell",
      "Five trusted adults to call"
    ],
    correctAnswer: 2,
    explanation: "The Five Fingers of Emergency are: Think (use your mind to escape), Yell (use your voice), Run (use your legs), Fight (use your body if you can't escape), and Tell (tell a trusted adult)."
  },
  {
    id: "gesd-q8",
    lessonNum: "All",
    question: "What is the first step in the Five Fingers of Emergency?",
    options: [
      "Yell as loud as you can",
      "Fight back immediately",
      "Think and create a diversion or find the safest way out",
      "Tell an adult immediately"
    ],
    correctAnswer: 2,
    explanation: "THINK is the first step. Use your mind to escape: create a diversion, find the safest way out, and don't freeze. This is often the most effective response."
  },
  {
    id: "gesd-q9",
    lessonNum: "All",
    question: "When should you use FIGHT in the Five Fingers of Emergency?",
    options: [
      "Always, if someone touches you",
      "Only if you cannot escape through thinking, yelling, or running",
      "Never, fighting is always wrong",
      "Only after you have told an adult"
    ],
    correctAnswer: 1,
    explanation: "FIGHT is only used if you cannot escape through other means. It's your last resort when thinking, yelling, and running are not possible."
  },
  {
    id: "gesd-q10",
    lessonNum: "All",
    question: "What is 'Breaking the Silence' in the context of abuse?",
    options: [
      "Being quiet and not speaking to anyone",
      "Telling a trusted adult about abuse you or someone else has experienced",
      "Speaking loudly in all situations",
      "Refusing to talk about any difficult topics"
    ],
    correctAnswer: 1,
    explanation: "Breaking the Silence means telling a trusted adult about abuse. This is brave and necessary because keeping silence gives power to the abuser, while speaking out starts the healing process."
  },
];

export const DISTRICT_LIST = ["Lilongwe", "Blantyre", "Zomba", "Mzimba", "Karonga", "Mangochi", "Kasungu", "Dedza", "Dowa", "Thyolo", "Rumphi", "Chitipa", "Machinga", "Balaka", "Chikwawa", "Nkhotakota", "Nkhata Bay", "Mulanje", "Ntcheu", "Chiradzulu"];

export const TOP15 = [
  { rank: 1, name: "Lilongwe", r: "Central", tots: 105, cov: "35/120", pct: 29 }, { rank: 2, name: "Blantyre", r: "Southern", tots: 84, cov: "28/105", pct: 27 },
  { rank: 3, name: "Mzimba", r: "Northern", tots: 72, cov: "24/95", pct: 25 }, { rank: 4, name: "Mangochi", r: "Southern", tots: 66, cov: "22/90", pct: 24 },
  { rank: 5, name: "Kasungu", r: "Central", tots: 60, cov: "20/85", pct: 24 }, { rank: 6, name: "Karonga", r: "Northern", tots: 54, cov: "18/62", pct: 29 },
  { rank: 7, name: "Zomba", r: "Southern", tots: 54, cov: "18/72", pct: 25 }, { rank: 8, name: "Thyolo", r: "Southern", tots: 48, cov: "16/68", pct: 24 },
  { rank: 9, name: "Rumphi", r: "Northern", tots: 45, cov: "15/48", pct: 31 }, { rank: 10, name: "Dowa", r: "Central", tots: 45, cov: "15/72", pct: 21 },
  { rank: 11, name: "Dedza", r: "Central", tots: 42, cov: "14/68", pct: 21 }, { rank: 12, name: "Mulanje", r: "Southern", tots: 42, cov: "14/65", pct: 22 },
  { rank: 13, name: "Chitipa", r: "Northern", tots: 36, cov: "12/45", pct: 27 }, { rank: 14, name: "Ntcheu", r: "Central", tots: 36, cov: "12/56", pct: 21 },
  { rank: 15, name: "Machinga", r: "Southern", tots: 36, cov: "12/65", pct: 18 },
];

export interface MapCluster {
  id: number;
  name: string;
  district: string;
  lead: string;
  leadPhone: string;
  students: number;
  trained: number;
  lat: number;
  lng: number;
  schools: { name: string; lat: number; lng: number }[];
}

export const MAP_CLUSTERS: MapCluster[] = [
  {
    id: 0,
    name: "Lilongwe Central Cluster",
    district: "Lilongwe",
    lead: "TOT Demo",
    leadPhone: "+265 881 234 567",
    students: 1240,
    trained: 3,
    lat: -13.970,
    lng: 33.790,
    schools: [
      { name: "Kawale Primary School", lat: -13.948, lng: 33.771 },
      { name: "Kauma Primary School", lat: -13.958, lng: 33.804 },
      { name: "Area 18 Primary School", lat: -13.980, lng: 33.815 },
    ]
  },
  {
    id: 1,
    name: "Lilongwe North Cluster",
    district: "Lilongwe",
    lead: "Agnes Phiri",
    leadPhone: "+265 882 345 678",
    students: 980,
    trained: 2,
    lat: -13.920,
    lng: 33.760,
    schools: [
      { name: "Chinsapo Primary School", lat: -13.905, lng: 33.745 },
      { name: "Kauma Primary School", lat: -13.930, lng: 33.780 },
      { name: "Area 18 Primary School", lat: -13.942, lng: 33.752 },
    ]
  },
  {
    id: 2,
    name: "Blantyre South Cluster",
    district: "Blantyre",
    lead: "John Mwale",
    leadPhone: "+265 883 456 789",
    students: 890,
    trained: 3,
    lat: -15.800,
    lng: 35.005,
    schools: [
      { name: "Mbayani Primary School", lat: -15.792, lng: 35.022 },
      { name: "Ndirande LEA School", lat: -15.778, lng: 35.012 },
      { name: "Chirimba Primary School", lat: -15.815, lng: 35.030 },
    ]
  },
  {
    id: 3,
    name: "Blantyre Girls Cluster",
    district: "Blantyre",
    lead: "Mary Chirwa",
    leadPhone: "+265 884 567 890",
    students: 760,
    trained: 2,
    lat: -15.785,
    lng: 34.988,
    schools: [
      { name: "Soche Primary School", lat: -15.775, lng: 34.972 },
      { name: "Zingwangwa Primary", lat: -15.800, lng: 34.978 },
      { name: "Chilomoni Primary School", lat: -15.793, lng: 35.002 },
    ]
  },
  {
    id: 4,
    name: "Zomba Urban Cluster",
    district: "Zomba",
    lead: "Alinafe Banda",
    leadPhone: "+265 885 678 901",
    students: 1380,
    trained: 3,
    lat: -15.390,
    lng: 35.320,
    schools: [
      { name: "Zomba LEA School", lat: -15.378, lng: 35.312 },
      { name: "Domasi Primary School", lat: -15.302, lng: 35.285 },
      { name: "Mulunguzi Primary", lat: -15.400, lng: 35.338 },
      { name: "Sadzi Primary School", lat: -15.365, lng: 35.298 },
    ]
  },
  {
    id: 5,
    name: "Mzimba Heritage Cluster",
    district: "Mzimba",
    lead: "Tawina Nyirenda",
    leadPhone: "+265 886 789 012",
    students: 1050,
    trained: 3,
    lat: -11.900,
    lng: 33.600,
    schools: [
      { name: "Mzimba Primary School", lat: -11.890, lng: 33.588 },
      { name: "Enukweni Primary", lat: -11.875, lng: 33.615 },
      { name: "Ekwendeni Primary", lat: -11.920, lng: 33.572 },
      { name: "Bolero Primary School", lat: -11.912, lng: 33.623 },
    ]
  },
  {
    id: 6,
    name: "Karonga Lakeshore Cluster",
    district: "Karonga",
    lead: "Chisomo Phiri",
    leadPhone: "+265 887 890 123",
    students: 720,
    trained: 2,
    lat: -9.935,
    lng: 33.930,
    schools: [
      { name: "Karonga Primary School", lat: -9.922, lng: 33.918 },
      { name: "Chilumba Primary", lat: -9.948, lng: 33.942 },
      { name: "Kaporo Primary School", lat: -9.912, lng: 33.950 },
    ]
  },
  {
    id: 7,
    name: "Dedza Highland Cluster",
    district: "Dedza",
    lead: "Patrick Kachingwe",
    leadPhone: "+265 888 901 234",
    students: 560,
    trained: 2,
    lat: -14.370,
    lng: 34.330,
    schools: [
      { name: "Dedza Primary School", lat: -14.360, lng: 34.318 },
      { name: "Kachindamoto Primary", lat: -14.382, lng: 34.342 },
      { name: "Mtakataka Primary", lat: -14.358, lng: 34.350 },
    ]
  },
  {
    id: 8,
    name: "Dowa Central Cluster",
    district: "Dowa",
    lead: "Loveness Chirambo",
    leadPhone: "+265 889 012 345",
    students: 1100,
    trained: 3,
    lat: -13.660,
    lng: 33.940,
    schools: [
      { name: "Dowa Primary School", lat: -13.650, lng: 33.928 },
      { name: "Chakhaza Primary", lat: -13.672, lng: 33.952 },
      { name: "Mponela Primary School", lat: -13.645, lng: 33.958 },
      { name: "Bowe Primary School", lat: -13.678, lng: 33.930 },
    ]
  },
  {
    id: 9,
    name: "Mangochi Stars Cluster",
    district: "Mangochi",
    lead: "Fatima Yusuf",
    leadPhone: "+265 880 123 456",
    students: 680,
    trained: 2,
    lat: -14.480,
    lng: 35.270,
    schools: [
      { name: "Mangochi Primary School", lat: -14.468, lng: 35.258 },
      { name: "Namwera Primary", lat: -14.492, lng: 35.282 },
      { name: "Monkey Bay Primary", lat: -14.472, lng: 35.292 },
    ]
  },
];

// ─── SASA OFFICER CONSTANTS ───────────────────────────────────────────────────

export const REFERRAL_AGENCIES = [
  { id: "police",          label: "Police Station" },
  { id: "hospital",        label: "Hospital / Health Centre" },
  { id: "social_welfare",  label: "Social Welfare Office" },
  { id: "child_protection",label: "Child Protection Services" },
  { id: "legal_aid",       label: "Legal Aid Bureau" },
  { id: "safe_house",      label: "Safe House / Shelter" },
];

export const REFERRAL_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: "Pending",     color: "#92400e", bg: "#fef9c3" },
  in_progress: { label: "In Progress", color: "#1e40af", bg: "#dbeafe" },
  resolved:    { label: "Resolved",    color: "#065f46", bg: "#dcfce7" },
};

export const CASE_REFERRALS_INIT: CaseReferral[] = [
  { id: 1, caseId: 1, caseSchool: "Kawale Primary", caseDistrict: "Lilongwe", agency: "police", agencyLabel: "Police Station", referredBy: "SASA Officer", referredAt: "2026-05-02", status: "resolved", outcome: "Perpetrator cautioned", notes: "Case closed after mediation." },
  { id: 2, caseId: 3, caseSchool: "Zomba LEA School", caseDistrict: "Zomba", agency: "hospital", agencyLabel: "Hospital / Health Centre", referredBy: "SASA Officer", referredAt: "2026-05-05", status: "in_progress", notes: "Awaiting medical report." },
  { id: 3, caseId: 2, caseSchool: "Mbayani Primary", caseDistrict: "Blantyre", agency: "social_welfare", agencyLabel: "Social Welfare Office", referredBy: "SASA Officer", referredAt: "2026-05-08", status: "pending", notes: "Family counselling to be scheduled." },
];

export const SASA_REPORTS_INIT: SasaMonthlyReport[] = [
  {
    id: 1,
    month: "2026-04",
    submittedBy: "SASA Officer",
    submittedAt: "2026-05-01",
    totalCases: 5,
    publicCases: 2,
    referrals: 3,
    resolvedReferrals: 2,
    highlights: "Increased community awareness following school assemblies in Lilongwe.",
    challenges: "Limited transport to follow up referred cases in rural zones.",
    recommendations: "Allocate motorbike fuel allowance for field visits.",
    status: "submitted",
  },
];
