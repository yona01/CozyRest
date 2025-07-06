import { useEffect, useState } from "react";
import GuestNavbar from "../components/GuestNavbar";
import Modal from "../components/Modal";
import { getLoggedInUser } from "../lib/utils/auth";
import { getBookings } from "../services/bookingService";
import { rateProperty } from "../services/propertyService";
import { BookingDto } from "../types/Booking";

export default function Bookings() {
  const user = getLoggedInUser();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalNights: 0,
    totalSpent: 0,
  });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<BookingDto | null>(null);
  const [rating, setRating] = useState(0);

  const fetchBookings = async () => {
    const data = await getBookings(user.id);
    setBookings(data);

    const today = new Date();

    const pastOrCurrentBookings = data.filter((booking) => {
      const end = new Date(booking.end_date);
      return end < today; // Exclude future bookings from analytics
    });

    const totalNights = pastOrCurrentBookings.reduce((sum, booking) => {
      const nights =
        (new Date(booking.end_date).getTime() -
          new Date(booking.start_date).getTime()) /
        (1000 * 60 * 60 * 24);
      return sum + nights;
    }, 0);

    const totalSpent = pastOrCurrentBookings.reduce((sum, booking) => {
      const nights =
        (new Date(booking.end_date).getTime() -
          new Date(booking.start_date).getTime()) /
        (1000 * 60 * 60 * 24);
      return sum + nights * (booking?.price_per_night || 0);
    }, 0);

    setAnalytics({
      totalBookings: data.length,
      totalNights,
      totalSpent,
    });
  };

  useEffect(() => {
    fetchBookings();
  }, [user.id]);

  const handleRateClick = (booking: BookingDto) => {
    setCurrentBooking(booking);
    setRating(booking.user_rating || 0);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async () => {
    if (!currentBooking) return;

    await rateProperty(user.id, currentBooking.property_id, rating);
    setShowRatingModal(false);
    setCurrentBooking(null);
    setRating(0);
    await fetchBookings(); 
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <GuestNavbar />

      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#FDC835]">My Bookings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Bookings</h3>
            <p className="text-2xl font-semibold">{analytics.totalBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Nights Stayed</h3>
            <p className="text-2xl font-semibold">{analytics.totalNights}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm">Total Spent</h3>
            <p className="text-2xl font-semibold">
              ₱{analytics.totalSpent.toLocaleString()}
            </p>
          </div>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking, index) => {
              const now = new Date();
              const start = new Date(booking.start_date);
              const end = new Date(booking.end_date);

              let status = "Past";
              if (start > now) {
                status = "Upcoming";
              } else if (start <= now && end >= now) {
                status = "Ongoing";
              }

              return (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {booking.property_name}
                      </h2>
                      <p className="text-gray-500 text-sm">{booking.address}</p>
                      <p className="text-sm mt-2">
                        <strong>Stay:</strong> {booking.start_date} to{" "}
                        {booking.end_date}
                      </p>
                      <p className="text-sm">
                        <strong>Total Nights:</strong>{" "}
                        {Math.ceil(
                          (new Date(booking.end_date).getTime() -
                            new Date(booking.start_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                          status === "Upcoming"
                            ? "bg-blue-100 text-blue-700"
                            : status === "Ongoing"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                      <p className="text-gray-700 text-lg font-semibold">
                        ₱{booking.price_per_night}/night
                      </p>
                      <p className="text-sm text-gray-500">
                        Total: ₱{booking.total_price}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {booking.user_rating ? (
                        <div className="bg-yellow-50 p-3 rounded">
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                  {star <= booking.user_rating ? "★" : "☆"}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : status === "Past" ? (
                        <button
                          onClick={() => handleRateClick(booking)}
                          className="text-sm text-[#FDC835] hover:text-yellow-600 font-medium"
                        >
                          Rate your stay
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-20">
            You haven't made any bookings yet.
          </p>
        )}
      </div>
      <Modal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
      >
        <div className="p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Rate Your Stay
            </h2>
            <p className="text-gray-600">
              How was your experience at {currentBooking?.property_name}?
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-3xl mx-1 focus:outline-none"
                >
                  {star <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>

            <button
              onClick={handleRatingSubmit}
              disabled={rating === 0}
              className={`w-full py-2 rounded-lg font-medium ${
                rating === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#FDC835] hover:bg-yellow-400"
              }`}
            >
              Submit Rating
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
