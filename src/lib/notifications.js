// Browser Native Web Notification & Sound Utility for SIAGA

// 1. Play synthetic subtle notification chime using Web Audio API
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc2.type = 'triangle'

    // Chord: E5 (659.25Hz) -> B5 (987.77Hz)
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime)
    osc1.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.15)

    osc2.frequency.setValueAtTime(329.63, ctx.currentTime)
    osc2.frequency.exponentialRampToValueAtTime(493.88, ctx.currentTime + 0.15)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start()
    osc2.start()
    osc1.stop(ctx.currentTime + 0.45)
    osc2.stop(ctx.currentTime + 0.45)
  } catch {
    // ignore audio context restrictions
  }
}

// 2. Request Permission from Browser
export async function requestDeviceNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  if (Notification.permission === 'granted') {
    return 'granted'
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }
  return Notification.permission
}

// 3. Send Native Device Notification
export function sendDeviceNotification(title, options = {}) {
  // Play sound
  playNotificationSound()

  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') {
    try {
      const notif = new window.Notification(title, {
        body: options.body || 'Ada pengumuman atau pembaruan baru dari lingkungan SIAGA.',
        icon: '/favicon.ico',
        tag: options.tag || 'siaga-notif-' + Date.now(),
        requireInteraction: false,
      })

      notif.onclick = () => {
        window.focus()
        if (options.link) {
          window.location.href = options.link
        }
        notif.close()
      }
    } catch {
      // fallback in case mobile Chrome requires service worker
    }
  }
}

