"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import Link from "next/link";

type ServiceType = 'Umrah' | 'Hajj' | 'International Tours' | 'Domestic Tours' | 'Visa Services' | 'Ticketing' | 'Car Rental';

type ApplicationFormProps = {
  serviceType: ServiceType;
  serviceTitle: string;
  description: string;
  basePrice: number;
};

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
    mealPlan: "Standard",
    hotelPreference: "Standard",
    transportPreference: "Bus",
    specialRequests: "",
    visaRequired: false,
  });

  const [passengers, setPassengers] = useState<{ name: string; relation: string; dob: string; passport: string }[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auth check
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      [name === 'numberOfPassengers' ? name : '']: type === 'number' ? parseInt(value) : undefined,
    }));
  };

  const handleAddPassenger = () => {
    if (passengers.length < parseInt(formData.numberOfPassengers.toString()) - 1) {
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
    let isValid = true;

    if (!formData.fullName.trim()) { errors.fullName = "Full Name is required"; isValid = false; }
    if (!formData.email.trim()) { errors.email = "Email is required"; isValid = false; } 
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { errors.email = "Invalid email format"; isValid = false; }
    if (!formData.phone.trim()) { errors.phone = "Phone is required"; isValid = false; }
    else if (!/^\\+?[\\d\\s-]{10,}$/.test(formData.phone)) { errors.phone = "Invalid phone number"; isValid = false; }
    if (!formData.nationality.trim()) { errors.nationality = "Nationality is required"; isValid = false; }
    if (!formData.passport.trim()) { errors.passport = "Passport is required"; isValid = false; }
    if (!formData.dateOfBirth) { errors.dateOfBirth = "Date of Birth is required"; isValid = false; }
    
    if (formData.numberOfPassengers < 1) { errors.numberOfPassengers = "Must be at least 1 passenger"; isValid = false; }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (formData.travelDate) {
      const travelDate = new Date(formData.travelDate);
      if (travelDate < today) { errors.travelDate = "Cannot be in the past"; isValid = false; }
    } else { errors.travelDate = "Travel date is required"; isValid = false; }

    if (formData.returnDate && formData.travelDate) {
      const returnDate = new Date(formData.returnDate);
      const travelDate = new Date(formData.travelDate);
      if (returnDate < travelDate) { errors.returnDate = "Must be after travel date"; isValid = false; }
    }

    passengers.forEach((p, idx) => {
      if (!p.name.trim()) { errors[`passenger_${idx}_name`] = "Required"; isValid = false; }
      if (!p.relation.trim()) { errors[`passenger_${idx}_relation`] = "Required"; isValid = false; }
      if (!p.dob) { errors[`passenger_${idx}_dob`] = "Required"; isValid = false; }
      if (!p.passport.trim()) { errors[`passenger_${idx}_passport`] = "Required"; isValid = false; }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError("");

    try {
      // Create application
      const appRes = await fetch("/api/user/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          applicationData: {
            ...formData,
            passengers,
          },
          totalAmount: basePrice * formData.numberOfPassengers,
        }),
      });

      if (!appRes.ok) throw new Error("Failed to create application");
      const application = await appRes.json();

      // Initiate payment
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
            <ArrowLeft size={20} /> Back
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{serviceTitle} Application</h1>
          <p className="text-slate-400">{description}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 flex gap-2">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-200">
            Application submitted successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-slate-600 border ${validationErrors.fullName ? 'border-red-400 focus:border-red-400' : 'border-slate-500 focus:border-blue-500'} rounded-lg text-white placeholder-slate-400 focus:outline-none`}
                />
                {validationErrors.fullName && <p className="mt-1 text-xs text-red-400">{validationErrors.fullName}</p>}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-slate-600 border ${validationErrors.email ? 'border-red-400 focus:border-red-400' : 'border-slate-500 focus:border-blue-500'} rounded-lg text-white placeholder-slate-400 focus:outline-none`}
                />
                {validationErrors.email && <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-slate-600 border ${validationErrors.phone ? 'border-red-400 focus:border-red-400' : 'border-slate-500 focus:border-blue-500'} rounded-lg text-white placeholder-slate-400 focus:outline-none`}
                />
                {validationErrors.phone && <p className="mt-1 text-xs text-red-400">{validationErrors.phone}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="nationality"
                  placeholder="Nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-slate-600 border ${validationErrors.nationality ? 'border-red-400 focus:border-red-400' : 'border-slate-500 focus:border-blue-500'} rounded-lg text-white placeholder-slate-400 focus:outline-none`}
                />
                {validationErrors.nationality && <p className="mt-1 text-xs text-red-400">{validationErrors.nationality}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="passport"
                  placeholder="Passport Number"
                  value={formData.passport}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-slate-600 border ${validationErrors.passport ? 'border-red-400 focus:border-red-400' : 'border-slate-500 focus:border-blue-500'} rounded-lg text-white placeholder-slate-400 focus:outline-none`}
                />
                {validationErrors.passport && <p className="mt-1 text-xs text-red-400">{validationErrors.passport}</p>}
              </div>
              <div>
                <input
                  type="date"
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-slate-600 border ${validationErrors.dateOfBirth ? 'border-red-400 focus:border-red-400' : 'border-slate-500 focus:border-blue-500'} rounded-lg text-white placeholder-slate-400 focus:outline-none [color-scheme:dark]`}
                />
                {validationErrors.dateOfBirth && <p className="mt-1 text-xs text-red-400">{validationErrors.dateOfBirth}</p>}
              </div>
            </div>
          </div>

          {/* Travel Details */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Travel Details</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  name="travelDate"
                  placeholder="Travel Date"
                  value={formData.travelDate}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-slate-600 border ${validationErrors.travelDate ? 'border-red-400 focus:border-red-400' : 'border-slate-500 focus:border-blue-500'} rounded-lg text-white placeholder-slate-400 focus:outline-none [color-scheme:dark]`}
                />
                {validationErrors.travelDate && <p className="mt-1 text-xs text-red-400">{validationErrors.travelDate}</p>}
              </div>
              <div>
                <input
                  type="date"
                  name="returnDate"
                  placeholder="Return Date"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-600 border ${validationErrors.returnDate ? 'border-red-400 focus:border-red-400' : 'border-slate-500 focus:border-blue-500'} rounded-lg text-white placeholder-slate-400 focus:outline-none [color-scheme:dark]`}
                />
                {validationErrors.returnDate && <p className="mt-1 text-xs text-red-400">{validationErrors.returnDate}</p>}
              </div>
              <div>
                <select
                  name="numberOfPassengers"
                  value={formData.numberOfPassengers}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-600 border ${validationErrors.numberOfPassengers ? 'border-red-400 focus:border-red-400' : 'border-slate-500 focus:border-blue-500'} rounded-lg text-white focus:outline-none`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
                {validationErrors.numberOfPassengers && <p className="mt-1 text-xs text-red-400">{validationErrors.numberOfPassengers}</p>}
              </div>
              <select
                name="mealPlan"
                value={formData.mealPlan}
                onChange={handleInputChange}
                className="px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Standard">Standard Meals</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Halal">Halal</option>
                <option value="Premium">Premium</option>
              </select>
              <select
                name="hotelPreference"
                value={formData.hotelPreference}
                onChange={handleInputChange}
                className="px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Budget">Budget</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Luxury">Luxury</option>
              </select>
              <select
                name="transportPreference"
                value={formData.transportPreference}
                onChange={handleInputChange}
                className="px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Bus">Bus</option>
                <option value="Van">Van</option>
                <option value="Car">Car</option>
                <option value="Flight">Flight</option>
              </select>
            </div>

            <label className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                name="visaRequired"
                checked={formData.visaRequired}
                onChange={handleInputChange}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-white">I need visa assistance</span>
            </label>
          </div>

          {/* Additional Passengers */}
          {formData.numberOfPassengers > 1 && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Additional Passengers</h2>
                <button
                  type="button"
                  onClick={handleAddPassenger}
                  disabled={passengers.length >= formData.numberOfPassengers - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Passenger
                </button>
              </div>

              {passengers.map((p, idx) => (
                <div key={idx} className="bg-slate-600/50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white font-medium">Passenger {idx + 2}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemovePassenger(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={p.name}
                        onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                        required
                        className={`w-full px-3 py-2 bg-slate-500 border ${validationErrors[`passenger_${idx}_name`] ? 'border-red-400' : 'border-slate-400 focus:border-blue-500'} rounded text-white placeholder-slate-300 focus:outline-none text-sm`}
                      />
                      {validationErrors[`passenger_${idx}_name`] && <p className="mt-1 text-xs text-red-400">{validationErrors[`passenger_${idx}_name`]}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Relation"
                        value={p.relation}
                        onChange={(e) => handlePassengerChange(idx, 'relation', e.target.value)}
                        required
                        className={`w-full px-3 py-2 bg-slate-500 border ${validationErrors[`passenger_${idx}_relation`] ? 'border-red-400' : 'border-slate-400 focus:border-blue-500'} rounded text-white placeholder-slate-300 focus:outline-none text-sm`}
                      />
                      {validationErrors[`passenger_${idx}_relation`] && <p className="mt-1 text-xs text-red-400">{validationErrors[`passenger_${idx}_relation`]}</p>}
                    </div>
                    <div>
                      <input
                        type="date"
                        placeholder="Date of Birth"
                        value={p.dob}
                        onChange={(e) => handlePassengerChange(idx, 'dob', e.target.value)}
                        required
                        className={`w-full px-3 py-2 bg-slate-500 border ${validationErrors[`passenger_${idx}_dob`] ? 'border-red-400' : 'border-slate-400 focus:border-blue-500'} rounded text-white placeholder-slate-300 focus:outline-none text-sm [color-scheme:dark]`}
                      />
                      {validationErrors[`passenger_${idx}_dob`] && <p className="mt-1 text-xs text-red-400">{validationErrors[`passenger_${idx}_dob`]}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Passport"
                        value={p.passport}
                        onChange={(e) => handlePassengerChange(idx, 'passport', e.target.value)}
                        required
                        className={`w-full px-3 py-2 bg-slate-500 border ${validationErrors[`passenger_${idx}_passport`] ? 'border-red-400' : 'border-slate-400 focus:border-blue-500'} rounded text-white placeholder-slate-300 focus:outline-none text-sm`}
                      />
                      {validationErrors[`passenger_${idx}_passport`] && <p className="mt-1 text-xs text-red-400">{validationErrors[`passenger_${idx}_passport`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Requests */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Additional Information</h2>
            <textarea
              name="specialRequests"
              placeholder="Any special requests or additional information..."
              value={formData.specialRequests}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Price Summary */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Base Price:</span>
                <span>${basePrice}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Number of Passengers:</span>
                <span>{formData.numberOfPassengers}</span>
              </div>
              <div className="border-t border-slate-600 pt-3 flex justify-between text-lg font-bold text-white">
                <span>Total Amount:</span>
                <span className="text-green-400">${calculatedPrice}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Send size={20} />
            {loading ? "Processing..." : "Submit Application & Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}
