import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HostNavbar from "../components/HostNavbar";
import Modal from "../components/Modal";
import { getLoggedInUser, logOut } from "../lib/utils/auth";
import { getPropertiesByUser, saveProperty } from "../services/propertyService";
import { PropertyRequest } from "../types/Property";

export default function Properties() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const userData = getLoggedInUser();
  const [properties, setProperties] = useState<PropertyRequest[]>([]);

  const [property, setProperty] = useState<PropertyRequest>({
    id: 0,
    title: "",
    price: 0,
    address: "",
    max_guests: 0,
    amenities: [],
    description: "",
    images: [],
    new_amenity: "",
    user_id: 0,
    rating: undefined,
    is_active: true,
    existing_images: [],
    removed_image_ids: [],
  });

  useEffect(() => {
    const getProperties = async () => {
      const result = await getPropertiesByUser(userData.id, showInactive);
      setProperties(result);
    };

    getProperties();
  }, [showInactive]);

  const logOutUser = () => {
    logOut();
    navigate("/");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setProperty((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
    }
  };

  const handleRemoveImage = (index: number, type: "existing" | "new") => {
    setProperty((prev) => {
      if (type === "existing") {
        const removedImage = prev.existing_images[index];
        return {
          ...prev,
          existing_images: prev.existing_images.filter((_, i) => i !== index),
          removed_image_ids: [...prev.removed_image_ids, removedImage.id],
        };
      } else {
        return {
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
        };
      }
    });
  };

  const handleAddAmenity = () => {
    if (property.new_amenity.trim()) {
      setProperty((prev) => ({
        ...prev,
        amenities: [...prev.amenities, prev.new_amenity.trim()],
        newAmenity: "",
      }));
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setProperty((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProperty = { ...property, user_id: userData.id };
    await saveProperty(updatedProperty);

    const result = await getPropertiesByUser(userData.id, showInactive);
    setProperties(result);

    resetForm();
  };

  const showModalProperty = (p: PropertyRequest) => {
    setProperty({
      ...p,
      images: [],
      removed_image_ids: [],
      new_amenity: "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setProperty({
      id: 0,
      title: "",
      price: 0,
      address: "",
      max_guests: 0,
      amenities: [],
      description: "",
      images: [],
      new_amenity: "",
      user_id: 0,
      rating: undefined,
      is_active: true,
      existing_images: [],
      removed_image_ids: [],
    });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#ECF0F1] p-6">
      <HostNavbar />
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#FDC835]">
          CozyRest Properties
        </h1>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Show Inactive Properties
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowInactive((prev) => !prev)}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${
                showInactive ? "bg-green-500" : "bg-gray-400"
              }`}
            >
              <span
                className={`w-6 h-6 bg-white rounded-full absolute top-1 left-1 transition-transform duration-300 ${
                  showInactive ? "translate-x-6" : ""
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">
              {showInactive
                ? "Showing all properties"
                : "Only active properties"}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#FDC835] hover:bg-yellow-400 text-black px-6 py-2 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
          >
            Add Property
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl hover:border-[#FDC835]"
          >
            <div className="h-48 bg-gray-200 overflow-hidden">
              {property.existing_images?.map((img, index) =>
                index === 0 ? (
                  <img
                    key={index}
                    src={img.url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : null
              ) || (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-800">
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
                <span className="bg-[#FDC835] text-black px-3 py-1 rounded-full text-sm font-medium">
                  ₱{property.price}/night
                </span>
              </div>

              <p className="text-gray-600 mb-4">{property.address}</p>

              <div className="flex items-center text-gray-600 mb-4">
                <span className="mr-2">👤</span>
                <span>Max {property.max_guests} guests</span>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Amenities:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-gray-700 line-clamp-2 mb-4">
                {property.description}
              </p>

              <button
                onClick={() => showModalProperty(property)}
                className="w-full bg-[#FDC835] hover:bg-yellow-400 text-black py-2 rounded-lg font-medium transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal visible={showModal} onClose={resetForm}>
        <div className="p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {property.id ? "Edit Property" : "Add Property"}
            </h2>
            <p className="text-gray-500">
              {property.id
                ? "Update your property details"
                : "Add your cozy properties"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Title"
                  value={property.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₱)
                </label>
                <input
                  name="price"
                  type="number"
                  placeholder="Enter price"
                  value={property.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  name="address"
                  type="text"
                  placeholder="Street, City, Province"
                  value={property.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Guests
                </label>
                <input
                  name="max_guests"
                  type="number"
                  placeholder="How many guests?"
                  value={property.max_guests}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Active Status
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm">
                    {property.is_active ? "Active" : "Inactive"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setProperty((prev) => ({
                        ...prev,
                        is_active: !prev.is_active,
                      }))
                    }
                    className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${
                      property.is_active ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 bg-white rounded-full absolute top-1 left-1 transition-transform duration-300 ${
                        property.is_active ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities
                </label>
                <div className="flex gap-2">
                  <input
                    name="newAmenity"
                    type="text"
                    placeholder="Add amenity (e.g. WiFi)"
                    value={property.new_amenity}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="bg-[#FDC835] hover:bg-yellow-400 text-gray-900 px-4 rounded-lg font-medium transition-all duration-200"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm">{amenity}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(index)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe the property..."
                  value={property.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                <input
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FDC835] focus:border-transparent transition"
                />

                {property.existing_images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">
                      Existing Images
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {property.existing_images.map((img, index) => (
                        <div
                          key={`existing-${img.id}`}
                          className="relative group"
                        >
                          <img
                            src={img.url}
                            alt={`Existing ${index}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, "existing")}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {property.images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">New Images</p>
                    <div className="grid grid-cols-3 gap-2">
                      {property.images.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, "new")}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#FDC835] hover:bg-yellow-400 text-gray-900 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md mt-4"
              >
                {property.id ? "Update Property" : "Submit Property"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
