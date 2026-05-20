"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

type FormModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl";
};

export default function FormModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md",
}: FormModalProps) {
  const widthClass =
    maxWidth === "xl"
      ? "sm:max-w-xl"
      : maxWidth === "lg"
        ? "sm:max-w-lg"
        : "sm:max-w-md";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label="Close modal"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className={`relative z-10 w-full max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-stone-800 bg-stone-900 shadow-2xl flex flex-col ${widthClass}`}
          >
            <motion.div className="shrink-0 border-b border-stone-800 bg-gradient-to-r from-amber-600/15 via-stone-900 to-stone-900 px-6 py-5 pr-14">
              <h2 className="text-xl font-serif font-bold text-white">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-sm text-stone-400">{subtitle}</p>
              )}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
            <div className="overflow-y-auto flex-1 p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
