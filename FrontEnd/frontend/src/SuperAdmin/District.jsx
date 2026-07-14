import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { signupApi } from "../api";

const District = () => {
  const [showModal, setShowModal] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("active");

  const [districtName, setDistrictName] =
    useState("");

  const [stateId, setStateId] =
    useState("");

  const [states, setStates] = useState([]);

  const [districts, setDistricts] =
    useState([]);

  const [
    inactiveDistricts,
    setInactiveDistricts,
  ] = useState([]);

  const [viewData, setViewData] =
    useState(null);

  const [
    showViewModal,
    setShowViewModal,
  ] = useState(false);

  const [isEdit, setIsEdit] =
    useState(false);

  const [editId, setEditId] =
    useState("");

  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);


  // ================= STATES =================
  const getStates = async () => {
    try {
      const response = await axios.get(
        `${signupApi}state/active`
      );

      setStates(response.data.result);
    } catch (error) {
      console.log(error);
    }
  };


  // ================= ACTIVE DISTRICTS =================
  const getDistricts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${signupApi}district/active`
      );

      setDistricts(response.data.result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= INACTIVE DISTRICTS =================
  const getInactiveDistricts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${signupApi}district/inactive`
      );

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

  // ================= CREATE & UPDATE =================
  const handleSubmit = async () => {
    if (
      !districtName.trim() ||
      !stateId
    ) {
      return alert(
        "District name and State are required"
      );
    }

    try {
      let response;

      if (isEdit) {
        response =
          await axios.patch(
            `${signupApi}district/update/${editId}`,
            {
              districtName,
              stateId,
            }
          );
      } else {
        response =
          await axios.post(
            `${signupApi}district/create`,
            {
              districtName,
              stateId,
            }
          );
      }

      alert(
        response.data.message
      );

      setDistrictName("");
      setStateId("");
      setShowModal(false);
      setIsEdit(false);
      setEditId("");

      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      alert(
        error.response?.data
          ?.message ||
        "Something went wrong"
      );
    }
  };

  // ================= VIEW =================
  const handleView = async (id) => {
    try {
      const response =
        await axios.get(
          `${signupApi}district/${id}`
        );

      setViewData(
        response.data.result
      );

      setShowViewModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= EDIT =================
  const handleEdit = (
    item
  ) => {
    setIsEdit(true);
    setEditId(item._id);
    setDistrictName(
      item.districtName
    );
    setStateId(
      item.stateId?._id
    );
    setShowModal(true);
  };

  // ================= INACTIVE =================
  const handleInactive = async (id) => {
    try {
      const response =
        await axios.patch(
          `${signupApi}district/inactive/${id}`
        );

      alert(
        response.data.message
      );

      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= RESTORE =================
  const handleRestore = async (id) => {
    try {
      const response =
        await axios.patch(
          `${signupApi}district/restore/${id}`
        );

      alert(
        response.data.message
      );

      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      const response =
        await axios.delete(
          `${signupApi}district/${id}`
        );

      alert(
        response.data.message
      );

      getDistricts();
      getInactiveDistricts();
    } catch (error) {
      console.log(error);
    }
  };

  const currentData =
    activeTab === "active"
      ? districts
      : inactiveDistricts;

  const filteredData = currentData
    .filter((item) => {
      const districtMatch =
        item.districtName
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const stateMatch =
        filterState === ""
          ? true
          : item.stateId?._id === filterState;

      return districtMatch && stateMatch;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.districtName.localeCompare(
          b.districtName
        );
      }

      return b.districtName.localeCompare(
        a.districtName
      );
    });

  return (
    <div className="font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="font-display text-[26px] text-[#26221D]">
            District Management
          </h1>
          <p className="text-[#8C8478] text-sm mt-1">
            Districts are grouped under their parent state.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setIsEdit(false);
            setDistrictName("");
            setStateId("");
          }}
          className="w-11 h-11 rounded-full bg-[#1A1815] text-[#C6A15B] text-2xl flex items-center justify-center hover:bg-[#26221D] transition-colors duration-200 shadow-sm cursor-pointer"
          title="Add District"
        >
          +
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#E8E2D5]">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-5 py-2.5 text-sm font-medium tracking-wide -mb-px border-b-2 transition-colors duration-200 cursor-pointer ${activeTab === "active"
              ? "border-[#C6A15B] text-[#26221D]"
              : "border-transparent text-[#A39B8B] hover:text-[#26221D]"
            }`}
        >
          Active
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`px-5 py-2.5 text-sm font-medium tracking-wide -mb-px border-b-2 transition-colors duration-200 cursor-pointer ${activeTab === "inactive"
              ? "border-[#B4483A] text-[#26221D]"
              : "border-transparent text-[#A39B8B] hover:text-[#26221D]"
            }`}
        >
          Inactive
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[#E8E2D5] p-3 rounded-xl w-[260px] text-sm outline-none focus:border-[#C6A15B] transition-colors duration-200 bg-white"
        />

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="border border-[#E8E2D5] p-3 rounded-xl text-sm outline-none focus:border-[#C6A15B] bg-white cursor-pointer"
        >
          <option value="">All States</option>

          {states.map((item) => (
            <option key={item._id} value={item._id}>
              {item.stateName}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-[#E8E2D5] p-3 rounded-xl text-sm outline-none focus:border-[#C6A15B] bg-white cursor-pointer"
        >
          <option value="asc">A – Z</option>
          <option value="desc">Z – A</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-[#EFEAE0] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAF8F3]">
            <tr>
              <th className="p-4 text-left text-xs uppercase tracking-[0.12em] text-[#8C8478] font-medium">
                District
              </th>
              <th className="p-4 text-left text-xs uppercase tracking-[0.12em] text-[#8C8478] font-medium">
                State
              </th>
              <th className="p-4 text-center text-xs uppercase tracking-[0.12em] text-[#8C8478] font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-16 text-[#A39B8B] font-display text-lg">
                  Loading…
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-10 text-[#A39B8B]">
                  No district found
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-[#EFEAE0] hover:bg-[#FAF8F3] transition-colors duration-150"
                >
                  <td className="p-4 capitalize text-[#26221D] font-medium text-[15px]">
                    {item.districtName}
                  </td>

                  <td className="p-4 capitalize text-[#5A554C] text-sm">
                    {item.stateId?.stateName}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2 flex-wrap">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(item._id)}
                            className="text-[#3D6B8C] border border-[#3D6B8C]/25 hover:bg-[#3D6B8C] hover:text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleEdit(item)}
                            className="text-[#4A7C4E] border border-[#4A7C4E]/25 hover:bg-[#4A7C4E] hover:text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleInactive(item._id)}
                            className="text-[#B08D2A] border border-[#B08D2A]/25 hover:bg-[#B08D2A] hover:text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                          >
                            Inactive
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-[#B4483A] border border-[#B4483A]/25 hover:bg-[#B4483A] hover:text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(item._id)}
                            className="text-[#4A7C4E] border border-[#4A7C4E]/25 hover:bg-[#4A7C4E] hover:text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                          >
                            Restore
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-[#B4483A] border border-[#B4483A]/25 hover:bg-[#B4483A] hover:text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                          >
                            Delete
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1A1815]/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[450px] border-t-2 border-[#C6A15B] shadow-2xl">
            <h2 className="font-display text-2xl text-[#26221D] mb-6">
              {isEdit ? "Update District" : "Add District"}
            </h2>

            <input
              type="text"
              placeholder="Enter district name"
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              className="w-full border border-[#E8E2D5] p-3 rounded-xl mb-4 text-sm outline-none focus:border-[#C6A15B] transition-colors duration-200"
            />

            <select
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              className="w-full border border-[#E8E2D5] p-3 rounded-xl mb-6 text-sm outline-none focus:border-[#C6A15B] bg-white cursor-pointer"
            >
              <option value="">Select state</option>

              {states.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.stateName}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-[#F6F3EC] text-[#8C8478] rounded-lg text-sm font-medium hover:bg-[#EFEAE0] transition-colors duration-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-[#1A1815] text-[#C6A15B] rounded-lg text-sm font-medium hover:bg-[#26221D] transition-colors duration-200 cursor-pointer"
              >
                {isEdit ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-[#1A1815]/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[420px] border-t-2 border-[#C6A15B] shadow-2xl">
            <h2 className="font-display text-2xl text-[#26221D] mb-6">
              District Details
            </h2>

            <div className="mb-4 pb-4 border-b border-[#EFEAE0]">
              <p className="text-xs uppercase tracking-[0.12em] text-[#8C8478] mb-1.5">
                District
              </p>
              <p className="text-lg text-[#26221D] font-medium capitalize">
                {viewData?.districtName}
              </p>
            </div>

            <div className="mb-6 pb-5 border-b border-[#EFEAE0]">
              <p className="text-xs uppercase tracking-[0.12em] text-[#8C8478] mb-1.5">
                State
              </p>
              <p className="text-lg text-[#26221D] font-medium capitalize">
                {viewData?.stateId?.stateName}
              </p>
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              className="bg-[#1A1815] text-[#C6A15B] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#26221D] transition-colors duration-200 cursor-pointer"
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