"use client";

import {
  APP_FULL_NAME,
  APP_ADDRESS,
  APP_PHONE,
  APP_EMAIL,
} from "@/lib/constants";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 border-t border-stone-800 pt-16 pb-8 text-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-xl font-serif font-bold tracking-tight text-white uppercase">
              {APP_FULL_NAME}
            </h2>

            <p className="mt-4 text-xs text-stone-500 leading-relaxed">
              Premium travel experiences, Umrah & Hajj services, and worldwide
              tours for families and solo travelers.
            </p>

            <div className="mt-6 flex gap-4">
              <SocialIcon type="facebook" href="https://www.facebook.com/p/Pak-Karwan-E-Bilal-Travel-Tours-100063945407153/" />
              <SocialIcon type="instagram" />
              <SocialIcon type="twitter" />
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
              Services
            </h3>

            <ul className="mt-6 space-y-3 text-xs text-stone-500">
              <li><Link href="/umrah" className="hover:text-stone-300 transition-colors">Umrah</Link></li>
              <li><Link href="/hajj" className="hover:text-stone-300 transition-colors">Hajj</Link></li>
              <li><Link href="/international-tours" className="hover:text-stone-300 transition-colors">International Tours</Link></li>
              <li><Link href="/domestic-tours" className="hover:text-stone-300 transition-colors">Domestic Tours</Link></li>
              <li><Link href="/visa" className="hover:text-stone-300 transition-colors">Visa Services</Link></li>
              <li><Link href="/ticketing" className="hover:text-stone-300 transition-colors">Ticketing</Link></li>
              <li><Link href="/car-rental" className="hover:text-stone-300 transition-colors">Car Rental</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
              Contact
            </h3>

            <ul className="mt-6 space-y-4 text-xs text-stone-500">
              <li>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(APP_ADDRESS)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex gap-3 hover:text-amber-500 transition-colors"
                >
                  <IconMap />
                  <span>{APP_ADDRESS}</span>
                </a>
              </li>

              <li>
                <a 
                  href={`tel:${APP_PHONE.replace(/[^0-9+]/g, '')}`} 
                  className="flex gap-3 items-center hover:text-amber-500 transition-colors"
                >
                  <IconPhone />
                  <span>{APP_PHONE}</span>
                </a>
              </li>

              <li>
                <a 
                  href={`mailto:${APP_EMAIL}`} 
                  className="flex gap-3 items-center hover:text-amber-500 transition-colors"
                >
                  <IconMail />
                  <span>{APP_EMAIL}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
              Newsletter
            </h3>

            <p className="mt-6 text-xs text-stone-500">
              Get travel deals & updates directly in your inbox.
            </p>

            <form 
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                // Future newsletter signup logic
                alert("Newsletter signup coming soon!");
              }}
            >
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-3 text-xs focus:outline-none focus:border-amber-600"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-amber-500"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-stone-600 uppercase tracking-widest gap-3">
          <p>
            © {year} {APP_FULL_NAME}. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link href="#" className="hover:text-stone-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-stone-400 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-stone-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- ICONS (no lucide, server-safe SVGs) ---------------- */

function IconMap() {
  return (
    <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.2c1.2.4 2.4.7 3.6.7a1 1 0 011 1V20a1 1 0 01-1 1C10 21 3 14 3 5a1 1 0 011-1h3a1 1 0 011 1c0 1.2.2 2.4.6 3.6a1 1 0 01-.1 1l-2.3 2.2z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

/* Social */
function SocialIcon({ type, href }: { type: "facebook" | "instagram" | "twitter", href?: string }) {
  const icons = {
    facebook: (
      <path d="M22 12a10 10 0 10-11 10v-7H8v-3h3v-2c0-3 2-4 4-4h2v3h-2c-1 0-1 .5-1 1v2h3l-1 3h-2v7a10 10 0 009-10z" />
    ),
    instagram: (
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6-1a1 1 0 100 2 1 1 0 000-2z" />
    ),
    twitter: (
      <path d="M22 5.9c-.7.3-1.4.5-2.2.6a3.7 3.7 0 001.6-2.1 7.5 7.5 0 01-2.4.9 3.7 3.7 0 00-6.3 3.4A10.5 10.5 0 013 5a3.7 3.7 0 001.1 5 3.6 3.6 0 01-1.7-.5v.1a3.7 3.7 0 003 3.6 3.8 3.8 0 01-1.7.1 3.7 3.7 0 003.5 2.6A7.5 7.5 0 012 17.5 10.5 10.5 0 007.7 19c7 0 10.8-5.8 10.8-10.8v-.5c.8-.5 1.4-1.2 1.9-1.9z" />
    ),
  };

  return (
    <a
      href={href || "#"}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      className="rounded-lg bg-stone-800 p-2.5 border border-stone-700 hover:text-amber-500"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        {icons[type]}
      </svg>
    </a>
  );
}