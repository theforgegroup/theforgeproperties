import React, { useState } from 'react';
import { Trash2, Edit, Plus, Search, Calendar, User } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';

export const AdminPosts: React.FC = () => {
  const { posts, deletePost } = useProperties();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this post?')) {
        await deletePost(id);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-forge-navy mb-2">Blog Posts</h1>
          <p className="text-slate-500 text-sm">Manage your news and articles</p>
        </div>
        <button 
          onClick={() => navigate('/admin/posts/new')}
          className="bg-forge-gold text-forge-navy px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white border border-transparent hover:border-forge-gold transition-all shadow-md"
        >
          <Plus size={16} /> Add New Post
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
          placeholder="Search by title..." 
          className="w-full bg-white border border-slate-200 text-slate-600 text-sm rounded-lg pl-12 pr-4 py-4 focus:outline-none focus:border-forge-gold focus:ring-1 focus:ring-forge-gold transition-all shadow-sm placeholder-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-200">
            <tr>
              <th className="p-5">Article</th>
              <th className="p-5">Author</th>
              <th className="p-5">Date</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredPosts.length > 0 ? filteredPosts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    {p.image ? (
                        <img src={p.image} alt="" className="w-12 h-12 rounded object-cover shadow-sm" />
                    ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">img</div>
                    )}
                    <div>
                      <div className="font-bold text-forge-navy">{p.title}</div>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-600">
                        <User size={14} /> {p.author || 'Admin'}
                    </div>
                </td>
                <td className="p-5 text-slate-500">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} /> {new Date(p.date).toLocaleDateString()}
                    </div>
                </td>
                <td className="p-5">
                  <div className="flex gap-3 justify-end text-slate-400">
                    <button 
                      onClick={() => navigate(`/admin/posts/edit/${p.id}`)}
                      className="hover:text-forge-gold transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400">
                  No posts found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 text-center text-xs text-slate-400">
        Showing {filteredPosts.length} results
      </div>
    </AdminLayout>
  );
};