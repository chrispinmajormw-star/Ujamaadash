import { CheckCircle2, AlertTriangle} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';
import { gbvCasesApi, sessionRecordsApi } from '../api';
import { districtsApi } from '../api';
import { useCountry, ALL_COUNTRIES } from '../context/CountryContext';

// Maps an IP geolocation ISO country code to our system's country names
const COUNTRY_CODE_MAP: Record<string, string> = {
  MW: 'Malawi',
  KE: 'Kenya',
  SO: 'Somaliland',
};
import { Btn, FInput, FSelect, FArea, Card, Kicker } from './SubComponents';

export interface SubmitReportProps {
  user: User | null;
  onSubmit: (r: any) => void;
  showToast: (msg: string) => void;
}

export const SubmitReport: React.FC<SubmitReportProps> = ({ user, onSubmit, showToast }) => {
  const { t } = useTranslation();
  const isPublic = !user;
  const isTOT = user?.role === 'tot';
  const [activeTab, setActiveTab] = useState<'case' | 'session'>('case');
  const [done, setDone] = useState(false);
  const { activeCountry } = useCountry();
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);

  // Determine which country's districts to show:
  // - a specific country selected -> use it directly
  // - "All Countries" selected -> detect the submitter's actual location via IP geolocation
  useEffect(() => {
    let cancelled = false;

    const loadDistrictsFor = (country: string) => {
      districtsApi.getAll(country).then((res: any) => {
        if (cancelled) return;
        setDistrictOptions(Array.isArray(res) ? res.map((d: any) => d.name).sort() : []);
      });
    };

    if (activeCountry && activeCountry !== ALL_COUNTRIES) {
      loadDistrictsFor(activeCountry);
    } else {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (cancelled) return;
          const code = data?.country_code as string | undefined;
          const detected = code ? COUNTRY_CODE_MAP[code] : undefined;
          if (detected) {
            loadDistrictsFor(detected);
          } else {
            setDistrictOptions([]);
          }
        })
        .catch(() => {
          if (!cancelled) setDistrictOptions([]);
        });
    }

    return () => { cancelled = true; };
  }, [activeCountry]);

  // GBV Case form
  const [caseForm, setCaseForm] = useState({
    full_name: '', contact_method: 'Phone', contact_details: '',
    gbv_type: 'Harassment or intimidation', incident_date: '',
    district: user?.district || '', village: '', description: '', witness_statement: '',
    reported_by_type: 'Community Member',
    survivor_safe: 'Not sure', survivor_age_group: '18+', survivor_gender: 'Prefer not to say',
    immediate_needs: [] as string[]
  });
  const toggleImmediateNeed = (need: string) => {
    setCaseForm(p => ({
      ...p,
      immediate_needs: p.immediate_needs.includes(need)
        ? p.immediate_needs.filter(n => n !== need)
        : [...p.immediate_needs, need],
    }));
  };

  // Session Record form (TOT only)
  const [sessionForm, setSessionForm] = useState({
    cluster_name: '', session_date: '', men: '', women: '', boys: '', girls: '',
    topics_covered: '', cases_referred: '', notes: ''
  });

  const sc = (k: string) => (e: any) => setCaseForm(p => ({ ...p, [k]: e.target.value }));
  const ss = (k: string) => (e: any) => setSessionForm(p => ({ ...p, [k]: e.target.value }));

  const submitCase = async () => {
    if (!caseForm.gbv_type || !caseForm.description) {
      showToast('GBV type and description are required', 'warning');
 return;
 }
 try {
 const data = await gbvCasesApi.submit({ ...caseForm, immediate_needs: caseForm.immediate_needs.join(', ') });
 if (data.error) { showToast(`${data.error}`, 'warning'); return; }
 setDone(true);
 showToast(t('submit_report.thank_you_caseworker'), 'success');
    } catch {
      showToast(t('submit_report.failed_to_submit_case', 'Failed to submit case'), 'warning');
    }
  };

  const submitSession = async () => {
    if (!sessionForm.session_date) { showToast('Session date is required', 'warning'); return; }
 try {
 const data = await sessionRecordsApi.submit({
 ...sessionForm,
 men: parseInt(sessionForm.men) || 0,
 women: parseInt(sessionForm.women) || 0,
 boys: parseInt(sessionForm.boys) || 0,
 girls: parseInt(sessionForm.girls) || 0,
 cases_referred: parseInt(sessionForm.cases_referred) || 0,
 });
 if (data.error) { showToast(`️ ${data.error}`, 'warning'); return; }
 setDone(true);
 showToast('Session record submitted', 'success');
    } catch {
      showToast('Failed to submit session record', 'warning');
 }
 };

 if (done) return (
 <div className="max-w-md mx-auto text-center py-10 space-y-4">
 <span className="text-5xl block flex justify-center"><CheckCircle2 size={48} className="text-emerald-500" /></span>
 <h2 className="text-xl font-bold text-black dark:text-white">{t('submit_report.submitted_successfully')}</h2>
 <p className="text-xs text-black dark:text-white opacity-80 leading-relaxed">
 {activeTab === 'case'
          ? isPublic ? t('submit_report.thank_you_caseworker') : t('submit_report.case_assigned_sasa')
          : "Session record saved successfully."}
      </p>
      <div className="flex gap-2 justify-center">
        <Btn onClick={() => { setDone(false); setCaseForm({ full_name: '', contact_method: 'Phone', contact_details: '', gbv_type: 'Harassment or intimidation', incident_date: '', district: user?.district || '', village: '', description: '', witness_statement: '', reported_by_type: 'Community Member', survivor_safe: 'Not sure', survivor_age_group: '18+', survivor_gender: 'Prefer not to say', immediate_needs: [] }); setSessionForm({ cluster_name: '', session_date: '', men: '', women: '', boys: '', girls: '', topics_covered: '', cases_referred: '', notes: '' }); }}>
          {t('submit_report.submit_another')}
        </Btn>
        <Btn variant="secondary" onClick={() => setDone(false)}>{t('submit_report.dismiss')}</Btn>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in-up">
      <div>
        <Kicker text={isPublic ? t('submit_report.case_submission_portal') : t('submit_report.reporting')} />
        <h1 className="text-base font-bold text-black dark:text-white m-0">
          {t('submit_report.submit_a_case')}
        </h1>
      </div>

      {/* GBV Case Form */}
      {(activeTab === 'case' || !isTOT) && (
        <Card>
          <p className="text-xs text-black/60 dark:text-white/60 mb-4">
            {t('submit_report.report_desc')}
            {isPublic && ` ${t('submit_report.identity_protected')}`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FInput label={t('submit_report.full_name_optional')} placeholder="Leave blank to stay anonymous" value={caseForm.full_name} onChange={sc('full_name')} />
            <FSelect label={t('submit_report.contact_method')} value={caseForm.contact_method} onChange={sc('contact_method')}>
              {['Phone', 'Email', 'WhatsApp', 'In-person', 'Other'].map(o => <option key={o}>{o}</option>)}
            </FSelect>
          </div>
          <FInput label={t('submit_report.contact_details_optional')} placeholder="e.g. +265 999 000 000 or email@example.com" value={caseForm.contact_details} onChange={sc('contact_details')} />
          <FSelect label={t('submit_report.who_submitting')} value={caseForm.reported_by_type} onChange={sc('reported_by_type')}>
            {['Parent/Guardian', 'Survivor', 'Teacher', 'Witness', 'Community Member', 'Other'].map(o => <option key={o}>{o}</option>)}
          </FSelect>

          <div className="pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{t('submit_report.safety_immediate_needs')}</div>
          <FSelect label={t('submit_report.survivor_currently_safe')} value={caseForm.survivor_safe} onChange={sc('survivor_safe')}>
            {['Yes', 'No', 'Not sure'].map(o => <option key={o}>{o}</option>)}
          </FSelect>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">{t('submit_report.survivor_immediate_assistance')}</label>
            <div className="grid grid-cols-2 gap-2">
              {['Medical care', 'Police', 'Social welfare', 'Psychosocial support', 'Not sure'].map(need => (
                <label key={need} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 p-2 rounded-lg border border-neutral-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={caseForm.immediate_needs.includes(need)}
                    onChange={() => toggleImmediateNeed(need)}
                    className="accent-[var(--brand)]"
                  />
                  {need}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{t('submit_report.survivor_details')}</div>
          <FSelect label={t('submit_report.survivor_age_group')} value={caseForm.survivor_age_group} onChange={sc('survivor_age_group')}>
            {['Under 5', '5–9', '10–14', '15–17', '18+'].map(o => <option key={o}>{o}</option>)}
          </FSelect>
          <FSelect label={t('submit_report.survivor_gender')} value={caseForm.survivor_gender} onChange={sc('survivor_gender')}>
            {['Male', 'Female', 'Prefer not to say'].map(o => <option key={o}>{o}</option>)}
          </FSelect>

          <FSelect label={t('submit_report.type_of_gbv')} value={caseForm.gbv_type} onChange={sc('gbv_type')}>
            {['Harassment or intimidation', 'Sexual assault concern', 'Child abuse / defilement', 'Transactional coercion', 'Threats or stalking', 'Forced relationship', 'Protection referral need', 'Other SGBV concern'].map(o => <option key={o}>{o}</option>)}
          </FSelect>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FInput label={t('submit_report.date_of_incident')} type="date" value={caseForm.incident_date} onChange={sc('incident_date')} />
            <FSelect label={t('submit_report.district_label')} value={caseForm.district} onChange={sc('district')}>
              <option value="">{t('submit_report.select_district')}</option>
              {districtOptions.map(d => <option key={d}>{d}</option>)}
            </FSelect>
          </div>
          <FInput label={t('submit_report.village_area')} placeholder="e.g. Kawale, Area 25" value={caseForm.village} onChange={sc('village')} />
          <FArea label={t('submit_report.description_of_incident')} placeholder="Provide details safely. Do not include names if at risk." value={caseForm.description} onChange={sc('description')} rows={4} />
          <FArea label={t('submit_report.additional_information')} placeholder="Any additional witness information or observations..." value={caseForm.witness_statement} onChange={sc('witness_statement')} rows={2} />
          <div className="flex gap-2 justify-end pt-3">
            <Btn variant="secondary" onClick={() => setCaseForm({ full_name: '', contact_method: 'Phone', contact_details: '', gbv_type: 'Harassment or intimidation', incident_date: '', district: user?.district || '', village: '', description: '', witness_statement: '', reported_by_type: 'Community Member', survivor_safe: 'Not sure', survivor_age_group: '18+', survivor_gender: 'Prefer not to say', immediate_needs: [] })}>Reset</Btn>
            <Btn onClick={submitCase}>Submit Case</Btn>
          </div>
        </Card>
      )}

      {/* Session Record Form — TOT only */}
    </div>
  );
};
