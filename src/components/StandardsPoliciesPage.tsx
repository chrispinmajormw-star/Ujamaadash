import React, { useState } from 'react';
import {
  Shield, FileText, ChevronRight, ChevronDown, ExternalLink,
  Users, AlertTriangle, Heart, Lock, Eye, BookOpen, Layers,
  CheckCircle, Info, Download, X
} from 'lucide-react';
import { Card, Kicker, Btn } from './SubComponents';

interface PolicySection {
  heading: string;
  content: string;
}

interface Policy {
  id: string;
  title: string;
  subtitle: string;
  revised: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  badge: string;
  summary: string;
  sections: PolicySection[];
}

const POLICIES: Policy[] = [
  {
    id: 'child_protection',
    title: 'Child Protection Policy',
    subtitle: 'Child Protection Policy and Procedures',
    revised: 'April 2019 (Review)',
    icon: <Shield size={20} />,
    color: '#dc2626',
    bg: '#fee2e2',
    badge: 'Mandatory',
    summary: 'Ujamaa Pamodzi has a moral and legal obligation to ensure children are provided with the highest standard of care. Everyone is entitled to participate in a safe and enjoyable environment free from harm and abuse.',
    sections: [
      {
        heading: '1. Policy Statement',
        content: `• The welfare of the child is paramount.\n• All children, whatever their age, culture, ability, gender, language, or racial origin, should be able to participate in a fun and safe environment.\n• All reasonable steps will be taken to protect children from harm, discrimination, and degrading treatment.\n• All suspicions and allegations of poor practice or abuse will be taken seriously and responded to swiftly.\n• Employees who work with children will be recruited with regard to their suitability and provided with guidance and training.\n• Working in partnership with parents and children is essential for protection.`
      },
      {
        heading: '2. Good Practice',
        content: `All personnel must:\n• Always work in an open environment — avoid private or unobserved situations.\n• Treat all young people equally, with respect and dignity.\n• Always put the welfare of the young person first.\n• Avoid unnecessary physical contact with young people.\n• Involve parents/carers wherever possible; avoid being alone with a child.\n• Be an excellent role model — no smoking or drinking alcohol in the company of young people.\n• Keep a written record of any injury that occurs, along with details of any treatment given.`
      },
      {
        heading: '3. Poor Practice — Must Be Avoided',
        content: `• Spending excessive time alone with young people away from others.\n• Taking young people alone in a car on journeys, however short.\n• Taking young people to your home where they will be alone with you.\n• Sharing a room with a young person.\n• Sexual activities with children under the age of 18.\n• Rough and physical contact with minors — any form of beating or corporal punishment.\n• Exchange of money, employment, goods, or services for sex.\n• Making sexually suggestive comments to a young person.\n• Allowing allegations made by a young person to go unchallenged or unrecorded.`
      },
      {
        heading: '4. Types of Abuse',
        content: `Physical Abuse: Hitting, shaking, throwing, poisoning, burning, biting, scalding, suffocating, drowning. Also includes training that disregards the capacity of the child's body.\n\nEmotional Abuse: Persistent emotional ill treatment — telling a young person they are useless, unloved, or inadequate; constant criticism; name calling and bullying.\n\nNeglect: Failing to meet the young person's basic physical and/or psychological needs — inadequate food, shelter, clothing, or medical care.\n\nSexual Abuse: Adults using children to meet their own sexual needs, including full sexual intercourse, masturbation, oral sex, fondling, or showing pornography.`
      },
      {
        heading: '5. Responding to Allegations',
        content: `If a young person discloses abuse:\n• Stay calm so as not to frighten them.\n• Reassure the child they are not to blame and it was right to tell.\n• Listen, showing you are taking them seriously.\n• Keep questions to a minimum — do not lead the child.\n• Inform the child you must share this with others to help stop the abuse.\n• Record all information immediately.\n• Report the incident to the supervisor or line manager.\n• If urgent medical attention is needed, call an ambulance.`
      },
      {
        heading: '6. Reporting Procedure',
        content: `It is mandatory for all employees to report all suspicions and allegations immediately to:\n• The child protection officer or line manager.\n• If unavailable: HR officer, local social services, or police.\n\nThree types of investigation may follow:\n• Criminal — police immediately involved.\n• Child Protection — social services (and possibly police) involved.\n• Disciplinary/misconduct — Ujamaa Pamodzi involved.\n\nConfidentiality: Information handled on a need-to-know basis only. All information stored securely with limited access.`
      },
      {
        heading: '7. Recruiting Personnel',
        content: `• All staff and volunteers must complete an application form with self-disclosure of criminal records.\n• Two confidential references required, including one regarding previous work with children.\n• Evidence of identity (passport or driving license with photo) required.\n• All employees and volunteers undergo formal induction and must sign the Code of Conduct.\n• Child protection training is mandatory and refresher trainings are required regularly.`
      }
    ]
  },
  {
    id: 'psea',
    title: 'PSEA Policy',
    subtitle: 'Protection from Sexual Exploitation and Abuse',
    revised: 'February 2022',
    icon: <Lock size={20} />,
    color: '#7c3aed',
    bg: '#ede9fe',
    badge: 'Zero Tolerance',
    summary: 'Ujamaa Pamodzi Africa has zero tolerance for sexual exploitation and abuse. All staff, associates, contractors and volunteers are expected to uphold the highest standards of personal and professional conduct at all times.',
    sections: [
      {
        heading: '1. Definitions',
        content: `Sexual Exploitation: Any actual or attempted abuse of a position of vulnerability, differential power, or trust for sexual purposes — including transactional sex, solicitation, or exploitative relationships.\n\nSexual Abuse: The actual or threatened physical intrusion of a sexual nature, whether by force or under unequal or coercive conditions. Includes rape, sexual assault, and all sexual activity with a minor.\n\nChild: Any individual under the age of 18, irrespective of local country definitions.`
      },
      {
        heading: '2. Scope',
        content: `Applies to all Ujamaa staff members, sub-contractors, consultants, interns, volunteers, community-based workers, suppliers, sub-grantees, and anyone working with or representing the organisation. The PSEA policy functions at all times — on and off duty, at places of work and in personal space, including when out of the country.`
      },
      {
        heading: '3. Prohibited Behaviours',
        content: `1. Sexual activity with children (under 18) — mistaken belief of age is NOT a defence.\n2. Child marriage — facilitating or officiating a marriage where one party is under 18.\n3. Sexual activity with beneficiaries — prohibited due to inherently unequal power imbalances.\n4. Grooming and/or coercion of any person for the purposes of obtaining sex.\n5. Threatening or taking adverse actions against clients if sexual favours are not granted.\n6. Buying sex or any form of transactional sexual exploitation.\n7. Any acts of sexual violence — intercourse, sexual touching, or threats of sexual violence.`
      },
      {
        heading: '4. UPA Obligations',
        content: `Ujamaa commits to:\n• Creating a safe culture for both those it serves and those who work for it.\n• Following through on any complaints and concerns in a timely manner.\n• Ensuring zero tolerance towards sexual exploitation and abuse.\n• Building a culture of dignity, honour and respect.\n• Educating all staff that SEA constitutes gross misconduct and grounds for termination.\n• Providing clear guidance on how to report complaints and the investigation procedure.`
      },
      {
        heading: '5. Reporting Procedures',
        content: `Reports must be made within 24 hours. Reports may be made:\n• In person, verbally or in writing — including anonymously.\n• To the safeguarding focal point.\n• Email: safeguarding.ujamaapamodzi@gmail.com or safeguarding@ujamaa-pamodzi.org\n• WhatsApp/Call: +265 995 513 607\n• Via dedicated ballot boxes at all trainings, meetings and offices.\n\nThe safeguarding focal point will acknowledge receipt within 48 hours and advise on next steps.`
      },
      {
        heading: '6. Survivor-Centred Approach',
        content: `Survivors are entitled to assistance regardless of whether a formal report is made and regardless of investigation outcome. Support includes:\n• Right to safety — Ujamaa will protect victims from further victimisation.\n• Right to confidentiality — information shared only on a need-to-know basis with informed consent.\n• Right to dignity and self-determination — no referral against the survivor's wishes.\n• Non-discrimination — assistance without bias on any grounds.\n\nFor child survivors: Child-friendly approach applied; parents/caregivers involved appropriately; mandatory reporting to government officials per the Child Care and Protection Act (2014).`
      },
      {
        heading: '7. Investigation Process',
        content: `• External trained investigators work with the Safeguarding Committee.\n• Subject of allegation is formally notified and placed on administrative leave.\n• Investigation involves site visits, document review, survivor interview, witness interviews, and evidence collection.\n• A full report submitted to the Safeguarding Committee within 120 days.\n• Findings determined on balance of probabilities.\n• Disciplinary action, termination, and/or referral to law enforcement as warranted.\n\nRetaliation against complainants, victims, or witnesses will itself result in disciplinary action.`
      }
    ]
  },
  {
    id: 'gender',
    title: 'Gender Policy',
    subtitle: 'Gender Equality and Women\'s Empowerment',
    revised: 'Current',
    icon: <Heart size={20} />,
    color: '#db2777',
    bg: '#fce7f3',
    badge: 'Core Policy',
    summary: 'Ujamaa Pamodzi recognizes that gender relations and inequalities are fundamental causes of poverty. The organisation is fully committed to channeling resources into processes that create a society that values women, men, girls and boys equally.',
    sections: [
      {
        heading: '1. Purpose & Principles',
        content: `The policy ensures greater consistency of gender principles, policies and practices across the organisation.\n\nCore principles:\n• Gender equality and equity are central to Ujamaa's being and doing.\n• The empowerment of women and girls is fundamental to our mission.\n• Every individual demonstrates attitudes and behaviours that promote gender equality.\n• Adequate resources are allocated to gender work.\n• All work is continuously monitored against gender indicators.\n• Gender equality is both everyone's responsibility and an area that warrants specialised attention.`
      },
      {
        heading: '2. Programmes',
        content: `All programmes must empower women and promote women's rights as human rights.\n\nStrategies:\n• Apply gender analysis at all stages — planning, implementation, and impact assessment.\n• Develop capacity of programme staff to carry out gender analysis.\n• Ensure programme staff takes responsibility for promoting gender equality.\n• Promote structures and opportunities for women's participation in decision-making at all levels.\n• Engage men and boys as agents of change in the pursuit of gender equality.\n• Support women and girls to secure their economic, social, political, civil and cultural rights.`
      },
      {
        heading: '3. Organisational Development',
        content: `• Ensure specialised gender functions are in place and adequately resourced.\n• Build a common understanding around gender through induction and training.\n• Ensure all training across the agency is gender-sensitive.\n• Make all HR systems and policies gender-sensitive and responsive.\n• Integrate gender indicators into staff objectives and performance management systems.\n• Determine the nature and causes of gender imbalances in staff and set targets for recruitment and promotion of women in senior positions.\n• Implement sexual harassment policies and equal pay for equal work.`
      },
      {
        heading: '4. Public Image & Finance',
        content: `Public Image:\n• All materials and communications will reflect Ujamaa's goals on gender equality.\n• Gender-sensitive language and images used in all internal and external communications.\n• Women and girls' voices heard in the first person wherever possible.\n• Women and men proportionately represented during press briefings.\n\nFinance:\n• Commit a high level of support and resources to gender work.\n• Include a gender dimension in all finance guidelines and policies.\n• Develop tools for assessing and reporting on gender-related investments.\n\nAccountability: The board, ED and management are accountable for implementation. All staff will show a gender perspective in their work.`
      }
    ]
  },
  {
    id: 'whistleblower',
    title: 'Whistleblower Policy',
    subtitle: 'Reporting Responsibility and Protection',
    revised: 'January 2016',
    icon: <Eye size={20} />,
    color: '#0369a1',
    bg: '#e0f2fe',
    badge: 'Confidential',
    summary: 'Ujamaa Pamodzi Africa requires all directors, officers and employees to observe high standards of business and personal ethics. This policy enables employees to raise serious concerns internally without fear of retaliation.',
    sections: [
      {
        heading: '1. Reporting Responsibility',
        content: `It is the responsibility of all board members, officers, employees and volunteers to report concerns about:\n• Violations of Ujamaa Pamodzi Africa's code of ethics.\n• Suspected violations of law or regulations governing operations.\n• Suspected fraud, discrimination, or other unethical conduct.\n\nFirst, share concerns with your supervisor. If not comfortable or not satisfied with the response, escalate to the management committee, then the board.`
      },
      {
        heading: '2. No Retaliation',
        content: `It is contrary to the values of Ujamaa Pamodzi Africa for anyone to retaliate against any board member, officer, employee, or volunteer who in good faith reports:\n• An ethics violation.\n• A suspected violation of law.\n• A complaint of discrimination.\n• Suspected fraud.\n• Any suspected violation of regulations governing Ujamaa operations.\n\nAn employee who retaliates against someone who has reported a violation in good faith is subject to discipline up to and including termination of employment.`
      },
      {
        heading: '3. Reporting Procedure',
        content: `Concerns may be submitted:\n• Verbally or in writing to your supervisor.\n• In writing directly to the Executive Director.\n• To the organisation's Compliance Officer.\n\nFor anonymous or sensitive reports:\nPhone: +265 993 130 111\nEmail: mkangadzula@ujamaa-africa.org\n\nSupervisors and managers must report suspected ethical and legal violations in writing to the Compliance Officer, who will investigate all reported complaints.`
      },
      {
        heading: '4. Compliance Officer Responsibilities',
        content: `The Compliance Officer is responsible for:\n• Ensuring all complaints about unethical or illegal conduct are investigated and resolved.\n• Advising the Executive Director and/or Board of Directors of all complaints and their resolution.\n• Reporting at least annually to the Audit Committee on compliance activity.\n• Immediately notifying the Audit Committee of any concerns regarding corporate accounting practices, internal controls, or auditing.\n\nAll reports will be promptly investigated and appropriate corrective action taken where warranted.`
      },
      {
        heading: '5. Acting in Good Faith & Confidentiality',
        content: `Good Faith: Anyone filing a complaint must be acting in good faith with reasonable grounds for believing the information indicates a violation. Allegations made maliciously or known to be false are a serious disciplinary offence.\n\nConfidentiality: Violations or suspected violations may be submitted confidentially. Reports will be kept confidential to the extent possible, consistent with the need to conduct an adequate investigation.\n\nAll reported violations will be acknowledged and the reporting person kept informed of outcomes.`
      }
    ]
  },
  {
    id: 'fraud',
    title: 'Fraud Prevention Policy',
    subtitle: 'Fraud Prevention Policy and Procedures Manual',
    revised: 'January 2018',
    icon: <AlertTriangle size={20} />,
    color: '#b45309',
    bg: '#fef3c7',
    badge: 'Compliance',
    summary: 'Ujamaa is committed to creating a workplace culture that promotes fair and just ethical standards. Fraud is incompatible with this culture and presents a risk to the achievement of strategic objectives.',
    sections: [
      {
        heading: '1. What is Fraud?',
        content: `Fraud is dishonestly obtaining a benefit, or causing a loss, by deception or other means. The key element of fraud is dishonesty.\n\nFraud includes but is not limited to:\n• Asset misappropriation (cash): Theft of cash, theft of funds through electronic banking.\n• Asset misappropriation (non-cash): Unlawful use of plant/equipment/goods, theft of intellectual property, disclosing confidential information for personal gain.\n• Fraudulent disbursements: Falsifying expense claims, corporate credit card misuse, false invoicing, payroll falsification, forgery or alteration of documents.\n• Corruption: Overcharging, secret commissions/kickbacks, acceptance of goods as inducement, collusive bidding.\n• Fraudulent statements: False accounting, misleading employment history, providing false information.`
      },
      {
        heading: '2. How Do We Prevent Fraud?',
        content: `Key fraud prevention controls:\n• Upholding the standards of behaviour in Ujamaa's Code of Conduct.\n• Compliance with the law and all Ujamaa policies and procedures.\n• Risk management process following ISO 31000 principles — identifying and evaluating fraud threats.\n• Regular Fraud Vulnerability Survey across the organisation.\n• Annual review of the Fraud Control Plan.\n• Managers and supervisors employ sound fraud risk management practices:\n  – Adequate separation of duties (more than one person involved in key tasks).\n  – Proper authorization procedures (transactions must be reviewed and approved).\n  – Physical security of attractive items.\n  – Independent monitoring and checking of data and documentation.`
      },
      {
        heading: '3. How is Fraud Detected?',
        content: `Key fraud detection controls:\n• Appropriate approval and authorization processes.\n• Independent reconciliations.\n• Physical checks and stock-takes.\n• Analysis of management accounting reports.\n\nInternal Audit regularly performs:\n• Forensic data analysis.\n• Unannounced audits.\n• A rolling programme of audits focusing on fraud prevention and detection controls.\n• Annual audit of Ujamaa's Fraud Control Plan.\n• Regular Fraud Vulnerability Surveys.`
      },
      {
        heading: '4. Reporting Suspected Fraud',
        content: `If you see or suspect any fraudulent activity, report it immediately to:\n• Your Manager; OR\n• The Human Resource Manager.\n\nFor anonymous reporting or where the above is not appropriate:\nPhone: +265 984 110 288\nEmail: mkangadzula@ujamaa-africa.org\n\nBreaches: We take any failure to comply with this Policy very seriously. Consequences may include termination of employment or contract and prosecution.\n\nWhere a serious allegation could result in reprisals, the recipient must treat the disclosure confidentially and immediately escalate to the Board Secretary/Executive Director.`
      },
      {
        heading: '5. Responsibilities',
        content: `All directors, staff, volunteers and contractors must:\n• Perform duties with honesty, integrity and in an ethical manner.\n• Report suspected fraudulent activity immediately.\n• Comply with the Fraud Prevention Policy and Procedure.\n• Notify their line manager if they do not understand any part of this Policy.\n\nManagers and Supervisors must:\n• Promote sound fraud risk management practices.\n• Ensure effective operation of preventative and detection controls.\n• Make sure employees know about this Policy and ensure it is complied with.\n\nInternal Audit: Annual audit of Fraud Control Plan, forensic data analysis, unannounced audits, Fraud Vulnerability Survey every two years minimum.`
      }
    ]
  },
  {
    id: 'ett_standards',
    title: 'ETT Standards',
    subtitle: 'Standard Operating Procedures — ETT ScaleUp Program',
    revised: 'Current',
    icon: <Layers size={20} />,
    color: 'var(--brand)',
    bg: '#fff4ec',
    badge: 'Program',
    summary: 'Governance parameters mapping safety, code of conduct, and reporting timelines for the ETT ScaleUp Program.',
    sections: [
      {
        heading: '1. Prevent Violence',
        content: `Provide age-appropriate safety toolkits explicitly targeted to mitigate school violence. All ETT sessions must:\n• Operate within international principles including the UN Convention on the Rights of the Child (UNCRC, 1989).\n• Comply with Malawi national laws including the Child Care Protection and Justice Act.\n• Ensure comprehensive risk assessments are done before implementation.\n• Mainstream child protection throughout all activities.`
      },
      {
        heading: '2. Linkage Pathways',
        content: `Construct trusted adult and health pathway loops immediately on GBV disclosure:\n• Map referral channels in each cluster — VSU Police, Child Protection Officers, Social Welfare.\n• Ensure all TOTs know the 'Breaking the Silence' referral procedure.\n• Form safety partnerships with district authorities.\n• Always review referral channels following the 'Breaking the Silence' modules.`
      },
      {
        heading: '3. Cluster Delivery',
        content: `Consolidate resources under local cluster hubs to ensure rural learners receive instruction:\n• Sensitize guardians and headmasters before launching ETT groups.\n• Incorporate GESD and HIM classes during school safety times in separate, secure environments.\n• Adapt modules into 45-minute lesson layouts — minimum 6 verified cycles per cohort.\n• Always export reports to the ETT Portal for District Coordinator verification.`
      },
      {
        heading: '4. 6-Step Classroom Protocols',
        content: `Step 1 — Community engagement: Sensitize guardians and headmasters regarding empowerment transformations.\n\nStep 2 — Interactive lesson schedules: Incorporate GESD and HIM classes during school safety times.\n\nStep 3 — Aged-targeted class models: Adapt modules into 45-minute layouts. Minimum 6 verified cycles per cohort.\n\nStep 4 — Immediate disclosure mapping: Always review referral channels following 'Breaking the Silence' modules.\n\nStep 5 — District authorities alignment: Form safety partnerships with VSU Police and Child Protection Officers.\n\nStep 6 — Field file logging: Always export reports to the ETT Portal for District Coordinator verification.`
      }
    ]
  }
];

