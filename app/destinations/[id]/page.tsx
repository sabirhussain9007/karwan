'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import JourneyApplicationModal from '@/components/JourneyApplicationModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load destination');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400 text-xl">Loading...</p>
      </motion.div>
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

  const destinationLabel = `${destination.name}, ${destination.country}`;

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="relative h-[60vh] w-full">
        <Image width={800} height={800} src={destination.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80'} 
          alt={destination.name}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        
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
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl transition-colors shadow-lg shadow-amber-900/20"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>

      <JourneyApplicationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageInfo={{
          title: destination.name,
          category: 'International Tours',
          price: 0,
          imageUrl: destination.imageUrl,
        }}
        quoteMode="destination"
        fixedDestination={destinationLabel}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
    </div>
  );
}

