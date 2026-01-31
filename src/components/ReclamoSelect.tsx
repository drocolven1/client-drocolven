import { useEffect, useRef, useState } from "react";

type Props = {
  items: string[];
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxHeightClass?: string;
  className?: string;
  label?: string;
};

export default function ReclamoSelect({ items, value, onChange, placeholder = "Selecciona...", maxHeightClass = "max-h-48", className = "", label, }: Props) {
  const [filter, setFilter] = useState<string>(value ?? "");
  const [open, setOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFilter(value ?? "");
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const filtered = items.filter((n) => n.toLowerCase().includes((filter || "").toLowerCase()));

  return (
    <div className={`relative ${className} z-50`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>}
      <input
        className="w-full border bg-transparent border-white/10 text-white/90 rounded-md px-3 py-2"
        placeholder={placeholder}
        value={filter}
        onChange={(e) => { setFilter(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className={`absolute z-20 mt-2 w-full ${maxHeightClass} overflow-auto rounded-md bg-gray-800 shadow-lg`}>
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-white/60">No hay resultados</div>
          ) : (
            filtered.map((n) => (
              <button
                key={n}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white/90"
                onClick={() => { onChange(n); setFilter(n); setOpen(false); }}
              >
                {n}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
