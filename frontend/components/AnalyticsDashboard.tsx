'use client';

import { useState } from 'react';
import { DashboardMetrics } from '@/lib/analyticsData';
import { generatePDFReport, downloadPDF } from '@/lib/pdfGenerator';

interface AnalyticsDashboardProps {
  metrics: DashboardMetrics;
  societyName: string;
}

export default function AnalyticsDashboard({ metrics, societyName }: AnalyticsDashboardProps) {
  const [exporting, setExporting] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'complaints' | 'payments' | 'maintenance'>('all');

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const blob = await generatePDFReport(metrics, societyName);
      const fileName = `Society-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(blob, fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    } finally {
      setExporting(false);
    }
  };

  const complaintResolutionRate =
    metrics.complaints.totalComplaints > 0
      ? Math.round((metrics.complaints.resolvedComplaints / metrics.complaints.totalComplaints) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {exporting ? 'Generating...' : 'Download PDF Report'}
        </button>
      </div>

      {/* Metric Filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: '📊 All Metrics' },
          { value: 'complaints', label: '📋 Complaints' },
          { value: 'payments', label: '💳 Payments' },
          { value: 'maintenance', label: '🏢 Maintenance' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setSelectedMetric(tab.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedMetric === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* All Metrics or Complaints */}
      {(selectedMetric === 'all' || selectedMetric === 'complaints') && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📋 Complaint Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Complaints</p>
                  <p className="text-4xl font-bold text-blue-900 mt-2">
                    {metrics.complaints.totalComplaints}
                  </p>
                </div>
                <span className="text-5xl opacity-20">📋</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Resolved</p>
                  <p className="text-4xl font-bold text-green-900 mt-2">
                    {complaintResolutionRate}%
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {metrics.complaints.resolvedComplaints} resolved
                  </p>
                </div>
                <span className="text-5xl opacity-20">✓</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Open Complaints</p>
                  <p className="text-4xl font-bold text-red-900 mt-2">
                    {metrics.complaints.openComplaints}
                  </p>
                </div>
                <span className="text-5xl opacity-20">🔴</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Avg Resolution</p>
                  <p className="text-4xl font-bold text-purple-900 mt-2">
                    {metrics.complaints.averageResolutionTime}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">days</p>
                </div>
                <span className="text-5xl opacity-20">⏱️</span>
              </div>
            </div>
          </div>

          {/* Complaints by Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Complaints by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.complaints.complaintsByCategory.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm capitalize">{item.category}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{item.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Complaints by Priority */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Complaints by Priority</h3>
            <div className="space-y-3">
              {metrics.complaints.complaintsByPriority.map((item, idx) => {
                const colors: Record<string, string> = {
                  low: 'bg-blue-100 text-blue-800',
                  medium: 'bg-yellow-100 text-yellow-800',
                  high: 'bg-orange-100 text-orange-800',
                  urgent: 'bg-red-100 text-red-800',
                };
                const color = colors[item.priority] || colors.low;
                const percentage = Math.round(
                  (item.count / metrics.complaints.totalComplaints) * 100
                );

                return (
                  <div key={idx} className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color} capitalize min-w-20`}>
                      {item.priority}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`h-full ${color.split(' ')[0]} flex items-center justify-center text-xs font-bold`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {percentage > 5 && `${percentage}%`}
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 w-12 text-right">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Payment Analytics */}
      {(selectedMetric === 'all' || selectedMetric === 'payments') && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            💳 Payment & Revenue Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
              <p className="text-green-600 text-sm font-medium">Total Revenue</p>
              <p className="text-4xl font-bold text-green-900 mt-2">
                ₹{metrics.payments.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-green-700 mt-1">All verified payments</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6">
              <p className="text-yellow-600 text-sm font-medium">Pending Amount</p>
              <p className="text-4xl font-bold text-yellow-900 mt-2">
                ₹{metrics.payments.pendingAmount.toLocaleString()}
              </p>
              <p className="text-xs text-yellow-700 mt-1">Awaiting verification</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
              <p className="text-blue-600 text-sm font-medium">Collection Rate</p>
              <p className="text-4xl font-bold text-blue-900 mt-2">
                {metrics.payments.collectionRate}%
              </p>
              <p className="text-xs text-blue-700 mt-1">Of verified payments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Verified Payments</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {metrics.payments.verifiedPayments}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Failed Payments</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {metrics.payments.failedPayments}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Average Payment</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ₹{metrics.payments.averagePaymentAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Analytics */}
      {(selectedMetric === 'all' || selectedMetric === 'maintenance') && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🏢 Maintenance Fund Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
              <p className="text-purple-600 text-sm font-medium">Total Collected</p>
              <p className="text-4xl font-bold text-purple-900 mt-2">
                ₹{metrics.maintenance.totalCollected.toLocaleString()}
              </p>
              <div className="mt-4">
                <div className="bg-purple-200 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="bg-purple-600 h-full"
                    style={{ width: `${metrics.maintenance.collectionPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  {metrics.maintenance.collectionPercentage}% of target
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6">
              <p className="text-orange-600 text-sm font-medium">Pending Collection</p>
              <p className="text-4xl font-bold text-orange-900 mt-2">
                ₹{metrics.maintenance.pendingCollection.toLocaleString()}
              </p>
              <p className="text-xs text-orange-700 mt-2">
                From {metrics.maintenance.defaulters} defaulters
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Monthly Fee</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹{metrics.maintenance.monthlyMaintenanceFee.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Collection %</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {metrics.maintenance.collectionPercentage}%
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Defaulters</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {metrics.maintenance.defaulters}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Residents Analytics */}
      {selectedMetric === 'all' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            👥 Resident Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow p-6">
              <p className="text-indigo-600 text-sm font-medium">Total Residents</p>
              <p className="text-4xl font-bold text-indigo-900 mt-2">
                {metrics.residents.totalResidents}
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow p-6">
              <p className="text-teal-600 text-sm font-medium">Active Residents</p>
              <p className="text-4xl font-bold text-teal-900 mt-2">
                {metrics.residents.activeResidents}
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg shadow p-6">
              <p className="text-pink-600 text-sm font-medium">New This Month</p>
              <p className="text-4xl font-bold text-pink-900 mt-2">
                {metrics.residents.newThisMonth}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
