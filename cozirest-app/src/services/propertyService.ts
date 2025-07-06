import { getFromBaseApi, postFormBaseApi, postToBaseApi, putFormBaseApi } from "../lib/utils/apiService";
import { PropertyRequest } from "../types/Property";

export async function saveProperty(form: PropertyRequest) {
  const formData = new FormData();

  formData.append('title', form.title);
  formData.append('description', form.description || '');
  formData.append('price', form.price.toString());
  formData.append('address', form.address);
  formData.append('max_guests', form.max_guests?.toString() || '');
  formData.append('is_active', form.is_active ? '1' : '0');
  formData.append('user_id', form.user_id.toString());
  formData.append('id', form.id.toString());

  form.amenities.forEach((amenity, index) => {
    formData.append(`amenities[${index}]`, amenity);
  });

  form.removed_image_ids.forEach((id, index) => {
    formData.append(`removed_image_ids[${index}]`, id.toString());
  });

  form.images.forEach((file, index) => {
    formData.append(`images[${index}]`, file);
  });

  return await postFormBaseApi('api/saveProperty', formData);
}

export async function getPropertiesByUser(userId: number, showInactive?: boolean): Promise<PropertyRequest[]> {
  return await getFromBaseApi<PropertyRequest[]>('api/getProperties', {userId, showInactive});
}

export async function getGuestProperties(search?: string, minPrice?: number, maxPrice?:number, minGuests?:number): Promise<PropertyRequest[]> {
  return await getFromBaseApi<PropertyRequest[]>('api/getProperties', {search, minPrice, maxPrice, minGuests});
}

export async function rateProperty(user_id: number, property_id:number, rating:number) {
    return await postToBaseApi('api/rateProperty', {user_id, property_id, rating});
}