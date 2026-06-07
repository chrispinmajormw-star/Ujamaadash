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
    num: "Topic 1", 
    title: "Getting to Know You", 
    dur: "60 min", 
    desc: "Boys explore identity through the Adjective Game and open discussion. Builds confidence and group trust from within.", 
    pledge: "I am a young man / I live my life / I have feelings / I care / I can cry / I am real / I am the new African Man!", 
    objectives: ["Play the Adjective Game to build confidence", "Explore personal identity and role models", "Share views on gender openly"],
    content: `In this session, boys will explore what it means to be a young man in today's world. Through the Adjective Game and group discussions, participants will develop confidence in expressing themselves and learn about their own identities.

Key Activities:
• The Adjective Game: Each boy chooses an adjective that starts with the same letter as his name
• Identity Discussion: Share personal heroes and role models
• Group Reflection: What does it mean to be a "real" man?`,
    activities: [
      "The Adjective Game (20 min)",
      "Personal Identity Sharing (20 min)",
      "Group Discussion on Gender Roles (20 min)"
    ],
    keyTakeaways: [
      "Every person has unique qualities and strengths",
      "Men can have feelings and express emotions",
      "Identity is shaped by personal values and role models"
    ]
  },
  { 
    num: "Topic 2", 
    title: "My Value System", 
    dur: "60 min", 
    desc: "Personal vs. social values — honesty, respect, caring. How values guide behaviour and shape gender identity.", 
    pledge: null, 
    objectives: ["Define personal and social values", "Connect values to everyday decisions", "Explore how community shapes gender values"],
    content: `Understanding values helps us make better decisions. In this session, boys will explore personal and social values, and how these values influence their behavior and choices.

Key Concepts:
• Personal Values: Your own beliefs about what's important (honesty, respect, courage)
• Social Values: Community and cultural values that shape behavior
• Values-Based Decision Making: Using values to guide choices`,
    activities: [
      "Values Identification Exercise (15 min)",
      "Personal vs Social Values Analysis (20 min)",
      "Case Study: Values-Based Decision Making (25 min)"
    ],
    keyTakeaways: [
      "Values guide our decisions and actions",
      "Personal and social values can sometimes conflict",
      "Understanding our values helps us live with integrity"
    ]
  },
  { 
    num: "Topic 3", 
    title: "Intro to H.I.M & Verbal Techniques", 
    dur: "60 min", 
    desc: "The Hero in Me framework (Care · Safety · Growth · Confidence). Assertive verbal communication to prevent conflict.", 
    pledge: null, 
    objectives: ["Understand the HIM framework", "Learn assertive non-violent communication", "Practice refusing peer pressure"],
    content: `The Hero In Me (HIM) framework helps boys develop the skills needed to be positive role models. This session introduces the four pillars and teaches assertive communication techniques.

The Four Pillars:
1. CARE: Showing respect and empathy to others
2. SAFETY: Creating safe spaces and protecting others
3. GROWTH: Personal development and learning
4. CONFIDENCE: Believing in yourself and your abilities

Verbal Techniques:
• The "I" statement: "I feel... when... I need..."
• Assertive refusal: Clear, firm, no excuses
• De-escalation: Calm tone, listening, finding common ground`,
    activities: [
      "The HIM Framework Introduction (15 min)",
      "Verbal Techniques Role Play (25 min)",
      "Peer Pressure Refusal Practice (20 min)"
    ],
    keyTakeaways: [
      "Care, Safety, Growth, and Confidence are the foundation of being a hero",
      "Assertive communication prevents conflicts",
      "You can refuse pressure and still be respected"
    ]
  },
  { 
    num: "Topic 4", 
    title: "Hero in Me: Step-Up Strategies", 
    dur: "60 min", 
    desc: "Active bystandership. Focuses primarily on defining what Step-Up is and creating opportunities for students to practice key Step-Up techniques.", 
    pledge: null, 
    objectives: ["Define bystander effect", "Learn the 3 Ds: Direct, Distract, Delegate", "Build confidence to act as a positive leader"],
    content: `Being a hero means standing up when you see injustice or harm. This session teaches the 3 Ds of stepping up to help others.

The Bystander Effect:
When others are present, people often don't help. We can overcome this by choosing to step up.

The 3 Ds of Step-Up:
1. DIRECT: Address the situation directly and safely
2. DISTRACT: Create a distraction to defuse the situation
3. DELEGATE: Get help from a trusted adult or authority figure

When to Use Each:
• Direct: When it's safe and you know the person
• Distract: When direct intervention might escalate
• Delegate: When the situation is serious or dangerous`,
    activities: [
      "Bystander Effect Discussion (15 min)",
      "The 3 Ds Explanation and Examples (15 min)",
      "Step-Up Scenarios Practice (30 min)"
    ],
    keyTakeaways: [
      "You have the power to step up and help",
      "There are multiple safe ways to intervene",
      "Being a hero takes courage but makes a real difference"
    ]
  },
  { 
    num: "Topic 5", 
    title: "Referrals & Break the Silence", 
    dur: "60 min", 
    desc: "Break silence on SGBV. Map referral pathways and trusted adults. Overcome stigma of speaking up.", 
    pledge: null, 
    objectives: ["Map trusted adults and referral points", "Understand when and how to report SGBV", "Overcome fear and stigma of speaking up"],
    content: `Speaking up about abuse or violence is the first step to healing. This session helps boys identify trusted adults and understand the resources available.

Trusted Adults:
• Teachers, school counselors, parents, community leaders, health workers
• These are people who listen, believe you, and take action

Referral Pathways:
• School: Talk to a teacher or counselor
• Community: Police station, health center, social welfare office
• National: Gender-based violence hotline, child protection services

Breaking the Silence:
• Abuse is never your fault
• Telling an adult is brave, not shameful
• Support is available and recovery is possible`,
    activities: [
      "Trusted Adults Mapping (15 min)",
      "Referral Pathways Exercise (20 min)",
      "Breaking the Silence Stories (25 min)"
    ],
    keyTakeaways: [
      "Trusted adults are available to help",
      "Speaking up is brave and necessary",
      "Support and resources exist in your community"
    ]
  },
  { 
    num: "Topic 6", 
    title: "Boys & Girls Combined Session", 
    dur: "90 min", 
    desc: "Joint graduation with GESD. Share learning, build mutual respect, sign school safety charter.", 
    pledge: null, 
    objectives: ["Foster mutual respect between boys and girls", "Reinforce HIM and GESD messages", "Plan joint action and sign school safety charter"],
    content: `This is the graduation session where boys and girls come together to celebrate their learning and commit to creating a safer school environment.

Session Components:
1. Sharing Session: Boys and girls share key learnings from their respective programs
2. Pledge Exchange: Recite pledges from both HIM and GESD
3. Mutual Respect Discussion: How boys and girls can support each other
4. Safety Charter: Develop and sign a school-wide safety charter
5. Celebration: Recognize growth and commitment

The Charter might include:
• Zero tolerance for violence and harassment
• Support for reporting abuse
• Respect for all students regardless of gender
• Creating a safe, inclusive school environment`,
    activities: [
      "Key Learnings Sharing (20 min)",
      "Pledge Exchange Ceremony (15 min)",
      "Mutual Respect Workshop (30 min)",
      "Safety Charter Development & Signing (25 min)"
    ],
    keyTakeaways: [
      "Boys and girls are partners in creating safe spaces",
      "Mutual respect strengthens communities",
      "Everyone has a role in preventing violence"
    ]
  },
];

