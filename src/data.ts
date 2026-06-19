import { CaseReferral, SasaMonthlyReport, QuizQuestion, Session, User, Report, Cluster, District, Training } from './types';

export const ROLE_CFG = {
  admin: { label: "National Admin", color: "#991b1b", bg: "#fee2e2", icon: "🛡️" },
  tot: { label: "Trainer of Trainers", color: "#c44d00", bg: "#fff4ec", icon: "🎓" },
  data_entry: { label: "Data Officer", color: "#c44d00", bg: "#fff4ec", icon: "📝" },
  district_coordinator: { label: "District Coordinator", color: "#065f46", bg: "#d1fae5", icon: "🏛️" },
  viewer: { label: "Viewer", color: "#1e40af", bg: "#dbeafe", icon: "👁️" },
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
    num: "Topic 1", title: "Needs Assessment – Knowing Myself & My Rights", dur: "60 min",
    desc: "Self-awareness, child rights, and understanding community norms. Boys explore identity through the Adjective Game and reflective discussion.",
    pledge: "I am a young man / I live my life / I have feelings / I care / I can cry / I am real / I am the new African Man!",
    objectives: [
      "Welcome participants and build group trust through the Adjective Game",
      "Explore personal identity, role models, and views on gender",
      "Define a child and understand the three categories of child rights",
      "Discuss community violence and identify trusted adults",
    ],
    content: [
      { type: 'trainer_says', label: 'Trainer Says', content: "Before you can lead others, you must first know who you are. Knowing yourself means separating who you are — and who you want to be — from what the world thinks you are, and wants you to be." },
      { type: 'activity', label: 'ACTIVITY — THE ADJECTIVE GAME', content: 'Each student introduces themselves using an adjective starting with the same letter as their first name.', items: ['"I am Caring Rahman. I am in class 6."', '"I am Wonderful Blessings."', '"I am Awesome Imran."'] },
      { type: 'activity', label: 'GETTING TO KNOW YOU — KEY QUESTIONS', content: 'Open discussion questions for the group:', items: ["What is the most annoying habit that other people have?", "Who is your role model?", "Is it ok for boys to cry? Why or why not?", "What are your views about girls?", "What are some crimes or cases of violence frequently committed in your community?", "Do you believe that when girls are raped, it is their fault?", "Who is a trusted adult at home or school that you would feel safe talking to?"] },
      { type: 'definition', title: 'Who is a Child?', content: 'A child is every human being below the age of eighteen years. Child rights are entitlements all children have for their growth and wellbeing regardless of age, sex, race, nationality, religion, or language.' },
      { type: 'table', label: 'CHILD RIGHTS CATEGORIES', headers: ['Provision Rights', 'Protection Rights', 'Participation Rights'], rows: [
        ['Right to adequate standard of living', 'Right to protection from abuse and neglect', 'Right to freedom of expression'],
        ['Right to health care and nutrition', 'Right to protection from child labour', 'Right to freedom of thought and beliefs'],
        ['Right to education', 'Right to protection from physical abuse', 'Right to make decisions'],
        ['Right to play and recreation', 'Right to protection from drugs', 'Best interest of the child'],
      ]},
    ],
    keyTakeaways: ["Know yourself before you can lead others", "A child is anyone under 18 — child rights apply to everyone", "Trusted adults are your first point of support when things go wrong"],
  },
  {
    num: "Topic 2", title: "My Value System – Life Skills & Personal Awareness", dur: "60 min",
    desc: "Values, puberty, peer pressure, and self-esteem. How personal and social values guide behaviour and shape identity.",
    pledge: "My values — My behaviors — My growth. My personality — I am loyal — I can love — I can tolerate. I need respect — You need respect — She needs respect. Honesty — That is my strength — That is our strength. My body — My sexuality — My responsibility — A time to change!",
    objectives: [
      "Distinguish personal values (honesty, respect) from social values (discipline, justice)",
      "Understand physical and emotional changes during puberty",
      "Use the Three C's model to resist peer pressure",
      "Build self-esteem through knowing, respecting, and affirming yourself",
    ],
    content: [
      { type: 'definition', title: 'Values', content: 'Principles or standards of behavior that reflect what individuals consider important, valuable, or meaningful.' },
      { type: 'values_grid', columns: [
        { title: 'PERSONAL VALUES', items: ['Honesty', 'Responsibility', 'Respect', 'Loyalty', 'Forgiveness', 'Cleanliness', 'Love', 'Tolerance', 'Gratitude', 'Patience'] },
        { title: 'SOCIAL VALUES', items: ['Discipline', 'Co-operation', 'Justice', 'Non-violence', 'Brotherhood', 'Kindness', 'Charity', 'Dignity of individual', 'Sharing', 'Caring'] },
      ]},
      { type: 'paragraph', title: 'Puberty', content: "The keyword when it comes to puberty is CHANGE. Your body is changing, your feelings are changing, and your relationships are changing. Puberty is a natural transition from childhood to adulthood. It typically begins between 9–14 years for boys and 8–13 years for girls." },
      { type: 'step_grid', label: 'HOW TO RESIST PEER PRESSURE — THE THREE C\'s', steps: ["CHALLENGE — What is the problem or situation?", "CHOICES — What are your options and what happens with each choice?", "CONSEQUENCES — What are the short-term and long-term results of each choice?", "Say NO clearly — 'No thanks, that's not for me'", "Choose friends who share your values", "Talk to a trusted adult when pressure feels too strong"] },
      { type: 'activity', label: 'ROLE PLAY — PEER PRESSURE SCENARIOS', content: 'Use the Three C\'s model for each scenario:', items: ['Scenario 1: Your friend is trying to persuade you to smoke.', 'Scenario 2: Your new friend wants you to drink alcohol after school.', 'Scenario 3: Classmates offer you marijuana to smoke.'] },
      { type: 'step_grid', label: 'BUILDING HIGH SELF-ESTEEM', steps: ["KNOW yourself — your values, goals, dreams, and priorities", "RESPECT yourself — never compare yourself to others", "LOVE yourself — you must love yourself before loving others", "AFFIRM yourself — give yourself credit for what you are and what you have done", "TRUST yourself — be your own guide and decision maker", "ACCEPT yourself — embrace who you are today"] },
    ],
    keyTakeaways: ["Personal values guide individual growth; social values guide communities", "Puberty is natural — all the changes are normal", "High self-esteem helps you say No, trust yourself, and make your own decisions"],
  },
  {
    num: "Topic 3", title: "Introduction to H.I.M. & Verbal Techniques", dur: "60 min",
    desc: "The Hero in Me framework — 'Negative turns to Positive'. Awareness, the Gazelle Story, and the four assertive steps.",
    pledge: "As a leader — I will take charge as a leader — I will take lead. I am a HERO — I will stay positive. You are a HERO — You should stay positive. We are HEROES — We will stay positive. We can negotiate — We can De-Escalate Together.",
    objectives: [
      "Define Hero in Me as 'Turning Negative to Positive'",
      "Learn the four steps of awareness from the Gazelle Story",
      "Distinguish between assertive, passive, and aggressive responses",
      "Practice the four assertive steps and saying No assertively",
    ],
    content: [
      { type: 'definition', title: 'Hero In Me (HIM)', content: "Hero in Me is defined as 'Negative turns to Positive.' When a difficult situation leads to a positive outcome, growth, or courage — that is the Hero in Me." },
      { type: 'trainer_says', label: 'THE GAZELLE STORY', content: "The gazelle is eating grass on the sunny plain. The sun is shining — she's having her meal. Suddenly she senses something. She jerks her head up, ears up, completely alert — smelling, listening, her whole body alive as an antenna — then she dashes away! What signals could she have gotten? What would happen if she started making excuses? When the gazelle became aware, did it show?" },
      { type: 'step_grid', label: 'HOW TO BECOME AWARE', steps: ["SLOW DOWN — don't rush through your surroundings", "LOOK AROUND — use your eyes and senses deliberately", "LOOK, DON'T JUST LISTEN — see what is actually happening", "LOOK FOR THE NEW — notice what is different or unusual today"] },
      { type: 'definition', title: 'Assertiveness', content: "Being direct and honest, and standing up for yourself. An assertive person states clearly what they want, makes eye contact, uses an even tone, and stands upright. Assertiveness is NOT aggression." },
      { type: 'step_grid', label: 'THREE RESPONSES TO CONFLICT', steps: ["AGGRESSIVE — bullying, threats, blaming, criticizing, using a mean voice", "ASSERTIVE (what we want) — direct, honest, eye contact, even tone, upright posture", "PASSIVE — not asking for what you want, doing things you don't want, unable to say No"] },
      { type: 'step_grid', label: 'FOUR ASSERTIVE STEPS', steps: ["SAY what you see — describe the situation factually", "SAY how you feel — use 'I feel...' statements", "SAY what you want — be clear and specific", "WALK AWAY — remove yourself if the situation is not resolved"] },
      { type: 'activity', label: 'SAYING NO ASSERTIVELY — PRACTICE LINES', items: ['"No thanks, that\'s not for me."', '"I don\'t want to get in trouble."', '"I respect myself too much to do that."', '"I\'m not comfortable with that."'] },
      { type: 'activity', label: 'ROLE PLAY SCENARIOS', content: 'Practice assertiveness using the four steps:', items: ['Being interrupted unfairly during a debate', 'Someone throwing chewing gum at school', 'Parents saying you cannot have a girlfriend', 'A sibling changing the TV channel without asking'] },
    ],
    keyTakeaways: ["HIM = Turning Negative to Positive", "Awareness: slow down, look around, look for the new", "Assertiveness is direct and honest — not aggressive, not passive"],
  },
  {
    num: "Topic 4", title: "Stepping Up – Intervention Strategies", dur: "60 min",
    desc: "Bystander intervention, de-escalation, and negotiation. What does it mean to Step-Up and how to do it safely.",
    pledge: "As a young man — I will step up — For the people I care about. I will negotiate — I will de-escalate — I will walk away. I will offer help — I will do what works to prevent violence. I am a hero — You are a hero — We are heroes.",
    objectives: [
      "Define Step-Up and understand safety-first bystander intervention",
      "Practice 10+ Step-Up techniques for real situations",
      "Apply de-escalation: tone it down, keep it sane",
      "Use negotiation to separate people from problems and achieve win-win",
    ],
    content: [
      { type: 'definition', title: 'Step-Up', content: "To Come Forward — taking action to prevent, stop, or calm down a conflict situation to protect yourself or someone else. Safety comes first: never put yourself in danger to help." },
      { type: 'definition', title: 'De-Escalation', content: "Simply: Calm Down. Use your voice and your brain. Tone it down, keep it sane. The goal is to reduce the intensity of a conflict so it can be resolved without violence." },
      { type: 'definition', title: 'Negotiation', content: "To bargain, discuss, and weigh options. Goal: Separate people from the problem. Aim for a WIN-WIN situation — not defeat, not victory, but a shared solution." },
      { type: 'table', label: 'STEP-UP TECHNIQUES', headers: ['Technique', 'Technique'], rows: [
        ['"Let\'s talk about this later"', 'Use humor to lighten the mood'],
        ['Lower your voice and stay calm', 'Give choices'],
        ['Act calm even if you are not', 'Walk away if necessary'],
        ['"What would help you right now?"', 'Change the subject to something positive'],
        ['Give personal space', 'Show that you are listening'],
        ['Offer help', '"You can do this"'],
        ['Call another adult for help', 'Avoid over-reacting'],
        ['Use active listening', 'Show empathy and offer solutions'],
        ['Keep escape routes open', 'Be respectful in your tone'],
      ]},
      { type: 'step_grid', label: 'FACTORS TO CONSIDER WHEN STEPPING UP', steps: ["Be aware of your distance from the conflict", "Know where the escape routes are", "Consider whether there are allies nearby who can help", "Communicate calm with your body — wear a concerned look", "Show confidence, not aggression"] },
    ],
    keyTakeaways: ["Step-Up means coming forward — not standing by", "De-escalation = calm down; Negotiation = win-win", "Always keep your own safety in mind first"],
  },
  {
    num: "Topic 5", title: "Breaking the Silence & Referral Systems", dur: "60 min",
    desc: "Recognising violence, disclosure, and seeking help. Referral pathways, trusted adults, and national helplines.",
    pledge: null,
    objectives: [
      "Identify the four types of violence against children",
      "Recognise signs of abuse in peers",
      "Understand that the abuse is never the victim's fault",
      "Map referral pathways and know who to tell",
    ],
    content: [
      { type: 'step_grid', label: 'FOUR TYPES OF VIOLENCE AGAINST CHILDREN', steps: [
        "PHYSICAL VIOLENCE — Hitting, slapping, kicking, beating with objects, corporal punishment",
        "SEXUAL VIOLENCE — Rape, unwanted touching, sexual exploitation, online abuse",
        "EMOTIONAL VIOLENCE — Verbal abuse, threats, insults, humiliation, isolation",
        "NEGLECT — Failure to provide basic needs: food, shelter, healthcare, education",
      ]},
      { type: 'step_grid', label: 'SIGNS OF ABUSE', steps: [
        "Unexplained injuries or bruises",
        "Fearful, anxious, or withdrawn behavior",
        "Sudden changes in behavior or school performance",
        "Avoidance of certain people or places",
        "Inappropriate sexual knowledge for age",
      ]},
      { type: 'tip', label: 'BREAKING THE SILENCE — KEY MESSAGES', content: "The attack or abuse is NOT your fault. Break silence even if the attacker told you not to. You don't have to speak publicly — tell someone in private. Sometimes the abuser is a family member — it doesn't matter who they are. You are not alone. You are worth defending." },
      { type: 'step_grid', label: 'REFERRAL PATHWAYS — WHO TO TELL', steps: [
        "Trusted teacher or school counsellor",
        "Parent or relative",
        "Mother Group",
        "Chief or village head",
        "Police / Victim Support Unit (VSU)",
        "Health worker or nurse",
        "Child Protection Worker",
        "Religious leader",
      ]},
      { type: 'helpline', label: 'NATIONAL HELPLINES', content: '116 — Tithandizane Child Help Line (free) · 5600 / 6600 — GBV Crisis Line' },
      { type: 'trainer_says', label: 'Role of Teacher Champions', content: "Teachers are not investigators. Their role is to act as first responders and connectors to professional services. Referrals should be timely, confidential, and appropriate." },
    ],
    keyTakeaways: ["Breaking silence starts healing — tell until someone listens", "Referral pathways exist to protect you — use them", "Abuse is NEVER the victim's fault"],
  },
  {
    num: "Topic 6", title: "Boys & Girls Combined – Consent & Gender", dur: "90 min",
    desc: "Joint session with GESD. Taking vs. Asking, consent, sex vs. gender, gender stereotypes, and the Chameleon Story.",
    pledge: null,
    objectives: [
      "Understand Taking vs. Asking and the principle of consent",
      "Define consent as hearing the word YES — not the absence of NO",
      "Distinguish sex (biological) from gender (social)",
      "Challenge gender stereotypes using the Chameleon Story",
    ],
    content: [
      { type: 'activity', label: 'TAKING VS. ASKING — ROLE PLAYS', content: 'Discuss these scenarios and identify what permission was needed:', items: ['You see someone left their pen on a table. You grab it and run.', 'You want to borrow transport money from your family.', 'A friend\'s notes are borrowed after they said No.'] },
      { type: 'definition', title: 'Consent', content: "Consent is an agreement between people. Consent is HEARING THE WORD YES — NOT the absence of hearing No. Consent must happen every time, for every activity. You can withdraw consent at any point." },
      { type: 'tip', label: 'THERE IS NO CONSENT WHEN:', content: "Someone refuses to acknowledge No · Wearing certain clothes or flirting is assumed to mean yes · Someone is underage · Someone is incapacitated by drugs or alcohol · Someone is pressured using fear or intimidation" },
      { type: 'definition', title: 'Sex vs. Gender', content: "SEX: Physical and biological differences between males and females — biological, universal, unchanging. GENDER: Social differences — socially constructed, differs across cultures, changes over time. Inequity between men and women is NOT caused by biology but by socially constructed attributes." },
      { type: 'table', label: 'GENDER STEREOTYPES', headers: ['Perceived Male Qualities', 'Perceived Female Qualities'], rows: [
        ['Adventurous, Aggressive, Strong', 'Weak, Shy, Gentle'],
        ['Rough, Impatient, Rational', 'Dependent, Tolerant, Sensitive'],
        ['Intelligent, Self-centered', 'Jealous, Caring, Forgiving'],
        ['Authoritative, Satisfied', 'Emotional'],
      ]},
      { type: 'trainer_says', label: 'THE CHAMELEON STORY', content: "Two chameleons were sleeping. A loud noise woke them. One hid under the bed. The other picked up a stick and ran toward the door. Which is male and which is female? The answer: We cannot know. Due to socialization, we associate bravery with males and weakness with females — but these are social constructions, NOT biology. They can and do change." },
      { type: 'activity', label: 'DISCUSSION QUESTIONS', items: ["Is it easy or hard to look at male and female roles in a non-traditional way?", "How have changing gender roles affected relationships in families and schools?", "If you could make one change in men's gender roles, what would it be?"] },
    ],
    keyTakeaways: ["Consent = hearing YES — every time, for every activity", "Gender is social and changeable; sex is biological", "We are all Heroes — boys and girls, together"],
  },
];

