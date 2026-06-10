import React from 'react';
import { Shield, Network, Compass } from 'lucide-react';
import { Kicker, Card } from './SubComponents';

export const ETTPage: React.FC = () => (
  <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
    <div>
      <Kicker text="Standard Operating Procedures" />
      <h1 className="text-base font-bold text-black dark:text-white m-0">ETT Standards</h1>
      <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">Governance parameters mapping safety, code of conduct, and reporting timelines.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { icon: <Shield className="text-orange-500" size={24} />, title: "Prevent Violence", text: "Provide aged-appropriate safety toolkits explicitly targeted to mitigate school violence." },
        { icon: <Network className="text-orange-500" size={24} />, title: "Linkage pathways", text: "Construct trusted adult and health pathway loops immediately on GBV disclosure." },
        { icon: <Compass className="text-orange-500" size={24} />, title: "Cluster Delivery", text: "Consolidate resources under local cluster hubs to ensure rural learners receive instruction." }
      ].map((item) => (
        <Card key={item.title} className="p-5 space-y-2">
          <div className="h-9 flex items-center">{item.icon}</div>
          <h4 className="text-xs sm:text-sm font-bold text-black dark:text-white m-0">{item.title}</h4>
          <p className="text-[11.5px] leading-relaxed text-black dark:text-white opacity-80 m-0">{item.text}</p>
        </Card>
      ))}
    </div>

    <Card className="p-6">
      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-4">6-Step Classroom Protocols</h3>
      <div className="space-y-3">
        {[
          ["1", "Community engagement", "Sensitize guardians and headmasters regarding empowerment transformations before launching ETT groups."],
          ["2", "Interactive lesson schedules", "Incorporate GESD and HIM classes during school safety times in separate, secure environments."],
          ["3", "Aged-targeted class models", "Adapt modules into 45-minute lesson layouts. Minimum 6 verified cycles per cohort."],
          ["4", "Immediate disclosure mapping", "Always review referral channels following the 'Breaking the Silence' modules."],
          ["5", "District authorities alignment", "Form safety partnerships with VSU Police and Child protection officers in the clusters."],
          ["6", "Field file logging", "Always export reports to the ETT Portal for District Coordinator verification."]
        ].map(([n, title, desc]) => (
          <div key={n} className="flex gap-4 p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="w-7 h-7 bg-orange-500 text-white rounded-full font-bold text-xs shrink-0 flex items-center justify-center">
              {n}
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-black dark:text-white mb-1">{title}</h4>
              <p className="text-[11.5px] leading-relaxed text-black dark:text-white opacity-80 m-0">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);
