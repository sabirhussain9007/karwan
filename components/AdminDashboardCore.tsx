"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, Edit3, Plus, X, MapPin, Package as PackageIcon, Users2, CheckCircle2, XCircle, Clock, Zap, Image as ImageIcon, LayoutDashboard } from "lucide-react";
import Image from 'next/image';



type ServiceType = 'Umrah' | 'Hajj' | 'International Tours' | 'Domestic Tours' | 'Visa Services' | 'Ticketing' | 'Car Rental';

type Destination = {
  _id: string;
  name: string;
  country: string;
  description: string;
  imageUrl?: string;
  colorGradient?: string;
};

type Package = {
  _id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  durationDays: number;
  destinations: string[];
  category?: string;
  imageUrl?: string;
  isFeatured?: boolean;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  loyaltyPoints?: number;
};

type Application = {
  _id: string;
  userId: { _id: string; name: string; email: string };
  serviceType: ServiceType;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';
  totalAmount: number;
  appliedDate: string;
  applicationData?: {
    fullName: string;
    email: string;
    phone: string;
    numberOfPassengers: number;
    travelDate?: string;
    specialRequests?: string;
  };
};

const SERVICE_TYPES: ServiceType[] = ['Umrah', 'Hajj', 'International Tours', 'Domestic Tours', 'Visa Services', 'Ticketing', 'Car Rental'];