export const GESD_SESSIONS: Session[] = [
  {
    num: "Module 1", title: "Getting to Know You & Life Skills", dur: "60 min",
    desc: "Help students realise they are unique beings. Explore personal identity, puberty, menstruation, and personal hygiene.",
    pledge: "These are my private parts / No one should touch them / No one should see them / No one should play with them / Awa ndi malo anga obisika",
    objectives: [
      "Recognise personal strengths and enhance self-image",
      "Understand adolescence and puberty changes in both boys and girls",
      "Learn about menstruation and personal hygiene",
      "Identify what to avoid at this stage of life",
    ],
    content: [
      { type: 'activity', label: 'GETTING TO KNOW YOU — QUESTIONS', content: 'Facilitator asks students:', items: ["Who are you? State your name and where you reside.", "What are your likes and dislikes?", "What are you good at? (Drawing, soccer, reading, best subjects)", "In the company of fellow girls, what topics do you always discuss?", "Have you ever been pressured to do something you don't like?", "Do you know about private parts? (Students to name them)"] },
      { type: 'cheer', label: 'PRIVATE PARTS CHANT (repeat 3 times)', content: "These are my private parts.\nNo one should see them.\nNo one should touch them.\nNo one should feel them.\nNo one should play with them.\n\nAwa ndi malo anga obisika.\nWina asawagwire.\nWina asawone.\nWina asawseweletse." },
      { type: 'definition', title: 'Adolescence', content: "The developmental phase between childhood and adulthood, generally spanning ages 10 to 19 years. Characterized by significant physical, psychological, emotional, and social changes." },
      { type: 'table', label: 'PHYSICAL CHANGES DURING PUBERTY', headers: ['Boys', 'Girls', 'Both'], rows: [
        ['Deep voice', 'Enlargement of breasts', 'Grow taller'],
        ['Stronger muscles', 'Increase in height and weight', 'More body hair'],
        ['Produce sperm', 'Hips broaden (curvy)', 'Body odor'],
        ['Penis and testicles grow', 'Menstruation begins', 'Acne and pimples'],
        ['Breasts may grow slightly', 'Voice smooths', ''],
      ]},
      { type: 'definition', title: 'Menstruation', content: "Normal vaginal bleeding from the vagina as part of a woman's monthly cycle. The average cycle is every 28 days. Regular cycles from 21 to 35 days are normal." },
      { type: 'step_grid', label: 'PERSONAL HYGIENE DURING MENSTRUATION', steps: ["Change sanitary towels regularly to avoid odour", "Bathe at least twice a day and comb hair", "Brush teeth at least twice daily", "Wash clothes regularly", "Clean vagina with clean water only"] },
      { type: 'step_grid', label: 'WHAT GIRLS SHOULD AVOID AT THIS STAGE', steps: ["Negative peer pressure", "Premarital sexual intercourse", "Drug and substance abuse"] },
    ],
    keyTakeaways: ["You are unique and worthy of love and respect", "Puberty changes are normal — your body is growing", "Your private parts belong to you — no one should touch them"],
  },
  {
    num: "Module 2", title: "GESD & Attack Progression Scale", dur: "60 min",
    desc: "The three components of GESD: self-empowerment, self-efficacy, self-defense. Women's Assertive Bill of Rights and the Attack Progression Scale.",
    pledge: null,
    objectives: [
      "Understand the three components of GESD: Self-Empowerment, Self-Efficacy, Self-Defense",
      "Know all 20 rights in the Women/Girls Assertive Bill of Rights",
      "Identify the APS: Verbal, Intimidation, Physical, Sexual Assault",
      "Know how to use your voice to stop attacks",
    ],
    content: [
      { type: 'definition', title: 'GESD — Three Components', content: "GESD is composed of: SELF-EMPOWERMENT (helping girls take charge of their lives and make good decisions), SELF-EFFICACY (the spirit that enables girls to believe they are worthy of defending themselves), and SELF-DEFENSE (anything we DO, SAY, or BELIEVE that helps keep us safe — fighting back is the LAST RESORT)." },
      { type: 'definition', title: 'Main Aim of GESD', content: "THE MAIN AIM IS TO GET AWAY. Don't fight unless you have to. If you can run away, run. If you can talk your way out, talk. Fight only when it is your last and best option." },
      { type: 'activity', label: 'WOMEN/GIRLS ASSERTIVE BILL OF RIGHTS', content: 'Every girl has these 20 rights:', items: [
        "You have the right to judge your own behaviors, thoughts, and emotions.",
        "You have the right to offer no reasons, excuses, or justifications for your behavior.",
        "You have the right to judge if you are responsible for solving other people's problems.",
        "You have the right to change your mind.",
        "You have the right to make mistakes and be responsible for them.",
        "You have the right to say 'I don't know'.",
        "You have the right to be independent of the goodwill of others.",
        "You have the right to be illogical in making decisions.",
        "You have the right to say 'I don't understand'.",
        "You have the right to say 'I don't care'.",
        "You have the RIGHT TO SAY NO.",
        "You have the right to do less than you are humanly capable of doing.",
        "You have the right to take the time you need to respond.",
        "You have the right to disagree with others regardless of their position or numbers.",
        "You have the right to feel all your emotions (including anger) and express them appropriately.",
        "You have the right to ask questions.",
        "You have the right to be treated with respect.",
        "You have the right to ask for what you want.",
        "You have the right to feel good about yourself, your actions, and your life.",
        "You have the right to exercise any and all of these rights without feeling guilty.",
      ]},
      { type: 'table', label: 'ATTACK PROGRESSION SCALE (APS)', headers: ['Level', 'Type', 'Description'], rows: [
        ['VERBAL', 'Hands-Off, Irritating', 'Harassament, yelling, taunting, name calling, bullying, threats'],
        ['INTIMIDATION', 'Hands-Off, Dangerous', 'Menacing stance, following, stalking, cornering, blocking path'],
        ['PHYSICAL', 'Hands-On, Life-Threatening', 'Touching, grabbing, pushing, slapping, kicking, choking, weapons'],
        ['SEXUAL ASSAULT', 'Hands-On', 'Defilement, rape, forced sexual acts, touching private parts, harassment'],
      ]},
      { type: 'trainer_says', label: 'IMPORTANT', content: "The APS is NOT a straight line. Violent behaviors can jump from one level to another in any order. We want conflict to end where it starts — without getting worse. Our response may differ depending on who the attacker is and their condition." },
      { type: 'step_grid', label: 'USES OF VOICE IN STOPPING ATTACKS', steps: ["Yell NO loudly", "Call for help", "Lie or use trickery", "Tell a trusted person", "Warn of consequences", "Name the behavior", "Fake compliance to buy time", "Use humor to distract", "Negotiate", "Act crazy"] },
    ],
    keyTakeaways: ["GESD aim is always to GET AWAY — fight is the last resort", "You have 20 assertive rights — use them", "The APS can jump levels — respond early"],
  },
  {
    num: "Module 3", title: "Perpetrator's Progression Pattern & Awareness", dur: "60 min",
    desc: "The PPP: Victim Identification → Selection → Attack. The Gazelle Story. A.B.L.E — 4 visible signs of awareness. Trusting your inner voice. Five Personal Weapons: SMEVB.",
    pledge: "INTUITION / I can trust it — It is my Alarm / If I listen — it keeps me from all harm",
    objectives: [
      "Understand the three stages of the Perpetrator's Progression Pattern (PPP)",
      "Recognise ploys attackers use and how to respond to them",
      "Apply the A.B.L.E framework: Alert, Body Language, Loudness, Eye Contact",
      "Trust your inner voice and distinguish it from denial",
      "Know the 5 Personal Weapons: Spirit, Mind, Eyes, Voice, Body (SMEVB)",
    ],
    content: [
      { type: 'step_grid', label: "PERPETRATOR'S PROGRESSION PATTERN (PPP) — THREE STAGES", steps: [
        "STAGE 1 — VICTIM IDENTIFICATION: Attacker looks for an easy, vulnerable victim. Most attackers are people the victim knows.",
        "STAGE 2 — VICTIM SELECTION: Attacker tests you — uses ploys, flattery, ignoring No. Your reaction determines if they continue.",
        "STAGE 3 — ATTACK PROCESS: Most dangerous stage. If ordered to go somewhere, that place will be BETTER FOR HIM and WORSE FOR YOU.",
      ]},
      { type: 'table', label: 'COMMON PLOYS AND WHAT THEY MEAN', headers: ['Ploy', 'What It Means'], rows: [
        ['Flattery / niceness', 'Testing how you respond to attention'],
        ['Asking for help', 'Preys on politeness — you feel obliged to respond'],
        ['Ignoring No', 'HUGE RED FLAG — if he ignores No now, he will not hear it later'],
        ['Creating a debt', 'Insists on giving help, then says you owe him'],
        ['Too much information', 'Over-explaining because he is lying'],
        ['Forced teaming', 'Creates a fake bond or shared interest'],
        ['Intimidation', 'Uses threats to get you to comply'],
        ['Baiting', 'Says something untrue so you feel the need to deny or explain yourself'],
      ]},
      { type: 'trainer_says', label: 'THE GAZELLE STORY', content: "The gazelle is eating grass on the sunny plain. Suddenly she senses something, jerks her head up, ears up — completely alert — then dashes away! She trusted her signal and acted immediately. She did not make excuses. We can do the same." },
      { type: 'step_grid', label: 'I AM A.B.L.E — 4 VISIBLE SIGNS OF AWARENESS', steps: [
        "A — ALERT: I am paying attention to my surroundings. If something feels uncomfortable, trust that feeling and move to safety.",
        "B — BODY LANGUAGE: Stand tall, shoulders back, move with confidence. Strong body language says: I am aware and in control.",
        "L — LOUDNESS: Confident, clear voice — speaking up, not mumbling. Shows you are not afraid to call attention to yourself.",
        "E — EYE CONTACT: A clear sign of awareness. Eye contact alone can end targeting. It says: I see you and I am not scared.",
      ]},
      { type: 'cheer', label: 'AWARENESS CHEER', content: "Alert: I am paying attention — I AM ALERT!\nBody Language: I am confident, I am not scared!\nLoudness: I will Yell! I will call for help!\nEye Contact: I can see you — I WILL NOT BE SILENCED!\n\nI AM A.B.L.E!" },
      { type: 'definition', title: 'Inner Voice / Intuition', content: "The feelings or thoughts that warn us of potential danger. Women and girls must learn to trust this inner voice, even when cultural influences have taught them to ignore warning signals." },
      { type: 'step_grid', label: 'MESSENGERS OF THE INNER VOICE vs. DENIAL', steps: [
        "INNER VOICE: Gut feeling · Hesitation · Wonder · Nagging thoughts",
        "DENIAL (silences your intuition): Justify · Minimize · Make excuses · Ridicule · Refuse to believe it",
      ]},
      { type: 'table', label: 'FIVE PERSONAL WEAPONS — S.M.E.V.B', headers: ['Weapon', 'Description'], rows: [
        ['SPIRIT', 'Attitude! Belief that you are worth defending. Spirit first, technique second.'],
        ['MIND', 'Gathers data. Looks for weak spots, escape routes, things to use as weapons.'],
        ['EYES', 'Shows resistance. Eye contact can end targeting. Scans for escape routes.'],
        ['VOICE', 'Yells NO! Calls for help. Can negotiate, distract, lie, or act crazy. Up to 85% of training is using voice.'],
        ['BODY', 'Body language, gestures, running, or fighting to stay safe.'],
      ]},
      { type: 'cheer', label: 'SMEVB CHEER', content: "I've got my SPIRIT! I can defend myself. I am worth defending!\nI've got my MIND! It's taking in the situation. Helping me get free!\nI've got my EYES! I see you. I'm not intimidated. I'm putting you on notice!\nI've got my VOICE! I'll use it. I'll tell everyone! Get back!\nI am powerful. I am dangerous. My body is strong. I've got FIVE weapons!" },
    ],
    keyTakeaways: ["Be and ACT aware — always", "Trust your inner voice — it is your alarm", "SMEVB: Spirit, Mind, Eyes, Voice, Body — use them all"],
  },
  {
    num: "Module 4", title: "Verbal Safety Toolbox & Breaking the Silence", dur: "60 min",
    desc: "Most attacks can be stopped by using your voice. Fighting stance, yell, assertiveness, setting boundaries, and breaking the silence.",
    pledge: null,
    objectives: [
      "Use the verbal safety toolbox to prevent and stop attacks",
      "Practice the fighting stance and yell",
      "Speak assertively and set clear boundaries",
      "Understand Breaking the Silence and know who and how to tell",
    ],
    content: [
      { type: 'definition', title: 'Verbal Safety Toolbox', content: "A range of strategies, skills, ideas, and techniques for handling conflict and preventing attacks. Many attacks can be stopped simply by using our voices effectively." },
      { type: 'step_grid', label: 'VERBAL SAFETY TOOLS', steps: ["Yell NO loudly", "Call for help", "Tell a trusted person", "Warn of consequences", "Name the behavior: 'You are threatening me'", "Use humor to defuse", "Negotiate: find common ground", "Act crazy to confuse the attacker", "Fake compliance to buy time and escape", "Set clear boundaries"] },
      { type: 'activity', label: 'STRONG NO vs. WEAK NO — PRACTICE', content: 'Students say NO using different attitudes and observe which carries most weight:', items: ['Angry No', 'Tired No', 'FIRM No (this is what we want)', 'Quiet No', 'Smiling/flirty No (sends mixed signals)', 'Distracted No'] },
      { type: 'step_grid', label: 'FIGHTING STANCE — HOW TO STAND', steps: ["Place one foot back — feet shoulder-width apart", "Bend knees so they are loose and bouncy", "Centre of gravity over your hips", "Hands up with palms out (universal sign for NO / STOP)", "Do NOT make fists — attacker may think you want to fight", "Chest high, chin slightly down"] },
      { type: 'definition', title: 'The Yell', content: "Yell from deep in your gut — different from a scream. Comes from lower and sounds lower too. It scares the attacker away, lets others know you resist, and attracts help. Your yell should be deep and powerful." },
      { type: 'definition', title: 'Assertiveness', content: "Knowing what you want and stating it clearly. Show the would-be attacker early on that you will tell, and that the risk of you resisting and reporting him is very high. Speak firmly, calmly, make eye contact. You do NOT have to justify yourself, apologise, or make excuses." },
      { type: 'definition', title: 'Boundaries', content: "Rules we set for how we want others to speak and act towards us. We train people how to treat us from the moment we meet. If we let disrespectful behavior go by, we give permission for it to continue." },
      { type: 'tip', label: 'BREAKING THE SILENCE', content: "The attack is NOT your fault. Tell someone — if the first person doesn't believe you, tell and tell again until someone does. You don't have to speak publicly; you can tell in private. Telling is the beginning of healing." },
      { type: 'helpline', label: 'HELPLINES', content: '116 — Tithandizane Child Help Line (free) · 5600 / 6600 — GBV Crisis Line' },
    ],
    keyTakeaways: ["Your voice is your most powerful tool — 85% of defense is verbal", "A FIRM, direct No carries the most weight", "Setting boundaries teaches others how to treat you"],
  },
  {
    num: "Module 5", title: "Physical Techniques", dur: "60 min",
    desc: "Five Fingers of Emergency Self-Defense: Think · Yell · Run · Fight · Tell. Weapons, targets, and close target skills.",
    pledge: "I am a girl, I believe in my capabilities / I have the right to education / I have the right to be treated with respect / I will not be silenced / I say No",
    objectives: [
      "Apply the Five Fingers of Emergency: Think, Yell, Run, Fight, Tell",
      "Match personal weapons to vulnerable targets on an attacker",
      "Use 'What's Free, What's Open' to replace panic with strategy",
      "Practice close target skills: wrist grab, back kick, stomp, knee to groin",
    ],
    content: [
      { type: 'step_grid', label: 'FIVE FINGERS OF EMERGENCY SELF-DEFENSE', steps: [
        "1. THINK — Don't panic. Stay calm and think. If something doesn't feel right, leave immediately.",
        "2. YELL — Use your voice! Yell NO loudly. Call for help. Your strongest, loudest voice.",
        "3. RUN — Get away and run if you can. If you can avoid violence, you should.",
        "4. FIGHT — If you need to fight, use What's Free and What's Open. Hit primary targets.",
        "5. TELL — Don't keep quiet. Telling is important for healing. Tell until someone listens.",
      ]},
      { type: 'step_grid', label: 'FIVE MAJOR STEPS FOR PHYSICAL DEFENSE', steps: [
        "RANGE — How close is the attacker?",
        "TARGET — Where will you hit?",
        "WEAPON — What body part will you use?",
        "POWER SOURCE — Where does your power come from?",
        "SAFETY — How will you get away after the strike?",
      ]},
      { type: 'table', label: 'WEAPONS AND TARGETS', headers: ['Your Weapon', 'Target on Attacker', 'Strike'], rows: [
        ['Fingers', 'Eyes', 'Poke, gouge, bird beak, eye scratch'],
        ['Palm', 'Nose, Chin, Groin', 'Palm strikes (nose, chin), groin grab'],
        ['Fist', 'Throat, Temples, Ears', 'Hammer fist to throat, temples, ear box'],
        ['Elbow', 'Diaphragm, Spinal Cord', 'Back elbow'],
        ['Knees', 'Groin', 'Knee to the groin'],
        ['Heel', 'Knee, Small Toe', 'Side kick, stomp'],
      ]},
      { type: 'step_grid', label: 'FOUR PRIMARY TARGETS (hit to disable attacker)', steps: ["1. EYES", "2. THROAT", "3. GROIN", "4. KNEE"] },
      { type: 'definition', title: "What's Free and What's Open", content: "When grabbed: WHAT'S FREE = What is NOT grabbed that I can use to fight with? WHAT'S OPEN = What vulnerable body part on the attacker can I hit to get free? This replaces panic with organized strategy." },
      { type: 'table', label: 'CLOSE TARGET SKILLS', headers: ['Technique', 'Steps'], rows: [
        ['Wrist Grab', '1) Make stance 2) Twist wrist against thumb while yelling NO 3) Get away'],
        ['Back Kick', '1) Make stance 2) Break knee from back using heel while yelling NO 3) Get away'],
        ['Stomp', '1) Make stance 2) Stomp baby toe using heel while yelling NO 3) Get away'],
        ['Knee to Groin', '1) Make stance 2) Support on attacker\'s shoulder 3) Hit groin with knee while yelling NO 4) Get away'],
        ['Eye Poke', '1) Make stance 2) Put a shield 3) Poke eyes with two fingers while yelling NO 4) Get away'],
        ['Hair Grab', '1) Support hair to ease pain 2) Hold his hand 3) Make stance 4) Turn to do release 5) Secondary move 6) Get away'],
      ]},
      { type: 'trainer_says', label: 'IMPORTANT', content: "The attack or abuse is NOT your fault. Tell, even if the attacker told you not to. Whatever happened, you did what you needed to survive. You are worth defending." },
    ],
    keyTakeaways: ["Think → Yell → Run → Fight → Tell", "What's Free, What's Open replaces panic with strategy", "TELL until someone listens — you are never alone"],
  },
  {
    num: "Module 6", title: "Combined Class – Consent, Gender & Wrap-Up", dur: "90 min",
    desc: "Joint session with HIM. Taking vs. Asking, consent, sex vs. gender, gender division of roles, the Chameleon Story, and wrap-up circle.",
    pledge: null,
    objectives: [
      "Understand consent as hearing YES — not the absence of No",
      "Distinguish sex (biological) from gender (social)",
      "Challenge gender stereotypes through the Chameleon Story and role activities",
      "Identify one person outside the group to teach what you have learned",
    ],
    content: [
      { type: 'activity', label: 'TAKING vs. ASKING — ROLE PLAYS', items: ['You see a pen left on a table. You grab it and run.', 'You want transport money — you ask your family.', 'Your notes are taken after you said No.'] },
      { type: 'definition', title: 'Consent', content: "Consent is an agreement between people. CONSENT IS HEARING THE WORD YES — NOT THE ABSENCE OF HEARING NO. Giving consent for one activity does NOT mean consent for more. You can WITHDRAW consent at any point if you feel uncomfortable." },
      { type: 'tip', label: 'THERE IS NO CONSENT WHEN:', content: "Someone refuses to acknowledge No · Wearing certain clothes or flirting is assumed as permission · The person is underage · The person is incapacitated by drugs or alcohol · Fear or intimidation is used to get compliance." },
      { type: 'definition', title: 'Sex vs. Gender', content: "SEX: Physical and biological differences — universal and unchanging. GENDER: Social differences — constructed by society, varies across cultures, changes over time. The cause of inequity between men and women is NOT biological but socially constructed." },
      { type: 'trainer_says', label: 'THE CHAMELEON STORY', content: "Two chameleons were sleeping on the bed. A loud noise woke them. One hid under the bed. The other picked up a stick and ran toward the door. Which is male and which is female? The answer: We cannot know. Due to socialization, we associate aggression and bravery with males, and weakness and submission with females. But these are SOCIAL CONSTRUCTIONS — and therefore CHANGEABLE." },
      { type: 'activity', label: 'WRAP-UP CIRCLE', content: 'Discussion questions:', items: ["What was the most important thing you learned today?", "How can the skills you learned help you with situations in your life right now?", "Does anyone need help with a current situation?", "Who is one person you want to teach what you learned here?"] },
    ],
    keyTakeaways: ["Consent must be heard as YES — every time", "Gender is social, not biological — roles can change", "You are worth defending — always"],
  },
];


