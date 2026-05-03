import React from 'react';
import { ArrowRight, Mountain, Sun, Compass } from 'lucide-react';
import Link from 'next/link';

export default function DomesticToursPage() {
  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
            Local Adventures
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
            Domestic <span className="text-amber-500">Tours</span>
          </h1>
          <p className="text-xl text-stone-400 leading-relaxed mb-12">
            Explore the hidden gems and spectacular landscapes of your own country. From majestic mountains to serene valleys, our domestic tours offer unforgettable local adventures.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <Mountain className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-white font-bold mb-2">Mountain Retreats</h3>
              <p className="text-sm text-stone-400">Discover the breathtaking beauty of northern valleys and peaks.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <Sun className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-white font-bold mb-2">Heritage Sites</h3>
              <p className="text-sm text-stone-400">Step back in time with guided tours to historical landmarks.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <Compass className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-white font-bold mb-2">Custom Trips</h3>
              <p className="text-sm text-stone-400">Flexible itineraries for families, couples, and solo travelers.</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-4">Upcoming Trips</h2>
              <p className="text-stone-400 mb-8 max-w-xl">
                We are curating new domestic experiences for the upcoming season. Browse our current domestic offerings in the packages section.
              </p>
              <div className="flex gap-4">
                <Link 
                  href="/packages?category=Domestic"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-black font-bold rounded-xl hover:bg-amber-500 transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                >
                  View Packages
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
