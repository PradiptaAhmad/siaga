import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

// layer: untuk modal bertumpuk (modal konfirmasi harus di atas modal utama)
export default function Modal({
  title,
  onClose,
  children,
  footer,
  closeOnEscape = true,
  layer = "z-[100]",
}) {
  const panelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!closeOnEscape) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeOnEscape, onClose]);

  return (
    // Mobile: muncul dari bawah (bottom sheet) | Tablet & desktop: di tengah layar
    <div className={`fixed inset-0 ${layer} flex items-end justify-center md:items-center md:p-4`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-[#F5F7F6] shadow-xl outline-none md:max-w-md md:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between rounded-t-2xl bg-[#13B8A6] px-4 py-3">
          <h2 id={titleId} className="text-sm font-bold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* Isi modal: scroll di dalam modal jika panjang */}
        <div className="overflow-y-auto p-4">{children}</div>

        {footer && (
          <div className="flex shrink-0 gap-2 border-t border-gray-200 p-3">{footer}</div>
        )}
      </div>
    </div>
  );
}