import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";

const City = () => {
  const [showModal, setShowModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("active");

  const [cityName, setCityName] = useState("");

  const [districtId, setDistrictId] = useState("");

  const [districts, setDistricts] = useState([]);

  const [cities, setCities] = useState([]);

  const [inactiveCities, setInactiveCities] = useState([]);

  const [viewData, setViewData] = useState(null);

  const [isEdit, setIsEdit] = useState(false);

  const [editId, setEditId] = useState("");

  // Search & Sort
  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("asc");

  const [districtFilter, setDistrictFilter] = useState("");

  // ================= DISTRICTS =================
  const getDistricts = async () => {
    try {
      const response = await axios.get(`${signupApi}district/active`);

      setDistricts(response.data.result);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= ACTIVE CITIES =================
  const getCities = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${signupApi}city/active`);

      setCities(response.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= INACTIVE CITIES =================
  const getInactiveCities = async () => {
    try {
      const response = await axios.get(`${signupApi}city/inactive`);

      setInactiveCities(response.data.result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDistricts();
    getCities();
    getInactiveCities();
  }, []);

  // ================= CREATE & UPDATE =================
  const handleSubmit = async () => {
    if (!cityName.trim() || !districtId) {
      return alert("City name and District are required");
    }

    try {
      let response;

      if (isEdit) {
        response = await axios.patch(`${signupApi}city/update/${editId}`, {
          cityName,
          districtId,
        });
      } else {
        response = await axios.post(`${signupApi}city/create`, {
          cityName,
          districtId,
        });
      }

      alert(response.data.message);

      setCityName("");
      setDistrictId("");
      setShowModal(false);
      setIsEdit(false);
      setEditId("");

      getCities();
      getInactiveCities();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // ================= VIEW =================
  const handleView = async (id) => {
    try {
      const response = await axios.get(`${signupApi}city/${id}`);

      setViewData(response.data.result);
      setShowViewModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setCityName(item.cityName);
    setDistrictId(item.districtId?._id);
    setShowModal(true);
  };

  // ================= INACTIVE =================
  const handleInactive = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}city/inactive/${id}`);

      alert(response.data.message);

      getCities();
      getInactiveCities();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= RESTORE =================
  const handleRestore = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}city/restore/${id}`);

      alert(response.data.message);

      getCities();
      getInactiveCities();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this city? This can't be undone.")) return;

    try {
      const response = await axios.delete(`${signupApi}city/${id}`);

      alert(response.data.message);

      getCities();
      getInactiveCities();
    } catch (error) {
      console.log(error);
    }
  };

  // Registry-style code chip derived from the city name (visual only)
  const codeFor = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  // ================= SEARCH & SORT =================
  const filteredCities = useMemo(() => {
    let data = activeTab === "active" ? [...cities] : [...inactiveCities];

    if (search) {
      data = data.filter((item) =>
        item.cityName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (districtFilter) {
      data = data.filter((item) => item.districtId?._id === districtFilter);
    }

    data.sort((a, b) =>
      sort === "asc"
        ? a.cityName.localeCompare(b.cityName)
        : b.cityName.localeCompare(a.cityName)
    );

    return data;
  }, [cities, inactiveCities, search, sort, districtFilter, activeTab]);

  const activeCount = cities.length;
  const inactiveCount = inactiveCities.length;

  return (
    <div
      className="font-sans min-h-screen"
      style={{
        background:
          "radial-gradient(1200px 480px at 8% -10%, #F3F1EA 0%, #ECE9DF 42%, #E6E2D5 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Inter:wght@400;500;600&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .icon-btn {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #E3E0D4; background: #FFFFFF;
          color: #6B6659; transition: all .15s ease; cursor: pointer;
        }
        .icon-btn:hover { border-color: #C9C4B3; background: #FBFAF6; color: #24221C; }
        .icon-btn.danger:hover { border-color: #C6564A; color: #C6564A; background: #FCF4F3; }
        .reg-row:hover { background: #FBFAF5; }
        .reg-card {
          background: #FFFEFB;
          box-shadow: 0 1px 2px rgba(30,28,20,0.04), 0 10px 30px -14px rgba(30,28,20,0.10);
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#9A927D] mb-1.5">
              LOCATION HIERARCHY
            </p>
            <h1 className="text-[22px] font-medium text-[#201F19] tracking-tight">
              Cities
            </h1>
            <p className="text-[#8B8474] text-[13px] mt-1">
              {activeCount + inactiveCount} on record · {activeCount} active · grouped by district
            </p>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setIsEdit(false);
              setCityName("");
              setDistrictId("");
            }}
            className="flex items-center gap-2 bg-[#201F19] text-[#F3EFE3] px-4 h-10 rounded-lg text-[13px] font-medium hover:bg-[#332F26] transition-colors duration-150 cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add city
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-5 border-b border-[#E3E0D4]">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 -mb-px text-[13px] font-medium border-b-2 transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${activeTab === "active"
                ? "border-[#201F19] text-[#201F19]"
                : "border-transparent text-[#A39B8B] hover:text-[#201F19]"
              }`}
          >
            Active
            <span className="font-mono text-[11px] text-[#A39B8B]">{activeCount}</span>
          </button>

          <button
            onClick={() => setActiveTab("inactive")}
            className={`pb-3 -mb-px text-[13px] font-medium border-b-2 transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${activeTab === "inactive"
                ? "border-[#201F19] text-[#201F19]"
                : "border-transparent text-[#A39B8B] hover:text-[#201F19]"
              }`}
          >
            Inactive
            <span className="font-mono text-[11px] text-[#A39B8B]">{inactiveCount}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-3 mb-5">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A39B8B" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-[#E3E0D4] pl-9 pr-3 h-10 rounded-lg w-full text-[13px] outline-none focus:border-[#B3AC97] focus:ring-2 focus:ring-[#B3AC97]/15 transition-all duration-150 bg-white"
            />
          </div>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="border border-[#E3E0D4] px-3 h-10 rounded-lg text-[13px] outline-none focus:border-[#B3AC97] bg-white cursor-pointer"
          >
            <option value="">All districts</option>

            {districts.map((item) => (
              <option key={item._id} value={item._id}>
                {item.districtName}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-[#E3E0D4] px-3 h-10 rounded-lg text-[13px] outline-none focus:border-[#B3AC97] bg-white cursor-pointer"
          >
            <option value="asc">A to Z</option>
            <option value="desc">Z to A</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="reg-card text-center py-16 text-[#A39B8B] text-sm rounded-2xl border border-[#E3E0D4]">
            Loading…
          </div>
        ) : (
          <div className="reg-card border border-[#E3E0D4] rounded-2xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FAF8F2]">
                  <th className="p-3.5 pl-5 text-left text-[11px] tracking-[0.1em] text-[#9A927D] font-medium font-mono">
                    CODE
                  </th>
                  <th className="p-3.5 text-left text-[11px] tracking-[0.1em] text-[#9A927D] font-medium font-mono">
                    CITY
                  </th>
                  <th className="p-3.5 text-left text-[11px] tracking-[0.1em] text-[#9A927D] font-medium font-mono">
                    DISTRICT
                  </th>
                  <th className="p-3.5 text-left text-[11px] tracking-[0.1em] text-[#9A927D] font-medium font-mono">
                    STATUS
                  </th>
                  <th className="p-3.5 pr-5 text-right text-[11px] tracking-[0.1em] text-[#9A927D] font-medium font-mono">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-14 text-[#A39B8B] text-sm">
                      No cities match your search.
                    </td>
                  </tr>
                ) : (
                  filteredCities.map((item) => (
                    <tr
                      key={item._id}
                      className="reg-row border-t border-[#EFEBDF] transition-colors duration-150"
                    >
                      <td className="p-3.5 pl-5">
                        <span className="font-mono text-[11px] bg-[#F3F1E6] text-[#71695A] px-2 py-1 rounded">
                          {codeFor(item.cityName)}
                        </span>
                      </td>

                      <td className="p-3.5 capitalize text-[#201F19] font-medium text-[14px]">
                        {item.cityName}
                      </td>

                      <td className="p-3.5 capitalize text-[#5A554C] text-[13px]">
                        {item.districtId?.districtName}
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[13px]">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: activeTab === "active" ? "#4C8B5B" : "#A39B8B",
                            }}
                          />
                          <span style={{ color: activeTab === "active" ? "#3E6E4A" : "#8B8474" }}>
                            {activeTab === "active" ? "Active" : "Inactive"}
                          </span>
                        </span>
                      </td>

                      <td className="p-3.5 pr-5">
                        <div className="flex justify-end gap-1.5">
                          {activeTab === "active" ? (
                            <>
                              <button onClick={() => handleView(item._id)} className="icon-btn" title="View" aria-label="View">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                              </button>
                              <button onClick={() => handleEdit(item)} className="icon-btn" title="Edit" aria-label="Edit">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                              </button>
                              <button onClick={() => handleInactive(item._id)} className="icon-btn" title="Mark inactive" aria-label="Mark inactive">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></svg>
                              </button>
                              <button onClick={() => handleDelete(item._id)} className="icon-btn danger" title="Delete" aria-label="Delete">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleRestore(item._id)} className="icon-btn" title="Restore" aria-label="Restore">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
                              </button>
                              <button onClick={() => handleDelete(item._id)} className="icon-btn danger" title="Delete" aria-label="Delete">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1A1712]/45 backdrop-blur-[3px] flex justify-center items-center z-50 px-4">
          <div className="reg-card bg-white p-7 rounded-2xl w-full max-w-105 border border-[#E3E0D4]">
            <h2 className="text-[18px] font-medium text-[#201F19] mb-5">
              {isEdit ? "Update city" : "Add city"}
            </h2>

            <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
              City name
            </label>
            <input
              type="text"
              placeholder="e.g. Jodhpur"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              autoFocus
              className="w-full border border-[#E3E0D4] px-3.5 h-10 rounded-lg mb-4 text-[13px] outline-none focus:border-[#B3AC97] focus:ring-2 focus:ring-[#B3AC97]/15 transition-all duration-150"
            />

            <label className="block text-[12px] font-medium text-[#8B8474] mb-1.5">
              District
            </label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full border border-[#E3E0D4] px-3.5 h-10 rounded-lg mb-6 text-[13px] outline-none focus:border-[#B3AC97] bg-white cursor-pointer"
            >
              <option value="">Select district</option>

              {districts.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.districtName}
                </option>
              ))}
            </select>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 h-10 bg-[#F5F3EA] text-[#8B8474] rounded-lg text-[13px] font-medium hover:bg-[#EFEBDF] transition-colors duration-150 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 h-10 bg-[#201F19] text-[#F3EFE3] rounded-lg text-[13px] font-medium hover:bg-[#332F26] transition-colors duration-150 cursor-pointer"
              >
                {isEdit ? "Save changes" : "Create city"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 bg-[#1A1712]/45 backdrop-blur-[3px] flex justify-center items-center z-50 px-4">
          <div className="reg-card bg-white p-7 rounded-2xl w-full max-w-105 border border-[#E3E0D4]">
            <h2 className="text-[18px] font-medium text-[#201F19] mb-5">
              City details
            </h2>

            <div className="space-y-4 mb-6">
              <div className="pb-4 border-b border-[#EFEBDF]">
                <p className="text-[11px] tracking-widest font-mono text-[#9A927D] mb-1.5">
                  CITY NAME
                </p>
                <p className="text-[16px] text-[#201F19] font-medium capitalize">
                  {viewData.cityName}
                </p>
              </div>

              <div className="pb-4 border-b border-[#EFEBDF]">
                <p className="text-[11px] tracking-widest font-mono text-[#9A927D] mb-1.5">
                  DISTRICT
                </p>
                <p className="text-[16px] text-[#201F19] font-medium capitalize">
                  {viewData.districtId?.districtName}
                </p>
              </div>

              <div>
                <p className="text-[11px] tracking-widest font-mono text-[#9A927D] mb-1.5">
                  STATUS
                </p>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium capitalize"
                  style={{
                    background: viewData.status === "active" ? "#EAF3EC" : "#F3F1E6",
                    color: viewData.status === "active" ? "#3E6E4A" : "#8B8474",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: viewData.status === "active" ? "#4C8B5B" : "#A39B8B" }}
                  />
                  {viewData.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-[#201F19] text-[#F3EFE3] px-4 h-10 rounded-lg text-[13px] font-medium hover:bg-[#332F26] transition-colors duration-150 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default City;
