import { useState, useEffect } from 'react'
import { Camera, AlertTriangle, Maximize2, RefreshCw, Radio } from 'lucide-react'

export default function CctvPlayer({ camera, onMaximize, isFullscreen = false }) {
  const [time, setTime] = useState('')
  const [streamError, setStreamError] = useState(false)
  const [quality, setQuality] = useState('720p') // '720p' (Standar Ringan) or '480p' (Sangat Hemat Kuota)

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('id-ID', { hour12: false }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!camera) return null

  const isOnline = camera.status === 'online'
  const streamUrl = camera.stream_url?.trim()

  // Format stream url (VDO.Ninja, YouTube, etc.) with resolution capping (720p or 480p)
  const getEmbedUrl = (rawUrl, targetQuality = '720p') => {
    if (!rawUrl) return null
    try {
      // 1. VDO.Ninja URL processing
      if (rawUrl.includes('vdo.ninja')) {
        let url = rawUrl
        if (!url.includes('cleanviewer')) {
          url += (url.includes('?') ? '&' : '?') + 'cleanviewer'
        }
        if (!url.includes('transparent')) {
          url += '&transparent=1'
        }
        if (!url.includes('autoplay')) {
          url += '&autoplay=1'
        }
        // Eco stream parameters: limit max resolution & bitrate so it's lightweight for users
        if (targetQuality === '480p') {
          url += '&quality=2&maxwidth=854&maxheight=480&scale=50&bitrate=700&fps=24'
        } else {
          url += '&quality=1&maxwidth=1280&maxheight=720&scale=75&bitrate=1200&fps=30'
        }
        return url
      }

      // 2. Custom OBS WebRTC Bridge (obs.idwebyik.my.id)
      if (rawUrl.includes('obs.idwebyik.my.id') || rawUrl.includes('/view.html')) {
        let url = rawUrl
        if (!url.includes('cover')) {
          url += (url.includes('?') ? '&' : '?') + 'cover=1'
        }
        if (!url.includes('transparent')) {
          url += '&transparent=1'
        }
        if (targetQuality === '480p') {
          url += '&res=480p&scale=480&bitrate=750'
        } else {
          url += '&res=720p&scale=720&bitrate=1200'
        }
        return url
      }

      // 3. YouTube URL processing
      if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
        let videoId = null
        if (rawUrl.includes('youtu.be/')) {
          videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0]
        } else if (rawUrl.includes('v=')) {
          videoId = new URL(rawUrl).searchParams.get('v')
        } else if (rawUrl.includes('embed/')) {
          videoId = rawUrl.split('embed/')[1]?.split('?')[0]
        }
        if (videoId) {
          const vqParam = targetQuality === '480p' ? 'large' : 'hd720'
          return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoId}&vq=${vqParam}`
        }
      }

      return rawUrl
    } catch {
      return rawUrl
    }
  }

  const embedUrl = getEmbedUrl(streamUrl, quality)
  const isVideoFile = streamUrl && (streamUrl.endsWith('.mp4') || streamUrl.endsWith('.webm'))

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-950 font-sans select-none ${
        isFullscreen ? 'h-full min-h-[420px] rounded-2xl' : 'aspect-video rounded-2xl border border-white/10'
      }`}
    >
      {/* CCTV Live Feed or Standby Player */}
      {isOnline && streamUrl && !streamError ? (
        <div className="absolute inset-0 w-full h-full">
          {isVideoFile ? (
            <video
              src={streamUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onError={() => setStreamError(true)}
            />
          ) : (
            <iframe
              src={embedUrl}
              title={camera.nama}
              loading="lazy"
              className="w-full h-full border-0 pointer-events-auto transform-gpu"
              style={{ transform: 'translateZ(0)', willChange: 'transform' }}
              allow="autoplay; camera; microphone; fullscreen; display-capture; picture-in-picture"
              allowFullScreen
              onError={() => setStreamError(true)}
            />
          )}
        </div>
      ) : (
        /* Standby / Offline / Simulation Feed */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {isOnline ? (
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-3 shadow-lg shadow-indigo-500/10">
                <Camera className="h-7 w-7" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              </div>
              <p className="text-xs font-semibold text-white tracking-wider uppercase">
                {camera.nama}
              </p>
              <p className="text-[11px] text-white/50 mt-0.5">{camera.lokasi}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                STANDBY • LIVE FEED AKTIF
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                Kamera Sedang Offline
              </p>
              <p className="text-[11px] text-white/40 mt-0.5 max-w-xs">
                {camera.keterangan || 'Sedang dalam pemeliharaan berkala atau pengecekan jaringan RT.'}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono text-rose-400">
                NO SIGNAL • CODE #OFFLINE
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top HUD Overlay (Scanline + Camera Name + Live Indicator + Timestamp) */}
      <div className="absolute top-0 inset-x-0 p-2.5 sm:p-4 flex items-center justify-between z-20 pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-600/90 text-white font-mono text-[10px] font-bold tracking-wider shadow shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              REC
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] font-bold shrink-0">
              OFFLINE
            </div>
          )}
          <span className="text-[10px] sm:text-[11px] font-mono font-medium text-white/90 drop-shadow truncate max-w-[140px] sm:max-w-none">
            CAM {String(camera.id).padStart(2, '0')} • {camera.nama}
          </span>
          {isOnline && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
              {quality === '480p' ? '480P ECO' : '720P HD'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-white/90 drop-shadow">
            {time} WIB
          </span>
        </div>
      </div>

      {/* Bottom HUD Overlay (Location + Resolution Switcher + Fullscreen Trigger) */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="text-[10px] font-mono text-white/70">
          <span className="text-white/40 mr-1.5">LOKASI:</span>
          {camera.lokasi}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {isOnline && (
            <div className="flex items-center p-0.5 rounded-lg bg-black/75 border border-white/15 backdrop-blur-xs shadow-xs">
              <button
                type="button"
                onClick={() => setQuality('480p')}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition active:scale-95 ${
                  quality === '480p'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Gunakan 480p (Sangat Hemat Kuota & Ringan Baterai)"
              >
                480p Eco
              </button>
              <button
                type="button"
                onClick={() => setQuality('720p')}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition active:scale-95 ${
                  quality === '720p'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Gunakan 720p (Standar HD Ringan)"
              >
                720p HD
              </button>
            </div>
          )}

          {onMaximize && !isFullscreen && (
            <button
              onClick={() => onMaximize(camera)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium backdrop-blur-sm transition border border-white/20 shadow-sm"
              title="Perbesar Layar Penuh"
            >
              <Maximize2 className="h-3 w-3" />
              <span className="hidden sm:inline">Perbesar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

