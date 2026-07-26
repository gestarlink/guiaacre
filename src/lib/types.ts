export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: "admin" | "owner" | "user";
  created_at: string;
  updated_at: string;
};

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: string;
  category_id: string;
  city: string;
  city_id: string;
  neighborhood: string | null;
  neighborhood_id: string | null;
  address: string | null;
  description: string | null;
  meta_description: string | null;
  tags: string;
  hours: string | null;
  opening_hours: string | null;
  whatsapp: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  rating_count: number | null;
  image_url: string | null;
  gallery: string | null;
  place_id: string | null;
  source: string;
  status: "pending" | "approved" | "rejected";
  highlight: number;
  tier: "basic" | "featured" | "premium";
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

export type City = {
  id: number;
  name: string;
  slug: string;
  state: string;
};

export type Neighborhood = {
  id: number;
  name: string;
  slug: string;
  city_id: number;
};

export type Review = {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
};
