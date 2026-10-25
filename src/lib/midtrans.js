/**
 * Helper Utility untuk Integrasi Midtrans Snap SDK
 */

const CLIENT_KEY =
  import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-vkqFRTfr7YQulw_h'
const SNAP_URL =
  import.meta.env.VITE_MIDTRANS_SNAP_URL ||
  'https://app.sandbox.midtrans.com/snap/snap.js'

export function loadMidtransScript() {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      return resolve(window.snap)
    }

    const existingScript = document.getElementById('midtrans-snap-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.snap))
      existingScript.addEventListener('error', (err) => reject(err))
      return
    }

    const script = document.createElement('script')
    script.id = 'midtrans-snap-script'
    script.src = SNAP_URL
    script.setAttribute('data-client-key', CLIENT_KEY)
    script.async = true
    script.onload = () => resolve(window.snap)
    script.onerror = (err) =>
      reject(new Error('Gagal memuat SDK Midtrans Snap. Periksa koneksi internet.'))

    document.head.appendChild(script)
  })
}

export async function openSnapPayment(snapToken, { onSuccess, onPending, onError, onClose } = {}) {
  await loadMidtransScript()

  if (!window.snap) {
    throw new Error('Midtrans Snap tidak tersedia.')
  }

  window.snap.pay(snapToken, {
    onSuccess: (result) => {
      if (onSuccess) onSuccess(result)
    },
    onPending: (result) => {
      if (onPending) onPending(result)
    },
    onError: (result) => {
      if (onError) onError(result)
    },
    onClose: () => {
      if (onClose) onClose()
    },
  })
}

