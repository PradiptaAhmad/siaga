import { Link } from 'react-router-dom'
import logoUtama from '../../assets/img/Hero/logoUtama.png'

export default function Logo({ light = false, compact = false, to = '/', className = '' }) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={logoUtama} alt="Logo SIAGA" className="h-9 w-auto object-contain" />
    </span>
  )

  if (!to) return content
  return (
    <Link to={to} className="inline-flex items-center" aria-label="SIAGA — Beranda">
      {content}
    </Link>
  )
}
