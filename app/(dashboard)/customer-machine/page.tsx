"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Filter,
  X,
  Edit,
  Eye,
  Save,
  Trash2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerMachineRow {
  id: number;
  customer_name: string;
  customer_mobile: string;
  machine_name: string;
  machine_model: string;
  serial_no: string;
  pump_serial_no: string;
  gear_box_serial_no: string;
  installation_date: string;
  warranty_until: string;
  service_engineer: string;
  dealer_name: string;
  status: string;
}

interface Customer {
  id: number;
  full_name: string;
  mobile: string;
}

interface Machine {
  id: number;
  name: string;
}

interface MachineModel {
  id: number;
  model_name: string;
}

interface Dealer {
  id: number;
  name: string;
}

interface ServiceEngineer {
  id: number;
  full_name: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerMachinePage() {
  // Table data
  const [customerMachines, setCustomerMachines] = useState<CustomerMachineRow[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<CustomerMachineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Dropdown source data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([]);
  const [machineModels, setMachineModels] = useState<MachineModel[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [serviceEngineers, setServiceEngineers] = useState<ServiceEngineer[]>([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form data – IDs only, except machineModel which is read-only display
  const [formData, setFormData] = useState({
    customerId: "",
    machineId: "",
    machineModelId: "",
    machineModelDisplay: "",
    machineSerialNo: "",
    pumpSerialNo: "",
    gearBoxSerialNo: "",
    serviceEngineerId: "",
    dealerId: "",
    installationDate: "",
    status: "Active",
  });

  // Filters
  const [filters, setFilters] = useState({
    machineModel: "",
    serviceEngineer: "",
    dealerName: "",
    fromDate: "",
    toDate: "",
    status: "",
  });

  // ── Load everything on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchCustomerMachines();
    fetchDropdownData();
  }, []);

  const fetchCustomerMachines = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer-machines`);
      if (!res.ok) throw new Error("Failed to fetch customer machines");
      const data: CustomerMachineRow[] = await res.json();
      setCustomerMachines(data);
      setFilteredMachines(data);
    } catch (err) {
      console.error("Error fetching customer machines:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [custRes, machRes, dealerRes, engRes] = await Promise.all([
        fetch(`${API_BASE}/customers`),
        fetch(`${API_BASE}/machines`),
        fetch(`${API_BASE}/dealers`),
        fetch(`${API_BASE}/service-engineers`),
      ]);

      if (custRes.ok) setCustomers(await custRes.json());
      if (machRes.ok) setAvailableMachines(await machRes.json());
      if (dealerRes.ok) setDealers(await dealerRes.json());
      if (engRes.ok) setServiceEngineers(await engRes.json());
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const fetchMachineModels = async (machineId: string) => {
    if (!machineId) {
      setMachineModels([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/machines/${machineId}/models`);
      if (res.ok) setMachineModels(await res.json());
      else setMachineModels([]);
    } catch {
      setMachineModels([]);
    }
  };

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "machineId") {
      fetchMachineModels(value);
      setFormData((prev) => ({
        ...prev,
        machineId: value,
        machineModelId: "",
        machineModelDisplay: "",
      }));
    }

    if (field === "machineModelId") {
      const model = machineModels.find((m) => m.id.toString() === value);
      setFormData((prev) => ({
        ...prev,
        machineModelId: value,
        machineModelDisplay: model?.model_name || "",
      }));
    }
  };

  const handleAddMachine = async () => {
    setErrorMsg("");
    const {
      customerId,
      machineId,
      machineSerialNo,
      pumpSerialNo,
      gearBoxSerialNo,
      serviceEngineerId,
      dealerId,
      installationDate,
    } = formData;

    if (
      !customerId ||
      !machineId ||
      !machineSerialNo ||
      !dealerId ||
      !installationDate
    ) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_id: Number(customerId),
        machine_id: Number(machineId),
        machine_model_id: formData.machineModelId
          ? Number(formData.machineModelId)
          : null,
        serial_no: machineSerialNo,
        pump_serial_no: pumpSerialNo || null,
        gear_box_serial_no: gearBoxSerialNo || null,
        installation_date: new Date(installationDate).toISOString(),
        service_engineer_id: serviceEngineerId ? Number(serviceEngineerId) : null,
        dealer_id: Number(dealerId),
        status: formData.status || "Active",
      };

      const res = await fetch(`${API_BASE}/customer-machines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create customer machine");
      }

      // Refresh the list and close modal
      await fetchCustomerMachines();
      setShowAddModal(false);
      setFormData({
        customerId: "",
        machineId: "",
        machineModelId: "",
        machineModelDisplay: "",
        machineSerialNo: "",
        pumpSerialNo: "",
        gearBoxSerialNo: "",
        serviceEngineerId: "",
        dealerId: "",
        installationDate: "",
        status: "Active",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMachine = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer machine?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/customer-machines/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete machine");
      await fetchCustomerMachines();
    } catch (err) {
      console.error("Error deleting machine:", err);
      alert("Failed to delete customer machine.");
    }
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    let filtered = [...customerMachines];

    if (filters.machineModel)
      filtered = filtered.filter((m) => m.machine_model === filters.machineModel);
    if (filters.serviceEngineer)
      filtered = filtered.filter((m) =>
        m.service_engineer.toLowerCase().includes(filters.serviceEngineer.toLowerCase())
      );
    if (filters.dealerName)
      filtered = filtered.filter((m) =>
        m.dealer_name.toLowerCase().includes(filters.dealerName.toLowerCase())
      );
    if (filters.fromDate)
      filtered = filtered.filter((m) => m.installation_date >= filters.fromDate);
    if (filters.toDate)
      filtered = filtered.filter((m) => m.installation_date <= filters.toDate);
    if (filters.status)
      filtered = filtered.filter((m) => m.status === filters.status);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.customer_name.toLowerCase().includes(q) ||
          m.customer_mobile.includes(q) ||
          m.machine_name.toLowerCase().includes(q) ||
          m.machine_model.toLowerCase().includes(q) ||
          m.serial_no.toLowerCase().includes(q) ||
          m.pump_serial_no.toLowerCase().includes(q) ||
          m.gear_box_serial_no.toLowerCase().includes(q) ||
          m.service_engineer.toLowerCase().includes(q)
      );
    }

    setFilteredMachines(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      machineModel: "",
      serviceEngineer: "",
      dealerName: "",
      fromDate: "",
      toDate: "",
      status: "",
    });
    setSearchTerm("");
    setFilteredMachines(customerMachines);
    setCurrentPage(1);
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredMachines.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMachines.length / recordsPerPage);

  // ── Unique filter values ───────────────────────────────────────────────────
  const uniqueModels = [...new Set(customerMachines.map((m) => m.machine_model).filter(Boolean))];
  const uniqueEngineers = [...new Set(customerMachines.map((m) => m.service_engineer).filter(Boolean))];
  const uniqueDealers = [...new Set(customerMachines.map((m) => m.dealer_name).filter(Boolean))];

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    const headers = [
      "SR No.", "Customer Name", "Customer Mobile", "Machine Name",
      "Machine Model", "Serial No.", "Pump SR No.", "Gear Box SR No.",
      "Service Engineer", "Dealer Name", "Install On", "Warranty Until", "Status",
    ];
    const rows = filteredMachines.map((m, i) => [
      i + 1, m.customer_name, m.customer_mobile, m.machine_name, m.machine_model,
      m.serial_no, m.pump_serial_no, m.gear_box_serial_no, m.service_engineer,
      m.dealer_name, m.installation_date, m.warranty_until, m.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer-machines.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (s: string) =>
    s === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Customer Machines</h1>
        <p className="text-gray-600 mt-1">Manage and view all customer machine details</p>
      </div>

      {/* Search / Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by customer, mobile, machine, serial no, engineer…"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-black"
            >
              <Filter size={18} />
              Filters
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg hover:bg-[#1b5e20] transition-colors"
            >
              Apply
            </button>
          </div>

          <div className="flex gap-3">
            <select
              value={recordsPerPage}
              onChange={(e) => setRecordsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n} Records</option>
              ))}
            </select>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={() => { setErrorMsg(""); setShowAddModal(true); }}
              className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg hover:bg-[#1b5e20] transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add Machine
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <select
                value={filters.machineModel}
                onChange={(e) => handleFilterChange("machineModel", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              >
                <option value="">All Machine Models</option>
                {uniqueModels.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>

              <select
                value={filters.serviceEngineer}
                onChange={(e) => handleFilterChange("serviceEngineer", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              >
                <option value="">All Engineers</option>
                {uniqueEngineers.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>

              <select
                value={filters.dealerName}
                onChange={(e) => handleFilterChange("dealerName", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              >
                <option value="">All Dealers</option>
                {uniqueDealers.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#2e7d32]"
              />

              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X size={18} />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "SR No.", "Customer Name", "Customer Mobile", "Machine Name",
                  "Machine Model", "Serial No.", "Pump SR No.", "Gear Box SR No.",
                  "Service Engineer", "Dealer Name", "Install On", "Status", "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e7d32]" />
                      Loading machines…
                    </div>
                  </td>
                </tr>
              ) : currentRecords.length > 0 ? (
                currentRecords.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-black">{indexOfFirst + idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-black">{m.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-black">{m.customer_mobile}</td>
                    <td className="px-4 py-3 text-sm text-black">{m.machine_name}</td>
                    <td className="px-4 py-3 text-sm text-black">{m.machine_model}</td>
                    <td className="px-4 py-3 text-sm font-mono text-black">{m.serial_no}</td>
                    <td className="px-4 py-3 text-sm font-mono text-black">{m.pump_serial_no}</td>
                    <td className="px-4 py-3 text-sm font-mono text-black">{m.gear_box_serial_no}</td>
                    <td className="px-4 py-3 text-sm text-black">{m.service_engineer}</td>
                    <td className="px-4 py-3 text-sm text-black">{m.dealer_name}</td>
                    <td className="px-4 py-3 text-sm text-black">
                      {m.installation_date
                        ? new Date(m.installation_date).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors" title="View">
                        <Eye size={18} />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900 transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMachine(m.id)}
                        className="text-red-600 hover:text-red-900 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                    No machines found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredMachines.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-black">
              Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLast, filteredMachines.length)}</span> of{" "}
              <span className="font-medium">{filteredMachines.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="px-3 py-1 text-sm text-black">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Machine Modal ────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">Add Customer Machine</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleInputChange("customerId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.mobile})
                    </option>
                  ))}
                </select>
              </div>

              {/* Machine */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Machine <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.machineId}
                  onChange={(e) => handleInputChange("machineId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                >
                  <option value="">Select Machine</option>
                  {availableMachines.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Machine Model (cascades from Machine) */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Machine Model
                </label>
                <select
                  value={formData.machineModelId}
                  onChange={(e) => handleInputChange("machineModelId", e.target.value)}
                  disabled={!formData.machineId || machineModels.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {formData.machineId && machineModels.length === 0
                      ? "No models found for this machine"
                      : "Select Model (optional)"}
                  </option>
                  {machineModels.map((mm) => (
                    <option key={mm.id} value={mm.id}>{mm.model_name}</option>
                  ))}
                </select>
              </div>

              {/* Machine Serial No */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Machine Serial No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter serial number"
                  value={formData.machineSerialNo}
                  onChange={(e) => handleInputChange("machineSerialNo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                />
              </div>

              {/* Pump Serial No */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Pump Serial No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter pump serial number"
                  value={formData.pumpSerialNo}
                  onChange={(e) => handleInputChange("pumpSerialNo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                />
              </div>

              {/* Gear Box Serial No */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Gear Box Serial No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter gear box serial number"
                  value={formData.gearBoxSerialNo}
                  onChange={(e) => handleInputChange("gearBoxSerialNo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                />
              </div>

              {/* Service Engineer */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Service Engineer <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.serviceEngineerId}
                  onChange={(e) => handleInputChange("serviceEngineerId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                >
                  <option value="">Select Service Engineer</option>
                  {serviceEngineers.length === 0 ? (
                    <option disabled>No service engineers found</option>
                  ) : (
                    serviceEngineers.map((e) => (
                      <option key={e.id} value={e.id}>{e.full_name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Dealer */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Dealer <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dealerId}
                  onChange={(e) => handleInputChange("dealerId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                >
                  <option value="">Select Dealer</option>
                  {dealers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Installation Date */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Installation Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => handleInputChange("installationDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Under Warranty">Under Warranty</option>
                  <option value="Out of Warranty">Out of Warranty</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMachine}
                disabled={submitting}
                className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg hover:bg-[#1b5e20] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Machine
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}