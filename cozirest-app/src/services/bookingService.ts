import { getFromBaseApi, postToBaseApi } from "../lib/utils/apiService";
import { BookingDto, BookingRequest } from "../types/Booking";

export async function bookProperty(book: BookingRequest) {
    return await postToBaseApi('api/bookProperty', book);
}

export async function getBookedDates(propertyId:number): Promise<Date[]> {
  return await getFromBaseApi<Date[]>('api/getBookedDates', {propertyId});
}

export async function getBookings(userId:number): Promise<BookingDto[]> {
  return await getFromBaseApi<BookingDto[]>('api/getBookings', {userId});
}
