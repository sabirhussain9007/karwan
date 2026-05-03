"use client";

import { useState } from "react";
import BookingModal from "@/components/BookingModal";
import { CheckCircle, Plane, Headphones, Briefcase, Star, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { formatCurrency } from "@/lib/utils";
import Image from 'next/image';

export default function TicketingPage() {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(300);

  const services = [
    {
      title: "Economy Class",
      duration: "Standard Travel",
      price: 85000,
      features: [
        "Best available rates",
        "Standard baggage allowance",
        "Basic seat selection",
        "24/7 Phone support",
      ],
    },
    {
      title: "Business Class",
      duration: "Premium Travel",
      price: 350000,
      features: [
        "Lounge access included",
        "Extra baggage allowance",
        "Priority boarding",
        "Premium meal selection",
      ],
    },
    {
      title: "Group Booking",
      duration: "10+ Passengers",
      price: 75000,
      features: [
        "Discounted group rates",
        "Dedicated group coordinator",
        "Flexible name changes",
        "Seating together guaranteed",
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
          <Image width={800} height={800} src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80" 
            alt="Ticketing Services" 
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
              Fly Anywhere
            </span>
            <h1 className="text-5xl font-serif font-bold tracking-tight text-white sm:text-7xl mb-6">
              Flight Ticketing
            </h1>
            <p className="text-xl text-stone-300 font-serif italic max-w-2xl mx-auto leading-relaxed">
              Find the best routes, the best prices, and the ultimate comfort for your journey
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-stone-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-32 relative z-20">
            {[
              { icon: Plane, title: "Global Airlines", desc: "Partnerships with major international airlines" },
              { icon: Ticket, title: "Best Fares", desc: "Competitive pricing and exclusive discounts" },
              { icon: Headphones, title: "24/7 Support", desc: "Dedicated support for rebooking and cancellations" }
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

          {/* Services */}
          <div className="mt-32 mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-white mb-4">Our Ticketing Classes</h2>
              <p className="text-stone-400">Choose the comfort level that suits your journey</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {services.map((pkg, idx) => (
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
                      <span className="text-stone-500 text-sm font-medium">starting / person</span>
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
                      Book Ticket
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showBooking && <BookingModal serviceType="Ticketing" basePrice={selectedPrice} onClose={() => setShowBooking(false)} />}
    </div>
  );
}