export const SESSION_LISTS: Record<string, string[]> = {
  HIM: ["Topic 1: Getting to Know You", "Topic 2: My Value System", "Topic 3: Intro to H.I.M & Verbal Techniques", "Topic 4: Hero in Me: Step-Up Strategies", "Topic 5: Referrals & Break the Silence", "Topic 6: Boys & Girls Combined Session"],
  GESD: ["Session 1: Getting to Know You", "Session 2: Intro to GESD", "Session 3: Awareness", "Session 4: Verbal Techniques", "Session 5: Physical Techniques", "Session 6: Combined Class — Boys & Girls"],
  Combined: ["Topic 6 / Session 6: Boys & Girls Combined"],
};

export const DISTRICT_LIST = [
  "Balaka", "Blantyre", "Chikwawa", "Chiradzulu", "Chitipa", "Dedza", "Dowa",
  "Karonga", "Kasungu", "Likoma", "Lilongwe", "Machinga", "Mangochi", "Mchinji",
  "Mulanje", "Mwanza", "Mzimba", "Neno", "Nkhata Bay", "Nkhotakota", "Nsanje",
  "Ntcheu", "Ntchisi", "Phalombe", "Rumphi", "Salima", "Thyolo", "Zomba",
];

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

// ─── TEACHER CHAMPION MODULES ─────────────────────────────────────────────────

