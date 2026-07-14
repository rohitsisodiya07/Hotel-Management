import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { signupApi } from "../api";

const City = () => {
  const [showModal, setShowModal] =
    useState(false);

  const [showViewModal,
    setShowViewModal] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [activeTab,
    setActiveTab] =
    useState("active");

  const [cityName, setCityName] =
    useState("");

  const [districtId,
    setDistrictId] =
    useState("");

  const [districts,
    setDistricts] = useState([]);

  const [cities,
    setCities] = useState([]);

  const [inactiveCities,
    setInactiveCities] =
    useState([]);

  const [viewData,
    setViewData] =
    useState(null);

  const [isEdit,
    setIsEdit] =
    useState(false);

  const [editId,
    setEditId] =
    useState("");

  // Search & Sort
  const [search,
    setSearch] =
    useState("");

  const [sort,
    setSort] =
    useState("asc");

  const [districtFilter,
    setDistrictFilter] =
    useState("");

  // ================= DISTRICTS =================
  const getDistricts =
    async () => {
      try {
        const response =
          await axios.get(
            `${signupApi}district/active`
          );

        setDistricts(
          response.data.result
        );
      } catch (error) {
        console.log(error);
      }
    };

  // ================= ACTIVE CITIES =================
  const getCities =
    async () => {
      try {
        setLoading(true);

        const response =
          await axios.get(
            `${signupApi}city/active`
          );

        setCities(
          response.data.result
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  // ================= INACTIVE CITIES =================
  const getInactiveCities =
    async () => {
      try {
        const response =
          await axios.get(
            `${signupApi}city/inactive`
          );

        setInactiveCities(
          response.data.result
        );
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
  const handleSubmit =
    async () => {
      if (
        !cityName.trim() ||
        !districtId
      ) {
        return alert(
          "City name and District are required"
        );
      }

      try {
        let response;

        if (isEdit) {
          response =
            await axios.patch(
              `${signupApi}city/update/${editId}`,
              {
                cityName,
                districtId,
              }
            );
        } else {
          response =
            await axios.post(
              `${signupApi}city/create`,
              {
                cityName,
                districtId,
              }
            );
        }

        alert(
          response.data.message
        );

        setCityName("");
        setDistrictId("");
        setShowModal(false);
        setIsEdit(false);
        setEditId("");

        getCities();
        getInactiveCities();
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
      const response = await axios.get(
        `${signupApi}city/${id}`
      );

      console.log(response.data);
      console.log("model", showViewModal);

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
    setCityName(
      item.cityName
    );
    setDistrictId(
      item.districtId?._id
    );
    setShowModal(true);
  };

  // ================= INACTIVE =================
  const handleInactive = async (id) => {
    try {
      const response =
        await axios.patch(
          `${signupApi}city/inactive/${id}`
        );

      alert(
        response.data.message
      );

      getCities();
      getInactiveCities();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= RESTORE =================
  const handleRestore = async (id) => {
    try {
      const response =
        await axios.patch(
          `${signupApi}city/restore/${id}`
        );

      alert(
        response.data.message
      );

      getCities();
      getInactiveCities();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      const response =
        await axios.delete(
          `${signupApi}city/${id}`
        );

      alert(
        response.data.message
      );

      getCities();
      getInactiveCities();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= SEARCH & SORT =================
  const filteredCities = useMemo(() => {
    let data =
      activeTab === "active"
        ? [...cities]
        : [...inactiveCities];

    if (search) {
      data = data.filter(
        (item) =>
          item.cityName
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }

    if (districtFilter) {
      data = data.filter(
        (item) =>
          item.districtId?._id ===
          districtFilter
      );
    }

    data.sort((a, b) =>
      sort === "asc"
        ? a.cityName.localeCompare(
          b.cityName
        )
        : b.cityName.localeCompare(
          a.cityName
        )
    );

    return data;
  }, [
    cities,
    inactiveCities,
    search,
    sort,
    districtFilter,
    activeTab,
  ]);

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
            City Management
          </h1>
          <p className="text-[#8C8478] text-sm mt-1">
            Cities are grouped under their parent district.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setIsEdit(false);
            setCityName("");
            setDistrictId("");
          }}
          className="w-11 h-11 rounded-full bg-[#1A1815] text-[#C6A15B] text-2xl flex items-center justify-center hover:bg-[#26221D] transition-colors duration-200 shadow-sm cursor-pointer"
          title="Add City"
        >
          +
        </button>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[#E8E2D5] p-3 rounded-xl text-sm outline-none focus:border-[#C6A15B] transition-colors duration-200 bg-white"
        />

        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="border border-[#E8E2D5] p-3 rounded-xl text-sm outline-none focus:border-[#C6A15B] bg-white cursor-pointer"
        >
          <option value="">All Districts</option>

          {districts.map((item) => (
            <option key={item._id} value={item._id}>
              {item.districtName}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-[#E8E2D5] p-3 rounded-xl text-sm outline-none focus:border-[#C6A15B] bg-white cursor-pointer"
        >
          <option value="asc">A – Z</option>
          <option value="desc">Z – A</option>
        </select>
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

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-[#A39B8B] font-display text-lg">
          Loading…
        </div>
      ) : (
        <div className="border border-[#EFEAE0] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FAF8F3]">
              <tr>
                <th className="p-4 text-left text-xs uppercase tracking-[0.12em] text-[#8C8478] font-medium">
                  City
                </th>
                <th className="p-4 text-left text-xs uppercase tracking-[0.12em] text-[#8C8478] font-medium">
                  District
                </th>
                <th className="p-4 text-center text-xs uppercase tracking-[0.12em] text-[#8C8478] font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-10 text-[#A39B8B]">
                    No city found
                  </td>
                </tr>
              ) : (
                filteredCities.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-[#EFEAE0] hover:bg-[#FAF8F3] transition-colors duration-150"
                  >
                    <td className="p-4 capitalize text-[#26221D] font-medium text-[15px]">
                      {item.cityName}
                    </td>

                    <td className="p-4 capitalize text-[#5A554C] text-sm">
                      {item.districtId?.districtName}
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
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1A1815]/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[420px] border-t-2 border-[#C6A15B] shadow-2xl">
            <h2 className="font-display text-2xl text-[#26221D] mb-6">
              {isEdit ? "Update City" : "Add City"}
            </h2>

            <input
              type="text"
              placeholder="Enter city name"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="w-full border border-[#E8E2D5] p-3 rounded-xl mb-4 text-sm outline-none focus:border-[#C6A15B] transition-colors duration-200"
            />

            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full border border-[#E8E2D5] p-3 rounded-xl mb-6 text-sm outline-none focus:border-[#C6A15B] bg-white cursor-pointer"
            >
              <option value="">Select district</option>

              {districts.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.districtName}
                </option>
              ))}
            </select>

            <div className="flex gap-3 justify-end">
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
                {isEdit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 bg-[#1A1815]/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[420px] border-t-2 border-[#C6A15B] shadow-2xl">
            <h2 className="font-display text-2xl text-[#26221D] mb-6">
              City Details
            </h2>

            <div className="space-y-4 mb-6">
              <div className="pb-4 border-b border-[#EFEAE0]">
                <p className="text-xs uppercase tracking-[0.12em] text-[#8C8478] mb-1.5">
                  City Name
                </p>
                <p className="text-lg text-[#26221D] font-medium capitalize">
                  {viewData.cityName}
                </p>
              </div>

              <div className="pb-4 border-b border-[#EFEAE0]">
                <p className="text-xs uppercase tracking-[0.12em] text-[#8C8478] mb-1.5">
                  District
                </p>
                <p className="text-lg text-[#26221D] font-medium capitalize">
                  {viewData.districtId?.districtName}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#8C8478] mb-1.5">
                  Status
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${viewData.status === "active"
                      ? "bg-[#4A7C4E]/10 text-[#4A7C4E]"
                      : "bg-[#B4483A]/10 text-[#B4483A]"
                    }`}
                >
                  {viewData.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-[#1A1815] text-[#C6A15B] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#26221D] transition-colors duration-200 cursor-pointer"
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