import React from 'react';
import { DollarSign, Home, Users, TrendingUp, Activity, MapPin } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';

export const AdminAnalytics: React.FC = () => {
  const { properties, leads } = useProperties();

  // Metrics
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
  const activeListings = properties.filter(p => p.status === 'For Sale' || p.status === 'For Rent').length;
  const soldListings = properties.filter(p => p.status === 'Sold').length;
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const closedLeads = leads.filter(l => l.status === 'Closed').length;

  // Calculate Real Conversion Rate
  const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

  // Calculate Inventory by Location
  const locationStats = properties.reduce((acc: Record<string, number>, curr) => {
    const city = curr.location.split(',')[0].trim();
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalProps = properties.length;
  const sortedLocations = Object.entries(locationStats)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([loc, count]) => ({
      loc,
      count: count as number,
      percent: totalProps > 0 ? Math.round(((count as number) / totalProps) * 100) : 0
    }));
  
  const colors = ['bg-forge-navy', 'bg-forge-gold', 'bg-slate-400', 'bg-blue-500', 'bg-green-500'];

  // Generate Activity Log
  const activityLog = [
    ...leads.map(l => ({
      type: 'lead',
      date: new Date(l.date).getTime(),
      user: 'System',
      action: `New ${l.type.toLowerCase()}`,
      target: l.name,
      displayTime: l.date
    })),
    ...properties.map(p => {
      let date = Date.now();
      // Try to determine date from ID if it looks like a timestamp (created via admin panel)
      // Otherwise default to "now" for legacy mock items if no timestamp is encoded
      if (p.id.length > 10 && !isNaN(Number(p.id))) {
        date = Number(p.id);
      } 
      
      return {
        type: 'property',
        date,
        user: 'Admin',
        action: 'Property listed',
        target: p.title,
        displayTime: new Date(date).toLocaleDateString()
      };
    })
  ].sort((a, b) => b.date - a.date).slice(0, 8);

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-serif text-forge-navy mb-8">Performance Analytics</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-green-50 text-green-600 rounded-full"><DollarSign size={20} /></div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Portfolio Value</span>
            </div>
            <h3 className="text-2xl font-bold text-forge-navy truncate">₦{(totalValue / 1000000000).toFixed(2)}B</h3>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp size={12} /> Live Valuation</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Home size={20} /></div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Listings</span>
            </div>
            <h3 className="text-2xl font-bold text-forge-navy">{activeListings}</h3>
            <p className="text-xs text-slate-400 mt-1">{soldListings} properties sold Total</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><Users size={20} /></div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Leads</span>
            </div>
            <h3 className="text-2xl font-bold text-forge-navy">{totalLeads}</h3>
            <p className="text-xs text-orange-600 mt-1">{newLeads} new (pending)</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
             <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><TrendingUp size={20} /></div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Conversion Rate</span>
            </div>
            <h3 className="text-2xl font-bold text-forge-navy">
              {conversionRate.toFixed(1)}%
            </h3>
            <p className="text-xs text-slate-400 mt-1">{closedLeads} leads closed</p>
          </div>
        </div>

        {/* Charts / Data Viz */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg text-forge-navy">Inventory by Location</h3>
                <MapPin size={18} className="text-slate-400" />
             </div>
             
             {sortedLocations.length > 0 ? (
               <div className="space-y-4">
                 {sortedLocations.map((item, i) => (
                   <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-slate-600">{item.loc}</span>
                        <span className="text-slate-400">{item.percent}% ({item.count})</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${colors[i % colors.length]}`} style={{ width: `${item.percent}%` }}></div>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center text-slate-400 py-12">No inventory data available.</div>
             )}
           </div>

           <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-serif text-lg text-forge-navy">Recent Activity Log</h3>
               <Activity size={18} className="text-slate-400" />
             </div>
             
             {activityLog.length > 0 ? (
               <div className="space-y-6">
                  {activityLog.map((log, i) => (
                    <div key={i} className="flex gap-4 items-start border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${log.type === 'lead' ? 'bg-orange-400' : 'bg-forge-gold'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-forge-navy">{log.action}</p>
                        <p className="text-xs text-slate-500">
                          {log.target} • <span className="text-slate-400">{log.displayTime}</span>
                        </p>
                      </div>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="text-center text-slate-400 py-12">No recent activity.</div>
             )}
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};
