"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Send,
  Loader2,
  Plane,
  Shield,
  Headphones,
  MapPin,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import DestinationCombobox from "@/components/DestinationCombobox";
import { Field, Chip, inputClass } from "@/components/journey-application/fields";

export type JourneyQuoteMode = "package" | "custom" | "destination";

export type JourneyPackageInfo = {
  title: string;
  category: string;
  price: number;
  imageUrl?: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  journeyType: string;
  preferredDestination: string;
  departureCity: string;
  numberOfPassengers: number;
  childrenCount: number;
  travelDate: string;
  returnDate: string;
  flexibleDates: boolean;
  travelWindow: string;
  budgetRange: string;
  hotelPreference: string;
  contactPreference: string;
  specialRequests: string;
};

const BUDGET_OPTIONS = ["Economy", "Standard", "Premium", "Luxury"] as const;
const HOTEL_OPTIONS = [
  "No preference",
  "3-star",
  "4-star",
  "5-star",
  "Apartment / Villa",
] as const;
const CONTACT_OPTIONS = ["Phone", "WhatsApp", "Email"] as const;
const TRAVEL_WINDOWS = [
  "Next 30 Days",
  "Ramadan 2026",
  "Hajj Season",
  "Summer holidays",
  "Flexible / not sure",
] as const;

const defaultForm = (): FormState => ({
  fullName: "",
  email: "",
  phone: "",
  journeyType: "Umrah",
  preferredDestination: "",
  departureCity: "",
  numberOfPassengers: 1,
  childrenCount: 0,
  travelDate: "",
  returnDate: "",
  flexibleDates: false,
  travelWindow: "Next 30 Days",
  budgetRange: "Standard",
  hotelPreference: "No preference",
  contactPreference: "Phone",
  specialRequests: "",
});

type JourneyApplicationModalProps = {
  open: boolean;
  onClose: () => void;
  packageInfo: JourneyPackageInfo | null;
  userName?: string | null;
  userEmail?: string | null;
  initialDestination?: string;
  initialTravelWindow?: string;
  quoteMode?: JourneyQuoteMode;
  fixedDestination?: string;
};

