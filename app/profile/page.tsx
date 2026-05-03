'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Star, Clock, CheckCircle2, XCircle, FileText, Bell } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  loyaltyPoints?: number;
  createdAt: string;
}

interface Application {
  _id: string;
  serviceType: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  appliedDate: string;
  applicationData?: {
    specialRequests?: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'notifications'>('applications');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const [profileRes, appsRes, notifRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/applications'),
        fetch('/api/user/notifications')
      ]);

      if (profileRes.ok) {
        setProfile(await profileRes.json());
      }
      
      if (appsRes.ok) {
        setApplications(await appsRes.json());
      }

      if (notifRes.ok) {
        setNotifications(await notifRes.json());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Approved': return <CheckCircle2 className="text-green-500 w-5 h-5" />;
      case 'Rejected': return <XCircle className="text-red-500 w-5 h-5" />;
      default: return <Clock className="text-amber-500 w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400 text-xl">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            My <span className="text-amber-500">Profile</span>
          </h1>
          <p className="text-stone-400 text-lg">Manage your details and track your travel applications.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Details Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-8"
            >
              <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-500/20">
                <UserIcon className="text-amber-500 w-12 h-12" />
              </div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-6">{profile?.name}</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-stone-300 bg-stone-950 p-4 rounded-xl">
                  <Mail className="text-amber-500 w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{profile?.email}</span>
                </div>
                
                <div className="flex items-center justify-between text-stone-300 bg-stone-950 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Star className="text-amber-500 w-5 h-5" />
                    <span>Loyalty Points</span>
                  </div>
                  <span className="font-bold text-amber-500 text-xl">{profile?.loyaltyPoints || 0}</span>
                </div>

                <div className="flex items-center justify-between text-stone-300 bg-stone-950 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <UserIcon className="text-amber-500 w-5 h-5" />
                    <span>Role</span>
                  </div>
                  <span className="capitalize">{profile?.role}</span>
                </div>
              </div>

              {profile?.role === 'admin' && (
                <Link 
                  href="/admin"
                  className="mt-6 block text-center w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
            </motion.div>
          </div>

          {/* Applications Area */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-8 h-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  {activeTab === 'applications' ? <FileText className="text-amber-500" /> : <Bell className="text-amber-500" />}
                  {activeTab === 'applications' ? 'My Applications' : 'Notifications'}
                </h3>
                
                <div className="flex bg-stone-950 rounded-xl p-1 border border-stone-800">
                  <button 
                    onClick={() => setActiveTab('applications')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'applications' ? 'bg-amber-600 text-black' : 'text-stone-400 hover:text-white'}`}
                  >
                    Applications
                  </button>
                  <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'notifications' ? 'bg-amber-600 text-black' : 'text-stone-400 hover:text-white'}`}
                  >
                    Notifications
                    {notifications.some(n => !n.isRead) && (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </button>
                </div>
              </div>

              {activeTab === 'applications' ? (
                applications.length === 0 ? (
                  <div className="text-center py-16 bg-stone-950 rounded-2xl border border-stone-800 border-dashed">
                    <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-stone-500 w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">No applications yet</h4>
                    <p className="text-stone-400 mb-6">You haven't applied for any tours or destinations.</p>
                    <Link 
                      href="/destinations"
                      className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors"
                    >
                      Explore Destinations
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div 
                        key={app._id}
                        className="bg-stone-950 border border-stone-800 rounded-2xl p-6 hover:border-stone-700 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-lg text-white">{app.serviceType}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            </div>
                            <p className="text-sm text-stone-400">
                              Applied on: {new Date(app.appliedDate).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="text-left md:text-right">
                            <p className="text-sm text-stone-400 mb-1">Total Amount</p>
                            <p className="text-xl font-bold text-white">${app.totalAmount}</p>
                            <p className="text-xs text-stone-500 mt-1">Payment: {app.paymentStatus}</p>
                          </div>
                        </div>
                        
                        {app.applicationData?.specialRequests && (
                          <div className="mt-4 pt-4 border-t border-stone-800">
                            <p className="text-sm text-stone-500">
                              <span className="font-medium text-stone-300">Requests/Details:</span> {app.applicationData.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16 bg-stone-950 rounded-2xl border border-stone-800 border-dashed">
                      <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-stone-500 w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">You're all caught up!</h4>
                      <p className="text-stone-400">There are no new notifications to display.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id}
                        className={`bg-stone-950 border border-stone-800 rounded-2xl p-6 transition-colors relative overflow-hidden ${!notif.isRead ? 'border-amber-600/50' : 'hover:border-stone-700'}`}
                      >
                        {!notif.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                        )}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className={`text-lg font-bold mb-1 ${notif.type === 'error' ? 'text-red-400' : notif.type === 'success' ? 'text-green-400' : notif.type === 'warning' ? 'text-amber-500' : 'text-blue-400'}`}>
                              {notif.title}
                            </h4>
                            <p className="text-stone-300 leading-relaxed">{notif.message}</p>
                            <p className="text-xs text-stone-500 mt-4 uppercase tracking-wider font-semibold">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
