import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page = 0,
  totalPages = 1,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const activePage = Math.max(0, Math.min(Number(page ?? 0), totalPages - 1));

  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    if (
      i === 0 ||
      i === totalPages - 1 ||
      (i >= activePage - 1 && i <= activePage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {/* Prev Button */}
      <button
        type="button"
        disabled={activePage <= 0}
        onClick={() => onPageChange(activePage - 1)}
        className="h-8 w-8 rounded-md border border-line bg-surface text-ink-muted disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center hover:bg-surface-2 transition cursor-pointer"
        title="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers (0-based internally, display p + 1) */}
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-xs text-ink-subtle">
            ...
          </span>
        ) : (
          <button
            key={`page-${p}`}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-8 min-w-8 px-2.5 rounded-md text-[13px] font-bold transition cursor-pointer ${
              p === activePage
                ? "bg-accent text-white shadow-xs"
                : "border border-line bg-surface text-ink hover:bg-surface-2"
            }`}
          >
            {p + 1}
          </button>
        ),
      )}

      {/* Next Button */}
      <button
        type="button"
        disabled={activePage >= totalPages - 1}
        onClick={() => onPageChange(activePage + 1)}
        className="h-8 w-8 rounded-md border border-line bg-surface text-ink-muted disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center hover:bg-surface-2 transition cursor-pointer"
        title="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
