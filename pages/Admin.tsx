import React, { useState } from 'react';
import { Trash2, Edit, Plus, Search, MapPin, ArrowRight, FileCheck2 } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';

export const Admin: React.FC = () => {
  const { properties, leads, deleteProperty } = useProperties();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      deleteProperty(id);
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.documentation && p.documentation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get top 3 recent leads, excluding artifacts
  const recentLeads = [...leads]
    .filter(l => l.name && l.name !== 'Chief Adewale' && l.email !== 'test@example.com')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'New': return 'border-blue-500';
      case 'Contacted': return 'border-amber-500';
      case 'Qualified': return 'border-green-500';
      case 'Closed': return 'border-[#0F172A]';
      case 'Lost': return 'border-[#FE4A23]';
      default: return 'border-[#774DFF]';
    }
  };

  return (
    <AdminLayout>
      {/* Recent Inquiries Section */}
      <div className="mb-14">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold font-display text-[#0F172A]">Recent Inquiries</h2>
          <button 
            onClick={() => navigate('/admin/crm')}
            className="text-xs font-bold text-[#774DFF] uppercase tracking-wider hover:text-[#683de6] transition-colors flex items-center gap-1.5"
          >
            <span>View All Leads</span> <ArrowRight size={14} className="shrink-0" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentLeads.length > 0 ? recentLeads.map(lead => (
            <div key={lead.id} className={`bg-white p-6 rounded-[12px] shadow-sm border-l-4 ${getBorderColor(lead.status)} border-y border-r border-[#E5E7EB] transition-all hover:shadow-md`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                  lead.status === 'New' ? 'bg-blue-100 text-blue-700' :
                  lead.status === 'Qualified' ? 'bg-green-100 text-green-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {lead.status}
                </span>
                <span className="text-slate-400 text-xs">{new Date(lead.date).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-[#0F172A] mb-1 font-display">{lead.name}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">"{lead.message}"</p>
              {lead.property_title && (
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">
                  Re: {lead.property_title}
                </div>
              )}
            </div>
          )) : (
            <div className="col-span-3 bg-white p-8 rounded-[12px] border border-dashed border-[#E5E7EB] text-center text-slate-400">
              No recent inquiries found.
            </div>
          )}
        </div>
      </div>

      {/* Listing Management Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] font-display mb-2">Listing Management</h1>
          <p className="text-slate-500 text-sm">Manage your property portfolio & editable title documentation</p>
        </div>
        <button 
          onClick={() => navigate('/admin/properties/new')}
          className="bg-[#774DFF] hover:bg-[#683de6] text-white px-6 py-3.5 rounded-[8px] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md w-full md:w-auto hover:scale-[1.02]"
        >
          <Plus size={16} /> Add New Listing
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, location, or documentation type..." 
          className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] text-sm rounded-[8px] pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#774DFF] transition-all shadow-sm placeholder-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-[12px] overflow-x-auto border border-[#E5E7EB]">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead className="bg-[#F3F4F6] text-[#0F172A] text-xs font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
            <tr>
              <th className="p-5">Property</th>
              <th className="p-5">Documentation Type</th>
              <th className="p-5">Starting Price</th>
              <th className="p-5">Status Badge</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#E5E7EB]">
            {filteredProperties.length > 0 ? filteredProperties.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <img 
                      src={p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=300'} 
                      alt="" 
                      className="w-14 h-14 rounded-[8px] object-cover shadow-xs border border-[#E5E7EB]" 
                    />
                    <div>
                      <div className="font-bold text-[#0F172A] font-display text-base">{p.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-[#774DFF]" /> {p.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-[#0F172A] font-semibold">
                    <FileCheck2 size={14} className="text-[#774DFF] shrink-0" />
                    <span>{p.documentation || 'Deed of Assignment + Registered Survey Plan'}</span>
                  </div>
                </td>
                <td className="p-5 font-bold text-[#774DFF] font-display text-base">
                  ₦{p.price ? p.price.toLocaleString() : '900,000'}
                </td>
                <td className="p-5">
                  <span className={`px-2.5 py-1 rounded-[6px] text-xs font-bold uppercase tracking-wide ${
                    p.status_badge === 'Available Now' || p.status === 'For Sale' ? 'bg-[#FE4A23]/10 text-[#FE4A23]' : 
                    p.status_badge === 'Sold Out' || p.status === 'Sold' ? 'bg-slate-100 text-slate-600' : 'bg-[#774DFF]/10 text-[#774DFF]'
                  }`}>
                    {p.status_badge || p.status}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex gap-3 justify-end text-slate-400">
                    <button 
                      onClick={() => navigate(`/admin/properties/edit/${p.id}`)}
                      className="hover:text-[#774DFF] transition-colors p-1.5 rounded hover:bg-[#F3F4F6]"
                      title="Edit Property & Documentation"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      className="hover:text-[#FE4A23] transition-colors p-1.5 rounded hover:bg-[#F3F4F6]"
                      title="Delete Listing"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  No properties found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
