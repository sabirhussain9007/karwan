'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Bell,
  Camera,
  Loader2,
  Pencil,
  Save,
  X,
  LayoutDashboard,
  MapPin,
  Calendar,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { useUserProfile } from '@/context/UserProfileContext';
import UserAvatar from '@/components/UserAvatar';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  loyaltyPoints?: number;
  createdAt: string;
  avatar?: string;
  bio?: string;
  travelPreferences?: string[];
  badges?: string[];
}

interface Application {
  _id: string;
  serviceType: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  appliedDate?: string;
  createdAt?: string;
  applicationData?: {
    specialRequests?: string;
  };
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedApplicationId?: string;
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const { avatar, refreshProfile } = useUserProfile();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'notifications'>('applications');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editForm, setEditForm] = useState({ name: '', bio: '', travelPreferences: '' });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [profileRes, appsRes, notifRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/applications'),
        fetch('/api/user/notifications'),
      ]);

      if (profileRes.ok) {
        const data: UserProfile = await profileRes.json();
        setProfile(data);
        setEditForm({
          name: data.name || '',
          bio: data.bio || '',
          travelPreferences: (data.travelPreferences || []).join(', '),
        });
      } else {
        setLoadError('Could not load your profile.');
      }

      if (appsRes.ok) {
        setApplications(await appsRes.json());
      }

      if (notifRes.ok) {
        setNotifications(await notifRes.json());
      }
    } catch {
      setLoadError('Something went wrong while loading your profile.');
    } finally {
      setLoading(false);
    }
  };

  const appStats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'Pending' || a.status === 'Under Review').length,
      approved: applications.filter((a) => a.status === 'Approved').length,
      rejected: applications.filter((a) => a.status === 'Rejected').length,
    };
  }, [applications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setSaveMessage({ type: 'error', text: 'Name is required' });
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          bio: editForm.bio,
          travelPreferences: editForm.travelPreferences,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save profile' });
        return;
      }

      setProfile(data);
      setEditing(false);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully' });
      await refreshProfile();
      setTimeout(() => setSaveMessage(null), 4000);
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 2MB');
      return;
    }

    setAvatarError('');
    setUploadingAvatar(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: reader.result }),
        });

        if (!res.ok) {
          const data = await res.json();
          setAvatarError(data.error || 'Failed to update photo');
          return;
        }

        const updated = await res.json();
        setProfile((prev) => (prev ? { ...prev, avatar: updated.avatar } : prev));
        await refreshProfile();
        setSaveMessage({ type: 'success', text: 'Profile photo updated' });
        setTimeout(() => setSaveMessage(null), 4000);
      } catch {
        setAvatarError('Failed to update photo');
      } finally {
        setUploadingAvatar(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const markNotificationRead = async (notif: Notification) => {
    if (notif.isRead) return;

    try {
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notif._id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
    } catch {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      console.error('Failed to mark all as read');
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'Approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatAppDate = (app: Application) => {
    const raw = app.appliedDate || app.createdAt;
    return raw ? new Date(raw).toLocaleDateString() : '—';
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-stone-400 text-lg">{loadError || 'Profile not found'}</p>
        <button
          onClick={fetchUserData}
          className="px-6 py-2 bg-amber-600 text-black font-bold rounded-xl hover:bg-amber-500"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">
            My <span className="text-amber-500">Profile</span>
          </h1>
          <p className="text-stone-400 text-lg">
            Update your details, track applications, and manage notifications.
          </p>
        </div>

        {saveMessage && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
              saveMessage.type === 'success'
                ? 'bg-green-500/10 border-green-500/40 text-green-400'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}
          >
            <span>{saveMessage.text}</span>
            <button type="button" onClick={() => setSaveMessage(null)} className="opacity-70 hover:opacity-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Applications', value: appStats.total, color: 'text-white' },
            { label: 'Pending', value: appStats.pending, color: 'text-amber-400' },
            { label: 'Approved', value: appStats.approved, color: 'text-green-400' },
            { label: 'Unread alerts', value: unreadCount, color: 'text-blue-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 text-center"
            >
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-stone-500 text-sm mt-1 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8">
              <div className="relative mx-auto mb-6 w-28 h-28 group">
                <UserAvatar
                  src={avatar || profile.avatar}
                  name={profile.name}
                  email={profile.email}
                  size="lg"
                  className="border-4 border-amber-500/30 w-28 h-28 text-4xl"
                />
                <label className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-medium">Change photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              {avatarError && (
                <p className="text-center text-sm text-red-400 mb-4">{avatarError}</p>
              )}

              {!editing ? (
                <>
                  <h2 className="text-2xl font-bold text-white text-center">{profile.name}</h2>
                  {profile.bio && (
                    <p className="text-stone-400 text-sm text-center mt-3 leading-relaxed">{profile.bio}</p>
                  )}
                  {profile.travelPreferences && profile.travelPreferences.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {profile.travelPreferences.map((pref) => (
                        <span
                          key={pref}
                          className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 border border-stone-700 text-stone-300 rounded-xl hover:border-amber-500/50 hover:text-amber-400 transition"
                  >
                    <Pencil className="w-4 h-4" /> Edit profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide">Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1 w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      maxLength={500}
                      rows={3}
                      placeholder="Tell us about your travel style..."
                      className="mt-1 w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide">
                      Travel preferences (comma separated)
                    </label>
                    <input
                      value={editForm.travelPreferences}
                      onChange={(e) => setEditForm({ ...editForm, travelPreferences: e.target.value })}
                      placeholder="Umrah, Family tours, Luxury"
                      className="mt-1 w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-600 text-black font-bold rounded-xl hover:bg-amber-500 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setEditForm({
                          name: profile.name,
                          bio: profile.bio || '',
                          travelPreferences: (profile.travelPreferences || []).join(', '),
                        });
                      }}
                      className="px-4 py-2.5 border border-stone-700 text-stone-400 rounded-xl hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-stone-300 bg-stone-950 p-3 rounded-xl text-sm">
                  <Mail className="text-amber-500 w-4 h-4 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center justify-between text-stone-300 bg-stone-950 p-3 rounded-xl text-sm">
                  <span className="flex items-center gap-2">
                    <Star className="text-amber-500 w-4 h-4" /> Loyalty points
                  </span>
                  <span className="font-bold text-amber-500">{profile.loyaltyPoints || 0}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-300 bg-stone-950 p-3 rounded-xl text-sm">
                  <Calendar className="text-amber-500 w-4 h-4 shrink-0" />
                  <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                {profile.badges && profile.badges.length > 0 && (
                  <div className="flex items-start gap-3 text-stone-300 bg-stone-950 p-3 rounded-xl text-sm">
                    <Award className="text-amber-500 w-4 h-4 shrink-0 mt-0.5" />
                    <span>{profile.badges.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-2">
                <Link
                  href="/user-dashboard"
                  className="flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-xl transition"
                >
                  <LayoutDashboard className="w-4 h-4" /> My dashboard
                </Link>
                <Link
                  href="/packages"
                  className="flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-xl transition"
                >
                  <MapPin className="w-4 h-4" /> Browse packages
                </Link>
                {profile.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-black text-sm font-bold rounded-xl transition"
                  >
                    Admin dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Main panel */}
          <div className="lg:col-span-2">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  {activeTab === 'applications' ? (
                    <FileText className="text-amber-500" />
                  ) : (
                    <Bell className="text-amber-500" />
                  )}
                  {activeTab === 'applications' ? 'My applications' : 'Notifications'}
                </h3>

                <div className="flex items-center gap-2">
                  {activeTab === 'notifications' && unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs px-3 py-2 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/10"
                    >
                      Mark all read
                    </button>
                  )}
                  <div className="flex bg-stone-950 rounded-xl p-1 border border-stone-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab('applications')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        activeTab === 'applications'
                          ? 'bg-amber-600 text-black'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Applications
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('notifications')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                        activeTab === 'notifications'
                          ? 'bg-amber-600 text-black'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Notifications
                      {unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === 'applications' ? (
                applications.length === 0 ? (
                  <div className="text-center py-16 bg-stone-950 rounded-2xl border border-stone-800 border-dashed">
                    <FileText className="text-stone-600 w-12 h-12 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">No applications yet</h4>
                    <p className="text-stone-400 mb-6">Start by exploring our travel services.</p>
                    <Link
                      href="/packages"
                      className="inline-flex px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl"
                    >
                      View packages
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app._id}
                        id={`application-${app._id}`}
                        className="bg-stone-950 border border-stone-800 rounded-2xl p-5 hover:border-stone-600 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h4 className="font-bold text-lg text-white">{app.serviceType}</h4>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(app.status)}`}
                              >
                                {getStatusIcon(app.status)}
                                {app.status}
                              </span>
                            </div>
                            <p className="text-sm text-stone-500">
                              Applied {formatAppDate(app)}
                            </p>
                          </div>
                          <div className="md:text-right">
                            <p className="text-sm text-stone-500">Total</p>
                            <p className="text-xl font-bold text-white">PKR {app.totalAmount.toLocaleString()}</p>
                            <p className="text-xs text-stone-500 mt-1">Payment: {app.paymentStatus}</p>
                          </div>
                        </div>
                        {app.applicationData?.specialRequests && (
                          <p className="mt-4 pt-4 border-t border-stone-800 text-sm text-stone-400">
                            <span className="text-stone-300 font-medium">Notes: </span>
                            {app.applicationData.specialRequests}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : notifications.length === 0 ? (
                <div className="text-center py-16 bg-stone-950 rounded-2xl border border-stone-800 border-dashed">
                  <Bell className="text-stone-600 w-12 h-12 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">All caught up</h4>
                  <p className="text-stone-400">No notifications right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <button
                      key={notif._id}
                      type="button"
                      onClick={() => {
                        markNotificationRead(notif);
                        if (notif.relatedApplicationId) {
                          setActiveTab('applications');
                          setTimeout(() => {
                            document
                              .getElementById(`application-${notif.relatedApplicationId}`)
                              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 150);
                        }
                      }}
                      className={`w-full text-left bg-stone-950 border rounded-2xl p-5 transition-colors relative overflow-hidden ${
                        !notif.isRead
                          ? 'border-amber-600/50'
                          : 'border-stone-800 hover:border-stone-600'
                      }`}
                    >
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                      )}
                      <h4
                        className={`text-base font-bold mb-1 ${
                          notif.type === 'error'
                            ? 'text-red-400'
                            : notif.type === 'success'
                              ? 'text-green-400'
                              : notif.type === 'warning'
                                ? 'text-amber-400'
                                : 'text-blue-400'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <p className="text-stone-300 text-sm leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-stone-500 mt-3">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
