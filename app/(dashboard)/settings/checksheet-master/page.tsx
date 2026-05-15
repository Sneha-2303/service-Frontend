// app/settings/checksheet-master/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Plus, 
  X, 
  Trash2, 
  ClipboardList,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  Printer,
  PlusCircle
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CheckSheetItem {
  id: number;
  description: string;
  is_required: boolean;
}

interface CheckSheetSection {
  id: number;
  name: string;
  items: CheckSheetItem[];
}

interface CheckSheet {
  id: number;
  title: string;
  description: string;
  sections: CheckSheetSection[];
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CheckSheetPage() {
  const [checkSheets, setCheckSheets] = useState<CheckSheet[]>([]);
  const [filteredCheckSheets, setFilteredCheckSheets] = useState<CheckSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCheckSheet, setSelectedCheckSheet] = useState<CheckSheet | null>(null);
  
  // Create CheckSheet states
  const [newSheet, setNewSheet] = useState({
    title: "",
    description: "",
    status: "Active",
    sections: [
      { name: "General Inspection", items: [{ description: "", is_required: true }] }
    ]
  });

  const [filters, setFilters] = useState({
    status: ""
  });

  useEffect(() => {
    fetchCheckSheets();
  }, []);

  const fetchCheckSheets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/checksheets`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCheckSheets(data);
      setFilteredCheckSheets(data);
    } catch (error) {
      console.error("Error fetching checksheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    let filtered = [...checkSheets];
    
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredCheckSheets(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ status: "" });
    setSearchTerm("");
    setFilteredCheckSheets(checkSheets);
    setCurrentPage(1);
  };

  const handleDeleteCheckSheet = async () => {
    if (!selectedCheckSheet) return;

    try {
      const res = await fetch(`${API_BASE}/checksheets/${selectedCheckSheet.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchCheckSheets();
        setShowDeleteConfirm(false);
        setSelectedCheckSheet(null);
        alert("CheckSheet deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleCreateCheckSheet = async () => {
    try {
      const res = await fetch(`${API_BASE}/checksheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSheet)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchCheckSheets();
        setNewSheet({
          title: "",
          description: "",
          status: "Active",
          sections: [{ name: "General Inspection", items: [{ description: "", is_required: true }] }]
        });
        alert("CheckSheet created successfully!");
      }
    } catch (error) {
      console.error("Error creating:", error);
    }
  };

  const addSection = () => {
    setNewSheet(prev => ({
      ...prev,
      sections: [...prev.sections, { name: "", items: [{ description: "", is_required: true }] }]
    }));
  };

  const addItem = (sectionIndex: number) => {
    const updatedSections = [...newSheet.sections];
    updatedSections[sectionIndex].items.push({ description: "", is_required: true });
    setNewSheet(prev => ({ ...prev, sections: updatedSections }));
  };

  const updateItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const updatedSections = [...newSheet.sections];
    updatedSections[sectionIndex].items[itemIndex].description = value;
    setNewSheet(prev => ({ ...prev, sections: updatedSections }));
  };

  const updateSectionName = (sectionIndex: number, value: string) => {
    const updatedSections = [...newSheet.sections];
    updatedSections[sectionIndex].name = value;
    setNewSheet(prev => ({ ...prev, sections: updatedSections }));
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCheckSheets.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredCheckSheets.length / recordsPerPage);

  const exportToCSV = () => {
    const headers = ["ID", "TITLE", "DESCRIPTION", "SECTIONS", "STATUS", "CREATED AT"];
    const csvData = filteredCheckSheets.map(c => [
      c.id,
      c.title,
      c.description,
      c.sections.length,
      c.status,
      c.created_at
    ]);
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "checksheets.csv";
    a.click();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#e8f5e9" }}>
              <ClipboardList size={18} className="text-[#2e7d32]" />
            </div>
            <div>
              <p className="font-black text-base leading-none text-gray-800">m.i.t.r.a.</p>
              <p className="text-xs text-gray-500">CheckSheet Master</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-black mt-4">Inspection Checklists</h1>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#2e7d32] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1b5e20] transition-colors"
        >
          <Plus size={20} />
          Create CheckSheet
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Master Checklists</p>
          <p className="text-2xl font-bold text-black">{checkSheets.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Active Templates</p>
          <p className="text-2xl font-bold text-green-600">{checkSheets.filter(c => c.status === "Active").length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Sections defined</p>
          <p className="text-2xl font-bold text-blue-600">{checkSheets.reduce((acc, c) => acc + c.sections.length, 0)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search checksheets..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#2e7d32] text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          <button onClick={exportToCSV} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
            <Download size={16} /> Export CSV
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sections</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : currentRecords.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400">No checksheets found.</td></tr>
            ) : currentRecords.map(cs => (
              <tr key={cs.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-black">{cs.title}</div>
                  <div className="text-xs text-gray-400 line-clamp-1">{cs.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-black">{cs.sections.length} Sections</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cs.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {cs.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(cs.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => { setSelectedCheckSheet(cs); setShowViewModal(true); }} className="text-gray-400 hover:text-blue-600"><Eye size={18} /></button>
                  <button onClick={() => { setSelectedCheckSheet(cs); setShowDeleteConfirm(true); }} className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">Create New CheckSheet</h2>
              <button onClick={() => setShowAddModal(false)}><X className="text-gray-400" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Checklist Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#2e7d32] outline-none text-black"
                  placeholder="e.g., Pre-Delivery Inspection"
                  value={newSheet.title}
                  onChange={(e) => setNewSheet({...newSheet, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#2e7d32] outline-none text-black h-20"
                  placeholder="Briefly describe the purpose..."
                  value={newSheet.description}
                  onChange={(e) => setNewSheet({...newSheet, description: e.target.value})}
                />
              </div>

              {newSheet.sections.map((section, sIdx) => (
                <div key={sIdx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex gap-4 mb-4">
                    <input 
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg font-bold text-black bg-white"
                      placeholder="Section Name (e.g., Electrical)"
                      value={section.name}
                      onChange={(e) => updateSectionName(sIdx, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex gap-2">
                        <input 
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-black bg-white"
                          placeholder="Inspection Item Description"
                          value={item.description}
                          onChange={(e) => updateItem(sIdx, iIdx, e.target.value)}
                        />
                      </div>
                    ))}
                    <button onClick={() => addItem(sIdx)} className="text-[#2e7d32] text-xs flex items-center gap-1 font-bold mt-2 hover:underline">
                      <PlusCircle size={14} /> Add Item
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={addSection} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#2e7d32] hover:text-[#2e7d32] transition-all flex items-center justify-center gap-2 font-medium">
                <Plus size={20} /> Add New Section
              </button>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2 text-gray-600 font-medium">Cancel</button>
              <button onClick={handleCreateCheckSheet} className="px-6 py-2 bg-[#2e7d32] text-white rounded-lg font-bold shadow-lg shadow-green-200 hover:bg-[#1b5e20] transition-colors">Save Template</button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedCheckSheet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-black">{selectedCheckSheet.title}</h2>
              <button onClick={() => setShowViewModal(false)}><X className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-8">
              <div>
                <p className="text-gray-500 italic mb-4">"{selectedCheckSheet.description}"</p>
                {selectedCheckSheet.sections.map((section, idx) => (
                  <div key={idx} className="mb-6">
                    <h3 className="font-bold text-[#2e7d32] mb-3 uppercase tracking-wider text-sm border-b pb-1">{section.name}</h3>
                    <div className="space-y-3">
                      {section.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-start gap-3">
                          <div className="w-5 h-5 border-2 border-gray-200 rounded mt-0.5"></div>
                          <span className="text-gray-700 text-sm">{item.description}</span>
                          {item.is_required && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1 rounded ml-auto mt-1">REQ</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedCheckSheet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Delete Template?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to remove <span className="font-bold text-black">"{selectedCheckSheet.title}"</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 text-gray-500 font-medium">Cancel</button>
              <button onClick={handleDeleteCheckSheet} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}