export type UserRole = "user" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  travelPreferences: string[];
  role: UserRole;
  loyaltyPoints: number;
  badges: string[];
  wishlist: string[];
  createdAt: Date;
}

export interface TravelPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  destination: string;
  duration: string;
  images: string[];
  videos?: string[];
  category: string;
  highlights: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  totalAmount: number;
  bookingDate: Date;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  targetId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
  createdAt: Date;
}
