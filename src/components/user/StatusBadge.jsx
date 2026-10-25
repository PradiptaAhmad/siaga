const styles = {
  Diterima: { wrap: "bg-green-200 text-green-900", dot: "bg-green-500" },
  Diproses: { wrap: "bg-yellow-200 text-yellow-900", dot: "bg-yellow-500" },
  Ditolak: { wrap: "bg-red-200 text-red-900", dot: "bg-red-500" },
};

export default function StatusBadge({ status }) {
  const style = styles[status] ?? { wrap: "bg-gray-200 text-gray-800", dot: "bg-gray-500" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[9px] font-medium ${style.wrap}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}