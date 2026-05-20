"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertCircle, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib/utils";
import { Field, Chip, inputClass, SectionTitle } from "@/components/journey-application/fields";

type ServiceType =
  | "Umrah"
  | "Hajj"
  | "International Tours"
  | "Domestic Tours"
  | "Visa Services"
  | "Ticketing"
  | "Car Rental";

type ApplicationFormProps = {
  serviceType: ServiceType;
  serviceTitle: string;
  description: string;
  basePrice: number;
};

const CONTACT_OPTIONS = ["Phone", "WhatsApp", "Email"] as const;
const HOTEL_OPTIONS = ["Budget", "Standard", "Premium", "Luxury"] as const;

export default function ApplicationForm({
  serviceType,
  serviceTitle,
  description,
  basePrice,
}: ApplicationFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    passport: "",
    dateOfBirth: "",
    travelDate: "",
    returnDate: "",
    numberOfPassengers: 1,
    childrenCount: 0,
    flexibleDates: false,
    mealPlan: "Standard",
    hotelPreference: "Standard",
    transportPreference: "Bus",
    contactPreference: "Phone",
    specialRequests: "",
    visaRequired: false,
  });

  const [passengers, setPassengers] = useState<
    { name: string; relation: string; dob: string; passport: string }[]
  >([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const adultLabel = serviceType === "Car Rental" ? "Vehicles" : "Adults";

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: session.user?.name || prev.fullName,
        email: session.user?.email || prev.email,
      }));
    }
  }, [session]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "numberOfPassengers" || name === "childrenCount"
            ? parseInt(value, 10) || 0
            : value,
    }));
  };

  const handleAddPassenger = () => {
    if (passengers.length < formData.numberOfPassengers - 1) {
      setPassengers([...passengers, { name: "", relation: "", dob: "", passport: "" }]);
    }
  };

  const handlePassengerChange = (idx: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[idx] = { ...updated[idx], [field]: value };
    setPassengers(updated);
  };

  const handleRemovePassenger = (idx: number) => {
    setPassengers(passengers.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email";
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    else if (!/^03\d{9}$/.test(formData.phone))
      errors.phone = "Format: 03XXXXXXXXX";
    if (!formData.nationality.trim()) errors.nationality = "Required";
    if (!formData.passport.trim()) errors.passport = "Required";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Required";
    if (formData.numberOfPassengers < 1)
      errors.numberOfPassengers = "At least 1";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.flexibleDates) {
      if (!formData.travelDate) errors.travelDate = "Required or mark dates flexible";
      else if (new Date(formData.travelDate) < today)
        errors.travelDate = "Cannot be in the past";
    }

    if (formData.returnDate && formData.travelDate) {
      if (new Date(formData.returnDate) < new Date(formData.travelDate))
        errors.returnDate = "Must be after departure";
    }

    passengers.forEach((p, idx) => {
      if (!p.name.trim()) errors[`passenger_${idx}_name`] = "Required";
      if (!p.relation.trim()) errors[`passenger_${idx}_relation`] = "Required";
      if (!p.dob) errors[`passenger_${idx}_dob`] = "Required";
      if (!p.passport.trim()) errors[`passenger_${idx}_passport`] = "Required";
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError("");

    const specialLines = [
      `Contact via: ${formData.contactPreference}`,
      formData.childrenCount > 0
        ? `Children: ${formData.childrenCount}`
        : null,
      formData.flexibleDates ? "Dates are flexible." : null,
      formData.specialRequests.trim() || null,
    ].filter(Boolean);

    try {
      const appRes = await fetch("/api/user/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          applicationData: {
            ...formData,
            passengers,
            specialRequests: specialLines.join("\n"),
          },
          totalAmount: basePrice * formData.numberOfPassengers,
        }),
      });

      if (!appRes.ok) throw new Error("Failed to create application");

      const payRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          amount: basePrice * formData.numberOfPassengers,
          passengers: formData.numberOfPassengers,
          specialRequests: formData.specialRequests,
          travelDate: formData.travelDate,
        }),
      });

      if (!payRes.ok) throw new Error("Failed to create payment session");
      const { url } = await payRes.json();

      if (url) {
        window.location.href = url;
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/user-dashboard"), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculatedPrice = basePrice * formData.numberOfPassengers;

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="max-w-2xl mx-auto p-4 md:p-8 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-6 text-sm font-medium"
        >
          <ArrowLeft size={18} /> Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-3xl border border-stone-800 bg-gradient-to-r from-amber-600/15 via-stone-900 to-stone-900 p-6 md:p-8"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            {serviceType}
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-serif font-bold text-white">
            {serviceTitle}
          </h1>
          <p className="mt-3 text-stone-400 text-sm leading-relaxed">{description}</p>
          <p className="mt-4 flex items-center gap-2 text-xs text-stone-500">
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            Secure application · Licensed travel operator
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 flex gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Application submitted! Redirecting to your dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6 space-y-4">
            <SectionTitle>Contact details</SectionTitle>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full name" error={validationErrors.fullName}>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={inputClass(!!validationErrors.fullName)}
                />
              </Field>
              <Field label="Email" error={validationErrors.email}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass(!!validationErrors.email)}
                />
              </Field>
              <Field label="Phone (Pakistan)" error={validationErrors.phone}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="03XXXXXXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={inputClass(!!validationErrors.phone)}
                />
              </Field>
              <Field label="Preferred contact">
                <div className="flex flex-wrap gap-2">
                  {CONTACT_OPTIONS.map((opt) => (
                    <Chip
                      key={opt}
                      active={formData.contactPreference === opt}
                      onClick={() =>
                        setFormData((p) => ({ ...p, contactPreference: opt }))
                      }
                    >
                      {opt}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6 space-y-4">
            <SectionTitle>Traveler documents</SectionTitle>
            <motion.div className="grid md:grid-cols-2 gap-4">
              <Field label="Nationality" error={validationErrors.nationality}>
                <input
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className={inputClass(!!validationErrors.nationality)}
                />
              </Field>
              <Field label="Passport number" error={validationErrors.passport}>
                <input
                  name="passport"
                  value={formData.passport}
                  onChange={handleInputChange}
                  className={inputClass(!!validationErrors.passport)}
                />
              </Field>
              <Field label="Date of birth" error={validationErrors.dateOfBirth}>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`${inputClass(!!validationErrors.dateOfBirth)} [color-scheme:dark]`}
                />
              </Field>
            </motion.div>
          </section>

          <section className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6 space-y-4">
            <SectionTitle>Trip details</SectionTitle>
            <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-stone-800 bg-stone-950/50 px-4 py-3">
              <input
                type="checkbox"
                name="flexibleDates"
                checked={formData.flexibleDates}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-stone-600 text-amber-600"
              />
              <span className="text-sm text-stone-300">My dates are flexible</span>
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <Field
                label={formData.flexibleDates ? "Preferred start (optional)" : "Departure date"}
                error={validationErrors.travelDate}
              >
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleInputChange}
                  className={`${inputClass(!!validationErrors.travelDate)} [color-scheme:dark]`}
                />
              </Field>
              <Field label="Return date (optional)" error={validationErrors.returnDate}>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                  className={`${inputClass(!!validationErrors.returnDate)} [color-scheme:dark]`}
                />
              </Field>
              <Field label={adultLabel} error={validationErrors.numberOfPassengers}>
                <input
                  type="number"
                  name="numberOfPassengers"
                  min={1}
                  max={10}
                  value={formData.numberOfPassengers}
                  onChange={handleInputChange}
                  className={inputClass(!!validationErrors.numberOfPassengers)}
                />
              </Field>
              <Field label="Children (under 12)">
                <input
                  type="number"
                  name="childrenCount"
                  min={0}
                  max={10}
                  value={formData.childrenCount}
                  onChange={handleInputChange}
                  className={inputClass(false)}
                />
              </Field>
              <Field label="Meal plan">
                <select
                  name="mealPlan"
                  value={formData.mealPlan}
                  onChange={handleInputChange}
                  className={inputClass(false)}
                >
                  <option value="Standard">Standard</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Halal">Halal</option>
                  <option value="Premium">Premium</option>
                </select>
              </Field>
              <Field label="Hotel preference">
                <select
                  name="hotelPreference"
                  value={formData.hotelPreference}
                  onChange={handleInputChange}
                  className={inputClass(false)}
                >
                  {HOTEL_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Transport">
                <select
                  name="transportPreference"
                  value={formData.transportPreference}
                  onChange={handleInputChange}
                  className={inputClass(false)}
                >
                  <option value="Bus">Bus</option>
                  <option value="Van">Van</option>
                  <option value="Car">Car</option>
                  <option value="Flight">Flight</option>
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="visaRequired"
                checked={formData.visaRequired}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-stone-600 text-amber-600"
              />
              <span className="text-sm text-stone-300">I need visa assistance</span>
            </label>
          </section>

          {formData.numberOfPassengers > 1 && (
            <section className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <SectionTitle>Additional travelers</SectionTitle>
                <button
                  type="button"
                  onClick={handleAddPassenger}
                  disabled={passengers.length >= formData.numberOfPassengers - 1}
                  className="text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 disabled:opacity-40"
                >
                  Add traveler
                </button>
              </div>
              {passengers.map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-stone-800 bg-stone-950/50 p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">
                      Traveler {idx + 2}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePassenger(idx)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      placeholder="Full name"
                      value={p.name}
                      onChange={(e) =>
                        handlePassengerChange(idx, "name", e.target.value)
                      }
                      className={inputClass(!!validationErrors[`passenger_${idx}_name`])}
                    />
                    <input
                      placeholder="Relation"
                      value={p.relation}
                      onChange={(e) =>
                        handlePassengerChange(idx, "relation", e.target.value)
                      }
                      className={inputClass(!!validationErrors[`passenger_${idx}_relation`])}
                    />
                    <input
                      type="date"
                      value={p.dob}
                      onChange={(e) =>
                        handlePassengerChange(idx, "dob", e.target.value)
                      }
                      className={`${inputClass(!!validationErrors[`passenger_${idx}_dob`])} [color-scheme:dark]`}
                    />
                    <input
                      placeholder="Passport"
                      value={p.passport}
                      onChange={(e) =>
                        handlePassengerChange(idx, "passport", e.target.value)
                      }
                      className={inputClass(!!validationErrors[`passenger_${idx}_passport`])}
                    />
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
            <SectionTitle>Additional notes</SectionTitle>
            <textarea
              name="specialRequests"
              rows={4}
              value={formData.specialRequests}
              onChange={handleInputChange}
              placeholder="Dietary needs, accessibility, room preferences..."
              className={`${inputClass(false)} resize-none mt-3`}
            />
          </section>

          <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-5">
            <div className="flex justify-between text-sm text-stone-400 mb-2">
              <span>Price per {serviceType === "Car Rental" ? "vehicle" : "person"}</span>
              <span>{formatCurrency(basePrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-400 mb-3">
              <span>{adultLabel}</span>
              <span>× {formData.numberOfPassengers}</span>
            </div>
            <div className="flex justify-between text-white font-bold border-t border-stone-700 pt-3">
              <span>Total</span>
              <span className="text-amber-500">{formatCurrency(calculatedPrice)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-4 text-sm font-bold uppercase tracking-widest text-black hover:bg-amber-500 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {loading ? "Processing..." : "Submit & proceed to payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