export const TEACHER_CHAMPION_SESSIONS: Session[] = [
  {
    num: "TC-1", title: "Roles and Responsibilities of Teacher Champions", dur: "60 min",
    desc: "Understand what it means to be a Teacher Champion — a trusted adult who creates safe spaces for learners and upholds child protection.",
    pledge: null,
    objectives: [
      "Define the role of a Teacher Champion in the ETT programme",
      "Understand responsibilities toward learner safety and wellbeing",
      "Identify key obligations under the national child protection framework"
    ]
  },
  {
    num: "TC-2", title: "Understanding Positive Discipline", dur: "60 min",
    desc: "Explore child-friendly discipline approaches that build trust, respect, and healthy boundaries — without corporal punishment.",
    pledge: null,
    objectives: [
      "Distinguish positive discipline from punitive approaches",
      "Apply positive reinforcement strategies in the classroom",
      "Create an emotionally safe and respectful learning environment"
    ]
  },
  {
    num: "TC-3", title: "Child Rights, VAEN and Life Skills", dur: "60 min",
    desc: "Understand children's fundamental rights, Violence Against and Exploitation of Children (VAEN), and how life skills education protects learners.",
    pledge: null,
    objectives: [
      "Explain the four categories of child rights",
      "Identify forms of violence, abuse, exploitation and neglect (VAEN)",
      "Integrate life skills education into everyday classroom practice"
    ]
  },
  {
    num: "TC-4", title: "Developing Rules and Regulations with Learner Participation", dur: "60 min",
    desc: "Co-create classroom rules with learners to build ownership, reduce conflict, and promote democratic values.",
    pledge: null,
    objectives: [
      "Facilitate participatory rule-making with students",
      "Explain why learner participation leads to better compliance",
      "Design a classroom agreement collaboratively"
    ]
  },
  {
    num: "TC-5", title: "Mentorship and Role Modelling", dur: "60 min",
    desc: "Become a positive role model and mentor who inspires learners to make healthy, safe, and confident choices.",
    pledge: null,
    objectives: [
      "Define mentorship within the Teacher Champion context",
      "Demonstrate positive role modelling in daily interactions",
      "Build trust-based relationships that support learner disclosure"
    ]
  },
  {
    num: "TC-6", title: "Guidance and Counselling", dur: "60 min",
    desc: "Equip Teacher Champions with foundational counselling skills to support learners experiencing distress, abuse, or peer conflict.",
    pledge: null,
    objectives: [
      "Apply basic counselling listening techniques",
      "Identify when to refer a learner to professional services",
      "Support a learner after disclosure without causing further harm"
    ]
  },
];

