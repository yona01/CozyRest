import { useKeenSlider } from "keen-slider/react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import GuestNavbar from "../components/GuestNavbar";
import Modal from "../components/Modal";
import { getLoggedInUser } from "../lib/utils/auth";
import { formatDate } from "../lib/utils/format";
import { bookProperty, getBookedDates } from "../services/bookingService";
import { getGuestProperties } from "../services/propertyService";
import { BookingRequest } from "../types/Booking";
import { PropertyRequest } from "../types/Property";

export default function Guest() {
  const [properties, setProperties] = useState<PropertyRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyRequest | null>(null);
  const [bookingDates, setBookingDates] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [guests, setGuests] = useState(1);
  const userData = getLoggedInUser();
  const [bookDates, setBookDates] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const result = await getGuestProperties(searchTerm, null, null);
      setProperties(result);
    };
    fetchProperties();
  }, [searchTerm]);

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookNow = async (property: PropertyRequest) => {
    setSelectedProperty(property);
    setBookingDates({
      startDate: null,
      endDate: null,
    });
    setGuests(1);
    const response = await getBookedDates(property.id);
    setBookDates(response);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProperty || !bookingDates.startDate || !bookingDates.endDate) {
      toast.error("Please select check-in and check-out dates.");
      return;
    }

    const booking: BookingRequest = {
      user_id: userData.id,
      property_id: selectedProperty.id,
      start_date: formatDate(bookingDates.startDate),
      end_date: formatDate(bookingDates.endDate),
    };

    const bookingPromise = bookProperty(booking);

    toast.promise(bookingPromise, {
      loading: "Processing your booking...",
      success: "Booking successful!",
      error: "Booking failed. Please try again.",
    });

    try {
      await bookingPromise;
      setBookDates([]);
      setShowBookingModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedProperty || !bookingDates.startDate || !bookingDates.endDate)
      return 0;

    const days = Math.ceil(
      (bookingDates.endDate.getTime() - bookingDates.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return days * selectedProperty.price;
  };

  function PropertyCard({ property }: { property: PropertyRequest }) {
    const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
      loop: true,
      slides: {
        perView: 1,
      },
    });

    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl group">
        <div className="relative h-64 overflow-hidden">
          {property.existing_images?.length > 0 ? (
            <>
              <div ref={sliderRef} className="keen-slider h-full">
                {property.existing_images.map((image, index) => (
                  <div key={index} className="keen-slider__slide">
                    <img
                      src={image.url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {property.existing_images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      slider.current?.prev();
                    }}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white text-gray-800 p-2 shadow-lg rounded-full hover:bg-[#FDC835] hover:text-black transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      slider.current?.next();
                    }}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white text-gray-800 p-2 shadow-lg rounded-full hover:bg-[#FDC835] hover:text-black transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}

          <div className="absolute top-4 right-4 bg-[#FDC835] text-black px-3 py-1 rounded-full text-sm font-medium">
            ₱{property.price}/night
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {property.title}
          </h2>

          {property.rating !== null && (
            <div className="flex items-center text-yellow-500 text-sm">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= Math.round(property.rating) ? "★" : "☆"}
                </span>
              ))}
              <span className="ml-2 text-gray-600 text-xs">
                ({property.rating})
              </span>
            </div>
          )}
          <p className="text-gray-600 mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {property.address}
          </p>

          <div className="flex items-center text-gray-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Max {property.max_guests} guests
          </div>

          {property.amenities?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Amenities:
              </h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.slice(0, 3).map((amenity, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <p className="text-gray-700 line-clamp-3 mb-6">
            {property.description}
          </p>

          <button
            onClick={() => handleBookNow(property)}
            className="w-full bg-[#FDC835] hover:bg-yellow-400 text-black py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
          >
            Book Now
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <GuestNavbar />
      <div className="relative bg-[#FDC835] py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl text-gray-800 mb-8">
            Discover cozy properties for your next adventure
          </p>

          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search by location or property name..."
              className="w-full px-6 py-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FDC835]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-2 top-2 bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No properties found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      <Modal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      >
        <div className="p-8 max-w-md w-full bg-white rounded-xl shadow-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Book{" "}
              <span className="text-[#FDC835]">{selectedProperty?.title}</span>
            </h2>
            <p className="text-gray-500">{selectedProperty?.address}</p>
          </div>

          <form onSubmit={handleBookingSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Dates
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Check-in
                    </label>
                    <DatePicker
                      selected={bookingDates.startDate}
                      onChange={(date: Date) =>
                        setBookingDates((prev) => ({
                          ...prev,
                          startDate: date,
                          endDate:
                            date >= (prev.endDate || date)
                              ? null
                              : prev.endDate,
                        }))
                      }
                      selectsStart
                      startDate={bookingDates.startDate}
                      endDate={bookingDates.endDate}
                      minDate={new Date()}
                      excludeDates={bookDates.map((d) => new Date(d))}
                      placeholderText="Start Date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition text-sm"
                      required
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Check-out
                    </label>
                    <DatePicker
                      selected={bookingDates.endDate}
                      onChange={(date: Date) => {
                        if (
                          bookingDates.startDate &&
                          date > bookingDates.startDate
                        ) {
                          setBookingDates((prev) => ({
                            ...prev,
                            endDate: date,
                          }));
                        }
                      }}
                      selectsEnd
                      startDate={bookingDates.startDate}
                      endDate={bookingDates.endDate}
                      minDate={
                        bookingDates.startDate
                          ? new Date(
                              bookingDates.startDate.getTime() +
                                24 * 60 * 60 * 1000
                            )
                          : new Date()
                      }
                      excludeDates={bookDates.map((d) => new Date(d))}
                      placeholderText="End Date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#fff9e6] p-4 rounded-lg shadow-inner text-sm">
                <div className="flex justify-between mb-2 text-gray-700">
                  <span>
                    ₱{selectedProperty?.price} ×{" "}
                    {bookingDates.startDate && bookingDates.endDate
                      ? Math.ceil(
                          (bookingDates.endDate.getTime() -
                            bookingDates.startDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0}{" "}
                    nights
                  </span>
                  <span className="font-semibold">
                    ₱{calculateTotalPrice().toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 font-bold text-gray-800 flex justify-between">
                  <span>Total</span>
                  <span>₱{calculateTotalPrice().toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!bookingDates.startDate || !bookingDates.endDate}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 shadow-md text-sm ${
                  !bookingDates.startDate || !bookingDates.endDate
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#FDC835] text-black hover:bg-yellow-400"
                }`}
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
