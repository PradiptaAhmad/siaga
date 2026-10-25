import { AlertCircle } from 'lucide-react'

export default function Alert({ variant = 'info', children, className = '' }) {
  const styles = {
    info: 'border-sky-200 bg-sky-50 text-sky-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-red-200 bg-red-50 text-red-700',
  }

  return (
    <div className={`flex gap-2.5 rounded-2xl border px-4 py-3 text-sm ${styles[variant]} ${className}`}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}
