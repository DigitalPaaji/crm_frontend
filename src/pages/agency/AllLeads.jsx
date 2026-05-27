import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { base_url } from '../../components/utlis';
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  Tag, 
  Loader2, 
  AlertCircle,
  Globe,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';

const AllLeads = () => {
  const { token } = useSelector((state) => state.token);
  
  // State management
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchMyLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${base_url}/leads/get-all-leads`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,  
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads data');
      }

      const data = await response.json();
      
      if (data.success) {
        setLeads(data.leads);
      } else {
        throw new Error(data.message || 'Error loading leads');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Helper function to format status badge colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'converted':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Filter leads based on search term and status
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone || '').includes(searchTerm);
      
    const matchesStatus = statusFilter === 'all' || lead.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });





  if (loading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="text-lg font-semibold">Oops! Something went wrong.</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchMyLeads}
          className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }



  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">All Leads</h1>
            <p className="text-sm text-gray-500">Manage and track your customer inquiries</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-gray-600">
            Total: <span className="text-gray-900">{filteredLeads.length}</span>
          </span>
        </div>
      </div>

      {/* Toolbar (Search & Filter) */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        {/* Status Filter */}
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Phone</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">DOB</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Source</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Lead By</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                    {/* Name & Email */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {lead.name || 'Unknown Name'}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{lead.email || 'No email'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-sm">{lead.phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* DOB */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {lead.dob 
                            ? new Date(lead.dob).toLocaleDateString() 
                            : 'Not specified'}
                        </span>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 capitalize">
                        <Globe className="w-4 h-4 text-gray-400" />
                        {lead.source || 'Unknown'}
                      </div>
                    </td>

                    {/* Lead By */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 capitalize">
                        {lead.createdby?.name || 'Unknown'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(lead.status)}`}>
                        <Tag className="w-3 h-3" />
                        {lead.status || 'N/A'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/agency/lead/${lead._id}`}  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View Lead">
                          <Eye className="w-4 h-4" />
                        </Link>
                     
                        {/* <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Edit Lead">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Lead">
                          <Trash2 className="w-4 h-4" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-900">No leads found</p>
                      <p className="text-sm mt-1">
                        {leads.length === 0 
                          ? "There are currently no leads in the system." 
                          : "No leads match your current search or filter criteria."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllLeads;