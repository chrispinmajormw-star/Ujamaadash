import React, { useRef, useState } from 'react';
import { Download, Share2, X, Loader2 } from 'lucide-react';

interface CertificateComponentProps {
  studentName: string;
  curriculum: 'him' | 'gesd';
  score: number;
  completedAt: string;
  grade: string;
  sex?: string;
  onClose: () => void;
}

export const CertificateComponent: React.FC<CertificateComponentProps> = ({
  studentName, curriculum, score, completedAt, grade, sex, onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const certId = useRef(Math.random().toString(36).substring(2, 11).toUpperCase());
  const [downloading, setDownloading] = useState(false);

  const isHIM          = curriculum === 'him';
  const accentColor    = isHIM ? '#185fa5' : '#a82563';
  const accentPale     = isHIM ? '#dbeafe' : '#fce7f3';
  const accentLight    = isHIM ? '#eff6ff' : '#fdf2f8';
  const curriculumFull = isHIM ? 'Hero In Me (HIM)' : 'Girls Empowerment Self Defense (GESD)';
  const curriculumSub  = isHIM ? "Boys' Empowerment Programme" : "Girls' Empowerment Programme";
  const dateStr        = new Date(completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Dynamically load jsPDF from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);
      await new Promise(resolve => { script.onload = resolve; });

      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = 297; const H = 210;

      // ── Background ──────────────────────────────────────────────────
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, W, H, 'F');

      // Soft corner decorations
      const c = isHIM ? [24, 95, 165] : [168, 37, 99];
      pdf.setFillColor(c[0], c[1], c[2]);
      pdf.circle(0, 0, 30, 'F');
      pdf.circle(W, 0, 30, 'F');
      pdf.circle(0, H, 30, 'F');
      pdf.circle(W, H, 30, 'F');

      // ── Outer border ────────────────────────────────────────────────
      pdf.setDrawColor(c[0], c[1], c[2]);
      pdf.setLineWidth(3);
      pdf.rect(10, 10, W - 20, H - 20);
      pdf.setLineWidth(1);
      pdf.setDrawColor(c[0], c[1], c[2]);
      pdf.rect(14, 14, W - 28, H - 28);

      // ── Load & embed Ujamaa logo ─────────────────────────────────────
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = '/africalogogo.svg';
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        const canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 200;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 200, 200);
        const logoData = canvas.toDataURL('image/png');
        pdf.addImage(logoData, 'PNG', W / 2 - 15, 18, 30, 30);
      } catch {
        // Logo failed to load — draw placeholder circle
        pdf.setFillColor(c[0], c[1], c[2]);
        pdf.circle(W / 2, 33, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('UA', W / 2, 36, { align: 'center' });
      }

      // ── Header text ─────────────────────────────────────────────────
      pdf.setTextColor(c[0], c[1], c[2]);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('UJAMAA AFRICA', W / 2, 53, { align: 'center' });

      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 30);
      pdf.text('Certificate of Completion', W / 2, 68, { align: 'center' });

      // Decorative line
      pdf.setDrawColor(c[0], c[1], c[2]);
      pdf.setLineWidth(1.5);
      pdf.line(W / 2 - 55, 73, W / 2 + 55, 73);

      // ── Body ─────────────────────────────────────────────────────────
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text('This certificate recognizes that', W / 2, 84, { align: 'center' });

      pdf.setFontSize(26);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(c[0], c[1], c[2]);
      pdf.text(studentName, W / 2, 98, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text('has successfully completed the', W / 2, 110, { align: 'center' });

      // Programme box
      const boxW = 120; const boxX = W / 2 - boxW / 2;
      pdf.setFillColor(isHIM ? 239 : 253, isHIM ? 246 : 242, isHIM ? 255 : 248);
      pdf.roundedRect(boxX, 115, boxW, 22, 4, 4, 'F');
      pdf.setDrawColor(c[0], c[1], c[2]);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(boxX, 115, boxW, 22, 4, 4, 'S');

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(c[0], c[1], c[2]);
      pdf.text(curriculumSub.toUpperCase(), W / 2, 122, { align: 'center' });
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(curriculumFull, W / 2, 131, { align: 'center' });

      // ── Details row ──────────────────────────────────────────────────
      const detailY = 152;
      const cols = [W * 0.25, W * 0.42, W * 0.60, W * 0.77];
      const labels = ['Score', 'Grade / Form', 'Date Completed', 'Certificate ID'];
      const values = [`${score}%`, grade, dateStr, certId.current];

      labels.forEach((label, i) => {
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(130, 130, 130);
        pdf.text(label.toUpperCase(), cols[i], detailY, { align: 'center' });
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(c[0], c[1], c[2]);
        pdf.text(values[i], cols[i], detailY + 8, { align: 'center' });
      });

      // ── Signature lines ───────────────────────────────────────────────
      const sigY = 176;
      [[W * 0.28, 'Programme Director'], [W * 0.72, 'Ujamaa Africa']].forEach(([x, label]) => {
        pdf.setDrawColor(c[0], c[1], c[2]);
        pdf.setLineWidth(0.5);
        pdf.line((x as number) - 28, sigY, (x as number) + 28, sigY);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(130, 130, 130);
        pdf.text(label as string, x as number, sigY + 5, { align: 'center' });
      });

      // ── Footer ────────────────────────────────────────────────────────
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(160, 160, 160);
      pdf.text('Empowering communities through education and safety · www.ujamaa-africa.org', W / 2, H - 16, { align: 'center' });

      pdf.save(`${studentName.replace(/\s+/g, '_')}-${curriculum.toUpperCase()}-Certificate.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate PDF. Please try again.');
    }
    setDownloading(false);
  };

  const handleShare = () => {
    const text = `I just completed the ${curriculumFull} programme by Ujamaa Africa and scored ${score}%! #UjamaaEducation #HeroInMe`;
    if (navigator.share) {
      navigator.share({ title: 'My Ujamaa Certificate', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Share message copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-[#0f1623] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-auto">

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          <X size={17} className="text-slate-600 dark:text-slate-400" />
        </button>

        {/* Certificate preview */}
        <div ref={certificateRef} className="p-8 bg-white">
          <div className="border-4 rounded-2xl p-8 relative overflow-hidden" style={{ borderColor: accentColor }}>
            {/* Corner blobs */}
            <div className="absolute top-0 left-0 w-20 h-20 rounded-br-full opacity-10" style={{ backgroundColor: accentColor }} />
            <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10" style={{ backgroundColor: accentColor }} />
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-tr-full opacity-10" style={{ backgroundColor: accentColor }} />
            <div className="absolute bottom-0 right-0 w-20 h-20 rounded-tl-full opacity-10" style={{ backgroundColor: accentColor }} />
            <div className="border rounded-xl p-8 space-y-5 bg-white relative" style={{ borderColor: accentColor + '50' }}>

              {/* Logo + org name */}
              <div className="flex flex-col items-center gap-2">
                <img src="/africalogogo.svg" alt="Ujamaa Africa" className="w-14 h-14 object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>Ujamaa Africa</span>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h1 className="text-3xl font-bold text-slate-900">Certificate of Completion</h1>
                <div className="w-24 h-0.5 mx-auto" style={{ backgroundColor: accentColor }} />
              </div>

              {/* Student name */}
              <div className="text-center space-y-2">
                <p className="text-slate-600 text-sm">This certificate recognizes that</p>
                <h2 className="text-4xl font-black" style={{ color: accentColor }}>{studentName}</h2>
                <p className="text-slate-600 text-sm">has successfully completed the</p>
              </div>

              {/* Course badge */}
              <div className="rounded-xl py-3 px-6 text-center" style={{ backgroundColor: accentPale }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: accentColor }}>{curriculumSub}</p>
                <p className="text-xl font-black" style={{ color: accentColor }}>{curriculumFull}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-4 gap-4 py-4 border-t border-b" style={{ borderColor: accentColor + '30' }}>
                {[
                  ['Score',          `${score}%`],
                  ['Grade / Form',   grade],
                  ['Date Completed', new Date(completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                  ['Certificate ID', certId.current],
                ].map(([label, value]) => (
                  <div key={label} className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                    <p className="text-sm font-bold" style={{ color: accentColor }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Signature lines */}
              <div className="grid grid-cols-2 gap-12 pt-2">
                {['Programme Director', 'Ujamaa Africa'].map(label => (
                  <div key={label} className="text-center">
                    <div className="border-b mb-1 h-6" style={{ borderColor: accentColor + '60' }} />
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{label}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <p className="text-center text-[9px] text-slate-400 italic">
                Empowering communities through education and safety · www.ujamaa-africa.org
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3 flex-wrap">
          <button onClick={handleDownloadPDF} disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition disabled:opacity-60"
            style={{ backgroundColor: accentColor }}>
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {downloading ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white transition hover:bg-slate-300 dark:hover:bg-slate-700">
            <Share2 size={15} /> Share Achievement
          </button>
          <button onClick={onClose}
            className="py-3 px-5 rounded-xl font-semibold text-sm bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
