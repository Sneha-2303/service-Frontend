// app/report/pocket/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter, 
  X,
  MapPin,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PocketReport {
  id: number;
  sr_no: number;
  dealer_name: string;
  asm_name: string;
  pocket: string;
  service_engg_name: string;
  location: string;
  open_complaints: number;
  mtd_closed: number;
  complaint_assigned: number;
  complaint_closed_on: number;
  date: string;
}

export default function PocketReportPage() {
  const [reports, setReports] = useState<PocketReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PocketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [asmNames, setAsmNames] = useState<string[]>(["All", "N/A"]);
  const [serviceEngineersList, setServiceEngineersList] = useState<string[]>([]);
  const [pocketsList, setPocketsList] = useState<string[]>([]);

  // Filter states
  const [filters, setFilters] = useState({
    dealerName: "",
    asmName: "",
    pocket: "",
    serviceEnggName: "",
    fromDate: "",
    toDate: ""
  });

  useEffect(() => {
    fetchReports();
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const res = await fetch(`${API_BASE}/service-engineers`);
      if (res.ok) {
        const data = await res.json();
        setServiceEngineersList(["All", ...data.map((eng: any) => eng.full_name)]);
      }
    } catch (error) {
      console.error("Error fetching engineers:", error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reports/pocket`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
      setFilteredReports(data);
      
      // Update pocket list from data
      const uniquePockets = ["All", ...new Set(data.map((r: any) => r.pocket))];
      setPocketsList(uniquePockets as string[]);
    } catch (error) {
      console.error("Error fetching pocket reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    let filtered = [...reports];
    
    if (filters.dealerName) {
      filtered = filtered.filter(r => r.dealer_name.toLowerCase().includes(filters.dealerName.toLowerCase()));
    }
    if (filters.asmName && filters.asmName !== "All") {
      filtered = filtered.filter(r => r.asm_name === filters.asmName);
    }
    if (filters.pocket && filters.pocket !== "All") {
      filtered = filtered.filter(r => r.pocket === filters.pocket);
    }
    if (filters.serviceEnggName && filters.serviceEnggName !== "All") {
      filtered = filtered.filter(r => r.service_engg_name.includes(filters.serviceEnggName));
    }
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.asm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.pocket.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.service_engg_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredReports(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      dealerName: "",
      asmName: "",
      pocket: "",
      serviceEnggName: "",
      fromDate: "",
      toDate: ""
    });
    setSearchTerm("");
    setFilteredReports(reports);
    setCurrentPage(1);
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReports.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredReports.length / recordsPerPage);

  const exportToCSV = () => {
    const headers = [
      "SR NO", "Dealer Name", "ASM Name", "Pocket", 
      "Service Engg Name", "Location", "Open Complaints", 
      "MTD Closed", "Complaint Assigned", "Complaint Closed On"
    ];
    const csvData = filteredReports.map(r => [
      r.sr_no,
      r.dealer_name,
      r.asm_name,
      r.pocket,
      r.service_engg_name,
      r.location,
      r.open_complaints,
      r.mtd_closed,
      r.complaint_assigned,
      r.complaint_closed_on
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pocket-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique values for filters
  const uniqueDealers = [...new Set(reports.map(r => r.dealer_name))];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Pocketwise Report</h1>
        <p className="text-gray-600 mt-1">Pocket-wise service engineer performance and complaint tracking</p>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by dealer, ASM, pocket, engineer, location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] focus:border-transparent text-black"
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
              <option value={10}>10 Records Per Page</option>
              <option value={25}>25 Records Per Page</option>
              <option value={50}>50 Records Per Page</option>
              <option value={100}>100 Records Per Page</option>
            </select>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <select
                value={filters.dealerName}
                onChange={(e) => handleFilterChange("dealerName", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
              >
                <option value="">Select Dealer Name</option>
                {uniqueDealers.map(dealer => (
                  <option key={dealer} value={dealer}>{dealer}</option>
                ))}
              </select>
              
              <select
                value={filters.asmName}
                onChange={(e) => handleFilterChange("asmName", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
              >
                <option value="">Select ASM Name</option>
                {asmNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              
              <select
                value={filters.pocket}
                onChange={(e) => handleFilterChange("pocket", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
              >
                <option value="">Select Pocket</option>
                {pocketsList.map(pocket => (
                  <option key={pocket} value={pocket}>{pocket}</option>
                ))}
              </select>
              
              <select
                value={filters.serviceEnggName}
                onChange={(e) => handleFilterChange("serviceEnggName", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
              >
                <option value="">Select Service Engineer</option>
                {serviceEngineersList.map(engineer => (
                  <option key={engineer} value={engineer}>{engineer}</option>
                ))}
              </select>
              
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

      {/* Pocket Report Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR NO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealer Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASM Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pocket</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Engg Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Complaints</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MTD Closed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Closed</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e7d32]"></div>
                      <span className="ml-2">Loading reports...</span>
                    </div>
                  </td>
                </tr>
              ) : currentRecords.length > 0 ? (
                currentRecords.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-black">
                      {report.sr_no}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-black">
                      {report.dealer_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-black">
                      {report.asm_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-black">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        {report.pocket}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-black">
                      {report.service_engg_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-black max-w-xs truncate">
                      {report.location}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        <AlertCircle size={14} className="text-orange-500" />
                        <span className="font-semibold text-orange-600">{report.open_complaints}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle size={14} className="text-green-500" />
                        <span className="font-semibold text-green-600">{report.mtd_closed}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-500" />
                        <span className="font-semibold text-blue-600">{report.complaint_assigned}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle size={14} className="text-purple-500" />
                        <span className="font-semibold text-purple-600">{report.complaint_closed_on}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="text-gray-300 mb-3" />
                      <p className="text-gray-500 text-lg">No Data Found</p>
                      <p className="text-gray-400 text-sm mt-1">No pocket reports available for the selected filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredReports.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-black">
              Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLastRecord, filteredReports.length)}</span> of{" "}
              <span className="font-medium">{filteredReports.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-black">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}