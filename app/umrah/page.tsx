"use client";

import { useState } from "react";
import BookingModal from "@/components/BookingModal";
import { CheckCircle, MapPin, Calendar, Users, Star } from "lucide-react";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib/utils";
import Image from 'next/image';

export default function UmrahPage() {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(1200);

  const packages = [
    {
      title: "Basic Umrah",
      duration: "7 Days",
      price: 350000,
      features: [
        "Hotel accommodation (3-star)",
        "Umrah visa processing",
        "Airport transfers",
        "Ziyarat to Madinah",
        "Basic meals",
      ],
    },
    {
      title: "Premium Umrah",
      duration: "10 Days",
      price: 500000,
      features: [
        "Hotel accommodation (4-star)",
        "Umrah visa processing",
        "Airport transfers",
        "Extended Ziyarat",
        "All meals included",
        "Tour guide",
      ],
    },
    {
      title: "Luxury Umrah",
      duration: "14 Days",
      price: 800000,
      features: [
        "5-star hotel near Haram",
        "Premium visa processing",
        "Private transfers",
        "Full guided tours",
        "All meals at premium restaurants",
        "24/7 concierge",
      ],
    },
  ];

  const handleBook = (price: number) => {
    setSelectedPrice(price);
    setShowBooking(true);
  };

  return (
    <div className="flex flex-col bg-stone-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full items-center justify-center overflow-hidden bg-stone-950 flex flex-col">
        <div className="absolute inset-0 z-0">
          <Image width={800} height={800} src="https://images.unsplash.com/photo-1591504791593-9c869fb13f38?auto=format&fit=crop&q=80" 
            alt="Umrah Journey" 
            className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/80"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block rounded px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase bg-amber-600 text-black mb-6">
              Divine Experience
            </span>
            <h1 className="text-5xl font-serif font-bold tracking-tight text-white sm:text-7xl mb-6">
              Umrah Packages
            </h1>
            <p className="text-xl text-stone-300 font-serif italic max-w-2xl mx-auto leading-relaxed">
              Spiritual journey to the holy cities with complete care and comfort
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-stone-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-32 relative z-20">
            {[
              { icon: MapPin, title: "Holy Cities Visit", desc: "Visit Makkah and Madinah with professional guides" },
              { icon: Calendar, title: "Flexible Dates", desc: "Choose dates that work best for your schedule" },
              { icon: Users, title: "Group Support", desc: "Travel with other pilgrims safely" }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-stone-900 border border-stone-800 p-8 rounded-3xl shadow-xl hover:border-amber-600/30 transition-colors"
              >
                <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                  <item.icon className="text-amber-500" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-stone-400">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Packages */}
          <div className="mt-32 mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-white mb-4">Our Premium Packages</h2>
              <p className="text-stone-400">Select the package that best fits your spiritual journey</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {packages.map((pkg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-stone-900 rounded-[2rem] overflow-hidden border border-stone-800 hover:border-amber-600/50 transition-all duration-300 relative group flex flex-col shadow-2xl"
                >
                  <div className="p-8 pb-0 flex-1">
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">{pkg.title}</h3>
                    <p className="text-amber-500 text-xs font-black uppercase tracking-widest mb-8 bg-amber-500/10 inline-block px-3 py-1 rounded-full">{pkg.duration}</p>
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-4xl font-bold text-white">{formatCurrency(pkg.price)}</span>
                      <span className="text-stone-500 text-sm font-medium">/ person</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
                          <span className="text-stone-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-8 pt-4 mt-auto">
                    <button
                      onClick={() => handleBook(pkg.price)}
                      className="w-full py-4 bg-stone-800 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors uppercase tracking-widest text-xs border border-stone-700 hover:border-amber-500 group-hover:bg-amber-600 group-hover:border-amber-500 group-hover:text-black shadow-lg shadow-black/20"
                    >
                      Select Package
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-10 md:p-16 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
            
            <h2 className="text-3xl font-serif font-bold text-white mb-10">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div>
                <h4 className="font-bold text-xl mb-6 text-amber-500 flex items-center gap-3">
                  <Star size={24} /> Premium Services
                </h4>
                <ul className="space-y-4 text-stone-300">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Visa assistance and processing</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Flight arrangements</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Hotel booking</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Airport transfers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xl mb-6 text-amber-500 flex items-center gap-3">
                  <Users size={24} /> Dedicated Support
                </h4>
                <ul className="space-y-4 text-stone-300">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> 24/7 customer support</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Professional guides</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Travel insurance</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Emergency assistance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showBooking && <BookingModal serviceType="Umrah" basePrice={selectedPrice} onClose={() => setShowBooking(false)} />}
    </div>
  );
}
