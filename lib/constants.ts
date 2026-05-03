// app/constants.ts (or lib/constants.ts)

export const APP_NAME: string = "Pak Karwan E Bilal";
export const APP_FULL_NAME: string = "Pak Karwan E Bilal Travel & Tours";
export const APP_ADDRESS: string =
  "Orangi Town Gulshan e Bahar Jama Masjid Aqsa Shop No. 01, Orangi Town, Pakistan";
export const APP_PHONE: string = "0333 3047116";
export const APP_EMAIL: string = "shahbazabbas9015@gmail.com";

export const CATEGORIES: string[] = [
  "Umrah",
  "Hajj",
  "International Tours",
  "Domestic Tours",
  "Visa Services",
  "Ticketing",
  "Car Rental",
];

export const TRAVEL_PREFERENCES: string[] = [
  "Luxury",
  "Budget",
  "Adventure",
  "Religious",
  "Family",
  "Solo",
  "Culture",
];

// Type for loyalty badge
export type LoyaltyBadge = {
  id: string;
  name: string;
  icon: string;
  threshold: number;
};

export const LOYALTY_BADGES: LoyaltyBadge[] = [
  { id: "newbie", name: "New Traveler", icon: "🌟", threshold: 0 },
  { id: "explorer", name: "Package Explorer", icon: "🧭", threshold: 100 },
  { id: "voyager", name: "Global Voyager", icon: "🗺️", threshold: 500 },
  { id: "elite", name: "Elite Member", icon: "👑", threshold: 1000 },
];