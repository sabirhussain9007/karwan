'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Destination {
  _id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  colorGradient: string;
}

export default function DestinationDetails({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    numberOfPassengers: 1,
    travelDate: '',
    specialRequests: ''
  });
  const [validationErrors, setValidationErrors] = useState<{fullName?: string, email?: string, phone?: string, numberOfPassengers?: string, travelDate?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchDestination();
  }, [id]);

  const fetchDestination = async () => {
    try {
      const res = await fetch(`/api/destinations/${id}`);
      if (!res.ok) {
        throw new Error('Destination not found');
      }
      const data = await res.json();
      setDestination(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    // Pre-fill user data if available
    setFormData({
      ...formData,
      fullName: session.user?.name || '',
      email: session.user?.email || '',
    });
    
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: {fullName?: string, email?: string, phone?: string, numberOfPassengers?: string, travelDate?: string} = {};
    let isValid = true;

    if (!formData.fullName.trim()) { errors.fullName = "Full Name is required"; isValid = false; }
    if (!formData.email.trim()) { errors.email = "Email is required"; isValid = false; } 
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { errors.email = "Invalid email format"; isValid = false; }
    if (!formData.phone.trim()) { errors.phone = "Phone is required"; isValid = false; }
    else if (!/^03\d{9}$/.test(formData.phone)) { errors.phone = "Format: 03XXXXXXXXX"; isValid = false; }
    if (formData.numberOfPassengers < 1) { errors.numberOfPassengers = "Must be at least 1 passenger"; isValid = false; }
    if (formData.travelDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.travelDate);
      if (selectedDate < today) { errors.travelDate = "Cannot be in the past"; isValid = false; }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      const payload = {
        serviceType: 'International Tours', // Defaulting to International Tours for destinations
        totalAmount: 0, // Placeholder until a package is selected
        applicationData: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          numberOfPassengers: formData.numberOfPassengers,
          travelDate: formData.travelDate,
          specialRequests: formData.specialRequests + `\n\nDestination: ${destination?.name}, ${destination?.country}`
        }
      };
      
      const res = await fetch('/api/user/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit application');
      }
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400 text-xl">Loading...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center">
        <p className="text-red-500 text-xl mb-4">{error || 'Destination not found'}</p>
        <Link href="/destinations" className="text-amber-500 hover:text-amber-400 flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <Image width={800} height={800} src={destination.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80'} 
          alt={destination.name}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <Link href="/destinations" className="inline-flex items-center gap-2 text-stone-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} /> Back to Destinations
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-amber-500 w-8 h-8" />
              <h2 className="text-2xl font-medium text-amber-500 uppercase tracking-widest">{destination.country}</h2>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              {destination.name}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-white mb-6">About {destination.name}</h3>
            <div className="prose prose-invert prose-lg text-stone-300">
              {destination.description.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>
          
          <div className="bg-stone-900 border border-stone-800 p-8 rounded-3xl h-fit sticky top-32">
            <h3 className="text-xl font-bold text-white mb-4">Interested in visiting?</h3>
            <p className="text-stone-400 mb-8">
              Apply now to get a customized tour package quote for {destination.name}. Our travel experts will get back to you shortly!
            </p>
            <button 
              onClick={handleApplyClick}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-900/20"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-stone-900 border border-stone-800 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {submitSuccess ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Application Submitted!</h3>
                <p className="text-stone-400">
                  Thank you for your interest in {destination.name}. Our team will review your application and contact you soon.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Apply for {destination.name}</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-stone-500 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className={`w-full bg-stone-950 border ${validationErrors.fullName ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                    />
                    {validationErrors.fullName && <p className="mt-1 text-xs text-red-500">{validationErrors.fullName}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1">Email</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full bg-stone-950 border ${validationErrors.email ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                      />
                      {validationErrors.email && <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1">Phone</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="03XXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full bg-stone-950 border ${validationErrors.phone ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                      />
                      {validationErrors.phone && <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1">Passengers</label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={formData.numberOfPassengers}
                        onChange={(e) => setFormData({...formData, numberOfPassengers: parseInt(e.target.value)})}
                        className={`w-full bg-stone-950 border ${validationErrors.numberOfPassengers ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors`}
                      />
                      {validationErrors.numberOfPassengers && <p className="mt-1 text-xs text-red-500">{validationErrors.numberOfPassengers}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-400 mb-1">Estimated Travel Date</label>
                      <input 
                        type="date" 
                        value={formData.travelDate}
                        onChange={(e) => setFormData({...formData, travelDate: e.target.value})}
                        className={`w-full bg-stone-950 border ${validationErrors.travelDate ? 'border-red-500 focus:border-red-400' : 'border-stone-800 focus:border-amber-500'} rounded-xl px-4 py-3 text-white focus:outline-none transition-colors [color-scheme:dark]`}
                      />
                      {validationErrors.travelDate && <p className="mt-1 text-xs text-red-500">{validationErrors.travelDate}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">Special Requests</label>
                    <textarea 
                      rows={4}
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Any specific places you want to visit, hotel preferences, etc."
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 mt-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
