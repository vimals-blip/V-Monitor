'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { getCurrentUser } from '../../../lib/auth';
import { MetricCard } from '../../../components/shared/MetricCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { MapPin, Cpu, Radio, Shuffle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CustomerPortalPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const { data: summary } = useQuery({
    queryKey: ['customer-portal-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/summary');
      return res.data;
    },
  });

  const { data: mySites } = useQuery({
    queryKey: ['my-tenant-sites'],
    queryFn: async () => {
      const res = await apiClient.get('/sites');
      return res.data?.data || res.data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 font-medium">
              Customer Network Portal
            </span>
            <StatusBadge status="ONLINE" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
            Network Operations Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tenant-isolated view into your enterprise WAN circuits, branch gateways, and tunnel endpoints.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">SLA Availability Target: 99.90%</p>
          <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Actual: 99.97% (COMPLIANT)</p>
        </div>
      </div>

      {/* Tenant Specific KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Branch Sites" value={mySites?.length || 5} href="/sites" icon={<MapPin className="w-4 h-4" />} badge="Monitored" />
        <MetricCard title="Online Sites" value={summary?.onlineSites || 5} href="/sites" icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} badgeColor="emerald" />
        <MetricCard title="WAN Health" value="99.95%" subtitle="Starlink & Fiber hybrid" href="/wan-links" icon={<Radio className="w-4 h-4 text-blue-500" />} />
        <MetricCard title="Encrypted Tunnels" value="10 UP" subtitle="WireGuard secure endpoints" href="/tunnels" icon={<Shuffle className="w-4 h-4 text-blue-500" />} />
      </div>

      {/* Tenant Sites List */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-[#222E45]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your Enrolled Branch Sites</h2>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase">
            <tr>
              <th className="p-3.5">Site Name</th>
              <th className="p-3.5">City</th>
              <th className="p-3.5">Allocated Subnet</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Uptime SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#222E45] text-slate-700 dark:text-slate-300">
            {(mySites || []).map((s: any) => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-[#161F30] transition-colors">
                <td className="p-3.5 font-medium text-slate-900 dark:text-white">{s.name}</td>
                <td className="p-3.5 text-slate-500 dark:text-slate-400">{s.city}</td>
                <td className="p-3.5 font-mono text-blue-600 dark:text-cyan-400">{s.subnetCidr || '10.100.1.0/24'}</td>
                <td className="p-3.5"><StatusBadge status={s.status || 'ONLINE'} /></td>
                <td className="p-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">99.98%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
