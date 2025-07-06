export type PropertyRequest = {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  price: number;
  address: string;
  max_guests?: number;
  rating?: number;
  is_active: boolean;
  amenities?: string[];
  images: File[]; 
  existing_images: PropertyImage[];
  removed_image_ids: number[];
  new_amenity?: string;
}

export type PropertyImage = {
  id: number;
  url: string;
  path: string;
}