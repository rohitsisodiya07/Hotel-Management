import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  // States directly mapping to your Mongoose schema status values
  const [pendingHotels, setPendingHotels] = useState([]);
  const [approvedHotels, setApprovedHotels] = useState([]);
  const [rejectedHotels, setRejectedHotels] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showView, setShowView] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [pending, approved, rejected] = await Promise.all([
        axios.get(`${signupApi}hotel/pending`, { headers }),
        axios.get(`${signupApi}hotel/approved`, { headers }),
        axios.get(`${signupApi}hotel/rejected`, { headers }),
      ]);

      setPendingHotels(pending.data.hotels || []);
      setApprovedHotels(approved.data.hotels || []);
      setRejectedHotels(rejected.data.hotels || []);
    } catch (error) {
      console.error("Dashboard fetching error:", error);
    } finally {
      setLoading(false);
    }
  };

  const allHotels = useMemo(() => {
    const map = new Map();
    [...pendingHotels, ...approvedHotels, ...rejectedHotels].forEach((hotel) => {
      map.set(hotel._id, hotel);
    });
    return [...map.values()];
  }, [pendingHotels, approvedHotels, rejectedHotels]);

  const filteredHotels = useMemo(() => {
    let data = [...allHotels];

    if (statusFilter !== "All") {
      data = data.filter((hotel) => hotel.status === statusFilter);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      data = data.filter(
        (hotel) =>
          hotel.hotelName?.toLowerCase().includes(searchLower) ||
          hotel.hotelEmail?.toLowerCase().includes(searchLower) ||
          hotel.adminId?.name?.toLowerCase().includes(searchLower) ||
          hotel.trackingId?.toLowerCase().includes(searchLower)
      );
    }

    data.sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return data;
  }, [allHotels, search, statusFilter, sortBy]);

  const stats = {
    total: allHotels.length,
    pending: pendingHotels.length,
    approved: approvedHotels.length,
    rejected: rejectedHotels.length,
  };

  const locationOf = (hotel) => {
    return [
      hotel.city?.cityName,
      hotel.city?.districtId?.districtName,
      hotel.city?.districtId?.stateId?.stateName,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setShowView(true);
  };

  const handleEdit = (id) => {
    navigate(`/admin/addHotel?id=${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-9 h-9 border-2 border-[#1B2537] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-[#8C8676] font-['IBM_Plex_Mono',monospace] text-[12px] uppercase tracking-wider">
            Loading Listings...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="text-[#232320]">

      {/* Top Controller Management Bar */}
      <div className="mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">

        {/* Search Input field */}
        <div className="relative w-full xl:flex-1">
          <input
            type="text"
            placeholder="Search by hotel name, tracking ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#E1DECF] rounded-[3px] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[#A2782E] transition bg-white"
          />
        </div>

        {/* Sorting and Fast Navigation Action Controls Grid */}
        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3 items-center shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-48 border border-[#E1DECF] rounded-[3px] px-4 py-3 text-[13.5px] focus:outline-none focus:border-[#A2782E] transition bg-white text-[#4A473D] font-medium h-11 appearance-none"
          >
            <option value="latest">Latest Submissions</option>
            <option value="oldest">Oldest Submissions</option>
          </select>

          {/* Navigates directly to the addHotel element block */}
          <button
            onClick={() => navigate("/admin/addHotel")}
            className="w-full sm:w-auto bg-[#A2782E] hover:bg-[#855F1E] text-[#FFF9EC] px-5 py-2.5 h-11 text-[13.5px] font-['Space_Grotesk',sans-serif] font-medium rounded-[3px] transition duration-150 uppercase tracking-wide whitespace-nowrap"
          >
            + Add Hotel
          </button>

          {/* Navigates directly to the addCoupon element block */}
          <button
            onClick={() => navigate("/admin/addCoupon")}
            className="w-full sm:w-auto bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] px-5 py-2.5 h-11 text-[13.5px] font-['Space_Grotesk',sans-serif] font-medium rounded-[3px] transition duration-150 uppercase tracking-wide whitespace-nowrap"
          >
            + Add Coupon
          </button>
        </div>
      </div>

      {/* Modern Layout Tabs with integrated Badge Counter */}
      <div className="flex border-b border-[#E1DECF] mb-8 overflow-x-auto gap-2 scrollbar-none">
        {["All", "Pending", "Approved", "Rejected"].map((status) => {
          const isActive = statusFilter === status;
          const count =
            status === "All"
              ? stats.total
              : status === "Pending"
                ? stats.pending
                : status === "Approved"
                  ? stats.approved
                  : stats.rejected;

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-3 font-['Space_Grotesk',sans-serif] font-medium text-[14px] rounded-t-[3px] transition whitespace-nowrap border-b-2 -mb-[1px] ${isActive
                  ? "border-[#A2782E] text-[#1B2537] bg-[rgba(162,120,46,0.04)] font-semibold"
                  : "border-transparent text-[#8C8676] hover:text-[#1B2537] hover:bg-[#FCFBF7]"
                }`}
            >
              {status} Listings{" "}
              <span className={`ml-1.5 px-2 py-0.5 rounded-[2px] text-[11px] font-['IBM_Plex_Mono',monospace] font-bold ${isActive ? "bg-[#1B2537] text-[#FFF9EC]" : "bg-[#E1DECF] text-[#4A473D]"
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid View */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredHotels.length === 0 && (
          <div className="col-span-full bg-[#FCFBF7] rounded-[3px] border border-dashed border-[#E1DECF] p-16 text-center">
            <h3 className="font-['Space_Grotesk',sans-serif] font-semibold text-[16px] text-[#1B2537]">No properties found</h3>
            <p className="text-[#8C8676] text-[13px] mt-1">Try adjusting your searching keywords or chosen filter.</p>
          </div>
        )}

        {filteredHotels.map((hotel) => (
          <div
            key={hotel._id}
            className="bg-white rounded-[3px] border border-[#E1DECF] shadow-[0_1px_2px_rgba(30,28,20,0.02)] hover:shadow-[0_4px_12px_rgba(30,28,20,0.05)] transition-all duration-200 flex flex-col justify-between overflow-hidden group"
          >
            {/* Image Wrap Box */}
            <div className="relative h-44 w-full bg-[#FCFBF7] overflow-hidden shrink-0 border-b border-[#E1DECF]">
              <img
                src={hotel.hotelImages?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop"}
                alt={hotel.hotelName}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2.5 py-1 rounded-[2px] font-['IBM_Plex_Mono',monospace] text-[10px] font-semibold tracking-wider shadow-sm uppercase ${hotel.status === "Approved"
                      ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
                      : hotel.status === "Pending"
                        ? "bg-[#FFF8E1] text-[#F57F17] border border-[#FFECB3]"
                        : "bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]"
                    }`}
                >
                  {hotel.status}
                </span>
              </div>
            </div>

            {/* Content Dynamic Payload Box */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="font-['Space_Grotesk',sans-serif] text-[17px] font-semibold text-[#1B2537] line-clamp-1 group-hover:text-[#A2782E] transition-colors">
                  {hotel.hotelName}
                </h2>
                <p className="text-[#8C8676] text-[12.5px] mt-0.5 truncate">{hotel.hotelEmail}</p>

                <div className="mt-5 space-y-2.5 text-[13px] border-t pt-4 border-[#FCFBF7]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8C8676]">Tracking ID</span>
                    <span className="font-['IBM_Plex_Mono',monospace] text-[11.5px] text-[#1B2537] font-medium bg-[#FCFBF7] px-1.5 py-0.5 border border-[#E1DECF] rounded-[2px]">{hotel.trackingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8676]">Registered By</span>
                    <span className="font-medium text-[#232320] truncate max-w-[140px]">
                      {hotel.adminId?.name || "Admin"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8676]">Type</span>
                    <span className="font-semibold text-[#A2782E] text-[11px] font-['IBM_Plex_Mono',monospace] tracking-wider uppercase">{hotel.hotelType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C8676]">Total Rooms</span>
                    <span className="font-medium text-[#232320]">{hotel.totalRooms} Rooms</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[#8C8676] shrink-0">Location</span>
                    <span className="font-medium text-[#232320] text-right line-clamp-2 text-[12.5px]">
                      {locationOf(hotel) || "Not Mapped"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Layout Control Triggers */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-[#E1DECF]">
                <button
                  onClick={() => handleView(hotel)}
                  className="w-full bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] text-[13px] py-2.5 rounded-[3px] font-medium transition-colors"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleEdit(hotel._id)}
                  className="w-full bg-white hover:bg-[#FCFBF7] border border-[#E1DECF] text-[#4A473D] text-[13px] py-2.5 rounded-[3px] font-medium transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Layer Details Modal */}
      {showView && selectedHotel && (
        <div className="fixed inset-0 bg-[#1B2537]/40 flex justify-center items-center z-50 p-4 backdrop-blur-[2px]">
          <div className="bg-white rounded-[3px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_24px_48px_-12px_rgba(30,28,20,0.25)] border border-[#E1DECF]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#E1DECF] p-5 sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <h2 className="font-['Space_Grotesk',sans-serif] text-[18px] font-semibold text-[#1B2537]">Listing Inspection Profile</h2>
                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#A2782E] mt-0.5 tracking-wider">TRACKING KEY: {selectedHotel.trackingId}</p>
              </div>
              <button
                onClick={() => {
                  setShowView(false);
                  setSelectedHotel(null);
                }}
                className="text-[#8C8676] hover:text-[#1B2537] text-[16px] w-7 h-7 bg-[#FCFBF7] rounded-[3px] flex items-center justify-center transition border border-[#E1DECF]"
              >
                ✕
              </button>
            </div>

            <img
              src={selectedHotel.hotelImages?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"}
              alt={selectedHotel.hotelName}
              className="w-full h-60 object-cover border-b border-[#E1DECF]"
            />

            <div className="p-6 space-y-6 text-[13.5px]">
              {/* Core Parameters Table */}
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 bg-[#FCFBF7] rounded-[3px] border border-[#E1DECF] p-5">
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Hotel Identity</p>
                  <h3 className="font-['Space_Grotesk',sans-serif] font-semibold text-[#1B2537] text-[15px] mt-0.5">{selectedHotel.hotelName}</h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Email Address</p>
                  <h3 className="font-medium text-[#232320] break-all mt-0.5">{selectedHotel.hotelEmail}</h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Registered By (Admin)</p>
                  <h3 className="font-medium text-[#232320] mt-0.5">{selectedHotel.adminId?.name || "Admin System"}</h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Type / Capacity</p>
                  <h3 className="font-medium text-[#232320] mt-0.5">
                    {selectedHotel.hotelType} — <span className="font-semibold text-[#A2782E]">{selectedHotel.totalRooms} Rooms</span>
                  </h3>
                </div>
                <div className="md:col-span-2">
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider mb-1">Verification Status</p>
                  <span
                    className={`px-2.5 py-1 rounded-[2px] font-['IBM_Plex_Mono',monospace] text-[10px] font-semibold inline-block uppercase ${selectedHotel.status === "Approved"
                        ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
                        : selectedHotel.status === "Pending"
                          ? "bg-[#FFF8E1] text-[#F57F17] border border-[#FFECB3]"
                          : "bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]"
                      }`}
                  >
                    {selectedHotel.status}
                  </span>
                </div>
              </div>

              {/* Physical Addresses */}
              <div className="space-y-3.5">
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Geographic Region Mapping</p>
                  <h3 className="font-medium text-[#1B2537] text-[14px] mt-0.5">{locationOf(selectedHotel) || "No Region Data Linked"}</h3>
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Exact Physical Address</p>
                  <h3 className="font-medium text-[#4A473D] bg-[#FCFBF7] rounded-[3px] p-3 border border-[#E1DECF] mt-1">{selectedHotel.address}</h3>
                </div>
              </div>

              {/* Infrastructure Features Tags */}
              {selectedHotel.amenities?.length > 0 && (
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider mb-2">Registered Infrastructure Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedHotel.amenities.map((item, idx) => (
                      <span key={idx} className="bg-[rgba(162,120,46,0.06)] text-[#A2782E] text-[12px] px-2.5 py-1 rounded-[2px] border border-[rgba(162,120,46,0.15)] font-medium">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit remarks layer conditional execution */}
              {selectedHotel.remark && (
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] p-4 rounded-[3px]">
                  <p className="text-[#C62828] font-['IBM_Plex_Mono',monospace] text-[10px] font-bold uppercase tracking-wider">Audit Execution Remark</p>
                  <p className="text-[#232320] text-[13px] mt-1 font-medium">{selectedHotel.remark}</p>
                </div>
              )}

              {/* General Description Block */}
              <div>
                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] text-[#8C8676] uppercase tracking-wider">Establishment Overview</p>
                <p className="leading-relaxed text-[#4A473D] mt-1 bg-[#FCFBF7] p-4 rounded-[3px] border border-[#E1DECF] italic">
                  "{selectedHotel.description || "No public summary description specified for this establishment."}"
                </p>
              </div>

              {/* Action layout controls */}
              <div className="mt-8 flex justify-between items-center border-t pt-4 border-[#E1DECF]">
                <button
                  onClick={() => {
                    setShowView(false);
                    handleEdit(selectedHotel._id);
                  }}
                  className="bg-[#1B2537] hover:bg-[#26314A] text-[#FFF9EC] text-[13px] px-5 py-2.5 rounded-[3px] font-medium transition-colors"
                >
                  Edit Listing
                </button>
                <button
                  onClick={() => {
                    setShowView(false);
                    setSelectedHotel(null);
                  }}
                  className="bg-white hover:bg-[#FCFBF7] border border-[#E1DECF] text-[#4A473D] px-5 py-2.5 text-[13px] font-medium rounded-[3px] transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;