export const GESD_SESSIONS: Session[] = [
  { 
    num: "Session 1", 
    title: "Getting to Know You", 
    dur: "60 min", 
    desc: "For girls to understand their personality, strengths, weaknesses, thoughts and beliefs. Identity exploration.", 
    pledge: "These are my private parts / No one should touch them / No one should see them / No one should play with them", 
    objectives: ["Build group trust and safe space", "Explore personal identity and strengths", "Understand personality, thoughts and beliefs"],
    content: `In this opening session, girls will explore who they are—their unique strengths, values, and identities. Building a safe group environment is essential for all learning that follows.

Key Topics:
• My Personality: What makes me unique?
• My Strengths: What am I good at?
• My Beliefs: What do I believe in?
• Group Safety: Creating a space where everyone feels respected

The Safe Space Agreement:
• Confidentiality: What's shared here stays here
• Respect: Listen without judgment
• Inclusion: Everyone's voice matters
• Support: We support each other`,
    activities: [
      "Personality Exploration Activity (15 min)",
      "Strengths Circle (15 min)",
      "Safe Space Agreement Co-Creation (20 min)",
      "Group Pledge Learning (10 min)"
    ],
    keyTakeaways: [
      "I am unique and valuable",
      "My body is my own and deserves respect",
      "We are a safe community together"
    ]
  },
  { 
    num: "Session 2", 
    title: "Intro to GESD", 
    dur: "60 min", 
    desc: "GESD foundation: self-efficacy, self-empowerment, self-defence. The Attack Progression Scale (Verbal → Intimidation → Physical).", 
    pledge: null, 
    objectives: ["Understand the GESD framework", "Learn the Attack Progression Scale", "Know that our safety is our responsibility"],
    content: `The Girls Empowerment and Safety Design (GESD) framework empowers girls to recognize risks and respond effectively. This session builds the foundation for all safety skills.

The Three Pillars of GESD:
1. SELF-EFFICACY: Believing in your ability to succeed
2. SELF-EMPOWERMENT: Taking control of your decisions and safety
3. SELF-DEFENCE: Having tools and skills to protect yourself

The Attack Progression Scale:
Most attacks follow a pattern that starts with warnings:
1. VERBAL: Name-calling, threats, insults
2. INTIMIDATION: Intimidating looks, blocking paths, getting close
3. PHYSICAL: Touching, pushing, hitting

Understanding the pattern helps you recognize and respond early.

Your Safety is Your Responsibility:
• You have the power to protect yourself
• You deserve to be safe
• There are tools and skills you can learn`,
    activities: [
      "GESD Framework Introduction (15 min)",
      "Attack Progression Scale Discussion (20 min)",
      "Recognizing Warning Signs Practice (15 min)",
      "Empowerment Affirmations (10 min)"
    ],
    keyTakeaways: [
      "I believe in my ability to stay safe",
      "I can recognize when an attack is progressing",
      "I have power in my own safety"
    ]
  },
  { 
    num: "Session 3", 
    title: "Awareness", 
    dur: "60 min", 
    desc: "Prevent the Perpetrator Progression Pattern (PPP). Visible signs of awareness. Trust your inner voice.", 
    pledge: "INTUITION / I can trust it — It is my Alarm / If I listen — it keeps me from all harm", 
    objectives: ["Understand the PPP: Identification → Selection → Attack", "Recognise the 4 visible signs of awareness", "Trust your inner voice — it is your alarm"],
    content: `Prevention starts with awareness. This session teaches girls to recognize dangers early and trust their instincts.

The Perpetrator Progression Pattern (PPP):
Predators follow a pattern that gives you time to recognize and escape:
1. IDENTIFICATION: The perpetrator identifies potential victims
2. SELECTION: They select a specific victim (appears vulnerable)
3. ATTACK: They take action

How to Break the Pattern:
At identification: Avoid looking vulnerable
At selection: Be aware and alert
At attack: Use verbal and physical techniques

The 4 Signs of Awareness:
1. ALERTNESS: Look around, know what's happening
2. CONFIDENCE: Move with purpose, stand tall
3. TRUST YOUR GUT: If something feels wrong, it probably is
4. BE PRESENT: Pay attention to your surroundings

Your Inner Voice is Your Alarm:
• Intuition is real and valuable
• When something feels wrong, listen
• It's better to be "rude" and leave than to be in danger`,
    activities: [
      "PPP Discussion and Role Play (20 min)",
      "Signs of Awareness Identification (15 min)",
      "Trust Your Gut Exercise (15 min)",
      "Awareness Pledge Learning (10 min)"
    ],
    keyTakeaways: [
      "I can recognize danger early",
      "My intuition is my best protection",
      "Awareness prevents most attacks"
    ]
  },
  { 
    num: "Session 4", 
    title: "Verbal Techniques", 
    dur: "60 min", 
    desc: "Voice prevents 85% of conflicts. The 5 uses of voice and 5 Personal Weapons: Spirit, Mind, Eyes, Voice, Body (SMEVB).", 
    pledge: null, 
    objectives: ["Use voice as primary conflict prevention", "Learn the 5 uses of voice", "Know the 5 Personal Weapons (SMEVB)"],
    content: `Your voice is your most powerful weapon. Most attacks can be stopped with assertive verbal techniques.

The 5 Uses of Voice:
1. ALERT: Warn others of danger
2. COMMAND: Direct someone to stop
3. NEGOTIATE: Reasoning and discussion
4. DISTRACT: Change the subject or situation
5. ESCALATE: Get help from others

Voice Techniques:
• Firm, loud, clear voice
• Short, direct statements
• No excuses or justifications
• Repeat if necessary

The 5 Personal Weapons (SMEVB):
1. SPIRIT: Your inner strength, courage, will to survive
2. MIND: Your intelligence, awareness, judgment
3. EYES: Your ability to see, observe, and make eye contact
4. VOICE: Your ability to communicate assertively
5. BODY: Your physical strength and skills

Most Important: SPIRIT
With spirit and determination, you can overcome almost anything.`,
    activities: [
      "5 Uses of Voice Practice (15 min)",
      "Voice Techniques Role Play (20 min)",
      "SMEVB Introduction (15 min)",
      "Assertiveness Practice Scenarios (10 min)"
    ],
    keyTakeaways: [
      "My voice can stop most attacks",
      "I am strong in spirit, mind, eyes, voice, and body",
      "Assertiveness is a strength, not rudeness"
    ]
  },
  { 
    num: "Session 5", 
    title: "Physical Techniques", 
    dur: "60 min", 
    desc: "Five Fingers of Emergency (Think·Yell·Run·Fight·Tell). Breaking the Silence — step out of secrecy to start healing.", 
    pledge: "I am a girl, I believe in my capabilities / I have the right to education / I have the right to be treated with respect / I will not be silenced / I say No", 
    objectives: ["Learn 5 FED tools: Think, Yell, Run, Fight, Tell", "Understand Breaking the Silence", "Know abuse is never your fault"],
    content: `Sometimes you need physical skills to protect yourself. The Five Fingers of Emergency (FED) gives you tools for any situation.

The Five Fingers of Emergency:
1. THINK: Use your mind to escape
   - Create a diversion
   - Find the safest way out
   - Don't freeze

2. YELL: Use your voice
   - Yell for help
   - Scream to get attention
   - Yelling can shock an attacker

3. RUN: Use your legs
   - Move quickly to safety
   - Go to a trusted place
   - Running is always an option

4. FIGHT: Use your body
   - Only if you cannot escape
   - Target vulnerable areas
   - Don't hold back

5. TELL: Use your voice again
   - Tell a trusted adult
   - Tell authorities
   - Breaking the silence starts healing

Breaking the Silence:
• Abuse is never your fault
• Keeping silence gives power to the abuser
• Speaking out is brave and healing
• Resources and support exist
• Recovery is possible`,
    activities: [
      "Five Fingers of Emergency Introduction (15 min)",
      "FED Decision-Making Scenarios (20 min)",
      "Breaking the Silence Discussion (15 min)",
      "Empowerment Pledge Learning (10 min)"
    ],
    keyTakeaways: [
      "I have physical tools to protect myself",
      "Thinking, yelling, running are my first options",
      "Speaking up breaks the cycle of abuse"
    ]
  },
  { 
    num: "Session 6", 
    title: "Combined Class — Boys & Girls", 
    dur: "90 min", 
    desc: "Joint graduation with HIM. Celebrate learning, share pledges, sign safety charter.", 
    pledge: null, 
    objectives: ["Share key learnings with boys", "Build mutual respect and shared commitment", "Create a joint action plan"],
    content: `This graduation session brings boys and girls together to celebrate their learning and commit to a safer school community.

Session Flow:
1. Welcome & Overview: Celebrate what everyone has learned
2. GESD Highlights: Girls share their key learnings
3. HIM Highlights: Boys share their key learnings
4. Pledge Exchange: Recite both HIM and GESD pledges
5. Mutual Respect Discussion: How boys and girls support each other
6. Safety Charter: Develop school-wide safety commitments
7. Celebration: Recognize growth and commitment

Creating a Safe School Community:
• Everyone plays a role in safety
• Boys can be allies in preventing violence
• Girls deserve respect and safety
• Speaking up protects everyone

The Safety Charter might include:
• Zero tolerance for violence and harassment
• Support for reporting abuse
• Respect for all students
• Training for all stakeholders
• Consequences for violations
• Support for survivors`,
    activities: [
      "Welcome and Celebration (10 min)",
      "Key Learnings Sharing by Both Groups (20 min)",
      "Pledge Exchange Ceremony (15 min)",
      "Mutual Respect and Allyship Workshop (25 min)",
      "Safety Charter Development & Signing (20 min)"
    ],
    keyTakeaways: [
      "Boys and girls are partners in creating safe schools",
      "Mutual respect strengthens our community",
      "Everyone has a role and responsibility in safety"
    ]
  },
];

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
