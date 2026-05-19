"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { MapPin, Loader2, ChevronDown } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=200";

export type DestinationOption = {
  _id: string;
  name: string;
  country: string;
  imageUrl?: string;
};

type DestinationComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (destination: DestinationOption) => void;
  placeholder?: string;
  label?: string;
  variant?: "hero" | "form";
  className?: string;
};

function formatLabel(d: DestinationOption) {
  return `${d.name}, ${d.country}`;
}

function DestinationThumb({
  destination,
  size = "md",
}: {
  destination: Pick<DestinationOption, "name" | "imageUrl">;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const src = destination.imageUrl?.trim() || FALLBACK_IMAGE;

  return (
    <div
      className={`${dim} relative shrink-0 overflow-hidden rounded-lg border border-stone-700/80 bg-stone-800`}
    >
      <Image
        src={src}
        alt={destination.name}
        fill
        className="object-cover"
        sizes={size === "sm" ? "32px" : "44px"}
        unoptimized={src.startsWith("data:")}
      />
    </div>
  );
}

export default function DestinationCombobox({
  value,
  onChange,
  onSelect,
  placeholder = "Where to?",
  label,
  variant = "hero",
  className = "",
}: DestinationComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [selected, setSelected] = useState<DestinationOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const fetchDestinations = useCallback(async () => {
    if (hasFetched) return;
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/destinations");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDestinations(
          data.map((d: DestinationOption) => ({
            _id: d._id,
            name: d.name,
            country: d.country,
            imageUrl: d.imageUrl || "",
          }))
        );
      } else {
        setDestinations([]);
      }
      setHasFetched(true);
    } catch {
      setLoadError(true);
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  }, [hasFetched]);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        formatLabel(d).toLowerCase().includes(q)
    );
  }, [destinations, value]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [value, open]);

  useEffect(() => {
    if (!selected) return;
    if (value !== formatLabel(selected)) {
      setSelected(null);
    }
  }, [value, selected]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openList = () => {
    setOpen(true);
    void fetchDestinations();
  };

  const pick = (d: DestinationOption) => {
    const labelText = formatLabel(d);
    setSelected(d);
    onChange(labelText);
    onSelect?.(d);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[highlightIndex]) {
      e.preventDefault();
      pick(filtered[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showSelectedThumb =
    selected && value === formatLabel(selected) && !open;

  const inputClass =
    variant === "hero"
      ? "text-sm font-medium focus:outline-none bg-transparent text-white w-full placeholder:text-stone-700 min-w-0"
      : "w-full rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50 min-w-0";

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      {label && (
        <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest block mb-0.5">
          {label}
        </span>
      )}
      <div
        className={`relative flex items-center gap-2.5 ${
          variant === "form" && showSelectedThumb
            ? "rounded-xl border border-stone-800 bg-stone-950 pl-2 pr-10 py-1.5 focus-within:ring-2 focus-within:ring-amber-600/50"
            : variant === "form"
              ? ""
              : ""
        }`}
      >
        {showSelectedThumb && (
          <DestinationThumb
            destination={selected}
            size={variant === "hero" ? "sm" : "sm"}
          />
        )}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
            if (!hasFetched) void fetchDestinations();
          }}
          onFocus={openList}
          onClick={openList}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${inputClass} ${
            variant === "form" && showSelectedThumb
              ? "border-0 bg-transparent focus:ring-0 py-2 pr-8"
              : variant === "form"
                ? "pr-10"
                : "pr-6"
          }`}
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            if (open) setOpen(false);
            else {
              inputRef.current?.focus();
              openList();
            }
          }}
          className={`absolute right-0 p-1 transition text-stone-500 hover:text-amber-500 ${
            variant === "form" && showSelectedThumb ? "right-2" : ""
          }`}
          aria-label={open ? "Close destinations" : "Show destinations"}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </button>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className={`absolute z-[100] max-h-72 w-full overflow-auto rounded-xl border border-stone-700 bg-stone-900 shadow-2xl ${
            variant === "hero"
              ? "bottom-full mb-2 min-w-[300px] left-0"
              : "top-full mt-2 left-0"
          }`}
        >
          {loading && !hasFetched && (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-stone-400">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              Loading destinations...
            </li>
          )}
          {loadError && (
            <li className="px-4 py-3 text-sm text-red-400">
              Could not load destinations. Try again.
            </li>
          )}
          {!loading && hasFetched && filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-stone-500">
              {value.trim()
                ? "No destinations match your search."
                : "No destinations available yet."}
            </li>
          )}
          {filtered.map((d, index) => (
            <li key={d._id} role="option" aria-selected={index === highlightIndex}>
              <button
                type="button"
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => pick(d)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                  index === highlightIndex
                    ? "bg-amber-600/15 text-white"
                    : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <DestinationThumb destination={d} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium truncate">{d.name}</span>
                  <span className="block text-xs text-stone-500 truncate">
                    {d.country}
                  </span>
                </span>
                <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500/70" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
