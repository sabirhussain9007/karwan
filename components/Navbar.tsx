'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = (session?.user as any)?.role === "admin";

  useEffect(() => {
    if (user) {
      fetch('/api/user/notifications')
        .then(res => res.json())
        .then(data => {
          if(Array.isArray(data)) setNotifications(data);
        })
        .catch(console.error);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-800 bg-stone-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-amber-600 font-serif text-2xl font-bold text-black transition-transform group-hover:rotate-12">
            B
          </div>

          <div>
            <h1 className="text-lg font-serif font-bold text-white leading-none capitalize">
              {APP_NAME}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500 mt-1">
              Travel & Tours • Premium Service
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-widest font-medium text-stone-400">
          <Link className="hover:text-amber-500" href="/packages">
            Packages
          </Link>
          
          <Link className="hover:text-amber-500" href="/destinations">
            Destinations
          </Link>
          
          <div className="relative group py-6">
            <button className="flex items-center gap-1 hover:text-amber-500 whitespace-nowrap uppercase tracking-widest font-medium">
              Services
              <ChevronDownIcon />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full w-56 rounded-2xl border border-stone-800 bg-stone-900/95 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-md shadow-2xl translate-y-2 group-hover:translate-y-0">
              <div className="flex flex-col gap-1">
                <Link className="block rounded-xl px-4 py-3 hover:bg-stone-800 hover:text-amber-500 transition-colors" href="/umrah">Umrah</Link>
                <Link className="block rounded-xl px-4 py-3 hover:bg-stone-800 hover:text-amber-500 transition-colors" href="/hajj">Hajj</Link>
                <Link className="block rounded-xl px-4 py-3 hover:bg-stone-800 hover:text-amber-500 transition-colors" href="/international-tours">International Tours</Link>
                <Link className="block rounded-xl px-4 py-3 hover:bg-stone-800 hover:text-amber-500 transition-colors" href="/domestic-tours">Domestic Tours</Link>
                <Link className="block rounded-xl px-4 py-3 hover:bg-stone-800 hover:text-amber-500 transition-colors" href="/visa">Visa Services</Link>
                <Link className="block rounded-xl px-4 py-3 hover:bg-stone-800 hover:text-amber-500 transition-colors" href="/ticketing">Ticketing</Link>
                <Link className="block rounded-xl px-4 py-3 hover:bg-stone-800 hover:text-amber-500 transition-colors" href="/car-rental">Car Rental</Link>
              </div>
            </div>
          </div>

          <Link className="hover:text-amber-500" href="/community">
            Community
          </Link>
          <Link className="hover:text-amber-500" href="/assistant">
            AI Assistant
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 font-bold text-amber-600 hover:text-amber-500"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-full p-2 text-stone-500 hover:bg-stone-800 hover:text-stone-200 transition"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-stone-900" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-900/95 backdrop-blur">
                      <h3 className="text-white font-bold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-stone-500 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif._id);
                            }}
                            className={`p-4 border-b border-stone-800 cursor-pointer transition hover:bg-stone-800 ${notif.isRead ? 'opacity-60' : 'bg-stone-800/30'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm font-bold ${notif.type === 'error' ? 'text-red-400' : notif.type === 'success' ? 'text-green-400' : 'text-amber-400'}`}>
                                {notif.title}
                              </h4>
                              {!notif.isRead && <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0 mt-1" />}
                            </div>
                            <p className="text-xs text-stone-400 mt-1 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-stone-600 mt-2 uppercase tracking-wider">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-stone-800 bg-stone-900">
                      <Link href="/profile" onClick={() => setShowNotifications(false)} className="block w-full text-center text-xs text-stone-400 hover:text-white py-2 transition">
                        View All in Profile
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                <button className="flex items-center gap-3 rounded-full border border-stone-800 p-1 pr-4 bg-stone-800/50 hover:bg-stone-800 transition">
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-amber-600/30 bg-amber-600 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">
                      {user.name?.split(" ")[0] || user.email?.split("@")[0]}
                    </p>
                    <p className="text-[9px] text-stone-500 uppercase">
                      Member
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full w-48 rounded-xl border border-stone-800 bg-stone-900/95 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-md shadow-2xl translate-y-2 group-hover:translate-y-0 mt-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-sm text-stone-300 hover:bg-stone-800 hover:text-amber-500 rounded-t-xl transition"
                  >
                    My Profile
                  </Link>
                  <button
                   onClick={() =>
  signOut({
    callbackUrl: `${window.location.origin}/`,
  })
}
                    className="w-full text-left px-4 py-3 text-sm text-stone-300 hover:bg-stone-800 hover:text-red-500 rounded-b-xl transition border-t border-stone-800"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="px-8 py-2.5 bg-white text-black font-bold rounded-full text-xs uppercase tracking-widest hover:bg-amber-500"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-stone-400"
        >
          {isOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden bg-stone-900 border-b border-stone-800 overflow-hidden transition-all",
          isOpen ? "max-h[500px]" : "max-h-0"
        )}
      >
        <div className="px-4 pb-6 pt-4 space-y-2 text-xs uppercase tracking-[0.2em] font-bold">
          <MobileLink href="/packages">Packages</MobileLink>
          <MobileLink href="/destinations">Destinations</MobileLink>
          
          <div className="py-2">
            <div className="px-4 py-2 text-amber-500">Services</div>
            <div className="pl-4 mt-2 space-y-1 border-l-2 border-stone-800 ml-6">
              <MobileLink href="/umrah" className="py-2 text-[10px]">Umrah</MobileLink>
              <MobileLink href="/hajj" className="py-2 text-[10px]">Hajj</MobileLink>
              <MobileLink href="/international-tours" className="py-2 text-[10px]">International Tours</MobileLink>
              <MobileLink href="/domestic-tours" className="py-2 text-[10px]">Domestic Tours</MobileLink>
              <MobileLink href="/visa" className="py-2 text-[10px]">Visa Services</MobileLink>
              <MobileLink href="/ticketing" className="py-2 text-[10px]">Ticketing</MobileLink>
              <MobileLink href="/car-rental" className="py-2 text-[10px]">Car Rental</MobileLink>
            </div>
          </div>

          <MobileLink href="/community">Community</MobileLink>
          <MobileLink href="/assistant">AI Assistant</MobileLink>

          {isAdmin && (
            <MobileLink href="/admin" className="text-amber-500">
              Admin Panel
            </MobileLink>
          )}

          <div className="h-px bg-stone-800 my-4" />

          {user ? (
            <>
              <MobileLink href="/profile">My Profile</MobileLink>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left block rounded-xl px-4 py-3 text-stone-400 hover:bg-stone-800 hover:text-red-500 transition text-xs uppercase tracking-[0.2em] font-bold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <MobileLink href="/login" className="text-amber-600">
              Sign In
            </MobileLink>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ---------------- ICONS ---------------- */

function MenuIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 24a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v7l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

/* ---------------- MOBILE LINK ---------------- */

function MobileLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl px-4 py-3 text-stone-400 hover:bg-stone-800 hover:text-white transition",
        className
      )}
    >
      {children}
    </Link>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}