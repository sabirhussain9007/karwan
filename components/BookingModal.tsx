"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { X, Loader2, Send } from "lucide-react";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib/utils";

type BookingModalProps = {
  serviceType: string;
  basePrice: number;
  onClose: () => void;
  packageTitle?: string;
};

export default function BookingModal({
  serviceType,
  basePrice,
  onClose,
  packageTitle,
}: BookingModalProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    passengers: 1,
    travelDate: "",
    specialRequests: "",
  });
  const [validationErrors, setValidationErrors] = useState<{fullName?: string, email?: string, phone?: string, passengers?: string, travelDate?: string}>({});

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        fullName: session.user?.name || "",
        email: session.user?.email || "",
      }));
    }
  }, [session]);

  const totalPrice = basePrice * formData.passengers;

  const validateForm = () => {
    const errors: {fullName?: string, email?: string, phone?: string, passengers?: string, travelDate?: string} = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone is required";
      isValid = false;
    } else if (!/^\\+?[\\d\\s-]{10,}$/.test(formData.phone)) {
      errors.phone = "Invalid phone number";
      isValid = false;
    }

    if (formData.passengers < 1) {
      errors.passengers = "Must be at least 1 passenger";
      isValid = false;
    } else if (formData.passengers > 20) {
      errors.passengers = "Maximum 20 passengers allowed per booking";
      isValid = false;
    }

    if (formData.travelDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.travelDate);
      if (selectedDate < today) {
        errors.travelDate = "Travel date cannot be in the past";
        isValid = false;
      }
    } else {
      errors.travelDate = "Travel date is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);

    try {
      const finalSpecialRequests = packageTitle 
        ? `${formData.specialRequests}\n\nPackage: ${packageTitle}`.trim()
        : formData.specialRequests;

      const payload = {
        serviceType,
        totalAmount: totalPrice,
        applicationData: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          numberOfPassengers: formData.passengers,
          travelDate: formData.travelDate,
          specialRequests: finalSpecialRequests,
        }
      };

      const res = await fetch("/api/user/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8">
          <Loader2 className="animate-spin text-amber-500" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-stone-800 flex justify-between items-center sticky top-0 bg-stone-900/95 backdrop-blur z-10">
          <h2 className="text-2xl font-serif font-bold text-white">Apply for {packageTitle || serviceType}</h2>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send size={40} />
            </div>
            <h3 className="text-3xl font-serif font-bold text-white mb-4">Application Submitted!</h3>
            <p className="text-stone-400 leading-relaxed">
              Thank you for your interest in {packageTitle || serviceType}. Our team will review your application and contact you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={`w-full bg-stone-950 border ${validationErrors.fullName ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                placeholder="John Doe"
              />
              {validationErrors.fullName && <p className="mt-1 text-xs text-red-500">{validationErrors.fullName}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-stone-950 border ${validationErrors.email ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                  placeholder="john@example.com"
                />
                {validationErrors.email && <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Phone</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full bg-stone-950 border ${validationErrors.phone ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                  placeholder="+1 (555) 000-0000"
                />
                {validationErrors.phone && <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">
                  {serviceType === 'Car Rental' ? 'Vehicles Needed' : 'Number of Passengers'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={formData.passengers}
                  onChange={(e) =>
                    setFormData({ ...formData, passengers: parseInt(e.target.value) || 1 })
                  }
                  className={`w-full bg-stone-950 border ${validationErrors.passengers ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                />
                {validationErrors.passengers && <p className="mt-1 text-xs text-red-500">{validationErrors.passengers}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">
                  Estimated Travel Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.travelDate}
                  onChange={(e) =>
                    setFormData({ ...formData, travelDate: e.target.value })
                  }
                  className={`w-full bg-stone-950 border ${validationErrors.travelDate ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors [color-scheme:dark]`}
                />
                {validationErrors.travelDate && <p className="mt-1 text-xs text-red-500">{validationErrors.travelDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                placeholder="Any specific preferences or requirements..."
              />
            </div>

            <div className="bg-stone-950/50 p-5 rounded-xl border border-stone-800">
              <div className="flex justify-between text-stone-400 text-sm mb-2">
                <span>Base Price</span>
                <span>{formatCurrency(basePrice)}</span>
              </div>
              <div className="flex justify-between text-stone-400 text-sm mb-4 pb-4 border-b border-stone-800">
                <span>{serviceType === 'Car Rental' ? 'Vehicles' : 'Passengers'}</span>
                <span>× {formData.passengers}</span>
              </div>
              <div className="flex justify-between items-center text-white font-bold text-xl">
                <span>Total Estimated</span>
                <span className="text-amber-500">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-widest text-xs shadow-lg shadow-amber-600/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Submit Application"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
