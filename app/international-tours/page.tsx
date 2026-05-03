import React from 'react';
import { ArrowRight, Globe, Map, Camera } from 'lucide-react';
import Link from 'next/link';

export default function InternationalToursPage() {
  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
            Explore The World
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
            International <span className="text-amber-500">Tours</span>
          </h1>
          <p className="text-xl text-stone-400 leading-relaxed mb-12">
            Discover breathtaking destinations across the globe with our meticulously planned international tour packages. From exotic beaches to historic cities.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <Globe className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-white font-bold mb-2">Global Destinations</h3>
              <p className="text-sm text-stone-400">Curated tours to top destinations in Europe, Asia, and the Americas.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <Map className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-white font-bold mb-2">Tailored Itineraries</h3>
              <p className="text-sm text-stone-400">Customized plans ensuring you see the best of every location.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <Camera className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-white font-bold mb-2">Unforgettable Memories</h3>
              <p className="text-sm text-stone-400">Experience local cultures, cuisines, and breathtaking sights.</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-4">New Tours Dropping Soon</h2>
              <p className="text-stone-400 mb-8 max-w-xl">
                We are adding exciting new international destinations to our catalog. Check back soon or browse our existing travel packages.
              </p>
              <div className="flex gap-4">
                <Link 
                  href="/packages?category=International"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-black font-bold rounded-xl hover:bg-amber-500 transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                >
                  Explore Packages
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