// ─── POLICY CARD ──────────────────────────────
const PolicyCard: React.FC<{
  policy: Policy;
  onOpen: (p: Policy) => void;
}> = ({ policy, onOpen }) => (
  <div
    onClick={() => onOpen(policy)}
    className="bg-white dark:bg-[#0f1623] rounded-xl border border-neutral-200 dark:border-slate-800 p-4 cursor-pointer hover:border-[var(--brand-400)] dark:hover:border-[var(--brand-600)] transition-all group"
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105" style={{ background: policy.bg, color: policy.color }}>
        {policy.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-black dark:text-white">{policy.title}</h3>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ color: policy.color, background: policy.bg }}>
            {policy.badge}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{policy.summary}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-slate-400">Revised: {policy.revised}</span>
          <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: policy.color }}>
            Read Policy <ChevronRight size={11} />
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ─── POLICY DETAIL MODAL ──────────────────────
const PolicyDetail: React.FC<{
  policy: Policy;
  onClose: () => void;
}> = ({ policy, onClose }) => {
  const [openSection, setOpenSection] = useState<string | null>(policy.sections[0]?.heading || null);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1623] rounded-2xl shadow-2xl my-4 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-slate-800" style={{ background: policy.bg }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'white', color: policy.color }}>
                {policy.icon}
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: policy.color }}>{policy.title}</h2>
                <p className="text-[11px] mt-0.5" style={{ color: policy.color, opacity: 0.8 }}>{policy.subtitle} · Revised: {policy.revised}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors shrink-0" style={{ color: policy.color }}>
              <X size={15} />
            </button>
          </div>
          <p className="text-[11.5px] mt-3 leading-relaxed" style={{ color: policy.color, opacity: 0.9 }}>{policy.summary}</p>
        </div>

        {/* Sections */}
        <div className="p-4 space-y-2 max-h-[65vh] overflow-y-auto">
          {policy.sections.map(section => (
            <div key={section.heading} className="rounded-xl border border-neutral-200 dark:border-slate-800 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setOpenSection(openSection === section.heading ? null : section.heading)}
              >
                <span className="text-xs font-bold text-black dark:text-white">{section.heading}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${openSection === section.heading ? 'rotate-180' : ''}`} />
              </button>
              {openSection === section.heading && (
                <div className="px-4 pb-4 pt-1 border-t border-neutral-100 dark:border-slate-800">
                  <div className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-slate-800 flex justify-end">
          <Btn variant="secondary" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────
export const StandardsPoliciesPage: React.FC = () => {
  const [openPolicy, setOpenPolicy] = useState<Policy | null>(null);
  const [filter, setFilter] = useState<'all' | 'safeguarding' | 'governance' | 'program'>('all');

  const categories = {
    safeguarding: ['child_protection', 'psea', 'gender'],
    governance: ['whistleblower', 'fraud'],
    program: ['ett_standards'],
  };

  const visible = POLICIES.filter(p => {
    if (filter === 'all') return true;
    return categories[filter]?.includes(p.id);
  });

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div>
        <Kicker text="Governance & Compliance" />
        <h1 className="text-base font-bold text-black dark:text-white m-0">Standards & Policies</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">
          Ujamaa Pamodzi Africa's official policies, procedures and ETT programme standards. All staff must read and comply.
 </p>
 </div>

 {/* Staff-only notice */}
 <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3">
 <Lock size={15} className="text-amber-600 shrink-0 mt-0.5"/>
 <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed m-0">
 <span className="font-bold">Staff Restricted.</span> This page is only accessible to authenticated staff members. All policies are confidential to Ujamaa Pamodzi Africa personnel.
 </p>
 </div>

 {/* Contact card */}
 <Card className="bg-slate-50/50 dark:bg-slate-800/30">
 <h3 className="text-xs font-bold text-black dark:text-white mb-2"> Safeguarding Contacts</h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
 <div>
 <div className="text-slate-500 mb-0.5">Safeguarding Email</div>
 <div className="font-semibold text-black dark:text-white">safeguarding@ujamaa-pamodzi.org</div>
 </div>
 <div>
 <div className="text-slate-500 mb-0.5">Whistleblowing Hotline</div>
 <div className="font-semibold text-black dark:text-white">+265 984 110 288</div>
 </div>
 <div>
 <div className="text-slate-500 mb-0.5">Executive Director</div>
 <div className="font-semibold text-black dark:text-white">mkangadzula@ujamaa-africa.org</div>
 </div>
 </div>
 </Card>

 {/* Filter tabs */}
 <div className="flex flex-wrap gap-2">
 {[
 { v: 'all', l: 'All Policies' },
          { v: 'safeguarding', l: 'Safeguarding' },
          { v: 'governance', l: 'Governance' },
          { v: 'program', l: 'Programme' },
        ].map(tab => (
          <button
            key={tab.v}
            onClick={() => setFilter(tab.v as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === tab.v
                ? 'bg-[var(--brand-600)] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-50)] dark:hover:bg-slate-700'
            }`}
          >
            {tab.l}
          </button>
        ))}
      </div>

      {/* Policy grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visible.map(policy => (
          <PolicyCard key={policy.id} policy={policy} onOpen={setOpenPolicy} />
        ))}
      </div>

      {/* Summary compliance note */}
      <Card className="border-[var(--brand-200)] dark:border-[var(--brand-900)]/40 bg-[var(--brand-50)]/30 dark:bg-[var(--brand-950)]/10">
        <div className="flex items-start gap-3">
          <Info size={15} className="text-[var(--brand-600)] shrink-0 mt-0.5" />
          <div className="text-[11.5px] text-[var(--brand-800)] dark:text-[var(--brand-300)] leading-relaxed">
            <span className="font-bold">Compliance Declaration.</span> By being associated with Ujamaa Pamodzi Africa in any capacity — full time, contract, part time, volunteer, or internship — you acknowledge that you have read and agree to uphold all policies on this page. Non-compliance may result in disciplinary action up to and including termination and referral to law enforcement.
          </div>
        </div>
      </Card>

      {/* Policy detail modal */}
      {openPolicy && (
        <PolicyDetail policy={openPolicy} onClose={() => setOpenPolicy(null)} />
      )}
    </div>
  );
};
