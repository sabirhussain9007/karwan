"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, DollarSign, CheckCircle2, Clock, XCircle, Eye, Download, X } from "lucide-react";

type Application = {
  _id: string;
  serviceType: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  appliedDate: string;
  applicationData?: {
    fullName: string;
    travelDate: string;
    numberOfPassengers: number;
  };
};

type Booking = {
  _id: string;
  package: { title: string; price: number };
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  travelDate: string;
};

type Review = {
  _id: string;
  package: { title: string };
  rating: number;
  comment: string;
};

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  travelPreferences: string[];
  loyaltyPoints: number;
};

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "reviews">("profile");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [bookingForm, setBookingForm] = useState({
    package: "",
    numberOfGuests: 1,
    travelDate: "",
    totalPrice: 0,
  });

  const [reviewForm, setReviewForm] = useState({
    package: "",
    rating: 5,
    comment: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    bio: "",
    avatar: "",
    travelPreferences: "",
  });

  const [bookingErrors, setBookingErrors] = useState<{package?: string, numberOfGuests?: string, travelDate?: string, totalPrice?: string}>({});
  const [reviewErrors, setReviewErrors] = useState<{package?: string, comment?: string}>({});
  const [profileErrors, setProfileErrors] = useState<{name?: string, avatar?: string}>({});

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch data
  useEffect(() => {
    if (status === "authenticated") {
      if (activeTab === "bookings") fetchBookings();
      else if (activeTab === "reviews") fetchReviews();
      else if (activeTab === "profile") fetchProfile();
    }
  }, [activeTab, status]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/reviews");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      setProfileForm({
        name: data.name,
        bio: data.bio,
        avatar: data.avatar,
        travelPreferences: data.travelPreferences?.join(", ") || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  // Booking handlers
  const validateBooking = () => {
    const errors: any = {};
    let isValid = true;
    if (!bookingForm.package.trim()) { errors.package = "Package name is required"; isValid = false; }
    if (bookingForm.numberOfGuests < 1) { errors.numberOfGuests = "Must be at least 1"; isValid = false; }
    if (!bookingForm.travelDate) { errors.travelDate = "Travel date is required"; isValid = false; }
    if (bookingForm.totalPrice < 0) { errors.totalPrice = "Price cannot be negative"; isValid = false; }
    setBookingErrors(errors);
    return isValid;
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBooking()) return;
    try {
      const res = await fetch("/api/user/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });
      if (!res.ok) throw new Error("Failed to add booking");
      setBookingForm({ package: "", numberOfGuests: 1, travelDate: "", totalPrice: 0 });
      setShowBookingModal(false);
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding booking");
    }
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBooking()) return;
    if (!editingId) return;
    try {
      const res = await fetch("/api/user/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...bookingForm }),
      });
      if (!res.ok) throw new Error("Failed to update booking");
      setBookingForm({ package: "", numberOfGuests: 1, travelDate: "", totalPrice: 0 });
      setEditingId(null);
      setShowBookingModal(false);
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating booking");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    try {
      const res = await fetch(`/api/user/bookings?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete booking");
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting booking");
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setBookingForm({
      package: booking.package.title,
      numberOfGuests: booking.numberOfGuests,
      travelDate: booking.travelDate,
      totalPrice: booking.totalPrice,
    });
    setEditingId(booking._id);
    setShowBookingModal(true);
  };

  // Review handlers
  const validateReview = () => {
    const errors: any = {};
    let isValid = true;
    if (!reviewForm.package.trim()) { errors.package = "Package name is required"; isValid = false; }
    if (!reviewForm.comment.trim()) { errors.comment = "Comment is required"; isValid = false; }
    setReviewErrors(errors);
    return isValid;
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReview()) return;
    try {
      const res = await fetch("/api/user/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      if (!res.ok) throw new Error("Failed to add review");
      setReviewForm({ package: "", rating: 5, comment: "" });
      setShowReviewModal(false);
      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding review");
    }
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReview()) return;
    if (!editingId) return;
    try {
      const res = await fetch("/api/user/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...reviewForm }),
      });
      if (!res.ok) throw new Error("Failed to update review");
      setReviewForm({ package: "", rating: 5, comment: "" });
      setEditingId(null);
      setShowReviewModal(false);
      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating review");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/user/reviews?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting review");
    }
  };

  const handleEditReview = (review: Review) => {
    setReviewForm({
      package: review.package.title,
      rating: review.rating,
      comment: review.comment,
    });
    setEditingId(review._id);
    setShowReviewModal(true);
  };

  // Profile handler
  const validateProfile = () => {
    const errors: any = {};
    let isValid = true;
    if (!profileForm.name.trim()) { errors.name = "Name is required"; isValid = false; }
    if (profileForm.avatar && !/^(https?:\/\/)/.test(profileForm.avatar)) { errors.avatar = "Must be a valid URL"; isValid = false; }
    setProfileErrors(errors);
    return isValid;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          bio: profileForm.bio,
          avatar: profileForm.avatar,
          travelPreferences: profileForm.travelPreferences.split(",").map((p) => p.trim()),
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setShowProfileModal(false);
      fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating profile");
    }
  };

  if (status === "loading") return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Dashboard</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {(["profile", "bookings", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError(null);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Profile</h2>
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : profile ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="text-lg font-semibold">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="text-lg font-semibold">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bio</p>
                    <p className="text-lg">{profile.bio || "No bio added"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Loyalty Points</p>
                    <p className="text-lg font-semibold text-amber-600">{profile.loyaltyPoints}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Travel Preferences</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.travelPreferences && profile.travelPreferences.length > 0 ? (
                        profile.travelPreferences.map((pref) => (
                          <span
                            key={pref}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {pref}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No preferences set</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p>No profile data</p>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Bookings</h2>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setBookingForm({ package: "", numberOfGuests: 1, travelDate: "", totalPrice: 0 });
                    setShowBookingModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Booking
                </button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h3 className="font-bold">{booking.package.title}</h3>
                        <p className="text-gray-600">
                          {booking.numberOfGuests} guests • {new Date(booking.travelDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className={`inline-block px-2 py-1 rounded text-white text-xs ${
                            booking.status === "confirmed" ? "bg-green-600" : "bg-yellow-600"
                          }`}>
                            {booking.status}
                          </span>
                        </p>
                        <p className="text-lg font-semibold mt-2">${booking.totalPrice}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No bookings yet. Start your journey today!</p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Reviews</h2>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setReviewForm({ package: "", rating: 5, comment: "" });
                    setShowReviewModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Review
                </button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="flex justify-between items-start p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold">{review.package.title}</h3>
                        <div className="flex items-center gap-2 my-2">
                          <div className="flex gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <span key={i} className="text-yellow-400">★</span>
                            ))}
                            {Array.from({ length: 5 - review.rating }).map((_, i) => (
                              <span key={i} className="text-gray-300">★</span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{review.rating}/5</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Share your experience!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <Modal onClose={() => setShowBookingModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {editingId ? "Edit Booking" : "Add Booking"}
            </h3>
            <form onSubmit={editingId ? handleUpdateBooking : handleAddBooking} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Package name"
                  value={bookingForm.package}
                  onChange={(e) => setBookingForm({ ...bookingForm, package: e.target.value })}
                  required
                  className={`w-full px-4 py-2 border ${bookingErrors.package ? 'border-red-400' : 'border-gray-300'} rounded-lg`}
                />
                {bookingErrors.package && <p className="mt-1 text-xs text-red-500">{bookingErrors.package}</p>}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Number of guests"
                  value={bookingForm.numberOfGuests}
                  onChange={(e) => setBookingForm({ ...bookingForm, numberOfGuests: parseInt(e.target.value) })}
                  required
                  className={`w-full px-4 py-2 border ${bookingErrors.numberOfGuests ? 'border-red-400' : 'border-gray-300'} rounded-lg`}
                />
                {bookingErrors.numberOfGuests && <p className="mt-1 text-xs text-red-500">{bookingErrors.numberOfGuests}</p>}
              </div>
              <div>
                <input
                  type="date"
                  value={bookingForm.travelDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, travelDate: e.target.value })}
                  required
                  className={`w-full px-4 py-2 border ${bookingErrors.travelDate ? 'border-red-400' : 'border-gray-300'} rounded-lg`}
                />
                {bookingErrors.travelDate && <p className="mt-1 text-xs text-red-500">{bookingErrors.travelDate}</p>}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Total price"
                  value={bookingForm.totalPrice}
                  onChange={(e) => setBookingForm({ ...bookingForm, totalPrice: parseFloat(e.target.value) })}
                  required
                  className={`w-full px-4 py-2 border ${bookingErrors.totalPrice ? 'border-red-400' : 'border-gray-300'} rounded-lg`}
                />
                {bookingErrors.totalPrice && <p className="mt-1 text-xs text-red-500">{bookingErrors.totalPrice}</p>}
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? "Update Booking" : "Add Booking"}
              </button>
            </form>
          </div>
        </Modal>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <Modal onClose={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {editingId ? "Edit Review" : "Add Review"}
            </h3>
            <form onSubmit={editingId ? handleUpdateReview : handleAddReview} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Package name"
                  value={reviewForm.package}
                  onChange={(e) => setReviewForm({ ...reviewForm, package: e.target.value })}
                  required
                  className={`w-full px-4 py-2 border ${reviewErrors.package ? 'border-red-400' : 'border-gray-300'} rounded-lg`}
                />
                {reviewErrors.package && <p className="mt-1 text-xs text-red-500">{reviewErrors.package}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Stars
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <textarea
                  placeholder="Write your review..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  className={`w-full px-4 py-2 border ${reviewErrors.comment ? 'border-red-400' : 'border-gray-300'} rounded-lg h-24`}
                />
                {reviewErrors.comment && <p className="mt-1 text-xs text-red-500">{reviewErrors.comment}</p>}
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? "Update Review" : "Add Review"}
              </button>
            </form>
          </div>
        </Modal>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <Modal onClose={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className={`w-full px-4 py-2 border ${profileErrors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg`}
                />
                {profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name}</p>}
              </div>
              <textarea
                placeholder="Bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
              />
              <div>
                <input
                  type="url"
                  placeholder="Avatar URL"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  className={`w-full px-4 py-2 border ${profileErrors.avatar ? 'border-red-400' : 'border-gray-300'} rounded-lg`}
                />
                {profileErrors.avatar && <p className="mt-1 text-xs text-red-500">{profileErrors.avatar}</p>}
              </div>
              <input
                type="text"
                placeholder="Travel preferences (comma separated)"
                value={profileForm.travelPreferences}
                onChange={(e) => setProfileForm({ ...profileForm, travelPreferences: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Profile
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}