export default function JourneyApplicationModal({
  open,
  onClose,
  packageInfo,
  userName,
  userEmail,
  initialDestination = "",
  initialTravelWindow = "",
  quoteMode: quoteModeProp,
  fixedDestination = "",
}: JourneyApplicationModalProps) {
  const quoteMode: JourneyQuoteMode =
    quoteModeProp ??
    (packageInfo?.title === "Custom Journey" || !packageInfo?.price
      ? fixedDestination || initialDestination
        ? "destination"
        : "custom"
      : "package");

  const isDestinationQuote = quoteMode === "destination";
  const isCustom =
    quoteMode === "custom" ||
    isDestinationQuote ||
    !packageInfo?.price ||
    packageInfo?.title === "Custom Journey";

  const adultLabel =
    packageInfo?.category === "Car Rental" ? "Vehicles" : "Adults";
  const showExtendedCustomFields = isCustom && !isDestinationQuote;

  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !packageInfo) return;
    setForm({
      ...defaultForm(),
      fullName: userName || "",
      email: userEmail || "",
      journeyType: CATEGORIES.includes(packageInfo.category)
        ? packageInfo.category
        : "Umrah",
      preferredDestination: isCustom
        ? fixedDestination || initialDestination
        : "",
      travelWindow: initialTravelWindow || "Next 30 Days",
    });
    setErrors({});
    setSuccess(false);
    setSubmitError(null);
  }, [
    open,
    packageInfo,
    userName,
    userEmail,
    initialDestination,
    initialTravelWindow,
    isCustom,
    fixedDestination,
  ]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Invalid email";
    if (!form.phone.trim()) next.phone = "Phone is required";
    else if (!/^03\d{9}$/.test(form.phone))
      next.phone = "Use format 03XXXXXXXXX";
    if (form.numberOfPassengers < 1)
      next.numberOfPassengers = "At least 1 traveler";
    if (!form.flexibleDates && !form.travelDate)
      next.travelDate = "Select a date or mark dates as flexible";
    if (
      form.travelDate &&
      !form.flexibleDates &&
      new Date(form.travelDate) < new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      next.travelDate = "Date cannot be in the past";
    }
    if (
      form.returnDate &&
      form.travelDate &&
      new Date(form.returnDate) < new Date(form.travelDate)
    ) {
      next.returnDate = "Return must be after departure";
    }
    if (
      isCustom &&
      !fixedDestination &&
      !form.preferredDestination.trim()
    ) {
      next.preferredDestination = "Tell us where you want to go";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildSpecialRequests = () => {
    const lines: string[] = [];
    if (packageInfo && !isCustom) {
      lines.push(`Package: ${packageInfo.title}`);
    }
    if (isDestinationQuote && fixedDestination) {
      lines.push(`Destination: ${fixedDestination}`);
    }
    if (isCustom) {
      if (!isDestinationQuote) {
        lines.push(`Journey type: ${form.journeyType}`);
      }
      if (form.departureCity) lines.push(`Departure city: ${form.departureCity}`);
      if (form.travelWindow) lines.push(`Preferred window: ${form.travelWindow}`);
      lines.push(`Budget: ${form.budgetRange}`);
      lines.push(`Contact via: ${form.contactPreference}`);
    }
    if (form.childrenCount > 0) {
      lines.push(`Children traveling: ${form.childrenCount}`);
    }
    if (form.flexibleDates) lines.push("Dates are flexible.");
    if (form.specialRequests.trim()) {
      lines.push(form.specialRequests.trim());
    }
    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageInfo || !validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    const serviceType = isCustom
      ? form.journeyType
      : packageInfo.category;

    const totalAmount = isCustom
      ? 0
      : packageInfo.price * form.numberOfPassengers;

    try {
      const res = await fetch("/api/user/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          totalAmount,
          applicationData: {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            numberOfPassengers: form.numberOfPassengers,
            travelDate: form.travelDate || undefined,
            returnDate: form.returnDate || undefined,
            hotelPreference: form.hotelPreference,
            specialRequests: buildSpecialRequests(),
            additionalNotes: isCustom
              ? `Destination: ${fixedDestination || form.preferredDestination}`
              : undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2800);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !packageInfo) return null;

  const totalGuests = form.numberOfPassengers + form.childrenCount;

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
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className={`relative z-10 w-full max-h-[95vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-stone-800 bg-stone-900 shadow-2xl flex flex-col ${
              isCustom ? "sm:max-w-2xl" : "sm:max-w-xl"
            }`}
          >
            {/* Header */}
            <motion.div
              className={`relative shrink-0 border-b border-stone-800 ${
                isCustom
                  ? "bg-gradient-to-r from-amber-600/20 via-stone-900 to-stone-900"
                  : "bg-stone-900"
              }`}
            >
              {isCustom ? (
                <div className="p-6 sm:p-8 pr-14">
                  <motion.div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                    <Sparkles className="h-4 w-4" />
                    {isDestinationQuote ? "Destination quote" : "Tailored for you"}
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {isDestinationQuote
                      ? `Plan your trip to ${packageInfo.title}`
                      : "Plan your custom journey"}
                  </h2>
                  <p className="mt-2 text-sm text-stone-400 max-w-lg">
                    {isDestinationQuote
                      ? "Share your travel details and our experts will prepare a personalized package quote."
                      : "Tell us your dream trip — our consultants will design an itinerary and send a personalized quote within 24–48 hours."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-amber-500" /> Licensed
                      operator
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Headphones className="h-3.5 w-3.5 text-amber-500" /> 24/7
                      support
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Plane className="h-3.5 w-3.5 text-amber-500" /> Flights &
                      hotels arranged
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 p-6 pr-14">
                  {packageInfo.imageUrl && (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-700">
                      <Image
                        src={packageInfo.imageUrl}
                        alt={packageInfo.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-500">
                      {packageInfo.category}
                    </p>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {packageInfo.title}
                    </h2>
                    <p className="text-sm text-stone-400 mt-1">
                      From {formatCurrency(packageInfo.price)} / person
                    </p>
                  </div>
                </div>
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

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 sm:p-8">
              {success ? (
                <div className="text-center py-10">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Send className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Request received!
                  </h3>
                  <p className="text-stone-400 text-sm max-w-sm mx-auto">
                    {isCustom
                      ? "Our travel team will contact you with a custom proposal soon."
                      : `We'll review your application for ${packageInfo.title} and get back to you shortly.`}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && (
                    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {submitError}
                    </p>
                  )}

                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
                      Contact details
                    </h3>
                    <div className="space-y-4">
                      <Field label="Full name" error={errors.fullName}>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => update("fullName", e.target.value)}
                          className={inputClass(!!errors.fullName)}
                        />
                      </Field>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Email" error={errors.email}>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            className={inputClass(!!errors.email)}
                          />
                        </Field>
                        <Field label="Phone (Pakistan)" error={errors.phone}>
                          <input
                            type="tel"
                            placeholder="03XXXXXXXXX"
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                            className={inputClass(!!errors.phone)}
                          />
                        </Field>
                      </div>
                      <Field label="Preferred contact method">
                        <div className="flex flex-wrap gap-2">
                          {CONTACT_OPTIONS.map((opt) => (
                            <Chip
                              key={opt}
                              active={form.contactPreference === opt}
                              onClick={() => update("contactPreference", opt)}
                            >
                              {opt}
                            </Chip>
                          ))}
                        </div>
                      </Field>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
                      Trip details
                    </h3>
                    <div className="space-y-4">
                      {isCustom && (
                        <>
                          {showExtendedCustomFields && (
                            <Field label="Journey type">
                              <select
                                value={form.journeyType}
                                onChange={(e) =>
                                  update("journeyType", e.target.value)
                                }
                                className={inputClass(false)}
                              >
                                {CATEGORIES.filter(
                                  (c) =>
                                    ![
                                      "Visa Services",
                                      "Ticketing",
                                      "Car Rental",
                                    ].includes(c)
                                ).map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          )}
                          {fixedDestination ? (
                            <Field label="Destination">
                              <input
                                type="text"
                                readOnly
                                value={fixedDestination}
                                className={`${inputClass(false)} opacity-80`}
                              />
                            </Field>
                          ) : (
                            <Field
                              label="Where do you want to go?"
                              error={errors.preferredDestination}
                            >
                              <DestinationCombobox
                                variant="form"
                                placeholder="Search destinations..."
                                value={form.preferredDestination}
                                onChange={(v) =>
                                  update("preferredDestination", v)
                                }
                                onSelect={(d) =>
                                  update("preferredDestination", d.name)
                                }
                              />
                            </Field>
                          )}
                          <Field label="Departure city">
                            <input
                              type="text"
                              placeholder="e.g. Karachi, Lahore"
                              value={form.departureCity}
                              onChange={(e) =>
                                update("departureCity", e.target.value)
                              }
                              className={inputClass(false)}
                            />
                          </Field>
                          <Field label="When do you want to travel?">
                            <select
                              value={form.travelWindow}
                              onChange={(e) =>
                                update("travelWindow", e.target.value)
                              }
                              className={inputClass(false)}
                            >
                              {TRAVEL_WINDOWS.map((w) => (
                                <option key={w} value={w}>
                                  {w}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label={adultLabel} error={errors.numberOfPassengers}>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={form.numberOfPassengers}
                            onChange={(e) =>
                              update(
                                "numberOfPassengers",
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                            className={inputClass(!!errors.numberOfPassengers)}
                          />
                        </Field>
                        <Field label="Children (under 12)">
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={form.childrenCount}
                            onChange={(e) =>
                              update(
                                "childrenCount",
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className={inputClass(false)}
                          />
                        </Field>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-stone-800 bg-stone-950/50 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={form.flexibleDates}
                          onChange={(e) =>
                            update("flexibleDates", e.target.checked)
                          }
                          className="h-4 w-4 rounded border-stone-600 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm text-stone-300">
                          My dates are flexible — help me choose the best time
                        </span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label={
                            form.flexibleDates
                              ? "Preferred start (optional)"
                              : "Departure date"
                          }
                          error={errors.travelDate}
                        >
                          <input
                            type="date"
                            value={form.travelDate}
                            onChange={(e) =>
                              update("travelDate", e.target.value)
                            }
                            className={`${inputClass(!!errors.travelDate)} [color-scheme:dark]`}
                          />
                        </Field>
                        <Field
                          label="Return date (optional)"
                          error={errors.returnDate}
                        >
                          <input
                            type="date"
                            value={form.returnDate}
                            onChange={(e) =>
                              update("returnDate", e.target.value)
                            }
                            className={`${inputClass(!!errors.returnDate)} [color-scheme:dark]`}
                          />
                        </Field>
                      </div>

                      {(showExtendedCustomFields || isDestinationQuote) && (
                        <>
                          <Field label="Budget preference">
                            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {BUDGET_OPTIONS.map((b) => (
                                <Chip
                                  key={b}
                                  active={form.budgetRange === b}
                                  onClick={() => update("budgetRange", b)}
                                  className="justify-center"
                                >
                                  {b}
                                </Chip>
                              ))}
                            </motion.div>
                          </Field>
                          <Field label="Hotel preference">
                            <select
                              value={form.hotelPreference}
                              onChange={(e) =>
                                update("hotelPreference", e.target.value)
                              }
                              className={inputClass(false)}
                            >
                              {HOTEL_OPTIONS.map((h) => (
                                <option key={h} value={h}>
                                  {h}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
                      Additional notes
                    </h3>
                    <textarea
                      rows={4}
                      value={form.specialRequests}
                      onChange={(e) =>
                        update("specialRequests", e.target.value)
                      }
                      placeholder="Visa help, wheelchair access, room sharing, dietary needs, must-see places..."
                      className={`${inputClass(false)} resize-none`}
                    />
                  </section>

                  <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-4">
                    {isCustom ? (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            Custom quote — no payment now
                          </p>
                          <p className="text-xs text-stone-500 mt-1">
                            {totalGuests} traveler{totalGuests !== 1 ? "s" : ""}{" "}
                            · We&apos;ll email or call you with options and
                            pricing.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm text-stone-400 mb-2">
                          <span>Price per adult</span>
                          <span>{formatCurrency(packageInfo.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-stone-400 mb-2">
                          <span>{adultLabel}</span>
                          <span>{form.numberOfPassengers}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold border-t border-stone-700 pt-3 mt-2">
                          <span>Estimated total</span>
                          <span className="text-amber-500">
                            {formatCurrency(
                              packageInfo.price * form.numberOfPassengers
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-4 text-sm font-bold uppercase tracking-widest text-black hover:bg-amber-500 disabled:opacity-50 transition"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : isCustom ? (
                      isDestinationQuote ? "Request destination quote" : "Request custom quote"
                    ) : (
                      "Submit application"
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
