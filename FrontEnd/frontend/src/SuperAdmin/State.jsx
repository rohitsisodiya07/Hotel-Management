import React, { useState } from "react";
import axios from "axios";
import { signupApi } from "../api";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Ban,
  RotateCcw,
  Trash2,
  Loader2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Upload,
  FileSpreadsheet
} from "lucide-react";
import { Toaster, toast } from "sonner";
import useSearch from "../Hooks/useSearch";

const State = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  // 📂 Bulk Import & Preview States (Updated as per AddCoupon)
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewSummary, setPreviewSummary] = useState(null);
  const [importing, setImporting] = useState(false);

  const [stateName, setStateName] = useState("");
  const [viewData, setViewData] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination & Limit States
  const [activePage, setActivePage] = useState(1);
  const [inactivePage, setInactivePage] = useState(1);
  const [limit, setLimit] = useState(5);

  const activeState = useSearch(`${signupApi}state/active`, search, {
    page: activePage,
    limit,
    sort: sortOrder
  });

  const inactiveState = useSearch(`${signupApi}state/inactive`, search, {
    page: inactivePage,
    limit,
    sort: sortOrder
  });

  const loading = activeState.loading || inactiveState.loading;

  const activeRes = activeState.data || {};
  const states = activeRes.result || [];
  const activeTotalPages = activeRes.totalPages || 1;
  const activeCount = activeRes.total || 0;

  const inactiveRes = inactiveState.data || {};
  const inactiveStates = inactiveRes.result || [];
  const inactiveTotalPages = inactiveRes.totalPages || 1;
  const inactiveCount = inactiveRes.total || 0;

  const totalCount = activeCount + inactiveCount;

  const refreshData = () => {
    activeState.fetchData();
    inactiveState.fetchData();
  };

  // --- Bulk Import Functions ---
  const handleBulkPreview = async (e) => {
    e.preventDefault();

    if (!importFile) {
      toast.error("Please select an Excel or CSV file first.");
      return;
    }

    try {
      setImporting(true);

      const formData = new FormData();
      formData.append("file", importFile);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${signupApi}state/bulk-preview`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPreviewRows(response.data.rows || []);
      setPreviewSummary(response.data.summary || null);

      toast.success(response.data.message || "Preview generated successfully");

      setShowImportModal(false);
      setShowPreview(true);

    } catch (error) {
      console.log("BULK PREVIEW ERROR:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to generate preview");
    } finally {
      setImporting(false);
    }
  };

  const removePreviewRow = (rowNumber) => {
    const updatedRows = previewRows.filter((row) => row.rowNumber !== rowNumber);
    setPreviewRows(updatedRows);

    const valid = updatedRows.filter((row) => row.valid).length;
    const invalid = updatedRows.filter((row) => !row.valid).length;

    setPreviewSummary({
      totalRows: updatedRows.length,
      valid,
      invalid,
    });
  };

  const handleFinalImport = async () => {
    const validRows = previewRows.filter((row) => row.valid);

    if (validRows.length === 0) {
      toast.error("No valid states available for import");
      return;
    }

    try {
      setImporting(true);
      const statesData = validRows.map((row) => ({
        stateName: row.stateName,
      }));

      const token = localStorage.getItem("token");

      const response = await axios.post(`${signupApi}state/bulk-import`, {
        states: statesData,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message || "Bulk import completed");

      setShowPreview(false);
      setPreviewRows([]);
      setPreviewSummary(null);
      setImportFile(null);
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk import failed");
    } finally {
      setImporting(false);
    }
  };

  // --- Standard Operations ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stateName.trim()) {
      toast.error("State name is required");
      return;
    }

    try {
      const endpoint = isEdit ? `state/update/${editId}` : `state/create`;
      const method = isEdit ? axios.patch : axios.post;

      const token = localStorage.getItem("token");
      const response = await method(`${signupApi}${endpoint}`, { stateName }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(
        response.data.message ||
        (isEdit ? "State successfully modified." : "State successfully created.")
      );

      setStateName("");
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
      const token = localStorage.getItem("token");
      const response = await axios.get(`${signupApi}state/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setViewData(response.data.result);
      setShowViewModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch state details.");
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item._id);
    setStateName(item.stateName);
    setShowModal(true);
  };

  const handleInactive = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${signupApi}state/inactive/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.message || "State marked as inactive.");
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  const handleRestore = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${signupApi}state/restore/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.message || "State restored successfully.");
      refreshData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restore state.");
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${signupApi}state/${deleteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        response.data.message || "State permanently deleted."
      );

      setShowDeleteModal(false);
      setDeleteId(null);
      refreshData();

    } catch (error) {
      console.log("DELETE ERROR:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
        "Error executing deletion."
      );
    }
  };

  const codeFor = (name = "") =>
    name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();

  let currentDataset = activeTab === "active" ? states : inactiveStates;
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
            State Management
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-medium m-0">
            Manage geographical state nodes, jurisdiction limits, and regional classifications.
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
            onClick={() => setShowImportModal(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer flex-1 sm:flex-none"
          >
            <FileSpreadsheet size={16} />
            Bulk Import
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              setIsEdit(false);
              setStateName("");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer flex-1 sm:flex-none"
          >
            <Plus size={16} />
            Add State
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
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Active States</p>
            <h3 className="text-2xl font-bold text-emerald-600 font-['Space_Grotesk']">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-['IBM_Plex_Mono'] mb-1">Inactive States</p>
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
          onClick={() => {
            setActiveTab("active");
            setActivePage(1);
          }}
          className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${activeTab === "active"
            ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
        >
          Active States
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${activeTab === "active" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}>
            {activeCount}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("inactive");
            setInactivePage(1);
          }}
          className={`px-4 py-2.5 font-['Space_Grotesk',sans-serif] font-medium text-xs rounded-t-xl transition whitespace-nowrap border-b-2 -mb-[1px] flex items-center gap-2 ${activeTab === "inactive"
            ? "border-blue-600 text-blue-600 bg-white font-bold shadow-2xs"
            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
        >
          Inactive States
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-['IBM_Plex_Mono',monospace] font-bold ${activeTab === "inactive" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}>
            {inactiveCount}
          </span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search state name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActivePage(1);
              setInactivePage(1);
            }}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 h-11 rounded-xl text-xs font-medium outline-none focus:border-blue-500 transition shadow-2xs text-gray-900"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setActivePage(1);
                setInactivePage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
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
                <th className="px-6 py-3.5">State Name</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {currentDataset.length > 0 ? (
                currentDataset.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold bg-gray-100 border border-gray-200 text-gray-700 py-1 px-2.5 rounded-md">
                        {codeFor(item.stateName)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-gray-900 capitalize">
                      {item.stateName}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${activeTab === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "active" ? "bg-emerald-600" : "bg-gray-400"}`} />
                        {activeTab === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        {activeTab === "active" ? (
                          <>
                            <button onClick={() => handleView(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="View Details"><Eye size={14} /></button>
                            <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Edit State"><Edit size={14} /></button>
                            <button onClick={() => handleInactive(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-amber-600 hover:border-amber-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Mark Inactive"><Ban size={14} /></button>
                            <button onClick={() => confirmDelete(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Delete State"><Trash2 size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleRestore(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-emerald-600 hover:border-emerald-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Restore State"><RotateCcw size={14} /></button>
                            <button onClick={() => confirmDelete(item._id)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition shadow-2xs cursor-pointer" title="Delete Permanently"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-gray-400 text-xs font-medium">
                    No states found matching your criteria.
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

      {/* 📁 BULK IMPORT UPLOAD MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 relative border border-gray-200">
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-2 text-emerald-600">
              <FileSpreadsheet size={20} />
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900">Bulk Import States</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Upload an Excel (.xlsx) or CSV file containing state names matching your schema columns.
            </p>

            <form onSubmit={handleBulkPreview} className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 text-center bg-gray-50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      setImportFile(selectedFile);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-bold text-gray-800">
                  {importFile ? importFile.name : "Click to browse or drag & drop file"}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Supports XLSX, XLS, CSV format</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs cursor-pointer"
                >
                  {importing && <Loader2 size={14} className="animate-spin" />}
                  {importing ? "Generating Preview..." : "Upload & Preview"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👁️ BULK IMPORT PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">
                    Review State Import
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Review your state data before importing. Remove invalid rows to proceed.
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Summary */}
            {previewSummary && (
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                    <p className="text-lg font-bold text-gray-900">{previewSummary.totalRows}</p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-[10px] text-emerald-600 uppercase font-bold">Valid</p>
                    <p className="text-lg font-bold text-emerald-700">{previewSummary.valid}</p>
                  </div>
                  <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-[10px] text-rose-600 uppercase font-bold">Issues</p>
                    <p className="text-lg font-bold text-rose-700">{previewSummary.invalid}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Row</th>
                    <th className="px-4 py-3">State Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Validation Message</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-100 ${row.valid ? "hover:bg-gray-50" : "bg-rose-50/60"
                        }`}
                    >
                      <td className="px-4 py-4 text-xs font-mono text-gray-500">{row.rowNumber}</td>
                      <td className="px-4 py-4">
                        <span className="font-['IBM_Plex_Mono'] text-xs font-bold text-gray-900 capitalize">
                          {row.stateName || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 size={14} />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-bold">
                            <AlertTriangle size={14} />
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {row.valid ? (
                          <span className="text-xs text-gray-500">—</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {row.errors.map((error, errorIndex) => (
                              <span
                                key={errorIndex}
                                className="text-[10px] text-rose-600 font-semibold whitespace-nowrap"
                              >
                                ✕ {error}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removePreviewRow(row.rowNumber)}
                          title="Remove this state"
                          className="w-8 h-8 inline-flex items-center justify-center shrink-0 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 transition cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setShowImportModal(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              >
                ← Change File
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewRows([]);
                    setPreviewSummary(null);
                    setImportFile(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleFinalImport}
                  disabled={
                    importing ||
                    !previewSummary ||
                    previewSummary.invalid > 0 ||
                    previewRows.length === 0
                  }
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {importing
                    ? "Importing..."
                    : `Import ${previewSummary?.valid || 0} States`}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-[420px] shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => { setShowModal(false); setStateName(""); setIsEdit(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-gray-900 mb-1">
              {isEdit ? "Update State Record" : "Add New State"}
            </h2>
            <p className="text-gray-500 text-xs font-medium mb-6">
              Configure official state nomenclature for regional distribution.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['IBM_Plex_Mono'] mb-2">State Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajasthan"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  autoFocus
                  className="w-full h-11 rounded-xl border border-gray-200 px-4 text-xs outline-none transition focus:border-blue-500 shadow-2xs text-gray-900 font-semibold bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setStateName(""); setIsEdit(false); }}
                  className="h-10 px-5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 transition shadow-2xs cursor-pointer"
                >
                  {isEdit ? "Save Changes" : "Create State"}
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
              State Inspection Profile
            </h2>

            <div className="space-y-3 text-xs mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  State Name
                </p>
                <p className="text-sm font-bold text-gray-900 capitalize">
                  {viewData?.stateName}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-['IBM_Plex_Mono'] text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Regional Code
                </p>
                <p className="font-['IBM_Plex_Mono'] font-bold text-blue-600 text-sm">
                  {codeFor(viewData?.stateName)}
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
              Are you sure you want to delete this state record? This action cannot be undone and may affect linked districts.
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

export default State;