// app/manage-machines/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Plus,
  X,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Machine {
  id: number;
  srNo: number;
  name: string;
  photo: string | null;
  image_url: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ManageMachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    photo: "" as string,
  });

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/machines`);
      if (!res.ok) throw new Error("Failed to fetch machines");
      const data = await res.json();
      const mapped = data.map((m: any, i: number) => ({ ...m, srNo: i + 1 }));
      setMachines(mapped);
      setFilteredMachines(mapped);
    } catch (error) {
      console.error("Error fetching machines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Only jpg, png, jpeg files are accepted");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setFormData(prev => ({ ...prev, photo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMachine = async () => {
    if (!formData.name) {
      alert("Please enter machine name");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        photo: (formData.photo && formData.photo.trim() !== "") ? formData.photo : null,
        description: null,
      };
      const res = await fetch(`${API_BASE}/machines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add machine");
      }
      await fetchMachines();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding machine:", error);
      alert(error.message || "Failed to add machine");
    }
  };

  const handleEditMachine = async () => {
    if (!selectedMachine) return;
    if (!formData.name) {
      alert("Please enter machine name");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        photo: (formData.photo && formData.photo.trim() !== "") ? formData.photo : null,
        description: null,
      };
      const res = await fetch(`${API_BASE}/machines/${selectedMachine.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update machine");
      }
      await fetchMachines();
      setShowEditModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Error updating machine:", error);
      alert(error.message || "Failed to update machine");
    }
  };

  const handleDeleteMachine = async () => {
    if (!selectedMachine) return;

    try {
      const res = await fetch(`${API_BASE}/machines/${selectedMachine.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to delete machine");
      }
      await fetchMachines();
      setShowDeleteConfirm(false);
      setSelectedMachine(null);
    } catch (error: any) {
      console.error("Error deleting machine:", error);
      alert(error.message || "Failed to delete machine");
    }
  };

  const openEditModal = (machine: Machine) => {
    setSelectedMachine(machine);
    const photoUrl = (machine.photo && machine.photo.trim() !== "")
      ? machine.photo
      : (machine.image_url && machine.image_url.trim() !== "")
        ? machine.image_url
        : "";
    setFormData({
      name: machine.name,
      photo: photoUrl,
    });
    setPreviewImage(photoUrl !== "" ? photoUrl : null);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowDeleteConfirm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", photo: "" });
    setPreviewImage(null);
    setSelectedMachine(null);
  };

  const applyFilters = () => {
    let filtered = [...machines];
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMachines(filtered);
    setCurrentPage(1);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredMachines.slice(indexOfFirstRecord, indexOfLastRecord);

  const exportToCSV = () => {
    const headers = ["Sr No.", "Name"];
    const csvData = filteredMachines.map(m => [m.srNo, m.name]);
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "machines.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Reusable photo upload field
  const PhotoUploadField = ({ inputId }: { inputId: string }) => (
    <div>
      <label className="block text-sm font-medium mb-1 text-black">Machine Photo</label>
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-black flex items-center gap-2 text-sm"
        >
          <Upload size={16} />
          Choose File
        </label>
        <span className="text-sm text-gray-500">
          {previewImage ? "File selected" : "No file chosen"}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">Only jpg, png, jpeg files accepted</p>
      {previewImage && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewImage} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">All Machine List</h1>
        <p className="text-gray-600 mt-1">Manage and view all machine details</p>
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
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            <button onClick={applyFilters} className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg">Apply</button>
          </div>
          <div className="flex gap-3">
            <button onClick={exportToCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
              <Download size={18} /> Export
            </button>
            <button onClick={() => { resetForm(); setShowAddModal(true); }} className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg flex items-center gap-2">
              <Plus size={18} /> Add Machine
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sr No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2e7d32]"></div>
                    Loading machines...
                  </div>
                </td>
              </tr>
            ) : currentRecords.length > 0 ? (
              currentRecords.map((m) => {
                const photoSrc = (m.photo && m.photo.trim() !== "")
                  ? m.photo
                  : (m.image_url && m.image_url.trim() !== "")
                    ? m.image_url
                    : null;
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-black">{m.srNo}</td>
                    <td className="px-6 py-4">
                      {photoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoSrc}
                          alt={m.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-black">{m.name}</td>
                    <td className="px-6 py-4 text-sm flex gap-3 items-center">
                      <button onClick={() => openEditModal(m)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                      <button onClick={() => openDeleteConfirm(m)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No machines found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredMachines.length > 0 && (
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
              Showing <strong>{indexOfFirstRecord + 1}</strong>–<strong>{Math.min(indexOfLastRecord, filteredMachines.length)}</strong> of <strong>{filteredMachines.length}</strong>
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
              Page {currentPage} of {Math.ceil(filteredMachines.length / recordsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredMachines.length / recordsPerPage)))}
              disabled={currentPage === Math.ceil(filteredMachines.length / recordsPerPage)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Add New Machine</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Machine Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
                  placeholder="Enter machine name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <PhotoUploadField inputId="add-machine-photo" />
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="px-4 py-2 border rounded-lg text-black hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddMachine} className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg hover:bg-[#1b5e20]">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Edit Machine</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Machine Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <PhotoUploadField inputId="edit-machine-photo" />
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setShowEditModal(false); resetForm(); }} className="px-4 py-2 border rounded-lg text-black hover:bg-gray-50">Cancel</button>
                <button onClick={handleEditMachine} className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg hover:bg-[#1b5e20]">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2 text-black">Confirm Delete</h2>
            <p className="mb-4 text-black">Are you sure you want to delete <strong>{selectedMachine.name}</strong>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-lg text-black hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteMachine} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}