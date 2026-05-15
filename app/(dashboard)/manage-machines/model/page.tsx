// app/manage-machines/model/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  Save,
} from "lucide-react";

interface MachineModel {
  id: number;
  srNo: number;
  machine_id: number;
  machine_name: string;
  model_name: string;
  serial_no: string;
}

interface Machine {
  id: number;
  name: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function MachineModelPage() {
  const [models, setModels] = useState<MachineModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<MachineModel[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedModel, setSelectedModel] = useState<MachineModel | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    machineId: "",
    modelName: "",
    serialNo: ""
  });

  useEffect(() => {
    fetchModels();
    fetchMachines();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/machine-models`);
      if (!res.ok) throw new Error("Failed to fetch machine models");
      const data = await res.json();
      const mapped = data.map((m: any, i: number) => ({
        ...m,
        srNo: i + 1,
        modelName: m.model_name,
        machineName: m.machine_name,
        serialNo: m.serial_no
      }));
      setModels(mapped);
      setFilteredModels(mapped);
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await fetch(`${API_BASE}/machines`);
      if (res.ok) {
        setMachines(await res.json());
      }
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddModel = async () => {
    if (!formData.machineId || !formData.modelName) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        machine_id: parseInt(formData.machineId),
        model_name: formData.modelName,
        serial_no: formData.serialNo || null
      };

      const res = await fetch(`${API_BASE}/models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add model");
      }

      await fetchModels();
      setShowAddModal(false);
      resetForm();
      alert("Machine model added successfully!");
    } catch (error: any) {
      console.error("Error adding model:", error);
      alert(error.message || "Failed to add model");
    }
  };

  const handleEditModel = async () => {
    if (!selectedModel) return;
    if (!formData.machineId || !formData.modelName) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        machine_id: parseInt(formData.machineId),
        model_name: formData.modelName,
        serial_no: formData.serialNo || null
      };

      const res = await fetch(`${API_BASE}/models/${selectedModel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update model");
      }

      await fetchModels();
      setShowEditModal(false);
      resetForm();
      alert("Machine model updated successfully!");
    } catch (error: any) {
      console.error("Error updating model:", error);
      alert(error.message || "Failed to update model");
    }
  };

  const handleDeleteModel = async () => {
    if (!selectedModel) return;

    try {
      const res = await fetch(`${API_BASE}/models/${selectedModel.id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete model");

      await fetchModels();
      setShowDeleteConfirm(false);
      setSelectedModel(null);
      alert("Machine model deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting model:", error);
      alert(error.message || "Failed to delete model");
    }
  };

  const openEditModal = (model: MachineModel) => {
    setSelectedModel(model);
    setFormData({
      machineId: model.machine_id.toString(),
      modelName: model.model_name,
      serialNo: model.serial_no || ""
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (model: MachineModel) => {
    setSelectedModel(model);
    setShowDeleteConfirm(true);
  };

  const resetForm = () => {
    setFormData({
      machineId: "",
      modelName: "",
      serialNo: ""
    });
    setSelectedModel(null);
  };

  const applyFilters = () => {
    let filtered = [...models];
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.machine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.serial_no || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredModels(filtered);
    setCurrentPage(1);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredModels.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredModels.length / recordsPerPage);

  const exportToCSV = () => {
    const headers = ["Sr No.", "Machine Name", "Machine Model", "Serial No."];
    const csvData = filteredModels.map(m => [
      m.srNo,
      m.machine_name,
      m.model_name,
      m.serial_no
    ]);
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "machine-models.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Machine Model</h1>
        <p className="text-gray-600 mt-1">Manage and view all machine models</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg hover:bg-[#1b5e20]"
            >
              Apply
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Download size={18} /> Export
            </button>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg flex items-center gap-2"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sr No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading models...
                  </td>
                </tr>
              ) : currentRecords.length > 0 ? (
                currentRecords.map((model, index) => (
                  <tr key={model.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-black">{indexOfFirstRecord + index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-black">{model.machine_name}</td>
                    <td className="px-6 py-4 text-sm text-black">{model.model_name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-black">{model.serial_no || "—"}</td>
                    <td className="px-6 py-4 text-sm">
                      <button onClick={() => openEditModal(model)} className="text-blue-600 mr-3"><Edit size={18} /></button>
                      <button onClick={() => openDeleteConfirm(model)} className="text-red-600"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No machine models found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredModels.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm mt-4 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={recordsPerPage}
              onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing <strong>{indexOfFirstRecord + 1}</strong>–<strong>{Math.min(indexOfLastRecord, filteredModels.length)}</strong> of <strong>{filteredModels.length}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-black px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-black">Add Machine Model</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Machine Name</label>
                <select
                  value={formData.machineId}
                  onChange={(e) => handleInputChange("machineId", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                >
                  <option value="">Select Machine</option>
                  {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Model Name</label>
                <input
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => handleInputChange("modelName", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Serial No.</label>
                <input
                  type="text"
                  value={formData.serialNo}
                  onChange={(e) => handleInputChange("serialNo", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg text-black">Cancel</button>
              <button onClick={handleAddModel} className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg">Save Model</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-black">Edit Machine Model</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Machine Name</label>
                <select
                  value={formData.machineId}
                  onChange={(e) => handleInputChange("machineId", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                >
                  <option value="">Select Machine</option>
                  {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Model Name</label>
                <input
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => handleInputChange("modelName", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Serial No.</label>
                <input
                  type="text"
                  value={formData.serialNo}
                  onChange={(e) => handleInputChange("serialNo", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-black"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg text-black">Cancel</button>
              <button onClick={handleEditModel} className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg">Update Model</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2 text-black">Confirm Delete</h2>
            <p className="mb-6 text-black">Are you sure you want to delete {selectedModel.model_name}?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-lg text-black">Cancel</button>
              <button onClick={handleDeleteModel} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}