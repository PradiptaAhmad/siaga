export default function StatCard({
  icon,
  title,
  subtitle,
  value,
  badge,
  badgeIcon,
}) {
  return (
    <article className="flex flex-col rounded-xl bg-[#F5F7F6] p-3.5 shadow-md">
      {/* Icon + judul */}
      <div className="flex items-start gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#26383D]">
          <img src={icon} alt="" className="h-5 w-5 object-contain" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold leading-tight text-[#26383D]">
            {title}
          </h3>
          <p className="mt-0.5 text-[9px] leading-tight text-gray-700">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Nilai */}
      <p className="mt-5 text-xl font-bold text-[#26383D] md:mt-6">{value}</p>

      {/* Badge (opsional) */}
      <div className="mt-auto pt-5 md:pt-6">
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-sm bg-[#13B8A6] px-1.5 py-0.5 text-[8px] font-semibold text-white">
            {badgeIcon && <img src={badgeIcon} alt="" className="h-2.5 w-2.5 object-contain" />}
            {badge}
          </span>
        )}
      </div>
    </article>
  );
}