// ─── QUIZ QUESTIONS ───────────────────────────────────────────────────────────


export const HIM_QUIZ_QUESTIONS: QuizQuestion[] = [
  { id:1,  topic:"Child Rights",    question:"According to the Hero in Me curriculum, who is defined as a child?", options:["Anyone under the age of 16 years","Anyone under the age of 18 years","Anyone under the age of 21 years","Anyone under the age of 15 years"], correctAnswer:1, explanation:"A child is every human being below the age of 18 years, consistent with the UN Convention on the Rights of the Child." },
  { id:2,  topic:"Values",          question:"Which of the following is an example of a PERSONAL value?", options:["Discipline and Co-operation","Kindness and Charity","Honesty and Respect","Brotherhood and Justice"], correctAnswer:2, explanation:"Personal values guide individual growth and include honesty, responsibility, humanity, and respect. Discipline, co-operation, brotherhood, and justice are social values." },
  { id:3,  topic:"Puberty",         question:"At what age range does puberty typically begin in boys?", options:["6 to 10 years","9 to 14 years","12 to 18 years","8 to 13 years"], correctAnswer:1, explanation:"The curriculum states puberty typically occurs between 9 to 14 years for boys and 8 to 13 years for girls." },
  { id:4,  topic:"Peer Pressure",   question:"What is the best definition of peer pressure?", options:["Pressure from teachers to perform well","Feeling pressured by friends or peers to act in certain ways","Pressure from parents to follow family rules","Academic stress caused by examinations"], correctAnswer:1, explanation:"Peer pressure is the pressure felt from friends or peers to act or behave in certain ways, which can be positive or negative." },
  { id:5,  topic:"Self-Esteem",     question:"Which is NOT listed as a way to promote high self-esteem?", options:["Practice saying no","Talk to someone you trust","Compare yourself to others to improve","Avoid comparing yourself to others"], correctAnswer:2, explanation:"The curriculum teaches you should AVOID comparing yourself to others. Comparing negatively lowers self-esteem." },
  { id:6,  topic:"Hero in Me",      question:"How is Hero in Me (HIM) defined?", options:["Being physically strong and brave","Turning from Negative to Positive","Having superpowers to help others","Following rules set by adults"], correctAnswer:1, explanation:"Hero in Me is defined as Turning from Negative to Positive — difficult situations lead to positive outcomes, growth, or courage." },
  { id:7,  topic:"Assertiveness",   question:"What does being assertive mean?", options:["Being aggressive and dominating others","Staying silent to avoid conflict","Being direct, honest, and standing up for yourself","Always agreeing with what others say"], correctAnswer:2, explanation:"Assertiveness means being direct and standing up for yourself, being honest about what you need and want, without being aggressive." },
  { id:8,  topic:"Step-Up",         question:"What is the definition of Step-Up?", options:["To run away from danger","To call the police immediately","To come forward and take action to prevent or stop harm","To ignore minor conflicts"], correctAnswer:2, explanation:"Step-Up is To Come Forward — taking action to prevent, stop, or calm down a conflict situation to protect yourself or someone else." },
  { id:9,  topic:"Consent",         question:"Which best describes consent?", options:["The absence of a no from the other person","An agreement between people meaning hearing the word yes","Permission needed only once","Something only needed in romantic relationships"], correctAnswer:1, explanation:"Consent is an agreement between people. The curriculum emphasizes consent is hearing the word YES. It is NOT the absence of NO. It must happen every time." },
  { id:10, topic:"Breaking Silence", question:"What is Breaking the Silence?", options:["Shouting loudly when attacked","Posting about abuse on social media","Giving someone hope and courage to talk about a violent incident","Reporting every small argument to a teacher"], correctAnswer:2, explanation:"Breaking the Silence means giving someone hope and courage to speak about violence, harassment, or abuse they experienced or witnessed, so they can get help." },
  { id:11, topic:"Awareness",        question:"What is the first step to becoming aware according to HIM?", options:["Run away immediately","Slow down and notice small problems","Call for help loudly","Lock yourself in a safe place"], correctAnswer:1, explanation:"The curriculum teaches that slowing down helps you notice any small problem around you — this is the first step to awareness." },
  { id:12, topic:"De-escalation",    question:"What does de-escalation mean?", options:["Escalating a conflict to get attention","Calming down a conflict situation","Running away from danger","Calling authorities immediately"], correctAnswer:1, explanation:"De-escalation simply means 'Calm Down' — calmly communicating with an agitated person to understand, manage and resolve a conflict situation." },
  { id:13, topic:"Negotiation",      question:"What is the goal of negotiation according to the curriculum?", options:["To win at all costs","To separate people from the problem","To avoid all conflict","To always agree with others"], correctAnswer:1, explanation:"The goal of negotiation is to separate people from the problem — addressing issues not personalities, aiming for a win-win situation." },
  { id:14, topic:"Values",           question:"Social values are best described as:", options:["Private personal beliefs","Principles defined by society, institutions, traditions and cultural beliefs","Individual goals and ambitions","Rules set by parents and guardians"], correctAnswer:1, explanation:"Social values are a set of moral principles defined by society dynamics, institutions, traditions and cultural beliefs that enable individuals to improve their social life." },
  { id:15, topic:"Child Rights",     question:"Which of the following is a PROTECTION right?", options:["Right to play and recreation","Right to education","Right to protection from child labour","Right to freedom of expression"], correctAnswer:2, explanation:"Protection rights include the right to protection from child labour, sexual and physical abuse, drugs, and other harms." },
  { id:16, topic:"Referral",         question:"Which service provides immediate support and basic counselling for survivors?", options:["Social Welfare/NGOs","Community Victim Support Unit","Mother Group","Child Protection Worker"], correctAnswer:1, explanation:"The Community Victim Support Unit provides immediate support and basic counselling to survivors of violence." },
  { id:17, topic:"Puberty",          question:"Which of the following is a physical change during puberty in BOYS only?", options:["Growth of body hair","Acne and pimples","Growth spurts","Deepening of the voice"], correctAnswer:3, explanation:"Deepening of the voice is a physical change specific to males during puberty. Body hair, acne, and growth spurts occur in both boys and girls." },
  { id:18, topic:"Self-Esteem",      question:"What is a sign of HIGH self-esteem?", options:["Accepting nicknames like 'shorty' or 'fatty'","Giving credit to others when it belongs to you","Accepting new challenges and trying new activities","Not accepting compliments"], correctAnswer:2, explanation:"High self-esteem allows you to accept new challenges and try new activities, because you believe in yourself and your ability to succeed." },
  { id:19, topic:"Step-Up",          question:"When doing Step-Up activities, which factor should you consider?", options:["How to embarrass the attacker","Be aware of distance and know where escape routes are","Always confront the aggressor directly","Ignore bystanders around you"], correctAnswer:1, explanation:"When doing Step-Up, be aware of distance (how close to be), know escape routes, and consider if there may be allies nearby." },
  { id:20, topic:"Breaking Silence", question:"The Tithandizane Child Help Line in Malawi is:", options:["Toll-free number 116","Toll-free number 999","Number 5600","Number 0800"], correctAnswer:0, explanation:"116 is the Tithandizane Child Help Line — a free helpline available in Malawi for children experiencing abuse or violence." },
];

