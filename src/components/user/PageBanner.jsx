export default function PageBanner({ title, subtitle }) {
  return (
    <section className="flex min-h-[110px] flex-col justify-between gap-6 rounded-2xl bg-[#F4B740] px-4 py-4 shadow-md md:min-h-[120px] md:px-5">
      <h1 className="text-base font-bold text-white md:text-lg">{title}</h1>
      <p className="text-xs font-medium text-white md:text-sm">{subtitle}</p>
    </section>
  );
}