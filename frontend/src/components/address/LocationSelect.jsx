import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { normalizeText } from '../../utils/address.js';

const MAX_VISIBLE = 100;

/**
 * Ô chọn có tìm kiếm: gõ chữ (có dấu hoặc không dấu, viết tắt) để lọc danh sách gợi ý.
 * value: id đang chọn (chuỗi) hoặc ''. options: [{ id, name, aliases }]. onChange(option).
 */
export default function LocationSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Chọn...',
  disabled = false,
  loading = false,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(() => options.find((o) => String(o.id) === String(value)) || null, [options, value]);

  const indexed = useMemo(
    () =>
      options.map((o) => ({
        option: o,
        haystack: [o.name, ...(o.aliases || [])].map(normalizeText).join('|'),
      })),
    [options]
  );

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    const list = q ? indexed.filter((x) => x.haystack.includes(q)) : indexed;
    return list.slice(0, MAX_VISIBLE).map((x) => x.option);
  }, [indexed, query]);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.children?.[active];
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (option) => {
    onChange(option);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  const shownText = open ? query : selected?.name || '';

  return (
    <div ref={rootRef} className="relative">
      <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {label}
        {required ? ' *' : ''}
      </label>
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          disabled={disabled}
          value={shownText}
          placeholder={disabled ? 'Chọn mục phía trước trước' : placeholder}
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className="w-full h-8.5 pl-2.5 pr-7 rounded-md bg-page dark:bg-surface-2 border border-line text-[12px] focus:outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </div>

      {open && !disabled && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-line bg-surface shadow-lg text-[12px]"
        >
          {loading && <li className="px-3 py-2 text-ink-muted">Đang tải danh sách...</li>}
          {!loading && filtered.length === 0 && (
            <li className="px-3 py-2 text-ink-muted">Không tìm thấy kết quả phù hợp</li>
          )}
          {!loading &&
            filtered.map((o, i) => (
              <li
                key={o.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(o);
                }}
                onMouseEnter={() => setActive(i)}
                className={`px-3 py-1.5 cursor-pointer ${
                  i === active ? 'bg-accent-soft text-accent' : 'text-ink hover:bg-surface-2'
                } ${String(o.id) === String(value) ? 'font-bold' : ''}`}
              >
                {o.name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
