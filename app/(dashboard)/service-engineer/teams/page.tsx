// app/service-engineer/teams/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Edit,
  Trash2,
  Settings,
  Save
} from "lucide-react";

interface ServiceEngineer {
  id: number;
  srNo: number;
  name: string;
  mobile: string;
  email: string;
  count: number;
  state: string;
  district: string;
  taluka: string;
  address: string;
  teamName?: string;
  teamLead?: string;
}

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Team {
  id: number;
  name: string;
  team_lead_id: number;
  team_lead_name: string;
  members: any[];
}

import { useLocations } from '@/lib/hooks/useLocations';

export default function TeamsPage() {
  const { getStates, getDistricts, getTalukas } = useLocations();
  const [engineers, setEngineers] = useState<ServiceEngineer[]>([]);
  const [filteredEngineers, setFilteredEngineers] = useState<ServiceEngineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableTalukas, setAvailableTalukas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allEngineers, setAllEngineers] = useState<any[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<ServiceEngineer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    teamName: "",
    teamLead: "",
    state: "",
    district: "",
    taluka: "",
    fromDate: "",
    toDate: ""
  });

  // Manage Team Form Data
  const [teamFormData, setTeamFormData] = useState({
    teamName: "",
    teamLeadId: "" as string | number,
    memberIds: [] as number[]
  });

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    setLoading(true);
    try {
      // Fetch engineers
      const engRes = await fetch(`${API_BASE}/service-engineers`);
      if (!engRes.ok) throw new Error("Failed to fetch engineers");
      const engData = await engRes.json();
      setAllEngineers(engData);

      // Fetch teams
      const teamRes = await fetch(`${API_BASE}/teams`);
      if (!teamRes.ok) throw new Error("Failed to fetch teams");
      const teamData = await teamRes.json();
      setTeams(teamData);

      // Map data for table
      const mappedData: ServiceEngineer[] = engData.map((e: any, index: number) => {
        // Find if this engineer belongs to any team
        const team = teamData.find((t: any) => t.members.some((m: any) => m.id === e.id));
        
        return {
          id: e.id,
          srNo: index + 1,
          name: e.full_name,
          mobile: e.mobile,
          email: e.email,
          count: 0, // Should be fetched from somewhere or handled by backend
          state: e.state || "",
          district: e.district || "",
          taluka: e.taluka || "",
          address: e.address || "",
          teamName: team ? team.name : "",
          teamLead: team ? team.team_lead_name : ""
        };
      });

      setEngineers(mappedData);
      setFilteredEngineers(mappedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);

    if (field === "state") {
      setFilters(prev => ({ ...prev, district: "", taluka: "" }));
      setAvailableDistricts(value ? getDistricts([value]) : []);
    }
    if (field === "district") {
      setFilters(prev => ({ ...prev, taluka: "" }));
      setAvailableTalukas(value ? getTalukas([value]) : []);
    }
  };

  const applyFilters = () => {
    let filtered = [...engineers];
    
    if (filters.teamName) {
      filtered = filtered.filter(e => e.teamName === filters.teamName);
    }
    if (filters.teamLead) {
      filtered = filtered.filter(e => e.teamLead === filters.teamLead);
    }
    if (filters.state) {
      filtered = filtered.filter(e => e.state === filters.state);
    }
    if (filters.district) {
      filtered = filtered.filter(e => e.district === filters.district);
    }
    if (filters.taluka) {
      filtered = filtered.filter(e => e.taluka === filters.taluka);
    }
    if (filters.fromDate) {
      // Filter logic based on date if needed
    }
    if (filters.toDate) {
      // Filter logic based on date if needed
    }
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.mobile.includes(searchTerm) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredEngineers(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      teamName: "",
      teamLead: "",
      state: "",
      district: "",
      taluka: "",
      fromDate: "",
      toDate: ""
    });
    setSearchTerm("");
    setFilteredEngineers(engineers);
    setCurrentPage(1);
  };

  const handleTeamInputChange = (field: string, value: any) => {
    setTeamFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleManageTeam = async () => {
    if (!teamFormData.teamLeadId || !teamFormData.teamName) {
      alert("Please enter team name and select team leader");
      return;
    }

    const payload = {
      name: teamFormData.teamName,
      team_lead_id: Number(teamFormData.teamLeadId),
      member_ids: teamFormData.memberIds
    };

    try {
      const response = await fetch(`${API_BASE}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to save team");

      await fetchEngineers();
      setShowManageTeamModal(false);
      setTeamFormData({
        teamName: "",
        teamLeadId: "",
        memberIds: []
      });
      alert("Team created successfully!");
    } catch (error) {
      console.error("Error saving team:", error);
      alert("Failed to save team");
    }
  };

  const openManageTeamModal = (engineer?: ServiceEngineer) => {
    setTeamFormData({
      teamName: "",
      teamLeadId: engineer ? engineer.id : "",
      memberIds: engineer ? [engineer.id] : []
    });
    setShowManageTeamModal(true);
  };

  const handleDeleteEngineer = async () => {
    if (!selectedEngineer) return;

    try {
      const response = await fetch(`${API_BASE}/service-engineers/${selectedEngineer.id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete engineer");

      await fetchEngineers();
      setShowDeleteConfirm(false);
      setSelectedEngineer(null);
      alert("Service engineer deleted successfully!");
    } catch (error) {
      console.error("Error deleting engineer:", error);
      alert("Failed to delete engineer");
    }
  };

  const openDeleteConfirm = (engineer: ServiceEngineer) => {
    setSelectedEngineer(engineer);
    setShowDeleteConfirm(true);
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEngineers.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredEngineers.length / recordsPerPage);
  // Get unique team names for filter
  const uniqueTeamNames = [...new Set(teams.map(t => t.name))];
  // Get unique team lead names for filter
  const uniqueTeamLeads = [...new Set(teams.map(t => t.team_lead_name))];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#eef2ff", border: "1px solid #c7d2fe" }}>
            <span className="text-lg font-bold" style={{ color: "#4338ca" }}>m</span>
          </div>
          <div>
            <p className="font-black text-base leading-none" style={{ color: "#111827" }}>m.i.t.r.a.</p>
            <p className="text-xs" style={{ color: "#a5b4fc" }}>Mahindra Innovative Technologies & Research for Agriculture</p>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-black mt-4">Teams List</h1>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
  <div className="flex gap-3 flex-1 min-w-[300px]">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Search..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] focus:border-transparent text-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && applyFilters()}
      />
    </div>
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
    
    {/* Manage Teams Button - Orange */}
    <button
      onClick={() => openManageTeamModal()}
      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2"
    >
      <Settings size={18} />
      Manage Teams
    </button>
  </div>
</div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-4 pt-4 border-t border-gray-200">
          <select
            value={filters.teamName}
            onChange={(e) => handleFilterChange("teamName", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black text-sm"
          >
            <option value="">Team Name: Select Team</option>
            {uniqueTeamNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            value={filters.teamLead}
            onChange={(e) => handleFilterChange("teamLead", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black text-sm"
          >
            <option value="">Team Lead: Select Team Lead</option>
            {uniqueTeamLeads.map(lead => (
              <option key={lead} value={lead}>{lead}</option>
            ))}
          </select>
          
          <select
            value={filters.state}
            onChange={(e) => handleFilterChange("state", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black text-sm"
          >
            <option value="">State: Select State</option>
            {getStates().map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          
          <select
            value={filters.district}
            onChange={(e) => handleFilterChange("district", e.target.value)}
            disabled={!filters.state}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] disabled:bg-gray-100 text-black text-sm"
          >
            <option value="">District: Select District</option>
            {filters.state && availableDistricts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          
          <select
            value={filters.taluka}
            onChange={(e) => handleFilterChange("taluka", e.target.value)}
            disabled={!filters.district}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] disabled:bg-gray-100 text-black text-sm"
          >
            <option value="">Taluka: Select Taluka</option>
            {filters.district && availableTalukas.map(taluka => (
              <option key={taluka} value={taluka}>{taluka}</option>
            ))}
          </select>
          
          <input
            type="date"
            placeholder="From: dd-mm-yyyy"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange("fromDate", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black text-sm"
          />
          
          <input
            type="date"
            placeholder="To: dd-mm-yyyy"
            value={filters.toDate}
            onChange={(e) => handleFilterChange("toDate", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black text-sm"
          />
        </div>
        
        {/* Reset Filters Button */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Engineer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taluka</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e7d32]"></div>
                      <span className="ml-2">Loading engineers...</span>
                    </div>
                  </td>
                </tr>
              ) : currentRecords.length > 0 ? (
                currentRecords.map((engineer, index) => (
                  <tr key={engineer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {indexOfFirstRecord + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {engineer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-semibold">
                      {engineer.teamName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {engineer.teamLead || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {engineer.mobile}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {engineer.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {engineer.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {engineer.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {engineer.district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {engineer.taluka}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {engineer.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
  <button
    onClick={() => openManageTeamModal(engineer)}
    className="text-green-600 hover:text-green-900 mr-3 transition-colors"
    title="Edit"
  >
    <Edit size={18} />
  </button>
  <button
    onClick={() => openDeleteConfirm(engineer)}
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
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    No service engineers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredEngineers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-black">
              Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLastRecord, filteredEngineers.length)}</span> of{" "}
              <span className="font-medium">{filteredEngineers.length}</span> results
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

      {/* Manage Team Modal */}
      {showManageTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">Manage Team</h2>
              <button
                onClick={() => {
                  setShowManageTeamModal(false);
                  setTeamFormData({ teamName: "", teamLeadId: "", memberIds: [] });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={teamFormData.teamName}
                    onChange={(e) => handleTeamInputChange("teamName", e.target.value)}
                    placeholder="Enter Team Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Team Leader <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={teamFormData.teamLeadId}
                    onChange={(e) => handleTeamInputChange("teamLeadId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e7d32] text-black"
                  >
                    <option value="">Select Team Leader</option>
                    {allEngineers.map(eng => (
                      <option key={eng.id} value={eng.id}>{eng.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Service Engineers <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {allEngineers.map(engineer => (
                      <label key={engineer.id} className="flex items-center gap-2 py-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={teamFormData.memberIds.includes(engineer.id)}
                          onChange={() => {
                            const newIds = teamFormData.memberIds.includes(engineer.id)
                              ? teamFormData.memberIds.filter(id => id !== engineer.id)
                              : [...teamFormData.memberIds, engineer.id];
                            handleTeamInputChange("memberIds", newIds);
                          }}
                          className="w-4 h-4 text-[#2e7d32] focus:ring-[#2e7d32]"
                        />
                        <span className="text-sm text-black">{engineer.full_name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Select one or more service engineers
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowManageTeamModal(false);
                  setTeamFormData({ teamName: "", teamLeadId: "", memberIds: [] });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManageTeam}
                className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg hover:bg-[#1b5e20] transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Save Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEngineer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">Confirm Delete</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <Trash2 size={32} className="text-red-600" />
                </div>
              </div>
              <p className="text-center text-black mb-2">
                Are you sure you want to delete this service engineer?
              </p>
              <p className="text-center text-sm text-gray-500">
                Name: <span className="font-semibold">{selectedEngineer.name}</span>
              </p>
              <p className="text-center text-sm text-gray-500">
                Mobile: {selectedEngineer.mobile}
              </p>
              <p className="text-center text-xs text-gray-400 mt-4">
                This action cannot be undone.
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEngineer}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}