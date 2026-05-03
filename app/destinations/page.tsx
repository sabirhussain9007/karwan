'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Users, Star } from 'lucide-react';
import Link from 'next/link';

interface Destination {
  _id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  colorGradient: string;
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await fetch('/api/destinations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDestinations(data);
      } else {
        setDestinations([]);
        console.error('Invalid destinations data:', data);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            Explore <span className="text-amber-500">Destinations</span>
          </h1>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto">
            Discover incredible places around the world, from holy pilgrimage sites to exotic leisure destinations.
          </p>
        </div>

        {/* Destinations Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-stone-400">Loading destinations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {destinations.map((dest, idx) => (
              <Link href={`/destinations/${dest._id}`} key={dest._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative overflow-hidden rounded-3xl h-96 cursor-pointer"
                >
                  <Image width={800} height={800} src={dest.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80'}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>

                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                      {dest.name}
                    </h3>
                    <div className="flex items-center gap-2 text-stone-300 mb-4">
                      <MapPin className="h-5 w-5 text-amber-600" />
                      <span>{dest.country}</span>
                    </div>
                    <p className="text-sm text-stone-300 line-clamp-2">
                      {dest.description}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {!loading && destinations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-400 text-lg">No destinations available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}