export const GESD_QUIZ_QUESTIONS: QuizQuestion[] = [
  { id:1,  topic:"GESD Basics",     question:"What does GESD stand for?", options:["Girls Education Self Development","Girls Empowerment Self Defense","Gender Equality Social Development","Girls Empowerment Social Direction"], correctAnswer:1, explanation:"GESD stands for Girls Empowerment Self Defense — the foundation on which all safety goals and strategies are built." },
  { id:2,  topic:"GESD Aim",        question:"According to the curriculum, what is the MAIN AIM of self-defense?", options:["To fight and win every battle","To hurt the attacker first","To get away","To show strength"], correctAnswer:2, explanation:"The main aim of GESD is TO GET AWAY. Fighting back is the last resort when you cannot get away by running or talking." },
  { id:3,  topic:"Awareness",       question:"What are the four visible signs of awareness represented by A.B.L.E?", options:["Alert Bold Loud Effective","Aware Brave Listen Escape","Alert Body Language Loudness Eye Contact","Attention Balance Look Escape"], correctAnswer:2, explanation:"A.B.L.E stands for Alert, Body Language, Loudness, Eye Contact — the four visible signs that you are aware and cannot be easily targeted." },
  { id:4,  topic:"Inner Voice",     question:"Which of the following is a MESSENGER OF THE INNER VOICE?", options:["Ridicule","Minimize","Gut feeling","Justify"], correctAnswer:2, explanation:"Gut feeling is a messenger of the inner voice. Ridicule, Minimize, and Justify are messengers of DENIAL — they silence your intuition." },
  { id:5,  topic:"APS",             question:"The three parts of the Attack Progression Scale are:", options:["Mental Physical Emotional","Verbal Intimidation Physical","Shouting Pushing Fighting","Testing Warning Attacking"], correctAnswer:1, explanation:"The APS has three levels: Verbal (hands off, irritating), Intimidation (hands off, dangerous), and Physical (hands on, life-threatening)." },
  { id:6,  topic:"Red Flags",       question:"What does it mean when an attacker ignores your No?", options:["He is being polite","It is a red flag — he will probably not hear it later either","He is shy and nervous","He simply did not hear you"], correctAnswer:1, explanation:"Ignoring No is a major RED FLAG in the Perpetrator's Progression Pattern. If he cannot hear No now, he will not hear it later." },
  { id:7,  topic:"Five Fingers",    question:"The Five Fingers of Emergency Self-Defense are:", options:["Scream Run Hide Fight Call","Think Yell Run Fight Tell","Aware Bold Loud Fight Escape","Look Listen Smell Touch Taste"], correctAnswer:1, explanation:"The Five Fingers are Think, Yell, Run, Fight, Tell. Each represents a step in the emergency self-defense strategy." },
  { id:8,  topic:"Consent",         question:"Consent is defined as:", options:["Doing what you are told","Not saying no","An agreement between people","Wearing certain clothes"], correctAnswer:2, explanation:"Consent is an agreement between people. Consent is HEARING THE WORD YES. It is NOT the absence of hearing No." },
  { id:9,  topic:"Gender",          question:"What is the difference between sex and gender?", options:["They mean exactly the same thing","Sex is biological and gender is social and cultural","Gender is biological and sex is social","Both are chosen by individuals"], correctAnswer:1, explanation:"Sex refers to biological differences — universal and unchanging. Gender refers to social differences — constructed by society and changeable." },
  { id:10, topic:"Physical Skills", question:"What should you do if you are grabbed by an attacker?", options:["Freeze and wait for help","Panic and scream","Ask the attacker why","Use What is Free and What is Open to strike vulnerable targets and get away"], correctAnswer:3, explanation:"Use 'What is Free, What is Open' — identify what body parts are free and which vulnerable targets on the attacker are open. Strike and escape." },
  { id:11, topic:"Self-Defense",    question:"What are the FOUR PRIMARY TARGETS on an attacker's body?", options:["Stomach, Back, Arms, Legs","Eyes, Throat, Groins, Knee","Ears, Nose, Chest, Feet","Head, Shoulders, Hips, Ankles"], correctAnswer:1, explanation:"The four primary targets are Eyes, Throat, Groins, and Knee — they are soft, easy to strike, and disable the attacker quickly." },
  { id:12, topic:"SMEVB",           question:"What does the V stand for in S.M.E.V.B?", options:["Victory","Vigilance","Voice","Violence"], correctAnswer:2, explanation:"V stands for Voice — up to 85% of Empowerment Training is using our voices effectively. Yell No, call for help, negotiate, distract." },
  { id:13, topic:"Assertiveness",   question:"Which response to conflict does GESD recommend?", options:["Aggressive — bullying to get your way","Assertive — direct, clear, with eye contact and upright posture","Passive — doing things you don't want because you cannot say No","Silent — avoiding all confrontation"], correctAnswer:1, explanation:"GESD recommends the assertive response: being direct, stating clearly what you want, using eye contact and upright posture. Not aggressive, not passive." },
  { id:14, topic:"Boundaries",      question:"What are boundaries?", options:["Physical walls that keep you safe","Rules we set for how we want others to speak and act towards us","Suggestions we make to others","Permission slips for activities"], correctAnswer:1, explanation:"Boundaries are rules we set for how we want others to speak and act towards us. We train people how to treat us from the moment we meet." },
  { id:15, topic:"PPP",             question:"At which stage of the Perpetrator's Progression Pattern is a victim most at risk?", options:["Stage 1 — Victim Identification","Stage 2 — Victim Selection","Stage 3 — Attack Process","All stages are equally dangerous"], correctAnswer:2, explanation:"Stage 3 — Attack Process — is the most dangerous. The attacker uses threats to position you. Any place he moves you to will be BETTER FOR HIM and WORSE FOR YOU." },
  { id:16, topic:"Breaking Silence", question:"Which of the following is an important point about Breaking the Silence?", options:["The attack is always your fault","You must speak up publicly","The attack or abuse is NOT your fault","You should keep the secret forever"], correctAnswer:2, explanation:"The attack or abuse is NOT your fault. You should tell, even if the attacker told you not to. Tell until someone believes you and helps you get the support you need." },
  { id:17, topic:"Child Rights",    question:"A child is defined as:", options:["Anyone under 16 years","Anyone under 18 years","Anyone under 21 years","Anyone in primary school"], correctAnswer:1, explanation:"A child is every human being below the age of eighteen years, consistent with the UN Convention on the Rights of the Child." },
  { id:18, topic:"Awareness",       question:"Which of the following describes an UNAWARE person?", options:["Someone who makes eye contact","Someone walking confidently","Someone listening to music with headphones","Someone standing tall with shoulders back"], correctAnswer:2, explanation:"Someone listening to music with headphones is an example of an unaware person — they cannot perceive their surroundings, making them an easier target." },
  { id:19, topic:"Menstruation",    question:"What is the average menstrual cycle length?", options:["14 days","28 days","45 days","7 days"], correctAnswer:1, explanation:"The average menstrual cycle is every 28 days. Cycles from 21 to 35 days are also considered normal." },
  { id:20, topic:"Referral",        question:"The Malawi GBV Crisis Line number is:", options:["116","999","5600 / 6600","0800"], correctAnswer:2, explanation:"5600 / 6600 is the GBV Crisis Line in Malawi. 116 is the Tithandizane Child Help Line. Both are important helpline numbers." },
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

export const CASE_REFERRALS_INIT: CaseReferral[] = [];

export const SASA_REPORTS_INIT: SasaMonthlyReport[] = [];