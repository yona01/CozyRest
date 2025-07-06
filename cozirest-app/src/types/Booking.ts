export type BookingRequest = {
    user_id : number;
    property_id: number;
    start_date: string;
    end_date: string;
}

export type BookingDto = {
    property_name:string;
    total_price : number;
    property_id: number;
    start_date: string;
    end_date: string;
    price_per_night:number;
    address:string;
    user_rating:number;
}