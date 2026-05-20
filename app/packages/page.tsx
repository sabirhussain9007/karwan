'use client';

import Image from 'next/image';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Users, Star, ArrowRight, Filter, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import BookingModal from '@/components/BookingModal';

interface Package {
  _id: string;
  title: string;
  description: string;
  destinations: string[];
  price: number;
  salePrice?: number;
  durationDays: number;
  imageUrl: string;
  category: string;
  ratingsInfo: {
    averageRating: number;
    totalReviews: number;
  };
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  useEffect(() => {
    fetchPackages();
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const search = searchParams.get('search');
      const category = searchParams.get('category');
      if (search) setSearchTerm(search);
      if (category) setSelectedCategory(category);
    }
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPackages(data);
      } else {
        setPackages([]);
        console.error('Invalid packages data:', data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pkg.destinations && pkg.destinations.join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'Umrah', 'Hajj', 'International Tours', 'Domestic Tours'];

  return (
    <div className="min-h-screen bg-stone-950 pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            Our <span className="text-amber-500">Packages</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-2xl">
            Choose from our carefully curated travel packages designed for unforgettable experiences.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-600"
              />
            </div>
            <button className="px-6 py-3 bg-amber-600 text-black font-bold rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-semibold text-sm uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-black'
                    : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-amber-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-stone-400">Loading packages...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredPackages.map((pkg, idx) => (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group overflow-hidden rounded-3xl bg-stone-900 border border-stone-800 hover:border-amber-600/50 transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image width={800} height={800} src={pkg.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80'}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-amber-600 text-black text-xs font-bold uppercase rounded-full">
                      {pkg.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                    {pkg.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-stone-400 mb-4">
                    <MapPin className="h-4 w-4 text-amber-600" />
                    {pkg.destinations?.join(', ') || 'Various Locations'}
                  </div>

                  <p className="text-sm text-stone-400 mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="flex gap-4 mb-6 pb-6 border-b border-stone-800">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-amber-600" />
                      <span className="text-stone-400">{pkg.durationDays} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                      <span className="text-stone-400">{pkg.ratingsInfo.averageRating}/5</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {pkg.salePrice ? (
                        pkg.salePrice > 0 && (
                          <p className="text-xs text-stone-600 line-through">
                            {formatCurrency(pkg.price)}
                          </p>
                        )
                      ) : null}
                      <p className="text-2xl font-bold text-amber-500">
                        {formatCurrency(pkg.salePrice && pkg.salePrice > 0 ? pkg.salePrice : pkg.price)}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowBooking(true);
                      }}
                      className="h-12 w-12 rounded-xl bg-amber-600 text-black hover:bg-amber-500 transition-all flex items-center justify-center shadow-lg"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredPackages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-400 text-lg">No packages found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {showBooking && selectedPackage && (
        <BookingModal 
          serviceType={selectedPackage.category} 
          packageTitle={selectedPackage.title}
          imageUrl={selectedPackage.imageUrl}
          basePrice={selectedPackage.salePrice && selectedPackage.salePrice > 0 ? selectedPackage.salePrice : selectedPackage.price} 
          onClose={() => setShowBooking(false)} 
        />
      )}
    </div>
  );
}