export default function AdminDashboardCore({ initialTab = "applications" }: { initialTab?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"destinations" | "packages" | "users" | "applications" | ServiceType>(initialTab as any);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  // Form states
  const [destForm, setDestForm] = useState({ name: "", country: "", description: "", imageUrl: "", colorGradient: "" });
  const [pkgForm, setPkgForm] = useState({
    title: "",
    description: "",
    price: 0,
    salePrice: 0,
    durationDays: 0,
    destinations: "",
    category: "Tour",
    imageUrl: "",
    isFeatured: false,
  });
  const [userForm, setUserForm] = useState({ role: "user" });
  const [applicationFilter, setApplicationFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');

  const [destErrors, setDestErrors] = useState<{name?: string, country?: string, description?: string, imageUrl?: string}>({});
  const [pkgErrors, setPkgErrors] = useState<{title?: string, description?: string, price?: string, salePrice?: string, durationDays?: string, destinations?: string, imageUrl?: string}>({});

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "destinations") fetchDestinations();
    else if (activeTab === "packages") fetchPackages();
    else if (activeTab === "users") fetchUsers();
    else if (activeTab === "applications") fetchApplications();
    else if (SERVICE_TYPES.includes(activeTab as ServiceType)) {
      fetchApplications(activeTab as ServiceType);
    }
  }, [activeTab]);

  // Filter applications based on service type and status
  useEffect(() => {
    let filtered = applications;
    if (activeTab !== "applications" && SERVICE_TYPES.includes(activeTab as ServiceType)) {
      filtered = applications.filter(app => app.serviceType === activeTab);
    }
    if (applicationFilter !== 'All') {
      filtered = filtered.filter(app => app.status === applicationFilter);
    }
    setFilteredApplications(filtered);

    // After filtering and setting applications, scroll to the specific application if a hash is present
    if (window.location.hash && window.location.hash.startsWith('#application-')) {
      setTimeout(() => {
        document.getElementById(window.location.hash.substring(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [applications, applicationFilter, activeTab]);

  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/destinations");
      if (!res.ok) throw new Error("Failed to fetch destinations");
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching destinations");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/packages");
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();
      setPackages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching packages");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (serviceType?: ServiceType) => {
    setLoading(true);
    setError(null);
    try {
      const query = serviceType ? `?serviceType=${serviceType}` : '';
      const res = await fetch(`/api/admin/applications${query}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (appId: string) => {
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed to approve application");
      setSuccessMsg("Application approved successfully");
      fetchApplications();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error approving application");
    }
  };

  const handleRejectApplication = async (appId: string, reason: string) => {
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, action: "reject", reason }),
      });
      if (!res.ok) throw new Error("Failed to reject application");
      setSuccessMsg("Application rejected");
      fetchApplications();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error rejecting application");
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/applications?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove booking request");
      setSuccessMsg("Booking request removed. Related alerts were cleared for the user.");
      fetchApplications();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing booking request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  // Destination handlers
  const handleDestImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDestForm({ ...destForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePkgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPkgForm({ ...pkgForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateDestForm = () => {
    const errors: any = {};
    let isValid = true;
    if (!destForm.name.trim()) { errors.name = "Name is required"; isValid = false; }
    if (!destForm.country.trim()) { errors.country = "Country is required"; isValid = false; }
    if (!destForm.description.trim()) { errors.description = "Description is required"; isValid = false; }
    if (destForm.imageUrl && !/^(https?:\/\/|data:image\/)/.test(destForm.imageUrl)) { errors.imageUrl = "Valid URL or Data URI required"; isValid = false; }
    setDestErrors(errors);
    return isValid;
  };

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDestForm()) return;
    try {
      const res = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(destForm),
      });
      if (!res.ok) throw new Error("Failed to add destination");
      setDestForm({ name: "", country: "", description: "", imageUrl: "", colorGradient: "" });
      setShowModal(false);
      setSuccessMsg("Destination added successfully");
      fetchDestinations();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding destination");
    }
  };

  const handleUpdateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!validateDestForm()) return;
    try {
      const res = await fetch("/api/admin/destinations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...destForm }),
      });
      if (!res.ok) throw new Error("Failed to update destination");
      setDestForm({ name: "", country: "", description: "", imageUrl: "", colorGradient: "" });
      setEditingId(null);
      setShowModal(false);
      setSuccessMsg("Destination updated successfully");
      fetchDestinations();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating destination");
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    try {
      const res = await fetch(`/api/admin/destinations?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete destination");
      fetchDestinations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting destination");
    }
  };

  const handleEditDestination = (dest: Destination) => {
    setDestForm({
      name: dest.name,
      country: dest.country,
      description: dest.description,
      imageUrl: dest.imageUrl || "",
      colorGradient: dest.colorGradient || "",
    });
    setEditingId(dest._id);
  };

  // Package handlers
  const validatePkgForm = () => {
    const errors: any = {};
    let isValid = true;
    if (!pkgForm.title.trim()) { errors.title = "Title is required"; isValid = false; }
    if (!pkgForm.description.trim()) { errors.description = "Description is required"; isValid = false; }
    if (pkgForm.price < 0) { errors.price = "Price must be >= 0"; isValid = false; }
    if (pkgForm.salePrice < 0) { errors.salePrice = "Sale Price must be >= 0"; isValid = false; }
    if (pkgForm.durationDays <= 0) { errors.durationDays = "Duration must be > 0"; isValid = false; }
    if (!pkgForm.destinations.trim()) { errors.destinations = "Destinations are required"; isValid = false; }
    if (pkgForm.imageUrl && !/^(https?:\/\/|data:image\/)/.test(pkgForm.imageUrl)) { errors.imageUrl = "Valid URL or Data URI required"; isValid = false; }
    setPkgErrors(errors);
    return isValid;
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePkgForm()) return;
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pkgForm,
          destinations: pkgForm.destinations.split(",").map((d) => d.trim()),
          price: Number(pkgForm.price),
          salePrice: Number(pkgForm.salePrice),
          durationDays: Number(pkgForm.durationDays),
        }),
      });
      if (!res.ok) throw new Error("Failed to add package");
      setPkgForm({ title: "", description: "", price: 0, salePrice: 0, durationDays: 0, destinations: "", category: "Tour", imageUrl: "", isFeatured: false });
      setShowModal(false);
      setSuccessMsg("Package added successfully");
      fetchPackages();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding package");
    }
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    if (!validatePkgForm()) return;
    try {
      const res = await fetch("/api/admin/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          ...pkgForm,
          destinations: pkgForm.destinations.split(",").map((d) => d.trim()),
          price: Number(pkgForm.price),
          salePrice: Number(pkgForm.salePrice),
          durationDays: Number(pkgForm.durationDays),
        }),
      });
      if (!res.ok) throw new Error("Failed to update package");
      setPkgForm({ title: "", description: "", price: 0, salePrice: 0, durationDays: 0, destinations: "", category: "Tour", imageUrl: "", isFeatured: false });
      setEditingId(null);
      setShowModal(false);
      setSuccessMsg("Package updated successfully");
      fetchPackages();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating package");
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete package");
      fetchPackages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting package");
    }
  };

  const handleEditPackage = (pkg: Package) => {
    setPkgForm({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      salePrice: pkg.salePrice || 0,
      durationDays: pkg.durationDays,
      destinations: pkg.destinations.join(", "),
      category: pkg.category || "Tour",
      imageUrl: pkg.imageUrl || "",
      isFeatured: pkg.isFeatured || false,
    });
    setEditingId(pkg._id);
  };

  // User handlers
  const handleUpdateUserRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      setSuccessMsg("User role updated");
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting user");
    }
  };

  const getApplicationStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'Pending').length,
      approved: applications.filter(a => a.status === 'Approved').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
    };
  };

  const stats = getApplicationStats();

  if (status === "loading") return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-amber-500 to-orange-400 p-2 rounded-xl shadow-lg shadow-amber-500/20">
                <LayoutDashboard className="text-stone-950 h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Admin Console</h1>
                <p className="text-xs text-slate-400 font-medium">Manage operations</p>
              </div>
            </div>
            {session?.user && (
              <div className="flex items-center gap-3 bg-slate-900/50 p-2 pr-4 rounded-full border border-slate-700/50 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-stone-950 text-lg font-bold">
                  {session.user.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm leading-tight">{session.user.name || 'Admin User'}</span>
                  <span className="text-xs text-slate-400 leading-tight">{session.user.email}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Scrollable Tabs */}
          <div className="flex gap-2 pb-px overflow-x-auto no-scrollbar pt-2">
            {([
              { key: "applications" as const, label: "All Applications", icon: Zap },
              ...SERVICE_TYPES.map(service => ({ key: service, label: service, icon: PackageIcon })),
              { key: "packages" as const, label: "Packages", icon: PackageIcon },
              { key: "destinations" as const, label: "Destinations", icon: MapPin },
              { key: "users" as const, label: "Users", icon: Users2 },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setEditingId(null);
                  setError(null);
                  setSuccessMsg(null);
                  setShowModal(false);
                  setApplicationFilter('Pending');
                }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap text-sm border-b-2 ${
                  activeTab === key
                    ? "border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg"
                }`}
              >
                <Icon size={16} className={activeTab === key ? "text-amber-500" : "text-slate-500"} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 flex items-center justify-between backdrop-blur-sm">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-green-400 hover:text-green-300 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center justify-between backdrop-blur-sm">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Stats Cards for Applications */}
        {(activeTab === "applications" || SERVICE_TYPES.includes(activeTab as ServiceType)) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Zap className="text-blue-400" size={28} />
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Clock className="text-yellow-400" size={28} />
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Approved</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{stats.approved}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <CheckCircle2 className="text-green-400" size={28} />
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">{stats.rejected}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <XCircle className="text-red-400" size={28} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* Applications Tab */}
          {(activeTab === "applications" || SERVICE_TYPES.includes(activeTab as ServiceType)) && (
            <div>
              <div className="flex gap-2 mb-6 flex-wrap">
                {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setApplicationFilter(filter === 'All' ? 'All' : filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      applicationFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {filter} ({filter === 'All' ? stats.total : filter === 'Pending' ? stats.pending : filter === 'Approved' ? stats.approved : stats.rejected})
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-slate-400 text-center py-8">Loading applications...</div>
              ) : filteredApplications.length > 0 ? (
                <div className="space-y-4">
                  {filteredApplications.map((app) => (
                    <div
                      key={app._id}
                      id={`application-${app._id}`}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-blue-500 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-lg text-white">{app.userId?.name || 'Unknown User'}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-600/30">
                              {app.serviceType}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">
                            {app.userId?.email}
                            {app.applicationData?.phone && ` • ${app.applicationData.phone}`}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                            <div>Passengers: {app.applicationData?.numberOfPassengers || 1}</div>
                            <div>Amount: PKR {app.totalAmount}</div>
                            <div>Payment: {app.paymentStatus}</div>
                            <div>Applied: {new Date(app.appliedDate).toLocaleDateString()}</div>
                          </div>
                          {app.applicationData?.specialRequests && (
                            <p className="mt-3 text-slate-400 text-sm italic">Special Requests: {app.applicationData.specialRequests}</p>
                          )}
                        </div>
                        <div className="flex gap-2 md:flex-col">
                          {app.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproveApplication(app._id)}
                                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
                              >
                                <CheckCircle2 size={16} /> Approve
                              </button>
                              <button
                                onClick={() => setRejectingAppId(app._id)}
                                className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
                              >
                                <XCircle size={16} /> Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeletingAppId(app._id)}
                            className="flex items-center gap-1 px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition text-sm font-medium"
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center text-slate-400">
                  No applications found.
                </div>
              )}
            </div>
          )}

          {/* Destinations */}
          {activeTab === "destinations" && (
            <div>
              <button
                onClick={() => {
                  setEditingId(null);
                  setDestForm({ name: "", country: "", description: "", imageUrl: "", colorGradient: "" });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-6"
              >
                <Plus size={20} /> Add Destination
              </button>

              {loading ? (
                <div className="text-slate-400 text-center py-8">Loading...</div>
              ) : destinations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.map((dest) => (
                    <div
                      key={dest._id}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden hover:border-blue-500 transition"
                    >
                      {dest.imageUrl && (
                        <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                          <Image width={800} height={800} src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-lg text-white">{dest.name}</h3>
                          <p className="text-blue-400 text-sm">{dest.country}</p>
                        </div>
                        <p className="text-slate-300 text-sm line-clamp-2">{dest.description}</p>
                        <div className="flex gap-2 pt-3">
                          <button
                            onClick={() => {
                              handleEditDestination(dest);
                              setShowModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm"
                          >
                            <Edit3 size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDestination(dest._id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center text-slate-400">
                  No destinations yet. Create your first one!
                </div>
              )}
            </div>
          )}

          {/* Packages */}
          {activeTab === "packages" && (
            <div>
              <button
                onClick={() => {
                  setEditingId(null);
                  setPkgForm({
                    title: "",
                    description: "",
                    price: 0,
                    salePrice: 0,
                    durationDays: 0,
                    destinations: "",
                    category: "Tour",
                    imageUrl: "",
                    isFeatured: false,
                  });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-6"
              >
                <Plus size={20} /> Add Package
              </button>

              {loading ? (
                <div className="text-slate-400 text-center py-8">Loading...</div>
              ) : packages.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-blue-500 transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mb-4">
                        <div className="md:col-span-2">
                          <h3 className="font-bold text-lg text-white mb-1">{pkg.title}</h3>
                          <p className="text-slate-400 text-sm line-clamp-2">{pkg.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs mb-1">Price</p>
                          <div className="flex items-baseline gap-2 justify-end">
                            <span className="text-2xl font-bold text-green-400">PKR {pkg.price}</span>
                            {pkg.salePrice && (
                              <span className="text-slate-500 line-through text-sm">PKR {pkg.salePrice}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs mb-1">Duration</p>
                          <p className="text-lg font-semibold text-blue-400">{pkg.durationDays} days</p>
                        </div>
                      </div>

                      <div className="mb-4 pb-4 border-t border-slate-600 pt-4">
                        <p className="text-slate-400 text-sm mb-2">Destinations: {pkg.destinations.join(", ")}</p>
                        <span className="inline-block px-3 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full">
                          {pkg.category}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleEditPackage(pkg);
                            setShowModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm"
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center text-slate-400">
                  No packages yet. Create your first one!
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div>
              {loading ? (
                <div className="text-slate-400 text-center py-8">Loading...</div>
              ) : users.length > 0 ? (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800/50 border-b border-slate-600">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Role</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Points</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, idx) => (
                          <tr
                            key={user._id}
                            className={idx % 2 === 0 ? "bg-slate-700/30" : ""}
                          >
                            <td className="px-6 py-4 text-sm text-white font-medium">{user.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                            <td className="px-6 py-4 text-sm">
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  handleUpdateUserRole(user._id, e.target.value as "user" | "admin")
                                }
                                className="px-3 py-1 bg-slate-600 text-white rounded text-sm border border-slate-500 hover:border-blue-500 transition"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-sm text-amber-400 font-medium">
                              {user.loyaltyPoints || 0}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="flex items-center gap-1 px-3 py-2 bg-red-600/80 text-white rounded hover:bg-red-700 transition text-xs font-medium"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center text-slate-400">
                  No users found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Remove request confirmation */}
      {deletingAppId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trash2 className="text-amber-500" size={24} /> Remove booking request
              </h2>
              <button
                onClick={() => setDeletingAppId(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                This will remove the request from the dashboard, clear old alerts for this
                booking, and notify the customer that their request was closed. They can
                submit a new application later if needed.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingAppId(null)}
                  className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteApplication(deletingAppId);
                    setDeletingAppId(null);
                  }}
                  className="flex-1 px-4 py-3 bg-amber-600 text-black rounded-lg hover:bg-amber-500 transition font-medium"
                >
                  Remove request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingAppId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <XCircle className="text-red-500" size={24} /> Reject Application
              </h2>
              <button
                onClick={() => {
                  setRejectingAppId(null);
                  setRejectReason("");
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-300 text-sm">
                Please provide a reason for rejecting this application. This reason will be recorded and visible to the user.
              </p>
              <textarea
                placeholder="Enter rejection reason (required)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 focus:outline-none transition h-32"
                required
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingAppId(null);
                    setRejectReason("");
                  }}
                  className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (rejectReason.trim()) {
                      handleRejectApplication(rejectingAppId, rejectReason);
                      setRejectingAppId(null);
                      setRejectReason("");
                    }
                  }}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? "Edit" : "Add"} {activeTab === "destinations" ? "Destination" : activeTab === "packages" ? "Package" : ""}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={
                activeTab === "destinations"
                  ? editingId
                    ? handleUpdateDestination
                    : handleAddDestination
                  : editingId
                  ? handleUpdatePackage
                  : handleAddPackage
              }
              className="p-6 space-y-4"
            >
              {activeTab === "destinations" && (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="Destination name"
                      value={destForm.name}
                      onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-slate-700 border ${destErrors.name ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition`}
                    />
                    {destErrors.name && <p className="mt-1 text-xs text-red-500">{destErrors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Country"
                      value={destForm.country}
                      onChange={(e) => setDestForm({ ...destForm, country: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-slate-700 border ${destErrors.country ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition`}
                    />
                    {destErrors.country && <p className="mt-1 text-xs text-red-500">{destErrors.country}</p>}
                  </div>
                  <div>
                    <textarea
                      placeholder="Description"
                      value={destForm.description}
                      onChange={(e) => setDestForm({ ...destForm, description: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-700 border ${destErrors.description ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition h-24`}
                    />
                    {destErrors.description && <p className="mt-1 text-xs text-red-500">{destErrors.description}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Image URL"
                        value={destForm.imageUrl}
                        onChange={(e) => setDestForm({ ...destForm, imageUrl: e.target.value })}
                        className={`flex-1 px-4 py-3 bg-slate-700 border ${destErrors.imageUrl ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition`}
                      />
                    <div className="relative">
                      <input
                        type="file"
                        id="dest-image-upload"
                        accept="image/*"
                        onChange={handleDestImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="dest-image-upload"
                        className="flex items-center justify-center h-full px-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 hover:text-white cursor-pointer hover:border-blue-500 transition-all"
                        title="Upload Image"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </label>
                    </div>
                  </div>
                  {destErrors.imageUrl && <p className="mt-1 text-xs text-red-500">{destErrors.imageUrl}</p>}
                  </div>
                  {destForm.imageUrl && !destErrors.imageUrl && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-600">
                      <Image width={800} height={800} src={destForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setDestForm({ ...destForm, imageUrl: "" })}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeTab === "packages" && (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="Package title"
                      value={pkgForm.title}
                      onChange={(e) => setPkgForm({ ...pkgForm, title: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-slate-700 border ${pkgErrors.title ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition`}
                    />
                    {pkgErrors.title && <p className="mt-1 text-xs text-red-500">{pkgErrors.title}</p>}
                  </div>
                  <div>
                    <textarea
                      placeholder="Description"
                      value={pkgForm.description}
                      onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-slate-700 border ${pkgErrors.description ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition h-24`}
                    />
                    {pkgErrors.description && <p className="mt-1 text-xs text-red-500">{pkgErrors.description}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        placeholder="Price"
                        value={pkgForm.price}
                        onChange={(e) => setPkgForm({ ...pkgForm, price: parseFloat(e.target.value) })}
                        required
                        className={`w-full px-4 py-3 bg-slate-700 border ${pkgErrors.price ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition`}
                      />
                      {pkgErrors.price && <p className="mt-1 text-xs text-red-500">{pkgErrors.price}</p>}
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Sale Price"
                        value={pkgForm.salePrice}
                        onChange={(e) => setPkgForm({ ...pkgForm, salePrice: parseFloat(e.target.value) })}
                        className={`w-full px-4 py-3 bg-slate-700 border ${pkgErrors.salePrice ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition`}
                      />
                      {pkgErrors.salePrice && <p className="mt-1 text-xs text-red-500">{pkgErrors.salePrice}</p>}
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Duration (days)"
                        value={pkgForm.durationDays}
                        onChange={(e) => setPkgForm({ ...pkgForm, durationDays: parseInt(e.target.value) })}
                        required
                        className={`w-full px-4 py-3 bg-slate-700 border ${pkgErrors.durationDays ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition`}
                      />
                      {pkgErrors.durationDays && <p className="mt-1 text-xs text-red-500">{pkgErrors.durationDays}</p>}
                    </div>
                    <div>
                      <select
                        value={pkgForm.category}
                        onChange={(e) => setPkgForm({ ...pkgForm, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition"
                      >
                        <option>Tour</option>
                        <option>Accommodation</option>
                        <option>Car Rental</option>
                        <option>Umrah</option>
                        <option>Hajj</option>
                        <option>International Tours</option>
                        <option>Domestic Tours</option>
                        <option>Visa Services</option>
                        <option>Ticketing</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Destinations (comma separated)"
                      value={pkgForm.destinations}
                      onChange={(e) => setPkgForm({ ...pkgForm, destinations: e.target.value })}
                      required
                      className={`w-full px-4 py-3 bg-slate-700 border ${pkgErrors.destinations ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition`}
                    />
                    {pkgErrors.destinations && <p className="mt-1 text-xs text-red-500">{pkgErrors.destinations}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Image URL"
                        value={pkgForm.imageUrl}
                        onChange={(e) => setPkgForm({ ...pkgForm, imageUrl: e.target.value })}
                        className={`flex-1 px-4 py-3 bg-slate-700 border ${pkgErrors.imageUrl ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition`}
                      />
                    <div className="relative">
                      <input
                        type="file"
                        id="pkg-image-upload"
                        accept="image/*"
                        onChange={handlePkgImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="pkg-image-upload"
                        className="flex items-center justify-center h-full px-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 hover:text-white cursor-pointer hover:border-blue-500 transition-all"
                        title="Upload Image"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </label>
                    </div>
                  </div>
                  {pkgErrors.imageUrl && <p className="mt-1 text-xs text-red-500">{pkgErrors.imageUrl}</p>}
                  </div>
                  {pkgForm.imageUrl && !pkgErrors.imageUrl && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-600">
                      <Image width={800} height={800} src={pkgForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPkgForm({ ...pkgForm, imageUrl: "" })}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={pkgForm.isFeatured}
                      onChange={(e) => setPkgForm({ ...pkgForm, isFeatured: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-700"
                    />
                    <span className="font-medium">Feature on Homepage</span>
                  </label>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
