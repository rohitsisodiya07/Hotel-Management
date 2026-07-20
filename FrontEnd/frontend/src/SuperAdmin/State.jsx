import React, { useEffect, useState } from "react";
import axios from "axios";
import { signupApi } from "../api";

const State = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [activeTab, setActiveTab] = useState("active");

  const [stateName, setStateName] = useState("");
  const [states, setStates] = useState([]);
  const [inactiveStates, setInactiveStates] = useState([]);
  const [viewData, setViewData] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);

  // Active States
  const getStates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}state/active`);
      setStates(response.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Inactive States
  const getInactiveStates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${signupApi}state/inactive`);
      setInactiveStates(response.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStates();
    getInactiveStates();
  }, []);

  // Create & Update
  const handleSubmit = async () => {
    if (!stateName.trim()) {
      return alert("State name is required");
    }

    try {
      let response;

      if (isEdit) {
        response = await axios.patch(`${signupApi}state/update/${editId}`, {
          stateName,
        });
      } else {
        response = await axios.post(`${signupApi}state/create`, {
          stateName,
        });
      }

      alert(response.data.message);

      setStateName("");
      setShowModal(false);
      setIsEdit(false);
      setEditId("");

      getStates();
      getInactiveStates();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // View
  const handleView = async (id) => {
    try {
      const response = await axios.get(`${signupApi}state/${id}`);

      setViewData(response.data.result);
      setShowViewModal(true);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // Edit
  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setStateName(item.stateName);
    setShowModal(true);
  };

  // Inactive
  const handleInactive = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}state/inactive/${id}`);

      alert(response.data.message);
      getStates();
      getInactiveStates();
    } catch (error) {
      console.log(error);
    }
  };

  // Restore
  const handleRestore = async (id) => {
    try {
      const response = await axios.patch(`${signupApi}state/restore/${id}`);

      alert(response.data.message);
      getStates();
      getInactiveStates();
    } catch (error) {
      console.log(error);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this state? This can't be undone.")) return;

    try {
      const response = await axios.delete(`${signupApi}state/${id}`);

      alert(response.data.message);
      getStates();
      getInactiveStates();
    } catch (error) {
      console.log(error);
    }
  };

  // Registry-style code chip derived from the state name (visual only)
  const codeFor = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  // Search & Sorting
  const filteredData = (activeTab === "active" ? states : inactiveStates)
    .filter((item) =>
      item.stateName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.stateName.localeCompare(b.stateName)
        : b.stateName.localeCompare(a.stateName)
    );

  const activeCount = states.length;
  const inactiveCount = inactiveStates.length;

  return (
    <div className="min-h-screen font-['Inter',sans-serif] text-[#232320]">
      {/* Google Fonts import (kept as-is; Tailwind utilities don't load fonts) */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`}</style>

      <div className="max-w-[980px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end gap-4 flex-wrap mb-[30px]">
          <div>
            <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.2em] text-[#A2782E] mb-2 mt-0">
              LOCATION HIERARCHY
            </p>
            <h1 className="font-['Space_Grotesk',sans-serif] font-semibold text-2xl text-[#1B2537] m-0 tracking-[-0.01em]">
              States
            </h1>
            <p className="text-[#8C8676] text-[13px] mt-[6px] mb-0">
              {activeCount + inactiveCount} on record · {activeCount} active
            </p>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setIsEdit(false);
              setStateName("");
            }}
            className="font-['Inter',sans-serif] text-[13px] font-medium rounded-md border border-transparent cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-2 h-10 px-4 bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add state
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

        {/* Search & Sort */}
        <div className="flex justify-between gap-3 mb-[18px] max-[700px]:flex-col">
          <div className="relative w-1/2 max-[700px]:w-full">
            <svg
              className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#A39C89]"
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search states"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-md border border-[#E1DECF] bg-white pl-9 pr-3.5 text-[13px] outline-none transition-colors duration-150 ease-in-out focus:border-[#A2782E]"
            />
          </div>

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
        {loading ? (
          <div className="text-center py-16 text-[#A39C89] text-[13px] bg-white border border-[#E1DECF] rounded-[10px]">
            Loading…
          </div>
        ) : (
          <div className="bg-white border border-[#E1DECF] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(30,28,20,0.03),0_16px_34px_-22px_rgba(30,28,20,0.18)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FBFAF5]">
                  <th className="py-3.5 px-5 text-left font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] font-medium">Code</th>
                  <th className="py-3.5 px-5 text-left font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] font-medium">State name</th>
                  <th className="py-3.5 px-5 text-left font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] font-medium">Status</th>
                  <th className="py-3.5 px-5 text-right font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item._id} className="transition-colors duration-150 ease-in-out hover:bg-[#FBFAF5]">
                      <td className="py-3.5 px-5 border-t border-[#EAE7DA] text-[13.5px]">
                        <span className="font-['IBM_Plex_Mono',monospace] text-[11px] bg-[#F3EEDD] text-[#7A6A3F] py-1 px-2 rounded">
                          {codeFor(item.stateName)}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 border-t border-[#EAE7DA] text-[13.5px]">
                        <span className="font-medium text-[#1B2537] capitalize">{item.stateName}</span>
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
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-14 text-[#A39C89] text-[13px]">
                      No states match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(27,22,14,0.35)] backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E1DECF] rounded-[10px] p-7 w-full max-w-[420px] shadow-[0_30px_60px_-20px_rgba(30,28,20,0.28)]">
            <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-semibold text-[#1B2537] mt-0 mb-5">
              {isEdit ? "Update state" : "Add state"}
            </h2>

            <label className="block text-[11.5px] font-medium text-[#8C8676] mb-[7px]">State name</label>
            <input
              type="text"
              placeholder="e.g. Rajasthan"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              autoFocus
              className="w-full h-10 rounded-md border border-[#E1DECF] px-3.5 text-[13px] outline-none mb-6 transition-colors duration-150 ease-in-out focus:border-[#A2782E]"
            />

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setShowModal(false);
                  setStateName("");
                  setIsEdit(false);
                }}
                className="font-['Inter',sans-serif] text-[13px] font-medium rounded-md border border-transparent cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-2 h-10 px-4 bg-[#F3F1E8] text-[#8C8676] hover:bg-[#EAE6D6] hover:text-[#1B2537]"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="font-['Inter',sans-serif] text-[13px] font-medium rounded-md border border-transparent cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-2 h-10 px-4 bg-[#1B2537] text-[#FFF9EC] hover:bg-[#26314A]"
              >
                {isEdit ? "Save changes" : "Create state"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-[rgba(27,22,14,0.35)] backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E1DECF] rounded-[10px] p-7 w-full max-w-[420px] shadow-[0_30px_60px_-20px_rgba(30,28,20,0.28)]">
            <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-semibold text-[#1B2537] mt-0 mb-5">
              State details
            </h2>

            <div className="pb-5 mb-5 border-b border-[#EAE7DA]">
              <p className="font-['IBM_Plex_Mono',monospace] text-[10.5px] tracking-[0.12em] text-[#A39C89] mt-0 mb-1.5">
                State name
              </p>
              <p className="text-[15.5px] text-[#1B2537] font-medium m-0 capitalize">
                {viewData?.stateName}
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

export default State;