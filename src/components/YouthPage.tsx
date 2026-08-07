import React, { useState, useEffect, useRef } from 'react';
import { Play, FileText, X, Download, RefreshCw } from 'lucide-react';
import { youthApi } from '../api';
import { Kicker, Card } from './SubComponents';

interface MediaItem {
  key: string;
  name: string;
  url: string;
  size: number;
  lastModified: string;
}

const formatSize = (bytes: number) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// Captures the actual first frame from the video itself, client-side, so
// cards show a real preview before playback -- no backend changes needed.
const VideoThumbnail: React.FC<{ url: string }> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx && video.videoWidth) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setReady(true);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) video.currentTime = 0.05; // nudge just past frame 0 -- some browsers render a blank frame at exactly 0
  };

  return (
    <>
      <video
        ref={videoRef}
        src={url}
        preload="metadata"
        muted
        playsInline
        crossOrigin="anonymous"
        className="hidden"
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={captureFrame}
      />
      <canvas ref={canvasRef} className={`w-full h-full object-cover ${ready ? '' : 'hidden'}`} />
    </>
  );
};

export const YouthPage: React.FC = () => {
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nowPlaying, setNowPlaying] = useState<MediaItem | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await youthApi.getMedia();
      setVideos(data.videos || []);
      setDocuments(data.documents || []);
    } catch {
      setError('Could not load the media library. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <Kicker text="Voices & Stories" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Ujamaa Youth</h1>
          <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">
            Films, testimonials, and resources made for and by young people in the programme.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[var(--brand-600)] transition-colors"
          title="Refresh library"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-center py-16 text-slate-400 text-sm">Loading media library…</div>
      )}

      {!loading && error && (
        <div className="text-center py-16 text-red-500 text-sm">
          {error} — <button onClick={load} className="underline hover:text-red-700">Try again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Videos ─────────────────────────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 m-0">
              Videos ({videos.length})
            </h2>
            {videos.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No videos uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map(v => (
                  <Card
                    key={v.key}
                    className="cursor-pointer group overflow-hidden p-0 ring-1 ring-[var(--brand-200)] dark:ring-[var(--brand-900)]/40 hover:shadow-lg transition-shadow"
                  >
                    <button
                      onClick={() => setNowPlaying(v)}
                      className="w-full text-left"
                    >
                      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                        <VideoThumbnail url={v.url} />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center scale-90 group-hover:scale-105 transition-transform">
                            <Play size={20} className="text-[var(--brand-600)] ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs font-bold text-black dark:text-white m-0 line-clamp-2">{v.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 m-0">
                          {formatDate(v.lastModified)} {v.size ? `· ${formatSize(v.size)}` : ''}
                        </p>
                      </div>
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* ── Documents ──────────────────────────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 m-0">
              Resources & Reports ({documents.length})
            </h2>
            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No documents uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map(d => (
                    <a
                    key={d.key}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-[var(--brand-300)] dark:hover:border-[var(--brand-700)] hover:bg-[var(--brand-50)]/40 dark:hover:bg-[var(--brand-950)]/20 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/40 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-[var(--brand-600)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-black dark:text-white m-0 truncate">{d.name}</p>
                      <p className="text-[10px] text-slate-400 m-0">
                        {formatDate(d.lastModified)} {d.size ? `· ${formatSize(d.size)}` : ''}
                      </p>
                    </div>
                    <Download size={14} className="text-slate-400 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Video player modal ──────────────────────────────────────── */}
      {nowPlaying && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setNowPlaying(null)}
        >
          <div
            className="bg-black rounded-xl overflow-hidden max-w-3xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 py-2 bg-slate-900">
              <p className="text-xs font-semibold text-white m-0 truncate pr-4">{nowPlaying.name}</p>
              <button onClick={() => setNowPlaying(null)} className="text-slate-400 hover:text-white shrink-0">
                <X size={18} />
              </button>
            </div>
            <video
              key={nowPlaying.key}
              src={nowPlaying.url}
              controls
              autoPlay
              className="w-full max-h-[70vh] bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};
