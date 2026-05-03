import React from 'react';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HajjPage() {
  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
            Sacred Journey
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
            Hajj <span className="text-amber-500">Services</span>
          </h1>
          <p className="text-xl text-stone-400 leading-relaxed mb-12">
            Fulfill your religious duty with complete peace of mind. Our Hajj packages are designed to provide maximum comfort, allowing you to focus entirely on your spiritual obligations.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <Star className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-white font-bold mb-2">Premium Camps</h3>
              <p className="text-sm text-stone-400">Comfortable, air-conditioned Mina and Arafat accommodations.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <Shield className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-white font-bold mb-2">Dedicated Support</h3>
              <p className="text-sm text-stone-400">24/7 on-ground assistance and medical support during the rituals.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
              <Clock className="h-8 w-8 text-amber-500 mb-4" />
              <h3 className="text-white font-bold mb-2">Logistics Mastered</h3>
              <p className="text-sm text-stone-400">Seamless transport between holy sites in VIP buses.</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-4">Registration Open Soon</h2>
              <p className="text-stone-400 mb-8 max-w-xl">
                We are finalizing our Hajj quotas and packages. Spaces are extremely limited. Please register your interest to get early access.
              </p>
              <div className="flex gap-4">
                <Link 
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-black font-bold rounded-xl hover:bg-amber-500 transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                >
                  Register Interest
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
