import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";
import CustomSelect from "../../components/CustomSelect";

const initialForm = {
  buildingId: "",
  title: "",
  content: "",
  displayOrder: 0,
  isActive: true,
};

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  return String(role || "").trim().toUpperCase();
}

function getUserRole() {
  const user = getStoredUser();
  return normalizeRole(user?.role || localStorage.getItem("role"));
}

export default function ParkingRulesPage() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(() => localStorage.getItem("activeSystemBuildingId") || "");
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search & Filter
  const [keyword, setKeyword] = useState("");
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = getUserRole();
  const canManage = ["ADMIN", "MANAGER"].includes(userRole);

  useEffect(() => {
    const handleBuildingChange = (e) => {
      setSelectedBuildingId(e.detail);
    };
    window.addEventListener("systemBuildingChanged", handleBuildingChange);
    return () => {
      window.removeEventListener("systemBuildingChanged", handleBuildingChange);
    };
  }, []);

  // Fetch buildings on mount
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await apiRequest("buildings");
        const list = res.data || [];
        setBuildings(list);
        
        const activeId = localStorage.getItem("activeSystemBuildingId");
        if (activeId) {
          setSelectedBuildingId(activeId);
        } else if (list.length > 0) {
          const firstBuildingId = list[0].id;
          setSelectedBuildingId(firstBuildingId);
          localStorage.setItem("activeSystemBuildingId", firstBuildingId);
          window.dispatchEvent(new CustomEvent("systemBuildingChanged", { detail: firstBuildingId }));
        }
      } catch (err) {
        console.error("Error fetching buildings:", err);
        setError("Failed to load buildings.");
      }
    };
    fetchBuildings();
  }, []);

  // Fetch rules when selected building changes
  useEffect(() => {
    if (!selectedBuildingId) return;

    const fetchRules = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest(`rules/building/${selectedBuildingId}`);
        setRules(res.data || []);
      } catch (err) {
        console.error("Error fetching rules:", err);
        setError("Failed to load rules for this building.");
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [selectedBuildingId]);

  // Filter and search rules (checks both title and content)
  const filteredRules = useMemo(() => {
    return rules
      .filter((rule) => {
        if (!keyword.trim()) return true;
        const kw = keyword.toLowerCase();
        return (
          (rule.title || "").toLowerCase().includes(kw) ||
          rule.content.toLowerCase().includes(kw)
        );
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [rules, keyword]);

  // Auto-hide alert messages
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setFormData({
      buildingId: selectedBuildingId,
      title: "",
      content: "",
      displayOrder: rules.length, // Default display order to end of list
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      buildingId: rule.buildingId,
      title: rule.title || "",
      content: rule.content,
      displayOrder: rule.displayOrder,
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Rule title is required.");
      return;
    }
    if (!formData.content.trim()) {
      setError("Rule content is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      buildingId: formData.buildingId,
      title: formData.title.trim(),
      content: formData.content.trim(),
      displayOrder: parseInt(formData.displayOrder) || 0,
      isActive: formData.isActive,
    };

    try {
      if (editingRule) {
        // Update
        const res = await apiRequest(`rules/${editingRule.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setRules((prev) =>
          prev.map((r) => (r.id === editingRule.id ? res.data : r))
        );
        setSuccessMsg("Parking rule updated successfully.");
      } else {
        // Create
        const res = await apiRequest("rules", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        // If building matches currently selected building, add it
        if (payload.buildingId === selectedBuildingId) {
          setRules((prev) => [...prev, res.data]);
        }
        setSuccessMsg("Parking rule created successfully.");
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving rule:", err);
      setError(err.message || "Failed to save parking rule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this parking rule?")) {
      return;
    }

    try {
      await apiRequest(`rules/${id}`, {
        method: "DELETE",
      });
      setRules((prev) => prev.filter((r) => r.id !== id));
      setSuccessMsg("Parking rule deleted successfully.");
    } catch (err) {
      console.error("Error deleting rule:", err);
      setError("Failed to delete parking rule.");
    }
  };

  const handleToggleStatus = async (rule) => {
    const payload = {
      buildingId: rule.buildingId,
      title: rule.title,
      content: rule.content,
      displayOrder: rule.displayOrder,
      isActive: !rule.isActive,
    };

    try {
      const res = await apiRequest(`rules/${rule.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? res.data : r))
      );
      setSuccessMsg(`Rule ${!rule.isActive ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      console.error("Error toggling status:", err);
      setError("Failed to update rule status.");
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Alerts */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800 shadow-sm transition-all duration-300">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800 shadow-sm transition-all duration-300">
            <span className="material-symbols-outlined text-red-600">error</span>
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Hero Banner */}
        <section className="relative mb-7 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-6 shadow-sm md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/70 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-600 shadow-sm">
                <span className="material-symbols-outlined text-base">policy</span>
                Parking Rules
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Manage Building Rules
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Configure guidelines, booking terms, and regulatory notices for guests and drivers on a per-building basis. Active rules are instantly visible on the public landing portal.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                  {rules.length} total rules
                </span>
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Active building ID: {selectedBuildingId || "None"}
                </span>
              </div>
            </div>

            {canManage && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                disabled={!selectedBuildingId}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                Add Rule
              </button>
            )}
          </div>
        </section>

        {/* Toolbar & Filters */}
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Building Selector */}
            <div className="w-full md:w-80">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Parking Building
              </label>
              <CustomSelect
                options={buildings.map(b => ({ value: b.id, label: `${b.name} (${b.address})` }))}
                value={selectedBuildingId}
                onChange={(val) => {
                  setSelectedBuildingId(val);
                  localStorage.setItem("activeSystemBuildingId", val);
                  window.dispatchEvent(new CustomEvent("systemBuildingChanged", { detail: val }));
                }}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705]"
              />
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Search Rule
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Filter rules by title or content keywords..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Rules Table / Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm font-semibold text-slate-500">Loading parking rules...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
              format_list_bulleted
            </span>
            <h3 className="text-lg font-bold text-slate-800">No Parking Rules Found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              {keyword ? "No rules match your search query." : "There are no rules defined for this building yet."}
            </p>
            {!keyword && canManage && (
              <button
                onClick={handleOpenAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition"
              >
                Create first rule
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4 pl-6 w-24">Order</th>
                    <th className="p-4 w-1/3">Rule Title</th>
                    <th className="p-4">Rule Content</th>
                    <th className="p-4 w-32">Status</th>
                    <th className="p-4 w-36 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="p-4 pl-6">
                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {rule.displayOrder}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900 max-w-[220px] leading-relaxed">
                        {rule.title}
                      </td>
                      <td className="p-4 font-medium text-slate-600 leading-relaxed">
                        {rule.content}
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => canManage && handleToggleStatus(rule)}
                          disabled={!canManage}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm transition ${
                            rule.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100/70"
                              : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/70"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${rule.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {rule.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(rule)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                            title="Edit rule"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                              title="Delete rule"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRule ? "Edit Parking Rule" : "Add Parking Rule"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                
                {/* Target Building (Disabled when editing) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Parking Building
                  </label>
                  <CustomSelect
                    options={buildings.map(b => ({ value: b.id, label: b.name }))}
                    value={formData.buildingId}
                    onChange={(val) => {
                      setFormData((prev) => ({
                        ...prev,
                        buildingId: val
                      }));
                    }}
                    disabled={!!editingRule}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-[#fbf4e7] dark:focus:bg-[#070705]"
                  />
                </div>

                {/* Rule Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Rule Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="Enter short rule title (e.g. Reserve before arrival)..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-850 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>

                {/* Rule Content */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Rule Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    rows="4"
                    placeholder="Enter parking guideline details..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleFormChange}
                    min="0"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-400 font-medium">
                    Determines the listing order (ascending). Low numbers appear first.
                  </p>
                </div>

                {/* Status Checkbox */}
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    Mark as Active
                  </label>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-12 rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingRule ? "Save Changes" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
