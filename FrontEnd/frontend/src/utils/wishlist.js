/**
 * AuraStay Universal Wishlist / Saved Stays Storage Helper
 * Persists saved properties to localStorage and fires a custom event
 * so all components (Navbar, HotelCards, HotelDetails) stay in sync in real time.
 */

const STORAGE_KEY = "aurastay_saved_stays";

export const getSavedStays = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Failed to read wishlist:", e);
        return [];
    }
};

export const isStaySaved = (hotelId) => {
    if (!hotelId) return false;
    const list = getSavedStays();
    return list.some((item) => String(item._id || item.id) === String(hotelId));
};

export const toggleSaveStay = (hotel) => {
    if (!hotel || (!hotel._id && !hotel.id)) return false;

    const hotelId = String(hotel._id || hotel.id);
    let list = getSavedStays();
    const existingIndex = list.findIndex(
        (item) => String(item._id || item.id) === hotelId
    );

    let isSavedNow = false;

    if (existingIndex > -1) {
        // Remove
        list.splice(existingIndex, 1);
        isSavedNow = false;
    } else {
        // Add minimal metadata needed for display
        const itemToSave = {
            _id: hotelId,
            hotelName: hotel.hotelName || "Luxury Stay",
            hotelType: hotel.hotelType || "Hotel",
            city: hotel.city,
            state: hotel.state,
            address: hotel.address,
            price: hotel.startingPrice || hotel.cheapestRoomPrice || hotel.minPrice || 2500,
            rating: hotel.rating || 4.8,
            totalReviews: hotel.totalReviews || 12,
            hotelImages: Array.isArray(hotel.hotelImages) ? hotel.hotelImages : [],
            savedAt: new Date().toISOString(),
        };
        list.unshift(itemToSave);
        isSavedNow = true;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent("aurastay_wishlist_updated", { detail: { count: list.length } }));
    } catch (e) {
        console.error("Failed to save wishlist:", e);
    }

    return isSavedNow;
};

export const clearSavedStays = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("aurastay_wishlist_updated", { detail: { count: 0 } }));
    } catch (e) {
        console.error("Failed to clear wishlist:", e);
    }
};
