
import React from 'react';
import { DollarSign, Home, Users, TrendingUp, Activity, MapPin, BarChart } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';
import { ListingStatus } from '../types';

export const AdminAnalytics: React.FC = () => {
  const { properties, leads } = useProperties();

  // Financial Metrics
  // Total Sales Volume / Portfolio Value: Only the price of properties marked as 'Sold'
  // This satisfies the requirement that the value should be 0 if no sales have been made.
  const salesVolume = properties
    .filter(p => p.status === ListingStatus.SOLD)
    .reduce((sum, p) => sum + (p.price || 0), 0);

  const activeListings = properties.filter(p => p.status === ListingStatus.FOR_SALE || p.status === ListingStatus.FOR_RENT || p.status === ListingStatus.SHORT_LET).length;
  
  // Leads statistics
  const totalLeadsCount = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const closedLeads = leads.filter(l => l.status === 'Closed').length;
  const conversionRate = totalLeadsCount > 0 ? (closedLeads / totalLeadsCount) * 100 : 0;

  const locationStats = properties.reduce((acc: Record<string, number>, curr) => {
    const city = (curr.location || 'Unknown').split(',')[0].trim();
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

  const activityLog = [
    ...leads.map(l => ({
      type: 'lead',
      date: new Date(l.date).getTime(),
      action: `New ${l.type.toLowerCase()}`,
      target: l.name,
      displayTime: l.date
    })),
    ...properties.map(p => {
      let date = Date.now();
      if (p.id.length > 10 && !isNaN(Number(p.id))) {
        date = Number(p.id);
      } 
      return {
        type: 'property',
        date,
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Portfolio Value Card - Fixed to only show Sold value */}
          <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Portfolio Value (Sold)</p>
            <h3 className="text-2xl font-bold text-forge-navy truncate">₦{(salesVolume / 1000000000).toFixed(2)}B</h3>
            <p className="text-xs text-slate-400 mt-2">Realized Revenue</p>
          </div>

          <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Active Inventory</p>
            <h3 className="text-2xl font-bold text-forge-navy">{activeListings}</h3>
            <p className="text-xs text-slate-400 mt-2">Units for Sale/Rent</p>
          </div>

          <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Leads</p>
            <h3 className="text-2xl font-bold text-forge-navy">{totalLeadsCount}</h3>
            <p className="text-xs text-slate-400 mt-2">{newLeads} New Inquiries</p>
          </div>

          <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Conversion Rate</p>
            <h3 className="text-2xl font-bold text-forge-navy">{conversionRate.toFixed(1)}%</h3>
            <p className="text-xs text-slate-400 mt-2">{closedLeads} Deals Closed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-lg text-forge-navy">Listings by Location</h3>
                <MapPin size={18} className="text-slate-400" />
             </div>
             
             {sortedLocations.length > 0 ? (
               <div className="space-y-4">
                 {sortedLocations.map((item, i) => (
                   <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-slate-600">{item.loc}</span>
                        <span className="text-slate-400">{item.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${colors[i % colors.length]}`} style={{ width: `${item.percent}%` }}></div>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center text-slate-400 py-12">No data available.</div>
             )}
           </div>

           <div className="bg-white p-8 rounded shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-serif text-lg text-forge-navy">Recent Activity</h3>
               <Activity size={18} className="text-slate-400" />
             </div>
             
             {activityLog.length > 0 ? (
               <div className="space-y-6">
                  {activityLog.map((log, i) => (
                    <div key={i} className="flex gap-4 items-start border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-forge-gold"></div>
                      <div>
                        <p className="text-sm font-bold text-forge-navy">{log.action}</p>
                        <p className="text-xs text-slate-500">
                          {log.target} • {log.displayTime}
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
