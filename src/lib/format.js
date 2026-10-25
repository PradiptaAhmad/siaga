export function formatRupiah(value, compact = false) {
  const number = Number(value || 0)
  if (compact) {
    if (number >= 1_000_000_000) return `Rp ${(number / 1_000_000_000).toFixed(1).replace('.', ',')} M`
    if (number >= 1_000_000) return `Rp ${(number / 1_000_000).toFixed(1).replace('.', ',')} jt`
    if (number >= 1_000) return `Rp ${(number / 1_000).toFixed(0)} rb`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(Number(value || 0))
}

export function formatDate(value, options = {}) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function formatDateShort(value) {
  return formatDate(value, { month: 'short' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function relativeTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} bulan lalu`
  return `${Math.floor(months / 12)} tahun lalu`
}

export function monthsRemaining(periode) {
  if (!periode) return ''
  const [year, month] = periode.split('-')
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
    new Date(Number(year), Number(month) - 1, 1),
  )
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function daysUntil(value) {
  if (!value) return null
  const target = new Date(value)
  const today = new Date()
  target.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

export const statusComplaint = {
  dikirim: { label: 'Dikirim', class: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' },
  diperiksa: { label: 'Diperiksa', class: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  diproses: { label: 'Diproses', class: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' },
  selesai: { label: 'Selesai', class: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  ditolak: { label: 'Ditolak', class: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
}

export const statusPayment = {
  menunggu: { label: 'Menunggu verifikasi', class: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  terverifikasi: { label: 'Terverifikasi', class: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  ditolak: { label: 'Ditolak', class: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
}

export const statusIuran = {
  lunas: { label: 'Lunas', class: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  belum: { label: 'Belum dibayar', class: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
  menunggu: { label: 'Menunggu verifikasi', class: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
}

export const statusAspiration = {
  menunggu: { label: 'Menunggu', class: 'bg-sand-100 text-ink-500 ring-1 ring-sand-300' },
  ditinjau: { label: 'Ditinjau', class: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  diterima: { label: 'Diterima', class: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  ditolak: { label: 'Ditolak', class: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
}

export const priorityMeta = {
  rendah: { label: 'Rendah', class: 'bg-sand-100 text-ink-500' },
  sedang: { label: 'Sedang', class: 'bg-amber-50 text-amber-700' },
  tinggi: { label: 'Tinggi', class: 'bg-red-50 text-red-600' },
}
