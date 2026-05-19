export const TRIP_TYPES = [
  "Umrah",
  "Hajj",
  "International",
  "Domestic",
  "Adventure",
  "Other",
] as const;

export type TripType = (typeof TRIP_TYPES)[number];

export const SUGGESTED_TAGS = [
  "Family",
  "Solo",
  "Budget",
  "Luxury",
  "Food",
  "Photography",
  "Tips",
  "First-time",
] as const;

export const SORT_OPTIONS = [
  { value: "recent", label: "Latest" },
  { value: "popular", label: "Most liked" },
  { value: "discussed", label: "Most discussed" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
