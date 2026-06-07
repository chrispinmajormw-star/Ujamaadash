import React, { useRef } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { Card } from './SubComponents';

interface CertificateComponentProps {
  studentName: string;
  curriculum: 'him' | 'gesd';
  score: number;
  completedAt: string;
  onClose: () => void;
}

export const CertificateComponent: React.FC<CertificateComponentProps> = ({
  studentName,
  curriculum,
  score,
  completedAt,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const curriculumTitle = curriculum === 'him' ? 'Hero In Me (HIM)' : 'Girls Empowerment & Safety Design (GESD)';
  const curriculumSubtitle = curriculum === 'him' 
    ? 'Boys Programme' 
    : 'Girls Programme';

  const handleDownload = () => {
    if (certificateRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions (A4 landscape: 297mm × 210mm = 1123px × 794px at 96dpi)
      canvas.width = 1200;
      canvas.height = 800;

      // White background
      ctx!.fillStyle = 'white';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx!.strokeStyle = '#185fa5';
      ctx!.lineWidth = 8;
      ctx!.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Inner border
      ctx!.strokeStyle = '#a82563';
      ctx!.lineWidth = 3;
      ctx!.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Title
      ctx!.fillStyle = '#0f1623';
      ctx!.font = 'bold 48px Arial';
      ctx!.textAlign = 'center';
      ctx!.fillText('Certificate of Completion', canvas.width / 2, 120);

      // Subtitle
      ctx!.fillStyle = '#64748b';
      ctx!.font = '20px Arial';
      ctx!.fillText('Ujamaa Dash Programme', canvas.width / 2, 170);

      // Recognition text
      ctx!.fillStyle = '#374151';
      ctx!.font = '16px Arial';
      ctx!.fillText('This certificate recognizes that', canvas.width / 2, 240);

      // Student name
      ctx!.fillStyle = '#185fa5';
      ctx!.font = 'bold 36px Arial';
      ctx!.fillText(studentName, canvas.width / 2, 310);

      // Achievement text
      ctx!.fillStyle = '#374151';
      ctx!.font = '16px Arial';
      ctx!.fillText(`has successfully completed the`, canvas.width / 2, 370);

      // Course name
      ctx!.fillStyle = '#a82563';
      ctx!.font = 'bold 24px Arial';
      ctx!.fillText(curriculumTitle, canvas.width / 2, 420);

      // Score and date
      ctx!.fillStyle = '#64748b';
      ctx!.font = '14px Arial';
      ctx!.textAlign = 'left';
      ctx!.fillText(`Score: ${score}%`, 100, 520);
      ctx!.textAlign = 'right';
      ctx!.fillText(`Date: ${new Date(completedAt).toLocaleDateString()}`, canvas.width - 100, 520);

      // Footer
      ctx!.fillStyle = '#94a3b8';
      ctx!.font = '12px Arial';
      ctx!.textAlign = 'center';
      ctx!.fillText('Empowering communities through education and safety', canvas.width / 2, canvas.height - 80);
      ctx!.fillText('Certificate ID: ' + Math.random().toString(36).substring(2, 11).toUpperCase(), canvas.width / 2, canvas.height - 40);

      // Download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${studentName}-${curriculum}-certificate.png`;
      link.click();
    }
  };

  const handleShare = () => {
    const text = `🎉 I just completed the ${curriculumTitle} programme on Ujamaa Dash and scored ${score}%! #UjamaaEducation`;
    if (navigator.share) {
      navigator.share({
        title: 'Certificate of Completion',
        text: text,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Share message copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white dark:bg-[#0f1623] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <X size={18} className="text-slate-600 dark:text-slate-400" />
        </button>

        {/* Certificate */}
        <div
          ref={certificateRef}
          className="p-12 space-y-8 text-center bg-white"
          style={{
            backgroundImage: `
              linear-gradient(135deg, #185fa5 0%, rgba(24, 95, 165, 0.1) 100%),
              linear-gradient(45deg, #a82563 0%, rgba(168, 37, 99, 0.05) 100%)
            `,
          }}
        >
          {/* Decorative Border */}
          <div className="border-8 border-blue-600 rounded-xl p-12 space-y-6 bg-white relative">
            <div className="border-2 border-pink-600 rounded-lg p-10 space-y-6">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-slate-900">Certificate of Completion</h1>
                <p className="text-lg text-slate-500">Ujamaa Dash Programme</p>
              </div>

              {/* Recognition */}
              <div className="space-y-3 py-6">
                <p className="text-slate-700 text-lg">This certificate recognizes that</p>
                <h2 className="text-5xl font-bold" style={{ color: '#185fa5' }}>
                  {studentName}
                </h2>
                <p className="text-slate-700 text-lg">has successfully completed the</p>
              </div>

              {/* Course */}
              <div className="space-y-2 py-4 px-6 rounded-lg" style={{ backgroundColor: '#fce7f3' }}>
                <p className="text-sm text-slate-600 uppercase tracking-widest font-semibold">
                  {curriculumSubtitle}
                </p>
                <h3 className="text-3xl font-bold" style={{ color: '#a82563' }}>
                  {curriculumTitle}
                </h3>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-6 py-6">
                <div className="text-center">
                  <p className="text-slate-500 text-sm uppercase tracking-widest mb-1">Score</p>
                  <p className="text-3xl font-bold text-blue-600">{score}%</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500 text-sm uppercase tracking-widest mb-1">Date Completed</p>
                  <p className="text-lg font-semibold text-slate-700">
                    {new Date(completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="space-y-3 pt-6 border-t-2 border-slate-200">
                <p className="text-slate-600 italic text-sm">
                  Empowering communities through education and safety
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                    UD
                  </div>
                  <span className="text-slate-500 text-xs">
                    Certificate ID: {Math.random().toString(36).substring(2, 11).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download size={16} />
              Download Certificate
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              <Share2 size={16} />
              Share Achievement
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700"
            >
              Close
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Print or download your certificate to save and share your achievement.
          </p>
        </div>
      </div>
    </div>
  );
};
