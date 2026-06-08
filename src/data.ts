import { User, Report, Cluster, District, Session } from './types';

export const ROLE_CFG = {
  admin: { label: "National Admin", color: "#991b1b", bg: "#fee2e2", icon: "🛡️" },
  tot: { label: "Trainer of Trainers", color: "#c44d00", bg: "#fff4ec", icon: "🎓" },
  data_entry: { label: "Data Entry Officer", color: "#c44d00", bg: "#fff4ec", icon: "📝" },
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
  { num: "Topic 1", title: "Getting to Know You", dur: "60 min", desc: "Boys explore identity through the Adjective Game and open discussion. Builds confidence and group trust from within.", pledge: "I am a young man / I live my life / I have feelings / I care / I can cry / I am real / I am the new African Man!", objectives: ["Play the Adjective Game to build confidence", "Explore personal identity and role models", "Share views on gender openly"] },
  { num: "Topic 2", title: "My Value System", dur: "60 min", desc: "Personal vs. social values — honesty, respect, caring. How values guide behaviour and shape gender identity.", pledge: null, objectives: ["Define personal and social values", "Connect values to everyday decisions", "Explore how community shapes gender values"] },
  { num: "Topic 3", title: "Intro to H.I.M & Verbal Techniques", dur: "60 min", desc: "The Hero in Me framework (Care · Safety · Growth · Confidence). Assertive verbal communication to prevent conflict.", pledge: null, objectives: ["Understand the HIM framework", "Learn assertive non-violent communication", "Practice refusing peer pressure"] },
  { num: "Topic 4", title: "Hero in Me: Step-Up Strategies", dur: "60 min", desc: "Active bystandership. Focuses primarily on defining what Step-Up is and creating opportunities for students to practice key Step-Up techniques.", pledge: null, objectives: ["Define bystander effect", "Learn the 3 Ds: Direct, Distract, Delegate", "Build confidence to act as a positive leader"] },
  { num: "Topic 5", title: "Referrals & Break the Silence", dur: "60 min", desc: "Break silence on SGBV. Map referral pathways and trusted adults. Overcome stigma of speaking up.", pledge: null, objectives: ["Map trusted adults and referral points", "Understand when and how to report SGBV", "Overcome fear and stigma of speaking up"] },
  { num: "Topic 6", title: "Boys & Girls Combined Session", dur: "90 min", desc: "Joint graduation with GESD. Share learning, build mutual respect, sign school safety charter.", pledge: null, objectives: ["Foster mutual respect between boys and girls", "Reinforce HIM and GESD messages", "Plan joint action and sign school safety charter"] },
];

export const GESD_SESSIONS: Session[] = [
  { num: "Session 1", title: "Getting to Know You", dur: "60 min", desc: "For girls to understand their personality, strengths, weaknesses, thoughts and beliefs. Identity exploration.", pledge: "These are my private parts / No one should touch them / No one should see them / No one should play with them", objectives: ["Build group trust and safe space", "Explore personal identity and strengths", "Understand personality, thoughts and beliefs"] },
  { num: "Session 2", title: "Intro to GESD", dur: "60 min", desc: "GESD foundation: self-efficacy, self-empowerment, self-defence. The Attack Progression Scale (Verbal → Intimidation → Physical).", pledge: null, objectives: ["Understand the GESD framework", "Learn the Attack Progression Scale", "Know that our safety is our responsibility"] },
  { num: "Session 3", title: "Awareness", dur: "60 min", desc: "Prevent the Perpetrator Progression Pattern (PPP). Visible signs of awareness. Trust your inner voice.", pledge: "INTUITION / I can trust it — It is my Alarm / If I listen — it keeps me from all harm", objectives: ["Understand the PPP: Identification → Selection → Attack", "Recognise the 4 visible signs of awareness", "Trust your inner voice — it is your alarm"] },
  { num: "Session 4", title: "Verbal Techniques", dur: "60 min", desc: "Voice prevents 85% of conflicts. The 5 uses of voice and 5 Personal Weapons: Spirit, Mind, Eyes, Voice, Body (SMEVB).", pledge: null, objectives: ["Use voice as primary conflict prevention", "Learn the 5 uses of voice", "Know the 5 Personal Weapons (SMEVB)"] },
  { num: "Session 5", title: "Physical Techniques", dur: "60 min", desc: "Five Fingers of Emergency (Think·Yell·Run·Fight·Tell). Breaking the Silence — step out of secrecy to start healing.", pledge: "I am a girl, I believe in my capabilities / I have the right to education / I have the right to be treated with respect / I will not be silenced / I say No", objectives: ["Learn 5 FED tools: Think, Yell, Run, Fight, Tell", "Understand Breaking the Silence", "Know abuse is never your fault"] },
  { num: "Session 6", title: "Combined Class — Boys & Girls", dur: "90 min", desc: "Joint graduation with HIM. Celebrate learning, share pledges, sign safety charter.", pledge: null, objectives: ["Share key learnings with boys", "Build mutual respect and shared commitment", "Create a joint action plan"] },
];

export const SESSION_LISTS: Record<string, string[]> = {
  HIM: ["Topic 1: Getting to Know You", "Topic 2: My Value System", "Topic 3: Intro to H.I.M & Verbal Techniques", "Topic 4: Hero in Me: Step-Up Strategies", "Topic 5: Referrals & Break the Silence", "Topic 6: Boys & Girls Combined Session"],
  GESD: ["Session 1: Getting to Know You", "Session 2: Intro to GESD", "Session 3: Awareness", "Session 4: Verbal Techniques", "Session 5: Physical Techniques", "Session 6: Combined Class — Boys & Girls"],
  Combined: ["Topic 6 / Session 6: Boys & Girls Combined"],
};

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

import { QuizQuestion } from './types';

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
