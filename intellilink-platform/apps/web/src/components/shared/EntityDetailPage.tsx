'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { StatusBadge } from './StatusBadge';
import { ArrowLeft, RefreshCw, Activity, Shield, Cpu, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function EntityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Derive resource from path
  const path = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'resource';

  const { data, isLoading, refetch } = useQuery({
    queryKey: [path, id],
    queryFn: async () => {
      const res = await apiClient.get(`/${path}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {data?.name || data?.hostname || data?.title || id}
              </h1>
              {data?.status && <StatusBadge status={data.status} />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">ID: {id}</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">Retrieving operational parameters from control plane...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entity Configuration & Attributes</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {Object.entries(data || {})
                .filter(([k]) => typeof data[k] !== 'object')
                .map(([k, v]) => (
                  <div key={k} className="p-3 bg-slate-50 dark:bg-[#0D121D] rounded-lg border border-slate-200 dark:border-[#222E45]">
                    <span className="block text-[10px] uppercase font-semibold text-slate-500">{k}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-200 mt-1 block truncate">{String(v)}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Telemetry & Operations</h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-[#0D121D] rounded-lg border border-slate-200 dark:border-[#222E45] text-xs">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">State Machine</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">SYNCHRONIZED</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#0D121D] rounded-lg border border-slate-200 dark:border-[#222E45] text-xs">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Adapter Health</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
