import { User, Report, Cluster, District, Session, CaseReferral, SasaMonthlyReport } from './types';

export const ROLE_CFG = {
  admin: { label: "National Admin", color: "#991b1b", bg: "#fee2e2", icon: "🛡️" },
  tot: { label: "Trainer of Trainers", color: "#c44d00", bg: "#fff4ec", icon: "🎓" },
  data_entry: { label: "Data Entry Officer", color: "#c44d00", bg: "#fff4ec", icon: "📝" },
  district_coordinator: { label: "District Coordinator", color: "#065f46", bg: "#d1fae5", icon: "🏛️" },
  viewer: { label: "Viewer", color: "#1e40af", bg: "#dbeafe", icon: "👁️" },
  sasa_officer: { label: "SASA Officer", color: "#6d28d9", bg: "#ede9fe", icon: "🛡️" },
  manager: { label: "Program Manager", color: "#0e4a7a", bg: "#e0f2fe", icon: "📊" },
  admin_officer: { label: "Admin Officer", color: "#5b21b6", bg: "#f5f3ff", icon: "⚙️" },
  staff: { label: "Staff", color: "#374151", bg: "#f3f4f6", icon: "👤" },
  cartographer: { label: "Cartographer", color: "#0f766e", bg: "#ccfbf1", icon: "🗺️" },
};

export const CAN = {
  submitReport: ["admin", "tot", "data_entry", "district_coordinator", "staff"],
  approveReport: ["admin", "district_coordinator", "manager"],
  manageUsers: ["admin", "admin_officer"],
  exportData: ["admin", "district_coordinator", "manager"],
  viewSasa: ["admin", "sasa_officer", "manager", "district_coordinator"],
  editMaps: ["admin", "cartographer"],
  viewAnalytics: ["admin", "manager", "district_coordinator"],
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
  { id: "7", email: "manager@ujamaa.mw", password: "manager123", role: "manager", name: "Program Manager", district: null, avatar: "PM", status: "active" },
  { id: "8", email: "officer@ujamaa.mw", password: "officer123", role: "admin_officer", name: "Admin Officer", district: null, avatar: "AO", status: "active" },
  { id: "9", email: "staff@ujamaa.mw", password: "staff123", role: "staff", name: "Field Staff", district: "Mzimba", avatar: "FS", status: "active" },
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
