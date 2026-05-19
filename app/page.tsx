'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Plane, Shield, Headphones, Send } from 'lucide-react';
import DestinationCombobox from '@/components/DestinationCombobox';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Home = () => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const { data: session } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/packages?featured=true');
        if (res.ok) {
          const data = await res.json();
          // Take up to 3 featured packages
          setFeatured(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch featured packages:', error);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
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

  const [searchDestination, setSearchDestination] = useState("");
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [searchWindow, setSearchWindow] = useState("Next 30 Days");

  const handleApplyClick = (pkg: any) => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    setSelectedPackage(pkg);
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
    } else if (!/^03\d{9}$/.test(formData.phone)) {
      errors.phone = "Phone number must be in format 03XXXXXXXXX";
      isValid = false;
    }

    if (formData.numberOfPassengers < 1) {
      errors.numberOfPassengers = "Must be at least 1 passenger";
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
        serviceType: selectedPackage.category,
        totalAmount: selectedPackage.price * formData.numberOfPassengers,
        applicationData: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          numberOfPassengers: formData.numberOfPassengers,
          travelDate: formData.travelDate,
          specialRequests: formData.specialRequests + `\n\nPackage: ${selectedPackage.title}`
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
        setSelectedPackage(null);
      }, 3000);
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen lg:min-h-[90vh] w-full flex flex-col justify-center overflow-hidden bg-stone-950">
        <div className="absolute inset-0 z-0">
          <Image width={800} height={800} src="https://images.unsplash.com/photo-1667454496584-9838026037af?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Travel background" 
            className="h-full w-full object-cover opacity-40 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-stone-950/60"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-48 w-full sm:px-6 lg:px-8 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block rounded px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase bg-amber-600 text-black">
              Premium Service • Est. 15 Years
            </span>
            <h1 className="mt-10 text-6xl font-serif font-bold tracking-tight text-white sm:text-8xl leading-[1.1]">
              Spiritual Harmony <br />
              <span className="text-amber-500 italic block mt-2">Redefined.</span>
            </h1>
            <p className="mt-8 text-lg text-stone-400 font-serif italic max-w-xl leading-relaxed">
              &ldquo;Tailored Umrah &amp; Hajj experiences with luxury stays in Makkah &amp; Madinah. Your journey of a lifetime deserves our undivided attention.&rdquo;
            </p>

            <div className="mt-12 flex flex-wrap gap-6">
              <button 
                onClick={() => handleApplyClick({ category: 'Umrah', price: 0, title: 'Custom Journey' })}
                className="px-10 py-4 bg-white text-black font-bold rounded-full text-xs uppercase tracking-[0.2em] hover:bg-amber-500 transition-all active:scale-95"
              >
                Book My Journey
              </button>
              <button 
                onClick={() => router.push('/packages')}
                className="px-10 py-4 bg-stone-900/80 backdrop-blur text-white border border-stone-700 font-bold rounded-full text-xs uppercase tracking-[0.2em] hover:bg-stone-800 transition-all active:scale-95"
              >
                Explore Packages
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 w-full max-w-5xl -translate-x-1/2 px-4 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-3xl bg-stone-900/95 backdrop-blur-xl p-4 md:p-5 border border-stone-800 shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-6 overflow-visible"
          >
            <div className="w-full md:flex-1 flex items-center gap-4 px-4 md:px-6 border-b md:border-b-0 md:border-r border-stone-800 pb-4 md:pb-0">
              <MapPin className="text-amber-500 h-5 w-5 flex-shrink-0" />
              <DestinationCombobox
                variant="hero"
                label="Destination"
                placeholder="Where to?"
                value={searchDestination}
                onChange={(v) => {
                  setSearchDestination(v);
                  setSelectedDestinationId(null);
                }}
                onSelect={(d) => {
                  setSelectedDestinationId(d._id);
                }}
              />
            </div>
            <div className="w-full md:flex-1 flex items-center gap-4 px-4 md:px-6 border-b md:border-b-0 md:border-r border-stone-800 pb-4 md:pb-0">
              <Calendar className="text-amber-500 h-5 w-5 flex-shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Travel Window</span>
                <select 
                  value={searchWindow}
                  onChange={(e) => setSearchWindow(e.target.value)}
                  className="text-sm font-medium focus:outline-none bg-transparent text-white w-full cursor-pointer"
                >
                  <option className="bg-stone-900 text-white" value="Next 30 Days">Next 30 Days</option>
                  <option className="bg-stone-900 text-white" value="Ramadan 2026">Ramadan 2026</option>
                  <option className="bg-stone-900 text-white" value="Hajj Season">Hajj Season</option>
                </select>
              </div>
            </div>
            <div className="w-full md:flex-1 flex items-center gap-4 px-4 md:px-6 pb-2 md:pb-0">
              <Users className="text-amber-500 h-5 w-5 flex-shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Group Size</span>
                <span className="text-sm font-medium text-white">Custom Journey</span>
              </div>
            </div>
            <button 
              onClick={() => {
                if (selectedDestinationId) {
                  router.push(`/destinations/${selectedDestinationId}`);
                  return;
                }
                router.push(`/packages?search=${encodeURIComponent(searchDestination)}`);
              }}
              className="w-full md:w-auto bg-amber-600 p-4 md:p-5 rounded-2xl text-black hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20 active:scale-95 flex items-center justify-center"
            >
              <Search className="h-6 w-6" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Premium Selections & Signature Journeys */}
      <section className="py-28 bg-[#091014] border-t border-stone-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-stone-900 pb-12">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.45em] text-amber-300 shadow-sm">
                Premium Selection
              </span>
              <h2 className="mt-6 text-5xl md:text-5xl font-serif font-black uppercase tracking-[0.05 em] text-white leading-tight">
                PREMIUM SELECTIONS
              </h2>
              <p className="mt-4 text-stone-400 text-sm uppercase tracking-[0.35em] font-medium leading-relaxed">
                Curated luxury journeys for spiritual seekers and world-class explorers.
              </p>
            </div>
            <div className="text-right">
              <Link 
                href="/packages"
                className="group flex flex-col items-end gap-2"
              >
                <div className="flex items-center gap-3 text-stone-200 hover:text-amber-400 transition-colors">
                  <span className="text-xs font-black uppercase tracking-[0.4em]">Signature Journeys</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                </div>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Exclusive Travel Designs</span>
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3 lg:h-[500px]">
            {loadingFeatured ? (
              [1, 2, 3].map((n) => (
                <div 
                  key={n} 
                  className="rounded-[2rem] bg-stone-900/30 animate-pulse border border-stone-800 h-[460px] lg:h-full"
                ></div>
              ))
            ) : featured.length === 0 ? (
              <div className="md:col-span-3 text-center py-20 text-stone-500">
                No premium selections available at the moment.
              </div>
            ) : featured.map((pkg, idx) => {
              const total = featured.length;
              let gridClasses = "h-[460px] lg:h-full";
              if (total === 1) gridClasses += " md:col-span-3";
              else if (total === 2) {
                gridClasses += idx === 0 ? " md:col-span-2" : " md:col-span-1";
              }

              const isMain = total === 1;

              return (
                <motion.div 
                  key={pkg._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.7, ease: "easeOut" }}
                  className={`group relative overflow-hidden rounded-[2rem] border border-stone-800/60 bg-stone-950 hover:border-amber-500/50 shadow-2xl hover:shadow-[0_0_40px_-10px_rgba(251,191,36,0.3)] transition-all duration-500 ${gridClasses}`}
                >
                  <div className="absolute inset-0">
                    <Image width={800} height={800} src={pkg.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80'}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity duration-700"></div>
                  </div>

                  <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end z-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="inline-flex rounded-full bg-black/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-black/50">
                        {pkg.category}
                      </span>
                      <div className="flex flex-col items-end bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-amber-500 font-bold mb-0.5">Starting From</span>
                        <span className="text-white font-serif font-black text-xl md:text-2xl drop-shadow-md">{formatCurrency(pkg.price)}</span>
                      </div>
                    </div>

                    <div className="overflow-hidden transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      <h3 className={`font-serif font-black text-white mb-4 tracking-tight leading-none drop-shadow-xl ${isMain ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-3xl md:text-4xl'}`}>
                        {pkg.title}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-4 mb-6 opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-150">
                      <p className="text-stone-200 text-sm md:text-base font-medium flex items-center gap-3 bg-black/30 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                        <MapPin size={16} className="text-amber-500" />
                        {pkg.destinations?.join(', ') || 'Various Locations'}
                      </p>
                      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-50 text-xs uppercase tracking-[0.2em] font-semibold backdrop-blur-md">
                        Elevated service, curated accommodations, private transfers & expert local guides.
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyClick(pkg)}
                      className="w-full inline-flex items-center justify-between rounded-2xl bg-amber-500 px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-black shadow-xl shadow-amber-500/20 transition-all duration-500 hover:bg-amber-400 hover:shadow-amber-500/40 group-hover:translate-y-0 translate-y-4 opacity-90 group-hover:opacity-100"
                    >
                      <span>Reserve Your Journey</span> 
                      <div className="bg-black/10 rounded-full p-2 group-hover:translate-x-2 transition-transform duration-300">
                        <ArrowRight size={18} />
                      </div>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {isModalOpen && selectedPackage && (
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
                  Thank you for your interest in {selectedPackage.title}. Our team will review your application and contact you soon.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Apply for {selectedPackage.title}</h3>
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

                  <div className="bg-stone-800/50 p-4 rounded-xl mt-4">
                    <div className="flex justify-between text-stone-300 text-sm mb-2">
                      <span>Price per person</span>
                      <span>{formatCurrency(selectedPackage.price)}</span>
                    </div>
                    <div className="flex justify-between text-stone-300 text-sm mb-2">
                      <span>Passengers</span>
                      <span>{formData.numberOfPassengers}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold border-t border-stone-700 pt-2 mt-2">
                      <span>Total Estimated</span>
                      <span className="text-amber-500">{formatCurrency(selectedPackage.price * formData.numberOfPassengers)}</span>
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 mt-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-black font-bold rounded-xl transition-colors uppercase tracking-widest text-sm"
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

export default Home;