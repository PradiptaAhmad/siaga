import SectionHeader from "./SectionHeader";

export default function ChartCard({ icon, title, subtitle, children }) {
  return (
    <section className="flex flex-col gap-1">
      <SectionHeader icon={icon} title={title} subtitle={subtitle} />
      <div className="flex-1 rounded-lg bg-[#F5F7F6] p-3 shadow-md md:p-4">
        {children}
      </div>
    </section>
  );
}