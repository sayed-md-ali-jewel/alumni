'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Droplet,
  Search,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Flame,
  Calendar,
  Building2,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { useSweetAlert } from '@/components/ui/SweetAlert';
import { BLOOD_GROUPS, BLOOD_REQUEST_URGENCIES, BLOOD_REQUEST_STATUSES } from '@/lib/types';

export default function AdminBloodRequestsPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const { showToast } = useSweetAlert();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('all');
  const [urgency, setUrgency] = useState('all');
  const [status, setStatus] = useState('all');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (bloodGroup && bloodGroup !== 'all') params.set('bloodGroup', bloodGroup);
      if (urgency && urgency !== 'all') params.set('urgency', urgency);
      if (status && status !== 'all') params.set('status', status);

      const res = await fetch(`/api/admin/blood-requests?${params.toString()}`);
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching admin blood requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [bloodGroup, urgency, status]);

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/blood-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update request');

      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: newStatus } : r))
      );
      showToast({
        title: isBn ? 'সফল হয়েছে' : 'Success',
        text: isBn ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Request status updated',
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: isBn ? 'ত্রুটি' : 'Error',
        text: err.message,
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600">
            <AlertOctagon className="w-4 h-4" />
            <span>{isBn ? 'জরুরী আবেদন পরিচালনা' : 'Emergency Requests'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isBn ? 'রক্তের চাহিদা ও আবেদন ব্যবস্থাপনা' : 'Blood Requests Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isBn
              ? 'স্কুল পরিবারের সকল রক্তের চাহিদার স্ট্যাটাস পরিচালনা, পর্যবেক্ষণ ও সম্পাদন নিশ্চিত করুন।'
              : 'Review and moderate community blood requests, track fulfillment status, and resolve emergencies.'}
          </p>
        </div>

        <Button
          onClick={fetchRequests}
          variant="outline"
          size="sm"
          className="rounded-xl flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            <option value="all">{isBn ? 'সকল রক্তের গ্রুপ' : 'All Blood Groups'}</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>

          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="all">{isBn ? 'সকল জরুরী অবস্থা' : 'All Urgencies'}</option>
            {BLOOD_REQUEST_URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
            {BLOOD_REQUEST_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">{isBn ? 'রোগী ও রক্ত' : 'Patient & Blood'}</th>
                <th className="px-4 py-4">{isBn ? 'জরুরী অবস্থা' : 'Urgency'}</th>
                <th className="px-4 py-4">{isBn ? 'হাসপাতাল ও স্থান' : 'Hospital & Location'}</th>
                <th className="px-4 py-4">{isBn ? 'তারিখ' : 'Required Date'}</th>
                <th className="px-4 py-4">{isBn ? 'যোগাযোগ' : 'Contact'}</th>
                <th className="px-4 py-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="px-6 py-4 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>{isBn ? 'লোড হচ্ছে...' : 'Loading requests...'}</span>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    {isBn ? 'কোনো রক্তের আবেদন পাওয়া যায়নি' : 'No requests found'}
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                          {req.bloodGroup}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {req.patientName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {req.requiredUnits} unit(s)
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.urgency === 'Emergency'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                            : req.urgency === 'Urgent'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold block">{req.hospitalName}</span>
                      <span className="text-[11px] text-slate-400">{req.hospitalLocation}</span>
                    </td>

                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(req.requiredDate).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      <span className="block font-medium">{req.contactName}</span>
                      <span className="text-[11px] text-slate-400">{req.contactPhone}</span>
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateStatus(req._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        {BLOOD_REQUEST_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link href={`/blood-requests/${req._id}`}>
                        <Button variant="outline" size="sm" className="text-[11px] rounded-xl">
                          {isBn ? 'বিস্তারিত' : 'View'}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
