import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";

const District = () => {
  const [showModal, setShowModal] = useState(false);

  const [activeTab, setActiveTab] = useState("active");

  const [districtName, setDistrictName] = useState("");

  const [stateId, setStateId] = useState("");

  const [states, setStates] = useState([]);

  const [districts, setDistricts] = useState([]);

  const [inactiveDistricts, setInactiveDistricts] = useState([]);

  const [viewData, setViewData] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [editId, setEditId] = useState("");

  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);

  // States
  const getStates = async () => {
    try {
      const response = await axios.get(`${signupApi}state/active`);

      setStates(response.data.result);
    } catch (error) {
      console.log(error);
    }
  };

  // Active
  const getDistricts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${signupApi}district/active`);

      setDistricts(response.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Inactive
  const getInactiveDistricts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${signupApi}district/inactive`);

      setInactiveDistricts(response.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStates();
    getDistricts();
    getInactiveDistricts();
  }, []);

  // Create and Update
  const handleSubmit = async () => {
    if (!districtName.trim() || !stateId) {
      return alert("District name and State are required");
    }

    try {
      let response;

      if (isEdit) {
        response = await axios.patch(`${signupApi}district/update/${editId}`, {
          districtName,
          stateId,
        });
      } else {
        response = await axios.post(`${signupApi}district/create`, {
          districtName,
          stateId,
        });
      }

      alert(response.data.message);

      setDistrictName("");
      setStateId("");
      setShowModal(false);
      setIsEdit(false);
      setEditId("");

      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // View
  const handleView = async (id) => {
    try {
      const response = await axios.get(`${signupApi}district/${id}`);

      setViewData(response.data.result);

      setShowViewModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  // Edit
  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setDistrictName(item.districtName);
    setStateId(item.stateId?._id);
    setShowModal(true);
  };

  // Inactive
  const handleInactive = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}district/inactive/${id}`);

      alert(response.data.message);

      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      console.log(error);
    }
  };

  // Restore
  const handleRestore = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}district/restore/${id}`);

      alert(response.data.message);

      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      console.log(error);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this district? This can't be undone.")) return;

    try {
      const response = await axios.delete(`${signupApi}district/${id}`);

      alert(response.data.message);

      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      console.log(error);
    }
  };

  // Registry-style code chip derived from the district name (visual only)
  const codeFor = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  const currentData = activeTab === "active" ? districts : inactiveDistricts;

  const filteredData = currentData
    .filter((item) => {
      const districtMatch = item.districtName
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const stateMatch =
        filterState === "" ? true : item.stateId?._id === filterState;

      return districtMatch && stateMatch;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.districtName.localeCompare(b.districtName);
      }

      return b.districtName.localeCompare(a.districtName);
    });

  const activeCount = districts.length;
  const inactiveCount = inactiveDistricts.length;

  return (
    <div className="min-h-screen font-['Inter',sans-serif] text-[#232320]">
      {/* Google Fonts import (kept as-is; Tailwind utilities don't load fonts) */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>

      <div className="max-w-[1080px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end gap-4 flex-wrap mb-[30px]">
          <div>
            <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.2em] text-[#A2782E] mb-2 mt-0">
              LOCATION HIERARCHY
            </p>
            <h1 className="font-['Space_Grotesk',sans-serif] font-semibold text-2xl text-[#1B2537] m-0 tracking-[-0.01em]">
              Districts
            </h1>
            <p className="text-[#8C8676] text-[13px] mt-[6px] mb-0">
              {activeCount + inactiveCount} on record · {activeCount} active · grouped by state
            </p>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setIsEdit(false);
              setDistrictName("");
              setStateId("");
            }}
            className="font-['Inter',sans-serif] text-[13px] font-medium rounded-md border border-transparent cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-2 h-10 px-4 bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add district
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-[22px] mb-5 border-b border-[#E1DECF]">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 -mb-px text-[13px] font-medium bg-transparent border-none border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors duration-150 ease-in-out hover:text-[#1B2537] ${activeTab === "active"
                ? "text-[#1B2537] border-b-[#A2782E]"
                : "text-[#A39C89] border-b-transparent"
              }`}
          >
            Active
            <span className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#A39C89]">{activeCount}</span>
          </button>

          <button
            onClick={() => setActiveTab("inactive")}
            className={`pb-3 -mb-px text-[13px] font-medium bg-transparent border-none border-b-2 cursor-pointer flex items-center gap-1.5 transition-colors duration-150 ease-in-out hover:text-[#1B2537] ${activeTab === "inactive"
                ? "text-[#1B2537] border-b-[#A2782E]"
                : "text-[#A39C89] border-b-transparent"
              }`}
          >
            Inactive
            <span className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#A39C89]">{inactiveCount}</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3 flex-wrap mb-[18px]">
          <div className="relative w-[260px] max-[760px]:w-full">
            <svg
              className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#A39C89]"
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search district"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-md border border-[#E1DECF] bg-white pl-9 pr-3.5 text-[13px] outline-none transition-colors duration-150 ease-in-out focus:border-[#A2782E]"
            />
          </div>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="h-10 rounded-md border border-[#E1DECF] bg-white px-3 text-[13px] cursor-pointer outline-none focus:border-[#A2782E]"
          >
            <option value="">All states</option>

            {states.map((item) => (
              <option key={item._id} value={item._id}>
                {item.stateName}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="h-10 rounded-md border border-[#E1DECF] bg-white px-3 text-[13px] cursor-pointer outline-none focus:border-[#A2782E]"
          >
            <option value="asc">A to Z</option>
            <option value="desc">Z to A</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E1DECF] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(30,28,20,0.03),0_16px_34px_-22px_rgba(30,28,20,0.18)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FBFAF5]">
                <th className="py-3.5 px-5 text-left font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] font-medium">Code</th>
                <th className="py-3.5 px-5 text-left font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] font-medium">District</th>
                <th className="py-3.5 px-5 text-left font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] font-medium">State</th>
                <th className="py-3.5 px-5 text-left font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] font-medium">Status</th>
                <th className="py-3.5 px-5 text-right font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-[#A39C89] text-[13px]">Loading…</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-[#A39C89] text-[13px]">No districts match your search.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id} className="transition-colors duration-150 ease-in-out hover:bg-[#FBFAF5]">
                    <td className="py-3.5 px-5 border-t border-[#EAE7DA] text-[13.5px]">
                      <span className="font-['IBM_Plex_Mono',monospace] text-[11px] bg-[#F3EEDD] text-[#7A6A3F] py-1 px-2 rounded">
                        {codeFor(item.districtName)}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 border-t border-[#EAE7DA] text-[13.5px]">
                      <span className="font-medium text-[#1B2537] capitalize">{item.districtName}</span>
                    </td>

                    <td className="py-3.5 px-5 border-t border-[#EAE7DA] text-[13.5px]">
                      <span className="text-[#6E695C] text-[13px] capitalize">{item.stateId?.stateName}</span>
                    </td>

                    <td className="py-3.5 px-5 border-t border-[#EAE7DA] text-[13.5px]">
                      <span className={`inline-flex items-center gap-[7px] text-[13px] ${activeTab === "active" ? "text-[#2F6F4E]" : "text-[#8C8676]"}`}>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${activeTab === "active" ? "bg-[#2F6F4E]" : "bg-[#C8C2AF]"}`}
                        />
                        {activeTab === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 border-t border-[#EAE7DA] text-[13.5px] text-right">
                      <div className="flex justify-end gap-1.5">
                        {activeTab === "active" ? (
                          <>
                            <button
                              onClick={() => handleView(item._id)}
                              className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-[#E1DECF] bg-white text-[#6E695C] cursor-pointer transition-all duration-150 ease-in-out hover:border-[#A2782E] hover:text-[#A2782E] hover:bg-[#FBF6E9]"
                              title="View"
                              aria-label="View"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-[#E1DECF] bg-white text-[#6E695C] cursor-pointer transition-all duration-150 ease-in-out hover:border-[#A2782E] hover:text-[#A2782E] hover:bg-[#FBF6E9]"
                              title="Edit"
                              aria-label="Edit"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                            </button>
                            <button
                              onClick={() => handleInactive(item._id)}
                              className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-[#E1DECF] bg-white text-[#6E695C] cursor-pointer transition-all duration-150 ease-in-out hover:border-[#A2782E] hover:text-[#A2782E] hover:bg-[#FBF6E9]"
                              title="Mark inactive"
                              aria-label="Mark inactive"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-[#E1DECF] bg-white text-[#6E695C] cursor-pointer transition-all duration-150 ease-in-out hover:border-[#8E3B30] hover:text-[#8E3B30] hover:bg-[#FBF0EE]"
                              title="Delete"
                              aria-label="Delete"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(item._id)}
                              className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-[#E1DECF] bg-white text-[#6E695C] cursor-pointer transition-all duration-150 ease-in-out hover:border-[#A2782E] hover:text-[#A2782E] hover:bg-[#FBF6E9]"
                              title="Restore"
                              aria-label="Restore"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-[#E1DECF] bg-white text-[#6E695C] cursor-pointer transition-all duration-150 ease-in-out hover:border-[#8E3B30] hover:text-[#8E3B30] hover:bg-[#FBF0EE]"
                              title="Delete"
                              aria-label="Delete"
                            >
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
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(27,22,14,0.35)] backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E1DECF] rounded-[10px] p-7 w-full max-w-[460px] shadow-[0_30px_60px_-20px_rgba(30,28,20,0.28)]">
            <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-semibold text-[#1B2537] mt-0 mb-5">
              {isEdit ? "Update district" : "Add district"}
            </h2>

            <label className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">District name</label>
            <input
              type="text"
              placeholder="e.g. Jaipur"
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              autoFocus
              className="w-full h-10 rounded-md border border-[#E1DECF] bg-white px-3.5 text-[13px] outline-none mb-4 transition-colors duration-150 ease-in-out focus:border-[#A2782E]"
            />

            <label className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">State</label>
            <select
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              className="w-full h-10 rounded-md border border-[#E1DECF] bg-white px-3.5 text-[13px] outline-none mb-6 cursor-pointer transition-colors duration-150 ease-in-out focus:border-[#A2782E]"
            >
              <option value="">Select state</option>

              {states.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.stateName}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowModal(false)}
                className="font-['Inter',sans-serif] text-[13px] font-medium rounded-md border border-transparent cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-2 h-10 px-4 bg-[#F3F1E8] text-[#8C8676] hover:bg-[#EAE6D6] hover:text-[#1B2537]"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="font-['Inter',sans-serif] text-[13px] font-medium rounded-md border border-transparent cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-2 h-10 px-4 bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A]"
              >
                {isEdit ? "Save changes" : "Create district"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-[rgba(27,22,14,0.35)] backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E1DECF] rounded-[10px] p-7 w-full max-w-[460px] shadow-[0_30px_60px_-20px_rgba(30,28,20,0.28)]">
            <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-semibold text-[#1B2537] mt-0 mb-5">
              District details
            </h2>

            <div className="pb-4 mb-4 border-b border-[#EAE7DA]">
              <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] mt-0 mb-1.5">
                District
              </p>
              <p className="text-[15.5px] text-[#1B2537] font-medium m-0 capitalize">
                {viewData?.districtName}
              </p>
            </div>

            <div className="pb-5 mb-5 border-b border-[#EAE7DA]">
              <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] mt-0 mb-1.5">
                State
              </p>
              <p className="text-[15.5px] text-[#1B2537] font-medium m-0 capitalize">
                {viewData?.stateId?.stateName}
              </p>
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              className="font-['Inter',sans-serif] text-[13px] font-medium rounded-md border border-transparent cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-2 h-10 px-4 bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default District;