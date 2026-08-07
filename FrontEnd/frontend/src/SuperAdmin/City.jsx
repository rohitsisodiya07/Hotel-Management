import React, { useState, useEffect } from "react";
import axios from "axios";
import { signupApi } from "../api";
import { Plus, Search, Eye, Edit, Ban, RotateCcw, Trash2, Loader2, MapPin, CheckCircle2, AlertTriangle, X, RefreshCw } from "lucide-react";
import { Toaster, toast } from "sonner";
import useSearch from "../Hooks/useSearch";

const City = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const [cityName, setCityName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [viewData, setViewData] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination & Limit States
  const [activePage, setActivePage] = useState(1);
  const [inactivePage, setInactivePage] = useState(1);
  const [limit, setLimit] = useState(5); // Default limit set to 5

  // Fetch active districts for dropdown selection
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${signupApi}district/active`);
        setDistricts(res.data.result || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDistricts();
  }, []);

  const activeState = useSearch(`${signupApi}city/active`, search, {
    page: activePage,
    limit,
    sort: sortOrder,
    districtId: districtFilter
  });

  const inactiveState = useSearch(`${signupApi}city/inactive`, search, {
    page: inactivePage,
    limit,
    sort: sortOrder,
    districtId: districtFilter
  });

  const loading = activeState.loading || inactiveState.loading;

  // Extracting data safely from hook response
  const activeRes = activeState.data || {};
  const cities = activeRes.result || [];
  const activeTotalPages = activeRes.totalPages || 1;
  const activeCount = activeRes.total || 0;

  const inactiveRes = inactiveState.data || {};
  const inactiveCities = inactiveRes.result || [];
  const inactiveTotalPages = inactiveRes.totalPages || 1;
  const inactiveCount = inactiveRes.total || 0;

  const totalCount = activeCount + inactiveCount;

  const refreshData = () => {
    activeState.fetchData();
    inactiveState.fetchData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cityName.trim() || !districtId) {
      toast.error("City name and District are required");
      return;
    }

    try {
      const endpoint = isEdit ? `city/update/${editId}` : `city/create`;
      const method = isEdit ? axios.patch : axios.post;

      const response = await method(`${signupApi}${endpoint}`, {
        cityName,
        districtId,
      });

      toast.success(response.data.message || (isEdit ? "City successfully modified." : "City successfully created."));
      setCityName("");
      setDistrictId("");
      setShowModal(false);
      setIsEdit(false);
      setEditId("");
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  const handleView = async (id) => {
    try {
      const response = await axios.get(`${signupApi}city/${id}`);
      setViewData(response.data.result);
      setShowViewModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch city details.");
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setCityName(item.cityName);
    setDistrictId(item.districtId?._id || item.districtId || "");
    setShowModal(true);
  };

  const handleInactive = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}city/inactive/${id}`);
      toast.success(response.data.message || "City marked as inactive.");
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  const handleRestore = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}city/restore/${id}`);
      toast.success(response.data.message || "City restored successfully.");
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restore city.");
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await axios.delete(`${signupApi}city/${deleteId}`);
      toast.success(response.data.message || "City permanently deleted.");
      setShowDeleteModal(false);
      setDeleteId(null);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error executing deletion.");
    }
  };

  const codeFor = (name = "") => name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();

  let currentDataset = [];
  if (activeTab === "active") {
    currentDataset = cities;
  } else {
    currentDataset = inactiveCities;
  }

  let currentPage = activeTab === "active" ? activePage : inactivePage;
  let totalPages = activeTab === "active" ? activeTotalPages : inactiveTotalPages;
  const setCurrentPage = activeTab === "active" ? setActivePage : setInactivePage;

  return (
    <div className="space-y-6 font-['Inter',sans-serif] text-gray-800 pb-12 max-w-[1600px] mx-auto">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[0.2em] text-blue-600 mb-1 uppercase">
            LOCATION HIERARCHY
          </p>
          <h1 className="font-['Space_Grotesk'] font-bold text-2xl text-gray-900 tracking-tight m-0">
            City Management
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-medium m-0">
            Manage operational urban nodes, district associations, and geographical routing.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={refreshData}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition shadow-2xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => { setShowModal(true); setIsEdit(false); setCityName(""); setDistrictId(""); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer flex-1 sm:flex-none"
          >
            <Plus size={16} />
            Add City
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Total Records</p>
            <h3 className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">{totalCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Active Cities</p>
            <h3 className="text-2xl font-bold text-emerald-600 font-['Space_Grotesk']">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Inactive Cities</p>
            <h3 className="text-2xl font-bold text-amber-600 font-['Space_Grotesk']">{inactiveCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Ban size={20} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => { setActiveTab("active"); setActivePage(1); }}
          className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${activeTab === "active"
            ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
        >
          Active Cities
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${activeTab === "active" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}>
            {activeCount}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab("inactive"); setInactivePage(1); }}
          className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${activeTab === "inactive"
            ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
        >
          Inactive Cities
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${activeTab === "inactive" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}>
            {inactiveCount}
          </span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search city name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActivePage(1);
                setInactivePage(1);
              }}
              className="w-full bg-white border border-gray-200 pl-10 pr-4 h-11 rounded-xl text-xs font-medium outline-none focus:border-blue-500 transition shadow-2xs text-gray-900"
            />
            {search && (
              <button onClick={() => { setSearch(""); setActivePage(1); setInactivePage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              setActivePage(1);
              setInactivePage(1);
            }}
            className="w-full sm:w-48 bg-white border border-gray-200 px-3.5 h-11 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 transition text-gray-700 cursor-pointer shadow-2xs"
          >
            <option value="">All Districts</option>
            {districts.map((item) => (
              <option key={item._id} value={item._id}>{item.districtName}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Rows per page dropdown */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 h-11 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
            <span>Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setActivePage(1);
                setInactivePage(1);
              }}
              className="bg-transparent outline-none cursor-pointer font-bold text-blue-600"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setActivePage(1);
              setInactivePage(1);
            }}
            className="w-full sm:w-44 bg-white border border-gray-200 px-3.5 h-11 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 transition text-gray-700 cursor-pointer shadow-2xs"
          >
            <option value="asc">Sort A to Z</option>
            <option value="desc">Sort Z to A</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all duration-200">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider font-bold">
                <th className="px-6 py-3.5 w-24">Code</th>
                <th className="px-6 py-3.5">City Name</th>
                <th className="px-6 py-3.5">District</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {currentDataset.length > 0 ? (
                currentDataset.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Code */}
                    <td className="px-6 py-3.5">
                      <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold bg-gray-100 border border-gray-200 text-gray-700 py-1 px-2.5 rounded-md">
                        {codeFor(item.cityName)}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-6 py-3.5 font-bold text-gray-900 capitalize">
                      {item.cityName}
                    </td>

                    {/* District */}
                    <td className="px-6 py-3.5 font-semibold text-gray-600 capitalize">
                      {item.districtId?.districtName || "N/A"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${activeTab === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "active" ? "bg-emerald-600" : "bg-gray-400"}`} />
                        {activeTab === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        {activeTab === "active" ? (
                          <>
                            <button onClick={() => handleView(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="View Details"><Eye size={14} /></button>
                            <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Edit City"><Edit size={14} /></button>
                            <button onClick={() => handleInactive(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-amber-600 hover:border-amber-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Mark Inactive"><Ban size={14} /></button>
                            <button onClick={() => confirmDelete(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Delete City"><Trash2 size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleRestore(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-emerald-600 hover:border-emerald-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Restore City"><RotateCcw size={14} /></button>
                            <button onClick={() => confirmDelete(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Delete Permanently"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 text-xs font-medium">
                    No cities found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Numeric Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50 text-xs gap-3">
          <p className="text-gray-500 font-medium">
            Showing page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages || 1}</strong>
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNum = index + 1;
              const isSelected = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-bold transition shadow-2xs cursor-pointer flex items-center justify-center ${isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[420px] shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => { setShowModal(false); setCityName(""); setDistrictId(""); setIsEdit(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900 mb-1">
              {isEdit ? "Update City Record" : "Add New City"}
            </h2>
            <p className="text-gray-500 text-xs font-medium mb-6">
              Configure city nomenclature and district association.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['IBM_Plex_Mono'] mb-2">City Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jodhpur"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  autoFocus
                  className="w-full h-11 rounded-xl border border-gray-200 px-4 text-xs outline-none transition focus:border-blue-500 shadow-2xs text-gray-900 font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['IBM_Plex_Mono'] mb-2">Select District</label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-gray-200 px-4 text-xs outline-none transition focus:border-blue-500 shadow-2xs text-gray-700 font-semibold bg-white cursor-pointer"
                >
                  <option value="">Select a district...</option>
                  {districts.map((item) => (
                    <option key={item._id} value={item._id}>{item.districtName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setCityName(""); setDistrictId(""); setIsEdit(false); }}
                  className="h-10 px-5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 transition shadow-2xs cursor-pointer"
                >
                  {isEdit ? "Save Changes" : "Create City"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[400px] shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900 mb-4">
              City Inspection Profile
            </h2>

            <div className="space-y-3 text-xs mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  City Name
                </p>
                <p className="text-sm font-bold text-gray-900 capitalize">
                  {viewData?.cityName}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Parent District
                </p>
                <p className="text-sm font-bold text-gray-900 capitalize">
                  {viewData?.districtId?.districtName || "N/A"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Regional Code
                </p>
                <p className="font-['IBM_Plex_Mono'] font-bold text-blue-600 text-sm">
                  {codeFor(viewData?.cityName)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  System ID Hash
                </p>
                <p className="font-mono text-[11px] text-gray-600 truncate">
                  {viewData?._id}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full h-10 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gray-900 hover:bg-gray-800 transition shadow-2xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[380px] shadow-2xl text-center relative animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <AlertTriangle size={24} />
            </div>

            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
              Are you sure you want to delete this city record? This action cannot be undone and may affect linked hotel listings.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteId(null); }}
                className="flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 transition shadow-2xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default City;