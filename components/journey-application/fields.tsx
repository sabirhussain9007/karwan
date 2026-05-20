"use client";

import React from "react";
import { motion } from "motion/react";

export function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-stone-950 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40 transition ${
    hasError ? "border-red-500" : "border-stone-800 focus:border-amber-500"
  }`;
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div>
      <label className="block text-sm font-medium text-stone-400 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </motion.div>
  );
}

export function Chip({
  children,
  active,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${className} ${
        active
          ? "border-amber-600 bg-amber-600/20 text-amber-400"
          : "border-stone-700 text-stone-400 hover:border-stone-500"
      }`}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
      {children}
    </h3>
  );
}
